import math

# High-Risk Port Profiles
CRITICAL_PORTS = {
    21: {"name": "FTP", "penalty": 8, "reason": "Cleartext FTP authentication exposed to public internet."},
    23: {"name": "Telnet", "penalty": 12, "reason": "Legacy cleartext Telnet service vulnerable to credential sniffing."},
    445: {"name": "SMB", "penalty": 15, "reason": "Exposed SMB file sharing service (high-risk vector for lateral movement)."},
    3389: {"name": "RDP", "penalty": 10, "reason": "Remote Desktop Protocol listener exposed directly without VPN protection."},
    3306: {"name": "MySQL", "penalty": 10, "reason": "Relational database listener directly accessible externally."},
    5432: {"name": "PostgreSQL", "penalty": 10, "reason": "PostgreSQL database port accessible without network isolation."},
    27017: {"name": "MongoDB", "penalty": 10, "reason": "NoSQL MongoDB port exposed publicly."},
    6379: {"name": "Redis", "penalty": 12, "reason": "Redis key-value store accessible without perimeter firewall."}
}


def evaluate_network_pillar(ports_data):
    """
    Evaluates Pillar 1: Network & Attack Surface Exposure (Max 25 pts).
    """
    max_pts = 25
    deductions = 0
    reasons = []
    remediations = []

    open_ports = []
    if isinstance(ports_data, list):
        for p in ports_data:
            if isinstance(p, dict):
                port_num = p.get("port")
                if port_num:
                    try:
                        open_ports.append(int(port_num))
                    except Exception:
                        pass
            elif isinstance(p, int):
                open_ports.append(p)
    elif isinstance(ports_data, dict):
        # Support dict port maps
        for k in ports_data.keys():
            try:
                open_ports.append(int(k))
            except Exception:
                pass

    # Check for known dangerous ports
    for p in open_ports:
        if p in CRITICAL_PORTS:
            info = CRITICAL_PORTS[p]
            pen = info["penalty"]
            deductions += pen
            reasons.append(f"Port {p} ({info['name']}) exposed: {info['reason']} (-{pen} pts)")
            remediations.append({
                "action": f"Close or firewall port {p} ({info['name']}) behind a secure bastion/VPN",
                "priority": "HIGH" if pen >= 10 else "MEDIUM",
                "points_recovery": min(pen, 15)
            })

    # Excessive port penalty
    if len(open_ports) > 10:
        deductions += 6
        reasons.append(f"Broad perimeter exposure ({len(open_ports)} open ports) increases attack surface (-6 pts)")
        remediations.append({"action": "Implement default-deny inbound firewall policies to minimize open ports", "priority": "LOW", "points_recovery": 6})
    elif len(open_ports) > 5:
        deductions += 3
        reasons.append(f"Elevated open port count ({len(open_ports)} ports) detected (-3 pts)")

    score = max(0, max_pts - deductions)
    status = "Secure" if score >= 22 else "Moderate" if score >= 15 else "Critical Exposure"

    return {
        "score": score,
        "max": max_pts,
        "status": status,
        "open_ports_count": len(open_ports),
        "reasons": reasons,
        "remediations": remediations
    }


