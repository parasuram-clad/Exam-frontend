import apiClient from "./apiClient";

export interface Notification {
    id: number;
    user_id: number;
    message: string;
    category: string;
    date_sent: string;
    read_status: boolean;
    expiry_date: string | null;
    status: string;
}

export const notificationService = {
    async getNotifications(): Promise<Notification[]> {
        const response = await apiClient.get<Notification[]>("/notifications/");
        return response.data;
    },

    async getUnreadCount(): Promise<number> {
        const response = await apiClient.get<{ unread_count: number }>("/notifications/unread-count");
        return response.data.unread_count;
    },

    async markAsRead(notificationId: number): Promise<Notification> {
        const response = await apiClient.patch<Notification>(`/notifications/${notificationId}`, {
            read_status: true,
        });
        return response.data;
    },

    async markAllAsRead(): Promise<void> {
        await apiClient.patch("/notifications/mark-all-read");
    },

    async deleteNotification(notificationId: number): Promise<void> {
        await apiClient.delete(`/notifications/${notificationId}`);
    }
};
