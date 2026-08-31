import os
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
            self.drawString(54, 750, "VIOLETSHIELD // CYBERSECURITY AUDIT REPORT")
            self.drawRightString(558, 750, "CONFIDENTIAL")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Bottom Running Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)

        self.drawString(54, 32, "VioletShield Automated Penetration Testing & Defense Platform")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()


def generate_pdf(report):
    """
    Generates a high-end, executive cybersecurity penetration testing &
    vulnerability assessment PDF report with zero text overlap.
    """
    folder = "reports"
    if not os.path.exists(folder):
        os.makedirs(folder)

    report_id = str(report.get("id") or report.get("scan_id") or "001")
    filename = os.path.join(folder, f"VioletShield_Audit_Report_{report_id}.pdf")

    # Document Geometry
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Typographic Styles with Strict Line Spacing / Proportional Leading
    brand_title_style = ParagraphStyle(
        "BrandTitle",
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#4c1d95")
    )

    brand_sub_style = ParagraphStyle(
        "BrandSub",
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#7c3aed")
    )

    meta_label_style = ParagraphStyle(
        "MetaLabel",
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        alignment=TA_RIGHT,
        textColor=colors.HexColor("#64748b")
    )

    meta_val_style = ParagraphStyle(
        "MetaVal",
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        alignment=TA_RIGHT,
        textColor=colors.HexColor("#0f172a")
    )

    section_heading_style = ParagraphStyle(
        "SectionHeading",
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1e1b4b"),
        spaceBefore=14,
        spaceAfter=6
    )

    cell_label_style = ParagraphStyle(
        "CellLabel",
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#334155")
    )

    cell_text_style = ParagraphStyle(
        "CellText",
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0f172a")
    )

    cell_code_style = ParagraphStyle(
        "CellCode",
        fontName="Courier-Bold",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#4c1d95")
    )

    vuln_title_style = ParagraphStyle(
        "VulnTitle",
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#0f172a")
    )

    vuln_desc_style = ParagraphStyle(
        "VulnDesc",
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#475569")
    )

    rec_bullet_style = ParagraphStyle(
        "RecBullet",
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0f172a")
    )

    content = []

    # =========================================================================
    # 1. REPORT HEADER BANNER
    # =========================================================================
    scan_date = report.get("date") or report.get("created_at") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    target_website = report.get("website", "target.local")
    if isinstance(target_website, dict):
        target_website = target_website.get("domain", "target.local")

    target_ip = report.get("ip") or (report.get("website", {}) if isinstance(report.get("website"), dict) else {}).get("ip", "N/A")
    security_score = int(report.get("score") or report.get("security_score") or 0)
    risk_level = str(report.get("risk") or "Low").upper()

    header_table_data = [
        [
            Paragraph("<b>VIOLETSHIELD</b>", brand_title_style),
            Paragraph(f"REPORT ID: <b>#{report_id}</b>", meta_val_style)
        ],
        [
            Paragraph("AI PENETRATION TESTING & SECURITY AUDIT", brand_sub_style),
            Paragraph(f"GENERATED: {str(scan_date)[:19]}", meta_label_style)
        ]
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

    # =========================================================================
    # 2. EXECUTIVE POSTURE & SCORECARD (ZERO TEXT COLLISION)
    # =========================================================================
    if security_score >= 80:
        score_bg = "#ecfdf5"
        score_text_color = "#047857"
        score_border_color = "#a7f3d0"
        grade_text = "GRADE A - STRONG DEFENSE"
    elif security_score >= 50:
        score_bg = "#fffbeb"
        score_text_color = "#b45309"
        score_border_color = "#fde68a"
        grade_text = "GRADE B - ACTION REQUIRED"
    else:
        score_bg = "#fff1f2"
        score_text_color = "#be123c"
        score_border_color = "#fecdd3"
        grade_text = "GRADE F - HIGH ATTACK SURFACE"

    if risk_level == "HIGH" or risk_level == "CRITICAL":
        risk_pill_bg = "#be123c"
    elif risk_level == "MEDIUM":
        risk_pill_bg = "#d97706"
    else:
        risk_pill_bg = "#059669"

    # Distinct sub-table for Target info
    target_info_paragraphs = [
        Paragraph("<font color='#64748b'><b>TARGET ENDPOINT</b></font>", ParagraphStyle("TLabel", fontName="Helvetica-Bold", fontSize=8, leading=10)),
        Spacer(1, 3),
        Paragraph(f"<b>{target_website}</b>", ParagraphStyle("THost", fontName="Helvetica-Bold", fontSize=13, leading=16, textColor=colors.HexColor("#0f172a"))),
        Spacer(1, 4),
        Paragraph(f"Target IP: <b>{target_ip}</b> &bull; Scope: Web & Network Audit", ParagraphStyle("TMeta", fontName="Helvetica", fontSize=8, leading=10, textColor=colors.HexColor("#475569")))
    ]

    # Distinct sub-table for Scorecard
    score_paragraphs = [
        Paragraph("SECURITY SCORE", ParagraphStyle("SLabel", fontName="Helvetica-Bold", fontSize=7.5, leading=9, alignment=TA_CENTER, textColor=colors.HexColor(score_text_color))),
        Spacer(1, 2),
        Paragraph(f"<b>{security_score}%</b>", ParagraphStyle("SVal", fontName="Helvetica-Bold", fontSize=22, leading=24, alignment=TA_CENTER, textColor=colors.HexColor(score_text_color))),
        Spacer(1, 2),
        Paragraph(f"<b>{grade_text}</b>", ParagraphStyle("SGrade", fontName="Helvetica-Bold", fontSize=6.5, leading=8, alignment=TA_CENTER, textColor=colors.HexColor(score_text_color)))
    ]

    # Distinct sub-table for Risk
    risk_paragraphs = [
        Paragraph("RISK TIER", ParagraphStyle("RLabel", fontName="Helvetica-Bold", fontSize=8, leading=10, alignment=TA_CENTER, textColor=colors.white)),
        Spacer(1, 3),
        Paragraph(f"<b>{risk_level}</b>", ParagraphStyle("RVal", fontName="Helvetica-Bold", fontSize=15, leading=17, alignment=TA_CENTER, textColor=colors.white)),
        Spacer(1, 2),
        Paragraph("SEVERITY", ParagraphStyle("RSub", fontName="Helvetica", fontSize=7, leading=9, alignment=TA_CENTER, textColor=colors.HexColor("#fef08a") if risk_level == "MEDIUM" else colors.white))
    ]

    summary_box_data = [
        [target_info_paragraphs, score_paragraphs, risk_paragraphs]
    ]

    summary_table = Table(summary_box_data, colWidths=[264, 130, 110])
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

    # =========================================================================
    # 3. RECONNAISSANCE & TECHNICAL STACK
    # =========================================================================
    content.append(Paragraph("1. Reconnaissance & Technical Environment", section_heading_style))

    technologies = report.get("technologies", [])
    tech_str = ", ".join(technologies) if technologies else "Standard Web Stack"

    recon_data = [
        [Paragraph("Target Host", cell_label_style), Paragraph(target_website, cell_text_style),
         Paragraph("Server Protocol", cell_label_style), Paragraph("HTTPS" if "https" in str(target_website) else "HTTP / TCP", cell_text_style)],
        [Paragraph("Primary IP", cell_label_style), Paragraph(target_ip, cell_code_style),
         Paragraph("Technologies", cell_label_style), Paragraph(tech_str, cell_text_style)]
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
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    content.append(recon_table)
    content.append(Spacer(1, 10))

    # =========================================================================
    # 4. SSL/TLS CERTIFICATE INTEGRITY
    # =========================================================================
    content.append(Paragraph("2. SSL/TLS Cryptographic Analysis", section_heading_style))

    ssl_info = report.get("ssl_status") or report.get("ssl") or {}
    is_ssl_valid = bool(ssl_info.get("valid"))
    ssl_issuer = ssl_info.get("issuer", "Trusted Certificate Authority")
    ssl_expiry = str(ssl_info.get("expiry") or ssl_info.get("expiry_date") or "Active")
    days_left = ssl_info.get("daysRemaining") or ssl_info.get("days_remaining") or "N/A"

    ssl_data = [
        [
            Paragraph("Certificate Status", cell_label_style),
            Paragraph(
                f"<font color='{'#059669' if is_ssl_valid else '#be123c'}'><b>{'VALID CERTIFICATE' if is_ssl_valid else 'INVALID / EXPIRED'}</b></font>",
                cell_text_style
            ),
            Paragraph("CA Issuer", cell_label_style),
            Paragraph(str(ssl_issuer)[:26], cell_text_style)
        ],
        [
            Paragraph("Expiration Date", cell_label_style),
            Paragraph(str(ssl_expiry)[:16], cell_text_style),
            Paragraph("Validity Remaining", cell_label_style),
            Paragraph(f"{days_left} Days", cell_text_style)
        ]
    ]

    ssl_table = Table(ssl_data, colWidths=[105, 147, 105, 147])
    ssl_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f1f5f9")),
        ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#f1f5f9")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    content.append(ssl_table)
    content.append(Spacer(1, 10))

    # =========================================================================
    # 5. HTTP SECURITY HEADERS AUDIT
    # =========================================================================
    content.append(Paragraph("3. HTTP Security Headers Compliance Audit", section_heading_style))

    headers_info = report.get("headers", {})
    present_headers = headers_info.get("present", [])
    missing_headers = headers_info.get("missing", [])

    header_eval_list = [
        ("Content-Security-Policy", "Mitigates Cross-Site Scripting (XSS) and code injection."),
        ("Strict-Transport-Security", "Enforces HTTPS communication & blocks SSL stripping."),
        ("X-Frame-Options", "Protects application against Clickjacking framing attacks."),
        ("X-Content-Type-Options", "Blocks MIME-sniffing and forces declared content types."),
        ("Referrer-Policy", "Controls referrer information leakage to external domains.")
    ]

    headers_table_data = [
        [
            Paragraph("<b>SECURITY HEADER</b>", cell_label_style),
            Paragraph("<b>COMPLIANCE</b>", cell_label_style),
            Paragraph("<b>DEFENSIVE PURPOSE</b>", cell_label_style)
        ]
    ]

    for h_name, h_purpose in header_eval_list:
        is_present = (h_name in present_headers) or (h_name not in missing_headers and len(present_headers) > 0)
        status_text = (
            "<font color='#059669'><b>ENFORCED</b></font>"
            if is_present
            else "<font color='#be123c'><b>MISSING</b></font>"
        )

        headers_table_data.append([
            Paragraph(h_name, cell_code_style),
            Paragraph(status_text, cell_text_style),
            Paragraph(h_purpose, cell_text_style)
        ])

    headers_table = Table(headers_table_data, colWidths=[155, 95, 254])
    headers_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    content.append(headers_table)
    content.append(Spacer(1, 10))

    # =========================================================================
    # 6. IDENTIFIED VULNERABILITIES & AI FINDINGS
    # =========================================================================
    content.append(Paragraph("4. Identified Security Findings & Risks", section_heading_style))

    ai_report = report.get("ai_report") or report.get("ai_analysis") or {}
    issues = ai_report.get("issues") or report.get("vulnerabilities") or []

    if not issues:
        clean_box = [
            [Paragraph("<font color='#059669'><b>NO HIGH-SEVERITY VULNERABILITIES DETECTED</b></font><br/>"
                       "<font size=8 color='#475569'>The target endpoint satisfies core baseline security criteria with zero critical exposures.</font>",
                       cell_text_style)]
        ]
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
        for idx, issue in enumerate(issues[:5]):
            title = issue.get("title") or issue.get("name") or f"Security Finding #{idx+1}"
            severity = str(issue.get("severity") or "Medium").upper()
            description = issue.get("description") or "Potential security risk identified on target endpoint."

            sev_color = "#be123c" if severity in ["HIGH", "CRITICAL"] else ("#d97706" if severity == "MEDIUM" else "#059669")
            sev_bg = "#fff1f2" if severity in ["HIGH", "CRITICAL"] else ("#fffbeb" if severity == "MEDIUM" else "#ecfdf5")

            issue_row = [
                [
                    Paragraph(f"<font color='{sev_color}'><b>[{severity}]</b></font> <b>{title}</b>", vuln_title_style),
                ],
                [
                    Paragraph(description, vuln_desc_style)
                ]
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

    # =========================================================================
    # 7. MITIGATION & REMEDIATION ACTION PLAN
    # =========================================================================
    content.append(Paragraph("5. Recommended Remediation & Hardening Actions", section_heading_style))

    recommendations = ai_report.get("recommendations") or report.get("recommendations") or []
    if not recommendations:
        recommendations = [
            "Configure Strict-Transport-Security (HSTS) with max-age=31536000 and includeSubDomains.",
            "Deploy a robust Content-Security-Policy (CSP) to mitigate cross-site scripting risks.",
            "Set HttpOnly, Secure, and SameSite=Strict attributes on all authentication cookies.",
            "Schedule continuous vulnerability scans to detect new CVE exposures."
        ]

    rec_data = []
    for r_idx, rec in enumerate(recommendations[:4]):
        rec_data.append([
            Paragraph(f"<b>Step {r_idx+1}:</b>", cell_label_style),
            Paragraph(rec, rec_bullet_style)
        ])

    rec_table = Table(rec_data, colWidths=[55, 449])
    rec_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
    ]))

    content.append(rec_table)

    # Build Document with NumberedCanvas
    doc.build(content, canvasmaker=NumberedCanvas)

    return filename