from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

import socket

from database.db import db
from database.models import Scan, Report, Vulnerability, User
from datetime import datetime, timedelta

from scanner import scan_website
from domain_intelligence import get_domain_information
from port_scanner import scan_ports
from port_analyzer import analyze_ports

from network_ai_analyzer import analyze_network_security
from tools.exploitdb_search import search_exploitdb
from technology_detector import detect_technologies
from security_headers import analyze_security_headers

from pdf_generator import generate_pdf
from ssl_checker import check_ssl
from security_score import evaluate_detailed_risk_score, calculate_security_score


from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from auth import auth, bcrypt
from tools.nmap_scanner import run_nmap_scan
from tools.threat_intel import (
    check_ip_reputation,
    check_domain_reputation,
    check_url_reputation,
    check_dns_blacklists,
    run_comprehensive_threat_intel
)

from tools.cve_scanner import search_cve, lookup_cve_by_id
from tools.gobuster_scanner import run_gobuster_scan
from tools.nikto_scanner import run_nikto_scan
from tools.file_analyzer import analyze_file, compute_file_hashes, query_virustotal_file_report
from werkzeug.utils import secure_filename
import tempfile
import os





app = Flask(__name__)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
app.config["JWT_SECRET_KEY"] = "violetshield_super_secure_secret_key_2026"

jwt = JWTManager(app)

bcrypt.init_app(app)

app.register_blueprint(auth)

# =========================
# DATABASE CONFIG
# =========================

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://postgres:shreya2682@localhost:5433/violetshield"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


db.init_app(app)

CORS(app)


# =========================
# HOME
# =========================


@app.route("/")
def home():

    return jsonify({"message": "VioletShield Backend Running"})


# =========================
# WEBSITE SCAN
# =========================


@app.route("/api/scan", methods=["POST"])
@jwt_required()
def scan():

    try:
        user_id = get_jwt_identity()

        data = request.json

        url = data.get("url")

        if not url:

            return jsonify({"error": "URL required"}), 400

        result = scan_website(url, user_id)

        domain = url.replace("https://", "").replace("http://", "").split("/")[0]

        ssl_report = check_ssl(domain)

        return jsonify({**result, "ssl_analysis": ssl_report})

    except Exception as e:

        return jsonify({"error": str(e)}), 500
    
#Test

@app.route("/api/exploit-search", methods=["POST"])
@jwt_required()
def exploit_search():

    data = request.json

    query = data.get("query")

    result = search_exploitdb(query)

    return jsonify(result)
# =========================
# REPORTS FETCH
# =========================


@app.route("/api/reports", methods=["GET"])
@jwt_required()
def get_reports():

    try:

        user_id = get_jwt_identity()

        reports = Report.query.join(Scan).filter(Scan.user_id == user_id).all()

        result = []

        for report in reports:

            result.append(
                {
                    "id": report.id,
                    "scan_id": report.scan_id,
                    "website": report.scan.website,
                    "security_score": report.scan.security_score,
                    "risk": report.scan.risk,
                    "created_at": report.created_at,
                }
            )

        return jsonify(result)

    except Exception as e:

        return jsonify({"error": str(e)}), 500



# =============================================================================
# PHASE 9: ADVANCED MULTI-VECTOR THREAT INTELLIGENCE SYSTEM
# =============================================================================

@app.route("/api/threat-intel", methods=["POST"])
@jwt_required()
def threat_intel():
    """
    Unified multi-vector threat intelligence route.
    Accepts IP, domain, or URL and dynamically analyzes reputation and risk.
    """
    try:
        data = request.json or {}
        target = data.get("ip") or data.get("domain") or data.get("url") or data.get("target") or data.get("query")

        if not target or not str(target).strip():
            return jsonify({"error": "Target parameter (IP, Domain, or URL) is required."}), 400

        clean_target = str(target).strip()
        result = run_comprehensive_threat_intel(clean_target)

        return jsonify({
            "target": clean_target,
            "ip": clean_target, # Backward compatibility
            "threat_data": result
        })

    except Exception as e:
        print("THREAT INTEL ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/threat-intel/ip", methods=["POST"])
