import re
import os
import json
import yaml


# =============================================================================
# CIS & OWASP CLOUD INFRASTRUCTURE SECURITY RULES DATABASE
# =============================================================================

IAC_SECURITY_RULES = {
    # ------------------ TERRAFORM RULES ------------------
    "CKV_AWS_20": {
        "id": "CKV_AWS_20",
        "format": "terraform",
        "severity": "CRITICAL",
        "title": "S3 Bucket allows Public Read/Write ACL",
        "description": "S3 bucket is configured with 'public-read' or 'public-read-write' ACL, exposing bucket data to the public internet.",
        "benchmark": "CIS AWS Foundations Benchmark v1.4 (2.1.1)",
        "remediation": "Set acl = \"private\" or remove public ACL and configure AWS S3 Public Access Block.",
        "remediation_code": 'resource "aws_s3_bucket" "secure_bucket" {\n  bucket = "my-secure-bucket"\n  acl    = "private"\n}'
    },
    "CKV_AWS_24": {
        "id": "CKV_AWS_24",
        "format": "terraform",
        "severity": "HIGH",
        "title": "Security Group allows unrestricted SSH Ingress (Port 22)",
        "description": "Security Group opens TCP port 22 (SSH) to 0.0.0.0/0 (the entire internet), allowing brute-force remote login attacks.",
        "benchmark": "CIS AWS Foundations Benchmark v1.4 (4.1)",
        "remediation": "Restrict SSH ingress cidr_blocks to specific corporate VPN or bastion IP addresses.",
        "remediation_code": 'ingress {\n  from_port   = 22\n  to_port     = 22\n  protocol    = "tcp"\n  cidr_blocks = ["10.0.0.0/16"] # Restrict to internal CIDR\n}'
    },
    "CKV_AWS_25": {
        "id": "CKV_AWS_25",
        "format": "terraform",
        "severity": "HIGH",
        "title": "Security Group allows unrestricted RDP Ingress (Port 3389)",
        "description": "Security Group opens TCP port 3389 (RDP) to 0.0.0.0/0, creating a significant remote desktop vulnerability.",
        "benchmark": "CIS AWS Foundations Benchmark v1.4 (4.2)",
        "remediation": "Restrict RDP ingress cidr_blocks to authorized enterprise networks only.",
        "remediation_code": 'ingress {\n  from_port   = 3389\n  to_port     = 3389\n  protocol    = "tcp"\n  cidr_blocks = ["192.168.1.0/24"]\n}'
    },
    "CKV_AWS_3": {
        "id": "CKV_AWS_3",
        "format": "terraform",
        "severity": "HIGH",
        "title": "EBS Volume Storage Encryption is Disabled",
        "description": "Elastic Block Store (EBS) volume is created without encryption at rest, leaving data vulnerable on physical storage drives.",
        "benchmark": "CIS AWS Foundations Benchmark v1.4 (2.2.1)",
        "remediation": "Enable encrypted = true on all aws_ebs_volume and aws_instance root block devices.",
        "remediation_code": 'resource "aws_ebs_volume" "secure_vol" {\n  availability_zone = "us-east-1a"\n  size              = 40\n  encrypted         = true\n}'
    },
    "CKV_AWS_62": {
        "id": "CKV_AWS_62",
        "format": "terraform",
        "severity": "HIGH",
        "title": "IAM Policy allows Wildcard Action (*)",
        "description": "IAM policy allows Action = \"*\" or Resource = \"*\", granting excessive administrative privileges (Principle of Least Privilege violation).",
        "benchmark": "CIS AWS Foundations Benchmark v1.4 (1.16)",
        "remediation": "Specify granular explicit actions (e.g., [\"s3:GetObject\", \"s3:PutObject\"]) instead of wildcard asterisks.",
        "remediation_code": 'statement {\n  actions   = ["s3:GetObject"]\n  resources = ["${aws_s3_bucket.data.arn}/*"]\n}'
    },

    # ------------------ KUBERNETES RULES ------------------
    "CKV_K8S_16": {
        "id": "CKV_K8S_16",
        "format": "kubernetes",
        "severity": "CRITICAL",
        "title": "Container configured with Privileged SecurityContext",
        "description": "Container runs in privileged mode (privileged: true), enabling container breakout and full host root takeover.",
        "benchmark": "CIS Kubernetes Benchmark v1.6 (5.2.1)",
        "remediation": "Set securityContext.privileged to false in the container spec.",
        "remediation_code": 'securityContext:\n  privileged: false\n  allowPrivilegeEscalation: false'
    },
    "CKV_K8S_20": {
        "id": "CKV_K8S_20",
        "format": "kubernetes",
        "severity": "HIGH",
        "title": "Container allowed to run as Root User",
        "description": "Container does not enforce non-root execution (runAsNonRoot: true or runAsUser > 0), allowing root-level access if breached.",
        "benchmark": "CIS Kubernetes Benchmark v1.6 (5.2.6)",
        "remediation": "Add securityContext with runAsNonRoot: true and runAsUser: 10001.",
        "remediation_code": 'securityContext:\n  runAsNonRoot: true\n  runAsUser: 10001'
    },
    "CKV_K8S_10": {
        "id": "CKV_K8S_10",
        "format": "kubernetes",
        "severity": "MEDIUM",
        "title": "CPU / Memory Resource Limits are Missing",
        "description": "Container spec does not define resources.limits, exposing the Kubernetes cluster to Denial of Service (DoS) noisy neighbor exhaustion.",
        "benchmark": "CIS Kubernetes Benchmark v1.6 (5.2.13)",
        "remediation": "Define explicit CPU and Memory resource requests and limits.",
        "remediation_code": 'resources:\n  limits:\n    cpu: "500m"\n    memory: "512Mi"\n  requests:\n    cpu: "200m"\n    memory: "256Mi"'
    },
    "CKV_K8S_19": {
        "id": "CKV_K8S_19",
        "format": "kubernetes",
        "severity": "HIGH",
        "title": "Pod configured with Host Network Access (hostNetwork: true)",
        "description": "Pod shares the host node's network namespace, bypassing cluster network policies and intercepting loopback traffic.",
        "benchmark": "CIS Kubernetes Benchmark v1.6 (5.2.4)",
        "remediation": "Set hostNetwork: false on the Pod spec.",
        "remediation_code": 'spec:\n  hostNetwork: false'
    },

    # ------------------ DOCKERFILE RULES ------------------
    "CKV_DOCKER_3": {
        "id": "CKV_DOCKER_3",
        "format": "dockerfile",
        "severity": "HIGH",
        "title": "Dockerfile lacks non-root USER instruction",
        "description": "Container image starts processes as default root user, increasing the attack blast radius upon application compromise.",
        "benchmark": "CIS Docker Benchmark v1.3 (4.1)",
        "remediation": "Create a dedicated non-root user and add USER <username> before the ENTRYPOINT/CMD instruction.",
        "remediation_code": 'RUN addgroup -S appgroup && adduser -S appuser -G appgroup\nUSER appuser'
    },
    "CKV_DOCKER_7": {
        "id": "CKV_DOCKER_7",
        "format": "dockerfile",
        "severity": "MEDIUM",
        "title": "Base image uses unpinned 'latest' tag",
        "description": "FROM instruction uses ':latest' or unversioned image tags, creating non-deterministic builds and supply chain risks.",
        "benchmark": "CIS Docker Benchmark v1.3 (4.2)",
        "remediation": "Pin base images with specific semver tags or immutable SHA256 digests.",
        "remediation_code": 'FROM node:20.11.0-alpine3.19\n# OR\nFROM python@sha256:7c9e...'
    },
    "CKV_DOCKER_2": {
        "id": "CKV_DOCKER_2",
        "format": "dockerfile",
        "severity": "LOW",
        "title": "Dockerfile missing HEALTHCHECK instruction",
        "description": "Container does not specify a HEALTHCHECK command to monitor runtime container liveness and integrity.",
        "benchmark": "CIS Docker Benchmark v1.3 (4.6)",
        "remediation": "Add a HEALTHCHECK instruction in the Dockerfile.",
        "remediation_code": 'HEALTHCHECK --interval=30s --timeout=5s \\\n  CMD curl -f http://localhost:8080/health || exit 1'
    },
    "CKV_DOCKER_4": {
        "id": "CKV_DOCKER_4",
        "format": "dockerfile",
        "severity": "CRITICAL",
        "title": "Sensitive Secrets / API Keys detected in ENV instruction",
        "description": "Dockerfile sets passwords, private keys, or API tokens using ENV or ARG, which persist permanently in image layer metadata.",
        "benchmark": "OWASP Container Security Verification (C4.1)",
        "remediation": "Inject secrets at runtime via Kubernetes Secrets or Docker Secret mounts instead of baking into layers.",
        "remediation_code": '# Avoid: ENV AWS_SECRET_ACCESS_KEY=...\n# Use runtime environment injection'
    }
}


