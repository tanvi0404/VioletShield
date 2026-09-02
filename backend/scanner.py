import socket
import time
import requests
import uuid
from datetime import datetime

from ssl_checker import check_ssl
from header_checker import check_headers
from vulnerability_scanner import check_exposed_files
from technology_detector import detect_technologies
from database.db import db
from database.models import Scan, Vulnerability, Report, User
from ai_analyzer import analyze_security


from report_generator import generate_report
from report_storage import save_report

from port_scanner import scan_ports
from port_analyzer import analyze_ports
from security_score import calculate_security_score, evaluate_detailed_risk_score
from browser_cookie_checker import check_browser_cookies

from cookie_analyzer import analyze_browser_cookies

from splunk_logger import send_to_splunk
from tools.gobuster_scanner import run_gobuster_scan
from tools.nikto_scanner import run_nikto_scan



def scan_website(url, user_id):

    clean_input = url.strip()
    if clean_input.startswith("https://") or clean_input.startswith("http://"):
        target_urls = [clean_input]
    else:
        target_urls = [f"https://{clean_input}", f"http://{clean_input}"]

    start = time.time()
    response = None
    final_url = target_urls[0]

    for candidate in target_urls:
        try:
            response = requests.get(
                candidate,
                timeout=12,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) VioletShield/2.0"},
                verify=False,
                allow_redirects=True
            )
            final_url = candidate
            break
        except Exception:
            continue

    if response is None:
        return {"error": f"Target host '{clean_input}' is unreachable or refused connection."}

    end = time.time()

    try:
        url = final_url

        # ================= DOMAIN =================
        domain = url.replace("https://", "").replace("http://", "").split("/")[0].split(":")[0]

        # ================= IP =================
        try:
            ip = socket.gethostbyname(domain)
        except Exception:
            ip = "127.0.0.1"

        # ================= HTTPS =================
        https = url.startswith("https")

        # ================= RESPONSE TIME =================
        response_time = f"{round((end - start) * 1000)} ms"

        # ================= SERVER =================
        server = response.headers.get("Server", "Unknown")

        # ================= PORT SCAN =================
        try:
            port_data = scan_ports(domain)
        except Exception:
            port_data = []
        print("PORTS:", port_data)

        port_analysis = analyze_ports(port_data)

        print("PORT ANALYSIS:", port_analysis)

        # ================= SSL =================
        ssl_data = check_ssl(domain)
        print("SSL:", ssl_data)

        # ================= HEADERS =================
        header_data = check_headers(response)
        print("HEADERS:", header_data)

        # ================= TECHNOLOGY =================
        technology_data = detect_technologies(url)
        print("TECHNOLOGIES:", technology_data)

        # ================= COOKIE SECURITY =================
        print("Collecting browser cookies...")
        browser_cookie_data = check_browser_cookies(url)
        print("RAW BROWSER COOKIES:", len(browser_cookie_data))

        cookie_data = analyze_browser_cookies(browser_cookie_data)
        print("FINAL COOKIE DATA:", cookie_data)

        # ================= VULNERABILITY =================
        vulnerability_data = check_exposed_files(domain)
        print("VULNERABILITIES:", vulnerability_data)

        # ================= AI ANALYSIS =================
        ai_data = analyze_security(
            {
                "ssl": ssl_data,
                "headers": header_data,
                "cookies": cookie_data,
                "vulnerabilities": vulnerability_data,
                "ports": port_analysis,
            }
        )
        print("AI ANALYSIS:", ai_data)

        # ================= SECURITY SCORE =================
        security_score = calculate_security_score(
            ssl_data,
            header_data,
            cookie_data,
            port_analysis,
            vulnerability_data,
            ai_data,
        )
        print("SECURITY SCORE:", security_score)

        # ================= SAFE USER RESOLUTION =================
        valid_user_id = None
        try:
            if user_id:
                u = User.query.get(int(user_id))
                if u:
                    valid_user_id = u.id
        except Exception:
            pass

        if not valid_user_id:
            first_user = User.query.first()
            if first_user:
                valid_user_id = first_user.id
            else:
                try:
                    default_user = User(
                        name="Security Auditor",
                        email="admin@violetshield.local",
                        password="system_placeholder_password"
                    )
                    db.session.add(default_user)
                    db.session.commit()
                    valid_user_id = default_user.id
                except Exception:
                    db.session.rollback()

        # ================= DATABASE SCAN SAVE =================
        scan_id_val = None
        if valid_user_id:
            try:
                new_scan = Scan(
                    user_id=valid_user_id,
                    website=domain,
                    ip=ip,
                    security_score=security_score,
                    risk=ai_data.get("risk", "Low"),
                )
                db.session.add(new_scan)
                db.session.commit()
                scan_id_val = new_scan.id
                print("SCAN SAVED ID:", scan_id_val)

                # ================= SAVE VULNERABILITIES =================
                for issue in ai_data.get("issues", []):
                    vulnerability = Vulnerability(
                        scan_id=new_scan.id,
                        title=issue.get("title"),
                        severity=issue.get("severity"),
                        description=issue.get("description"),
                    )
                    db.session.add(vulnerability)

                db.session.commit()
            except Exception as db_err:
                db.session.rollback()
                print("DB SAVE ERROR:", db_err)


        # ================= PHASE 7: GOBUSTER DIRECTORY ENUMERATION =================
        try:
            gobuster_data = run_gobuster_scan(url, threads=10, timeout=2.5, max_paths=25)
        except Exception as ge:
            print("GOBUSTER ERROR:", ge)
            gobuster_data = {"discovered_paths": []}

        # ================= PHASE 7: NIKTO MISCONFIGURATION SCAN =================
        try:
            nikto_data = run_nikto_scan(url, timeout=3.5)
        except Exception as ne:
            print("NIKTO ERROR:", ne)
            nikto_data = {"findings": [], "severity_counts": {}}

        # ================= PHASE 10: COMPOSITE AI RISK SCORING =================
        detailed_risk = evaluate_detailed_risk_score({
            "ssl": ssl_data,
            "headers": header_data,
            "cookies": cookie_data,
            "ports": port_data,
            "vulnerabilities": vulnerability_data,
            "ai_analysis": ai_data,
            "nikto": nikto_data,
            "gobuster": gobuster_data
        })
        security_score = detailed_risk.get("security_score", security_score)

        # ================= REPORT DATA =================
        scan_report_data = {
            "score": security_score,
            "website": {
                "domain": domain,
                "ip": ip,
                "https": https,
                "responseTime": response_time,
                "hosting": server,
            },
            "ssl": ssl_data,
            "headers": header_data,
            "cookies": cookie_data,
            "technologies": technology_data,
            "ports": port_data,
            "port_analysis": port_analysis,
            "vulnerabilities": vulnerability_data,
            "ai_analysis": ai_data,
            "gobuster": gobuster_data,
            "nikto": nikto_data,
            "risk_score_details": detailed_risk,
        }

        print("\n========== DATA BEFORE REPORT ==========")
        print(scan_report_data)
        print("========================================")


        # ================= REPORT =================
        report = generate_report(scan_report_data)
        report["scan_id"] = new_scan.id
        save_report(report)

        print("REPORT GENERATED:", report)

        # ================= SCAN METADATA =================
        scan_id = str(uuid.uuid4())
        created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        print("SCAN ID:", scan_id)
        print("CREATED AT:", created_at)

        # ================= SPLUNK LOGGING =================
        send_to_splunk(
            {
                "scan_id": scan_id,
                "created_at": created_at,
                "website": domain,
                "security_score": security_score,
                "risk": ai_data.get("risk", "Unknown"),
                "ssl_status": ssl_data.get("valid", False),
                "ssl": ssl_data,
                "headers": header_data,
                "cookies": cookie_data,
                "technologies": technology_data,
                "ports": port_data,
                "port_analysis": port_analysis,
                "ai_analysis": ai_data,
                "vulnerabilities": vulnerability_data,
            }
        )

        # ================= FRONTEND RESPONSE =================
        return {
            "score": security_score,
            "website": {
                "domain": domain,
                "ip": ip,
                "https": https,
                "responseTime": response_time,
                "hosting": server,
            },
            "ssl": ssl_data,
            "headers": header_data,
            "cookies": cookie_data,
            "technologies": technology_data,
            "ports": port_data,
            "port_analysis": port_analysis,
            "vulnerabilities": vulnerability_data,
            "ai_analysis": ai_data,
            "gobuster": gobuster_data,
            "nikto": nikto_data,
            "risk_score_details": detailed_risk,
            "report": report,
            "summary": {
                "status": "Completed",
                "risk": ai_data.get("risk", "Low"),
                "duration": response_time,
                "issues": len(ai_data.get("issues", [])),
            },
        }



    except Exception as e:
        print("SCAN ERROR:", e)
        return {"error": str(e)}


# Alias for backward compatibility
full_scan = scan_website