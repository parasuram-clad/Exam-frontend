import {
    StreakWidget,
    LeaderboardWidget,
    StreakCalendar,
} from "@/components/dashboard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import studyHoursIcon from "@/assets/dashboard/study-hours-icon.png";
import accuracyIcon from "@/assets/dashboard/accuracy-icon.png";
import mcqsIcon from "@/assets/dashboard/mcqs-icon.png";
import rankIcon from "@/assets/dashboard/rank.png";
import { useQuery } from "@tanstack/react-query";
import studyService from "@/services/study.service";
import authService from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Trophy } from "lucide-react";

interface RightSidebarWidgetsProps {
    initialView?: 'streak' | 'leaderboard' | 'all';
}

export function RightSidebarWidgets({ initialView = 'all' }: RightSidebarWidgetsProps) {
    const navigate = useNavigate();
    const [isStreakInfoExpanded, setIsStreakInfoExpanded] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(initialView === 'streak');

    const { user, currentContext } = useAuth();

    const { data: dashboardData, isLoading, error } = useQuery({
        queryKey: ['dashboard', user?.id, currentContext?.plan_id],
        queryFn: () => studyService.getDashboardData(user!.id, currentContext?.plan_id),
        enabled: !!user?.id && !!currentContext?.plan_id,
        staleTime: 5 * 60 * 1000,
    });

    const features = dashboardData?.context?.features;

    // Helper to determine visibility
    const showDailyPerformance = initialView === 'all';
    const showStreak = initialView === 'all' || initialView === 'streak';
    const showLeaderboard = initialView === 'all' || initialView === 'leaderboard';

    if (!currentContext?.plan_id) {
        return (
            <div className="bg-card rounded-xl p-6 border border-dashed border-border text-center space-y-4 shadow-sm">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-sm">No Performance Data</h3>
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                        Generate your study plan to track your streak, leaderboard rank, and daily study metrics.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-xs font-medium">
                Unable to load dashboard data.
            </div>
        );
    }

    const dailyPerformance = dashboardData?.daily_performance || {
        study_time: 0,
        study_hours: 0,
        accuracy: 0,
        mcqs_solved: 0,
        current_rank: 0
    };

    const streakCount = dashboardData?.streak?.current_streak || 0;

    // Map backend leaderboard to LeaderboardEntry format
    const leaderboardData = dashboardData?.leaderboard?.leaderboard?.map((l: any) => ({
        rank: l.rank,
        name: l.name,
        initials: l.initials,
        marks: l.total_marks,
        accuracy: `${l.accuracy}%`,
        isYou: l.is_current_user,
        color: l.is_current_user ? "bg-slate-500" : (l.rank === 1 ? "bg-amber-500" : "bg-blue-600")
    })) || [];

    return (
        <div className="space-y-8">
            {/* Daily Performance */}
            {features?.daily_performance && showDailyPerformance && (
                <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-foreground">
                            Daily Performance
                        </h3>
                        <ChevronRight
                            className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => navigate('/progress')}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 rounded-xl p-3 h-20  flex items-center gap-2">
                            <img src={studyHoursIcon} alt="Study Time" className="w-6 h-6" />
                            <div>
                                <p className="text-xl font-semibold text-foreground">{dailyPerformance.study_time || dailyPerformance.study_hours || 0}h</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Study Time</p>
                            </div>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 h-20  flex items-center gap-2">
                            <img src={accuracyIcon} alt="Accuracy" className="w-6 h-6" />
                            <div>
                                <p className="text-xl font-semibold text-foreground">{dailyPerformance.accuracy}%</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Accuracy</p>
                            </div>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 h-20  flex items-center gap-2">
                            <img src={mcqsIcon} alt="MCQs" className="w-6 h-6" />
                            <div>
                                <p className="text-xl font-semibold  text-foreground">{dailyPerformance.mcqs_solved}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">MCQs Solved</p>
                            </div>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 h-20 flex items-center gap-2">
                            <img src={rankIcon} alt="Current Rank" className="w-6 h-6" />
                            <div>
                                <p className="text-xl font-semibold text-foreground">{dailyPerformance.current_rank}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Current Rank</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {features?.streak && showStreak && (
                <>
                    <StreakWidget
                        streakDays={streakCount}
                        calendar={dashboardData?.streak?.weekly_strip}
                    />
                </>
            )}

            {features?.leaderboard && showLeaderboard && (
                <LeaderboardWidget data={leaderboardData} />
            )}
        </div>
    );
}
