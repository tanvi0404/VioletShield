def analyze_ports(ports):

    analysis = []


    for port in ports:


        risk = "Low"
        reason = ""
        recommendation = ""



        if port["port"] == 21:

            risk = "High"

            reason = "FTP transfers data without encryption"

            recommendation = "Disable FTP and use SFTP"



        elif port["port"] == 22:

            risk = "Medium"

            reason = "SSH remote access exposed"

            recommendation = "Restrict SSH access"



        elif port["port"] == 23:

            risk = "High"

            reason = "Telnet sends data without encryption"

            recommendation = "Disable Telnet"



        elif port["port"] == 80:

            risk = "Medium"

            reason = "HTTP traffic is not encrypted"

            recommendation = "Enable HTTPS"



        elif port["port"] == 443:

            risk = "Low"

            reason = "HTTPS encrypted communication"

            recommendation = "Keep SSL certificate updated"



        elif port["port"] in [3306,5432]:

            risk = "High"

            reason = "Database port exposed publicly"

            recommendation = "Restrict database access"



        else:

            risk = "Medium"

            reason = "Unknown exposed service"

            recommendation = "Review firewall rules"



        analysis.append({

            "port": port["port"],

            "service": port["service"],

            "risk": risk,

            "reason": reason,

            "recommendation": recommendation

        })


    return analysis