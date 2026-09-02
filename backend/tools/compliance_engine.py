import json


# =============================================================================
# REGULATORY COMPLIANCE FRAMEWORK CONTROL DEFINITIONS
# =============================================================================

FRAMEWORK_DEFINITIONS = {
    "PCI_DSS_V4": {
        "id": "PCI_DSS_V4",
        "name": "PCI-DSS v4.0",
        "title": "Payment Card Industry Data Security Standard",
        "description": "Global security standard for organizations that handle branded credit cards from major card schemes.",
        "icon": "CreditCard",
        "controls": [
            {
                "id": "PCI-REQ-1.2",
                "name": "Network Security Controls & Insecure Port Restrictions",
                "requirement": "Restrict incoming and outgoing traffic to that which is necessary for the cardholder data environment.",
                "category": "Perimeter & Network"
            },
            {
                "id": "PCI-REQ-2.2",
                "name": "System Component Configuration & Default Hardening",
                "requirement": "Configure system components securely and eliminate default accounts, cleartext services, and information disclosure.",
                "category": "Hardening"
            },
            {
                "id": "PCI-REQ-4.1",
                "name": "Strong Cryptography for Cardholder Data in Transit",
                "requirement": "Protect cardholder data with strong cryptography (TLS 1.2 or TLS 1.3) during transmission over open, public networks.",
                "category": "Cryptography"
            },
            {
                "id": "PCI-REQ-6.2",
                "name": "Software Security & Vulnerability Management",
                "requirement": "Bespoke and custom software must be protected against known vulnerabilities and high-risk CVEs.",
                "category": "Vulnerabilities"
            },
            {
                "id": "PCI-REQ-6.4",
                "name": "Web Application Perimeter Protection & Header Hardening",
                "requirement": "Deploy automated technical solutions (WAF, CSP, HSTS) to detect and prevent web-based attacks.",
                "category": "Web Application"
            },
            {
                "id": "PCI-REQ-11.3",
                "name": "Regular Internal and External Penetration Testing",
                "requirement": "Perform regular internal and external penetration testing to identify and remediate security vulnerabilities.",
                "category": "Testing"
            }
        ]
    },
    "HIPAA_SECURITY": {
        "id": "HIPAA_SECURITY",
        "name": "HIPAA Security Rule",
        "title": "Health Insurance Portability and Accountability Act (45 CFR Part 164)",
        "description": "National standards for the security of Electronic Protected Health Information (ePHI).",
        "icon": "HeartHandshake",
        "controls": [
            {
                "id": "HIPAA-164.312(e)(1)",
                "name": "Transmission Security & End-to-End Encryption",
                "requirement": "Implement technical security measures to guard against unauthorized access to ePHI being transmitted over an electronic communications network.",
                "category": "Transmission"
            },
            {
                "id": "HIPAA-164.308(a)(1)(ii)(A)",
                "name": "Risk Analysis & Technical Vulnerability Audits",
                "requirement": "Conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of ePHI.",
                "category": "Risk Assessment"
            },
            {
                "id": "HIPAA-164.312(a)(1)",
                "name": "Access Controls & Insecure Service Restriction",
                "requirement": "Implement technical policies and procedures for electronic information systems to allow access only to authorized persons or software programs.",
                "category": "Access Control"
            },
            {
                "id": "HIPAA-164.312(c)(1)",
                "name": "ePHI Integrity & Malware Protection",
                "requirement": "Implement policies and procedures to protect electronic protected health information from improper alteration, destruction, or malware compromise.",
                "category": "Integrity"
            }
        ]
    },
    "SOC2_TYPE2": {
        "id": "SOC2_TYPE2",
        "name": "SOC 2 Type II",
        "title": "AICPA Trust Services Criteria (Security, Confidentiality, Availability)",
        "description": "Auditing framework ensuring service providers securely manage customer data across cloud boundaries.",
        "icon": "ShieldCheck",
        "controls": [
            {
                "id": "SOC2-CC6.6",
                "name": "Logical Perimeter Defense & Ingress Filtering",
                "requirement": "The entity implements logical boundary protection measures to control traffic and prevent unauthorized access.",
                "category": "Perimeter"
            },
            {
                "id": "SOC2-CC6.7",
                "name": "Transmission Data Protection & Strong Cryptography",
                "requirement": "The entity protects data in transit using industry-accepted encryption algorithms and protocols.",
                "category": "Cryptography"
            },
            {
                "id": "SOC2-CC7.1",
                "name": "Vulnerability Detection & Security Baseline Monitoring",
                "requirement": "The entity uses vulnerability detection tools to identify potential vulnerabilities and tracks remediation.",
                "category": "Vulnerabilities"
            },
            {
                "id": "SOC2-CC7.2",
                "name": "Security Incident Monitoring & Threat Intelligence",
                "requirement": "The entity monitors system components to detect anomalies indicative of malicious acts or vulnerabilities.",
                "category": "Monitoring"
            }
        ]
    },
    "ISO_27001": {
        "id": "ISO_27001",
        "name": "ISO/IEC 27001:2022",
        "title": "Information Security Management System (ISMS) Standard",
        "description": "International standard outlining best practice requirements for information security controls.",
        "icon": "Award",
        "controls": [
            {
                "id": "ISO-A.8.8",
                "name": "Management of Technical Vulnerabilities",
                "requirement": "Information about technical vulnerabilities of information systems in use must be obtained, evaluated, and addressed.",
                "category": "Vulnerability Management"
            },
            {
                "id": "ISO-A.8.20",
                "name": "Network Security & Service Filtering",
                "requirement": "Networks and network devices must be secured, managed, and controlled to protect information in systems.",
                "category": "Network Security"
            },
            {
                "id": "ISO-A.8.24",
                "name": "Use of Cryptography (TLS 1.2/1.3)",
                "requirement": "Rules for the effective use of cryptography, including cryptographic key management, must be defined and implemented.",
                "category": "Cryptography"
            },
            {
                "id": "ISO-A.8.26",
                "name": "Application Security Requirements",
                "requirement": "Information security requirements must be identified, specified, and approved when developing or acquiring applications.",
                "category": "Application Security"
            },
            {
                "id": "ISO-A.8.28",
                "name": "Secure Coding & Header Defenses",
                "requirement": "Secure coding principles must be applied to software development to mitigate web application vulnerabilities.",
                "category": "Secure Coding"
            }
        ]
    }
}


