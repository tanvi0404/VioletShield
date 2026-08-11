import whois


def get_domain_information(domain):

    try:

        data = whois.whois(domain)


        created = data.creation_date

        expiry = data.expiration_date


        if isinstance(created,list):
            created = created[0]


        if isinstance(expiry,list):
            expiry = expiry[0]



        result = {


            "domain": domain,


            "registrar":
            data.registrar
            if data.registrar
            else "Unknown",



            "created_date":
            str(created)
            if created
            else "Unknown",



            "expiry_date":
            str(expiry)
            if expiry
            else "Unknown",



            "organization":
            data.org
            if data.org
            else "Private / Hidden",



            "country":
            data.country
            if data.country
            else "Unknown",



            "nameservers":
            data.name_servers
            if data.name_servers
            else []

        }



        return result



    except Exception as e:


        return {

            "error":str(e)

        }