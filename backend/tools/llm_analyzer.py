import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")


def analyze_vulnerabilities_ai(scan_data, timeout=8):
    """
    Phase 5: AI Vulnerability Analysis Engine.
    
    Consolidates:
      1. Nmap Scan Results (Open ports, services, products, versions, OS detection)
      2. Threat Intelligence (VirusTotal / AbuseIPDB reputation metrics)
      3. ExploitDB / Searchsploit Matches (Exploits, PoCs, and CVE references)
      4. SSL & Security Headers Analysis (if present)
      
    Returns a structured dictionary:
      - vulnerability_summary (str)
      - severity_level (Critical | High | Medium | Low)
      - key_reasons (list[str])
      - recommended_fixes (list[str])
      - threat_score (int: 0-100)
      - engine_used (str)
    """
    # 1. Extract and aggregate data points
    target = scan_data.get("target") or scan_data.get("domain") or "Target Host"
    nmap_result = scan_data.get("nmap_result", {})
    threat_intel = scan_data.get("threat_intelligence", {})
    ssl_data = scan_data.get("ssl", {})
    headers_data = scan_data.get("headers", {})

    open_services = []
    all_exploits = []
    all_cves = []
    os_info = []
    
    # Process Nmap, ExploitDB & CVE data
    for host_ip, host_details in nmap_result.items():
        if isinstance(host_details, dict):
            for os_match in host_details.get("os_matches", []):
                os_info.append(f"{os_match.get('name', 'Unknown')} ({os_match.get('accuracy', '')}%)")
            
            for s in host_details.get("services", []):
                if s.get("state") == "open":
                    svc_desc = f"Port {s.get('port')}/{s.get('name', 'unknown')} ({s.get('product', '')} {s.get('version', '')})".strip()
                    open_services.append(svc_desc)
                    for exp in s.get("exploits", []):
                        exp_title = exp.get("title") or exp.get("Title") or "Unspecified exploit"
                        exp_path = exp.get("path") or exp.get("Path") or ""
                        all_exploits.append({
                            "port": s.get("port"),
                            "service": s.get("product") or s.get("name"),
                            "title": exp_title,
                            "path": exp_path
                        })
                    for cve in s.get("cves", []):
                        all_cves.append({
                            "port": s.get("port"),
                            "service": s.get("product") or s.get("name"),
                            "cve_id": cve.get("cve_id"),
                            "cvss_score": cve.get("cvss_score"),
                            "severity": cve.get("severity")
                        })

    # Process Threat Intel
    vt_stats = {}
    vt_risk = "Low"
    for host_ip, intel in threat_intel.items():
        if isinstance(intel, dict):
            vt = intel.get("virustotal", {})
            if isinstance(vt, dict) and "last_analysis_stats" in vt:
                vt_stats = vt.get("last_analysis_stats", {})
            risk_meta = intel.get("risk_analysis", {})
            if risk_meta.get("risk"):
                vt_risk = risk_meta.get("risk")

    # 2. Try Ollama LLM Analysis first if available
    llm_analysis = _try_ollama_analysis(
        target=target,
        open_services=open_services,
        all_exploits=all_exploits,
        all_cves=all_cves,
        os_info=os_info,
        vt_stats=vt_stats,
        vt_risk=vt_risk,
        ssl_data=ssl_data,
        headers_data=headers_data,
        timeout=timeout
    )
    
    if llm_analysis:
        return llm_analysis

    # 3. Fallback: Intelligent Deterministic Correlation Engine
    return _deterministic_security_analysis(
        target=target,
        open_services=open_services,
        all_exploits=all_exploits,
        all_cves=all_cves,
        os_info=os_info,
        vt_stats=vt_stats,
        vt_risk=vt_risk,
        ssl_data=ssl_data,
        headers_data=headers_data
    )


