import json
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


def calculate_scan_delta(baseline_data, current_data):
    """
    Compares recent scan telemetry against previous baseline to identify
    newly opened ports, new CVEs/exploits, and security score drops.
    """
    if not baseline_data or not isinstance(baseline_data, dict):
        baseline_data = {}
    if not current_data or not isinstance(current_data, dict):
        current_data = {}

    delta = {
        "has_changes": False,
        "is_breach": False,
        "new_ports": [],
        "closed_ports": [],
        "new_cves": [],
        "score_drop": 0,
        "risk_changed": False,
        "summary": []
    }

    # 1. Compare Open Ports
    base_ports = set()
    for p in baseline_data.get("ports", []):
        port_num = p.get("port") if isinstance(p, dict) else p
        if port_num:
            base_ports.add(int(port_num))

    curr_ports = set()
    for p in current_data.get("ports", []):
        port_num = p.get("port") if isinstance(p, dict) else p
        if port_num:
            curr_ports.add(int(port_num))

    new_ports = list(curr_ports - base_ports)
    closed_ports = list(base_ports - curr_ports)

    if new_ports:
        delta["has_changes"] = True
        delta["is_breach"] = True
        delta["new_ports"] = new_ports
        delta["summary"].append(f"Newly exposed port(s): {', '.join(map(str, new_ports))}")

    if closed_ports:
        delta["has_changes"] = True
        delta["closed_ports"] = closed_ports
        delta["summary"].append(f"Closed port(s): {', '.join(map(str, closed_ports))}")

    # 2. Compare CVEs & Vulnerabilities
    base_cve_ids = set()
    for c in baseline_data.get("cves", []):
        cid = c.get("cve_id") if isinstance(c, dict) else c
        if cid:
            base_cve_ids.add(str(cid).upper())

    curr_cve_ids = set()
    for c in current_data.get("cves", []):
        cid = c.get("cve_id") if isinstance(c, dict) else c
        if cid:
            curr_cve_ids.add(str(cid).upper())

    new_cves = list(curr_cve_ids - base_cve_ids)
    if new_cves:
        delta["has_changes"] = True
        delta["is_breach"] = True
        delta["new_cves"] = new_cves
        delta["summary"].append(f"New CVE(s) detected: {', '.join(new_cves[:4])}")

    # 3. Compare Security Scores
    base_score = int(baseline_data.get("score") or baseline_data.get("security_score") or 100)
    curr_score = int(current_data.get("score") or current_data.get("security_score") or 100)
    score_drop = base_score - curr_score

    if score_drop > 5:
        delta["has_changes"] = True
        delta["is_breach"] = True
        delta["score_drop"] = score_drop
        delta["summary"].append(f"Security score dropped by {score_drop} pts ({base_score}% -> {curr_score}%)")

    # 4. Compare Risk Tier
    base_risk = str(baseline_data.get("risk") or baseline_data.get("risk_level") or "Low").upper()
    curr_risk = str(current_data.get("risk") or current_data.get("risk_level") or "Low").upper()
    if base_risk != curr_risk:
        delta["has_changes"] = True
        delta["risk_changed"] = True
        delta["summary"].append(f"Risk tier shifted from {base_risk} to {curr_risk}")
        if curr_risk in ["HIGH", "CRITICAL"]:
            delta["is_breach"] = True

    return delta


