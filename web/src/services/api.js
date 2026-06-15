const BASE_URL = import.meta.env.VITE_API_URL || 'https://levelupbyai.onrender.com/api';

let jwtToken = null;

const apiRequest = async (method, path, body = null) => {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }

  const options = { method, headers };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let data = {};
    if (text) {
      data = JSON.parse(text);
    }
    if (!response.ok) {
      throw data;
    }
    return data;
  } catch (error) {
    console.error(`API Error [${method} ${path}]:`, error);
    throw error;
  }
};

const API = {
  setToken: (token) => {
    jwtToken = token;
  },
  get: (path) => apiRequest('GET', path),
  post: (path, body) => apiRequest('POST', path, body),
  BASE_URL,
};

export default API;
