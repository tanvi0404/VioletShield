import os
import json
from datetime import datetime
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render total page count
    alongside a running header and footer with confidentiality notices.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#7c3aed"))

        # Top Running Header (Pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "VIOLETSHIELD // PENETRATION TESTING AUDIT REPORT")
            self.drawRightString(558, 750, "CONFIDENTIAL // LAWFUL DEFENSE ONLY")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Bottom Running Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)

        self.drawString(54, 32, "VioletShield Automated Penetration Testing & Threat Intelligence Platform")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()


def build_unified_report_model(raw_data):
    """
    Normalizes scan telemetry from multiple phases into a standardized schema.
    """
    if not isinstance(raw_data, dict):
        raw_data = {}

    target = raw_data.get("website") or raw_data.get("target") or "Target Endpoint"
    if isinstance(target, dict):
        target_name = target.get("domain") or target.get("ip") or "target.local"
        target_ip = target.get("ip") or "N/A"
    else:
        target_name = str(target)
        target_ip = raw_data.get("ip") or "N/A"

    scan_id = str(raw_data.get("id") or raw_data.get("scan_id") or "1")
    created_at = str(raw_data.get("created_at") or raw_data.get("date") or datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    
    score = int(raw_data.get("score") or raw_data.get("security_score") or 100)
    risk = str(raw_data.get("risk") or raw_data.get("risk_level") or "Low").upper()

    ports = raw_data.get("ports") or raw_data.get("port_data") or []
    vulns = raw_data.get("vulnerabilities") or []
    cves = raw_data.get("cves") or []
    exploits = raw_data.get("exploits") or []
    ssl = raw_data.get("ssl") or raw_data.get("ssl_status") or {}
    headers = raw_data.get("headers") or {}
    threat_intel = raw_data.get("threat_intelligence") or raw_data.get("threat_data") or {}
    ai_analysis = raw_data.get("ai_analysis") or raw_data.get("ai_report") or {}
    nikto = raw_data.get("nikto") or {}
    gobuster = raw_data.get("gobuster") or {}
    risk_score_details = raw_data.get("risk_score_details") or {}

    return {
        "metadata": {
            "report_id": scan_id,
            "scan_id": scan_id,
            "generated_at": created_at,
            "target": target_name,
            "ip": target_ip,
            "platform": "VioletShield v2.0",
            "audit_type": "Automated Penetration Testing & Vulnerability Assessment"
        },
        "executive_summary": {
            "security_score": score,
            "grade": risk_score_details.get("grade") or ("A" if score >= 85 else "B" if score >= 70 else "C" if score >= 55 else "F"),
            "risk_level": risk,
            "posture_label": risk_score_details.get("posture_label") or "Multi-Pillar Audited Defense Posture",
            "pillars": risk_score_details.get("pillars") or {},
            "score_reasons": risk_score_details.get("main_reasons") or []
        },
        "technical_telemetry": {
            "ssl": ssl,
            "headers": headers,
            "open_ports": ports,
            "cves": cves,
            "exploits": exploits,
            "vulnerabilities": vulns,
            "threat_intelligence": threat_intel,
            "web_audit": nikto,
            "directory_fuzzing": gobuster
        },
        "ai_recommendations": ai_analysis.get("recommendations") or risk_score_details.get("priority_remediations") or [
            "Configure Strict-Transport-Security (HSTS) with max-age=31536000.",
            "Deploy a robust Content-Security-Policy (CSP) to mitigate code injection risks.",
            "Enforce HttpOnly and Secure flags on all authentication cookies.",
            "Isolate unneeded external ports behind network firewalls."
        ]
    }


def generate_json_report(raw_data):
    """
    Generates a machine-readable, structured JSON penetration testing report.
    """
    model = build_unified_report_model(raw_data)
    return model


def generate_html_report(raw_data):
    """
    Generates a standalone, self-contained Cyber-Dark responsive HTML penetration testing report.
    """
    model = build_unified_report_model(raw_data)
    meta = model["metadata"]
    exec_sum = model["executive_summary"]
    telemetry = model["technical_telemetry"]
    recs = model["ai_recommendations"]
    ports = telemetry.get("open_ports", [])
    cves = telemetry.get("cves", [])
    exploits = telemetry.get("exploits", [])
    vulns = telemetry.get("vulnerabilities", [])

    score = exec_sum["security_score"]
    score_color = "#10b981" if score >= 85 else ("#f59e0b" if score >= 60 else "#ef4444")
    risk_color = "#ef4444" if exec_sum["risk_level"] in ["HIGH", "CRITICAL"] else ("#f59e0b" if exec_sum["risk_level"] == "MEDIUM" else "#10b981")

    # Render Ports Table
    ports_html = ""
    if ports:
        for p in ports:
            port_num = p.get("port") if isinstance(p, dict) else p
            service = p.get("service", "Unknown") if isinstance(p, dict) else "TCP Service"
            banner = p.get("banner", "") if isinstance(p, dict) else ""
            ports_html += f"""
            <tr>
                <td class="code">{port_num}</td>
                <td>{service}</td>
                <td class="code">{banner or 'N/A'}</td>
                <td><span class="badge badge-clean">OPEN</span></td>
            </tr>
            """
    else:
        ports_html = "<tr><td colspan='4' class='text-center text-muted'>No public high-risk ports detected.</td></tr>"

    # Render Vulnerabilities / CVEs
    vulns_html = ""
    findings = vulns or cves or exploits
    if findings:
        for idx, f in enumerate(findings[:8]):
            title = f.get("title") or f.get("cve_id") or f.get("name") or f"Finding #{idx+1}"
            severity = (f.get("severity") or "MEDIUM").upper()
            desc = f.get("description") or f.get("summary") or "Security vulnerability detected on target endpoint."
            sev_class = "badge-crit" if severity in ["HIGH", "CRITICAL"] else ("badge-warn" if severity == "MEDIUM" else "badge-clean")
            vulns_html += f"""
            <div class="card finding-card">
                <div class="finding-header">
                    <span class="badge {sev_class}">[{severity}]</span>
                    <strong>{title}</strong>
                </div>
                <p class="finding-desc">{desc}</p>
            </div>
            """
    else:
        vulns_html = "<div class='card clean-box'><strong>No High-Severity Vulnerabilities Detected</strong><p>The target endpoint satisfies core baseline security criteria with zero critical exposures.</p></div>"

    # Render Recommendations
    recs_html = ""
    for idx, r in enumerate(recs[:5]):
        text = r.get("action") if isinstance(r, dict) else r
        recs_html += f"""
        <li class="rec-item">
            <span class="rec-num">{idx+1}</span>
            <span>{text}</span>
        </li>
        """

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VioletShield Penetration Test Report - {meta['target']}</title>
    <style>
        :root {{
            --bg-base: #09090b;
            --bg-card: #18181b;
            --border: #27272a;
            --accent: #a855f7;
            --text: #f4f4f5;
            --text-muted: #a1a1aa;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-base);
            color: var(--text);
            line-height: 1.6;
            padding: 40px 20px;
        }}
        .container {{
            max-width: 960px;
            margin: 0 auto;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--accent);
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .brand h1 {{
            font-size: 28px;
            color: #fff;
            letter-spacing: -0.5px;
        }}
        .brand h1 span {{ color: var(--accent); }}
        .brand p {{ font-size: 13px; color: var(--text-muted); }}
        .meta-box {{ text-align: right; font-size: 12px; color: var(--text-muted); font-family: monospace; }}
        .grid-3 {{
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
        }}
        .card {{
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 20px;
        }}
        .score-card {{
            text-align: center;
            border-color: {score_color}40;
            background: {score_color}10;
        }}
        .score-val {{
            font-size: 38px;
            font-weight: 900;
            color: {score_color};
        }}
        .risk-card {{
            text-align: center;
            background: {risk_color}15;
            border-color: {risk_color}50;
        }}
        .risk-val {{
            font-size: 24px;
            font-weight: 800;
            color: {risk_color};
            margin-top: 6px;
        }}
        h2 {{
            font-size: 18px;
            color: #fff;
            margin: 25px 0 15px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 20px;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }}
        th {{
            background: #27272a80;
            color: var(--text-muted);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .code {{ font-family: monospace; color: var(--accent); }}
        .badge {{
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: bold;
            font-family: monospace;
        }}
        .badge-clean {{ background: rgba(16,185,129,0.15); color: var(--success); border: 1px solid rgba(16,185,129,0.3); }}
        .badge-warn {{ background: rgba(245,158,11,0.15); color: var(--warning); border: 1px solid rgba(245,158,11,0.3); }}
        .badge-crit {{ background: rgba(239,68,68,0.15); color: var(--danger); border: 1px solid rgba(239,68,68,0.3); }}
        .finding-card {{
            margin-bottom: 12px;
            border-left: 4px solid var(--accent);
        }}
        .finding-header {{
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 6px;
        }}
        .finding-desc {{ font-size: 13px; color: var(--text-muted); }}
        .rec-list {{ list-style: none; }}
        .rec-item {{
            display: flex;
            align-items: flex-start;
            gap: 12px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 8px;
            font-size: 13px;
        }}
        .rec-num {{
            background: var(--accent);
            color: #fff;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            flex-shrink: 0;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
            text-align: center;
            font-size: 12px;
            color: var(--text-muted);
        }}
        @media print {{
            body {{ background: #fff; color: #000; padding: 0; }}
            .card {{ border: 1px solid #ccc; background: #fafafa; color: #000; }}
            .brand h1 {{ color: #000; }}
            .score-val {{ color: #000; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="brand">
                <h1>Violet<span>Shield</span></h1>
                <p>AI Penetration Testing & Threat Intelligence Audit</p>
            </div>
            <div class="meta-box">
                <div>REPORT ID: #{meta['report_id']}</div>
                <div>DATE: {meta['generated_at'][:19]}</div>
                <div>SCOPE: {meta['audit_type']}</div>
            </div>
        </div>

        <div class="grid-3">
            <div class="card">
                <span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: bold;">Target Infrastructure</span>
                <div style="font-size: 20px; font-weight: bold; margin-top: 4px;">{meta['target']}</div>
                <div style="font-size: 13px; color: var(--text-muted); font-family: monospace; margin-top: 4px;">Primary IP: {meta['ip']}</div>
            </div>

            <div class="card score-card">
                <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: {score_color};">Security Score</span>
                <div class="score-val">{score}%</div>
                <span class="badge" style="background: {score_color}20; color: {score_color};">{exec_sum['grade']} GRADE</span>
            </div>

            <div class="card risk-card">
                <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: {risk_color};">Risk Tier</span>
                <div class="risk-val">{exec_sum['risk_level']}</div>
                <span style="font-size: 10px; color: var(--text-muted);">SEVERITY LEVEL</span>
            </div>
        </div>

        <h2>1. Discovered Ports & Services</h2>
        <table>
            <thead>
                <tr>
                    <th>Port</th>
                    <th>Service</th>
                    <th>Banner / Technology</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {ports_html}
            </tbody>
        </table>

        <h2>2. Vulnerability & Threat Findings</h2>
        <div>
            {vulns_html}
        </div>

        <h2>3. Remediation & Hardening Plan</h2>
        <ul class="rec-list">
            {recs_html}
        </ul>

        <div class="footer">
            Generated automatically by VioletShield Automated Cybersecurity Defense Platform. Confidential.
        </div>
    </div>
</body>
</html>"""
    return html


def generate_pdf_report(raw_data, output_path=None):
    """
    Generates a high-end, executive cybersecurity penetration testing &
    vulnerability assessment PDF report using ReportLab.
    """
    folder = "reports"
    if not os.path.exists(folder):
        os.makedirs(folder)

    model = build_unified_report_model(raw_data)
    meta = model["metadata"]
    exec_sum = model["executive_summary"]
    telemetry = model["technical_telemetry"]
    recs = model["ai_recommendations"]

    report_id = meta["report_id"]
    if not output_path:
        filename = os.path.join(folder, f"VioletShield_Audit_Report_{report_id}.pdf")
    else:
        filename = output_path

    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    brand_title_style = ParagraphStyle("BrandTitle", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=colors.HexColor("#4c1d95"))
    brand_sub_style = ParagraphStyle("BrandSub", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=colors.HexColor("#7c3aed"))
    meta_label_style = ParagraphStyle("MetaLabel", fontName="Helvetica", fontSize=8, leading=11, alignment=TA_RIGHT, textColor=colors.HexColor("#64748b"))
    meta_val_style = ParagraphStyle("MetaVal", fontName="Helvetica-Bold", fontSize=9, leading=12, alignment=TA_RIGHT, textColor=colors.HexColor("#0f172a"))
    section_heading_style = ParagraphStyle("SectionHeading", fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=colors.HexColor("#1e1b4b"), spaceBefore=14, spaceAfter=6)
    cell_label_style = ParagraphStyle("CellLabel", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=colors.HexColor("#334155"))
    cell_text_style = ParagraphStyle("CellText", fontName="Helvetica", fontSize=8.5, leading=12, textColor=colors.HexColor("#0f172a"))
    cell_code_style = ParagraphStyle("CellCode", fontName="Courier-Bold", fontSize=8, leading=11, textColor=colors.HexColor("#4c1d95"))
    vuln_title_style = ParagraphStyle("VulnTitle", fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=colors.HexColor("#0f172a"))
    vuln_desc_style = ParagraphStyle("VulnDesc", fontName="Helvetica", fontSize=8.5, leading=12, textColor=colors.HexColor("#475569"))
    rec_bullet_style = ParagraphStyle("RecBullet", fontName="Helvetica", fontSize=8.5, leading=12, textColor=colors.HexColor("#0f172a"))

    content = []

    # 1. HEADER BANNER
    header_table_data = [
        [Paragraph("<b>VIOLETSHIELD</b>", brand_title_style), Paragraph(f"REPORT ID: <b>#{report_id}</b>", meta_val_style)],
        [Paragraph("AI PENETRATION TESTING & AUDIT REPORT", brand_sub_style), Paragraph(f"GENERATED: {meta['generated_at'][:19]}", meta_label_style)]
    ]
    header_table = Table(header_table_data, colWidths=[300, 204])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    content.append(header_table)
    content.append(Spacer(1, 6))
    content.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#7c3aed"), spaceAfter=12))

    # 2. EXECUTIVE POSTURE & SCORECARD
    score = exec_sum["security_score"]
    risk_level = exec_sum["risk_level"]
    grade = exec_sum["grade"]

    if score >= 80:
        score_bg = "#ecfdf5"
        score_text_color = "#047857"
        score_border_color = "#a7f3d0"
        grade_text = f"GRADE {grade} - STRONG DEFENSE"
    elif score >= 50:
        score_bg = "#fffbeb"
        score_text_color = "#b45309"
        score_border_color = "#fde68a"
        grade_text = f"GRADE {grade} - ACTION REQUIRED"
    else:
        score_bg = "#fff1f2"
        score_text_color = "#be123c"
        score_border_color = "#fecdd3"
        grade_text = f"GRADE {grade} - CRITICAL RISK"

    risk_pill_bg = "#be123c" if risk_level in ["HIGH", "CRITICAL"] else ("#d97706" if risk_level == "MEDIUM" else "#059669")

    target_info_paragraphs = [
        Paragraph("<font color='#64748b'><b>TARGET ENDPOINT</b></font>", ParagraphStyle("TLabel", fontName="Helvetica-Bold", fontSize=8, leading=10)),
        Spacer(1, 3),
        Paragraph(f"<b>{meta['target']}</b>", ParagraphStyle("THost", fontName="Helvetica-Bold", fontSize=13, leading=16, textColor=colors.HexColor("#0f172a"))),
        Spacer(1, 4),
        Paragraph(f"Target IP: <b>{meta['ip']}</b> &bull; Scope: Web & Network Audit", ParagraphStyle("TMeta", fontName="Helvetica", fontSize=8, leading=10, textColor=colors.HexColor("#475569")))
    ]

    score_paragraphs = [
        Paragraph("SECURITY SCORE", ParagraphStyle("SLabel", fontName="Helvetica-Bold", fontSize=7.5, leading=9, alignment=TA_CENTER, textColor=colors.HexColor(score_text_color))),
        Spacer(1, 2),
        Paragraph(f"<b>{score}%</b>", ParagraphStyle("SVal", fontName="Helvetica-Bold", fontSize=22, leading=24, alignment=TA_CENTER, textColor=colors.HexColor(score_text_color))),
        Spacer(1, 2),
        Paragraph(f"<b>{grade_text}</b>", ParagraphStyle("SGrade", fontName="Helvetica-Bold", fontSize=6.5, leading=8, alignment=TA_CENTER, textColor=colors.HexColor(score_text_color)))
    ]

    risk_paragraphs = [
        Paragraph("RISK TIER", ParagraphStyle("RLabel", fontName="Helvetica-Bold", fontSize=8, leading=10, alignment=TA_CENTER, textColor=colors.white)),
        Spacer(1, 3),
        Paragraph(f"<b>{risk_level}</b>", ParagraphStyle("RVal", fontName="Helvetica-Bold", fontSize=15, leading=17, alignment=TA_CENTER, textColor=colors.white)),
        Spacer(1, 2),
        Paragraph("SEVERITY", ParagraphStyle("RSub", fontName="Helvetica", fontSize=7, leading=9, alignment=TA_CENTER, textColor=colors.HexColor("#fef08a") if risk_level == "MEDIUM" else colors.white))
    ]

    summary_table = Table([[target_info_paragraphs, score_paragraphs, risk_paragraphs]], colWidths=[264, 130, 110])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#f8fafc")),
        ("BACKGROUND", (1, 0), (1, 0), colors.HexColor(score_bg)),
        ("BACKGROUND", (2, 0), (2, 0), colors.HexColor(risk_pill_bg)),
        ("BOX", (0, 0), (0, 0), 1, colors.HexColor("#cbd5e1")),
        ("BOX", (1, 0), (1, 0), 1, colors.HexColor(score_border_color)),
        ("BOX", (2, 0), (2, 0), 1, colors.HexColor(risk_pill_bg)),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    content.append(summary_table)
    content.append(Spacer(1, 10))

    # 3. TECHNICAL DISCOVERY (PORTS & HEADERS)
    content.append(Paragraph("1. Reconnaissance & Perimeter Ports", section_heading_style))
    ports = telemetry.get("open_ports", [])
    if ports:
        port_rows = [[
            Paragraph("<b>PORT</b>", cell_label_style),
            Paragraph("<b>SERVICE</b>", cell_label_style),
            Paragraph("<b>BANNER / VERSION</b>", cell_label_style),
            Paragraph("<b>STATUS</b>", cell_label_style)
        ]]
        for p in ports[:6]:
            p_num = p.get("port") if isinstance(p, dict) else p
            s_name = p.get("service", "TCP") if isinstance(p, dict) else "TCP"
            b_text = p.get("banner", "N/A") if isinstance(p, dict) else "N/A"
            port_rows.append([
                Paragraph(str(p_num), cell_code_style),
                Paragraph(str(s_name), cell_text_style),
                Paragraph(str(b_text)[:30], cell_text_style),
                Paragraph("<font color='#059669'><b>OPEN</b></font>", cell_text_style)
            ])
        port_table = Table(port_rows, colWidths=[60, 120, 240, 84])
        port_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ]))
        content.append(port_table)
    else:
        recon_data = [
            [Paragraph("Target Host", cell_label_style), Paragraph(meta['target'], cell_text_style),
             Paragraph("Primary IP", cell_label_style), Paragraph(meta['ip'], cell_code_style)]
        ]
        recon_table = Table(recon_data, colWidths=[90, 162, 100, 152])
        recon_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f1f5f9")),
            ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#f1f5f9")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ]))
        content.append(recon_table)

    content.append(Spacer(1, 10))

    # 4. VULNERABILITIES & FINDINGS
    content.append(Paragraph("2. Identified Vulnerabilities & Exploits", section_heading_style))
    findings = telemetry.get("vulnerabilities") or telemetry.get("cves") or telemetry.get("exploits") or []
    if not findings:
        clean_box = [[Paragraph("<font color='#059669'><b>NO CRITICAL VULNERABILITIES DETECTED</b></font><br/>"
                                "<font size=8 color='#475569'>The target endpoint satisfies core baseline security criteria with zero verified exploits.</font>",
                                cell_text_style)]]
        clean_table = Table(clean_box, colWidths=[504])
        clean_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#ecfdf5")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#a7f3d0")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ]))
        content.append(clean_table)
    else:
        for idx, f in enumerate(findings[:5]):
            title = f.get("title") or f.get("cve_id") or f.get("name") or f"Finding #{idx+1}"
            sev = str(f.get("severity") or "Medium").upper()
            desc = f.get("description") or f.get("summary") or "Security vulnerability identified on target endpoint."
            sev_color = "#be123c" if sev in ["HIGH", "CRITICAL"] else ("#d97706" if sev == "MEDIUM" else "#059669")
            sev_bg = "#fff1f2" if sev in ["HIGH", "CRITICAL"] else ("#fffbeb" if sev == "MEDIUM" else "#ecfdf5")

            issue_row = [
                [Paragraph(f"<font color='{sev_color}'><b>[{sev}]</b></font> <b>{title}</b>", vuln_title_style)],
                [Paragraph(desc, vuln_desc_style)]
            ]
            issue_table = Table(issue_row, colWidths=[504])
            issue_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(sev_bg)),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor(sev_color)),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]))
            content.append(KeepTogether([issue_table, Spacer(1, 4)]))

    content.append(Spacer(1, 8))

    # 5. REMEDIATION & HARDENING ACTIONS
    content.append(Paragraph("3. Recommended Remediation & Hardening Actions", section_heading_style))
    rec_data = []
    for r_idx, r in enumerate(recs[:4]):
        text = r.get("action") if isinstance(r, dict) else r
        rec_data.append([
            Paragraph(f"<b>Step {r_idx+1}:</b>", cell_label_style),
            Paragraph(str(text), rec_bullet_style)
        ])
    rec_table = Table(rec_data, colWidths=[55, 449])
    rec_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
    ]))
    content.append(rec_table)

    doc.build(content, canvasmaker=NumberedCanvas)
    return filename
