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
import { Loader2 } from "lucide-react";

interface RightSidebarWidgetsProps {
    initialView?: 'streak' | 'leaderboard' | 'all';
}

export function RightSidebarWidgets({ initialView = 'all' }: RightSidebarWidgetsProps) {
    const navigate = useNavigate();
    const [isStreakInfoExpanded, setIsStreakInfoExpanded] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(initialView === 'streak');

    const { data: userData } = useQuery({
        queryKey: ['user-me'],
        queryFn: () => authService.getCurrentUser(),
    });

    const { data: dashboardData, isLoading, error } = useQuery({
        queryKey: ['dashboard-data', userData?.id],
        queryFn: () => studyService.getDashboardData(userData!.id),
        enabled: !!userData?.id,
    });

    // Helper to determine visibility
    const showDailyPerformance = initialView === 'all';
    const showStreak = initialView === 'all' || initialView === 'streak';
    const showLeaderboard = initialView === 'all' || initialView === 'leaderboard';

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
                        <img src={studyHoursIcon} alt="Study Hours" className="w-6 h-6" />
                        <div>
                            <p className="text-xl font-semibold text-foreground">{dailyPerformance.study_hours}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">Study Hours</p>
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


            {showStreak && (
                <>
                    <StreakWidget
                        streakDays={streakCount}
                        calendar={dashboardData?.streak?.weekly_calendar}
                        onToggle={() => setIsCalendarOpen(!isCalendarOpen)}
                        isExpanded={isCalendarOpen}
                    />

                    <AnimatePresence>
                        {isCalendarOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8 overflow-hidden"
                            >
                                <StreakCalendar data={dashboardData?.streak?.weekly_calendar} />

                                {/* How Streak Works Collapsible */}
                                <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden transition-all duration-300">
                                    <div
                                        className="py-3 px-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => setIsStreakInfoExpanded(!isStreakInfoExpanded)}
                                    >
                                        <span className="text-sm font-semibold text-[#1a2b4b]">
                                            How Streak Works?
                                        </span>
                                        <ChevronDown
                                            className={cn(
                                                "w-4 h-4 text-slate-400 transition-transform duration-300",
                                                isStreakInfoExpanded && "rotate-180"
                                            )}
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {isStreakInfoExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="px-4 pb-4 bg-[#F9FAFB]/50"
                                            >
                                                <div className="pt-2 text-[13px] text-slate-600 leading-relaxed font-medium">
                                                    Your streak grows when you complete an MCQ test from today's
                                                    scheduled study plan topic.
                                                </div>

                                                <div className="mt-4 space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-lg">🔥</span>
                                                        <p className="text-[13px] text-slate-600 font-medium">
                                                            Finish at least one planned topic test for the day
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-lg">🔥</span>
                                                        <p className="text-[13px] text-slate-600 font-medium">
                                                            Complete it before the day ends
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {showLeaderboard && <LeaderboardWidget data={leaderboardData} />}
        </div>
    );
}
