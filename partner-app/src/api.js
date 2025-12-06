import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('partnerToken')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('partnerToken')}`;
  }
  return req;
});

export default API;