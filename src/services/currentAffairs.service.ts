import apiClient from "./apiClient";

export interface Article {
    id: string;
    title: string;
    summary: string;
    category: string;
    date: string;
    date_raw?: string;
    readTime: string;
    important: boolean;
    bookmarked: boolean;
    tags: string[];
    full_content?: {
        introduction: string;
        sections: {
            title: string;
            content: string;
            is_list?: boolean;
            list_items?: string[];
            is_key_value?: boolean;
        }[];
        possible_question: {
            question: string;
            answer: string;
        };
    };
}

class CurrentAffairsService {
    async getArticles(date?: string): Promise<Article[]> {
        const url = date ? `/current-affairs/items/?date_from=${date}&date_to=${date}` : "/current-affairs/items/";
        const response = await apiClient.get(url);
        return response.data.map((item: any) => {
            // Use the explicit date field if available, else fallback to created_at
            const itemDate = item.date ? new Date(item.date) : new Date(item.created_at);
            return {
                ...item,
                id: item.id.toString(),
                date: itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                date_raw: item.date || item.created_at?.split('T')[0],
                readTime: item.read_time || "5 min",
                tags: item.tags ? item.tags.split(',') : [],
                summary: item.summary || item.content.substring(0, 100) + '...',
                bookmarked: item.bookmarked || false,
            };
        });
    }

    async getMCQs(date: string) {
        const response = await apiClient.get(`/current-affairs/mcqs/?date=${date}`);
        return response.data;
    }

    async getBookmarks(): Promise<Article[]> {
        const response = await apiClient.get("/current-affairs/bookmarks/");
        return response.data.map((item: any) => {
            const itemDate = item.date ? new Date(item.date) : new Date(item.created_at);
            return {
                ...item,
                id: item.id.toString(),
                date: itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                date_raw: item.date || item.created_at?.split('T')[0],
                readTime: item.read_time || "5 min",
                tags: item.tags ? item.tags.split(',') : [],
                summary: item.summary || item.content.substring(0, 100) + '...',
                bookmarked: true,
            };
        });
    }

    async toggleBookmark(id: string): Promise<boolean> {
        const response = await apiClient.post(`/current-affairs/items/${id}/bookmark`);
        return response.data.bookmarked;
    }
}

export default new CurrentAffairsService();
