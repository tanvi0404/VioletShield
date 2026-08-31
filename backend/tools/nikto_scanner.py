import os
import time
import requests
from urllib.parse import urljoin, urlparse

def audit_http_methods(base_url, timeout=5):
    """Audits allowed HTTP verbs on the server for dangerous methods like TRACE, PUT, DELETE."""
    findings = []
    try:
        resp = requests.options(base_url, timeout=timeout, verify=False)
        allow_header = resp.headers.get("Allow", "") or resp.headers.get("Access-Control-Allow-Methods", "")
        
        methods = [m.strip().upper() for m in allow_header.split(",") if m.strip()]
        
        if "TRACE" in methods:
            findings.append({
                "title": "HTTP TRACE Method Enabled (Cross-Site Tracing Risk)",
                "severity": "MEDIUM",
                "category": "HTTP Methods",
                "evidence": f"Allow: {allow_header}",
                "description": "The HTTP TRACE method is enabled. Attackers can leverage XST (Cross-Site Tracing) in combination with Cross-Site Scripting to extract HttpOnly cookies and credentials.",
                "remediation": "Disable the TRACE method in your web server configuration (e.g., 'TraceEnable off' in Apache or 'proxy_hide_header' in Nginx)."
            })
            
        if "PUT" in methods or "DELETE" in methods:
            findings.append({
                "title": "Arbitrary File Modification Methods Allowed (PUT / DELETE)",
                "severity": "HIGH",
                "category": "HTTP Methods",
                "evidence": f"Allow: {allow_header}",
                "description": "Web server advertises support for HTTP PUT or DELETE verbs on public endpoints.",
                "remediation": "Disable HTTP PUT and DELETE methods unless strictly required and secured by authentication tokens."
            })
    except Exception:
        pass
        
    return findings


def audit_security_headers(headers):
    """Evaluates presence and configuration of OWASP-recommended security headers."""
    findings = []
    
    # 1. Content Security Policy
    if "Content-Security-Policy" not in headers:
        findings.append({
            "title": "Missing Content-Security-Policy (CSP) Header",
            "severity": "HIGH",
            "category": "Defensive Headers",
            "evidence": "Header not present in HTTP response",
            "description": "Content Security Policy (CSP) is absent. CSP provides defense-in-depth against Cross-Site Scripting (XSS), data injection, and malicious asset loading.",
            "remediation": "Configure a strict Content-Security-Policy header (e.g., default-src 'self'; script-src 'self'; object-src 'none')."
        })

    # 2. Strict-Transport-Security (HSTS)
    if "Strict-Transport-Security" not in headers:
        findings.append({
            "title": "Missing HTTP Strict Transport Security (HSTS)",
            "severity": "MEDIUM",
            "category": "Defensive Headers",
            "evidence": "Header not present in HTTP response",
            "description": "HTTP Strict Transport Security (HSTS) is missing. Users connecting to the service may be vulnerable to SSL stripping and man-in-the-middle downgrade attacks.",
            "remediation": "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' to all HTTPS responses."
        })

    # 3. X-Frame-Options (Clickjacking)
    if "X-Frame-Options" not in headers and "frame-ancestors" not in headers.get("Content-Security-Policy", ""):
        findings.append({
            "title": "Missing Clickjacking Defense (X-Frame-Options)",
            "severity": "MEDIUM",
            "category": "Defensive Headers",
            "evidence": "Header not present in HTTP response",
            "description": "The web application allows itself to be embedded in an <iframe> or <frame> on third-party sites, exposing users to UI redressing (Clickjacking) attacks.",
            "remediation": "Add 'X-Frame-Options: SAMEORIGIN' or 'X-Frame-Options: DENY' header."
        })

    # 4. X-Content-Type-Options
    if headers.get("X-Content-Type-Options", "").lower() != "nosniff":
        findings.append({
            "title": "Missing or Weak X-Content-Type-Options",
            "severity": "LOW",
            "category": "Defensive Headers",
            "evidence": f"X-Content-Type-Options: {headers.get('X-Content-Type-Options', 'MISSING')}",
            "description": "MIME-sniffing protection is not enforced. Browsers may execute non-executable files disguised as images or scripts.",
            "remediation": "Configure 'X-Content-Type-Options: nosniff' header."
        })

    # 5. Referrer-Policy
    if "Referrer-Policy" not in headers:
        findings.append({
            "title": "Missing Referrer-Policy Header",
            "severity": "LOW",
            "category": "Information Disclosure",
            "evidence": "Header not present in HTTP response",
            "description": "Referrer-Policy header is absent. Sensitive query parameters or URL paths may be leaked to external referrers in outbound links.",
            "remediation": "Add 'Referrer-Policy: strict-origin-when-cross-origin' or 'no-referrer'."
        })

    # 6. Information Leakage in Server / X-Powered-By
    server_header = headers.get("Server", "")
    if server_header and any(char.isdigit() for char in server_header):
        findings.append({
            "title": f"Detailed Server Version Disclosure: '{server_header}'",
            "severity": "LOW",
            "category": "Information Disclosure",
            "evidence": f"Server: {server_header}",
            "description": "The web server broadcasts exact software and version information, simplifying automated exploit discovery and CVE reconnaissance.",
            "remediation": "Disable server signature tokens in configuration (e.g. 'ServerTokens Prod' in Apache or 'server_tokens off' in Nginx)."
        })

    if "X-Powered-By" in headers or "X-AspNet-Version" in headers:
        tech_val = headers.get("X-Powered-By") or headers.get("X-AspNet-Version")
        findings.append({
            "title": f"Framework Header Disclosure: '{tech_val}'",
            "severity": "LOW",
            "category": "Information Disclosure",
            "evidence": f"X-Powered-By: {tech_val}",
            "description": "Underlying technology stack and runtime framework version is disclosed in HTTP response headers.",
            "remediation": "Remove the X-Powered-By header from the application framework or reverse proxy configuration."
        })

    return findings


