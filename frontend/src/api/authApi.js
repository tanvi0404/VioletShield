import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

export const registerUser = async (name, email, password, role = "ADMIN") => {
  const response = await axios.post(`${API_BASE_URL}/register`, {
    name,
    email,
    password,
    role,
  });
  return response.data;
};

// =====================================
// PHASE 13: USER PROFILE & ORG APIS
// =====================================

export const getUserProfile = async () => {
  const response = await axios.get(`${API_BASE_URL}/user/profile`, getAuthHeaders());
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await axios.put(`${API_BASE_URL}/user/profile`, profileData, getAuthHeaders());
  return response.data;
};

export const getOrganizations = async () => {
  const response = await axios.get(`${API_BASE_URL}/organizations`, getAuthHeaders());
  return response.data;
};

export const createOrganization = async (name) => {
  const response = await axios.post(`${API_BASE_URL}/organizations`, { name }, getAuthHeaders());
  return response.data;
};

export const getOrgMembers = async (orgId) => {
  const response = await axios.get(`${API_BASE_URL}/organizations/${orgId}/members`, getAuthHeaders());
  return response.data;
};

export const inviteOrgMember = async (orgId, memberData) => {
  const response = await axios.post(`${API_BASE_URL}/organizations/${orgId}/members`, memberData, getAuthHeaders());
  return response.data;
};

export const removeOrgMember = async (orgId, memberId) => {
  const response = await axios.delete(`${API_BASE_URL}/organizations/${orgId}/members/${memberId}`, getAuthHeaders());
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await axios.get(`${API_BASE_URL}/audit-logs`, getAuthHeaders());
  return response.data;
};
