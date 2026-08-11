SECURITY_HEADERS = {

    "Content-Security-Policy":
        "Protects against XSS attacks",

    "Strict-Transport-Security":
        "Enforces HTTPS",

    "X-Frame-Options":
        "Protects against clickjacking",

    "X-Content-Type-Options":
        "Prevents MIME sniffing",

    "Referrer-Policy":
        "Controls referrer information",

    "Permissions-Policy":
        "Controls browser permissions"

}


def check_headers(response):

    headers = response.headers

    present = []
    missing = []


    for header in SECURITY_HEADERS:

        if header in headers:
            present.append(header)

        else:
            missing.append(header)


    score = int(
        (len(present) / len(SECURITY_HEADERS)) * 100
    )


    return {

        "score": score,

        "present": present,

        "missing": missing

    }