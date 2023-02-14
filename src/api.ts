import axios from 'axios';

export const API_URL = 'https://ui-venture-api-production.up.railway.app/v1/api';

const api = axios.create({ baseURL: API_URL });

export default api;
