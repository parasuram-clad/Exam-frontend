import React, { useState, useEffect } from 'react';
import authService from '@/services/auth.service';
import studyService from '@/services/study.service';
import chatbotService from '@/services/chatbot.service';
import SplashScreen from './SplashScreen';
import { useQueryClient } from '@tanstack/react-query';

import { prefetchAllUserData } from '@/services/prefetch';

interface InitialDataLoaderProps {
    children: React.ReactNode;
}

const InitialDataLoader: React.FC<InitialDataLoaderProps> = ({ children }) => {
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [hasPreloaded, setHasPreloaded] = useState(false);
    const queryClient = useQueryClient();
    const token = localStorage.getItem('auth_tokens');

    useEffect(() => {
        const initApp = async () => {
            try {
                // If authenticated and haven't preloaded in this state cycle, do it
                if (authService.isAuthenticated() && !hasPreloaded) {
                    await prefetchAllUserData(queryClient);
                    setHasPreloaded(true);
                }

                // Simulate a minimum splash screen time for better UX
                const minTime = new Promise(resolve => setTimeout(resolve, 1500));
                await minTime;
            } catch (error) {
                console.error("Failed to initialize app:", error);
            } finally {
                setIsInitialLoading(false);
            }
        };

        initApp();
    }, [queryClient, token, hasPreloaded]);

    if (isInitialLoading) {
        return <SplashScreen />;
    }

    return <>{children}</>;
};

export default InitialDataLoader;
