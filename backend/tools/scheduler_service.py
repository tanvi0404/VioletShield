import os
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

_scheduler = None


def get_scheduler():
    global _scheduler
    if _scheduler is None:
        _scheduler = BackgroundScheduler(daemon=True)
    return _scheduler


def execute_scheduled_scan_job(app, sched_id):
    """
    Executes an automated background scan for a scheduled asset,
    computes baseline delta differences, and triggers alerts on risk changes.
    """
    with app.app_context():
        from database.db import db
        from database.models import ScheduledScan, Scan, Vulnerability
        from tools.alert_engine import calculate_scan_delta, dispatch_security_alert
        from scanner import scan_website

        sched = ScheduledScan.query.get(sched_id)
        if not sched or not sched.is_active:
            return

        target = sched.target
        user_id = sched.user_id
        org_id = sched.organization_id

        # 1. Fetch previous baseline scan for this target
        prev_scan = Scan.query.filter_by(website=target).order_by(Scan.created_at.desc()).first()
        baseline_data = {}
        if prev_scan:
            prev_vulns = [{"cve_id": v.title, "title": v.title, "severity": v.severity} for v in prev_scan.vulnerabilities]
            baseline_data = {
                "score": prev_scan.security_score,
                "risk": prev_scan.risk,
                "ports": [],
                "cves": prev_vulns
            }

        # 2. Execute new scan
        try:
            scan_result = scan_website(target, user_id=user_id)
            if not isinstance(scan_result, dict):
                scan_result = {}

            current_score = int(scan_result.get("security_score") or (0 if scan_result.get("error") else 100))
            current_risk = str(scan_result.get("risk") or ("High" if scan_result.get("error") else "Low"))

            # 3. Calculate Delta Differences
            delta = calculate_scan_delta(baseline_data, scan_result)

            # 4. Update ScheduledScan metadata
            sched.last_run = datetime.utcnow()
            sched.last_score = current_score
            sched.last_risk = current_risk


            # Compute next run time based on frequency
            freq = (sched.frequency or "DAILY").upper()
            if freq == "HOURLY":
                sched.next_run = datetime.utcnow() + timedelta(hours=1)
            elif freq == "WEEKLY":
                sched.next_run = datetime.utcnow() + timedelta(days=7)
            elif freq == "MONTHLY":
                sched.next_run = datetime.utcnow() + timedelta(days=30)
            else: # DAILY
                sched.next_run = datetime.utcnow() + timedelta(days=1)

            db.session.commit()

            # 5. Dispatch Alert if Breach / Delta Detected
            if delta["is_breach"] or delta["has_changes"]:
                summary_str = " | ".join(delta["summary"]) if delta["summary"] else "Perimeter state changed."
                alert_payload = {
                    "target": target,
                    "severity": "CRITICAL" if current_risk in ["CRITICAL", "HIGH"] else "HIGH",
                    "title": f"Automated Scan Delta on {target}",
                    "description": f"Continuous scheduler detected perimeter changes. Score: {current_score}%, Risk: {current_risk}.",
                    "delta_summary": summary_str
                }
                dispatch_security_alert(alert_payload, user_id=user_id, org_id=org_id)

        except Exception as e:
            print(f"SCHEDULED SCAN ERROR [{target}]:", str(e))


def init_scheduler(app):
    """
    Initializes and starts the continuous monitoring background scheduler.
    """
    scheduler = get_scheduler()
    if not scheduler.running:
        scheduler.start()
        print("[OK] VioletShield Continuous Monitoring Background Scheduler Started.")
    return scheduler
