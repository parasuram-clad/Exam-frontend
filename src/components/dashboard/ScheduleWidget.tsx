import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ScheduleItem {
  month: string;
  day: number;
  title: string;
  time: string;
  color: "blue" | "green";
  link: string;
}

const scheduleItems: ScheduleItem[] = [
  {
    month: "Dec",
    day: 26,
    title: "Mock Test - Biology",
    time: "10:00 AM - 1:00 PM",
    color: "blue",
    link: "/test-series",
  },
  {
    month: "Dec",
    day: 28,
    title: "Live Doubt Session",
    time: "4:00 PM - 5:30 PM",
    color: "green",
    link: "/schedule",
  },
];

export function ScheduleWidget() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm animate-fade-in w-full">
      <h3 className="font-semibold text-lg text-foreground mb-4">Schedule</h3>

      <div className="space-y-4">
        {scheduleItems.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className="flex items-center gap-4 p-2 -mx-2 rounded-2xl hover:bg-muted/50 transition-colors group cursor-pointer"
          >
            {/* Date Box */}
            <div
              className={cn(
                "rounded-2xl py-3 px-4 text-center min-w-[60px] flex flex-col items-center justify-center transition-transform group-hover:scale-105",
                item.color === "blue" ? "bg-[#EFF6FF]" : "bg-[#F0FDF4]"
              )}
            >
              <span className="text-xs font-medium text-slate-500 block uppercase tracking-wide">
                {item.month}
              </span>
              <span className="text-xl font-bold text-slate-900 leading-none mt-1">
                {item.day}
              </span>
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium text-[15px] text-foreground truncate group-hover:text-primary transition-colors">
                {item.title}
              </p>
              <p className="text-sm text-muted-foreground font-normal">
                {item.time}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
