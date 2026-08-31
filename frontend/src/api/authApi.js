import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000/api";

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await axios.post(`${API_BASE_URL}/register`, {
    name,
    email,
    password,
  });
  return response.data;
};
