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

interface RightSidebarWidgetsProps {
    initialView?: 'streak' | 'leaderboard' | 'all';
}

export function RightSidebarWidgets({ initialView = 'all' }: RightSidebarWidgetsProps) {
    const navigate = useNavigate();
    const [isStreakInfoExpanded, setIsStreakInfoExpanded] = useState(false);
    // If 'streak' view is requested, default the calendar to open
    const [isCalendarOpen, setIsCalendarOpen] = useState(initialView === 'streak');

    // Helper to determine visibility
    const showDailyPerformance = initialView === 'all';
    const showStreak = initialView === 'all' || initialView === 'streak';
    const showLeaderboard = initialView === 'all' || initialView === 'leaderboard';

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
                            <p className="text-xl font-semibold text-foreground">2.5</p>
                            <p className="text-[10px] text-muted-foreground">Study Hours</p>
                        </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 h-20  flex items-center gap-2">
                        <img src={accuracyIcon} alt="Accuracy" className="w-6 h-6" />
                        <div>
                            <p className="text-xl font-semibold text-foreground">65%</p>
                            <p className="text-[10px] text-muted-foreground">Accuracy</p>
                        </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 h-20  flex items-center gap-2">
                        <img src={mcqsIcon} alt="MCQs" className="w-6 h-6" />
                        <div>
                            <p className="text-xl font-semibold  text-foreground">--</p>
                            <p className="text-[10px] text-muted-foreground">MCQs Solved</p>
                        </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 h-20 flex items-center gap-2">
                        <img src={rankIcon} alt="Current Rank" className="w-6 h-6" />
                        <div>
                            <p className="text-xl font-semibold text-foreground">--</p>
                            <p className="text-[10px] text-muted-foreground">Current Rank</p>
                        </div>
                    </div>
                </div>
            </div>


            {showStreak && (
                <>
                    <StreakWidget
                        streakDays={3}
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
                                <StreakCalendar />

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

            {showLeaderboard && <LeaderboardWidget />}
        </div>
    );
}
