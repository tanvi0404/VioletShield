import os
import math
import hashlib
import mimetypes
import requests
from dotenv import load_dotenv

load_dotenv()

VT_API_KEY = os.getenv("VT_API_KEY")


def calculate_entropy(data_bytes):
    """
    Calculates the Shannon Entropy of a byte sequence (0.0 to 8.0).
    High entropy (> 7.2) typically indicates packed binaries, encrypted payloads, or compressed archives.
    """
    if not data_bytes:
        return 0.0

    entropy = 0.0
    byte_counts = [0] * 256
    for b in data_bytes:
        byte_counts[b] += 1

    total_len = len(data_bytes)
    for count in byte_counts:
        if count > 0:
            p = count / total_len
            entropy -= p * math.log2(p)

    return round(entropy, 2)


def compute_file_hashes(file_path_or_bytes):
    """
    Computes SHA-256, MD5, and SHA-1 cryptographic hashes.
    Supports either a file path string or raw bytes.
    """
    sha256 = hashlib.sha256()
    md5 = hashlib.md5()
    sha1 = hashlib.sha1()

    if isinstance(file_path_or_bytes, (bytes, bytearray)):
        sha256.update(file_path_or_bytes)
        md5.update(file_path_or_bytes)
        sha1.update(file_path_or_bytes)
    else:
        with open(file_path_or_bytes, "rb") as f:
            while chunk := f.read(65536):
                sha256.update(chunk)
                md5.update(chunk)
                sha1.update(chunk)

    return {
        "sha256": sha256.hexdigest(),
        "md5": md5.hexdigest(),
        "sha1": sha1.hexdigest()
    }


def extract_file_metadata(file_path, original_filename=None):
    """
    Extracts file size, extension, MIME type, magic byte signatures, and entropy.
    """
    filename = original_filename or os.path.basename(file_path)
    file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0

    _, ext = os.path.splitext(filename)
    extension = ext.lower().lstrip(".") if ext else "unknown"

    mime_type, _ = mimetypes.guess_type(filename)
    mime_type = mime_type or "application/octet-stream"

    # Read first 1MB for magic byte analysis and entropy
    sample_bytes = b""
    with open(file_path, "rb") as f:
        sample_bytes = f.read(1048576)

    entropy = calculate_entropy(sample_bytes)

    # Magic byte header fingerprinting
    file_type_magic = "Generic Binary / Unknown"
    if sample_bytes.startswith(b"MZ"):
        file_type_magic = "Windows PE Executable / DLL (MZ Header)"
    elif sample_bytes.startswith(b"\x7fELF"):
        file_type_magic = "Linux / Unix ELF Binary"
    elif sample_bytes.startswith(b"%PDF"):
        file_type_magic = "Adobe Portable Document Format (PDF)"
    elif sample_bytes.startswith(b"PK\x03\x04"):
        file_type_magic = "ZIP Compressed Archive / Office Open XML"
    elif sample_bytes.startswith(b"Rar!\x1a\x07"):
        file_type_magic = "RAR Compressed Archive"
    elif sample_bytes.startswith(b"\x1f\x8b"):
        file_type_magic = "GZIP Compressed File"
    elif sample_bytes.startswith(b"7z\xbc\xaf\x27\x1c"):
        file_type_magic = "7-Zip Compressed Archive"
    elif sample_bytes.startswith(b"#!/"):
        file_type_magic = "Script Executable (Shebang)"
    elif b"<?php" in sample_bytes[:200]:
        file_type_magic = "PHP Web Script"
    elif b"<html" in sample_bytes[:200].lower() or b"<!doctype html" in sample_bytes[:200].lower():
        file_type_magic = "HTML Web Document"
    elif mime_type.startswith("text/"):
        file_type_magic = "Plain Text / Script Source"

    # Human-readable size
    if file_size < 1024:
        readable_size = f"{file_size} B"
    elif file_size < 1048576:
        readable_size = f"{file_size / 1024:.2f} KB"
    else:
        readable_size = f"{file_size / 1048576:.2f} MB"

    return {
        "filename": filename,
        "extension": extension,
        "mime_type": mime_type,
        "file_size_bytes": file_size,
        "file_size_human": readable_size,
        "file_type_magic": file_type_magic,
        "entropy": entropy,
        "is_suspicious_entropy": entropy >= 7.2
    }


