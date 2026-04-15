import { useMemo, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import fireAnimation from "@/animiation/fire.json";

// API weekly_calendar entry shape
interface WeeklyCalendarEntry {
  day_no: number;
  label: number | string;
  status: 'completed' | 'pending' | 'skipped' | 'active';
  is_today: boolean;
}

interface StreakWidgetProps {
  streakDays: number;
  longestStreak?: number;
  onToggle?: () => void;
  isExpanded?: boolean;
  /** Accepts the API weekly_calendar array directly */
  calendar?: WeeklyCalendarEntry[];
  streakPoints?: number;
  nextPointIn?: number;
  dailyTaskStatus?: {
    mcq?: boolean;
    ca?: boolean;
    is_today_completed: boolean;
  };
  statusMessage?: string;
  streakConfig?: {
    milestone: number;
    reward_points: number;
  };
}

export function StreakWidget({
  streakDays,
  longestStreak,
  onToggle,
  isExpanded = false,
  calendar,
  streakPoints = 0,
  nextPointIn = 7,
  dailyTaskStatus,
  statusMessage,
  streakConfig
}: StreakWidgetProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const isTodayCompleted = dailyTaskStatus?.is_today_completed ?? false;
  const milestone = streakConfig?.milestone ?? 7;
  const rewardPoints = streakConfig?.reward_points ?? 10;

  /**
   * IMPORTANT: The backend always returns is_today: false for every entry.
   * We derive "today's day_no" client-side:
   *  - If today is already completed  → today = streakDays (current_streak)
   *  - If today is still pending       → today = streakDays + 1
   * Both are clamped to [1, milestone].
   */
  const todayDayNo = Math.min(
    milestone,
    Math.max(1, isTodayCompleted ? streakDays : streakDays + 1)
  );

  // Normalise the API weekly_calendar to a simple 7-slot array
  const weekDays = useMemo(() => {
    if (calendar && calendar.length > 0) {
      const sorted = [...calendar].sort((a, b) => a.day_no - b.day_no).slice(0, 7);
      return sorted.map((entry) => ({
        day: entry.label?.toString() || entry.day_no.toString(),
        // Use backend status for completed; derive isToday client-side
        completed: entry.status === 'completed',
        isToday: entry.day_no === todayDayNo,
      }));
    }
    return Array.from({ length: 7 }, (_, i) => ({
      day: (i + 1).toString(),
      completed: false,
      isToday: (i + 1) === todayDayNo,
    }));
  }, [calendar, todayDayNo]);

  const lastCompletedIndex = useMemo(() => {
    return weekDays.map((day, idx) => ({ completed: day.completed, idx }))
      .filter((item) => item.completed)
      .pop()?.idx;
  }, [weekDays]);

  const todayIndex = weekDays.findIndex(d => d.isToday);

  // The connector line extends to the further of: last completed OR today
  const activeIndex = useMemo(() => {
    if (lastCompletedIndex !== undefined) {
      return Math.max(lastCompletedIndex, todayIndex !== -1 ? todayIndex : 0);
    }
    return todayIndex !== -1 ? todayIndex : undefined;
  }, [lastCompletedIndex, todayIndex]);

  const lineWidthPercent = activeIndex !== undefined ? (activeIndex * 100) / 7 : 0;

  const howItWorksSteps = [
    {
      icon: "📅",
      title: "Complete Your Daily Task",
      desc: "You must complete your daily Current Affairs MCQ (or required task) to progress your streak.",
    },
    {
      icon: "🔥",
      title: "7 Days = Reward",
      desc: `Complete ${milestone} consecutive days to earn +${rewardPoints} points (as per your plan config). Each day must be completed without missing!`,
    },
    {
      icon: "❌",
      title: "Streak Breaks on Missed Day",
      desc: "If you miss a day, your streak resets to Day 1. You must start again to reach the milestone.",
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm animate-fade-in w-full overflow-hidden">
      {/* Main widget content */}
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 flex items-center justify-center">
              <Lottie
                animationData={fireAnimation}
                loop={true}
                className="w-5 h-5 -mt-1 scale-125"
              />
            </div>
            <div>
              <span className="font-semibold text-lg text-foreground">
                {streakDays} day{streakDays !== 1 ? 's' : ''} streak
              </span>
              {longestStreak !== undefined && longestStreak > 0 && (
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  Longest: {longestStreak} days
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 ">
            {/* Points Badge */}
            <div className="flex items-center gap-1.5 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100">
              <svg className="w-3.5 h-3.5 text-orange-500 fill-orange-500" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs font-bold text-orange-700">{streakPoints} pts</span>
            </div>

            {/* Expand arrow */}

            <motion.div
              animate={{ rotate: isInfoOpen ? 90 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ChevronRight
                className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => setIsInfoOpen((v) => !v)} aria-label={isInfoOpen ? "Hide streak info" : "Show streak info"}
              />
            </motion.div>

          </div>
        </div>

        {/* Next reward info */}
        {nextPointIn > 0 && (
          <div className="text-center mb-4">
            <p className="text-[10px] text-muted-foreground">
              🎯 {nextPointIn} more day{nextPointIn !== 1 ? 's' : ''} for{" "}
              <span className="font-semibold text-orange-500">+{rewardPoints} pts</span>
            </p>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="relative">
          <div className="grid grid-cols-7 gap-0 text-center">
            {/* Day Headers */}
            {weekDays.map((day, index) => (
              <div
                key={`header-${index}`}
                className={cn(
                  "text-[10px] font-semibold mb-3",
                  day.completed || day.isToday ? "text-foreground" : "text-muted-foreground/60"
                )}
              >
                {day.day}
              </div>
            ))}

            {/* Circles Row with Connector Line */}
            <div className="col-span-7 relative h-10 flex items-center justify-center mb-3">
              {/* Active line (faded) */}
              {activeIndex !== undefined && (
                <div
                  className="absolute h-[2px] bg-primary/30 z-0"
                  style={{
                    left: `${100 / 14}%`,
                    width: `${lineWidthPercent}%`,
                    top: "50%",
                    transform: "translateY(-50%)"
                  }}
                />
              )}
              {/* Completed line */}
              {lastCompletedIndex !== undefined && (
                <div
                  className="absolute h-[2px] bg-primary z-10"
                  style={{
                    left: `${100 / 14}%`,
                    width: `${(lastCompletedIndex * 100) / 7}%`,
                    top: "50%",
                    transform: "translateY(-50%)"
                  }}
                />
              )}

              {/* Circles / Flame / Reward */}
              <div className="contents">
                {weekDays.map((day, index) => (
                  <div key={`day-${index}`} className="flex justify-center items-center z-20 w-full relative h-10">
                    {index === 6 ? (
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all z-30 border-2 font-bold text-[10px] shadow-sm",
                          day.completed || day.isToday
                            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-white scale-110"
                            : "bg-card border-muted-foreground/10 text-muted-foreground/40"
                        )}
                      >
                        +{rewardPoints}
                      </div>
                    ) : day.isToday ? (
                      /* Always show fire animation on today's day */
                      <div className="w-8 h-8 flex items-center justify-center ">
                        <Lottie
                          animationData={fireAnimation}
                          loop={true}
                          className="w-5 h-5 -mt-0.5 scale-150"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all z-30 border-2",
                          day.completed
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-muted-foreground/10 text-transparent"
                        )}
                      >
                        {day.completed && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expandable "How It Works" section ── */}
      <AnimatePresence initial={false}>
        {isInfoOpen && (
          <motion.div
            key="streak-info"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-border/60 mx-5" />
            <div className="px-5 pt-4 pb-5 space-y-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                How Streak Works
              </p>

              {howItWorksSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.25 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-base flex-shrink-0">
                    {step.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-foreground leading-tight">
                      {step.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Milestone progress bar and feedback */}
              <div className="mt-4 pt-3 border-t border-border/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Milestone Progress
                  </span>
                  <span className="text-[10px] font-bold text-orange-500">
                    {streakDays}/{milestone} days
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (streakDays / milestone) * 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                    className={cn(
                      "h-full rounded-full",
                      streakDays >= milestone
                        ? "bg-gradient-to-r from-amber-400 to-orange-500"
                        : "bg-gradient-to-r from-primary/70 to-primary"
                    )}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                  {streakDays >= milestone
                    ? `🎉 Milestone reached! +${rewardPoints} pts earned. Keep going for more rewards!`
                    : streakDays === 0
                      ? `Streak broken. Start again from Day 1 to earn your reward.`
                      : `${milestone - streakDays} day${(milestone - streakDays) !== 1 ? 's' : ''} away from +${rewardPoints} pts reward`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
