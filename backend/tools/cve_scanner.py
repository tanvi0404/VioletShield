import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

# In-memory query cache with TTL (1 hour)
_CVE_CACHE = {}
_CACHE_TTL = 3600

# NIST NVD 2.0 API Configuration
NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"
NVD_API_KEY = os.getenv("NVD_API_KEY", "")

# Curated High-Impact Local Knowledge Base (Instant Fallback / Offline Security Intelligence)
LOCAL_CVE_DATABASE = {
    "vsftpd 2.3.4": [
        {
            "cve_id": "CVE-2011-2523",
            "cvss_score": 9.8,
            "severity": "CRITICAL",
            "description": "vsftpd 2.3.4 contains a backdoor in the smile emoticon code ':)' opening a root bindshell on port 6200 upon connection.",
            "published_date": "2011-07-03",
            "affected_versions": "vsftpd 2.3.4",
            "references": ["https://nvd.nist.gov/vuln/detail/CVE-2011-2523"]
        }
    ],
    "apache 2.4.49": [
        {
            "cve_id": "CVE-2021-41773",
            "cvss_score": 7.5,
            "severity": "HIGH",
            "description": "Path traversal flaw in Apache HTTP Server 2.4.49 allows mapping URLs to files outside the docroot and potential remote code execution.",
            "published_date": "2021-10-05",
            "affected_versions": "Apache 2.4.49",
            "references": ["https://nvd.nist.gov/vuln/detail/CVE-2021-41773"]
        }
    ],
    "apache 2.4.50": [
        {
            "cve_id": "CVE-2021-42013",
            "cvss_score": 9.8,
            "severity": "CRITICAL",
            "description": "Incomplete fix for CVE-2021-41773 in Apache 2.4.50 allows remote path traversal and RCE via mod_cgi execution.",
            "published_date": "2021-10-08",
            "affected_versions": "Apache 2.4.50",
            "references": ["https://nvd.nist.gov/vuln/detail/CVE-2021-42013"]
        }
    ],
    "apache 2.4.7": [
        {
            "cve_id": "CVE-2014-0226",
            "cvss_score": 6.8,
            "severity": "MEDIUM",
            "description": "Race condition in mod_status in Apache HTTP Server 2.4.7 allows remote attackers to cause a denial of service or execute arbitrary code.",
            "published_date": "2014-07-20",
            "affected_versions": "Apache 2.4.7",
            "references": ["https://nvd.nist.gov/vuln/detail/CVE-2014-0226"]
        },
        {
            "cve_id": "CVE-2014-0118",
            "cvss_score": 7.5,
            "severity": "HIGH",
            "description": "Resource consumption flaw in mod_deflate allows remote attackers to cause DoS via crafted compressed request bodies.",
            "published_date": "2014-07-15",
            "affected_versions": "Apache 2.4.7",
            "references": ["https://nvd.nist.gov/vuln/detail/CVE-2014-0118"]
        }
    ],
    "samba 3.0.20": [
        {
            "cve_id": "CVE-2007-2447",
            "cvss_score": 9.8,
            "severity": "CRITICAL",
            "description": "Remote Command Execution in MS-RPC functionality of Samba 3.0.0 through 3.0.25rc3 via unescaped username parameter.",
            "published_date": "2007-05-14",
            "affected_versions": "Samba 3.0.20 - 3.0.25rc3",
            "references": ["https://nvd.nist.gov/vuln/detail/CVE-2007-2447"]
        }
    ],
    "openssh 7.2p2": [
        {
            "cve_id": "CVE-2016-6210",
            "cvss_score": 5.3,
            "severity": "MEDIUM",
            "description": "OpenSSH through 7.2p2 user enumeration flaw via timing differences during authentication password hashing.",
            "published_date": "2016-08-01",
            "affected_versions": "OpenSSH <= 7.2p2",
            "references": ["https://nvd.nist.gov/vuln/detail/CVE-2016-6210"]
        }
    ],
    "proftpd 1.3.5": [
        {
            "cve_id": "CVE-2015-3306",
            "cvss_score": 9.8,
            "severity": "CRITICAL",
            "description": "mod_copy in ProFTPD 1.3.5 allows remote unauthenticated attackers to read and write arbitrary files via site cpfr and site cpto commands.",
            "published_date": "2015-05-18",
            "affected_versions": "ProFTPD 1.3.5",
            "references": ["https://nvd.nist.gov/vuln/detail/CVE-2015-3306"]
        }
    ]
}


