from datetime import datetime



def generate_report(scan_data):


    website = scan_data.get(
        "website",
        {}
    )


    ssl = scan_data.get(
        "ssl",
        {}
    )


    headers = scan_data.get(
        "headers",
        {}
    )


    technologies = scan_data.get(
        "technologies",
        []
    )


    ports = scan_data.get(
        "ports",
        []
    )


    port_analysis = scan_data.get(
        "port_analysis",
        []
    )


    vulnerabilities = scan_data.get(
        "vulnerabilities",
        []
    )


    ai = scan_data.get(
        "ai_analysis",
        {}
    )



    issues = ai.get(
        "issues",
        []
    )


    recommendations = ai.get(
        "recommendations",
        []
    )



    report = {


        "id":

        datetime.now().strftime(
            "%Y%m%d%H%M%S"
        ),



        "date":

        datetime.now().strftime(
            "%d %B %Y"
        ),




        # KEEP STRING FOR FRONTEND

        "website":

        website.get(
            "domain",
            "Unknown"
        ),




        "ip":

        website.get(
            "ip",
            "Unknown"
        ),



        "hosting":

        website.get(
            "hosting",
            "Unknown"
        ),



        "https":

        website.get(
            "https",
            False
        ),





        "security_score":

        scan_data.get(
            "score",
            0
        ),





        "ssl_status":{


            "valid":

            ssl.get(
                "valid",
                False
            ),


            "issuer":

            ssl.get(
                "issuer",
                "Unknown"
            ),


            "expiry":

            ssl.get(
                "expiry",
                "Unknown"
            )

        },





        "security_headers":{


            "score":

            headers.get(
                "score",
                0
            ),


            "present":

            headers.get(
                "present",
                []
            ),


            "missing":

            headers.get(
                "missing",
                []
            )

        },

            "cookies": scan_data.get(
            "cookies",
                {}
        ),



        "technologies":

        technologies,





        "ports":

        ports,





        "port_analysis":

        port_analysis,





        "vulnerabilities":

        vulnerabilities,






        "ai_report":{


            "risk":

            ai.get(
                "risk",
                "Unknown"
            ),


            "issues":

            issues,


            "recommendations":

            recommendations

        },







        "summary":{


            "status":

            "Completed",


            "risk":

            ai.get(
                "risk",
                "Unknown"
            ),


            "duration":

            scan_data.get(
                "duration",
                "2 sec"
            ),


            "issues":

            len(issues)

        },





        "created_at":

        datetime.now().isoformat()


    }



    return report