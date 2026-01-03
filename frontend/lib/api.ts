import axios from 'axios';
// // import cookieCutter from 'cookie-cutter';
import { Job } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const authApi = {
    login: async (password: string) => {
        const { data } = await api.post<{ token: string, admin: boolean }>('/api/auth/login', { password });
        localStorage.setItem('token', data.token);
        return data;
    },
    verify: async () => {
        const { data } = await api.get<{ valid: boolean, admin: boolean }>('/api/auth/verify');
        return data;
    },
    logout: () => {
        localStorage.removeItem('token');
    }
};

export const jobApi = {
    create: async (topic: string, duration: number): Promise<Job> => {
        const { data } = await api.post<Job>('/api/jobs', { topic, duration });
        return data;
    },
    getAll: async (): Promise<Job[]> => {
        const { data } = await api.get<Job[]>('/api/jobs');
        return data;
    },
    getOne: async (id: string): Promise<Job> => {
        const { data } = await api.get<Job>(`/api/jobs/${id}`);
        return data;
    },
    delete: async (id: string) => {
        await api.delete(`/api/jobs/${id}`);
    },
    getDownloadUrl: (id: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        return `${API_URL}/api/jobs/${id}/download?token=${token}`;
    },
    getVideoUrl: (filename: string) => {
        return `${API_URL}/outputs/${filename}`;
    }
};
