import axios from "axios";


const API = axios.create({

    baseURL:"http://localhost:5000/api"

});



// SIGNUP API

export const signupUser = (data)=>{

    return API.post("/auth/signup",data);

};



// LOGIN API

export const loginUser = (data)=>{

    return API.post("/auth/login",data);

};



// VERIFY OTP

export const verifyOTP = (data)=>{

    return API.post("/auth/verify-otp",data);

};