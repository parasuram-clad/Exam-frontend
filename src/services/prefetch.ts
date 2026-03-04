import { QueryClient } from '@tanstack/react-query';
import authService, { UserMe } from './auth.service';
import studyService from './study.service';
import chatbotService from './chatbot.service';

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
        // We use prefetchQuery which doesn't block but starts the request
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
        ]);

        // 3. Deeper pre-fetching: Get the first few active topics from the study plan
        // to make that first click instantaneous.
        try {
            const plans = await queryClient.fetchQuery({
                queryKey: ['study-plans', userId],
                queryFn: () => studyService.getUserStudyPlans(userId),
                staleTime: 1000 * 60 * 5,
            });

            if (plans && Array.isArray(plans)) {
                // Find first 2 uncompleted tasks with a syllabus_id
                const activePlans = plans
                    .filter(p => (p.plan_status === 'START' || p.plan_status === 'CONTINUE') && p.syllabus_id)
                    .slice(0, 2);

                if (activePlans.length > 0) {
                    console.log(`🧠 Prefetching content for ${activePlans.length} active topics...`);
                    await Promise.allSettled(
                        activePlans.map(plan =>
                            queryClient.prefetchQuery({
                                queryKey: ['topic-content', plan.syllabus_id, userId],
                                queryFn: () => studyService.getTopicContentBySyllabusId(plan.syllabus_id!, userId),
                                staleTime: 1000 * 60 * 10,
                            })
                        )
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
