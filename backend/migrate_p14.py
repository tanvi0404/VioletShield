from app import app
from database.db import db
from database.models import ScheduledScan, NotificationChannel, SecurityAlert

with app.app_context():
    db.create_all()
    print("[OK] Database tables (scheduled_scans, notification_channels, security_alerts) created successfully!")
