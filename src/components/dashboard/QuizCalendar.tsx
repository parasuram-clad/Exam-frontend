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

/**
 * QuizCalendar Component
 * Specifically designed to show Daily Quiz attempt status
 */
interface QuizCalendarProps {
    selectedDate?: Date;
    onSelectDate?: (date: Date) => void;
}

export function QuizCalendar({ selectedDate, onSelectDate }: QuizCalendarProps) {
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

    // Mock statuses for demonstration based on the image and logic
    const getStatus = (day: Date) => {
        const checkDay = startOfDay(day);
        if (isSameDay(checkDay, today)) return "today";
        if (isAfter(checkDay, today)) return undefined;

        const d = checkDay.getDate();
        const m = checkDay.getMonth();

        // Mocking some skipped and completed days
        if (d === 5 || d === 9) return "skipped";
        if (d < today.getDate() && ![5, 9].includes(d)) return "completed";

        return undefined;
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-[#F1F5F9] shadow-sm w-full font-['Outfit',sans-serif]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[20px] font-semibold text-[#1E293B]">
                    {format(currentMonth, "MMMM yyyy")}
                </h3>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors group bg-[#F8FAFC]">
                        <ChevronLeft className="w-5 h-5 text-[#94A3B8]" />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors group bg-[#F8FAFC]">
                        <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center mb-6">
                {["S", "m", "t", "w", "t", "f", "s"].map((day, i) => (
                    <div key={`${day}-${i}`} className="text-[14px] font-semibold text-[#CBD5E1] uppercase tracking-wider text-center">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-y-4 text-center mb-10">
                {calendarDays.map((day, index) => {
                    const status = getStatus(day);
                    const isSelectedMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, today);
                    const isUpcoming = isAfter(startOfDay(day), today);
                    const isSelectedDate = selectedDate && isSameDay(day, selectedDate);

                    return (
                        <div key={index} className="flex items-center justify-center h-9 w-full">
                            <button
                                onClick={() => onSelectDate?.(day)}
                                className={cn(
                                    "w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 relative",
                                    !isSelectedMonth && "text-[#CBD5E1]/50",
                                    isSelectedMonth && isUpcoming && !isToday && "text-[#CBD5E1]",
                                    isSelectedMonth && !isUpcoming && !status && "text-[#1E293B]",

                                    // Selection styling
                                    // isSelectedDate && "ring-2 ring-primary ring-offset-2",

                                    // Status Overrides based on the user's image
                                    isSelectedMonth && !isSelectedDate && (
                                        status === "today" ? "bg-accent text-white shadow-[0_6px_15px_rgba(114,193,70,0.4)]" :
                                            status === "skipped" ? "bg-[#B4BCC7] text-white" :
                                                status === "completed" ? " text-primary" : ""
                                    ),
                                    // If selected, we might want to keep the text color readable
                                    isSelectedDate && "bg-[#72C146] text-white "
                                )}
                            >
                                {format(day, "d")}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="h-[1px] bg-[#F1F5F9] w-full mb-6" />

            {/* Legend */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#1E293B]" />
                    <span className="text-[10px] font-medium text-[#64748B]">Quiz Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span className="text-[10px] font-medium text-[#64748B]">Today</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#B4BCC7]" />
                    <span className="text-[10px] font-medium text-[#64748B]">Skipped</span>
                </div>
            </div>
        </div>
    );
}
