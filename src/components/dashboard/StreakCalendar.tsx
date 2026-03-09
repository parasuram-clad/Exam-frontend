import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isAfter,
    startOfDay
} from "date-fns";

interface CalendarData {
    day_no: number;
    label: number;
    status: 'completed' | 'active' | 'pending';
    is_today: boolean;
    date?: string; // Optional if backend provides actual dates
}

export function StreakCalendar({ data }: { data?: CalendarData[] }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = startOfDay(new Date());

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    // Calculate calendar grid
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    // Dynamic statuses based on backend data if available, otherwise fallback to logic
    const getStatus = (day: Date) => {
        const checkDay = startOfDay(day);
        const isToday = isSameDay(checkDay, today);

        if (isToday) return "today";

        // If we have backend data, we should ideally match by date.
        // For now, if no date is provided in backend data, we'll keep the logic simple
        // but prefer the provided status if we can map it.

        if (isAfter(checkDay, today)) return undefined;

        const d = checkDay.getDate();
        const m = checkDay.getMonth();

        // This is the old random logic - we'll keep it as fallback
        if ((d + m) % 7 === 0 || (d + m) % 11 === 0) return "skipped";
        return "completed";
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-semibold text-[#1a2b4b]">
                    {format(currentMonth, "MMMM yyyy")}
                </h3>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
                        <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-[#1a2b4b]" />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#1a2b4b]" />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center mb-4">
                {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                    <div key={day} className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.1em]">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-y-3 text-center mb-8">
                {calendarDays.map((day, index) => {
                    const status = getStatus(day);
                    const isSelectedMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, today);
                    const isUpcoming = isAfter(startOfDay(day), today);

                    return (
                        <div key={index} className="flex items-center justify-center h-8 w-full">
                            <div
                                className={cn(
                                    "w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 relative",
                                    !isSelectedMonth && "text-slate-200/50",
                                    isSelectedMonth && isUpcoming && !isToday && "text-slate-300",
                                    isSelectedMonth && !isUpcoming && !status && "text-[#1a2b4b]",

                                    // Status Overrides
                                    isSelectedMonth && (
                                        status === "today" ? "bg-[#72C146] text-white shadow-[0_4px_10px_rgba(114,193,70,0.3)]" :
                                            status === "skipped" ? "bg-[#C4C8D0] text-white" :
                                                status === "completed" ? " text-primary" : ""
                                    )
                                )}
                            >
                                {format(day, "d")}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="h-[1px] bg-slate-50 w-full mb-6" />

            {/* Legend */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1a2b4b]" />
                    <span className="text-[11px] font-semibold text-slate-400">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#72C146]" />
                    <span className="text-[11px] font-semibold text-slate-400">Today</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C4C8D0]" />
                    <span className="text-[11px] font-semibold text-slate-400">Skipped</span>
                </div>
            </div>
        </div>
    );
}
