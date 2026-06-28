import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:5000' : '');

export const api = axios.create({
  baseURL: API_BASE_URL,
});
