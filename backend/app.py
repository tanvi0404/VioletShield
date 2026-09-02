from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

import socket
import time

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
from tools.report_engine import (
    generate_pdf_report,
    generate_json_report,
    generate_html_report,
    build_unified_report_model
)



from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from auth import auth, bcrypt, log_audit_event, role_required
from database.models import (
    User, Scan, Vulnerability, Report, Organization, OrganizationMember,
    AuditLog, ScheduledScan, NotificationChannel, SecurityAlert,
    EnterpriseIntegration, IncidentTicket
)
from tools.alert_engine import (
    dispatch_security_alert, calculate_scan_delta,
    send_slack_alert, send_discord_alert, send_teams_alert,
    send_generic_webhook, send_email_alert
)
from tools.scheduler_service import init_scheduler, execute_scheduled_scan_job
from tools.siem_connector import (
    send_to_splunk_hec, send_to_elasticsearch, send_to_generic_siem,
    dispatch_siem_telemetry_async
)
from tools.ticketing_connector import (
    create_jira_issue, create_servicenow_incident, test_connector_connection
)
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
from tools.iac_scanner import scan_iac_snippet, scan_iac_file, get_supported_rules
from tools.compliance_engine import evaluate_scan_compliance, get_framework_metadata
from tools.patch_generator import generate_remediation_patch, get_preconfigured_remediation_catalog
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
    try:
        user_id = get_jwt_identity()

        total_scans = Scan.query.filter_by(user_id=user_id).count()

        average_score = db.session.query(
            db.func.avg(Scan.security_score)
        ).filter(
            Scan.user_id == user_id
        ).scalar()

        high = Scan.query.filter_by(user_id=user_id, risk="High").count()
        medium = Scan.query.filter_by(user_id=user_id, risk="Medium").count()
        low = Scan.query.filter_by(user_id=user_id, risk="Low").count()

        latest_scan = Scan.query.filter_by(user_id=user_id).order_by(Scan.created_at.desc()).first()

        # Attack Surface & Unique Hosts
        unique_hosts_count = db.session.query(db.func.count(db.func.distinct(Scan.website))).filter(Scan.user_id == user_id).scalar() or 0
        ssl_compliant_count = Scan.query.filter(Scan.user_id == user_id, Scan.website.ilike("https%")).count()
        ssl_compliance_rate = round((ssl_compliant_count / total_scans * 100)) if total_scans > 0 else 100

        # Vulnerabilities Aggregation
        total_vulns = db.session.query(db.func.count(Vulnerability.id)).join(Scan).filter(Scan.user_id == user_id).scalar() or 0
        vuln_high = db.session.query(db.func.count(Vulnerability.id)).join(Scan).filter(Scan.user_id == user_id, Vulnerability.severity.in_(["High", "Critical", "HIGH", "CRITICAL"])).scalar() or 0
        vuln_med = db.session.query(db.func.count(Vulnerability.id)).join(Scan).filter(Scan.user_id == user_id, Vulnerability.severity.in_(["Medium", "MEDIUM"])).scalar() or 0
        vuln_low = db.session.query(db.func.count(Vulnerability.id)).join(Scan).filter(Scan.user_id == user_id, Vulnerability.severity.in_(["Low", "LOW"])).scalar() or 0

        # Recent Scans History (up to 15)
        scans = Scan.query.filter_by(user_id=user_id).order_by(Scan.created_at.desc()).limit(15).all()

        reports = []
        scan_history = []
        for scan in scans:
            item = {
                "id": scan.id,
                "website": scan.website,
                "ip": scan.ip or "N/A",
                "security_score": scan.security_score,
                "risk": scan.risk,
                "ssl_status": "https" in str(scan.website).lower(),
                "created_at": str(scan.created_at)
            }
            reports.append(item)
            scan_history.append(item)


        return jsonify({
            "total_scans": total_scans,
            "average_score": round(average_score) if average_score else 0,
            "high": high,
            "medium": medium,
            "low": low,
            "reports": reports,
            "scan_history": scan_history,
            "attack_surface": {
                "unique_hosts": unique_hosts_count,
                "total_scanned_assets": total_scans,
                "ssl_compliant_hosts": ssl_compliant_count,
                "ssl_compliance_rate": ssl_compliance_rate,
                "total_vulnerabilities": total_vulns,
                "vulnerability_distribution": {
                    "critical_high": vuln_high,
                    "medium": vuln_med,
                    "low": vuln_low
                }
            },
            "latest_scan": {
                "id": latest_scan.id,
                "website": latest_scan.website,
                "score": latest_scan.security_score,
                "risk": latest_scan.risk,
                "created_at": str(latest_scan.created_at)
            } if latest_scan else None
        })

    except Exception as e:
        print("DASHBOARD STATS ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

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


# =============================================================================
# PHASE 11: AUTOMATED MULTI-FORMAT SECURITY REPORT GENERATION (PDF / JSON / HTML)
# =============================================================================

def _resolve_report_target(report_id):
    """Helper to locate Scan and Report records safely."""
    report = None
    scan = None

    if str(report_id).isdigit():
        rid = int(report_id)
        report = Report.query.get(rid)
        if not report:
            report = Report.query.filter_by(scan_id=rid).first()
        if not report:
            scan = Scan.query.get(rid)

    if not report and not scan:
        report = Report.query.order_by(Report.id.desc()).first()
        if not report:
            scan = Scan.query.order_by(Scan.id.desc()).first()

    return report, scan


@app.route("/api/report/<string:report_id>", methods=["GET"])
@app.route("/api/report/<string:report_id>/pdf", methods=["GET"])
def download_report(report_id):
    """
    Downloads or exports the security penetration test report in PDF, JSON, or HTML.
    Supports query param ?format=pdf|json|html (defaults to PDF).
    """
    try:
        export_format = request.args.get("format", "pdf").lower()
        report, scan = _resolve_report_target(report_id)

        if not report and not scan:
            return jsonify({"error": "Report not found"}), 404

        target_scan = report.scan if report else scan
        target_id = report.id if report else target_scan.id

        vulns = Vulnerability.query.filter_by(scan_id=target_scan.id).all() if target_scan else []
        vuln_list = [
            {"title": v.title, "severity": v.severity, "description": v.description}
            for v in vulns
        ]

        report_payload = {
            "id": str(target_id),
            "scan_id": target_scan.id if target_scan else 1,
            "website": target_scan.website if target_scan else "Target Domain",
            "score": target_scan.security_score if target_scan else 0,
            "risk": target_scan.risk if target_scan else "Low",
            "ip": (target_scan.ip if target_scan else None) or "N/A",
            "date": str(target_scan.created_at if target_scan else datetime.now()),
            "vulnerabilities": vuln_list
        }

        if export_format == "json" or request.path.endswith("/json"):
            return jsonify(generate_json_report(report_payload))

        elif export_format == "html" or request.path.endswith("/html"):
            html_content = generate_html_report(report_payload)
            from flask import Response
            return Response(html_content, mimetype="text/html")

        # Default PDF
        pdf_path = generate_pdf_report(report_payload)
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f"VioletShield_Report_{target_scan.website if target_scan else 'Audit'}.pdf"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/report/<string:report_id>/json", methods=["GET"])
def download_report_json(report_id):
    """Direct JSON export of security report."""
    report, scan = _resolve_report_target(report_id)
    if not report and not scan:
        return jsonify({"error": "Report not found"}), 404

    target_scan = report.scan if report else scan
    vulns = Vulnerability.query.filter_by(scan_id=target_scan.id).all() if target_scan else []
    report_payload = {
        "id": str(report.id if report else target_scan.id),
        "scan_id": target_scan.id if target_scan else 1,
        "website": target_scan.website if target_scan else "Target Domain",
        "score": target_scan.security_score if target_scan else 0,
        "risk": target_scan.risk if target_scan else "Low",
        "ip": (target_scan.ip if target_scan else None) or "N/A",
        "date": str(target_scan.created_at if target_scan else datetime.now()),
        "vulnerabilities": [{"title": v.title, "severity": v.severity, "description": v.description} for v in vulns]
    }
    return jsonify(generate_json_report(report_payload))


@app.route("/api/report/<string:report_id>/html", methods=["GET"])
def download_report_html(report_id):
    """Direct standalone HTML view of security report."""
    report, scan = _resolve_report_target(report_id)
    if not report and not scan:
        return jsonify({"error": "Report not found"}), 404

    target_scan = report.scan if report else scan
    vulns = Vulnerability.query.filter_by(scan_id=target_scan.id).all() if target_scan else []
    report_payload = {
        "id": str(report.id if report else target_scan.id),
        "scan_id": target_scan.id if target_scan else 1,
        "website": target_scan.website if target_scan else "Target Domain",
        "score": target_scan.security_score if target_scan else 0,
        "risk": target_scan.risk if target_scan else "Low",
        "ip": (target_scan.ip if target_scan else None) or "N/A",
        "date": str(target_scan.created_at if target_scan else datetime.now()),
        "vulnerabilities": [{"title": v.title, "severity": v.severity, "description": v.description} for v in vulns]
    }
    html_content = generate_html_report(report_payload)
    from flask import Response
    return Response(html_content, mimetype="text/html")


@app.route("/api/report/export", methods=["POST"])
@jwt_required()
def export_custom_report():
    """
    On-demand multi-format report exporter from arbitrary scan data payloads.
    """
    try:
        data = request.json or {}
        export_format = data.get("format", "json").lower()

        if export_format == "html":
            html_content = generate_html_report(data)
            from flask import Response
            return Response(html_content, mimetype="text/html")
        elif export_format == "pdf":
            pdf_path = generate_pdf_report(data)
            return send_file(pdf_path, as_attachment=True, download_name="VioletShield_Custom_Report.pdf")
        else:
            return jsonify(generate_json_report(data))

    except Exception as e:
        return jsonify({"error": f"Export failed: {str(e)}"}), 500





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


# =============================================================================
# PHASE 13: USER PROFILE, ORGANIZATION WORKSPACES & AUDIT LOGGING
# =============================================================================

@app.route("/api/user/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    """Returns profile details, role, clearance, and workspaces for the active user."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id)) if str(user_id).isdigit() else None
        if not user:
            return jsonify({"error": "User not found"}), 404

        orgs = []
        for mem in user.organization_memberships:
            orgs.append({
                "id": mem.organization.id,
                "name": mem.organization.name,
                "slug": mem.organization.slug,
                "member_role": mem.role,
                "joined_at": str(mem.joined_at)
            })

        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role or "ADMIN",
            "created_at": str(user.created_at),
            "organizations": orgs
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/user/profile", methods=["PUT"])
@jwt_required()
def update_user_profile():
    """Updates user name and/or password."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id)) if str(user_id).isdigit() else None
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.json or {}
        new_name = data.get("name")
        new_password = data.get("password")

        if new_name and str(new_name).strip():
            user.name = str(new_name).strip()

        if new_password and str(new_password).strip():
            user.password = bcrypt.generate_password_hash(str(new_password).strip()).decode("utf-8")

        db.session.commit()

        log_audit_event(
            user_id=user.id,
            action="PROFILE_UPDATED",
            target=user.email,
            details="User profile settings modified successfully"
        )

        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/organizations", methods=["GET"])
@jwt_required()
def get_user_organizations():
    """Retrieves all organizations the current user belongs to."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id)) if str(user_id).isdigit() else None
        if not user:
            return jsonify({"error": "User not found"}), 404

        orgs = []
        for mem in user.organization_memberships:
            members_count = OrganizationMember.query.filter_by(organization_id=mem.organization_id).count()
            orgs.append({
                "id": mem.organization.id,
                "name": mem.organization.name,
                "slug": mem.organization.slug,
                "member_role": mem.role,
                "members_count": members_count,
                "created_at": str(mem.organization.created_at)
            })

        return jsonify(orgs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/organizations", methods=["POST"])
@jwt_required()
def create_organization():
    """Creates a new organization and assigns the user as OWNER."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id)) if str(user_id).isdigit() else None
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.json or {}
        org_name = data.get("name")
        if not org_name or not str(org_name).strip():
            return jsonify({"error": "Organization name is required"}), 400

        import re
        clean_name = str(org_name).strip()
        slug_base = re.sub(r'[^a-z0-9]', '', clean_name.lower()) or "soc"
        slug = f"{slug_base}-{int(datetime.utcnow().timestamp())}"

        new_org = Organization(name=clean_name, slug=slug)
        db.session.add(new_org)
        db.session.commit()

        membership = OrganizationMember(
            user_id=user.id,
            organization_id=new_org.id,
            role="OWNER"
        )
        db.session.add(membership)
        db.session.commit()

        log_audit_event(
            user_id=user.id,
            action="ORGANIZATION_CREATED",
            target=clean_name,
            details=f"Created workspace '{clean_name}' (ID #{new_org.id})",
            org_id=new_org.id
        )

        return jsonify({
            "message": "Organization created successfully",
            "organization": {
                "id": new_org.id,
                "name": new_org.name,
                "slug": new_org.slug,
                "member_role": "OWNER"
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/organizations/<int:org_id>/members", methods=["GET"])
@jwt_required()
def get_organization_members(org_id):
    """Retrieves all members for an organization."""
    try:
        user_id = get_jwt_identity()
        # Verify user is a member of this organization
        is_member = OrganizationMember.query.filter_by(user_id=user_id, organization_id=org_id).first()
        if not is_member:
            return jsonify({"error": "Access denied to organization members list"}), 403

        members = OrganizationMember.query.filter_by(organization_id=org_id).all()
        result = []
        for m in members:
            result.append({
                "id": m.id,
                "user_id": m.user.id,
                "name": m.user.name,
                "email": m.user.email,
                "role": m.role,
                "joined_at": str(m.joined_at)
            })

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/organizations/<int:org_id>/members", methods=["POST"])
@jwt_required()
def invite_organization_member(org_id):
    """Invites or assigns a user to an organization."""
    try:
        user_id = get_jwt_identity()
        admin_mem = OrganizationMember.query.filter_by(user_id=user_id, organization_id=org_id).first()
        if not admin_mem or admin_mem.role not in ["OWNER", "ADMIN"]:
            return jsonify({"error": "Only Organization Owners and Admins can invite new members"}), 403

        data = request.json or {}
        email = data.get("email", "").strip().lower()
        role = data.get("role", "ANALYST").upper()
        if role not in ["ADMIN", "ANALYST", "VIEWER"]:
            role = "ANALYST"

        if not email:
            return jsonify({"error": "User email is required"}), 400

        target_user = User.query.filter_by(email=email).first()
        if not target_user:
            # Auto-provision invitation account placeholder
            temp_pwd = bcrypt.generate_password_hash("WelcomeToVioletShield2026!").decode("utf-8")
            target_user = User(name=email.split("@")[0].title(), email=email, password=temp_pwd, role=role)
            db.session.add(target_user)
            db.session.commit()

        # Check if already a member
        existing = OrganizationMember.query.filter_by(user_id=target_user.id, organization_id=org_id).first()
        if existing:
            existing.role = role
            db.session.commit()
            return jsonify({"message": f"Updated role for {email} to {role}"})

        new_membership = OrganizationMember(user_id=target_user.id, organization_id=org_id, role=role)
        db.session.add(new_membership)
        db.session.commit()

        log_audit_event(
            user_id=int(user_id),
            action="MEMBER_INVITED",
            target=email,
            details=f"Invited {email} as {role} to Org #{org_id}",
            org_id=org_id
        )

        return jsonify({
            "message": f"Member {email} added successfully as {role}",
            "member": {
                "id": new_membership.id,
                "name": target_user.name,
                "email": target_user.email,
                "role": role
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/organizations/<int:org_id>/members/<int:member_id>", methods=["DELETE"])
@jwt_required()
def remove_organization_member(org_id, member_id):
    """Removes a member from an organization."""
    try:
        user_id = get_jwt_identity()
        admin_mem = OrganizationMember.query.filter_by(user_id=user_id, organization_id=org_id).first()
        if not admin_mem or admin_mem.role not in ["OWNER", "ADMIN"]:
            return jsonify({"error": "Admin privileges required"}), 403

        mem = OrganizationMember.query.get(member_id)
        if not mem or mem.organization_id != org_id:
            return jsonify({"error": "Member not found"}), 404

        if mem.role == "OWNER":
            return jsonify({"error": "Cannot remove the workspace OWNER"}), 400

        target_email = mem.user.email if mem.user else "User"
        db.session.delete(mem)
        db.session.commit()

        log_audit_event(
            user_id=int(user_id),
            action="MEMBER_REMOVED",
            target=target_email,
            details=f"Removed {target_email} from Org #{org_id}",
            org_id=org_id
        )

        return jsonify({"message": "Member removed successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/audit-logs", methods=["GET"])
@jwt_required()
def get_audit_logs():
    """Retrieves user and organization security audit logs."""
    try:
        user_id = get_jwt_identity()
        logs = AuditLog.query.filter(
            (AuditLog.user_id == user_id) | (AuditLog.user_id == None)
        ).order_by(AuditLog.timestamp.desc()).limit(30).all()

        result = []
        for l in logs:
            result.append({
                "id": l.id,
                "action": l.action,
                "target": l.target or "-",
                "ip_address": l.ip_address or "127.0.0.1",
                "details": l.details or "",
                "timestamp": str(l.timestamp)
            })

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# PHASE 14: CONTINUOUS MONITORING, SCAN SCHEDULES & WEBHOOK ALERTING
# =============================================================================

@app.route("/api/schedules", methods=["GET"])
@jwt_required()
def get_schedules():
    """Returns all registered recurring scan schedules for the user."""
    try:
        user_id = get_jwt_identity()
        schedules = ScheduledScan.query.filter_by(user_id=user_id).order_by(ScheduledScan.created_at.desc()).all()
        result = []
        for s in schedules:
            result.append({
                "id": s.id,
                "target": s.target,
                "scan_type": s.scan_type,
                "frequency": s.frequency,
                "is_active": s.is_active,
                "last_run": str(s.last_run) if s.last_run else None,
                "next_run": str(s.next_run) if s.next_run else None,
                "last_score": s.last_score,
                "last_risk": s.last_risk,
                "created_at": str(s.created_at)
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/schedules", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "ANALYST"])
def create_schedule():
    """Creates a new recurring automated scan schedule."""
    try:
        user_id = get_jwt_identity()
        data = request.json or {}
        target = data.get("target")
        scan_type = data.get("scan_type", "FULL").upper()
        frequency = data.get("frequency", "DAILY").upper()

        if not target:
            return jsonify({"error": "Target domain or IP is required"}), 400

        from datetime import timedelta
        next_run = datetime.utcnow()
        if frequency == "HOURLY":
            next_run += timedelta(hours=1)
        elif frequency == "WEEKLY":
            next_run += timedelta(days=7)
        elif frequency == "MONTHLY":
            next_run += timedelta(days=30)
        else: # DAILY
            next_run += timedelta(days=1)

        schedule = ScheduledScan(
            user_id=user_id,
            target=target.strip(),
            scan_type=scan_type,
            frequency=frequency,
            is_active=True,
            next_run=next_run
        )
        db.session.add(schedule)
        db.session.commit()

        log_audit_event(
            user_id=int(user_id),
            action="SCHEDULE_CREATED",
            target=target,
            details=f"Configured {frequency} automated scan for {target}"
        )

        return jsonify({
            "message": f"Continuous monitoring schedule created for {target}",
            "schedule": {
                "id": schedule.id,
                "target": schedule.target,
                "frequency": schedule.frequency,
                "scan_type": schedule.scan_type,
                "next_run": str(schedule.next_run)
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/schedules/<int:sched_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "ANALYST"])
def delete_schedule(sched_id):
    """Deletes an existing scan schedule."""
    try:
        user_id = get_jwt_identity()
        schedule = ScheduledScan.query.get(sched_id)
        if not schedule or str(schedule.user_id) != str(user_id):
            return jsonify({"error": "Schedule not found"}), 404

        target = schedule.target
        db.session.delete(schedule)
        db.session.commit()

        log_audit_event(
            user_id=int(user_id),
            action="SCHEDULE_DELETED",
            target=target,
            details=f"Deleted monitoring schedule for {target}"
        )

        return jsonify({"message": f"Schedule for {target} removed successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/schedules/<int:sched_id>/run", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "ANALYST"])
def run_schedule_now(sched_id):
    """Manually triggers an immediate execution of a scheduled scan job."""
    try:
        user_id = get_jwt_identity()
        schedule = ScheduledScan.query.get(sched_id)
        if not schedule or str(schedule.user_id) != str(user_id):
            return jsonify({"error": "Schedule not found"}), 404

        # Execute scan in background job
        execute_scheduled_scan_job(app, sched_id)

        log_audit_event(
            user_id=int(user_id),
            action="SCHEDULE_MANUAL_TRIGGER",
            target=schedule.target,
            details=f"Manually triggered immediate scheduled scan for {schedule.target}"
        )

        return jsonify({"message": f"Scheduled scan for {schedule.target} executed successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/notification-channels", methods=["GET"])
@jwt_required()
def get_notification_channels():
    """Retrieves all configured notification webhooks & email channels."""
    try:
        user_id = get_jwt_identity()
        channels = NotificationChannel.query.filter_by(user_id=user_id).order_by(NotificationChannel.created_at.desc()).all()
        result = []
        for ch in channels:
            result.append({
                "id": ch.id,
                "name": ch.name,
                "channel_type": ch.channel_type,
                "destination": ch.destination,
                "min_severity": ch.min_severity,
                "is_active": ch.is_active,
                "created_at": str(ch.created_at)
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/notification-channels", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "ANALYST"])
def create_notification_channel():
    """Configures a new notification webhook channel."""
    try:
        user_id = get_jwt_identity()
        data = request.json or {}
        name = data.get("name")
        channel_type = (data.get("channel_type") or "SLACK").upper()
        destination = data.get("destination")
        min_severity = (data.get("min_severity") or "MEDIUM").upper()

        if not name or not destination:
            return jsonify({"error": "Channel name and destination webhook URL/email are required"}), 400

        ch = NotificationChannel(
            user_id=user_id,
            name=name.strip(),
            channel_type=channel_type,
            destination=destination.strip(),
            min_severity=min_severity,
            is_active=True
        )
        db.session.add(ch)
        db.session.commit()

        log_audit_event(
            user_id=int(user_id),
            action="NOTIFICATION_CHANNEL_CREATED",
            target=name,
            details=f"Configured {channel_type} alert channel ({min_severity}+ threshold)"
        )

        return jsonify({
            "message": f"Notification channel '{name}' configured successfully",
            "channel": {
                "id": ch.id,
                "name": ch.name,
                "channel_type": ch.channel_type,
                "destination": ch.destination,
                "min_severity": ch.min_severity
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/notification-channels/test", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "ANALYST"])
def test_notification_channel():
    """Dispatches a test notification payload to verify webhook integration."""
    try:
        data = request.json or {}
        channel_type = (data.get("channel_type") or "SLACK").upper()
        destination = data.get("destination")

        if not destination:
            return jsonify({"error": "Destination URL / Email is required"}), 400

        test_alert = {
            "target": "target.corp.local",
            "severity": "HIGH",
            "title": "VioletShield Webhook Connection Test",
            "description": "This is a verified test alert dispatched from VioletShield Continuous Monitoring.",
            "delta_summary": "Test connection established successfully. All alert channels operational."
        }

        success = False
        if channel_type == "SLACK":
            success = send_slack_alert(destination, test_alert)
        elif channel_type == "DISCORD":
            success = send_discord_alert(destination, test_alert)
        elif channel_type == "TEAMS":
            success = send_teams_alert(destination, test_alert)
        elif channel_type == "EMAIL":
            success = send_email_alert({}, destination, test_alert)
        else:
            success = send_generic_webhook(destination, test_alert)

        return jsonify({
            "success": success,
            "message": f"Test alert dispatched to {channel_type} destination ({destination})"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/notification-channels/<int:channel_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "ANALYST"])
def delete_notification_channel(channel_id):
    """Deletes a notification channel."""
    try:
        user_id = get_jwt_identity()
        ch = NotificationChannel.query.get(channel_id)
        if not ch or str(ch.user_id) != str(user_id):
            return jsonify({"error": "Channel not found"}), 404

        name = ch.name
        db.session.delete(ch)
        db.session.commit()

        log_audit_event(
            user_id=int(user_id),
            action="NOTIFICATION_CHANNEL_DELETED",
            target=name,
            details=f"Deleted notification channel '{name}'"
        )

        return jsonify({"message": f"Channel '{name}' removed successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/alerts", methods=["GET"])
@jwt_required()
def get_security_alerts():
    """Retrieves all triggered security alerts and delta breach records."""
    try:
        user_id = get_jwt_identity()
        alerts = SecurityAlert.query.filter(
            (SecurityAlert.user_id == user_id) | (SecurityAlert.user_id == None)
        ).order_by(SecurityAlert.timestamp.desc()).limit(40).all()

        result = []
        for a in alerts:
            result.append({
                "id": a.id,
                "target": a.target,
                "severity": a.severity,
                "title": a.title,
                "description": a.description or "",
                "delta_summary": a.delta_summary or "",
                "status": a.status,
                "timestamp": str(a.timestamp)
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# PHASE 15: CLOUD INFRASTRUCTURE & IAC SECURITY SCANNER
# =============================================================================

@app.route("/api/iac-scan/snippet", methods=["POST"])
@jwt_required()
def scan_iac_code_snippet():
    """Performs static CIS compliance analysis on an IaC code snippet."""
    try:
        data = request.json or {}
        code = data.get("code", "")
        format_type = data.get("format", "terraform")

        if not code.strip():
            return jsonify({"error": "IaC code snippet cannot be empty"}), 400

        result = scan_iac_snippet(code, format_type)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/iac-scan", methods=["POST"])
@app.route("/api/cloud-scan", methods=["POST"])
@jwt_required()
def scan_iac_uploaded_file():
    """Handles uploaded Terraform, Kubernetes, Dockerfile, or CloudFormation files."""
    try:
        user_id = get_jwt_identity()
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded in form data (key 'file' required)"}), 400

        file = request.files["file"]
        if not file or file.filename == "":
            return jsonify({"error": "Empty filename provided"}), 400

        filename = secure_filename(file.filename)
        allowed_extensions = {".tf", ".tfvars", ".yaml", ".yml", ".json", ".dockerfile"}
        ext = os.path.splitext(filename)[1].lower()

        if ext not in allowed_extensions and "dockerfile" not in filename.lower():
            return jsonify({"error": f"Unsupported file type '{ext}'. Allowed: .tf, .yaml, .yml, .json, Dockerfile"}), 400

        # Save to sandbox temp directory and scan safely
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = os.path.join(temp_dir, filename)
            file.save(temp_path)

            scan_results = scan_iac_file(temp_path, original_filename=filename)

            log_audit_event(
                user_id=int(user_id),
                action="IAC_SCAN_EXECUTED",
                target=filename,
                details=f"Audited {filename} - Score: {scan_results.get('compliance_score')}%, Status: {scan_results.get('status')}"
            )

            return jsonify(scan_results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/iac-scan/rules", methods=["GET"])
@jwt_required()
def get_iac_security_rules():
    """Returns the CIS & OWASP cloud infrastructure ruleset."""
    try:
        rules = get_supported_rules()
        return jsonify(rules)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# PHASE 16: REGULATORY COMPLIANCE & FRAMEWORK MAPPING
# =============================================================================

@app.route("/api/compliance/<int:scan_id>", methods=["GET"])
@jwt_required()
def get_scan_compliance(scan_id):
    """Evaluates regulatory framework compliance (PCI-DSS, HIPAA, SOC 2, ISO 27001) for a scan."""
    try:
        scan = Scan.query.get(scan_id)
        if not scan:
            return jsonify({"error": "Scan record not found"}), 404

        # Reconstruct scan telemetry model
        vulns_list = [{"title": v.title, "severity": v.severity, "description": v.description} for v in scan.vulnerabilities]
        scan_telemetry = {
            "website": scan.website,
            "ip": scan.ip,
            "security_score": scan.security_score,
            "risk": scan.risk,
            "vulnerabilities": vulns_list,
            "ports": [],
            "ssl": {"valid": True, "protocol": "TLSv1.3"},
            "headers": {},
            "threat_intel": {"reputation": "CLEAN"}
        }

        compliance_report = evaluate_scan_compliance(scan_telemetry)
        return jsonify(compliance_report)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/compliance/evaluate", methods=["POST"])
@jwt_required()
def evaluate_custom_compliance():
    """Evaluates regulatory compliance for an arbitrary scan telemetry payload."""
    try:
        user_id = get_jwt_identity()
        data = request.json or {}
        compliance_report = evaluate_scan_compliance(data)

        target = data.get("website") or data.get("target") or "Target Asset"
        log_audit_event(
            user_id=int(user_id),
            action="COMPLIANCE_AUDIT_EVALUATED",
            target=target,
            details=f"Evaluated regulatory compliance for {target} - Overall Score: {compliance_report.get('overall_score')}% ({compliance_report.get('overall_status')})"
        )

        return jsonify(compliance_report)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/compliance/frameworks", methods=["GET"])
@jwt_required()
def get_compliance_framework_list():
    """Returns definitions and control requirements for supported regulatory frameworks."""
    try:
        frameworks = get_framework_metadata()
        return jsonify(frameworks)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# PHASE 17: AUTOMATED REMEDIATION & SECURITY PATCH GENERATOR
# =============================================================================

@app.route("/api/generate-patch", methods=["POST"])
@jwt_required()
def generate_vulnerability_patch():
    """Generates an actionable code diff, configuration block, or shell script for remediation."""
    try:
        user_id = get_jwt_identity()
        data = request.json or {}

        if not data.get("title") and not data.get("cve_id") and not data.get("description"):
            return jsonify({"error": "Vulnerability title, CVE ID, or description is required"}), 400

        patch_payload = generate_remediation_patch(data)

        log_audit_event(
            user_id=int(user_id),
            action="SECURITY_PATCH_GENERATED",
            target=data.get("cve_id") or data.get("title") or "Vulnerability",
            details=f"Generated {patch_payload.get('patch_type')} remediation ({patch_payload.get('download_filename')})"
        )

        return jsonify(patch_payload)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/remediation-catalog", methods=["GET"])
@jwt_required()
def get_remediation_catalog():
    """Returns curated production-ready patch templates from the knowledgebase."""
    try:
        catalog = get_preconfigured_remediation_catalog()
        return jsonify(catalog)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# PHASE 18: ENTERPRISE SIEM & INCIDENT TICKETING INTEGRATIONS
# =============================================================================

@app.route("/api/integrations", methods=["GET"])
@jwt_required()
def get_enterprise_integrations():
    """Returns all configured SIEM and ticketing connectors."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        org_id = user.organization_memberships[0].organization_id if (user and user.organization_memberships) else None
        
        query = EnterpriseIntegration.query
        if org_id:
            query = query.filter((EnterpriseIntegration.organization_id == org_id) | (EnterpriseIntegration.user_id == user.id))
        else:
            query = query.filter_by(user_id=int(user_id))
            
        integrations = query.order_by(EnterpriseIntegration.created_at.desc()).all()
        return jsonify([{
            "id": i.id,
            "name": i.name,
            "type": i.type,
            "endpoint_url": i.endpoint_url,
            "project_or_index": i.project_or_index,
            "auth_username": i.auth_username,
            "min_severity_threshold": i.min_severity_threshold,
            "auto_forward": i.auto_forward,
            "is_active": i.is_active,
            "created_at": i.created_at.isoformat() if i.created_at else None
        } for i in integrations])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/integrations", methods=["POST"])
@jwt_required()
def save_enterprise_integration():
    """Creates or updates an enterprise SIEM or ticketing connector."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        org_id = user.organization_memberships[0].organization_id if (user and user.organization_memberships) else None
        data = request.json or {}

        if not data.get("name") or not data.get("endpoint_url") or not data.get("type"):
            return jsonify({"error": "Name, type, and endpoint_url are required"}), 400

        integ_id = data.get("id")
        if integ_id:
            integ = EnterpriseIntegration.query.get(integ_id)
            if not integ:
                return jsonify({"error": "Integration not found"}), 404
        else:
            integ = EnterpriseIntegration(
                user_id=int(user_id),
                organization_id=org_id
            )
            db.session.add(integ)

        integ.name = data.get("name")

        integ.type = data.get("type").upper()
        integ.endpoint_url = data.get("endpoint_url")
        if data.get("api_token_or_key"):
            integ.api_token_or_key = data.get("api_token_or_key")
        integ.project_or_index = data.get("project_or_index")
        integ.auth_username = data.get("auth_username")
        integ.min_severity_threshold = data.get("min_severity_threshold", "HIGH")
        integ.auto_forward = bool(data.get("auto_forward", True))
        integ.is_active = bool(data.get("is_active", True))

        db.session.commit()

        log_audit_event(
            user_id=int(user_id),
            action="INTEGRATION_SAVED",
            target=integ.name,
            details=f"Configured {integ.type} connector ({integ.endpoint_url})"
        )

        return jsonify({"message": "Integration saved successfully", "id": integ.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/integrations/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_enterprise_integration(id):
    """Removes an enterprise connector."""
    try:
        user_id = get_jwt_identity()
        integ = EnterpriseIntegration.query.get(id)
        if not integ:
            return jsonify({"error": "Integration not found"}), 404

        name = integ.name
        db.session.delete(integ)
        db.session.commit()

        log_audit_event(
            user_id=int(user_id),
            action="INTEGRATION_DELETED",
            target=name,
            details=f"Deleted connector ID #{id}"
        )

        return jsonify({"message": "Integration deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/integrations/test", methods=["POST"])
@jwt_required()
def test_integration_endpoint():
    """Tests connection to a SIEM or Ticketing endpoint."""
    try:
        data = request.json or {}
        result = test_connector_connection(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/integrations/forward-scan", methods=["POST"])
@jwt_required()
def forward_scan_to_siem():
    """Manually or automatically broadcasts a scan's findings to all active SIEM connectors."""
    try:
        user_id = get_jwt_identity()
        data = request.json or {}
        scan_id = data.get("scan_id")
        
        scan_payload = data.get("scan_data")
        if scan_id and not scan_payload:
            scan = Scan.query.get(scan_id)
            if scan:
                scan_payload = {
                    "scan_id": scan.id,
                    "target": scan.website,
                    "ip": scan.ip,
                    "security_score": scan.security_score,
                    "risk": scan.risk,
                    "vulnerabilities": [{"title": v.title, "severity": v.severity, "description": v.description} for v in scan.vulnerabilities]
                }

        if not scan_payload:
            return jsonify({"error": "Scan telemetry data required"}), 400

        # Load active SIEM connectors
        integrations = EnterpriseIntegration.query.filter(
            EnterpriseIntegration.type.in_(["SPLUNK_HEC", "ELASTICSEARCH", "GENERIC_SIEM"]),
            EnterpriseIntegration.is_active == True
        ).all()

        integ_dicts = [{
            "type": i.type,
            "endpoint_url": i.endpoint_url,
            "api_token_or_key": i.api_token_or_key,
            "project_or_index": i.project_or_index,
            "auto_forward": i.auto_forward,
            "is_active": i.is_active
        } for i in integrations]

        dispatch_siem_telemetry_async(scan_payload, integ_dicts)

        return jsonify({
            "message": f"Dispatched scan telemetry to {len(integ_dicts)} SIEM connectors asynchronously",
            "connectors_count": len(integ_dicts)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/integrations/create-ticket", methods=["POST"])
@jwt_required()
def create_incident_ticket_endpoint():
    """Creates a Jira issue or ServiceNow incident from a vulnerability finding."""
    try:
        user_id = get_jwt_identity()
        data = request.json or {}
        integration_id = data.get("integration_id")
        finding = data.get("finding") or {}

        if not finding.get("title") and not finding.get("cve_id"):
            return jsonify({"error": "Finding title or CVE is required"}), 400

        integ = None
        if integration_id:
            integ = EnterpriseIntegration.query.get(integration_id)
        else:
            # Pick first active ticketing connector
            integ = EnterpriseIntegration.query.filter(
                EnterpriseIntegration.type.in_(["JIRA", "SERVICENOW"]),
                EnterpriseIntegration.is_active == True
            ).first()

        if not integ:
            # Fallback mock creation if no remote integration configured yet
            ticket_key = f"SEC-{int(time.time()) % 10000}"
            ticket = IncidentTicket(
                integration_id=None,
                ticket_key=ticket_key,
                ticket_url=f"https://jira.corp.internal/browse/{ticket_key}",
                title=finding.get("title", "Security Vulnerability"),
                severity=finding.get("severity", "HIGH"),
                target=finding.get("target", "Target Asset"),
                cve_id=finding.get("cve_id"),
                status="OPEN"
            )
            db.session.add(ticket)
            db.session.commit()
            return jsonify({
                "message": "Created incident ticket in SOC workspace",
                "ticket_key": ticket.ticket_key,
                "ticket_url": ticket.ticket_url
            })

        # Remote execution based on connector type
        res = None
        if integ.type == "JIRA":
            res = create_jira_issue(
                integ.endpoint_url,
                integ.auth_username,
                integ.api_token_or_key,
                integ.project_or_index or "SEC",
                finding
            )
        elif integ.type == "SERVICENOW":
            res = create_servicenow_incident(
                integ.endpoint_url,
                integ.auth_username,
                integ.api_token_or_key,
                finding
            )

        if res and res.get("success"):
            ticket = IncidentTicket(
                integration_id=integ.id,
                ticket_key=res.get("ticket_key"),
                ticket_url=res.get("ticket_url"),
                title=finding.get("title", "Security Finding"),
                severity=finding.get("severity", "HIGH"),
                target=finding.get("target"),
                cve_id=finding.get("cve_id"),
                status="OPEN"
            )
            db.session.add(ticket)
            db.session.commit()
            return jsonify({
                "message": f"Created incident ticket {ticket.ticket_key}",
                "ticket_key": ticket.ticket_key,
                "ticket_url": ticket.ticket_url
            })
        else:
            return jsonify({"error": res.get("error") if res else "Failed to dispatch ticket"}), 500

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/integrations/tickets", methods=["GET"])
@jwt_required()
def get_incident_tickets_feed():
    """Retrieves all logged incident tickets."""
    try:
        tickets = IncidentTicket.query.order_by(IncidentTicket.created_at.desc()).limit(100).all()
        return jsonify([{
            "id": t.id,
            "ticket_key": t.ticket_key,
            "ticket_url": t.ticket_url,
            "title": t.title,
            "severity": t.severity,
            "status": t.status,
            "target": t.target,
            "cve_id": t.cve_id,
            "created_at": t.created_at.isoformat() if t.created_at else None
        } for t in tickets])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# START SERVER
# =========================











if __name__ == "__main__":

    with app.app_context():

        db.create_all()

    app.run(debug=True, host="127.0.0.1", port=5000)
