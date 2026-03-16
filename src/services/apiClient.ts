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

// Add response interceptor for token refresh handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const tokens = localStorage.getItem('auth_tokens');
                if (tokens) {
                    const { refresh } = JSON.parse(tokens);
                    const response = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refresh });
                    const newTokens = { access: response.data.access, refresh, token_type: 'bearer' };

                    localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('auth_tokens');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
