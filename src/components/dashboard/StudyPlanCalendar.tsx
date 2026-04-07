import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
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
    examDate?: string;
}

import { ClipboardList, RotateCcw } from "lucide-react";

export function StudyPlanCalendar({ onDateClick, selectedDate, planDays = [], examDate }: StudyPlanCalendarProps) {
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
                                    onClick={() => (planItem || (examDate && isSameDay(checkDay, new Date(examDate)))) && onDateClick?.(checkDay)}
                                    className={cn(
                                        "w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 relative",
                                        
                                        // Base state for dates NOT in plan
                                        !planItem && !isToday && !isSelected && "text-slate-200 cursor-not-allowed opacity-50",
                                        !planItem && isToday && !isSelected && "text-[#72C146] border border-[#72C146]/30",

                                        // Dates IN plan (Interactive)
                                        planItem && !isSelected && !isToday && !isCompleted && "text-[#1a2b4b] hover:bg-primary/5",

                                        // Completed status
                                        isCompleted && !isSelected && !isToday && "bg-[#1a2b4b] text-white",

                                        // Exam Date (Override visibility/activity)
                                        examDate && isSameDay(checkDay, new Date(examDate)) && !isSelected && "opacity-100 cursor-pointer border-2 border-rose-200 text-rose-600",

                                        // Today status (Override if it's today)
                                        isToday && !isSelected && "bg-[#72C146] text-white shadow-[0_4px_10px_rgba(114,193,70,0.3)]",

                                        // Selected status (High priority)
                                        isSelected && "bg-accent text-accent-foreground shadow-lg ring-2 ring-accent/30 scale-105 z-10"
                                    )}
                                >
                                    <span className="text-[11px] font-bold leading-none">{format(day, "d")}</span>
                                    <div className="absolute -bottom-1.5 left-0 right-0 flex items-center justify-center gap-[1px]">
                                        {planItem?.isAssessment && (
                                            <ClipboardList className={cn(
                                                "w-[7px] h-[7px]",
                                                isSelected || isToday || isCompleted ? "text-primary/70" : "text-primary"
                                            )} />
                                        )}
                                        {planItem?.isRevision && (
                                            <RotateCcw className={cn(
                                                "w-[7px] h-[7px]",
                                                isSelected || isToday || isCompleted ? "text-orange-400" : "text-orange-500"
                                            )} />
                                        )}
                                        {examDate && isSameDay(checkDay, new Date(examDate)) && (
                                            <Flag className={cn(
                                                "w-[7px] h-[7px]",
                                                isSelected || isToday || isCompleted ? "text-rose-400" : "text-rose-500",
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
            <div className="flex items-center justify-between gap-1 px-0.5">
                <div className="flex items-center gap-1 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1a2b4b] shrink-0" />
                    <span className="text-[9px] font-medium text-slate-400 truncate">Completed</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#72C146] shrink-0" />
                    <span className="text-[9px] font-medium text-slate-400 truncate">Today</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span className="text-[9px] font-medium text-slate-400 truncate">Selected</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-[9px] font-medium text-slate-400 truncate">Exam</span>
                </div>
            </div>
        </div>
    );
}
