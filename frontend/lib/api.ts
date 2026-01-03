import axios from 'axios';
import cookieCutter from 'cookie-cutter';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: async (password: string) => {
        const { data } = await api.post('/api/auth/login', { password });
        localStorage.setItem('token', data.token);
        return data;
    },
    verify: async () => {
        const { data } = await api.get('/api/auth/verify');
        return data;
    },
    logout: () => {
        localStorage.removeItem('token');
    }
};

export const jobApi = {
    create: async (topic: string, duration: number) => {
        const { data } = await api.post('/api/jobs', { topic, duration });
        return data;
    },
    getAll: async () => {
        const { data } = await api.get('/api/jobs');
        return data;
    },
    getOne: async (id: string) => {
        const { data } = await api.get(`/api/jobs/${id}`);
        return data;
    },
    delete: async (id: string) => {
        await api.delete(`/api/jobs/${id}`);
    },
    getDownloadUrl: (id: string) => {
        const token = localStorage.getItem('token');
        return `${API_URL}/api/jobs/${id}/download?token=${token}`;
    },
    getVideoUrl: (filename: string) => {
        return `${API_URL}/outputs/${filename}`;
    }
};
