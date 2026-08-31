def analyze_security(scan_data):

    issues = []
    recommendations = []

    risk_level = 0


    # ================= HEADER ANALYSIS =================

    headers = scan_data.get(
        "headers",
        {}
    )

    missing_headers = headers.get(
        "missing",
        []
    )


    if "Content-Security-Policy" in missing_headers:

        issues.append({

            "title": "Missing Content-Security-Policy",

            "severity": "High",

            "description":
            "Website may be vulnerable to Cross Site Scripting (XSS) attacks."

        })

        recommendations.append(
            "Implement Content-Security-Policy header."
        )

        risk_level = max(
            risk_level,
            2
        )




    if "Strict-Transport-Security" in missing_headers:

        issues.append({

            "title": "Missing HSTS Header",

            "severity": "Medium",

            "description":
            "HTTPS downgrade attacks may be possible."

        })

        recommendations.append(
            "Enable Strict-Transport-Security header."
        )

        risk_level = max(
            risk_level,
            2
        )



    if "X-Frame-Options" in missing_headers:

        issues.append({

            "title": "Missing X-Frame-Options",

            "severity": "Medium",

            "description":
            "Website may be vulnerable to clickjacking attacks."

        })

        recommendations.append(
            "Add X-Frame-Options security header."
        )

        risk_level = max(
            risk_level,
            2
        )



    # ================= SSL ANALYSIS =================


    ssl = scan_data.get(
        "ssl",
        {}
    )


    if not ssl.get(
        "valid",
        False
    ):

        issues.append({

            "title": "Invalid SSL Certificate",

            "severity": "High",

            "description":
            "Website SSL certificate is not valid."

        })


        recommendations.append(
            "Install a valid SSL certificate."
        )


        risk_level = max(
            risk_level,
            3
        )



    # ================= COOKIE ANALYSIS =================


    cookies = scan_data.get(
        "cookies",
        {}
    )


    high_risk_cookies = cookies.get(
        "high_risk",
        0
    )


    medium_risk_cookies = cookies.get(
        "medium_risk",
        0
    )



    if high_risk_cookies > 3:


        issues.append({

            "title": "Multiple High Risk Cookies",

            "severity": "High",

            "description":
            f"{high_risk_cookies} cookies have insecure configurations."

        })


        recommendations.append(
            "Enable Secure and HttpOnly flags for cookies."
        )


        risk_level = max(
            risk_level,
            3
        )



    elif high_risk_cookies > 0:


        issues.append({

            "title": "Insecure Cookies Detected",

            "severity": "Medium",

            "description":
            f"{high_risk_cookies} cookies require security review."

        })


        recommendations.append(
            "Review cookie security settings."
        )


        risk_level = max(
            risk_level,
            2
        )



    # ================= PORT ANALYSIS =================


    ports = scan_data.get(
        "ports",
        []
    )


    for port in ports:


        if port.get("port") == 80:


            issues.append({

                "title": "HTTP Port Exposed",

                "severity": "Medium",

                "description":
                "Unencrypted HTTP traffic is accessible."

            })


            recommendations.append(
                "Redirect HTTP traffic to HTTPS."
            )


            risk_level = max(
                risk_level,
                2
            )



    # ================= VULNERABILITY CHECK =================


    vulnerabilities = scan_data.get(
        "vulnerabilities",
        []
    )


    if len(vulnerabilities) > 0:


        issues.append({

            "title": "Exposed Vulnerabilities Found",

            "severity": "High",

            "description":
            "Security weaknesses detected during scan."

        })


        recommendations.append(
            "Fix detected vulnerabilities immediately."
        )


        risk_level = max(
            risk_level,
            3
        )



    # ================= FINAL RISK =================


    if risk_level == 3:

        risk = "High"


    elif risk_level == 2:

        risk = "Medium"


    else:

        risk = "Low"



    return {


        "risk": risk,


        "issues": issues,


        "recommendations": recommendations,


        "summary":
        f"{len(issues)} security issues detected"

    }