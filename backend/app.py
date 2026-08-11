from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

import socket

from database.db import db
from database.models import Scan, Report
from datetime import timedelta
from scanner import scan_website
from domain_intelligence import get_domain_information
from port_scanner import scan_ports
from port_analyzer import analyze_ports

from network_ai_analyzer import analyze_network_security

from technology_detector import detect_technologies
from security_headers import analyze_security_headers

from pdf_generator import generate_pdf

from ssl_checker import check_ssl

from flask_jwt_extended import JWTManager
from auth import auth, bcrypt
from flask_jwt_extended import jwt_required, get_jwt_identity

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

    except Exception as e:

        return jsonify({"error": str(e)}), 500


from flask_jwt_extended import jwt_required, get_jwt_identity


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


@app.route("/api/report/<int:report_id>", methods=["GET"])
def download_report(report_id):

    try:

        report = Report.query.get(report_id)

        if not report:

            return jsonify({"error": "Report not found"}), 404

        pdf_path = generate_pdf(
            {
                "id": report.id,
                "scan_id": report.scan_id,
                "website": report.scan.website,
                "score": report.scan.security_score,
                "risk": report.scan.risk,
            }
        )

        return send_file(pdf_path, as_attachment=True)

    except Exception as e:

        return jsonify({"error": str(e)}), 500
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


# =========================
# START SERVER
# =========================


if __name__ == "__main__":

    with app.app_context():

        db.create_all()

    app.run(debug=True, host="127.0.0.1", port=5000)
