from app import app
from database.db import db
from sqlalchemy import text

with app.app_context():
    with db.engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'ADMIN';"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
        conn.commit()
    db.create_all()
    print("[OK] Database tables (organizations, organization_members, audit_logs) and User columns verified successfully!")
