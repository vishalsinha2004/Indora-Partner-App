import axios from 'axios';

// ❌ WRONG: const API = axios.create({ baseURL: 'https://indora.onrender.com' });

// ✅ CORRECT (Added /api at the end)
// We also keep the localhost logic so you can still test on your laptop!
const BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://indora.onrender.com/api'; 

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use((req) => {
  // Check for ALL types of tokens so this file works in any app
  if (localStorage.getItem('partnerToken')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('partnerToken')}`;
  }
  else if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  else if (localStorage.getItem('adminToken')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('adminToken')}`;
  }
  return req;
});

export default API;