def evaluate_vulnerability_pillar(cves=None, exploits=None, vulnerabilities=None, nikto_data=None, gobuster_data=None):
    """
    Evaluates Pillar 2: Vulnerabilities, CVEs & ExploitDB PoCs (Max 35 pts).
    """
    max_pts = 35
    deductions = 0
    reasons = []
    remediations = []

    # 1. ExploitDB Matches
    exploit_list = exploits or []
    if exploit_list:
        pen = min(len(exploit_list) * 10, 20)
        deductions += pen
        reasons.append(f"Discovered {len(exploit_list)} verified ExploitDB proof-of-concept exploits (-{pen} pts)")
        remediations.append({
            "action": "Patch or isolate software versions with public ExploitDB PoCs",
            "priority": "CRITICAL",
            "points_recovery": pen
        })

    # 2. CVE Intelligence (CVSS 3.1 Severity)
    cve_list = cves or []
    critical_cves = [c for c in cve_list if float(c.get("cvss_score") or c.get("cvss") or 0) >= 9.0 or (c.get("severity") or "").upper() == "CRITICAL"]
    high_cves = [c for c in cve_list if 7.0 <= float(c.get("cvss_score") or c.get("cvss") or 0) < 9.0 or (c.get("severity") or "").upper() == "HIGH"]
    med_cves = [c for c in cve_list if 4.0 <= float(c.get("cvss_score") or c.get("cvss") or 0) < 7.0 or (c.get("severity") or "").upper() == "MEDIUM"]

    if critical_cves:
        cve_pen = min(len(critical_cves) * 12, 24)
        deductions += cve_pen
        cve_ids = [c.get("cve_id") for c in critical_cves[:3] if c.get("cve_id")]
        reasons.append(f"{len(critical_cves)} CRITICAL CVEs detected ({', '.join(cve_ids)}) with CVSS >= 9.0 (-{cve_pen} pts)")
        remediations.append({
            "action": f"Apply urgent security patches for critical CVEs: {', '.join(cve_ids)}",
            "priority": "CRITICAL",
            "points_recovery": cve_pen
        })
    elif high_cves:
        cve_pen = min(len(high_cves) * 7, 14)
        deductions += cve_pen
        cve_ids = [c.get("cve_id") for c in high_cves[:3] if c.get("cve_id")]
        reasons.append(f"{len(high_cves)} HIGH severity CVEs ({', '.join(cve_ids)}) identified (-{cve_pen} pts)")
        remediations.append({
            "action": f"Schedule priority updates for high CVEs: {', '.join(cve_ids)}",
            "priority": "HIGH",
            "points_recovery": cve_pen
        })

    # 3. Exposed Sensitive Files (Gobuster / Web Vulns)
    if vulnerabilities:
        for v in vulnerabilities:
            if isinstance(v, dict):
                sev = (v.get("severity") or "Medium").upper()
                v_pen = 8 if sev == "HIGH" else 4
                deductions += v_pen
                reasons.append(f"Vulnerability [{sev}]: {v.get('title', 'Security flaw')} (-{v_pen} pts)")

    # 4. Phase 7 Nikto Findings
    if nikto_data and isinstance(nikto_data, dict):
        nikto_crit = [f for f in nikto_data.get("findings", []) if f.get("severity") == "CRITICAL"]
        nikto_high = [f for f in nikto_data.get("findings", []) if f.get("severity") == "HIGH"]
        if nikto_crit:
            deductions += min(len(nikto_crit) * 10, 15)
            reasons.append(f"Critical server misconfiguration: {nikto_crit[0].get('title')} (-10 pts)")
            remediations.append({"action": nikto_crit[0].get("remediation", "Fix critical misconfiguration"), "priority": "CRITICAL", "points_recovery": 10})
        elif nikto_high:
            deductions += 6
            reasons.append(f"High risk web misconfiguration: {nikto_high[0].get('title')} (-6 pts)")

    score = max(0, max_pts - deductions)
    status = "Resilient" if score >= 30 else "Moderate Risk" if score >= 18 else "Vulnerable"

    return {
        "score": score,
        "max": max_pts,
        "status": status,
        "reasons": reasons,
        "remediations": remediations
    }