def query_virustotal_file_report(file_hash, timeout=10):
    """
    Queries VirusTotal v3 API by file hash (SHA-256, MD5, or SHA-1).
    """
    if not VT_API_KEY:
        return {
            "status": "API_KEY_MISSING",
            "message": "VirusTotal API key is not configured in .env",
            "detected": False
        }

    clean_hash = str(file_hash).strip()
    url = f"https://www.virustotal.com/api/v3/files/{clean_hash}"
    headers = {"x-apikey": VT_API_KEY}

    try:
        response = requests.get(url, headers=headers, timeout=timeout)

        if response.status_code == 404:
            return {
                "status": "NOT_FOUND",
                "message": "Hash not found in VirusTotal database (file may be novel or unanalyzed).",
                "detected": False,
                "stats": {"malicious": 0, "suspicious": 0, "harmless": 0, "undetected": 0}
            }

        if response.status_code != 200:
            return {
                "status": "ERROR",
                "message": f"VirusTotal API returned HTTP {response.status_code}",
                "detected": False
            }

        data = response.json().get("data", {})
        attributes = data.get("attributes", {})

        stats = attributes.get("last_analysis_stats", {
            "malicious": 0, "suspicious": 0, "harmless": 0, "undetected": 0
        })
        results = attributes.get("last_analysis_results", {})

        # Extract top notable AV engine results
        engine_detections = []
        notable_engines = [
            "Microsoft", "Kaspersky", "CrowdStrike", "Sophos", "ESET-NOD32",
            "BitDefender", "Symantec", "Avast", "Malwarebytes", "Fortinet"
        ]

        for eng_name, eng_info in results.items():
            category = eng_info.get("category")
            result_str = eng_info.get("result")
            if category in ["malicious", "suspicious"] or eng_name in notable_engines:
                engine_detections.append({
                    "engine_name": eng_name,
                    "category": category,
                    "result": result_str or "Clean / Undetected",
                    "engine_version": eng_info.get("engine_version", ""),
                    "method": eng_info.get("method", "")
                })

        # Sort: malicious engines first
        engine_detections.sort(key=lambda x: (0 if x["category"] == "malicious" else 1 if x["category"] == "suspicious" else 2))

        meaningful_name = attributes.get("meaningful_name") or attributes.get("type_description") or ""
        tags = attributes.get("tags", [])
        popular_threat_category = attributes.get("popular_threat_classification", {}).get("suggested_threat_label", "")

        return {
            "status": "SUCCESS",
            "detected": stats.get("malicious", 0) > 0 or stats.get("suspicious", 0) > 0,
            "stats": stats,
            "meaningful_name": meaningful_name,
            "popular_threat_label": popular_threat_category,
            "tags": tags,
            "reputation": attributes.get("reputation", 0),
            "total_engines": sum(stats.values()),
            "engine_detections": engine_detections[:25],
            "last_analysis_date": attributes.get("last_analysis_date")
        }

    except requests.exceptions.Timeout:
        return {
            "status": "TIMEOUT",
            "message": f"VirusTotal API request timed out after {timeout}s",
            "detected": False
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "message": str(e),
            "detected": False
        }


def analyze_file(file_path, original_filename=None, timeout=10):
    """
    Performs complete Phase 8 file & malware analysis:
      1. Cryptographic hashes (SHA-256, MD5, SHA-1)
      2. File metadata & Shannon entropy
      3. VirusTotal file reputation intelligence
      4. Threat scoring and actionable severity classification
    """
    metadata = extract_file_metadata(file_path, original_filename)
    hashes = compute_file_hashes(file_path)
    vt_report = query_virustotal_file_report(hashes["sha256"], timeout=timeout)

    # Threat Scoring & Risk Tier calculation
    malicious_count = vt_report.get("stats", {}).get("malicious", 0)
    suspicious_count = vt_report.get("stats", {}).get("suspicious", 0)
    total_engines = vt_report.get("total_engines", 0) or 70

    threat_score = 0
    threat_reasons = []
    recommended_actions = []

    if malicious_count > 0:
        threat_score += min(malicious_count * 5, 80)
        threat_reasons.append(f"Flagged as MALICIOUS by {malicious_count} antivirus engines on VirusTotal.")
        recommended_actions.append("Immediately quarantine the file and isolate host endpoints that executed this payload.")

    if suspicious_count > 0:
        threat_score += min(suspicious_count * 3, 20)
        threat_reasons.append(f"Flagged as SUSPICIOUS by {suspicious_count} security detection engines.")
        recommended_actions.append("Perform dynamic behavioral sandbox detonation to observe outbound command & control connections.")

    if metadata.get("is_suspicious_entropy"):
        threat_score += 15
        threat_reasons.append(f"High Shannon Entropy ({metadata['entropy']}/8.0) detected — indicates code packing, payload encryption, or obfuscation.")
        recommended_actions.append("De-obfuscate or unpack the binary to inspect underlying strings and import address tables (IAT).")

    threat_score = min(max(threat_score, 0), 100)

    # Risk Tier classification
    if malicious_count >= 5 or threat_score >= 70:
        severity = "CRITICAL"
        risk_label = "Confirmed Malicious Artifact"
    elif malicious_count > 0 or threat_score >= 40:
        severity = "HIGH"
        risk_label = "High Threat Potential"
    elif suspicious_count > 0 or threat_score >= 15 or metadata.get("is_suspicious_entropy"):
        severity = "MEDIUM"
        risk_label = "Suspicious / Anomalous File"
    elif vt_report.get("status") == "NOT_FOUND":
        severity = "LOW"
        risk_label = "Unseen / Novel Binary (No Detections)"
        threat_reasons.append("File hash is unknown in global threat intelligence databases.")
        recommended_actions.append("Review file origin, developer digital certificates, and execution permissions.")
    else:
        severity = "CLEAN"
        risk_label = "Clean / No Malicious Indicators"
        threat_reasons.append("Zero security engines flagged this file as malicious.")
        recommended_actions.append("File satisfies baseline cryptographic and reputation safety checks.")

    return {
        "filename": metadata["filename"],
        "metadata": metadata,
        "hashes": hashes,
        "virustotal": vt_report,
        "security_assessment": {
            "severity": severity,
            "risk_label": risk_label,
            "threat_score": threat_score,
            "detection_ratio": f"{malicious_count}/{total_engines}",
            "threat_reasons": threat_reasons,
            "recommended_actions": recommended_actions
        }
    }
