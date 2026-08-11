import requests


def detect_technologies(url):

    technologies = []


    try:

        response = requests.get(
            url,
            timeout=5,
            headers={
                "User-Agent":
                "Mozilla/5.0"
            }
        )


        headers = response.headers

        html = response.text.lower()



        # =====================
        # SERVER DETECTION
        # =====================

        server = headers.get(
            "Server",
            ""
        ).lower()


        if "nginx" in server:

            technologies.append("Nginx")


        if "apache" in server:

            technologies.append("Apache")





        # =====================
        # CMS DETECTION
        # =====================


        if "wp-content" in html:

            technologies.append("WordPress")



        if "joomla" in html:

            technologies.append("Joomla")





        # =====================
        # FRONTEND DETECTION
        # =====================


        if "react" in html or "_next" in html:

            technologies.append("React")


        if "vue" in html:

            technologies.append("Vue.js")


        if "angular" in html:

            technologies.append("Angular")



        if "bootstrap" in html:

            technologies.append("Bootstrap")



        if "jquery" in html:

            technologies.append("jQuery")







        # =====================
        # HEADER TECHNOLOGY
        # =====================

        powered = headers.get(
            "X-Powered-By",
            ""
        ).lower()



        if "php" in powered:

            technologies.append("PHP")


        if "express" in powered:

            technologies.append("Node.js Express")








        # =====================
        # DEFAULT
        # =====================

        if len(technologies)==0:

            technologies.append(
                "No Framework Detected"
            )



        return list(set(technologies))





    except Exception as e:

        print(
            "Technology Error:",
            e
        )

        return [
            "Detection Failed"
        ]