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
    plan_type?: 'OVERALL' | 'SUBJECT';
    is_completed: boolean;
}

export interface RoadmapDayItem {
    type: 'TOPIC' | 'TEST' | 'REVISION';
    subject?: string;
    part?: string;
    image_url?: string;
    topic?: { id: number; name: string; minutes: number; description: string }[];
    minutes: number;
    identifier?: string;
    title?: string;
    description?: string;
    weekly_test_id?: number;
    is_completed?: boolean;
}

export interface RoadmapDay {
    day: number;
    date: string;
    items: RoadmapDayItem[];
}

export interface RoadmapPlan {
    plan_type: 'OVERALL' | 'SUBJECT';
    overall_plan_id?: number;
    subject_id?: number;
    subject_name: string | null;
    label: string;
    total_days: number;
    days: RoadmapDay[];
    isVirtual?: boolean;
}

export interface RoadmapResponse {
    user_id: number;
    total_plans: number;
    access: {
        overall_plans: { 
            exam_type: string; 
            sub_division: string; 
            plan_type: string; 
            overall_plan_id?: number;
            subscribed: boolean 
        }[];
        subject_plans: { 
            exam_type: string; 
            sub_division: string; 
            plan_type: string; 
            subject_name: string; 
            subject_id?: number;
            subscribed: boolean 
        }[];
    };
    plan: RoadmapPlan[];
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
    difficulty?: string;
    answers: MCQAnswerItem[];
    started_at: string;
    submitted_at: string;
}

export interface TopicTiming {
    id: number;
    user_id: number;
    syllabus_id: number;
    start_time: string;
    end_time?: string;
    total_estimate?: number;
}

