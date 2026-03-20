import apiClient from './apiClient';

export interface ChatQACreate {
    user_id?: number;
    syllabus_id: number;
    question: string;
    conversation_id?: number;
}

export interface ChatQAOut {
    id: number;
    conversation_id: number;
    user_id?: number;
    syllabus_id: number;
    question: string;
    answer: string | null;
    created_at: string;
}

export interface ChatSessionOut {
    conversation_id: number;
    title: string;
    created_at: string;
}

const chatbotService = {
    /**
     * Send a message to the chatbot
     */
    askChatbot: async (payload: ChatQACreate): Promise<ChatQAOut> => {
        const response = await apiClient.post('/chatbot/', payload);
        return response.data;
    },

    /**
     * Get chat history for a specific conversation
     */
    getHistory: async (conversationId: number): Promise<ChatQAOut[]> => {
        const response = await apiClient.get(`/chatbot/history/${conversationId}`);
        return response.data;
    },

    /**
     * List all chat sessions for a user
     */
    getConversations: async (userId: number): Promise<ChatSessionOut[]> => {
        const response = await apiClient.get(`/chatbot/conversations/${userId}`);
        return response.data;
    },

    /**
     * Get chatbot greeting message
     */
    getGreeting: async (): Promise<{ message: string; timestamp: string }> => {
        const response = await apiClient.get('/chatbot/greeting');
        return response.data;
    }
};

export default chatbotService;