def audit_cors_policy(base_url, timeout=5):
    """Tests CORS policy with arbitrary Origin headers."""
    findings = []
    attacker_origin = "https://violetshield-audit-test.local"
    try:
        resp = requests.get(
            base_url,
            headers={"Origin": attacker_origin, "User-Agent": "Mozilla/5.0"},
            timeout=timeout,
            verify=False
        )
        acao = resp.headers.get("Access-Control-Allow-Origin", "")
        acac = resp.headers.get("Access-Control-Allow-Credentials", "").lower()
        
        if acao == "*" and acac == "true":
            findings.append({
                "title": "Critical CORS Misconfiguration (Wildcard with Credentials)",
                "severity": "CRITICAL",
                "category": "CORS Security",
                "evidence": f"Access-Control-Allow-Origin: * | Access-Control-Allow-Credentials: true",
                "description": "The server permits wildcard origin access while allowing credential transmission. This allows malicious websites to steal authenticated user data.",
                "remediation": "Explicitly whitelist trusted origins instead of using wildcard '*' when credentials are required."
            })
        elif acao == attacker_origin:
            findings.append({
                "title": "Insecure CORS Policy (Arbitrary Origin Reflection)",
                "severity": "HIGH",
                "category": "CORS Security",
                "evidence": f"Reflected Origin: {acao}",
                "description": "The server dynamically reflects any supplied Origin header back into Access-Control-Allow-Origin without domain validation.",
                "remediation": "Validate the Origin header against a strict server-side whitelist before echoing it in Access-Control-Allow-Origin."
            })
    except Exception:
        pass
        
    return findings


