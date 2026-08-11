import ssl
import socket

from datetime import datetime

from cryptography import x509
from cryptography.hazmat.backends import default_backend



def check_ssl(domain):

    try:


        context = ssl.create_default_context()



        with socket.create_connection(
            (domain,443),
            timeout=5
        ) as sock:



            with context.wrap_socket(
                sock,
                server_hostname=domain
            ) as ssock:



                # Normal certificate info

                certificate = ssock.getpeercert()


                # Binary certificate
                cert_binary = ssock.getpeercert(
                    binary_form=True
                )


                cipher = ssock.cipher()



        # =========================
        # LOAD CERTIFICATE
        # =========================

        cert = x509.load_der_x509_certificate(
            cert_binary,
            default_backend()
        )



        # =========================
        # ISSUER
        # =========================

        issuer_name = "Unknown"



        for attribute in cert.issuer:

            if attribute.oid._name == "organizationName":

                issuer_name = attribute.value




        # =========================
        # SUBJECT DOMAIN
        # =========================

        subject_name = "Unknown"



        for attribute in cert.subject:

            if attribute.oid._name == "commonName":

                subject_name = attribute.value




        # =========================
        # DATES
        # =========================


        valid_from = cert.not_valid_before


        expiry = cert.not_valid_after



        days_remaining = (
            expiry - datetime.utcnow()
        ).days




        # =========================
        # SIGNATURE ALGORITHM
        # =========================

        signature_algorithm = (
            cert.signature_hash_algorithm.name
            if cert.signature_hash_algorithm
            else "Unknown"
        )





        return {


            "valid": True,


            "issuer":
            issuer_name,


            "subject":
            subject_name,



            "validFrom":
            valid_from.strftime(
                "%d %B %Y"
            ),



            "expiry":
            expiry.strftime(
                "%d %B %Y"
            ),



            "daysRemaining":
            days_remaining,



            "protocol":
            cipher[1]
            if cipher
            else "Unknown",



            "encryption":
            cipher[0]
            if cipher
            else "Unknown",



            "signatureAlgorithm":
            signature_algorithm


        }





    except Exception as e:


        return {


            "valid":False,


            "issuer":"Unknown",


            "subject":"Unknown",


            "validFrom":"Unknown",


            "expiry":"Unknown",


            "daysRemaining":0,


            "protocol":"Unknown",


            "encryption":"Unknown",


            "signatureAlgorithm":"Unknown",


            "error":str(e)

        }