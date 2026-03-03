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
    startOfDay,
    addDays,
    subDays,
    isAfter,
    isBefore
} from "date-fns";

interface StudyPlanCalendarProps {
    onDateClick?: (date: Date) => void;
    selectedDate?: Date;
    currentProgressDay: number;
    totalDays: number;
}

export function StudyPlanCalendar({ onDateClick, selectedDate, currentProgressDay, totalDays }: StudyPlanCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = startOfDay(new Date());

    // Calculate the start date of the study cycle (Day 1)
    const cycleStartDate = subDays(today, currentProgressDay - 1);
    const cycleEndDate = addDays(cycleStartDate, totalDays - 1);

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
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div key={`${day}-${i}`} className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.1em]">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-y-3 text-center mb-5">
                {calendarDays.map((day, index) => {
                    const checkDay = startOfDay(day);
                    const isSelectedMonth = isSameMonth(checkDay, monthStart);
                    const isSelected = selectedDate && isSameDay(checkDay, selectedDate);
                    const isToday = isSameDay(checkDay, today);

                    // Check if date has a study plan
                    const hasPlan = (isSameDay(checkDay, cycleStartDate) || isAfter(checkDay, cycleStartDate)) &&
                        (isSameDay(checkDay, cycleEndDate) || isBefore(checkDay, cycleEndDate));

                    const isCompleted = hasPlan && isBefore(checkDay, today);

                    return (
                        <div key={index} className="flex items-center justify-center relative h-8 w-full">
                            {isSelectedMonth ? (
                                <button
                                    onClick={() => hasPlan && onDateClick?.(checkDay)}
                                    disabled={!hasPlan}
                                    className={cn(
                                        "w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 relative",
                                        !hasPlan && "text-slate-200 cursor-not-allowed opacity-50",
                                        hasPlan && !isSelected && !isToday && !isCompleted && "text-[#1a2b4b] hover:bg-primary/5",

                                        // Completed status
                                        isCompleted && !isSelected && " text-primary shadow-sm",

                                        // Today status
                                        isToday && !isSelected && "bg-[#72C146] text-white shadow-[0_4px_10px_rgba(114,193,70,0.3)]",

                                        // Selected status (High priority)
                                        isSelected && "bg-accent text-accent-foreground shadow-lg ring-2 ring-accent/30 scale-110 z-10"
                                    )}
                                >
                                    {format(day, "d")}
                                </button>
                            ) : (
                                <div className="text-slate-200 text-xs font-semibold opacity-30">{format(day, "d")}</div>
                            )}
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
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <span className="text-[11px] font-semibold text-slate-400">Selected</span>
                </div>
            </div>
        </div>
    );
}
