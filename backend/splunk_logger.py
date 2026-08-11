import requests
import json
import urllib3


# Disable SSL warning for localhost Splunk
urllib3.disable_warnings()


SPLUNK_URL = "https://localhost:8088/services/collector"


SPLUNK_TOKEN = "dd0c7bdd-849b-4120-addf-d9c677b08457"



def send_to_splunk(data):


    headers = {

        "Authorization": f"Splunk {SPLUNK_TOKEN}",

        "Content-Type": "application/json"

    }



    payload = {

        "event": data,

        "sourcetype": "_json",

        "index": "violetshield"

    }



    try:


        response = requests.post(

            SPLUNK_URL,

            headers=headers,

            data=json.dumps(payload),

            verify=False

        )


        print(
            "SPLUNK RESPONSE:",
            response.text
        )


    except Exception as e:


        print(
            "SPLUNK ERROR:",
            e
        )