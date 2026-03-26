import axios from 'axios';

import { API_URL } from '@/config/env';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
    (config) => {
        const tokens = localStorage.getItem('auth_tokens');
        if (tokens) {
            const { access } = JSON.parse(tokens);
            if (access) {
                config.headers.Authorization = `Bearer ${access}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add response interceptor for token refresh handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const tokensStr = localStorage.getItem('auth_tokens');
                if (!tokensStr) throw new Error("No tokens found");

                const { refresh } = JSON.parse(tokensStr);
                const response = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refresh });
                
                const { access, refresh: respRefresh } = response.data;
                const newTokens = { 
                    access, 
                    refresh: respRefresh || refresh, 
                    token_type: 'bearer' 
                };

                localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
                originalRequest.headers.Authorization = `Bearer ${access}`;
                
                processQueue(null, access);
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                
                if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
                    localStorage.removeItem('auth_tokens');
                    window.location.href = '/';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