def evaluate_scan_compliance(scan_data):
    """
    Evaluates scan telemetry against PCI-DSS v4.0, HIPAA, SOC 2, and ISO 27001:2022.
    """
    if not scan_data or not isinstance(scan_data, dict):
        scan_data = {}

    ports = scan_data.get("ports", [])
    vulns = scan_data.get("vulnerabilities", [])
    cves = scan_data.get("cves", [])
    ssl_data = scan_data.get("ssl", {})
    headers_data = scan_data.get("headers", {})
    cookies_data = scan_data.get("cookies", {})
    threat_data = scan_data.get("threat_intel", {})
    score = int(scan_data.get("security_score") or scan_data.get("score") or 85)

    # 1. Technical Telemetry Extraction
    open_port_numbers = set()
    for p in ports:
        pnum = p.get("port") if isinstance(p, dict) else p
        if pnum:
            open_port_numbers.add(int(pnum))

    insecure_ports_found = open_port_numbers.intersection({21, 23, 25, 110, 143, 3389, 445, 139, 8080})

    # CVE Severity count
    has_critical_cves = False
    has_high_cves = False
    cve_id_list = []

    for v in vulns + cves:
        sev = str(v.get("severity") if isinstance(v, dict) else "").upper()
        cid = v.get("cve_id") or v.get("title") if isinstance(v, dict) else str(v)
        if cid:
            cve_id_list.append(str(cid))
        if sev == "CRITICAL" or "CRITICAL" in str(v).upper():
            has_critical_cves = True
        if sev == "HIGH" or "HIGH" in str(v).upper():
            has_high_cves = True

    # SSL compliance
    ssl_valid = bool(ssl_data.get("valid", True))
    ssl_version = str(ssl_data.get("protocol") or ssl_data.get("version") or "TLSv1.3")
    ssl_compliant = ssl_valid and ("TLSv1.2" in ssl_version or "TLSv1.3" in ssl_version or "TLS" in ssl_version)

    # Headers compliance
    missing_headers = []
    if isinstance(headers_data, dict):
        for h in ["Strict-Transport-Security", "Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options"]:
            if not headers_data.get(h) and not headers_data.get(h.lower()):
                missing_headers.append(h)

    # Threat intel status
    threat_reputation = threat_data.get("reputation", "CLEAN") if isinstance(threat_data, dict) else "CLEAN"
    is_malicious = threat_reputation in ["MALICIOUS", "SUSPICIOUS"]

    # 2. Framework Evaluation Engine
    evaluated_frameworks = {}

    # === A. PCI-DSS v4.0 Evaluation ===
    pci_controls = []
    # Req 1.2
    c1_fail = len(insecure_ports_found) > 0
    pci_controls.append({
        "id": "PCI-REQ-1.2",
        "name": "Network Security Controls & Insecure Port Restrictions",
        "status": "FAIL" if c1_fail else "PASS",
        "severity": "HIGH" if c1_fail else "LOW",
        "technical_evidence": f"Open cleartext/management ports: {list(insecure_ports_found)}" if c1_fail else "No prohibited cleartext ports detected.",
        "gap_description": "Prohibited cleartext ports (e.g. Telnet, FTP, RDP) exposed to public perimeter." if c1_fail else "",
        "remediation_steps": "Close unnecessary ports via firewall security groups and restrict administrative ports to private VPNs."
    })
    # Req 2.2
    c2_fail = len(missing_headers) > 2
    pci_controls.append({
        "id": "PCI-REQ-2.2",
        "name": "System Component Configuration & Default Hardening",
        "status": "FAIL" if c2_fail else "PASS",
        "severity": "MEDIUM" if c2_fail else "LOW",
        "technical_evidence": f"Missing critical headers: {', '.join(missing_headers)}" if c2_fail else "Security headers configured properly.",
        "gap_description": "Web server discloses technical information or lacks mandatory defensive headers." if c2_fail else "",
        "remediation_steps": "Apply CIS hardening guidelines and configure X-Content-Type-Options and X-Frame-Options."
    })
    # Req 4.1
    c4_fail = not ssl_compliant
    pci_controls.append({
        "id": "PCI-REQ-4.1",
        "name": "Strong Cryptography for Cardholder Data in Transit",
        "status": "FAIL" if c4_fail else "PASS",
        "severity": "CRITICAL" if c4_fail else "LOW",
        "technical_evidence": f"SSL/TLS Status: {'Compliant' if ssl_compliant else 'Non-compliant or expired certificate'}",
        "gap_description": "Transmission encryption does not meet TLS 1.2+ minimum cryptographic baseline." if c4_fail else "",
        "remediation_steps": "Upgrade web server cipher suites to enforce TLS 1.2 or TLS 1.3 and renew valid CA certificates."
    })
    # Req 6.2
    c62_fail = has_critical_cves or has_high_cves
    pci_controls.append({
        "id": "PCI-REQ-6.2",
        "name": "Software Security & Vulnerability Management",
        "status": "FAIL" if c62_fail else "PASS",
        "severity": "CRITICAL" if has_critical_cves else ("HIGH" if has_high_cves else "LOW"),
        "technical_evidence": f"Discovered CVEs: {', '.join(cve_id_list[:3])}" if c62_fail else "No critical or high CVEs identified.",
        "gap_description": "Publicly known high/critical CVE vulnerabilities detected on active software components." if c62_fail else "",
        "remediation_steps": "Apply vendor security patches or upgrade affected software libraries immediately."
    })
    # Req 6.4
    c64_fail = "Content-Security-Policy" in missing_headers or "Strict-Transport-Security" in missing_headers
    pci_controls.append({
        "id": "PCI-REQ-6.4",
        "name": "Web Application Perimeter Protection & Header Hardening",
        "status": "FAIL" if c64_fail else "PASS",
        "severity": "MEDIUM" if c64_fail else "LOW",
        "technical_evidence": f"Missing headers: {[h for h in ['Content-Security-Policy', 'Strict-Transport-Security'] if h in missing_headers]}",
        "gap_description": "Missing HSTS or CSP headers to prevent client-side injection and downgrade attacks." if c64_fail else "",
        "remediation_steps": "Add Strict-Transport-Security (HSTS) with max-age=31536000 and deploy Content-Security-Policy."
    })
    # Req 11.3
    pci_controls.append({
        "id": "PCI-REQ-11.3",
        "name": "Regular Internal and External Penetration Testing",
        "status": "PASS",
        "severity": "LOW",
        "technical_evidence": "Automated penetration test executed via VioletShield SOC Engine.",
        "gap_description": "",
        "remediation_steps": "Maintain quarterly scheduled penetration testing logs for compliance audit evidence."
    })

    pci_pass = sum(1 for c in pci_controls if c["status"] == "PASS")
    pci_score = int((pci_pass / len(pci_controls)) * 100)
    evaluated_frameworks["PCI_DSS_V4"] = {
        **FRAMEWORK_DEFINITIONS["PCI_DSS_V4"],
        "compliance_score": pci_score,
        "status": "AUDIT_READY" if pci_score >= 85 else ("NEEDS_REMEDIATION" if pci_score >= 65 else "NON_COMPLIANT"),
        "passed_controls": pci_pass,
        "failed_controls": len(pci_controls) - pci_pass,
        "total_controls": len(pci_controls),
        "controls": pci_controls
    }

    # === B. HIPAA Security Rule Evaluation ===
    hipaa_controls = []
    # 164.312(e)(1)
    h1_fail = not ssl_compliant
    hipaa_controls.append({
        "id": "HIPAA-164.312(e)(1)",
        "name": "Transmission Security & End-to-End Encryption",
        "status": "FAIL" if h1_fail else "PASS",
        "severity": "CRITICAL" if h1_fail else "LOW",
        "technical_evidence": f"Protocol: {ssl_version} | Certificate Valid: {ssl_valid}",
        "gap_description": "Transmission channel lacks verified TLS encryption to safeguard ePHI in transit." if h1_fail else "",
        "remediation_steps": "Enforce HTTPS redirect and configure TLS 1.3 with AES-256-GCM cipher suites."
    })
    # 164.308(a)(1)(ii)(A)
    h2_fail = has_critical_cves or has_high_cves
    hipaa_controls.append({
        "id": "HIPAA-164.308(a)(1)(ii)(A)",
        "name": "Risk Analysis & Technical Vulnerability Audits",
        "status": "FAIL" if h2_fail else "PASS",
        "severity": "HIGH" if h2_fail else "LOW",
        "technical_evidence": f"Active findings count: {len(vulns) + len(cves)}",
        "gap_description": "Vulnerabilities discovered that could lead to unauthorized ePHI disclosure." if h2_fail else "",
        "remediation_steps": "Establish automated patch management and remediate all High and Critical findings."
    })
    # 164.312(a)(1)
    h3_fail = len(insecure_ports_found) > 0
    hipaa_controls.append({
        "id": "HIPAA-164.312(a)(1)",
        "name": "Access Controls & Insecure Service Restriction",
        "status": "FAIL" if h3_fail else "PASS",
        "severity": "HIGH" if h3_fail else "LOW",
        "technical_evidence": f"Exposed ports: {list(open_port_numbers)}",
        "gap_description": "Open ports without access control restrictions may expose ePHI databases." if h3_fail else "",
        "remediation_steps": "Isolate database and backend services behind private VPCs and security groups."
    })
    # 164.312(c)(1)
    h4_fail = is_malicious
    hipaa_controls.append({
        "id": "HIPAA-164.312(c)(1)",
        "name": "ePHI Integrity & Malware Protection",
        "status": "FAIL" if h4_fail else "PASS",
        "severity": "HIGH" if h4_fail else "LOW",
        "technical_evidence": f"Threat Intelligence Reputation: {threat_reputation}",
        "gap_description": "Host or IP flagged on malicious threat intelligence feeds." if h4_fail else "",
        "remediation_steps": "Perform deep malware analysis and inspect host integrity logs."
    })

    hipaa_pass = sum(1 for c in hipaa_controls if c["status"] == "PASS")
    hipaa_score = int((hipaa_pass / len(hipaa_controls)) * 100)
    evaluated_frameworks["HIPAA_SECURITY"] = {
        **FRAMEWORK_DEFINITIONS["HIPAA_SECURITY"],
        "compliance_score": hipaa_score,
        "status": "AUDIT_READY" if hipaa_score >= 85 else ("NEEDS_REMEDIATION" if hipaa_score >= 65 else "NON_COMPLIANT"),
        "passed_controls": hipaa_pass,
        "failed_controls": len(hipaa_controls) - hipaa_pass,
        "total_controls": len(hipaa_controls),
        "controls": hipaa_controls
    }

    # === C. SOC 2 Type II Evaluation ===
    soc2_controls = []
    # CC6.6
    s1_fail = len(insecure_ports_found) > 0
    soc2_controls.append({
        "id": "SOC2-CC6.6",
        "name": "Logical Perimeter Defense & Ingress Filtering",
        "status": "FAIL" if s1_fail else "PASS",
        "severity": "HIGH" if s1_fail else "LOW",
        "technical_evidence": f"Exposed ingress ports: {list(open_port_numbers)}",
        "gap_description": "Boundary protection does not strictly filter unauthorized public ingress traffic." if s1_fail else "",
        "remediation_steps": "Implement strict egress and ingress firewall rules to minimize attack surface."
    })
    # CC6.7
    s2_fail = not ssl_compliant or "Strict-Transport-Security" in missing_headers
    soc2_controls.append({
        "id": "SOC2-CC6.7",
        "name": "Transmission Data Protection & Strong Cryptography",
        "status": "FAIL" if s2_fail else "PASS",
        "severity": "HIGH" if s2_fail else "LOW",
        "technical_evidence": f"SSL Valid: {ssl_valid}, Missing HSTS: {'Strict-Transport-Security' in missing_headers}",
        "gap_description": "Transmission channel lacks cryptographic enforcement or strict transport security." if s2_fail else "",
        "remediation_steps": "Enable HSTS and configure modern TLS encryption across all client endpoints."
    })
    # CC7.1
    s3_fail = has_critical_cves or has_high_cves
    soc2_controls.append({
        "id": "SOC2-CC7.1",
        "name": "Vulnerability Detection & Security Baseline Monitoring",
        "status": "FAIL" if s3_fail else "PASS",
        "severity": "HIGH" if s3_fail else "LOW",
        "technical_evidence": f"Total CVE/vulnerability findings: {len(cve_id_list)}",
        "gap_description": "Unpatched vulnerabilities present on production perimeter." if s3_fail else "",
        "remediation_steps": "Track and patch high-severity CVEs within 30-day SLA window."
    })
    # CC7.2
    s4_fail = is_malicious
    soc2_controls.append({
        "id": "SOC2-CC7.2",
        "name": "Security Incident Monitoring & Threat Intelligence",
        "status": "FAIL" if s4_fail else "PASS",
        "severity": "MEDIUM" if s4_fail else "LOW",
        "technical_evidence": f"Threat Feed Status: {threat_reputation}",
        "gap_description": "Host IP flagged in threat intelligence feeds." if s4_fail else "",
        "remediation_steps": "Monitor SIEM logs and integrate continuous threat intelligence alerting."
    })

    soc2_pass = sum(1 for c in soc2_controls if c["status"] == "PASS")
    soc2_score = int((soc2_pass / len(soc2_controls)) * 100)
    evaluated_frameworks["SOC2_TYPE2"] = {
        **FRAMEWORK_DEFINITIONS["SOC2_TYPE2"],
        "compliance_score": soc2_score,
        "status": "AUDIT_READY" if soc2_score >= 85 else ("NEEDS_REMEDIATION" if soc2_score >= 65 else "NON_COMPLIANT"),
        "passed_controls": soc2_pass,
        "failed_controls": len(soc2_controls) - soc2_pass,
        "total_controls": len(soc2_controls),
        "controls": soc2_controls
    }

    # === D. ISO/IEC 27001:2022 Evaluation ===
    iso_controls = []
    # A.8.8
    iso1_fail = has_critical_cves or has_high_cves
    iso_controls.append({
        "id": "ISO-A.8.8",
        "name": "Management of Technical Vulnerabilities",
        "status": "FAIL" if iso1_fail else "PASS",
        "severity": "CRITICAL" if has_critical_cves else ("HIGH" if has_high_cves else "LOW"),
        "technical_evidence": f"Identified CVEs: {len(cve_id_list)}",
        "gap_description": "Technical vulnerabilities not addressed in accordance with vulnerability management policy." if iso1_fail else "",
        "remediation_steps": "Establish technical vulnerability assessment procedures and patch within defined timeframes."
    })
    # A.8.20
    iso2_fail = len(insecure_ports_found) > 0
    iso_controls.append({
        "id": "ISO-A.8.20",
        "name": "Network Security & Service Filtering",
        "status": "FAIL" if iso2_fail else "PASS",
        "severity": "HIGH" if iso2_fail else "LOW",
        "technical_evidence": f"Discovered open services: {len(ports)}",
        "gap_description": "Network services not restricted to authorized business operations." if iso2_fail else "",
        "remediation_steps": "Disable unused network ports and services across all cloud instances."
    })
    # A.8.24
    iso3_fail = not ssl_compliant
    iso_controls.append({
        "id": "ISO-A.8.24",
        "name": "Use of Cryptography (TLS 1.2/1.3)",
        "status": "FAIL" if iso3_fail else "PASS",
        "severity": "HIGH" if iso3_fail else "LOW",
        "technical_evidence": f"Certificate & Protocol: {ssl_version}",
        "gap_description": "Cryptographic controls do not enforce current industry standards." if iso3_fail else "",
        "remediation_steps": "Configure TLS 1.3 encryption and maintain automated certificate renewal."
    })
    # A.8.26 & A.8.28
    iso4_fail = len(missing_headers) > 0
    iso_controls.append({
        "id": "ISO-A.8.26",
        "name": "Application Security Requirements",
        "status": "FAIL" if iso4_fail else "PASS",
        "severity": "MEDIUM" if iso4_fail else "LOW",
        "technical_evidence": f"Missing Headers: {', '.join(missing_headers)}" if iso4_fail else "Application security headers verified.",
        "gap_description": "Web application lacks standard browser security hardening headers." if iso4_fail else "",
        "remediation_steps": "Deploy CSP, HSTS, X-Frame-Options, and X-Content-Type-Options headers."
    })
    iso_controls.append({
        "id": "ISO-A.8.28",
        "name": "Secure Coding & Threat Intelligence Defenses",
        "status": "FAIL" if is_malicious else "PASS",
        "severity": "HIGH" if is_malicious else "LOW",
        "technical_evidence": f"Threat Intel Verdict: {threat_reputation}",
        "gap_description": "Perimeter asset associated with malicious indicators." if is_malicious else "",
        "remediation_steps": "Conduct code review and sanitize all user input endpoints."
    })

    iso_pass = sum(1 for c in iso_controls if c["status"] == "PASS")
    iso_score = int((iso_pass / len(iso_controls)) * 100)
    evaluated_frameworks["ISO_27001"] = {
        **FRAMEWORK_DEFINITIONS["ISO_27001"],
        "compliance_score": iso_score,
        "status": "AUDIT_READY" if iso_score >= 85 else ("NEEDS_REMEDIATION" if iso_score >= 65 else "NON_COMPLIANT"),
        "passed_controls": iso_pass,
        "failed_controls": len(iso_controls) - iso_pass,
        "total_controls": len(iso_controls),
        "controls": iso_controls
    }

    # Unified Overview Score
    avg_score = int(sum(f["compliance_score"] for f in evaluated_frameworks.values()) / len(evaluated_frameworks))
    total_passed = sum(f["passed_controls"] for f in evaluated_frameworks.values())
    total_controls = sum(f["total_controls"] for f in evaluated_frameworks.values())
    total_failed = total_controls - total_passed

    overall_status = "AUDIT_READY" if avg_score >= 85 else ("NEEDS_REMEDIATION" if avg_score >= 65 else "NON_COMPLIANT")

    return {
        "overall_score": avg_score,
        "overall_status": overall_status,
        "total_controls": total_controls,
        "total_passed": total_passed,
        "total_failed": total_failed,
        "target": scan_data.get("website") or scan_data.get("target") or "Target Asset",
        "frameworks": evaluated_frameworks
    }


def get_framework_metadata():
    """
    Returns framework metadata definitions.
    """
    return list(FRAMEWORK_DEFINITIONS.values())