@jwt_required()
def threat_intel_ip():
    """Analyzes IP reputation and queries live DNS Blacklists."""
    try:
        data = request.json or {}
        ip = data.get("ip") or data.get("target")

        if not ip:
            return jsonify({"error": "IP address is required."}), 400

        result = check_ip_reputation(ip)
        return jsonify({"target": ip, "type": "IP", "threat_data": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/threat-intel/domain", methods=["POST"])
@jwt_required()
def threat_intel_domain():
    """Performs deep domain reputation, category, and registrar audit."""
    try:
        data = request.json or {}
        domain = data.get("domain") or data.get("target")

        if not domain:
            return jsonify({"error": "Domain is required."}), 400

        result = check_domain_reputation(domain)
        return jsonify({"target": domain, "type": "DOMAIN", "threat_data": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/threat-intel/url", methods=["POST"])
@jwt_required()
def threat_intel_url():
    """Performs live malicious URL & phishing reputation scanning."""
    try:
        data = request.json or {}
        url = data.get("url") or data.get("target")

        if not url:
            return jsonify({"error": "URL is required."}), 400

        result = check_url_reputation(url)
        return jsonify({"target": url, "type": "URL", "threat_data": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/threat-intel/blacklists", methods=["POST"])
@jwt_required()
def threat_intel_blacklists():
    """Queries top DNS Blacklists (Spamhaus, Barracuda, SpamCop, SORBS)."""
    try:
        data = request.json or {}
        ip = data.get("ip") or data.get("target")

        if not ip:
            return jsonify({"error": "IPv4 address is required."}), 400

        result = check_dns_blacklists(ip)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@app.route("/api/dashboard", methods=["GET"])
@jwt_required()
def dashboard():

    user_id = get_jwt_identity()


    total_scans = Scan.query.filter_by(
        user_id=user_id
    ).count()



    average_score = db.session.query(
        db.func.avg(Scan.security_score)
    ).filter(
        Scan.user_id == user_id
    ).scalar()



    high = Scan.query.filter_by(
        user_id=user_id,
        risk="High"
    ).count()



    medium = Scan.query.filter_by(
        user_id=user_id,
        risk="Medium"
    ).count()



    low = Scan.query.filter_by(
        user_id=user_id,
        risk="Low"
    ).count()



    latest_scan = Scan.query.filter_by(
        user_id=user_id
    ).order_by(
        Scan.created_at.desc()
    ).first()



    # =========================
    # RECENT SCANS FOR GRAPH
    # =========================

    scans = Scan.query.filter_by(
        user_id=user_id
    ).order_by(
        Scan.created_at.desc()
    ).limit(10).all()



    reports = []


    for scan in scans:

        reports.append({

            "website": scan.website,

            "security_score": scan.security_score,

            "risk": scan.risk,

            "created_at": str(scan.created_at)

        })



    return jsonify({


        "total_scans": total_scans,


        "average_score":
        round(average_score)
        if average_score else 0,


        "high": high,


        "medium": medium,


        "low": low,


        "reports": reports,


        "latest_scan": {


            "website": latest_scan.website,


            "score": latest_scan.security_score,


            "risk": latest_scan.risk,


            "created_at": str(latest_scan.created_at)


        } if latest_scan else None


    })
# =========================
# USER SCANS
# =========================


@app.route("/api/my-scans", methods=["GET"])
@jwt_required()
def my_scans():

    user_id = get_jwt_identity()

    scans = Scan.query.filter_by(user_id=user_id).all()

    result = []

    for scan in scans:

        result.append(
            {
                "id": scan.id,
                "website": scan.website,
                "ip": scan.ip,
                "security_score": scan.security_score,
                "risk": scan.risk,
                "created_at": scan.created_at,
            }
        )

    return jsonify(result)


# =========================
# DASHBOARD STATS
# =========================


@app.route("/api/dashboard-stats", methods=["GET"])
def dashboard_stats():

    total_scans = Scan.query.count()

    average_score = db.session.query(db.func.avg(Scan.security_score)).scalar()

    high = Scan.query.filter_by(risk="High").count()

    medium = Scan.query.filter_by(risk="Medium").count()

    low = Scan.query.filter_by(risk="Low").count()

    return jsonify(
        {
            "total_scans": total_scans,
            "average_score": round(average_score) if average_score else 0,
            "high": high,
            "medium": medium,
            "low": low,
        }
    )


# =========================
# RECENT SCANS
# =========================


@app.route("/api/recent-scans", methods=["GET"])
def recent_scans():

    scans = Scan.query.order_by(Scan.created_at.desc()).limit(5).all()

    result = []

    for scan in scans:

        result.append(
            {
                "id": scan.id,
                "website": scan.website,
                "score": scan.security_score,
                "risk": scan.risk,
                "created_at": scan.created_at,
            }
        )

    return jsonify(result)


# =========================
# PDF REPORT DOWNLOAD
# =========================


@app.route("/api/report/<string:report_id>", methods=["GET"])
def download_report(report_id):

    try:
        report = None
        scan = None

        # Strategy 1: If numeric, search Report by primary key id
        if report_id.isdigit():
            rid = int(report_id)
            report = Report.query.get(rid)

            # Strategy 2: If not found, search Report by scan_id
            if not report:
                report = Report.query.filter_by(scan_id=rid).first()

            # Strategy 3: Check if it's a direct Scan id
            if not report:
                scan = Scan.query.get(rid)

        # Strategy 4: Fallback to most recent Report or Scan if not found
        if not report and not scan:
            report = Report.query.order_by(Report.id.desc()).first()
            if not report:
                scan = Scan.query.order_by(Scan.id.desc()).first()

        if not report and not scan:
            return jsonify({"error": "Report not found"}), 404

        target_scan = report.scan if report else scan
        target_id = report.id if report else target_scan.id

        # Retrieve vulnerabilities associated with this scan
        vulns = Vulnerability.query.filter_by(scan_id=target_scan.id).all() if target_scan else []
        vuln_list = [
            {
                "title": v.title,
                "severity": v.severity,
                "description": v.description
            }
            for v in vulns
        ]

        pdf_path = generate_pdf(
            {
                "id": str(target_id),
                "scan_id": target_scan.id if target_scan else 1,
                "website": target_scan.website if target_scan else "Target Domain",
                "score": target_scan.security_score if target_scan else 0,
                "risk": target_scan.risk if target_scan else "Low",
                "ip": (target_scan.ip if target_scan else None) or "N/A",
                "date": str(target_scan.created_at if target_scan else datetime.now()),
                "vulnerabilities": vuln_list
            }
        )

        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f"VioletShield_Report_{target_scan.website if target_scan else 'Audit'}.pdf"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500




# =========================
# NMAP ADVANCED SCAN
# =========================

@app.route("/api/nmap-scan", methods=["POST"])
@jwt_required()
def nmap_scan():

    try:

        data = request.json

        target = data.get("target")


        if not target:

            return jsonify({
                "error": "Target required"
            }), 400


        result = run_nmap_scan(target)



        # ==========================================
        # BANNER GRABBING & EXPLOITDB SEARCH
        # ==========================================

        for ip, host_data in result.items():

            if "services" not in host_data or not isinstance(host_data["services"], list):
                continue

            for service in host_data["services"]:

                if service.get("state") == "open":

                    # Banner grabbing
                    banner = grab_banner(
                        ip,
                        service["port"]
                    )
                    service["banner"] = banner

                    # ExploitDB / Searchsploit lookup
                    product = service.get("product", "").strip()
                    name = service.get("name", "").strip()
                    version = service.get("version", "").strip()

                    software = product if product else name
                    query = f"{software} {version}".strip()

                    if query:
                        exploit_res = search_exploitdb(query)
                        if isinstance(exploit_res, dict):
                            service["exploits"] = exploit_res.get("results", [])
                        elif isinstance(exploit_res, list):
                            service["exploits"] = exploit_res
                        else:
                            service["exploits"] = []

                        # ==========================================
                        # PHASE 6: CVE INTELLIGENCE INTEGRATION
                        # ==========================================
                        cve_res = search_cve(software, version)
                        service["cves"] = cve_res.get("cves", [])
                    else:
                        service["exploits"] = []
                        service["cves"] = []

                else:

                    service["banner"] = None
                    service["exploits"] = []
                    service["cves"] = []

        # =========================
        # THREAT INTELLIGENCE MERGE
        # =========================

        threat_results = {}

        for ip in result.keys():

            threat_results[ip] = check_ip_reputation(ip)
        print("THREAT RESULTS:", threat_results)

        # ==========================================
        # PHASE 5: AI VULNERABILITY ANALYSIS
        # ==========================================

        ai_analysis = analyze_vulnerabilities_ai({
            "target": target,
            "nmap_result": result,
            "threat_intelligence": threat_results
        })

        return jsonify({

            "target": target,

            "nmap_result": result,

            "threat_intelligence": threat_results,

            "ai_analysis": ai_analysis

        })


    except Exception as e:


        return jsonify({

            "error": str(e)

        }), 500


# ==========================================
# DEDICATED AI VULNERABILITY ANALYSIS ROUTE
# ==========================================

@app.route("/api/ai-analyze", methods=["POST"])
@jwt_required()
def ai_analyze_route():

    try:

        data = request.json or {}

        analysis = analyze_vulnerabilities_ai(data)

        return jsonify(analysis)

    except Exception as e:

        return jsonify({

            "error": str(e)

        }), 500


# ==========================================
# PHASE 6: DEDICATED CVE SEARCH ROUTE
# ==========================================

@app.route("/api/cve-search", methods=["POST"])
@jwt_required()
def cve_search_route():

    try:

        data = request.json or {}

        cve_id = data.get("cve_id", "").strip()
        query = data.get("query", "").strip()
        product = data.get("product", "").strip()
        version = data.get("version", "").strip()

        if cve_id:
            result = lookup_cve_by_id(cve_id)
        elif product or version:
            result = search_cve(product, version)
        elif query:
            if query.upper().startswith("CVE-"):
                result = lookup_cve_by_id(query)
            else:
                result = search_cve(query, "")
        else:
            return jsonify({
                "error": "Search query or CVE-ID required"
            }), 400

        return jsonify(result)

    except Exception as e:

        return jsonify({

            "error": str(e)

        }), 500


# =========================
# NETWORK SECURITY SCANNER
# =========================


@app.route("/api/network-scan", methods=["POST"])
def network_scan():

    try:

        data = request.json

        domain = data.get("domain")

        if not domain:

            return jsonify({"error": "Domain required"}), 400
        try:
            domain_info = get_domain_information(domain)

        except Exception as e:
            print("WHOIS ERROR:", e)
            domain_info = {}


        # =========================
        # DOMAIN VALIDATION
        # =========================

        try:

            ip = socket.gethostbyname(domain)

            print("Scanning IP:", ip)

        except Exception:

            return jsonify({"error": "Invalid domain"}), 400

        # =========================
        # PORT SCAN
        # =========================

        ports = scan_ports(domain)

        print("PORTS:", ports)

        # =========================
        # PORT ANALYSIS
        # =========================

        port_analysis = analyze_ports(ports)

        print("PORT ANALYSIS:", port_analysis)

        # =========================
        # TECHNOLOGY DETECTION
        # =========================

        url = domain

        if not url.startswith("http"):

            url = "https://" + url

        technologies = detect_technologies(url)

        print("TECHNOLOGIES:", technologies)

        # =========================
        # SECURITY HEADERS
        # =========================

        security_headers = analyze_security_headers(url)

        print("SECURITY HEADERS:", security_headers)

        # =========================
        # AI NETWORK ANALYSIS
        # =========================

        network_ai_report = analyze_network_security(port_analysis)

        print("AI REPORT:", network_ai_report)

        return jsonify(
            {
                "domain": domain,
                "ip": ip,
                "domain_information": domain_info,
                "ports": ports,
                "port_analysis": port_analysis,
                "technologies": technologies,
                "security_headers": security_headers,
                "network_ai_report": network_ai_report,
            }
        )

    except Exception as e:

        print("NETWORK SCAN ERROR:", str(e))

        return jsonify({"error": str(e)}), 500


# =============================================================================
# PHASE 7: ADVANCED WEB VULNERABILITY SCANNER (GOBUSTER + NIKTO / OWASP)
# =============================================================================

@app.route("/api/advanced-web-scan", methods=["POST"])
@jwt_required()
def advanced_web_scan():
    """
    Executes a comprehensive web vulnerability assessment including
    directory enumeration (Gobuster) and server misconfigurations (Nikto).
    """
    try:
        data = request.json or {}
        target = data.get("url") or data.get("target") or data.get("domain")

        if not target or not str(target).strip():
            return jsonify({"error": "Target URL or domain is required"}), 400

        target_url = str(target).strip()
        threads = int(data.get("threads", 15))
        scan_mode = data.get("scan_mode", "full")
        custom_wordlist = data.get("wordlist")

        gobuster_data = None
        nikto_data = None

        if scan_mode in ["full", "dirs", "gobuster"]:
            gobuster_data = run_gobuster_scan(
                target_url,
                wordlist=custom_wordlist,
                threads=threads,
                timeout=4
            )

        if scan_mode in ["full", "misconfig", "nikto"]:
            nikto_data = run_nikto_scan(target_url, timeout=5)

        # Synthesize executive findings
        total_dirs = len(gobuster_data.get("discovered_paths", [])) if gobuster_data else 0
        nikto_findings = nikto_data.get("findings", []) if nikto_data else []
        total_misconfig = nikto_data.get("total_findings", len(nikto_findings)) if nikto_data else 0
        severity_counts = nikto_data.get("severity_counts", {
            "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0
        }) if nikto_data else {}

        risk_rating = nikto_data.get("risk_rating", "LOW") if nikto_data else "LOW"
        if total_dirs > 5 and risk_rating == "LOW":
            risk_rating = "MEDIUM"

        return jsonify({
            "target": target_url,
            "scan_mode": scan_mode,
            "risk_rating": risk_rating,
            "total_directories_discovered": total_dirs,
            "total_misconfigurations": total_misconfig,
            "severity_counts": severity_counts,
            "gobuster": gobuster_data,
            "nikto": nikto_data
        })


    except Exception as e:
        print("ADVANCED WEB SCAN ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/dir-scan", methods=["POST"])
@jwt_required()
def dir_scan():
    """Executes standalone directory enumeration using Gobuster."""
    try:
        data = request.json or {}
        target = data.get("url") or data.get("target")

        if not target:
            return jsonify({"error": "Target URL is required"}), 400

        threads = int(data.get("threads", 15))
        custom_wordlist = data.get("wordlist")

        result = run_gobuster_scan(
            target,
            wordlist=custom_wordlist,
            threads=threads,
            timeout=4
        )
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/nikto-scan", methods=["POST"])
@jwt_required()
def nikto_scan():
    """Executes standalone Nikto / OWASP web misconfiguration audit."""
    try:
        data = request.json or {}
        target = data.get("url") or data.get("target")

        if not target:
            return jsonify({"error": "Target URL is required"}), 400

        result = run_nikto_scan(target, timeout=5)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# PHASE 8: MALWARE & FILE ANALYSIS (HASHES, ENTROPY & VIRUSTOTAL)
# =============================================================================

@app.route("/api/file-scan", methods=["POST"])
@app.route("/api/analyze-file", methods=["POST"])
@jwt_required()
def file_scan():
    """
    Accepts uploaded file for secure malware and metadata inspection.
    Computes cryptographic hashes (SHA-256/MD5/SHA-1), entropy, and queries VirusTotal.
    """
    temp_file_path = None
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded. Please attach a file in the 'file' form-data field."}), 400

        file_obj = request.files["file"]

        if file_obj.filename == "" or not file_obj.filename:
            return jsonify({"error": "Selected file has an empty filename."}), 400

        safe_name = secure_filename(file_obj.filename)
        if not safe_name:
            safe_name = "analyzed_artifact.bin"

        # Create isolated temporary file for analysis
        suffix = os.path.splitext(safe_name)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            temp_file_path = tmp.name
            file_obj.save(temp_file_path)

        # Enforce size constraint (32 MB maximum)
        file_size = os.path.getsize(temp_file_path)
        if file_size > 32 * 1024 * 1024:
            return jsonify({"error": "File size exceeds the 32MB maximum upload limit."}), 400

        # Perform analysis
        analysis_result = analyze_file(temp_file_path, original_filename=safe_name)

        return jsonify(analysis_result)

    except Exception as e:
        print("FILE ANALYSIS ERROR:", str(e))
        return jsonify({"error": f"File analysis failed: {str(e)}"}), 500

    finally:
        # Guarantee temporary file cleanup
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass


@app.route("/api/hash-lookup", methods=["POST"])
@jwt_required()
def hash_lookup():
    """
    Directly queries VirusTotal file reputation database by hash (SHA-256, MD5, or SHA-1)
    without requiring a file upload.
    """
    try:
        data = request.json or {}
        file_hash = data.get("hash") or data.get("query")

        if not file_hash or not str(file_hash).strip():
            return jsonify({"error": "A valid cryptographic file hash (SHA-256, MD5, or SHA-1) is required."}), 400

        clean_hash = str(file_hash).strip()
        vt_report = query_virustotal_file_report(clean_hash, timeout=10)

        # Calculate threat score
        malicious = vt_report.get("stats", {}).get("malicious", 0)
        suspicious = vt_report.get("stats", {}).get("suspicious", 0)
        total_engines = vt_report.get("total_engines", 0) or 70

        threat_score = min(malicious * 5 + suspicious * 3, 100)
        if malicious >= 5 or threat_score >= 70:
            severity = "CRITICAL"
            risk_label = "Confirmed Malicious Artifact"
        elif malicious > 0 or threat_score >= 40:
            severity = "HIGH"
            risk_label = "High Threat Potential"
        elif suspicious > 0 or threat_score >= 15:
            severity = "MEDIUM"
            risk_label = "Suspicious / Anomalous Hash"
        elif vt_report.get("status") == "NOT_FOUND":
            severity = "LOW"
            risk_label = "Hash Unknown / Unseen in VirusTotal"
        else:
            severity = "CLEAN"
            risk_label = "Clean / No Malicious Indicators"

        return jsonify({
            "hash": clean_hash,
            "virustotal": vt_report,
            "security_assessment": {
                "severity": severity,
                "risk_label": risk_label,
                "threat_score": threat_score,
                "detection_ratio": f"{malicious}/{total_engines}"
            }
        })

    except Exception as e:
        print("HASH LOOKUP ERROR:", str(e))
        return jsonify({"error": f"Hash lookup failed: {str(e)}"}), 500


# =============================================================================
# PHASE 10: AI RISK SCORING ENGINE (COMPOSITE SCORING, PILLARS & REMEDIATION ROI)
# =============================================================================


@app.route("/api/risk-score", methods=["POST"])
@app.route("/api/calculate-risk", methods=["POST"])
@jwt_required()
def calculate_risk_endpoint():
    """
    Computes a composite security risk evaluation (0-100 score, letter grade,
    4-pillar breakdown, main reasons, and points recovery recommendations).
    """
    try:
        data = request.json or {}
        assessment = evaluate_detailed_risk_score(data)
        return jsonify(assessment)

    except Exception as e:
        print("RISK ENGINE ERROR:", str(e))
        return jsonify({"error": f"Risk assessment failed: {str(e)}"}), 500


# =========================
# START SERVER
# =========================





if __name__ == "__main__":

    with app.app_context():

        db.create_all()

    app.run(debug=True, host="127.0.0.1", port=5000)