def evaluate_web_hardening_pillar(ssl_data=None, headers_data=None, cookies_data=None):
    """
    Evaluates Pillar 3: Web Application & Cryptography Hardening (Max 25 pts).
    """
    max_pts = 25
    deductions = 0
    reasons = []
    remediations = []

    # 1. SSL/TLS Verification
    ssl = ssl_data or {}
    if not ssl.get("valid", True):
        deductions += 15
        reasons.append("Invalid or missing SSL/TLS certificate (-15 pts)")
        remediations.append({"action": "Deploy a valid, CA-signed SSL/TLS certificate", "priority": "CRITICAL", "points_recovery": 15})
    else:
        days = ssl.get("daysRemaining", 999)
        if days < 30:
            deductions += 5
            reasons.append(f"SSL certificate expires in {days} days (-5 pts)")
            remediations.append({"action": "Renew SSL certificate before expiration", "priority": "MEDIUM", "points_recovery": 5})

    # 2. Defensive Security Headers
    headers = headers_data or {}
    missing_headers = headers.get("missing", [])
    
    if "Content-Security-Policy" in missing_headers:
        deductions += 3
        reasons.append("Missing Content-Security-Policy (CSP) header (-3 pts)")
        remediations.append({"action": "Implement Content-Security-Policy (CSP) header to prevent XSS", "priority": "MEDIUM", "points_recovery": 3})

    if "Strict-Transport-Security" in missing_headers:
        deductions += 3
        reasons.append("Missing Strict-Transport-Security (HSTS) header (-3 pts)")
        remediations.append({"action": "Enable HSTS header (max-age=31536000; includeSubDomains)", "priority": "LOW", "points_recovery": 3})

    if "X-Frame-Options" in missing_headers:
        deductions += 2
        reasons.append("Missing X-Frame-Options Clickjacking mitigation (-2 pts)")
        remediations.append({"action": "Configure 'X-Frame-Options: SAMEORIGIN' header", "priority": "LOW", "points_recovery": 2})

    if "X-Content-Type-Options" in missing_headers:
        deductions += 1
        reasons.append("Missing X-Content-Type-Options nosniff header (-1 pt)")

    # 3. Cookie Security Attributes
    cookies = cookies_data or {}
    missing_httponly = cookies.get("missing_httponly", [])
    missing_secure = cookies.get("missing_secure", [])

    if len(missing_httponly) > 0:
        deductions += 3
        reasons.append(f"{len(missing_httponly)} cookies missing HttpOnly flag (-3 pts)")
        remediations.append({"action": "Set HttpOnly flag on all session cookies to mitigate XSS theft", "priority": "MEDIUM", "points_recovery": 3})

    if len(missing_secure) > 0:
        deductions += 3
        reasons.append(f"{len(missing_secure)} cookies missing Secure flag (-3 pts)")
        remediations.append({"action": "Enforce Secure flag on cookies to guarantee HTTPS transmission", "priority": "LOW", "points_recovery": 3})

    score = max(0, max_pts - deductions)
    status = "Hardened" if score >= 22 else "Moderate" if score >= 14 else "Weakly Protected"

    return {
        "score": score,
        "max": max_pts,
        "status": status,
        "reasons": reasons,
        "remediations": remediations
    }


def evaluate_threat_intelligence_pillar(threat_intel=None, virustotal=None, dnsbl=None):
    """
    Evaluates Pillar 4: Threat Intelligence & Reputation (Max 15 pts).
    """
    max_pts = 15
    deductions = 0
    reasons = []
    remediations = []

    # Extract VT statistics
    vt = virustotal or {}
    if not vt and isinstance(threat_intel, dict):
        vt = threat_intel.get("virustotal", {})

    stats = vt.get("last_analysis_stats", {})
    malicious = stats.get("malicious", 0)
    suspicious = stats.get("suspicious", 0)

    if malicious > 0:
        pen = min(malicious * 4, 10)
        deductions += pen
        reasons.append(f"Flagged as MALICIOUS by {malicious} security vendors on VirusTotal (-{pen} pts)")
        remediations.append({
            "action": "Investigate host for unauthorized malware activity and request blacklist delisting",
            "priority": "HIGH",
            "points_recovery": pen
        })

    if suspicious > 0:
        pen = min(suspicious * 2, 4)
        deductions += pen
        reasons.append(f"Flagged as SUSPICIOUS by {suspicious} security engines (-{pen} pts)")

    # DNSBL Blacklist Check
    dnsbl_data = dnsbl or (threat_intel.get("dnsbl", {}) if isinstance(threat_intel, dict) else {})
    total_listed = dnsbl_data.get("total_listed", 0)
    if total_listed > 0:
        b_pen = min(total_listed * 5, 8)
        deductions += b_pen
        reasons.append(f"IP address listed in {total_listed} DNS Blacklists (Spam/Abuse) (-{b_pen} pts)")
        remediations.append({
            "action": "Resolve mail/botnet traffic abuse and submit delisting requests to DNSBLs",
            "priority": "HIGH",
            "points_recovery": b_pen
        })

    score = max(0, max_pts - deductions)
    status = "Clean Reputation" if score >= 13 else "Suspicious" if score >= 8 else "Blacklisted"

    return {
        "score": score,
        "max": max_pts,
        "status": status,
        "reasons": reasons,
        "remediations": remediations
    }


