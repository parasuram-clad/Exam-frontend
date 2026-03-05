import { QueryClient } from '@tanstack/react-query';
import authService, { UserMe } from './auth.service';
import studyService from './study.service';
import chatbotService from './chatbot.service';
import { notificationService } from './notification.service';

/**
 * Prefetches all essential data for a user to make the application feel instantaneous.
 * This should be called immediately after a successful login or during initial app load.
 * 
 * @param queryClient The TanStack Query client instance
 * @param user The current user profile (optional, will fetch if not provided)
 */
export const prefetchAllUserData = async (queryClient: QueryClient, user?: UserMe) => {
    try {
        // 1. Get user profile if not provided
        let currentUser = user;
        if (!currentUser) {
            currentUser = await queryClient.fetchQuery({
                queryKey: ['user-me'],
                queryFn: () => authService.getCurrentUser(),
                staleTime: 1000 * 60 * 30, // 30 minutes
            });
        }

        if (!currentUser || !currentUser.id) return;

        const userId = currentUser.id;

        // 2. Parallel pre-fetching of essential data for all main pages
        console.log(`🚀 Preloading app data for user ${userId}...`);

        await Promise.allSettled([
            // Study Plan data
            queryClient.prefetchQuery({
                queryKey: ['study-plans', userId],
                queryFn: () => studyService.getUserStudyPlans(userId),
                staleTime: 1000 * 60 * 5,
            }),

            // Roadmap / Progress data
            queryClient.prefetchQuery({
                queryKey: ['roadmap', userId],
                queryFn: () => studyService.getUserRoadmap(userId),
                staleTime: 1000 * 60 * 5,
            }),

            // Chatbot conversations
            queryClient.prefetchQuery({
                queryKey: ['chatbot-conversations', userId],
                queryFn: () => chatbotService.getConversations(userId),
                staleTime: 1000 * 60 * 5,
            }),

            // User notes
            queryClient.prefetchQuery({
                queryKey: ['user-notes', userId],
                queryFn: () => studyService.getUserNotes(userId),
                staleTime: 1000 * 60 * 5,
            }),

            // Notifications
            queryClient.prefetchQuery({
                queryKey: ['notifications'],
                queryFn: () => notificationService.getNotifications(),
                staleTime: 1000 * 60 * 2,
            }),

            queryClient.prefetchQuery({
                queryKey: ['notifications-unread-count'],
                queryFn: () => notificationService.getUnreadCount(),
                staleTime: 1000 * 60 * 1,
            }),
        ]);

        // 3. Deeper pre-fetching: Get active topics from the study plan
        try {
            const plans = await queryClient.fetchQuery({
                queryKey: ['study-plans', userId],
                queryFn: () => studyService.getUserStudyPlans(userId),
                staleTime: 1000 * 60 * 5,
            });

            if (plans && Array.isArray(plans)) {
                const activePlans = plans
                    .filter(p => (p.plan_status === 'START' || p.plan_status === 'CONTINUE' || p.plan_status === 'IN_PROGRESS') && p.syllabus_id)
                    .slice(0, 10); // Prefetch more topics

                if (activePlans.length > 0) {
                    console.log(`🧠 Prefetching content for ${activePlans.length} active topics...`);
                    await Promise.allSettled(
                        activePlans.map(plan => prefetchTopic(queryClient, plan.syllabus_id!, userId))
                    );
                }
            }
        } catch (planError) {
            console.warn("Could not prefetch specific topics:", planError);
        }

        console.log("✅ App data preloaded successfully");
    } catch (error) {
        console.error("❌ Failed to preload app data:", error);
    }
};

/**
 * Manually prefetch a specific topic's content
 */
export const prefetchTopic = (queryClient: QueryClient, syllabusId: number | string, userId: number) => {
    const id = typeof syllabusId === 'string' ? parseInt(syllabusId) : syllabusId;
    if (isNaN(id)) return Promise.resolve();

    return queryClient.prefetchQuery({
        queryKey: ['topic-content', id, userId],
        queryFn: () => studyService.getTopicContentBySyllabusId(id, userId),
        staleTime: 1000 * 60 * 15, // Content is stable, 15m cache is safe
    });
};


