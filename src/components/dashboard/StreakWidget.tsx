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
    status: 'completed' | 'active' | 'pending' | 'skipped';
    is_today: boolean;
  }[];
}

export function StreakWidget({ streakDays, onToggle, isExpanded = false, calendar }: StreakWidgetProps) {
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
        day: format(date, "EEEEE"),
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
      <div className="flex items-center justify-between mb-2">
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
        {onToggle && (
          <span
            onClick={onToggle}
            className={cn(
              "text-muted-foreground text-sm cursor-pointer hover:text-foreground rotate-90 transition-transform duration-300 select-none",
              isExpanded && "-rotate-90"
            )}
          >
            ›
          </span>
        )}
      </div>

      <p className="text-sm text-foreground mb-6 font-medium">
        A little progress today keeps you on track
      </p>

      {/* Calendar Grid Container */}
      <div className="relative">
        <div className="grid grid-cols-7 gap-0 text-center">
          {/* Day Headers */}
          {weekDays.map((day, index) => (
            <div
              key={`header-${index}`}
              className={cn(
                "text-xs font-semibold mb-3",
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
                  {day.isToday ? (
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
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all z-30",
                        day.completed
                          ? "bg-primary text-primary-foreground border-none"
                          : "bg-card border-2 border-muted-foreground/20 text-transparent"
                      )}
                    >
                      {day.completed && <Check className="w-4 h-4 stroke-[2px]" />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Date Headers */}
          {weekDays.map((day, index) => (
            <div
              key={`date-${index}`}
              className={cn(
                "text-xs font-medium",
                day.completed || day.isToday ? "text-foreground" : "text-muted-foreground/60"
              )}
            >
              {day.dateNum}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