def compute_composite_risk_score(scan_data):
    """
    Phase 10: Multi-Pillar AI Composite Risk Scoring Engine.
    
    Accepts full scan data dictionary and returns structured:
      - security_score (0-100)
      - grade (A+, A, B, C, D, F)
      - risk_level (Critical, High, Medium, Low)
      - pillars breakdown (Network, Vulnerabilities, Web Hardening, Threat Intel)
      - main_reasons (top score deduction drivers)
      - priority_remediations (ranked actionable fixes with point recovery)
    """
    if not isinstance(scan_data, dict):
        scan_data = {}

    ports = scan_data.get("ports", [])
    cves = scan_data.get("cves", [])
    exploits = scan_data.get("exploits", [])
    vulns = scan_data.get("vulnerabilities", [])
    ssl = scan_data.get("ssl", {})
    headers = scan_data.get("headers", {})
    cookies = scan_data.get("cookies", {})
    threat_intel = scan_data.get("threat_intelligence") or scan_data.get("threat_data") or {}
    nikto = scan_data.get("nikto", {})
    gobuster = scan_data.get("gobuster", {})

    # 1. Evaluate All 4 Pillars
    p1 = evaluate_network_pillar(ports)
    p2 = evaluate_vulnerability_pillar(cves=cves, exploits=exploits, vulnerabilities=vulns, nikto_data=nikto, gobuster_data=gobuster)
    p3 = evaluate_web_hardening_pillar(ssl_data=ssl, headers_data=headers, cookies_data=cookies)
    p4 = evaluate_threat_intelligence_pillar(threat_intel=threat_intel)

    total_score = p1["score"] + p2["score"] + p3["score"] + p4["score"]
    total_score = min(max(int(round(total_score)), 0), 100)

    # 2. Grade and Risk Tier Determination
    if total_score >= 95:
        grade = "A+"
        risk_level = "Low"
        posture_label = "Pristine Defense & Hardened Baseline"
    elif total_score >= 85:
        grade = "A"
        risk_level = "Low"
        posture_label = "Strong Security Posture"
    elif total_score >= 70:
        grade = "B"
        risk_level = "Medium"
        posture_label = "Adequate Defense with Minor Hardening Gaps"
    elif total_score >= 55:
        grade = "C"
        risk_level = "Medium"
        posture_label = "Moderate Risk / Hardening Required"
    elif total_score >= 40:
        grade = "D"
        risk_level = "High"
        posture_label = "High Risk / Significant Attack Surface"
    else:
        grade = "F"
        risk_level = "Critical"
        posture_label = "Critical Exposure / Immediate Action Required"

    # 3. Consolidate Reasons & Remediations
    all_reasons = p1["reasons"] + p2["reasons"] + p3["reasons"] + p4["reasons"]
    all_remediations = p1["remediations"] + p2["remediations"] + p3["remediations"] + p4["remediations"]

    if not all_reasons:
        all_reasons.append("Endpoint demonstrates resilient baseline defense with zero high-risk findings.")

    # Deduplicate remediations by action text
    seen_actions = set()
    unique_remediations = []
    for rem in all_remediations:
        act = rem.get("action")
        if act and act not in seen_actions:
            seen_actions.add(act)
            unique_remediations.append(rem)

    # Sort remediations: CRITICAL first, then HIGH, then points recovery
    priority_order = {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 3, "LOW": 4}
    unique_remediations.sort(key=lambda x: (priority_order.get(x.get("priority", "LOW"), 99), -x.get("points_recovery", 0)))

    return {
        "security_score": total_score,
        "grade": grade,
        "risk_level": risk_level,
        "posture_label": posture_label,
        "pillars": {
            "network_exposure": {
                "name": "Network & Service Exposure",
                "score": p1["score"],
                "max": p1["max"],
                "status": p1["status"]
            },
            "vulnerabilities_cves": {
                "name": "CVEs, Exploits & Vulnerabilities",
                "score": p2["score"],
                "max": p2["max"],
                "status": p2["status"]
            },
            "web_hardening": {
                "name": "Web & Cryptography Hardening",
                "score": p3["score"],
                "max": p3["max"],
                "status": p3["status"]
            },
            "threat_reputation": {
                "name": "Threat Intel & Reputation",
                "score": p4["score"],
                "max": p4["max"],
                "status": p4["status"]
            }
        },
        "main_reasons": all_reasons,
        "priority_remediations": unique_remediations[:8]
    }
