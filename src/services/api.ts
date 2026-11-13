import axios from 'axios';
import { Reading, ReportSummary, User } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sweety_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to login');
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to register');
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await api.get('/auth/me');
    return response.data.user;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to authenticate');
  }
}

export async function getReadings(page = 1, limit = 20): Promise<{ readings: Reading[]; pagination: any }> {
  try {
    const response = await api.get(`/readings?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch readings');
  }
}

export async function getReadingById(id: number): Promise<Reading> {
  try {
    const response = await api.get(`/readings/${id}`);
    return response.data.reading;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch reading');
  }
}

export async function createReading(reading: { date: string; slot: string; value: number; notes?: string }): Promise<Reading> {
  try {
    const response = await api.post('/readings', reading);
    return response.data.reading;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to create reading');
  }
}

export async function updateReading(id: number, reading: { date: string; slot: string; value: number; notes?: string }): Promise<Reading> {
  try {
    const response = await api.put(`/readings/${id}`, reading);
    return response.data.reading;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update reading');
  }
}

export async function deleteReading(id: number): Promise<void> {
  try {
    await api.delete(`/readings/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to delete reading');
  }
}

export async function getStats(): Promise<{ total: number; highest: number | null; lowest: number | null; average: number | null }> {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch stats');
  }
}

export async function getReport(type: 'daily' | 'mtd' | 'monthly', date: string): Promise<ReportSummary> {
  try {
    const response = await api.get(`/reports/${type}?date=${date}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch report');
  }
}
