import os
import re
import time
import base64
import socket
import requests
from urllib.parse import urlparse
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed

load_dotenv()

ABUSEIPDB_KEY = os.getenv("ABUSEIPDB_KEY")
VT_API_KEY = os.getenv("VT_API_KEY")

# In-Memory TTL Cache (1 hour = 3600 seconds)
THREAT_CACHE = {}
CACHE_TTL = 3600

# Top Tier DNS Blacklist (DNSBL) Providers
DNSBL_PROVIDERS = [
    {
        "name": "Spamhaus ZEN",
        "host": "zen.spamhaus.org",
        "description": "Aggregated Spamhaus blacklist (SBL, XBL, PBL) tracking spam, exploits, and botnets."
    },
    {
        "name": "Barracuda Reputation",
        "host": "b.barracudacentral.org",
        "description": "Barracuda Networks dynamic IP reputation list."
    },
    {
        "name": "SpamCop DNSBL",
        "host": "bl.spamcop.net",
        "description": "SpamCop real-time spam reporter blacklist."
    },
    {
        "name": "SORBS Combined",
        "host": "dnsbl.sorbs.net",
        "description": "Spam and Open Relay Blocking System database."
    },
    {
        "name": "Backscatterer",
        "host": "ips.backscatterer.org",
        "description": "Monitors misconfigured MTAs sending backscatter spam and automated probes."
    }
]


def _get_from_cache(key):
    if key in THREAT_CACHE:
        data, timestamp = THREAT_CACHE[key]
        if time.time() - timestamp < CACHE_TTL:
            return data
    return None


def _save_to_cache(key, data):
    THREAT_CACHE[key] = (data, time.time())


def is_valid_ip(address):
    """Verifies if the string is a valid IPv4 address."""
    pattern = r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
    return bool(re.match(pattern, str(address).strip()))


def check_single_dnsbl(reversed_ip, provider, timeout=2.5):
    """Queries a single DNSBL provider for an IP address."""
    query_host = f"{reversed_ip}.{provider['host']}"
    try:
        # Set socket timeout for DNS query
        orig_timeout = socket.getdefaulttimeout()
        socket.setdefaulttimeout(timeout)
        answers = socket.gethostbyname(query_host)
        socket.setdefaulttimeout(orig_timeout)
        
        # If response returned (typically 127.0.0.x), the IP is listed
        return {
            "name": provider["name"],
            "host": provider["host"],
            "listed": True,
            "status": "LISTED (Blacklisted)",
            "response": answers,
            "description": provider["description"]
        }
    except (socket.gaierror, socket.timeout, Exception):
        return {
            "name": provider["name"],
            "host": provider["host"],
            "listed": False,
            "status": "CLEAN (Not Listed)",
            "response": None,
            "description": provider["description"]
        }


def check_dns_blacklists(ip, timeout=2.5):
    """
    Checks an IPv4 address concurrently across prominent DNS Blacklists.
    """
    if not is_valid_ip(ip):
        return {
            "ip": ip,
            "total_checked": 0,
            "total_listed": 0,
            "results": [],
            "error": "Invalid IPv4 address"
        }

    cache_key = f"dnsbl_{ip}"
    cached = _get_from_cache(cache_key)
    if cached:
        return cached

    # Reverse IP octets (e.g., 1.2.3.4 -> 4.3.2.1)
    octets = ip.strip().split(".")
    reversed_ip = ".".join(reversed(octets))

    results = []
    with ThreadPoolExecutor(max_workers=len(DNSBL_PROVIDERS)) as executor:
        futures = [
            executor.submit(check_single_dnsbl, reversed_ip, provider, timeout)
            for provider in DNSBL_PROVIDERS
        ]
        for f in as_completed(futures):
            try:
                results.append(f.result())
            except Exception:
                pass

    total_listed = sum(1 for r in results if r.get("listed", False))

    output = {
        "ip": ip,
        "total_checked": len(results),
        "total_listed": total_listed,
        "is_blacklisted": total_listed > 0,
        "results": results
    }

    _save_to_cache(cache_key, output)
    return output


def calculate_threat_score(vt_stats, dnsbl_listed=0):
    """
    Calculates unified threat score (0-100) and risk level.
    """
    malicious = vt_stats.get("malicious", 0)
    suspicious = vt_stats.get("suspicious", 0)

    score = (malicious * 10) + (suspicious * 5) + (dnsbl_listed * 15)
    score = min(max(score, 0), 100)

    if score >= 60 or malicious >= 5 or dnsbl_listed >= 2:
        risk = "Critical" if (malicious >= 10 or score >= 80) else "High"
    elif score >= 25 or malicious > 0 or dnsbl_listed > 0:
        risk = "Medium"
    else:
        risk = "Low"

    return {
        "score": score,
        "risk": risk
    }


