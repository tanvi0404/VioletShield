from database.db import db
from datetime import datetime


# =========================
# USER TABLE
# =========================

class User(db.Model):

    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(200),
        nullable=False
    )


    scans = db.relationship(
        "Scan",
        backref="user",
        lazy=True
    )


    def __repr__(self):
        return self.email



# =========================
# SCAN TABLE
# =========================

class Scan(db.Model):

    __tablename__ = "scans"


    id = db.Column(
        db.Integer,
        primary_key=True
    )


    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )


    website = db.Column(
        db.String(200),
        nullable=False
    )


    ip = db.Column(
        db.String(50)
    )


    security_score = db.Column(
        db.Integer
    )


    risk = db.Column(
        db.String(20)
    )


    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )


    vulnerabilities = db.relationship(
        "Vulnerability",
        backref="scan",
        lazy=True
    )



# =========================
# VULNERABILITY TABLE
# =========================

class Vulnerability(db.Model):

    __tablename__ = "vulnerabilities"


    id = db.Column(
        db.Integer,
        primary_key=True
    )


    scan_id = db.Column(
        db.Integer,
        db.ForeignKey("scans.id"),
        nullable=False
    )


    title = db.Column(
        db.String(200)
    )


    severity = db.Column(
        db.String(50)
    )


    description = db.Column(
        db.Text
    )



# =========================
# REPORT TABLE
# =========================

class Report(db.Model):

    __tablename__ = "reports"


    id = db.Column(
        db.Integer,
        primary_key=True
    )


    scan_id = db.Column(
        db.Integer,
        db.ForeignKey("scans.id"),
        nullable=False
    )


    report_path = db.Column(
        db.String(300)
    )


    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    scan = db.relationship(
        "Scan",
        backref="reports"
    )