import { useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format, startOfWeek, addDays, isSameDay, isBefore, startOfDay } from "date-fns";
import Lottie from "lottie-react";
import fireAnimation from "@/animiation/fire.json";

interface StreakWidgetProps {
  streakDays: number;
  onToggle?: () => void;
  isExpanded?: boolean;
  calendar?: {
    date: string;
    day: string;
    label?: string | number;
    status: 'completed' | 'active' | 'pending' | 'skipped';
    is_today: boolean;
  }[];
  streakPoints?: number;
  nextPointIn?: number;
  dailyTaskStatus?: {
    mcq: boolean;
    ca: boolean;
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
  onToggle,
  isExpanded = false,
  calendar,
  streakPoints = 0,
  nextPointIn = 7,
  dailyTaskStatus,
  statusMessage,
  streakConfig
}: StreakWidgetProps) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start

  const weekDays = useMemo(() => {
    const today = startOfDay(new Date());

    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i);
      const isToday = isSameDay(date, today);

      // If we have backend calendar info, use it. Otherwise fallback to calculation.
      const backendDay = calendar?.find(c => c.date === format(date, "yyyy-MM-dd"));
      const completed = backendDay ? backendDay.status === 'completed' : isBefore(date, today);

      return {
        day: backendDay?.label?.toString() || (i + 1).toString(),
        dateNum: format(date, "d"),
        completed,
        isToday
      };
    });
  }, [weekStart, calendar]);

  const activeIndex = useMemo(() => {
    const todayIndex = weekDays.findIndex(d => d.isToday);
    const lastCompIdx = weekDays.map((day, idx) => ({ completed: day.completed, idx }))
      .filter((item) => item.completed)
      .pop()?.idx;

    // If we have any completed days, the line should extend to at least today/last completed
    if (lastCompIdx !== undefined) {
      return Math.max(lastCompIdx, todayIndex !== -1 ? todayIndex : 0);
    }
    return undefined;
  }, [weekDays]);

  const lastCompletedIndex = useMemo(() => {
    return weekDays.map((day, idx) => ({ completed: day.completed, idx }))
      .filter((item) => item.completed)
      .pop()?.idx;
  }, [weekDays]);

  const lineWidthPercent = activeIndex !== undefined ? (activeIndex * 100) / 7 : 0;

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm animate-fade-in w-full">
      {/* Streak Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <Lottie
              animationData={fireAnimation}
              loop={true}
              className="w-5 h-5 -mt-1 scale-125"
            />
          </div>
          <span className="font-medium text-xl text-foreground">{streakDays} days streak</span>
        </div>

        {/* Points Display */}
        <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
          <svg className="w-3.5 h-3.5 text-orange-500 fill-orange-500" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-xs font-bold text-orange-700">{streakPoints} pts</span>
        </div>
      </div>

      {/* Combined Status Line */}
      <div className="flex items-center justify-center mb-5">
        <p className={cn(
          "text-[12px] font-normal transition-all",
          dailyTaskStatus?.is_today_completed ? "text-green-600" : "text-orange-500"
        )}>
          {statusMessage}
        </p>
      </div>

      {/* Calendar Grid Container */}
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
            {/* The Active Line */}
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

            {/* Highlight for completed segments */}
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

            {/* The Circles / Flame */}
            <div className="contents">
              {weekDays.map((day, index) => (
                <div key={`day-${index}`} className="flex justify-center items-center z-20 w-full relative h-10">
                  {index === 6 ? (
                    /* Integrated Reward Node for 7th Day */
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all z-30 border-2 font-bold text-[10px] shadow-sm",
                        day.completed || day.isToday
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-white scale-110"
                          : "bg-card border-muted-foreground/10 text-muted-foreground/40"
                      )}
                    >
                      +{streakConfig?.reward_points || 10}
                    </div>
                  ) : day.isToday ? (
                    <div className="w-8 h-8 flex items-center justify-center bg-card rounded-full relative z-30">
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
  );
}
