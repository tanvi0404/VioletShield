import json
import time
import requests
from requests.auth import HTTPBasicAuth


def create_jira_issue(endpoint_url, auth_username, api_token, project_key, finding):
    """
    Creates an issue/ticket in Atlassian Jira Cloud or Server.
    API endpoint: https://your-domain.atlassian.net/rest/api/2/issue
    """
    url = endpoint_url.rstrip("/")
    if not url.endswith("/issue"):
        url = f"{url}/rest/api/2/issue"

    # Map severity to standard Jira priorities
    sev = (finding.get("severity") or "HIGH").upper()
    priority_map = {
        "CRITICAL": "Highest",
        "HIGH": "High",
        "MEDIUM": "Medium",
        "LOW": "Low"
    }
    jira_priority = priority_map.get(sev, "High")

    title = finding.get("title") or finding.get("cve_id") or "Security Vulnerability Finding"
    target = finding.get("target") or finding.get("website") or "Perimeter Asset"
    description_text = f"""*VioletShield Automated SOC Security Finding*
*Target Host:* {target}
*Severity:* {sev}
*CVE ID:* {finding.get('cve_id', 'N/A')}

*Description:*
{finding.get('description', 'Automated penetration scan finding requiring developer mitigation.')}

*Remediation Guidance:*
{finding.get('remediation_steps', 'Apply vendor security patches and verify configuration baselines.')}
"""

    payload = {
        "fields": {
            "project": {"key": project_key or "SEC"},
            "summary": f"[VioletShield {sev}] {title} on {target}",
            "description": description_text,
            "issuetype": {"name": "Bug"},
            "priority": {"name": jira_priority},
            "labels": ["violetshield", "security-vulnerability", sev.lower()]
        }
    }

    try:
        auth = HTTPBasicAuth(auth_username, api_token) if auth_username and api_token else None
        response = requests.post(url, json=payload, auth=auth, headers={"Content-Type": "application/json"}, timeout=10)
        
        if response.status_code in [200, 201]:
            res_json = response.json()
            key = res_json.get("key", f"{project_key}-101")
            ticket_url = f"{endpoint_url.split('/rest/')[0]}/browse/{key}"
            return {
                "success": True,
                "ticket_key": key,
                "ticket_url": ticket_url,
                "response": res_json
            }
        else:
            return {
                "success": False,
                "error": f"Jira returned HTTP {response.status_code}: {response.text[:250]}"
            }
    except Exception as e:
        return {"success": False, "error": str(e)}


def create_servicenow_incident(instance_url, username, password, finding):
    """
    Creates an incident in ServiceNow via Table API.
    API endpoint: https://devXXXXX.service-now.com/api/now/table/incident
    """
    url = instance_url.rstrip("/")
    if not url.endswith("/incident"):
        url = f"{url}/api/now/table/incident"

    sev = (finding.get("severity") or "HIGH").upper()
    urgency_val = "1" if sev == "CRITICAL" else ("2" if sev == "HIGH" else "3")

    payload = {
        "short_description": f"[VioletShield {sev}] {finding.get('title', 'Security Finding')} ({finding.get('target', 'Asset')})",
        "description": f"Automated Vulnerability Alert from VioletShield SOC.\n\nTarget: {finding.get('target')}\nSeverity: {sev}\nDetails: {finding.get('description')}\nCVE: {finding.get('cve_id', 'N/A')}",
        "urgency": urgency_val,
        "impact": urgency_val,
        "category": "Security"
    }

    try:
        auth = HTTPBasicAuth(username, password) if username and password else None
        response = requests.post(url, json=payload, auth=auth, headers={"Content-Type": "application/json", "Accept": "application/json"}, timeout=10)
        
        if response.status_code in [200, 201]:
            res_json = response.json().get("result", {})
            inc_num = res_json.get("number", "INC0010001")
            sys_id = res_json.get("sys_id", "")
            ticket_url = f"{instance_url.split('/api/')[0]}/nav_to.do?uri=incident.do?sys_id={sys_id}"
            return {
                "success": True,
                "ticket_key": inc_num,
                "ticket_url": ticket_url,
                "response": res_json
            }
        else:
            return {
                "success": False,
                "error": f"ServiceNow returned HTTP {response.status_code}: {response.text[:250]}"
            }
    except Exception as e:
        return {"success": False, "error": str(e)}


def test_connector_connection(connector_data):
    """
    Pings or verifies connectivity to a configured SIEM or Ticketing connector.
    """
    url = connector_data.get("endpoint_url", "").strip()
    if not url:
        return {"success": False, "error": "Endpoint URL is required", "latency_ms": 0}

    start_time = time.time()
    try:
        headers = {"User-Agent": "VioletShield-SIEM-Connector/2.0"}
        token = connector_data.get("api_token_or_key")
        if token:
            headers["Authorization"] = f"Bearer {token}" if not token.startswith("Splunk") else token

        # Safe diagnostic ping
        response = requests.get(url, headers=headers, timeout=5, verify=False)
        latency = int((time.time() - start_time) * 1000)
        return {
            "success": response.status_code < 500,
            "status_code": response.status_code,
            "latency_ms": latency,
            "message": f"Endpoint responded with HTTP {response.status_code} in {latency}ms"
        }
    except Exception as e:
        latency = int((time.time() - start_time) * 1000)
        return {
            "success": False,
            "error": str(e),
            "latency_ms": latency,
            "message": f"Connection failed after {latency}ms: {str(e)}"
        }
