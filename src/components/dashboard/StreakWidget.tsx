import { Flame, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDay {
  day: string;
  date: number;
  completed: boolean;
  isToday?: boolean;
}

const weekDays: StreakDay[] = [
  { day: "W", date: 21, completed: true },
  { day: "T", date: 22, completed: true },
  { day: "F", date: 23, completed: true },
  { day: "S", date: 24, completed: false, isToday: true },
  { day: "S", date: 25, completed: false },
  { day: "M", date: 26, completed: false },
  { day: "T", date: 27, completed: false },
];

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path
      d="M19.5 10.5C19.5 10.5 16.5 10.5 16.5 8C16.5 5 18 4.5 18 4.5C18 4.5 9 5.5 9 10C9 14.5 15 15 15 15C15 15 12 16.5 12 18C12 21 16.5 21 16.5 21C16.5 21 21 17 21 14C21 12.5 19.5 10.5 19.5 10.5Z"
      fill="#FCD34D"
    />
    <path
      d="M14.563 2.516c.036-.08.136-.108.208-.057.947.67 1.879 1.458 2.308 2.059.207.29.587.973.587 2.112 0 1.25-.634 2.16-1.042 2.744-.144.207-.282.404-.396.61-.433.784-.138 2.016.512 2.666 0 0 .15.15.15.364 0 .972-.748 2.502-1.742 3.864-1.294 1.773-3.266 3.12-5.467 3.12-3.8 0-6.68-3.04-6.68-6.666 0-3.328 1.956-4.665 2.623-5.12.533-.365 1.398-.956 1.398-2.546 0-.663-.2-1.554-.482-2.316-.03-.08.05-.16.126-.145.795.163 1.83.565 2.522 1.257.653.654.896 1.474.966 2.022.025.19.261.272.398.127.604-.64.912-1.504.981-2.22.05-.516.486-1.53.83-1.872z"
      fill="#FCD34D"
    />
  </svg>
);

interface StreakWidgetProps {
  streakDays: number;
}

export function StreakWidget({ streakDays }: StreakWidgetProps) {
  // Find index of the last completed day to draw the line up to that point
  const lastCompletedIndex = weekDays
    .map((day, idx) => ({ completed: day.completed, idx }))
    .filter((item) => item.completed)
    .pop()?.idx;

  // 7 columns. Center to center dist is 100/7 %.
  // Line starts at center of first col (100/14 %).
  // Line width = number of hops * (100/7) %.
  // Hops = lastCompletedIndex (if starting from 0).

  const lineWidthPercent =
    lastCompletedIndex !== undefined
      ? (lastCompletedIndex * 100) / 7
      : 0;

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm animate-fade-in w-full">
      {/* Streak Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">🔥</span>
        <span className="font-bold text-xl text-foreground">{streakDays} days streak</span>
      </div>

      <p className="text-sm text-foreground mb-6 font-medium">
        A little progress today keeps you on track
      </p>

      {/* Calendar Grid Container */}
      <div className="relative">
        <div className="grid grid-cols-7 gap-0 text-center">
          {/* Day Headers (W, T, F...) */}
          {weekDays.map((day, index) => (
            <div
              key={`header-${index}`}
              className={cn(
                "text-xs font-semibold mb-3",
                day.completed ? "text-foreground" : "text-muted-foreground/60"
              )}
            >
              {day.day}
            </div>
          ))}

          {/* Circles Row with Connector Line Background */}
          <div className="col-span-7 relative h-8 flex items-center justify-center mb-3">
            {/* The Active Line (Connecting completed days) */}
            {lastCompletedIndex !== undefined && lastCompletedIndex > 0 && (
              <div
                className="absolute h-[2px] bg-primary z-0"
                style={{
                  left: `${100 / 14}%`, // Center of first column
                  width: `${lineWidthPercent}%`,
                  top: "50%",
                  transform: "translateY(-50%)"
                }}
              />
            )}

            {/* The Circles */}
            <div className="contents">
              {weekDays.map((day, index) => (
                <div key={`day-${index}`} className="flex justify-center items-center z-10 w-full relative">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all bg-card", // Added bg-card to hide line behind circle
                      day.completed
                        ? "bg-primary text-primary-foreground border-none"
                        : "bg-transparent border-2 border-muted-foreground/20 text-transparent"
                    )}
                  >
                    {day.completed && <Check className="w-4 h-4 stroke-[3px]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Headers (21, 22...) */}
          {weekDays.map((day, index) => (
            <div
              key={`date-${index}`}
              className={cn(
                "text-xs font-medium",
                day.completed ? "text-foreground" : "text-muted-foreground/60"
              )}
            >
              {day.date}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