def audit_sensitive_endpoints(base_url, timeout=4):
    """Probes for critical configuration leaks, VCS metadata, and server debug artifacts."""
    findings = []
    probes = [
        {
            "path": "/.git/HEAD",
            "title": "Publicly Exposed Git Source Repository (/.git/HEAD)",
            "severity": "CRITICAL",
            "category": "Information Exposure",
            "validation": lambda r: r.status_code == 200 and "ref: refs/" in r.text,
            "description": "Source code repository metadata is publicly readable. Attackers can clone the entire codebase, secrets, and commit history.",
            "remediation": "Block access to .git directories at the web server / reverse proxy layer."
        },
        {
            "path": "/.env",
            "title": "Exposed Environment Configuration File (/.env)",
            "severity": "CRITICAL",
            "category": "Credential Leakage",
            "validation": lambda r: r.status_code == 200 and any(k in r.text for k in ["DB_", "API_", "SECRET", "PASSWORD", "KEY="]),
            "description": "An environment (.env) configuration file is publicly downloadable, exposing database credentials, API keys, and system secrets.",
            "remediation": "Move .env files outside of the web root document directory and restrict public access."
        },
        {
            "path": "/robots.txt",
            "title": "Robots.txt Information Disclosure",
            "severity": "INFO",
            "category": "Reconnaissance",
            "validation": lambda r: r.status_code == 200 and "Disallow:" in r.text,
            "description": "A robots.txt file exists and discloses restricted directory paths and internal administrative locations.",
            "remediation": "Ensure sensitive administrative portals are protected by strong authentication rather than relying on robots.txt obscurity."
        },
        {
            "path": "/phpinfo.php",
            "title": "Exposed PHP Info Debug Script (/phpinfo.php)",
            "severity": "HIGH",
            "category": "Information Disclosure",
            "validation": lambda r: r.status_code == 200 and "PHP Version" in r.text,
            "description": "A phpinfo() diagnostic page is publicly accessible, leaking full PHP configuration, environment variables, and module versions.",
            "remediation": "Delete diagnostic scripts (phpinfo.php, test.php) from production environments immediately."
        },
        {
            "path": "/crossdomain.xml",
            "title": "Permissive Flash/Silverlight Crossdomain Policy",
            "severity": "MEDIUM",
            "category": "Cross-Domain Security",
            "validation": lambda r: r.status_code == 200 and '<allow-access-from domain="*"' in r.text,
            "description": "A crossdomain.xml file allows wildcard domain access ('*'), permitting cross-domain data reading.",
            "remediation": "Restrict crossdomain.xml domain permissions or remove the file if legacy Flash clients are not supported."
        }
    ]

    for p in probes:
        try:
            target = urljoin(base_url.rstrip("/") + "/", p["path"].lstrip("/"))
            resp = requests.get(
                target,
                timeout=timeout,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) VioletShield-Nikto/2.0"},
                verify=False,
                allow_redirects=False
            )
            if p["validation"](resp):
                findings.append({
                    "title": p["title"],
                    "severity": p["severity"],
                    "category": p["category"],
                    "evidence": f"HTTP {resp.status_code} at {p['path']}",
                    "description": p["description"],
                    "remediation": p["remediation"],
                    "path": p["path"]
                })
        except Exception:
            pass

    return findings


def audit_cookie_security(cookies):
    """Inspects cookie flags for security attributes."""
    findings = []
    if not cookies:
        return findings

    for c in cookies:
        c_name = c.get("name", "Unknown")
        is_secure = c.get("secure", False)
        is_httponly = c.get("httpOnly", False) or c.get("httponly", False)
        same_site = str(c.get("sameSite", "None")).lower()

        if not is_httponly:
            findings.append({
                "title": f"Cookie '{c_name}' Missing HttpOnly Flag",
                "severity": "MEDIUM",
                "category": "Cookie Security",
                "evidence": f"Cookie: {c_name}",
                "description": f"The cookie '{c_name}' does not have the HttpOnly flag enabled. If a Cross-Site Scripting (XSS) vulnerability exists, attackers can read this cookie via document.cookie.",
                "remediation": f"Configure 'HttpOnly' attribute on cookie '{c_name}'."
            })

        if not is_secure:
            findings.append({
                "title": f"Cookie '{c_name}' Missing Secure Flag",
                "severity": "MEDIUM",
                "category": "Cookie Security",
                "evidence": f"Cookie: {c_name}",
                "description": f"The cookie '{c_name}' does not specify the Secure flag and can be transmitted across unencrypted HTTP channels.",
                "remediation": f"Set the 'Secure' attribute on cookie '{c_name}'."
            })

        if same_site in ["none", ""]:
            findings.append({
                "title": f"Cookie '{c_name}' Missing SameSite Protection",
                "severity": "LOW",
                "category": "Cookie Security",
                "evidence": f"SameSite: {same_site}",
                "description": f"The cookie '{c_name}' does not configure SameSite=Lax or SameSite=Strict, increasing exposure to Cross-Site Request Forgery (CSRF).",
                "remediation": f"Set 'SameSite=Lax' or 'SameSite=Strict' on cookie '{c_name}'."
            })

    return findings