def _try_ollama_analysis(target, open_services, all_exploits, all_cves, os_info, vt_stats, vt_risk, ssl_data, headers_data, timeout=8):
    """
    Query local Ollama instance for deep security reasoning and structured remediation.
    """
    try:
        url = f"{OLLAMA_URL.rstrip('/')}/api/generate"
        
        system_context = (
            "You are VioletShield's Lead Cybersecurity & Penetration Testing AI Analyst. "
            "Analyze the given reconnaissance data (Nmap services, official NIST CVE matches, ExploitDB PoCs, VirusTotal IP reputation, SSL/headers) "
            "and output STRICTLY valid JSON with no markdown formatting or commentary. "
            "Output JSON Schema: {"
            "\"vulnerability_summary\": \"string (2-3 sentences overviewing the target attack surface and risks)\", "
            "\"severity_level\": \"Critical\" | \"High\" | \"Medium\" | \"Low\", "
            "\"key_reasons\": [\"string bullet 1\", \"string bullet 2\", ...], "
            "\"recommended_fixes\": [\"string step 1\", \"string step 2\", ...], "
            "\"threat_score\": integer (0-100)"
            "}"
        )

        user_prompt = f"""
TARGET: {target}
OPERATING SYSTEM: {', '.join(os_info) if os_info else 'Unknown'}
OPEN SERVICES ({len(open_services)}): {json.dumps(open_services)}
NIST CVE VULNERABILITIES ({len(all_cves)}): {json.dumps(all_cves)}
EXPLOITDB / SEARCHSPLOIT MATCHES ({len(all_exploits)}): {json.dumps(all_exploits)}
VIRUSTOTAL STATS: {json.dumps(vt_stats)} (Reputation Risk: {vt_risk})
SSL VALID: {ssl_data.get('valid', 'N/A')}
MISSING SECURITY HEADERS: {json.dumps(headers_data.get('missing', []))}
"""

        payload = {
            "model": OLLAMA_MODEL,
            "prompt": f"{system_context}\n\n{user_prompt}",
            "stream": False,
            "format": "json"
        }

        response = requests.post(url, json=payload, timeout=timeout)
        if response.status_code == 200:
            res_json = response.json()
            raw_response = res_json.get("response", "{}")
            parsed = json.loads(raw_response)

            # Ensure all required fields exist
            if "vulnerability_summary" in parsed and "severity_level" in parsed:
                return {
                    "vulnerability_summary": parsed.get("vulnerability_summary", ""),
                    "severity_level": parsed.get("severity_level", "Medium"),
                    "key_reasons": parsed.get("key_reasons", []),
                    "recommended_fixes": parsed.get("recommended_fixes", []),
                    "threat_score": parsed.get("threat_score", 50),
                    "engine_used": f"Ollama LLM ({OLLAMA_MODEL})",
                    "cves_detected": len(all_cves),
                    "exploits_detected": len(all_exploits),
                    "open_ports_count": len(open_services)
                }
    except Exception:
        # Gracefully fall through to deterministic correlation
        pass

    return None