def scan_terraform_code(code_str, file_name="main.tf"):
    """
    Performs static security analysis on Terraform HCL code.
    """
    findings = []
    lines = code_str.splitlines()

    # Rule 1: Public S3 Bucket ACL
    for idx, line in enumerate(lines):
        if re.search(r'acl\s*=\s*["\']public-(read|read-write)["\']', line, re.IGNORECASE):
            findings.append({
                "rule_id": "CKV_AWS_20",
                "file_name": file_name,
                "line_number": idx + 1,
                "resource": "aws_s3_bucket",
                "code_snippet": line.strip(),
                **IAC_SECURITY_RULES["CKV_AWS_20"]
            })

    # Rule 2: Insecure SSH Security Group (Port 22 on 0.0.0.0/0)
    for idx, line in enumerate(lines):
        if re.search(r'from_port\s*=\s*22', line) or re.search(r'to_port\s*=\s*22', line):
            # Check proximity for 0.0.0.0/0
            window = "\n".join(lines[max(0, idx-5):min(len(lines), idx+6)])
            if "0.0.0.0/0" in window:
                findings.append({
                    "rule_id": "CKV_AWS_24",
                    "file_name": file_name,
                    "line_number": idx + 1,
                    "resource": "aws_security_group",
                    "code_snippet": line.strip(),
                    **IAC_SECURITY_RULES["CKV_AWS_24"]
                })
                break

    # Rule 3: Insecure RDP Security Group (Port 3389 on 0.0.0.0/0)
    for idx, line in enumerate(lines):
        if re.search(r'from_port\s*=\s*3389', line) or re.search(r'to_port\s*=\s*3389', line):
            window = "\n".join(lines[max(0, idx-5):min(len(lines), idx+6)])
            if "0.0.0.0/0" in window:
                findings.append({
                    "rule_id": "CKV_AWS_25",
                    "file_name": file_name,
                    "line_number": idx + 1,
                    "resource": "aws_security_group",
                    "code_snippet": line.strip(),
                    **IAC_SECURITY_RULES["CKV_AWS_25"]
                })
                break

    # Rule 4: Unencrypted EBS Volume
    if "aws_ebs_volume" in code_str or "root_block_device" in code_str:
        if not re.search(r'encrypted\s*=\s*true', code_str, re.IGNORECASE):
            findings.append({
                "rule_id": "CKV_AWS_3",
                "file_name": file_name,
                "line_number": 1,
                "resource": "aws_ebs_volume",
                "code_snippet": "resource \"aws_ebs_volume\" (encrypted = true missing)",
                **IAC_SECURITY_RULES["CKV_AWS_3"]
            })

    # Rule 5: Wildcard IAM Policy
    for idx, line in enumerate(lines):
        if re.search(r'actions?\s*=\s*\[.*["\']\*["\'].*\]', line) or re.search(r'"Action"\s*:\s*"\*"', line):
            findings.append({
                "rule_id": "CKV_AWS_62",
                "file_name": file_name,
                "line_number": idx + 1,
                "resource": "aws_iam_policy",
                "code_snippet": line.strip(),
                **IAC_SECURITY_RULES["CKV_AWS_62"]
            })

    return findings


