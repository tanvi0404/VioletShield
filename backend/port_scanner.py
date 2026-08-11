import socket


def scan_ports(domain):

    ports = {

        21: "FTP",
        22: "SSH",
        23: "Telnet",
        25: "SMTP",
        53: "DNS",
        80: "HTTP",
        443: "HTTPS",
        3306: "MySQL",
        5432: "PostgreSQL",
        8080: "HTTP Proxy"

    }


    open_ports = []


    try:

        ip = socket.gethostbyname(domain)

        print("Scanning IP:", ip)


        for port, service in ports.items():

            sock = socket.socket(
                socket.AF_INET,
                socket.SOCK_STREAM
            )

            sock.settimeout(1)


            result = sock.connect_ex(
                (ip, port)
            )


            if result == 0:

                open_ports.append({

                    "port": port,
                    "service": service,
                    "status": "Open"

                })


            sock.close()


        return open_ports



    except Exception as e:

        print("Port Scanner Error:", e)

        return []



# Testing

if __name__ == "__main__":

    result = scan_ports("google.com")

    print("RESULT:")
    print(result)