def calculate_security_score(
        ssl,
        headers,
        cookies,
        ports,
        vulnerabilities,
        ai_analysis
):


    score = 100



    # ================= SSL CHECK =================

    if not ssl.get("valid", False):

        score -= 20


    days = ssl.get(
        "daysRemaining",
        999
    )


    if days < 30:

        score -= 8

    elif days < 90:

        score -= 3




    # ================= SECURITY HEADERS =================


    missing_headers = headers.get(
        "missing",
        []
    )


    for header in missing_headers:


        if header == "Content-Security-Policy":

            score -= 5


        elif header == "Strict-Transport-Security":

            score -= 5


        elif header == "X-Frame-Options":

            score -= 3


        elif header == "X-Content-Type-Options":

            score -= 2


        elif header == "Referrer-Policy":

            score -= 2


        elif header == "Permissions-Policy":

            score -= 1





    # ================= COOKIE SECURITY =================


    missing_httponly = cookies.get(
        "missing_httponly",
        []
    )


    missing_secure = cookies.get(
        "missing_secure",
        []
    )


    missing_samesite = cookies.get(
        "missing_samesite",
        []
    )



    # Limited penalty (realistic)

    if len(missing_httponly) > 0:

        score -= 5



    if len(missing_secure) > 0:

        score -= 5



    if len(missing_samesite) > 0:

        score -= 3






    # ================= PORT ANALYSIS =================


    for port in ports:


        risk = port.get(
            "risk",
            ""
        )


        if risk == "High":

            score -= 8


        elif risk == "Medium":

            score -= 3






    # ================= VULNERABILITIES =================


    for vuln in vulnerabilities:


        severity = vuln.get(
            "severity",
            "Medium"
        )


        if severity == "High":

            score -= 10


        elif severity == "Medium":

            score -= 5


        else:

            score -= 2






    # ================= AI RISK =================


    risk = ai_analysis.get(
        "risk",
        "Low"
    )


    if risk == "High":

        score -= 10


    elif risk == "Medium":

        score -= 5






    # ================= FINAL SCORE =================


    score = max(
        0,
        min(score,100)
    )


    return score