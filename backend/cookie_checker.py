def check_cookies(response):


    cookies = response.cookies



    result = {

        "total": len(cookies),

        "cookies": []

    }




    for cookie in cookies:


        name = cookie.name



        cookie_data = {


            "name": name,


            "secure": cookie.secure,


            "httponly": False,


            "samesite": None,


            "risk": "Low",


            "issues": []

        }






        # ================= HTTP ONLY =================


        if hasattr(cookie, "_rest"):


            if "HttpOnly" in cookie._rest:

                cookie_data["httponly"] = True





        if not cookie_data["httponly"]:


            cookie_data["issues"].append(

                "Missing HttpOnly flag"

            )






        # ================= SECURE =================


        if not cookie.secure:


            cookie_data["issues"].append(

                "Missing Secure flag"

            )






        # ================= SAME SITE =================


        if hasattr(cookie, "_rest"):


            cookie_data["samesite"] = (

                cookie._rest.get(
                    "SameSite"
                )

            )




        if not cookie_data["samesite"]:


            cookie_data["issues"].append(

                "Missing SameSite policy"

            )








        # ================= RISK CALCULATION =================


        issue_count = len(
            cookie_data["issues"]
        )



        if issue_count >= 3:


            cookie_data["risk"] = "High"



        elif issue_count == 2:


            cookie_data["risk"] = "Medium"



        elif issue_count == 1:


            cookie_data["risk"] = "Low"



        else:


            cookie_data["risk"] = "Secure"







        result["cookies"].append(

            cookie_data

        )






    return result