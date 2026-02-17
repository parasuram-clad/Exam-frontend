import apiClient from './apiClient';

export interface StudyPlanResponse {
    id: number;
    user_id: number;
    subject: string;
    plan_status: string;
    plan_version: number;
    day_no: number;
    chapter: string;
    topic: string;
    minutes: number;
}

export interface StudyPlanGenerateRequest {
    user_id: number;
    exam_type: string;
    sub_division: string;
    year: number;
    learner_type: string;
    daily_study_hours: number;
}

export interface TopicContentResponse {
    content: string;
    language: string;
}

export interface StudyNote {
    id?: number;
    user_id: number;
    topic_id: number;
    title: string;
    content: string;
    status: 'draft' | 'public' | 'private';
}

const studyService = {
    /**
     * Generate a personalized study plan
     */
    generateStudyPlan: async (payload: StudyPlanGenerateRequest) => {
        const response = await apiClient.post('/study-plan/generate', payload);
        return response.data;
    },

    /**
     * Get all study plans for a user
     */
    getUserStudyPlans: async (userId: number): Promise<StudyPlanResponse[]> => {
        const response = await apiClient.get(`/study-plan/user/${userId}`);
        return response.data;
    },

    /**
     * Get study plan by ID
     */
    getStudyPlan: async (planId: number): Promise<StudyPlanResponse> => {
        const response = await apiClient.get(`/study-plan/${planId}`);
        return response.data;
    },

    /**
     * Fetch or generate topic content
     */
    getTopicContent: async (params: {
        user_id: number;
        exam_type: string;
        subject: string;
        sub_division: string;
        topic: string;
        learner_type: boolean;
        language?: string;
    }): Promise<TopicContentResponse> => {
        const response = await apiClient.get('/study/topic', { params });
        return response.data;
    },

    /**
     * Create a study note
     */
    createNote: async (note: StudyNote) => {
        const response = await apiClient.post('/study-notes/', note);
        return response.data;
    },

    /**
     * Get notes for a user
     */
    getUserNotes: async (userId: number): Promise<StudyNote[]> => {
        const response = await apiClient.get(`/study-notes/user/${userId}`);
        return response.data;
    }
};

export default studyService;