def search_cve(product, version="", max_results=5, timeout=5):
    """
    Query official CVE vulnerability records by software product and version.
    
    Returns:
      dict: {
        "query": str,
        "total_cves": int,
        "cves": list[dict]
      }
    """
    clean_product = (product or "").strip()
    clean_version = (version or "").strip()
    query = f"{clean_product} {clean_version}".strip()
    
    if not query:
        return {"query": "", "total_cves": 0, "cves": []}

    cache_key = query.lower()

    # 1. Check in-memory cache
    if cache_key in _CVE_CACHE:
        entry = _CVE_CACHE[cache_key]
        if time.time() - entry["timestamp"] < _CACHE_TTL:
            return entry["data"]

    # 2. Check local curated signatures first for instant matching
    normalized_key = None
    for local_key in LOCAL_CVE_DATABASE:
        if local_key in cache_key or (clean_product.lower() in local_key and clean_version and clean_version in local_key):
            normalized_key = local_key
            break

    cve_results = []
    if normalized_key:
        cve_results.extend(LOCAL_CVE_DATABASE[normalized_key])

    # 3. Query Official NIST NVD 2.0 API if more results needed or no local match
    if len(cve_results) < max_results:
        nvd_cves = _fetch_from_nvd(query, max_results=max_results, timeout=timeout)
        for n_cve in nvd_cves:
            if not any(existing["cve_id"] == n_cve["cve_id"] for existing in cve_results):
                cve_results.append(n_cve)

    final_cves = cve_results[:max_results]
    response_data = {
        "query": query,
        "total_cves": len(final_cves),
        "cves": final_cves
    }

    # Store in cache
    _CVE_CACHE[cache_key] = {
        "timestamp": time.time(),
        "data": response_data
    }

    return response_data


def lookup_cve_by_id(cve_id, timeout=5):
    """
    Direct lookup of a specific CVE ID (e.g. 'CVE-2021-44228') from NIST NVD.
    """
    cve_id = cve_id.strip().upper()
    if not cve_id.startswith("CVE-"):
        return {"error": "Invalid CVE ID format. Must begin with 'CVE-'"}

    # Check cache
    if cve_id in _CVE_CACHE:
        entry = _CVE_CACHE[cve_id]
        if time.time() - entry["timestamp"] < _CACHE_TTL:
            return entry["data"]

    try:
        url = f"{NVD_API_URL}?cveId={cve_id}"
        headers = {"User-Agent": "VioletShield-Security-Auditor/2.0"}
        if NVD_API_KEY:
            headers["apiKey"] = NVD_API_KEY

        resp = requests.get(url, headers=headers, timeout=timeout)
        if resp.status_code == 200:
            data = resp.json()
            vulns = data.get("vulnerabilities", [])
            if vulns:
                parsed = _parse_nvd_item(vulns[0])
                _CVE_CACHE[cve_id] = {
                    "timestamp": time.time(),
                    "data": parsed
                }
                return parsed

        return {"error": f"CVE '{cve_id}' not found in NVD database."}
    except Exception as e:
        return {"error": f"CVE lookup error: {str(e)}"}


def _fetch_from_nvd(query, max_results=5, timeout=5):
    """
    Internal helper to fetch CVE list from NIST NVD 2.0 API.
    """
    results = []
    try:
        headers = {"User-Agent": "VioletShield-Security-Auditor/2.0"}
        if NVD_API_KEY:
            headers["apiKey"] = NVD_API_KEY

        params = {
            "keywordSearch": query,
            "resultsPerPage": max_results
        }

        resp = requests.get(NVD_API_URL, headers=headers, params=params, timeout=timeout)
        if resp.status_code == 200:
            data = resp.json()
            for item in data.get("vulnerabilities", []):
                results.append(_parse_nvd_item(item, query))
    except Exception:
        # Fall through safely on rate-limit / timeout
        pass

    return results


def _parse_nvd_item(item, query_context=""):
    """
    Parse standard NIST NVD 2.0 vulnerability item into normalized VioletShield structure.
    """
    cve_data = item.get("cve", {})
    cve_id = cve_data.get("id", "Unknown CVE")

    # Extract English description
    descriptions = cve_data.get("descriptions", [])
    desc_text = "No detailed description available."
    for d in descriptions:
        if d.get("lang") == "en":
            desc_text = d.get("value", desc_text)
            break

    # Extract CVSS Metrics (Prioritize v3.1 -> v3.0 -> v2.0)
    metrics = cve_data.get("metrics", {})
    cvss_v31 = metrics.get("cvssMetricV31", [{}])[0].get("cvssData", {})
    cvss_v30 = metrics.get("cvssMetricV30", [{}])[0].get("cvssData", {})
    cvss_v2 = metrics.get("cvssMetricV2", [{}])[0].get("cvssData", {})

    cvss_data = cvss_v31 or cvss_v30 or cvss_v2
    score = cvss_data.get("baseScore", 0.0)
    severity = cvss_data.get("baseSeverity") or metrics.get("cvssMetricV2", [{}])[0].get("baseSeverity", "UNKNOWN")

    # Clean severity string
    severity = str(severity).upper()
    if severity == "UNKNOWN":
        if score >= 9.0:
            severity = "CRITICAL"
        elif score >= 7.0:
            severity = "HIGH"
        elif score >= 4.0:
            severity = "MEDIUM"
        else:
            severity = "LOW"

    # Extract References
    refs = []
    for r in cve_data.get("references", []):
        url = r.get("url")
        if url:
            refs.append(url)

    published = cve_data.get("published", "")[:10]

    return {
        "cve_id": cve_id,
        "cvss_score": score,
        "severity": severity,
        "description": desc_text,
        "published_date": published,
        "affected_versions": query_context or "Identified Software",
        "references": refs[:3]
    }