def run_nikto_scan(target_url, timeout=6):
    """
    Executes a comprehensive Nikto / OWASP web server misconfiguration audit.
    
    Args:
        target_url (str): The target URL or hostname.
        timeout (int): Timeout per check.
        
    Returns:
        dict: Complete structured findings and web security posture metrics.
    """
    if not target_url or not str(target_url).strip():
        return {
            "error": "Target URL is required",
            "target": "",
            "total_findings": 0,
            "findings": []
        }

    raw_target = str(target_url).strip()
    if not raw_target.startswith("http://") and not raw_target.startswith("https://"):
        raw_target = f"https://{raw_target}"

    start_time = time.time()
    findings = []
    server_banner = "Unknown"
    final_url = raw_target

    try:
        resp = requests.get(
            raw_target,
            timeout=timeout,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) VioletShield-Nikto/2.0"},
            verify=False,
            allow_redirects=True
        )
        final_url = resp.url
        server_banner = resp.headers.get("Server", "Unknown")

        # 1. Audit Security Headers
        findings.extend(audit_security_headers(resp.headers))

        # 2. Audit HTTP Verbs
        findings.extend(audit_http_methods(final_url, timeout=timeout))

        # 3. Audit CORS Policy
        findings.extend(audit_cors_policy(final_url, timeout=timeout))

        # 4. Audit Sensitive Files & Directories
        findings.extend(audit_sensitive_endpoints(final_url, timeout=timeout))

        # 5. Audit Cookie Security
        if resp.cookies:
            cookie_dicts = [
                {"name": c.name, "secure": c.secure, "httpOnly": c.has_nonstandard_attr("HttpOnly"), "sameSite": "Lax"}
                for c in resp.cookies
            ]
            findings.extend(audit_cookie_security(cookie_dicts))

    except Exception as e:
        # Fallback to HTTP if HTTPS failed
        if raw_target.startswith("https://"):
            http_alt = raw_target.replace("https://", "http://", 1)
            try:
                resp = requests.get(
                    http_alt,
                    timeout=timeout,
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) VioletShield-Nikto/2.0"},
                    verify=False
                )
                final_url = resp.url
                server_banner = resp.headers.get("Server", "Unknown")
                findings.extend(audit_security_headers(resp.headers))
                findings.extend(audit_http_methods(final_url, timeout=timeout))
                findings.extend(audit_cors_policy(final_url, timeout=timeout))
                findings.extend(audit_sensitive_endpoints(final_url, timeout=timeout))
            except Exception as e2:
                return {
                    "target": raw_target,
                    "error": f"Failed to connect to target: {str(e2)}",
                    "total_findings": 0,
                    "findings": [],
                    "severity_counts": {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0},
                    "risk_rating": "UNKNOWN"
                }
        else:
            return {
                "target": raw_target,
                "error": f"Failed to connect to target: {str(e)}",
                "total_findings": 0,
                "findings": [],
                "severity_counts": {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0},
                "risk_rating": "UNKNOWN"
            }


    # Calculate severity stats
    severity_order = {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 3, "LOW": 4, "INFO": 5}
    findings.sort(key=lambda x: severity_order.get(x.get("severity", "LOW"), 99))

    severity_counts = {
        "critical": sum(1 for f in findings if f.get("severity") == "CRITICAL"),
        "high": sum(1 for f in findings if f.get("severity") == "HIGH"),
        "medium": sum(1 for f in findings if f.get("severity") == "MEDIUM"),
        "low": sum(1 for f in findings if f.get("severity") == "LOW"),
        "info": sum(1 for f in findings if f.get("severity") == "INFO")
    }

    # Posture rating
    if severity_counts["critical"] > 0 or severity_counts["high"] >= 2:
        risk_rating = "CRITICAL"
    elif severity_counts["high"] > 0 or severity_counts["medium"] >= 3:
        risk_rating = "HIGH"
    elif severity_counts["medium"] > 0:
        risk_rating = "MEDIUM"
    else:
        risk_rating = "LOW"

    duration_sec = round(time.time() - start_time, 2)

    return {
        "target": final_url,
        "server_banner": server_banner,
        "risk_rating": risk_rating,
        "duration_sec": duration_sec,
        "total_findings": len(findings),
        "severity_counts": severity_counts,
        "findings": findings
    }
