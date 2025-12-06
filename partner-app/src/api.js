import axios from 'axios';

const API = axios.create({ baseURL: 'https://indora.onrender.com' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('partnerToken')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('partnerToken')}`;
  }
  return req;
});

export default API;