def scan_kubernetes_code(code_str, file_name="k8s-manifest.yaml"):
    """
    Performs static security analysis on Kubernetes YAML manifests.
    """
    findings = []
    lines = code_str.splitlines()

    # Rule 1: Privileged container
    for idx, line in enumerate(lines):
        if re.search(r'privileged\s*:\s*true', line, re.IGNORECASE):
            findings.append({
                "rule_id": "CKV_K8S_16",
                "file_name": file_name,
                "line_number": idx + 1,
                "resource": "SecurityContext",
                "code_snippet": line.strip(),
                **IAC_SECURITY_RULES["CKV_K8S_16"]
            })

    # Rule 2: Root user execution (missing runAsNonRoot or runAsUser: 0)
    if "containers:" in code_str:
        if not re.search(r'runAsNonRoot\s*:\s*true', code_str, re.IGNORECASE):
            findings.append({
                "rule_id": "CKV_K8S_20",
                "file_name": file_name,
                "line_number": 1,
                "resource": "PodSecurityContext",
                "code_snippet": "securityContext (runAsNonRoot: true missing)",
                **IAC_SECURITY_RULES["CKV_K8S_20"]
            })

    # Rule 3: Missing resource limits
    if "containers:" in code_str:
        if not re.search(r'resources\s*:', code_str, re.IGNORECASE) or not re.search(r'limits\s*:', code_str, re.IGNORECASE):
            findings.append({
                "rule_id": "CKV_K8S_10",
                "file_name": file_name,
                "line_number": 1,
                "resource": "ContainerResources",
                "code_snippet": "resources.limits (cpu / memory limits missing)",
                **IAC_SECURITY_RULES["CKV_K8S_10"]
            })

    # Rule 4: Host network access
    for idx, line in enumerate(lines):
        if re.search(r'hostNetwork\s*:\s*true', line, re.IGNORECASE):
            findings.append({
                "rule_id": "CKV_K8S_19",
                "file_name": file_name,
                "line_number": idx + 1,
                "resource": "PodSpec",
                "code_snippet": line.strip(),
                **IAC_SECURITY_RULES["CKV_K8S_19"]
            })

    return findings


