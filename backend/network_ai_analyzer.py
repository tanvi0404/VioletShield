def analyze_network_security(port_analysis):

    issues = []
    recommendations = []
    attack_surface = []

    risk = "Low"


    threat_score = 0



    for port in port_analysis:


        # Attack surface data

        attack_surface.append({

            "service": port["service"],

            "port": port["port"],

            "risk": port["risk"]

        })




        if port["risk"] == "High":


            risk = "High"

            threat_score += 40



            issues.append({

                "title":
                f"Critical Port Exposure: {port['port']}",

                "severity":
                "High",

                "description":
                port["reason"]

            })



            recommendations.append(

                port["recommendation"]

            )





        elif port["risk"] == "Medium":



            if risk != "High":

                risk = "Medium"



            threat_score += 20



            issues.append({

                "title":
                f"Risky Service Detected: {port['port']}",

                "severity":
                "Medium",

                "description":
                port["reason"]

            })



            recommendations.append(

                port["recommendation"]

            )





        else:


            threat_score += 5





    if threat_score > 100:

        threat_score = 100






    if len(issues)==0:


        issues.append({

            "title":
            "No Major Network Threats",

            "severity":
            "Low",

            "description":
            "No risky exposed services detected."

        })


        recommendations.append(

            "Continue monitoring open ports regularly"

        )





    return {


        "risk":
        risk,


        "threat_score":
        threat_score,


        "attack_surface":
        attack_surface,


        "issues":
        issues,


        "recommendations":
        recommendations,


        "summary":
        f"{len(issues)} exposed security findings detected"


    }