import axios from "axios";

const BASE = process.env.REACT_APP_API_URL;

export const registerUser = async (name, email, password) => {
  const { data } = await axios.post(`${BASE}/auth/register`, {
    name,
    email,
    password,
  });
  return data;
};

export const loginUser = async (email, password) => {
  const { data } = await axios.post(`${BASE}/auth/login`, {
    email,
    password,
  });
  return data;
};

export const getMe = async (token) => {
  const { data } = await axios.get(`${BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};