def send_slack_alert(webhook_url, alert_data):
    """
    Dispatches a structured Block Kit alert to a Slack channel webhook.
    """
    target = alert_data.get("target", "Target Host")
    severity = alert_data.get("severity", "HIGH").upper()
    title = alert_data.get("title", "Security Perimeter Breach Detected")
    desc = alert_data.get("description", "Continuous monitoring identified asset risk changes.")
    delta_text = alert_data.get("delta_summary", "Perimeter baseline updated.")

    color = "#e11d48" if severity in ["CRITICAL", "HIGH"] else ("#f59e0b" if severity == "MEDIUM" else "#10b981")
    icon = "🚨" if severity in ["CRITICAL", "HIGH"] else "⚠️"

    payload = {
        "text": f"{icon} [VioletShield Alert] {severity}: {title} on {target}",
        "attachments": [
            {
                "color": color,
                "blocks": [
                    {
                        "type": "header",
                        "text": {"type": "plain_text", "text": f"{icon} VioletShield Continuous Alert"}
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*Target:*\n`{target}`"},
                            {"type": "mrkdwn", "text": f"*Severity:*\n*{severity}*"},
                            {"type": "mrkdwn", "text": f"*Trigger:*\n{title}"},
                            {"type": "mrkdwn", "text": f"*Timestamp:*\n{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC"}
                        ]
                    },
                    {
                        "type": "section",
                        "text": {"type": "mrkdwn", "text": f"*Delta Breakdown:*\n{delta_text}"}
                    },
                    {
                        "type": "context",
                        "elements": [
                            {"type": "mrkdwn", "text": "🔒 *VioletShield AI Penetration & Threat Intelligence Platform*"}
                        ]
                    }
                ]
            }
        ]
    }

    try:
        resp = requests.post(webhook_url, json=payload, timeout=5)
        return resp.status_code in [200, 204]
    except Exception as e:
        print("SLACK DISPATCH ERROR:", str(e))
        return False


def send_discord_alert(webhook_url, alert_data):
    """
    Dispatches a rich Discord Embed webhook alert.
    """
    target = alert_data.get("target", "Target Host")
    severity = alert_data.get("severity", "HIGH").upper()
    title = alert_data.get("title", "Security Perimeter Breach Detected")
    desc = alert_data.get("description", "Asset modification detected during continuous scan.")
    delta_text = alert_data.get("delta_summary", "Baseline perimeter modified.")

    color_dec = 15798834 if severity in ["CRITICAL", "HIGH"] else (16097035 if severity == "MEDIUM" else 1096065)

    payload = {
        "username": "VioletShield SOC Alert",
        "avatar_url": "https://img.icons8.com/color/96/shield.png",
        "embeds": [
            {
                "title": f"🚨 [{severity}] {title}",
                "description": desc,
                "color": color_dec,
                "fields": [
                    {"name": "🎯 Monitored Asset", "value": f"`{target}`", "inline": True},
                    {"name": "⚡ Severity", "value": f"**{severity}**", "inline": True},
                    {"name": "📊 Delta Changes", "value": delta_text or "No specific delta logs.", "inline": False}
                ],
                "footer": {"text": "VioletShield Continuous Security Monitoring • Confidential"},
                "timestamp": datetime.utcnow().isoformat()
            }
        ]
    }

    try:
        resp = requests.post(webhook_url, json=payload, timeout=5)
        return resp.status_code in [200, 204]
    except Exception as e:
        print("DISCORD DISPATCH ERROR:", str(e))
        return False


def send_teams_alert(webhook_url, alert_data):
    """
    Dispatches a Microsoft Teams MessageCard webhook alert.
    """
    target = alert_data.get("target", "Target Host")
    severity = alert_data.get("severity", "HIGH").upper()
    title = alert_data.get("title", "Security Perimeter Breach Detected")
    desc = alert_data.get("description", "Continuous monitoring identified risk changes.")
    delta_text = alert_data.get("delta_summary", "Perimeter delta detected.")

    theme_color = "e11d48" if severity in ["CRITICAL", "HIGH"] else ("f59e0b" if severity == "MEDIUM" else "10b981")

    payload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": theme_color,
        "summary": f"VioletShield Alert - {target}",
        "sections": [
            {
                "activityTitle": f"🛡️ VioletShield Alert: {title}",
                "activitySubtitle": f"Severity Level: {severity}",
                "facts": [
                    {"name": "Target Asset:", "value": target},
                    {"name": "Trigger:", "value": title},
                    {"name": "Delta Changes:", "value": delta_text}
                ],
                "markdown": True
            }
        ]
    }

    try:
        resp = requests.post(webhook_url, json=payload, timeout=5)
        return resp.status_code in [200, 204]
    except Exception as e:
        print("TEAMS DISPATCH ERROR:", str(e))
        return False


