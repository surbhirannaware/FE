import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export default api;
/* const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default API_BASE_URL; */