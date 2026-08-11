import requests


def analyze_security_headers(url):

    result = {

        "headers": {},

        "issues": [],

        "security_score": 100

    }


    try:

        response = requests.get(
            url,
            timeout=5
        )


        headers = response.headers


        result["headers"] = dict(headers)



        security_headers = {


            "Content-Security-Policy":
            "Protects against XSS attacks",



            "Strict-Transport-Security":
            "Enforces HTTPS connection",



            "X-Frame-Options":
            "Prevents clickjacking attacks",



            "X-Content-Type-Options":
            "Prevents MIME type attacks"



        }



        score = 100



        for header,description in security_headers.items():


            if header not in headers:


                score -= 20


                result["issues"].append({

                    "header": header,

                    "severity": "Medium",

                    "description": description,

                    "status": "Missing"

                })



        if score < 0:

            score = 0



        result["security_score"] = score



        return result




    except Exception as e:


        return {


            "error": str(e)

        }