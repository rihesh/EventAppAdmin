import axios from 'axios';

// Toggle this to use the live Vercel backend or your local backend
const useLocalBackend = false;

const LOCAL_API_URL = 'http://127.0.0.1:3000/api';
const LIVE_API_URL = 'https://club-api-project-git-fresh-start-riheshs-projects.vercel.app/api';

const api = axios.create({
    baseURL: useLocalBackend ? LOCAL_API_URL : LIVE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