def check_ip_reputation(ip):
    """
    Performs comprehensive IP reputation analysis via VirusTotal and DNSBLs.
    """
    clean_ip = str(ip).strip()
    cache_key = f"ip_reputation_{clean_ip}"
    cached = _get_from_cache(cache_key)
    if cached:
        return cached

    result = {
        "target": clean_ip,
        "type": "IP",
        "virustotal": {},
        "dnsbl": {},
        "risk_analysis": {"score": 0, "risk": "Low"}
    }

    # 1. DNSBL Blacklist Check
    dnsbl_data = check_dns_blacklists(clean_ip)
    result["dnsbl"] = dnsbl_data
    dnsbl_listed = dnsbl_data.get("total_listed", 0)

    # 2. VirusTotal IP Reputation Check
    if VT_API_KEY:
        try:
            url = f"https://www.virustotal.com/api/v3/ip_addresses/{clean_ip}"
            headers = {"x-apikey": VT_API_KEY}
            response = requests.get(url, headers=headers, timeout=10)

            if response.status_code == 200:
                vt_data = response.json().get("data", {})
                attributes = vt_data.get("attributes", {})
                stats = attributes.get("last_analysis_stats", {})

                engine_detections = []
                results = attributes.get("last_analysis_results", {})
                for eng, info in results.items():
                    if info.get("category") in ["malicious", "suspicious"]:
                        engine_detections.append({
                            "engine": eng,
                            "category": info.get("category"),
                            "result": info.get("result", "Malicious")
                        })

                result["virustotal"] = {
                    "reputation": attributes.get("reputation", 0),
                    "country": attributes.get("country", "Unknown"),
                    "asn": attributes.get("asn", "Unknown"),
                    "as_owner": attributes.get("as_owner", "Unknown"),
                    "network": attributes.get("network", "Unknown"),
                    "last_analysis_stats": stats,
                    "malicious_engines": engine_detections,
                    "tags": attributes.get("tags", [])
                }

                result["risk_analysis"] = calculate_threat_score(stats, dnsbl_listed)
            elif response.status_code == 404:
                result["virustotal"] = {
                    "status": "NOT_FOUND",
                    "reputation": 0,
                    "country": "Unknown",
                    "last_analysis_stats": {"malicious": 0, "suspicious": 0, "harmless": 0, "undetected": 0}
                }
                result["risk_analysis"] = calculate_threat_score({}, dnsbl_listed)
            else:
                result["virustotal_error"] = f"VirusTotal HTTP {response.status_code}"
                result["risk_analysis"] = calculate_threat_score({}, dnsbl_listed)

        except Exception as e:
            result["virustotal_error"] = str(e)
            result["risk_analysis"] = calculate_threat_score({}, dnsbl_listed)
    else:
        result["virustotal"] = {"status": "API key missing"}
        result["risk_analysis"] = calculate_threat_score({}, dnsbl_listed)

    _save_to_cache(cache_key, result)
    return result


