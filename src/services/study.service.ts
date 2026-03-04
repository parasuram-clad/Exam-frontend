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
    syllabus_id?: number;
}

export interface StudyPlanGenerateRequest {
    user_id: number;
    exam_type: string;
    sub_division: string;
    year: number;
    learner_type: string;
    daily_study_hours: number;
    language?: 'English' | 'Tamil' | 'Hindi';
}

export interface TopicContentBlock {
    block_id: string;
    type: 'paragraph' | 'list' | 'image' | 'video';
    sub_heading?: string;
    keywords: string[];
    text: string;
    image?: string | null;
    pyqs: any[];
}

export interface MindMapNode {
    id: string;
    title: string;
    children: { title: string; details: string[] }[];
}

export interface TopicContentSection {
    section_id: string;
    title: string;
    type: string;
    content_blocks: TopicContentBlock[];
    mindmap_structure: MindMapNode | null;
}

export interface TopicQuizQuestion {
    id: string;
    question: string;
    options: string[];
    correct_answer_index: number;
    explanation: string;
}

export interface TopicContentResponse {
    day_metadata: {
        day_no: number;
        total_tasks: number;
        completed_tasks: number;
        overall_plan_progress: number;
        exam_type: string;
    };
    task: {
        id: number;
        subject: string;
        part: string;
        topic: string;
        short_description: string;
        status: string;
        duration_minutes: number;
        image_url: string;
        learning_content: {
            introduction: string;
            sections: TopicContentSection[];
            assessment?: {
                quiz_id: string;
                total_questions: number;
                questions: TopicQuizQuestion[];
            };
        };
        assessment?: {
            quiz_id: string;
            total_questions: number;
            questions: TopicQuizQuestion[];
        };
    };
}

export interface StudyNote {
    id?: number;
    user_id: number;
    topic_id: number;
    title: string;      // used as keyword
    content: string;
    status: 'draft' | 'public' | 'private';
    updated_at?: string;
    created_at?: string;
}

export interface MCQAnswerItem {
    mcq_id: number;
    selected_option: string; // "A", "B", "C", "D"
}

export interface SubmitMCQRequest {
    user_id: number;
    syllabus_id: number;
    attempt_no: number;
    difficulty?: string;
    answers: MCQAnswerItem[];
    started_at: string;
    submitted_at: string;
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
     * Update study plan status
     */
    updateStudyPlan: async (planId: number, payload: { plan_status?: string, minutes?: number }) => {
        const response = await apiClient.put(`/study-plan/${planId}`, payload);
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
    }): Promise<any> => {
        const response = await apiClient.get('/study/topic', { params });
        return response.data;
    },

    /**
     * Fetch detailed topic content by syllabus ID
     */
    getTopicContentBySyllabusId: async (syllabusId: number, userId: number): Promise<TopicContentResponse> => {
        const response = await apiClient.get(`/topic-content/${syllabusId}`, { params: { user_id: userId } });
        return response.data;
    },

    /**
     * Create a study note
     */
    createNote: async (note: StudyNote) => {
        const response = await apiClient.post('/study-notes/', note);
        return response.data as StudyNote;
    },

    /**
     * Update an existing study note by ID
     */
    updateNote: async (noteId: number, note: Partial<StudyNote>) => {
        const response = await apiClient.put(`/study-notes/${noteId}`, note);
        return response.data as StudyNote;
    },

    /**
     * Delete a study note by ID
     */
    deleteNote: async (noteId: number) => {
        await apiClient.delete(`/study-notes/${noteId}`);
    },

    /**
     * Get notes for a user
     */
    getUserNotes: async (userId: number): Promise<StudyNote[]> => {
        const response = await apiClient.get(`/study-notes/user/${userId}`);
        return response.data;
    },

    /**
     * Get the organized roadmap for a user
     */
    getUserRoadmap: async (userId: number) => {
        const response = await apiClient.get(`/study-plan/roadmap/${userId}`);
        return response.data;
    },

    /**
     * Get assessment history for a specific topic
     */
    getAssessmentHistory: async (userId: number, syllabusId: number) => {
        const response = await apiClient.get('/mcq/history', {
            params: { user_id: userId, syllabus_id: syllabusId }
        });
        return response.data;
    },

    /**
     * Submit an MCQ attempt
     */
    submitMCQAttempt: async (payload: SubmitMCQRequest) => {
        const response = await apiClient.post('/mcq/submit', payload);
        return response.data;
    }
};

export default studyService;
