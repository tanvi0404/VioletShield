import socket


def grab_banner(host, port, timeout=3):

    try:

        sock = socket.create_connection(
            (host, port),
            timeout=timeout
        )

        sock.settimeout(timeout)


        # HTTP request for web services
        if port in [80, 8080]:

            request = (
                "GET / HTTP/1.1\r\n"
                f"Host: {host}\r\n"
                "Connection: close\r\n\r\n"
            )

            sock.send(
                request.encode()
            )


        data = sock.recv(2048)


        try:

            banner = data.decode(
                "utf-8",
                errors="replace"
            ).strip()


        except Exception:

            banner = "Binary response received"



        # Empty response handling
        if not banner:

            banner = "No banner detected"



        # Remove huge HTML responses
        if len(banner) > 300:

            banner = banner[:300] + "..."



        sock.close()


        return {

            "port": port,

            "banner": banner

        }



    except Exception as e:


        return {

            "port": port,

            "banner": None,

            "error": str(e)

        }