def scan_dockerfile_code(code_str, file_name="Dockerfile"):
    """
    Performs static security analysis on Dockerfile instructions.
    """
    findings = []
    lines = code_str.splitlines()

    # Rule 1: Missing USER (running as root)
    has_user_instruction = False
    for line in lines:
        if re.match(r'^\s*USER\s+\S+', line, re.IGNORECASE):
            has_user_instruction = True
            break
    if not has_user_instruction:
        findings.append({
            "rule_id": "CKV_DOCKER_3",
            "file_name": file_name,
            "line_number": len(lines),
            "resource": "Dockerfile",
            "code_snippet": "Missing USER non-root instruction before ENTRYPOINT/CMD",
            **IAC_SECURITY_RULES["CKV_DOCKER_3"]
        })

    # Rule 2: Unpinned 'latest' tag in FROM
    for idx, line in enumerate(lines):
        if re.match(r'^\s*FROM\s+', line, re.IGNORECASE):
            if ":latest" in line or (":" not in line.split()[1] and "@" not in line.split()[1]):
                findings.append({
                    "rule_id": "CKV_DOCKER_7",
                    "file_name": file_name,
                    "line_number": idx + 1,
                    "resource": "FROM BaseImage",
                    "code_snippet": line.strip(),
                    **IAC_SECURITY_RULES["CKV_DOCKER_7"]
                })

    # Rule 3: Missing HEALTHCHECK
    has_healthcheck = any(re.match(r'^\s*HEALTHCHECK\s+', l, re.IGNORECASE) for l in lines)
    if not has_healthcheck:
        findings.append({
            "rule_id": "CKV_DOCKER_2",
            "file_name": file_name,
            "line_number": 1,
            "resource": "HEALTHCHECK",
            "code_snippet": "Missing HEALTHCHECK instruction in image specification",
            **IAC_SECURITY_RULES["CKV_DOCKER_2"]
        })

    # Rule 4: Leaked secrets in ENV or ARG
    for idx, line in enumerate(lines):
        if re.match(r'^\s*(ENV|ARG)\s+', line, re.IGNORECASE):
            if re.search(r'(PASSWORD|SECRET|API_KEY|TOKEN|PRIVATE_KEY)\s*=', line, re.IGNORECASE):
                findings.append({
                    "rule_id": "CKV_DOCKER_4",
                    "file_name": file_name,
                    "line_number": idx + 1,
                    "resource": "ENV/ARG",
                    "code_snippet": line.strip(),
                    **IAC_SECURITY_RULES["CKV_DOCKER_4"]
                })

    return findings