def check_domain_reputation(domain):
    """
    Performs deep domain reputation analysis, category categorization, and registrar audit.
    """
    clean_domain = str(domain).strip().lower()
    clean_domain = clean_domain.replace("https://", "").replace("http://", "").split("/")[0].split(":")[0]

    cache_key = f"domain_reputation_{clean_domain}"
    cached = _get_from_cache(cache_key)
    if cached:
        return cached

    result = {
        "target": clean_domain,
        "type": "DOMAIN",
        "virustotal": {},
        "categories": [],
        "risk_analysis": {"score": 0, "risk": "Low"}
    }

    if not VT_API_KEY:
        result["virustotal"] = {"status": "API key missing"}
        return result

    try:
        url = f"https://www.virustotal.com/api/v3/domains/{clean_domain}"
        headers = {"x-apikey": VT_API_KEY}
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json().get("data", {})
            attributes = data.get("attributes", {})
            stats = attributes.get("last_analysis_stats", {})

            # Extract detected engines
            engine_detections = []
            results = attributes.get("last_analysis_results", {})
            for eng, info in results.items():
                if info.get("category") in ["malicious", "suspicious"]:
                    engine_detections.append({
                        "engine": eng,
                        "category": info.get("category"),
                        "result": info.get("result", "Malicious")
                    })

            # Extract domain categories (from Forcepoint, Sophos, BitDefender, etc.)
            categories = []
            cat_dict = attributes.get("categories", {})
            for vendor, cat_name in cat_dict.items():
                if cat_name not in categories:
                    categories.append(cat_name)

            creation_date = attributes.get("creation_date")
            formatted_created = time.strftime('%Y-%m-%d', time.gmtime(creation_date)) if creation_date else "Unknown"

            result["virustotal"] = {
                "reputation": attributes.get("reputation", 0),
                "registrar": attributes.get("registrar", "Unknown"),
                "creation_date": formatted_created,
                "categories": categories,
                "tags": attributes.get("tags", []),
                "last_analysis_stats": stats,
                "malicious_engines": engine_detections,
                "popularity_ranks": attributes.get("popularity_ranks", {})
            }
            result["categories"] = categories
            result["risk_analysis"] = calculate_threat_score(stats)

        elif response.status_code == 404:
            result["virustotal"] = {
                "status": "NOT_FOUND",
                "message": "Domain has not been analyzed by VirusTotal.",
                "last_analysis_stats": {"malicious": 0, "suspicious": 0, "harmless": 0, "undetected": 0}
            }
            result["risk_analysis"] = calculate_threat_score({})
        else:
            result["virustotal_error"] = f"VirusTotal HTTP {response.status_code}"
            result["risk_analysis"] = calculate_threat_score({})

    except Exception as e:
        result["virustotal_error"] = str(e)
        result["risk_analysis"] = calculate_threat_score({})

    _save_to_cache(cache_key, result)
    return result


def check_url_reputation(target_url):
    """
    Performs live URL threat scanning (phishing, malware, malicious redirects).
    """
    raw_url = str(target_url).strip()
    if not raw_url.startswith("http://") and not raw_url.startswith("https://"):
        raw_url = f"https://{raw_url}"

    # VirusTotal v3 URL identifier is base64-encoded URL without padding
    url_id = base64.urlsafe_b64encode(raw_url.encode()).decode().strip("=")
    cache_key = f"url_reputation_{url_id}"
    cached = _get_from_cache(cache_key)
    if cached:
        return cached

    result = {
        "target": raw_url,
        "type": "URL",
        "virustotal": {},
        "risk_analysis": {"score": 0, "risk": "Low"}
    }

    if not VT_API_KEY:
        result["virustotal"] = {"status": "API key missing"}
        return result

    try:
        vt_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
        headers = {"x-apikey": VT_API_KEY}
        response = requests.get(vt_url, headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json().get("data", {})
            attributes = data.get("attributes", {})
            stats = attributes.get("last_analysis_stats", {})

            engine_detections = []
            results = attributes.get("last_analysis_results", {})
            for eng, info in results.items():
                if info.get("category") in ["malicious", "suspicious"]:
                    engine_detections.append({
                        "engine": eng,
                        "category": info.get("category"),
                        "result": info.get("result", "Malicious")
                    })

            result["virustotal"] = {
                "url": attributes.get("url", raw_url),
                "reputation": attributes.get("reputation", 0),
                "title": attributes.get("title", ""),
                "last_http_response_code": attributes.get("last_http_response_code", 200),
                "tags": attributes.get("tags", []),
                "categories": list(attributes.get("categories", {}).values()),
                "last_analysis_stats": stats,
                "malicious_engines": engine_detections
            }
            result["risk_analysis"] = calculate_threat_score(stats)

        elif response.status_code == 404:
            # If URL not yet indexed, analyze or return clean baseline
            result["virustotal"] = {
                "status": "NOT_FOUND",
                "message": "URL not indexed in VirusTotal database.",
                "last_analysis_stats": {"malicious": 0, "suspicious": 0, "harmless": 0, "undetected": 0}
            }
            result["risk_analysis"] = calculate_threat_score({})
        else:
            result["virustotal_error"] = f"VirusTotal HTTP {response.status_code}"
            result["risk_analysis"] = calculate_threat_score({})

    except Exception as e:
        result["virustotal_error"] = str(e)
        result["risk_analysis"] = calculate_threat_score({})

    _save_to_cache(cache_key, result)
    return result


def run_comprehensive_threat_intel(target):
    """
    Multi-vector threat intelligence coordinator.
    Automatically identifies target type (IP, Domain, URL) and returns structured analysis.
    """
    if not target or not str(target).strip():
        return {"error": "Target parameter is required."}

    raw = str(target).strip()

    if is_valid_ip(raw):
        return check_ip_reputation(raw)
    elif raw.startswith("http://") or raw.startswith("https://") or "/" in raw:
        return check_url_reputation(raw)
    else:
        return check_domain_reputation(raw)