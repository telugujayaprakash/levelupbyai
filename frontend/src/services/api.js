import { Platform } from 'react-native';

const BASE_URL = 'https://levelupbyai.onrender.com/api';

let jwtToken = null;

const apiRequest = async (method, path, body = null) => {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    // 'bypass-tunnel-reminder': 'true',
  };

  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    console.log(`[API Raw Response ${method} ${path}]:`, text);
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

module.exports = {
  setToken: (token) => {
    jwtToken = token;
  },
  get: (path) => apiRequest('GET', path),
  post: (path, body) => apiRequest('POST', path, body),
  BASE_URL,
};