def scan_iac_snippet(code_str, format_type="terraform"):
    """
    Main entry point for scanning arbitrary code snippets.
    Supported format_types: 'terraform', 'kubernetes', 'dockerfile', 'cloudformation'
    """
    fmt = format_type.lower()
    findings = []

    if fmt in ["terraform", "tf"]:
        findings = scan_terraform_code(code_str, "snippet.tf")
    elif fmt in ["kubernetes", "k8s", "yaml", "yml"]:
        findings = scan_kubernetes_code(code_str, "manifest.yaml")
    elif fmt in ["dockerfile", "docker"]:
        findings = scan_dockerfile_code(code_str, "Dockerfile")
    else:
        # Auto-detect format
        if "apiVersion" in code_str or "kind:" in code_str:
            findings = scan_kubernetes_code(code_str, "manifest.yaml")
            fmt = "kubernetes"
        elif "FROM " in code_str or "RUN " in code_str:
            findings = scan_dockerfile_code(code_str, "Dockerfile")
            fmt = "dockerfile"
        else:
            findings = scan_terraform_code(code_str, "snippet.tf")
            fmt = "terraform"

    # Compute Compliance & Metrics
    critical_count = sum(1 for f in findings if f["severity"] == "CRITICAL")
    high_count = sum(1 for f in findings if f["severity"] == "HIGH")
    med_count = sum(1 for f in findings if f["severity"] == "MEDIUM")
    low_count = sum(1 for f in findings if f["severity"] == "LOW")

    total_rules_in_format = sum(1 for r in IAC_SECURITY_RULES.values() if r["format"] == fmt) or 5
    failed_count = len(findings)
    passed_count = max(0, total_rules_in_format - failed_count)

    # Compliance score formula
    deductions = (critical_count * 30) + (high_count * 20) + (med_count * 10) + (low_count * 5)
    compliance_score = max(0, min(100, 100 - deductions))

    status = "COMPLIANT" if compliance_score >= 85 else ("WARNING" if compliance_score >= 60 else "NON_COMPLIANT")

    return {
        "format": fmt,
        "status": status,
        "compliance_score": compliance_score,
        "summary": {
            "total_checks": total_rules_in_format,
            "passed_checks": passed_count,
            "failed_checks": failed_count,
            "severity_counts": {
                "critical": critical_count,
                "high": high_count,
                "medium": med_count,
                "low": low_count
            }
        },
        "findings": findings
    }


def scan_iac_file(file_path, original_filename=""):
    """
    Reads a file from disk, detects format, and executes the appropriate static analyzer.
    """
    if not os.path.exists(file_path):
        return {"error": "File not found on server"}

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    fname = (original_filename or os.path.basename(file_path)).lower()

    if fname.endswith(".tf") or fname.endswith(".tfvars"):
        fmt = "terraform"
    elif fname.endswith(".yaml") or fname.endswith(".yml"):
        fmt = "kubernetes"
    elif "dockerfile" in fname:
        fmt = "dockerfile"
    else:
        fmt = "terraform"

    result = scan_iac_snippet(content, fmt)
    result["file_name"] = original_filename or os.path.basename(file_path)
    return result


def get_supported_rules():
    """
    Returns the comprehensive dictionary of CIS & OWASP cloud benchmark rules.
    """
    return list(IAC_SECURITY_RULES.values())
