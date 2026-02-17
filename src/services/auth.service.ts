import apiClient from './apiClient';

export interface TokenResponse {
    access: string;
    refresh: string;
    token_type: string;
}

export interface UserMe {
    id: number;
    username: string;
    email: string | null;
    phone: string | null;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    photo_url: string | null;
    dob: string | null;
    qualification: string | null;
    state: string | null;
    city: string | null;
    district: string | null;
    taluk: string | null;
    pincode: string | null;
    country: string | null;
    address: string | null;
    bio: string | null;
    study_goal: string | null;
    gender: string | null;
    field_of_study: string | null;
    target_exam_year: string | null;
    exam_type: string | null;
    sub_division: string | null;
    learner_type: string | null;
    notify_transaction_email: boolean;
    notify_transaction_whatsapp: boolean;
    notify_content_email: boolean;
    notify_content_whatsapp: boolean;
    notify_announcement_email: boolean;
    notify_announcement_whatsapp: boolean;
    notify_news_email: boolean;
    notify_news_whatsapp: boolean;
    background_type: string;
    preferred_language: string;
    is_superuser: boolean;
    is_staff: boolean;
}

const authService = {
    /**
     * Send OTP to a mobile number
     */
    sendOTP: async (phone: string) => {
        const response = await apiClient.post('/auth/mobile/send-otp', { phone });
        return response.data;
    },

    /**
     * Verify OTP and get login tokens
     */
    verifyOTP: async (phone: string, otp: string): Promise<TokenResponse> => {
        const response = await apiClient.post('/auth/mobile/verify-otp', { phone, otp });
        const tokens = response.data;
        localStorage.setItem('auth_tokens', JSON.stringify(tokens));
        return tokens;
    },

    /**
     * Get current user profile
     */
    getCurrentUser: async (): Promise<UserMe> => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    /**
     * Update user profile
     */
    updateProfile: async (userId: number, data: any) => {
        const response = await apiClient.patch(`/accounts/${userId}`, data);
        return response.data;
    },

    /**
     * Register a new user
     */
    register: async (data: any) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    /**
     * Login with username and password
     */
    login: async (data: any): Promise<TokenResponse> => {
        const response = await apiClient.post('/auth/login', data);
        const tokens = response.data;
        localStorage.setItem('auth_tokens', JSON.stringify(tokens));
        return tokens;
    },

    /**
     * Logout user and clear tokens
     */
    logout: () => {
        localStorage.removeItem('auth_tokens');
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('auth_tokens');
    }
};

export default authService;
