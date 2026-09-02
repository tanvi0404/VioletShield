import json
import time
import requests
from concurrent.futures import ThreadPoolExecutor


_siem_executor = ThreadPoolExecutor(max_workers=5, thread_name_prefix="siem_worker")


def send_to_splunk_hec(endpoint_url, token, index, event_data):
    """
    Sends structured security telemetry to Splunk via HTTP Event Collector (HEC).
    Endpoint format typically: https://<splunk-server>:8088/services/collector/event
    """
    headers = {
        "Authorization": f"Splunk {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "time": int(time.time()),
        "host": "violetshield-soc",
        "source": "violetshield:automated_pentest",
        "sourcetype": "_json",
        "index": index or "main",
        "event": event_data
    }

    try:
        response = requests.post(endpoint_url, json=payload, headers=headers, timeout=8, verify=False)
        return {
            "success": response.status_code in [200, 201],
            "status_code": response.status_code,
            "response": response.text[:200]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def send_to_elasticsearch(endpoint_url, index, auth_token, document):
    """
    Sends JSON document to ElasticSearch or Logstash endpoint.
    Endpoint typically: https://<elastic-host>:9200/<index>/_doc
    """
    url = endpoint_url
    idx = index or "violetshield-security"
    if not url.endswith("/_doc"):
        url = f"{url.rstrip('/')}/{idx}/_doc"

    headers = {"Content-Type": "application/json"}
    if auth_token:
        if auth_token.startswith("ApiKey ") or auth_token.startswith("Bearer "):
            headers["Authorization"] = auth_token
        else:
            headers["Authorization"] = f"ApiKey {auth_token}"

    try:
        response = requests.post(url, json=document, headers=headers, timeout=8, verify=False)
        return {
            "success": response.status_code in [200, 201],
            "status_code": response.status_code,
            "response": response.text[:200]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def send_to_generic_siem(endpoint_url, api_key, payload):
    """
    Dispatches CEF / JSON payload to generic SIEM webhook or syslog proxy.
    """
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["X-API-Key"] = api_key

    try:
        response = requests.post(endpoint_url, json=payload, headers=headers, timeout=8, verify=False)
        return {
            "success": response.status_code in [200, 201, 202, 204],
            "status_code": response.status_code,
            "response": response.text[:200]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def dispatch_siem_telemetry_async(scan_data, integrations):
    """
    Asynchronously streams scan findings to all active SIEM connectors in a non-blocking thread pool.
    """
    def _worker(integration, data):
        itype = (integration.get("type") or "").upper()
        url = integration.get("endpoint_url")
        token = integration.get("api_token_or_key")
        idx = integration.get("project_or_index")

        if not url:
            return

        if "SPLUNK" in itype:
            send_to_splunk_hec(url, token, idx, data)
        elif "ELASTIC" in itype or "ELK" in itype:
            send_to_elasticsearch(url, idx, token, data)
        else:
            send_to_generic_siem(url, token, data)

    for integ in integrations:
        if integ.get("is_active", True) and integ.get("auto_forward", True):
            _siem_executor.submit(_worker, integ, scan_data)
