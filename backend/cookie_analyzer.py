def analyze_browser_cookies(cookies):


    result = {

        "total": len(cookies),

        "cookies": [],

        "high_risk": 0,

        "medium_risk": 0

    }



    for cookie in cookies:


        risk = "Secure"



        if (
            cookie["secure"] == False
            and
            cookie["httpOnly"] == False
        ):

            risk = "High"

            result["high_risk"] += 1



        elif (
            cookie["httpOnly"] == False
            or
            cookie["sameSite"] in [None,""]
        ):

            risk = "Medium"

            result["medium_risk"] += 1




        result["cookies"].append({

            "name": cookie["name"],

            "secure": cookie["secure"],

            "httpOnly": cookie["httpOnly"],

            "sameSite": cookie["sameSite"],

            "risk": risk

        })



    return result