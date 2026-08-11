from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image
)

from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle
)

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import inch

import os




def generate_pdf(report):


    folder = "reports"


    if not os.path.exists(folder):
        os.makedirs(folder)



    filename = (
        folder
        + "/VioletShield_Report_"
        + report["id"]
        + ".pdf"
    )



    doc = SimpleDocTemplate(
        filename,
        pagesize=letter
    )



    styles = getSampleStyleSheet()



    title_style = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        alignment=TA_CENTER,
        textColor=colors.HexColor("#9333ea"),
        fontSize=24
    )



    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        textColor=colors.HexColor("#7e22ce"),
        fontSize=12
    )



    heading_style = ParagraphStyle(
        "Heading",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#9333ea"),
        spaceBefore=15,
        spaceAfter=10
    )



    normal_style = ParagraphStyle(
        "Normal",
        parent=styles["Normal"],
        fontSize=11,
        leading=16
    )



    content = []



    # =========================
    # HEADER
    # =========================


    logo_path = os.path.join(
        os.path.dirname(__file__),
        "assets",
        "violetshield_logo.png"
    )



    if os.path.exists(logo_path):

        logo = Image(
            logo_path,
            width=1*inch,
            height=1*inch
        )

        content.append(logo)



    content.append(
        Spacer(1,10)
    )



    content.append(
        Paragraph(
            "VioletShield",
            title_style
        )
    )



    content.append(
        Paragraph(
            "AI Cyber Security Assessment Report",
            subtitle_style
        )
    )



    content.append(
        Spacer(1,30)
    )





    # =========================
    # TARGET INFO
    # =========================


    content.append(
        Paragraph(
            "Target Information",
            heading_style
        )
    )



    info = [

        [
            "Website",
            report.get("website","Unknown")
        ],

        [
            "Security Score",
            str(report.get("security_score",0))+"%"
        ],

        [
            "Generated Date",
            report.get("date","Unknown")
        ]

    ]



    table = Table(
        info,
        colWidths=[150,250]
    )



    table.setStyle(
        TableStyle([

            (
                "BACKGROUND",
                (0,0),
                (-1,-1),
                colors.HexColor("#18181b")
            ),

            (
                "TEXTCOLOR",
                (0,0),
                (-1,-1),
                colors.white
            ),

            (
                "BOX",
                (0,0),
                (-1,-1),
                1,
                colors.HexColor("#9333ea")
            )

        ])
    )



    content.append(table)






    # =========================
    # SSL
    # =========================


    content.append(
        Paragraph(
            "SSL Certificate Analysis",
            heading_style
        )
    )



    ssl = report.get(
        "ssl_status",
        {}
    )


    content.append(
        Paragraph(
            f"Status: {'✅ Valid' if ssl.get('valid') else '❌ Invalid'}",
            normal_style
        )
    )


    content.append(
        Paragraph(
            f"Issuer: {ssl.get('issuer','Unknown')}",
            normal_style
        )
    )







    # =========================
    # TECHNOLOGY
    # =========================


    content.append(
        Paragraph(
            "Technology Detection",
            heading_style
        )
    )



    for tech in report.get("technologies",[]):

        content.append(
            Paragraph(
                "• "+tech,
                normal_style
            )
        )






    # =========================
    # AI ANALYSIS
    # =========================


    content.append(
        Paragraph(
            "AI Security Analysis",
            heading_style
        )
    )



    ai = report.get(
        "ai_report",
        {}
    )



    content.append(
        Paragraph(
            "Risk Level: "
            +
            ai.get(
                "risk",
                "Unknown"
            ),
            normal_style
        )
    )






    # =========================
    # FINDINGS
    # =========================


    content.append(
        Paragraph(
            "Security Findings",
            heading_style
        )
    )



    issues = ai.get(
        "issues",
        []
    )



    if not issues:

        content.append(
            Paragraph(
                "✅ No major issues detected",
                normal_style
            )
        )


    else:

        for issue in issues:


            content.append(
                Paragraph(
                    "⚠ "
                    +
                    issue.get("title","Issue"),
                    normal_style
                )
            )


            content.append(
                Paragraph(
                    "Severity: "
                    +
                    issue.get("severity","Unknown"),
                    normal_style
                )
            )


            content.append(
                Paragraph(
                    issue.get("description",""),
                    normal_style
                )
            )







    # =========================
    # RECOMMENDATIONS
    # =========================


    content.append(
        Paragraph(
            "Recommendations",
            heading_style
        )
    )



    for rec in ai.get("recommendations",[]):

        content.append(
            Paragraph(
                "✓ "+rec,
                normal_style
            )
        )






    content.append(
        Spacer(1,40)
    )


    content.append(
        Paragraph(
            "Generated by VioletShield AI Security Engine",
            subtitle_style
        )
    )



    doc.build(content)



    return filename