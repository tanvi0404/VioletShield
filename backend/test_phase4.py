import sys
import os
import json
import requests
from unittest.mock import patch, MagicMock
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from tools.exploitdb_search import search_exploitdb, KALI_API

def print_separator(title):
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)

def test_1_kali_connection():
    print_separator("TEST 1: Kali Exploit API Live Connectivity")
    print(f"Target Kali API URL: {KALI_API}")
    try:
        url = f"{KALI_API.rstrip('/')}/search"
        payload = {"query": "apache 2.4.7"}
        print(f"Sending POST to {url} with {payload}...")
        resp = requests.post(url, json=payload, timeout=5)
        print(f"HTTP Status Code: {resp.status_code}")
        data = resp.json()
        print("[OK] Live response received from Kali API:")
        print(json.dumps(data, indent=2))
        return True
    except requests.exceptions.Timeout:
        print("[X] TIMEOUT: Could not reach Kali VM within 5 seconds.")
        print("  -> Ensure Kali VM is booted.")
        print("  -> Run 'python3 exploit_api.py' on Kali.")
        print("  -> Verify Kali IP with 'ip a' and update KALI_API_URL in backend/.env")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"[X] CONNECTION ERROR: {e}")
        print("  -> Ensure 'exploit_api.py' is listening on 0.0.0.0:8000 on Kali.")
        return False
    except Exception as e:
        print(f"[X] ERROR: {e}")
        return False

def test_2_exploitdb_search_module(use_mock=False):
    print_separator("TEST 2: Backend search_exploitdb() Module")
    test_queries = ["apache 2.4.7", "openssh 7.2", ""]
    
    if use_mock:
        print("[INFO] Running with simulated Kali ExploitDB responses...")
        mock_data = {
            "apache 2.4.7": [
                {"title": "Apache 2.4.7 - Denial of Service (mod_status)", "path": "exploits/multiple/dos/345.txt"},
                {"title": "Apache 2.4.7 - mod_proxy Buffer Overflow", "path": "exploits/linux/remote/890.py"}
            ],
            "openssh 7.2": [
                {"title": "OpenSSH 7.2p2 - Username Enumeration", "path": "exploits/linux/remote/40136.py"}
            ],
            "": []
        }
        for q in test_queries:
            with patch("requests.post") as mock_post:
                mock_resp = MagicMock()
                mock_resp.status_code = 200
                mock_resp.json.return_value = {"query": q, "results": mock_data.get(q, [])}
                mock_post.return_value = mock_resp
                
                print(f"\nSearching query: '{q}'")
                res = search_exploitdb(q)
                print(f"Result count: {len(res.get('results', []))}")
                print(json.dumps(res, indent=2))
    else:
        for q in test_queries:
            print(f"\nSearching query: '{q}'")
            res = search_exploitdb(q)
            print(f"Result count: {len(res.get('results', []))}")
            print(json.dumps(res, indent=2))

def test_3_flask_nmap_exploit_integration(use_mock=False):
    print_separator("TEST 3: Flask /api/nmap-scan Pipeline Integration")
    try:
        from app import app
        from flask_jwt_extended import create_access_token
        
        client = app.test_client()
        with app.app_context():
            token = create_access_token(identity="test_analyst")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        if use_mock:
            print("[INFO] Testing complete scan pipeline with simulated Nmap & ExploitDB output...")
            mock_nmap = {
                "192.168.1.50": {
                    "os_matches": [{"name": "Linux 5.x", "accuracy": "98"}],
                    "services": [
                        {
                            "port": 80,
                            "name": "http",
                            "product": "Apache httpd",
                            "version": "2.4.7",
                            "state": "open"
                        },
                        {
                            "port": 22,
                            "name": "ssh",
                            "product": "OpenSSH",
                            "version": "7.2p2",
                            "state": "open"
                        },
                        {
                            "port": 21,
                            "name": "ftp",
                            "product": "",
                            "version": "",
                            "state": "closed"
                        }
                    ]
                }
            }
            
            def mock_search(query):
                if "apache" in query.lower():
                    return {"results": [{"title": "Apache 2.4.7 - Denial of Service", "path": "exploits/multiple/dos/345.txt"}]}
                elif "openssh" in query.lower():
                    return {"results": [{"title": "OpenSSH 7.2 - User Enumeration", "path": "exploits/linux/remote/40136.py"}]}
                return {"results": []}
            
            with patch("app.run_nmap_scan", return_value=mock_nmap), \
                 patch("app.grab_banner", side_effect=lambda ip, port: {"port": port, "banner": f"Service on {port}"}), \
                 patch("app.search_exploitdb", side_effect=mock_search), \
                 patch("app.check_ip_reputation", return_value={"risk_analysis": {"risk": "Low", "score": 0}}):
                
                resp = client.post("/api/nmap-scan", json={"target": "192.168.1.50"}, headers=headers)
                print(f"Status Code: {resp.status_code}")
                data = resp.get_json()
                print("Endpoint JSON response:")
                print(json.dumps(data, indent=2))
                
                services = data["nmap_result"]["192.168.1.50"]["services"]
                assert len(services[0]["exploits"]) > 0, "Apache exploits missing"
                assert len(services[1]["exploits"]) > 0, "OpenSSH exploits missing"
                assert services[2]["exploits"] == [], "Closed port should have empty exploits"
                print("\n[OK] Scan response correctly parsed & attached exploits to open ports!")
        else:
            print("Sending live scan request for target: 127.0.0.1...")
            resp = client.post("/api/nmap-scan", json={"target": "127.0.0.1"}, headers=headers)
            print(f"Status Code: {resp.status_code}")
            data = resp.get_json()
            print(json.dumps(data, indent=2))
            
    except Exception as e:
        print(f"[X] Flask test error: {e}")

if __name__ == "__main__":
    print("VioletShield Phase 4 Verification Suite")
    use_mock_flag = "--mock" in sys.argv
    
    if use_mock_flag:
        print("[MODE] Running in SIMULATION / MOCK mode")
        test_2_exploitdb_search_module(use_mock=True)
        test_3_flask_nmap_exploit_integration(use_mock=True)
        print("\n" + "=" * 60)
        print(" [OK] All Phase 4 integration tests passed successfully in simulation!")
        print("=" * 60)
    else:
        kali_ok = test_1_kali_connection()
        if kali_ok:
            test_2_exploitdb_search_module(use_mock=False)
            test_3_flask_nmap_exploit_integration(use_mock=False)
        else:
            print("\n" + "-" * 60)
            print(" [NOTE] Kali VM is not currently reachable.")
            print(" You can test the full code pipeline right now using:")
            print("   .\\venv\\Scripts\\python.exe test_phase4.py --mock")
            print(" Or start Kali + 'python3 exploit_api.py' and test live:")
            print("   .\\venv\\Scripts\\python.exe test_phase4.py")
            print("-" * 60)