def _deterministic_security_analysis(target, open_services, all_exploits, all_cves, os_info, vt_stats, vt_risk, ssl_data, headers_data):
    """
    Expert rule-based correlation engine that calculates exact risk levels, key triggers,
    and remediation steps based on multi-source security findings.
    """
    key_reasons = []
    recommended_fixes = []
    threat_score = 0

    # 1. Official CVE Evaluation
    num_cves = len(all_cves)
    critical_cves = [c for c in all_cves if str(c.get("severity", "")).upper() == "CRITICAL" or (isinstance(c.get("cvss_score"), (int, float)) and c.get("cvss_score") >= 9.0)]
    high_cves = [c for c in all_cves if str(c.get("severity", "")).upper() == "HIGH" or (isinstance(c.get("cvss_score"), (int, float)) and 7.0 <= c.get("cvss_score") < 9.0)]

    if critical_cves:
        threat_score += min(len(critical_cves) * 35, 70)
        cve_ids = [c.get("cve_id") for c in critical_cves[:3] if c.get("cve_id")]
        key_reasons.append(
            f"Identified {len(critical_cves)} CRITICAL severity CVEs ({', '.join(cve_ids)}) with CVSS >= 9.0."
        )
        recommended_fixes.append(
            f"Apply immediate vendor security patches to remediate critical vulnerabilities: {', '.join(cve_ids)}."
        )
    elif high_cves:
        threat_score += min(len(high_cves) * 20, 50)
        cve_ids = [c.get("cve_id") for c in high_cves[:3] if c.get("cve_id")]
        key_reasons.append(
            f"Identified {len(high_cves)} HIGH severity CVEs ({', '.join(cve_ids)}) with CVSS >= 7.0."
        )
        recommended_fixes.append(
            f"Schedule priority patching for high-severity vulnerabilities: {', '.join(cve_ids)}."
        )

    # 2. ExploitDB Correlation
    num_exploits = len(all_exploits)
    if num_exploits > 0:
        threat_score += min(num_exploits * 20, 50)
        unique_services = list(set(e.get("service") for e in all_exploits if e.get("service")))
        key_reasons.append(
            f"Discovered {num_exploits} verified ExploitDB / Searchsploit exploit PoCs targeting: {', '.join(unique_services)}."
        )
        recommended_fixes.append(
            "Isolate services with publicly accessible exploit PoCs behind firewall or bastion host."
        )


    # 2. Open Port Exposure Assessment
    critical_ports = {
        21: ("FTP", "Transmits unencrypted credentials and commands across the network."),
        23: ("Telnet", "Legacy cleartext protocol vulnerable to network sniffing and credential harvesting."),
        445: ("SMB", "Exposed Windows/Samba file sharing service frequently targeted by lateral movement and worms."),
        3389: ("RDP", "Remote Desktop endpoint exposed directly to public internet without VPN/gateway."),
        3306: ("MySQL", "Database port exposed directly to external network traffic."),
        5432: ("PostgreSQL", "Database listener accessible from unauthorized network segments."),
        8080: ("HTTP-Proxy/Dev", "Development or administrative web service exposed publicly.")
    }

    found_critical_ports = []
    for svc_str in open_services:
        for port, (pname, preason) in critical_ports.items():
            if f"Port {port}/" in svc_str:
                found_critical_ports.append((port, pname, preason))

    if found_critical_ports:
        threat_score += len(found_critical_ports) * 15
        for port, pname, preason in found_critical_ports:
            key_reasons.append(f"High-risk port {port} ({pname}) exposed: {preason}")
            recommended_fixes.append(f"Restrict access to port {port} ({pname}) using host firewall or place behind an authenticated VPN.")

    # 3. Threat Intelligence / VirusTotal Evaluation
    malicious_vendors = vt_stats.get("malicious", 0)
    suspicious_vendors = vt_stats.get("suspicious", 0)

    if malicious_vendors > 0 or suspicious_vendors > 0:
        threat_score += malicious_vendors * 15 + suspicious_vendors * 5
        key_reasons.append(
            f"IP reputation flagged by {malicious_vendors} security engines as malicious ({suspicious_vendors} suspicious)."
        )
        recommended_fixes.append("Investigate outbound traffic and check IP blacklists for domain reputation remediation.")

    # 4. SSL & Security Headers (if provided)
    if ssl_data and not ssl_data.get("valid", True):
        threat_score += 20
        key_reasons.append("SSL/TLS certificate is invalid or expired, exposing communication to man-in-the-middle attacks.")
        recommended_fixes.append("Renew and deploy a valid SSL/TLS certificate issued by a trusted Certificate Authority (e.g. Let's Encrypt).")

    missing_headers = headers_data.get("missing", [])
    if "Content-Security-Policy" in missing_headers:
        threat_score += 10
        key_reasons.append("Missing Content-Security-Policy (CSP) header, increasing susceptibility to XSS attacks.")
        recommended_fixes.append("Configure a Content-Security-Policy header to restrict resource loading and script execution.")

    if "Strict-Transport-Security" in missing_headers:
        threat_score += 5
        recommended_fixes.append("Enable HTTP Strict Transport Security (HSTS) with max-age to enforce HTTPS.")

    # 5. Phase 7: Web Misconfigurations & Directory Exposures (Nikto / Gobuster)
    nikto_findings = scan_data.get("nikto", {}).get("findings", [])
    for mf in nikto_findings[:3]:
        m_sev = mf.get("severity", "LOW")
        m_title = mf.get("title", "Misconfiguration")
        m_rem = mf.get("remediation")
        if m_sev in ["CRITICAL", "HIGH"]:
            threat_score += 15
            key_reasons.append(f"Web Misconfiguration [{m_sev}]: {m_title}")
            if m_rem:
                recommended_fixes.append(m_rem)

    gobuster_paths = scan_data.get("gobuster", {}).get("discovered_paths", [])
    exposed_sensitive = [p["path"] for p in gobuster_paths if any(k in p["path"] for k in [".env", ".git", "backup", "admin", "config"])]
    if exposed_sensitive:
        threat_score += 15
        key_reasons.append(f"Discovered sensitive hidden directories/files: {', '.join(exposed_sensitive[:3])}")
        recommended_fixes.append("Restrict public web access to sensitive backup archives, dotfiles, and administrative consoles.")

    # Cap threat score
    threat_score = min(max(threat_score, 5), 100)


    # Determine Severity Level
    if num_exploits >= 3 or threat_score >= 80 or any(p[0] in [23, 445] for p in found_critical_ports):
        severity_level = "Critical"
    elif num_exploits > 0 or threat_score >= 50 or found_critical_ports:
        severity_level = "High"
    elif threat_score >= 25 or len(open_services) > 2:
        severity_level = "Medium"
    else:
        severity_level = "Low"

    # Default fallback reason if target is clean
    if not key_reasons:
        key_reasons.append("No active ExploitDB correlations or critical port vulnerabilities detected.")
        recommended_fixes.append("Maintain regular security audit schedules and keep server packages updated.")

    # Generate narrative summary
    if severity_level in ["Critical", "High"]:
        vulnerability_summary = (
            f"VioletShield identified significant attack surface vulnerabilities on {target} ({severity_level} Severity). "
            f"The audit revealed {len(open_services)} open services and {num_exploits} matching ExploitDB exploit entries. "
            "Immediate remediation is required to isolate critical ports and apply software patches."
        )
    elif severity_level == "Medium":
        vulnerability_summary = (
            f"Security assessment for {target} identified moderate risk factors ({severity_level} Severity). "
            f"{len(open_services)} network services are accessible. Applying recommended hardening measures and header policies will enhance defense-in-depth."
        )
    else:
        vulnerability_summary = (
            f"Security audit for {target} indicates a resilient baseline ({severity_level} Severity). "
            "No high-impact vulnerabilities or public exploit vectors were discovered on monitored endpoints."
        )

    return {
        "vulnerability_summary": vulnerability_summary,
        "severity_level": severity_level,
        "key_reasons": key_reasons,
        "recommended_fixes": list(dict.fromkeys(recommended_fixes)), # Remove duplicates
        "threat_score": threat_score,
        "engine_used": "VioletShield Security Correlation Engine",
        "exploits_detected": num_exploits,
        "open_ports_count": len(open_services)
    }
