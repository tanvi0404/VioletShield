import os
import time
import socket
import subprocess
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse

# Default high-impact wordlist curated from SecLists (Discovery/Web-Content)
DEFAULT_DIR_WORDLIST = [
    "admin",
    "admin/login",
    "administrator",
    "login",
    "signin",
    "dashboard",
    "portal",
    "api",
    "api/v1",
    "api/v2",
    "api/docs",
    "swagger",
    "swagger-ui.html",
    "swagger/v1/swagger.json",
    "openapi.json",
    "graphql",
    "console",
    "actuator",
    "actuator/health",
    "actuator/env",
    ".env",
    ".env.backup",
    ".env.production",
    ".git/HEAD",
    ".git/config",
    ".gitignore",
    ".svn/entries",
    ".htaccess",
    "web.config",
    "robots.txt",
    "sitemap.xml",
    "crossdomain.xml",
    "phpinfo.php",
    "info.php",
    "server-status",
    "status",
    "backup",
    "backup.zip",
    "backup.tar.gz",
    "backup.sql",
    "database.sql",
    "db.sql",
    "dump.sql",
    "config.json",
    "config.php",
    "wp-admin",
    "wp-login.php",
    "wp-content",
    "xmlrpc.php",
    "uploads",
    "public",
    "static",
    "assets",
    "temp",
    "tmp",
    "test",
    "debug",
    "manager/html",
    "cpanel",
    "phpmyadmin"
]

def check_single_path(base_url, path, timeout=4):
    """
    Checks a single path against the target URL.
    Returns result dict if the path responds with an interesting HTTP status code.
    """
    clean_path = path.strip().lstrip("/")
    target = urljoin(base_url.rstrip("/") + "/", clean_path)

    start = time.time()
    try:
        resp = requests.get(
            target,
            timeout=timeout,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) VioletShield-Gobuster/2.0"},
            verify=False,
            allow_redirects=False
        )
        duration_ms = round((time.time() - start) * 1000)

        status = resp.status_code
        content_length = len(resp.content) if resp.content else 0

        # Interesting HTTP status codes for directory enumeration:
        # 200 (OK), 204 (No Content), 301/302/307/308 (Redirects), 401 (Auth Required), 403 (Forbidden), 500 (Server Error)
        if status in [200, 201, 204, 301, 302, 303, 307, 308, 401, 403, 405, 500]:
            location = resp.headers.get("Location", "")
            return {
                "path": f"/{clean_path}",
                "url": target,
                "status_code": status,
                "content_length": content_length,
                "response_time_ms": duration_ms,
                "redirect_url": location if location else None,
                "server": resp.headers.get("Server", "")
            }
        return None
    except Exception:
        return None


def run_gobuster_scan(target_url, wordlist=None, threads=15, timeout=4, max_paths=60):
    """
    Executes high-concurrency directory enumeration.
    
    Args:
        target_url (str): The web target (e.g., 'http://192.168.1.50' or 'example.com')
        wordlist (list[str], optional): Custom wordlist paths.
        threads (int): Concurrency limit. Default 15.
        timeout (int): Timeout per request in seconds. Default 4.
        max_paths (int): Maximum paths to test. Default 60.
        
    Returns:
        dict: Structured directory enumeration results.
    """
    if not target_url or not str(target_url).strip():
        return {
            "error": "Target URL is required",
            "target": "",
            "discovered_paths": [],
            "total_tested": 0
        }

    raw_target = str(target_url).strip()
    if not raw_target.startswith("http://") and not raw_target.startswith("https://"):
        raw_target = f"https://{raw_target}"

    # Verify base target reachability, fall back to http if https fails
    final_base = raw_target
    try:
        requests.get(raw_target, timeout=5, verify=False, allow_redirects=True)
    except Exception:
        if raw_target.startswith("https://"):
            http_alt = raw_target.replace("https://", "http://", 1)
            try:
                requests.get(http_alt, timeout=5, verify=False, allow_redirects=True)
                final_base = http_alt
            except Exception:
                pass

    paths_to_test = list(wordlist) if wordlist else list(DEFAULT_DIR_WORDLIST)
    if max_paths and len(paths_to_test) > max_paths:
        paths_to_test = paths_to_test[:max_paths]

    discovered = []
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=max(1, min(threads, 30))) as executor:
        futures = {
            executor.submit(check_single_path, final_base, path, timeout): path
            for path in paths_to_test
        }

        for future in as_completed(futures):
            try:
                res = future.result()
                if res:
                    discovered.append(res)
            except Exception:
                pass

    # Sort discovered paths: 200 OK first, then 30x, then 401/403
    status_priority = {200: 1, 201: 2, 301: 3, 302: 4, 307: 5, 401: 6, 403: 7, 500: 8}
    discovered.sort(key=lambda x: (status_priority.get(x["status_code"], 99), x["path"]))

    duration_sec = round(time.time() - start_time, 2)

    return {
        "target": final_base,
        "total_tested": len(paths_to_test),
        "total_discovered": len(discovered),
        "duration_sec": duration_sec,
        "discovered_paths": discovered
    }
