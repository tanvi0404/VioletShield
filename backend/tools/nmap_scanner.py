import nmap


def run_nmap_scan(target):

    scanner = nmap.PortScanner()

    try:

        scanner.scan(
            target,
            arguments="-sV -O -T4"
        )


        result = {}


        for host in scanner.all_hosts():

            result[host] = {

                "os_matches":
                scanner[host].get(
                    "osmatch",
                    []
                ),


                "services": []

            }


            for proto in scanner[host].all_protocols():

                if proto == "tcp":

                    ports = scanner[host][proto].keys()


                    for port in ports:

                        service = scanner[host][proto][port]


                        result[host]["services"].append({

                            "port": port,

                            "name":
                            service.get(
                                "name",
                                ""
                            ),

                            "product":
                            service.get(
                                "product",
                                ""
                            ),

                            "version":
                            service.get(
                                "version",
                                ""
                            ),

                            "state":
                            service.get(
                                "state",
                                ""
                            )

                        })


        return result


    except Exception as e:

        return {

            "error": str(e)

        }