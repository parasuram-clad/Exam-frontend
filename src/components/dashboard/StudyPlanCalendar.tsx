import { useState, useEffect } from "react";
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

export interface DayCycleItem {
    day: number;
    status: "completed" | "current" | "locked" | "assessment";
    label: string;
    date?: string;
    isAssessment?: boolean;
    isRevision?: boolean;
}

interface StudyPlanCalendarProps {
    onDateClick?: (date: Date) => void;
    selectedDate?: Date;
    planDays?: DayCycleItem[];
}

import { ClipboardList, RotateCcw } from "lucide-react";

export function StudyPlanCalendar({ onDateClick, selectedDate, planDays = [] }: StudyPlanCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = startOfDay(new Date());

    useEffect(() => {
        if (selectedDate && !isSameMonth(selectedDate, currentMonth)) {
            setCurrentMonth(startOfMonth(selectedDate));
        }
    }, [selectedDate]);

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

    // Helper to find plan item for a day
    const getPlanForDay = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return planDays.find(d => d.date === dateStr);
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-medium text-[#1a2b4b]">
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
                    <div key={`${day}-${i}`} className="text-[10px] font-medium text-slate-300 uppercase tracking-[0.1em]">
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
                    const planItem = getPlanForDay(checkDay);
                    const isCompleted = planItem?.status === 'completed';

                    return (
                        <div key={index} className="flex items-center justify-center relative h-8 w-full">
                            {isSelectedMonth ? (
                                <button
                                    onClick={() => planItem && onDateClick?.(checkDay)}
                                    // Removed disabled={!planItem} to let user interact with all dates if they want, 
                                    // but we highlight specifically the plan items
                                    className={cn(
                                        "w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition-all duration-200 relative",
                                        !planItem && isToday && "text-[#72C146] border border-[#72C146]/30",
                                        !planItem && !isToday && "text-slate-200 cursor-not-allowed opacity-50",

                                        planItem && !isSelected && !isToday && !isCompleted && "text-[#1a2b4b] hover:bg-primary/5",

                                        // Completed status
                                        isCompleted && !isSelected && !isToday && "bg-[#1a2b4b] text-white",

                                        // Today status (Override if it's today)
                                        isToday && !isSelected && "bg-[#72C146] text-white shadow-[0_4px_10px_rgba(114,193,70,0.3)]",

                                        // Selected status (High priority)
                                        isSelected && "bg-accent text-accent-foreground shadow-lg ring-2 ring-accent/30 scale-110 z-10"
                                    )}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="leading-none">{format(day, "d")}</span>
                                        {planItem?.isAssessment && (
                                            <ClipboardList className={cn(
                                                "w-[8px] h-[8px] mt-[1px]",
                                                isSelected || isToday || isCompleted ? "text-white/80" : "text-primary"
                                            )} />
                                        )}
                                        {planItem?.isRevision && (
                                            <RotateCcw className={cn(
                                                "w-[8px] h-[8px] mt-[1px]",
                                                isSelected || isToday || isCompleted ? "text-white/80" : "text-orange-500"
                                            )} />
                                        )}
                                    </div>
                                </button>
                            ) : (
                                <div className="text-slate-200 text-xs font-medium opacity-30">{format(day, "d")}</div>
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
                    <span className="text-[11px] font-medium text-slate-400">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#72C146]" />
                    <span className="text-[11px] font-medium text-slate-400">Today</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <span className="text-[11px] font-medium text-slate-400">Selected</span>
                </div>
            </div>
        </div>
    );
}
