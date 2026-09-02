import re
from functools import wraps
from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required
)

from database.db import db
from database.models import User, Organization, OrganizationMember, AuditLog

auth = Blueprint("auth", __name__)
bcrypt = Bcrypt()


def log_audit_event(user_id=None, action="GENERAL_ACTION", target=None, details=None, ip_address=None, org_id=None):
    """
    Centralized utility to record immutable security audit logs in SQLite/DB.
    """
    try:
        if not ip_address and request:
            ip_address = request.headers.get("X-Forwarded-For", request.remote_addr)

        audit = AuditLog(
            user_id=user_id,
            organization_id=org_id,
            action=action,
            target=target,
            ip_address=ip_address,
            details=details
        )
        db.session.add(audit)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print("AUDIT LOG ERROR:", str(e))


def role_required(allowed_roles):
    """
    RBAC Decorator to restrict endpoints based on user clearance.
    Allowed roles list: ["ADMIN", "ANALYST", "VIEWER"]
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            try:
                user_id = get_jwt_identity()
                user = User.query.get(int(user_id)) if str(user_id).isdigit() else None

                if not user:
                    return jsonify({"error": "User identity not found"}), 401

                user_role = (user.role or "ADMIN").upper()
                allowed_upper = [r.upper() for r in allowed_roles]

                if user_role not in allowed_upper:
                    log_audit_event(
                        user_id=user.id,
                        action="UNAUTHORIZED_ACCESS_ATTEMPT",
                        target=request.path,
                        details=f"User role '{user_role}' denied access. Required: {allowed_roles}"
                    )
                    return jsonify({
                        "error": f"Permission denied. Clearance level required: {', '.join(allowed_roles)}"
                    }), 403

                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify({"error": f"Authorization verification failed: {str(e)}"}), 500
        return wrapper
    return decorator


# =========================
# REGISTER
# =========================

@auth.route("/api/register", methods=["POST"])
def register():
    data = request.json or {}

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "ADMIN").upper()
    if role not in ["ADMIN", "ANALYST", "VIEWER"]:
        role = "ADMIN"

    if not name or not email or not password:
        return jsonify({"error": "All fields (name, email, password) are required"}), 400

    existing_user = User.query.filter_by(email=email.strip().lower()).first()
    if existing_user:
        return jsonify({"error": "An account with this email already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    user = User(
        name=name.strip(),
        email=email.strip().lower(),
        password=hashed_password,
        role=role
    )
    db.session.add(user)
    db.session.commit()

    # Automatically provision default Organization Workspace for new user
    slug = re.sub(r'[^a-z0-9]', '', name.lower()) or "soc"
    org_name = f"{name}'s SOC Team"
    default_org = Organization(name=org_name, slug=f"{slug}-{user.id}")
    db.session.add(default_org)
    db.session.commit()

    member = OrganizationMember(
        user_id=user.id,
        organization_id=default_org.id,
        role="OWNER"
    )
    db.session.add(member)
    db.session.commit()

    # Audit log registration
    log_audit_event(
        user_id=user.id,
        action="USER_REGISTERED",
        target=email,
        details=f"User registered with {role} role and default workspace '{org_name}'"
    )

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "User and organization workspace registered successfully",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "organization": {
                "id": default_org.id,
                "name": default_org.name
            }
        }
    }), 201


# =========================
# LOGIN
# =========================

@auth.route("/api/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        log_audit_event(
            user_id=None,
            action="FAILED_LOGIN_ATTEMPT",
            target=email,
            details="Invalid email or password provided"
        )
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))

    # Retrieve user's primary organization
    primary_org = None
    if user.organization_memberships:
        primary_org = user.organization_memberships[0].organization

    # Audit log login
    log_audit_event(
        user_id=user.id,
        action="USER_LOGIN",
        target=email,
        details="Successful login session established",
        org_id=primary_org.id if primary_org else None
    )

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user_id": user.id,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role or "ADMIN",
            "organization": {
                "id": primary_org.id,
                "name": primary_org.name
            } if primary_org else None
        }
    })