const studyService = {
    /**
     * Start topic timing session
     */
    startTopicTiming: async (userId: number, syllabusId: number): Promise<TopicTiming> => {
        const response = await apiClient.post('/topic-timing/start', { user_id: userId, syllabus_id: syllabusId });
        return response.data;
    },

    /**
     * Stop topic timing session
     */
    stopTopicTiming: async (userId: number, syllabusId: number): Promise<TopicTiming> => {
        const response = await apiClient.post('/topic-timing/stop', { user_id: userId, syllabus_id: syllabusId });
        return response.data;
    },

    /**
     * Get all topic timing records for a user
     */
    getUserTopicTimings: async (userId: number, syllabusId?: number): Promise<TopicTiming[]> => {
        const params = syllabusId ? { user_id: userId, syllabus_id: syllabusId } : { user_id: userId };
        const response = await apiClient.get('/topic-timing', { params });
        return response.data;
    },

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
        const response = await apiClient.get(`/study-plan/user/${userId}`, { params: { limit: 1000 } });
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
     * Fetch mind map structure
     */
    getTopicMindMap: async (syllabusId: number, params: { content_type_id: number; language: string }) => {
        const response = await apiClient.get(`/study/mindmap/${syllabusId}`, { params });
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
    getUserRoadmap: async (userId: number): Promise<RoadmapResponse> => {
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
     * Start an MCQ attempt (fetch questions)
     */
    startMCQAttempt: async (payload: { user_id: number; syllabus_id: number; difficulty?: string }) => {
        const response = await apiClient.post('/mcq/start', payload);
        return response.data;
    },

    /**
     * Submit an MCQ attempt
     */
    submitMCQAttempt: async (payload: SubmitMCQRequest) => {
        const response = await apiClient.post('/mcq/submit', payload);
        return response.data;
    },

    /**
     * Get an MCQ attempt result
     */
    getMCQResult: async (userId: number, syllabusId: number) => {
        const response = await apiClient.get('/mcq/result', {
            params: { user_id: userId, syllabus_id: syllabusId }
        });
        return response.data;
    },
    
    // ================================================================
    // WEEKLY TEST (OVERALL PLAN)
    // ================================================================
    getWeeklyTestQuestions: async (userId: number, weekNo: number, overallPlanId?: number) => {
        const response = await apiClient.get('/weekly-test/questions', {
            params: { user_id: userId, week_no: weekNo, overall_plan_id: overallPlanId }
        });
        return response.data;
    },

    submitWeeklyTest: async (payload: {
        weekly_test_id: number;
        answers: { mcq_id: number; selected_option: string }[];
        started_at: string;
        submitted_at: string;
    }) => {
        const response = await apiClient.post('/weekly-test/submit', payload);
        return response.data;
    },

    getWeeklyTestResult: async (userId: number, weekNo: number, overallPlanId?: number) => {
        const response = await apiClient.get('/weekly-test/result', {
            params: { user_id: userId, week_no: weekNo, overall_plan_id: overallPlanId }
        });
        return response.data;
    },

    getWeeklyTestHistory: async (userId: number, overallPlanId?: number) => {
        const response = await apiClient.get('/weekly-test/history', {
            params: { user_id: userId, overall_plan_id: overallPlanId }
        });
        return response.data;
    },

    // ================================================================
    // MONTHLY TEST (OVERALL PLAN)
    // ================================================================
    getMonthlyTestQuestions: async (userId: number, monthNo: number, overallPlanId?: number) => {
        const response = await apiClient.get('/monthly-test/questions', {
            params: { user_id: userId, month_no: monthNo, overall_plan_id: overallPlanId }
        });
        return response.data;
    },

    submitMonthlyTest: async (payload: {
        monthly_test_id: number;
        answers: { mcq_id: number; selected_option: string }[];
        started_at: string;
        submitted_at: string;
    }) => {
        const response = await apiClient.post('/monthly-test/submit', payload);
        return response.data;
    },

    getMonthlyTestResult: async (userId: number, monthNo: number, overallPlanId?: number) => {
        const response = await apiClient.get('/monthly-test/result', {
            params: { user_id: userId, month_no: monthNo, overall_plan_id: overallPlanId }
        });
        return response.data;
    },

    getMonthlyTestHistory: async (userId: number, overallPlanId?: number) => {
        const response = await apiClient.get('/monthly-test/history', {
            params: { user_id: userId, overall_plan_id: overallPlanId }
        });
        return response.data;
    },

    // ================================================================
    // SUBJECT WEEKLY TEST
    // ================================================================
    getSubjectWeeklyTestQuestions: async (subjectId: number, weekNo: number) => {
        const response = await apiClient.get('/subject-weekly-test/questions', {
            params: { subject_id: subjectId, week_no: weekNo }
        });
        return response.data;
    },

    submitSubjectWeeklyTest: async (payload: {
        subject_weekly_test_id: number;
        answers: { mcq_id: number; selected_option: string }[];
        started_at: string;
        submitted_at: string;
    }) => {
        const response = await apiClient.post('/subject-weekly-test/submit', payload);
        return response.data;
    },

    getSubjectWeeklyTestResult: async (subjectId: number, weekNo: number) => {
        const response = await apiClient.get('/subject-weekly-test/result', {
            params: { subject_id: subjectId, week_no: weekNo }
        });
        return response.data;
    },

    getSubjectWeeklyTestHistory: async (subjectId: number) => {
        const response = await apiClient.get('/subject-weekly-test/history', {
            params: { subject_id: subjectId }
        });
        return response.data;
    },

    // ================================================================
    // SUBJECT MONTHLY TEST
    // ================================================================
    getSubjectMonthlyTestQuestions: async (subjectId: number, monthNo: number) => {
        const response = await apiClient.get('/subject-monthly-test/questions', {
            params: { subject_id: subjectId, month_no: monthNo }
        });
        return response.data;
    },

    submitSubjectMonthlyTest: async (payload: {
        subject_monthly_test_id: number;
        answers: { mcq_id: number; selected_option: string }[];
        started_at: string;
        submitted_at: string;
    }) => {
        const response = await apiClient.post('/subject-monthly-test/submit', payload);
        return response.data;
    },

    getSubjectMonthlyTestResult: async (subjectId: number, monthNo: number) => {
        const response = await apiClient.get('/subject-monthly-test/result', {
            params: { subject_id: subjectId, month_no: monthNo }
        });
        return response.data;
    },

    getSubjectMonthlyTestHistory: async (subjectId: number) => {
        const response = await apiClient.get('/subject-monthly-test/history', {
            params: { subject_id: subjectId }
        });
        return response.data;
    },

    /**
     * Get dashboard data
     */
    getDashboardData: async (userId: number) => {
        const response = await apiClient.get('/dashboard', {
            params: { user_id: userId }
        });
        return response.data;
    }
};

export default studyService;
