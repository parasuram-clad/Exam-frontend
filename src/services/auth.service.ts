import apiClient from './apiClient';

export interface TokenResponse {
    access: string;
    refresh: string;
    token_type: string;
}

export interface UserContext {
    context_id: string;
    plan_id: number;
    exam_type: string;
    sub_division: string;
    plan_type: string;
    subject_name: string | null;
    label: string;
    has_subscription: boolean;
    subscription_status: string;
    access_expires: string | null;
    features: Record<string, boolean>;
}

export interface UserDashboardData {
    status: string;
    user_id: number;
    contexts: UserContext[];
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
    address_line_2: string | null;
    bio: string | null;
    study_goal: string | null;
    gender: string | null;
    field_of_study: string | null;
    target_exam_year: number | string | null;
    exam_type: string | null;
    sub_division: string | null;
    learner_type: string | null;
    preparation_type: string | null;
    past_attempts: string | null;
    is_onboarded: boolean;
    notify_push: boolean;
    notify_exam_reminders: boolean;
    notify_daily_quiz: boolean;
    notify_current_affairs: boolean;
    notify_personalized_insights: boolean;
    background_type: string;
    preferred_language: string;
    study_medium: string | null;
    is_superuser: boolean;
    is_staff: boolean;
    dashboard?: UserDashboardData;
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
     * Upload user avatar
     */
    updateAvatar: async (userId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`/accounts/${userId}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
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
     * Check if user is authenticated and session is refreshable
     */
    isAuthenticated: () => {
        const tokensString = localStorage.getItem('auth_tokens');
        if (!tokensString) return false;

        try {
            const tokens = JSON.parse(tokensString);
            const { access, refresh } = tokens;
            if (!access && !refresh) return false;

            const isTokenExpired = (token: string) => {
                try {
                    const parts = token.split('.');
                    if (parts.length !== 3) return false;
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    if (payload && typeof payload.exp === 'number') {
                        const now = Math.floor(Date.now() / 1000);
                        return payload.exp < (now + 10); // 10s grace
                    }
                    return false;
                } catch {
                    return true;
                }
            };

            // Session is valid if access token is active
            if (access && !isTokenExpired(access)) return true;

            // Session is valid if it can be refreshed
            if (refresh && !isTokenExpired(refresh)) return true;

            return false;
        } catch (error) {
            return false;
        }
    }
};

export default authService;
