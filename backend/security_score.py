from tools.risk_engine import compute_composite_risk_score

def calculate_security_score(
    ssl=None,
    headers=None,
    cookies=None,
    ports=None,
    vulnerabilities=None,
    ai_analysis=None,
    cves=None,
    exploits=None,
    threat_intel=None,
    nikto=None,
    gobuster=None,
    **kwargs
):
    """
    Phase 10: AI Risk Scoring Engine integration.
    
    Computes a composite security score (0 to 100) across 4 weighted pillars:
      1. Network & Service Exposure (25 pts)
      2. Vulnerabilities, CVEs & ExploitDB PoCs (35 pts)
      3. Web Application & Cryptography Hardening (25 pts)
      4. Threat Intelligence & Reputation (15 pts)
      
    Maintains 100% backward compatibility with all existing scan routes and returns an integer score.
    """
    scan_data = {
        "ssl": ssl or {},
        "headers": headers or {},
        "cookies": cookies or {},
        "ports": ports or [],
        "vulnerabilities": vulnerabilities or [],
        "ai_analysis": ai_analysis or {},
        "cves": cves or [],
        "exploits": exploits or [],
        "threat_intel": threat_intel or {},
        "nikto": nikto or {},
        "gobuster": gobuster or {}
    }
    
    # Merge any additional kwargs
    scan_data.update(kwargs)

    result = compute_composite_risk_score(scan_data)
    return int(result["security_score"])


def evaluate_detailed_risk_score(scan_data):
    """
    Returns the complete Phase 10 structured risk assessment including:
      - security_score (0-100)
      - grade (A+, A, B, C, D, F)
      - risk_level (Critical, High, Medium, Low)
      - pillars breakdown
      - main_reasons
      - priority_remediations
    """
    return compute_composite_risk_score(scan_data)