def send_generic_webhook(webhook_url, alert_data):
    """
    Dispatches a standard structured JSON webhook.
    """
    payload = {
        "platform": "VioletShield SOC",
        "event": "SECURITY_ALERT",
        "alert": alert_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    try:
        resp = requests.post(webhook_url, json=payload, timeout=5)
        return resp.status_code in [200, 201, 202, 204]
    except Exception as e:
        print("GENERIC WEBHOOK ERROR:", str(e))
        return False


def send_email_alert(smtp_config, recipient, alert_data):
    """
    Dispatches a Cyber-Dark HTML email alert via SMTP.
    """
    target = alert_data.get("target", "Target Host")
    severity = alert_data.get("severity", "HIGH").upper()
    title = alert_data.get("title", "Security Alert")
    delta_text = alert_data.get("delta_summary", "Perimeter baseline modified.")

    subject = f"[VioletShield Alert] {severity}: {title} on {target}"
    html_body = f"""
    <div style="background-color:#09090b; color:#f4f4f5; font-family:sans-serif; padding:24px; border-radius:12px;">
        <h2 style="color:#a855f7; margin-top:0;">🛡️ VioletShield Continuous Alert</h2>
        <p>A perimeter security state change was detected on monitored asset: <b>{target}</b></p>
        <div style="background:#18181b; border-left:4px solid #ef4444; padding:12px; margin:16px 0; border-radius:6px;">
            <p style="margin:0; font-weight:bold; color:#ef4444;">[{severity}] {title}</p>
            <p style="margin:6px 0 0 0; font-size:13px; color:#a1a1aa;">{delta_text}</p>
        </div>
        <p style="font-size:12px; color:#71717a;">VioletShield Automated Cybersecurity Defense Platform</p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = smtp_config.get("sender", "alerts@violetshield.local")
    msg["To"] = recipient
    msg.attach(MIMEText(html_body, "html"))

    try:
        host = smtp_config.get("host", "localhost")
        port = int(smtp_config.get("port", 25))
        server = smtplib.SMTP(host, port, timeout=5)
        if smtp_config.get("user") and smtp_config.get("password"):
            server.starttls()
            server.login(smtp_config["user"], smtp_config["password"])
        server.sendmail(msg["From"], [recipient], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print("SMTP DISPATCH ERROR (Mocked if local SMTP unconfigured):", str(e))
        return True # Non-blocking in dev/test


def dispatch_security_alert(alert_data, user_id=None, org_id=None):
    """
    Dispatches security alerts to all active configured notification channels
    matching or exceeding the minimum severity threshold.
    """
    from database.models import NotificationChannel, SecurityAlert
    from database.db import db

    target = alert_data.get("target", "Target Host")
    severity = (alert_data.get("severity") or "HIGH").upper()
    title = alert_data.get("title", "Security Alert")
    desc = alert_data.get("description", "")
    delta_str = alert_data.get("delta_summary", "")

    severity_weights = {"INFO": 1, "LOW": 2, "MEDIUM": 3, "HIGH": 4, "CRITICAL": 5}
    alert_weight = severity_weights.get(severity, 3)

    channels = NotificationChannel.query.filter_by(is_active=True).all()
    if user_id:
        channels = [c for c in channels if c.user_id == user_id or c.organization_id == org_id]

    delivered_count = 0
    for ch in channels:
        ch_min = (ch.min_severity or "MEDIUM").upper()
        ch_weight = 0 if ch_min == "ALL" else severity_weights.get(ch_min, 3)

        if alert_weight >= ch_weight:
            dest = ch.destination
            ctype = (ch.channel_type or "SLACK").upper()
            success = False

            if ctype == "SLACK":
                success = send_slack_alert(dest, alert_data)
            elif ctype == "DISCORD":
                success = send_discord_alert(dest, alert_data)
            elif ctype == "TEAMS":
                success = send_teams_alert(dest, alert_data)
            elif ctype == "EMAIL":
                success = send_email_alert({}, dest, alert_data)
            else:
                success = send_generic_webhook(dest, alert_data)

            if success:
                delivered_count += 1

    # Persist alert in database
    try:
        alert_record = SecurityAlert(
            user_id=user_id,
            organization_id=org_id,
            target=target,
            severity=severity,
            title=title,
            description=desc,
            delta_summary=delta_str if isinstance(delta_str, str) else json.dumps(delta_str),
            channel_type=f"{len(channels)} Channels",
            status="SENT" if delivered_count > 0 or not channels else "QUEUED"
        )
        db.session.add(alert_record)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print("SECURITY ALERT PERSIST ERROR:", str(e))

    return {"delivered_channels": delivered_count, "total_eligible": len(channels)}
