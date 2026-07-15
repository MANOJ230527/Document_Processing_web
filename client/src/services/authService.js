import axios from 'axios';

const BASE = '';  // uses CRA proxy

export const registerUser = async (name, email, password) => {
  const { data } = await axios.post('/auth/register', { name, email, password });
  return data;
};

export const loginUser = async (email, password) => {
  const { data } = await axios.post('/auth/login', { email, password });
  return data;
};

export const getMe = async (token) => {
  const { data } = await axios.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};
