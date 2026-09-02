from database.db import db
from datetime import datetime


# =========================
# USER TABLE
# =========================

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default="ADMIN", nullable=False) # ADMIN, ANALYST, VIEWER
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    scans = db.relationship("Scan", backref="user", lazy=True)
    organization_memberships = db.relationship("OrganizationMember", backref="user", lazy=True, cascade="all, delete-orphan")
    audit_logs = db.relationship("AuditLog", backref="user", lazy=True)
    scheduled_scans = db.relationship("ScheduledScan", backref="user", lazy=True, cascade="all, delete-orphan")
    notification_channels = db.relationship("NotificationChannel", backref="user", lazy=True, cascade="all, delete-orphan")
    security_alerts = db.relationship("SecurityAlert", backref="user", lazy=True)

    def __repr__(self):
        return self.email


# =========================
# ORGANIZATION TABLE
# =========================

class Organization(db.Model):
    __tablename__ = "organizations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    members = db.relationship("OrganizationMember", backref="organization", lazy=True, cascade="all, delete-orphan")
    audit_logs = db.relationship("AuditLog", backref="organization", lazy=True)
    scheduled_scans = db.relationship("ScheduledScan", backref="organization", lazy=True)
    notification_channels = db.relationship("NotificationChannel", backref="organization", lazy=True)
    security_alerts = db.relationship("SecurityAlert", backref="organization", lazy=True)

    def __repr__(self):
        return self.name


# =========================
# ORGANIZATION MEMBER TABLE
# =========================

class OrganizationMember(db.Model):
    __tablename__ = "organization_members"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    role = db.Column(db.String(50), default="ANALYST", nullable=False) # OWNER, ADMIN, ANALYST, VIEWER
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)


# =========================
# AUDIT LOG TABLE
# =========================

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=True)
    action = db.Column(db.String(100), nullable=False) # SCAN_INITIATED, REPORT_EXPORTED, USER_LOGIN, etc.
    target = db.Column(db.String(255), nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


# =========================
# PHASE 14: SCHEDULED SCAN TABLE
# =========================

class ScheduledScan(db.Model):
    __tablename__ = "scheduled_scans"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=True)
    target = db.Column(db.String(255), nullable=False)
    scan_type = db.Column(db.String(50), default="FULL", nullable=False) # FULL, WEB, NMAP, QUICK
    frequency = db.Column(db.String(50), default="DAILY", nullable=False) # HOURLY, DAILY, WEEKLY, MONTHLY
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_run = db.Column(db.DateTime, nullable=True)
    next_run = db.Column(db.DateTime, nullable=True)
    last_score = db.Column(db.Integer, nullable=True)
    last_risk = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# =========================
# PHASE 14: NOTIFICATION CHANNEL TABLE
# =========================

class NotificationChannel(db.Model):
    __tablename__ = "notification_channels"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    channel_type = db.Column(db.String(50), default="SLACK", nullable=False) # SLACK, DISCORD, TEAMS, EMAIL, WEBHOOK
    destination = db.Column(db.String(500), nullable=False) # Webhook URL or Email
    min_severity = db.Column(db.String(50), default="MEDIUM", nullable=False) # CRITICAL, HIGH, MEDIUM, ALL
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# =========================
# PHASE 14: SECURITY ALERT TABLE
# =========================

class SecurityAlert(db.Model):
    __tablename__ = "security_alerts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=True)
    target = db.Column(db.String(255), nullable=False)
    severity = db.Column(db.String(50), default="HIGH", nullable=False) # CRITICAL, HIGH, MEDIUM, INFO
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    delta_summary = db.Column(db.Text, nullable=True) # JSON or text string of newly detected items
    channel_type = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), default="SENT", nullable=False) # SENT, FAILED, QUEUED
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


# =========================
# SCAN TABLE
# =========================

class Scan(db.Model):
    __tablename__ = "scans"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    website = db.Column(db.String(200), nullable=False)
    ip = db.Column(db.String(50))
    security_score = db.Column(db.Integer)
    risk = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    vulnerabilities = db.relationship("Vulnerability", backref="scan", lazy=True, cascade="all, delete-orphan")


# =========================
# VULNERABILITY TABLE
# =========================

class Vulnerability(db.Model):
    __tablename__ = "vulnerabilities"

    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey("scans.id"), nullable=False)
    title = db.Column(db.String(200))
    severity = db.Column(db.String(50))
    description = db.Column(db.Text)


# =========================
# REPORT TABLE
# =========================

class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey("scans.id"), nullable=False)
    report_path = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    scan = db.relationship("Scan", backref="reports")