from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token
)

from database.db import db
from database.models import User


auth = Blueprint(
    "auth",
    __name__
)


bcrypt = Bcrypt()


# =========================
# REGISTER
# =========================

@auth.route("/api/register", methods=["POST"])
def register():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")


    if not name or not email or not password:

        return jsonify({
            "error":"All fields required"
        }),400



    existing_user = User.query.filter_by(
        email=email
    ).first()


    if existing_user:

        return jsonify({
            "error":"Email already exists"
        }),400



    hashed_password = bcrypt.generate_password_hash(
        password
    ).decode("utf-8")



    user = User(
        name=name,
        email=email,
        password=hashed_password
    )


    db.session.add(user)

    db.session.commit()



    return jsonify({

        "message":"User registered successfully"

    }),201



# =========================
# LOGIN
# =========================

@auth.route("/api/login", methods=["POST"])
def login():

    data = request.json


    email = data.get("email")
    password = data.get("password")



    user = User.query.filter_by(
        email=email
    ).first()



    if not user:

        return jsonify({
            "error":"Invalid credentials"
        }),401



    if not bcrypt.check_password_hash(
        user.password,
        password
    ):

        return jsonify({
            "error":"Invalid credentials"
        }),401



    token = create_access_token(
        identity=str(user.id)
    )



    return jsonify({

        "message":"Login successful",

        "token":token,

        "user_id":user.id

    })