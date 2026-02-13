import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import {
    Calendar as CalendarIcon,
    Clock,
    FileText,
    Bell,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    BookOpen,
    Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    isToday,
    parseISO,
    isAfter,
    isBefore,
    startOfDay
} from "date-fns";
import { toast } from "sonner";

interface ScheduleEvent {
    id: string;
    title: string;
    type: "test" | "topic_completed" | "topic_upcoming" | "deadline";
    date: string; // ISO format: YYYY-MM-DD
    time: string;
    duration?: string;
    description?: string;
    metadata?: {
        subject?: string;
        testId?: string;
        topicId?: string;
        targetId?: string;
    };
}

// Generate some sample events for an entire month
const generateSampleEvents = (baseDate: Date): ScheduleEvent[] => {
    const startOfCurrentMonth = startOfMonth(baseDate);
    const events: ScheduleEvent[] = [];

    // Subjects and topics for a realistic study plan
    const subjects = [
        { name: "Biology", id: "bio" },
        { name: "Polity", id: "pol" },
        { name: "History", id: "hist" },
        { name: "Geography", id: "geo" },
        { name: "Economy", id: "eco" }
    ];

    const today = startOfDay(baseDate);

    // Generate events for 30 days around the current month
    for (let i = 1; i <= 30; i++) {
        const currentDate = new Date(startOfCurrentMonth);
        currentDate.setDate(i);
        const dateStr = format(currentDate, "yyyy-MM-dd");

        // 1. Daily Study Topics (Completed or Upcoming)
        const subject = subjects[i % subjects.length];
        const isPast = isBefore(currentDate, today);
        const isCurrentlyToday = isSameDay(currentDate, today);

        events.push({
            id: `topic-${i}`,
            title: `${subject.name}: Topic ${Math.ceil(i / 5)}`,
            type: (isPast || (isCurrentlyToday && i % 2 === 0)) ? "topic_completed" : "topic_upcoming",
            date: dateStr,
            time: "09:00 AM - 11:00 AM",
            duration: "2 hours",
            description: isPast
                ? `Completed comprehensive study and notes for ${subject.name} Chapter ${Math.ceil(i / 5)}.`
                : `Focus on ${subject.name} core concepts and previous year questions.`,
            metadata: { topicId: `${subject.id}-${i}` }
        });

        // 2. Weekend Mock Tests (Saturdays and Sundays)
        const dayOfWeek = currentDate.getDay(); // 0 = Sun, 6 = Sat
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            events.push({
                id: `test-${i}`,
                title: `${dayOfWeek === 6 ? "Sectional" : "Full"} Mock Test - ${subject.name}`,
                type: "test",
                date: dateStr,
                time: "02:00 PM - 05:00 PM",
                duration: "3 hours",
                description: `Evaluate your performance in ${subject.name} with this ${dayOfWeek === 6 ? "chapter-wise" : "full-syllabus"} test.`,
                metadata: { subject: subject.name.toLowerCase(), testId: `mock-${i}` }
            });
        }

        // 3. Subject Deadlines (Every 10 days)
        if (i % 10 === 0) {
            events.push({
                id: `deadline-${i}`,
                title: `${subject.name} Mastery Deadline`,
                type: "deadline",
                date: dateStr,
                time: "11:59 PM",
                description: `Goal: Finish all backlog topics for ${subject.name} by tonight.`,
                metadata: { topicId: subject.id, targetId: `target-${i}` }
            });
        }
    }

    return events;
};

const getEventIcon = (type: ScheduleEvent["type"]) => {
    switch (type) {
        case "test":
            return <FileText className="w-5 h-5" />;
        case "topic_completed":
            return <CheckCircle2 className="w-5 h-5" />;
        case "topic_upcoming":
            return <BookOpen className="w-5 h-5" />;
        case "deadline":
            return <Bell className="w-5 h-5" />;
        default:
            return <CalendarIcon className="w-5 h-5" />;
    }
};

const getEventColor = (type: ScheduleEvent["type"]) => {
    switch (type) {
        case "test":
            return "bg-info/20 text-info";
        case "topic_completed":
            return "bg-success/20 text-success";
        case "topic_upcoming":
            return "bg-primary/20 text-primary";
        case "deadline":
            return "bg-destructive/20 text-destructive";
        default:
            return "bg-muted text-muted-foreground";
    }
};

const Schedule = () => {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // In a real app, this would be fetched from an API
    const allEvents = useMemo(() => generateSampleEvents(new Date()), []);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({
            start: startDate,
            end: endDate,
        });
    }, [currentMonth]);

    const filteredEvents = useMemo(() => {
        if (selectedDate) {
            return allEvents.filter(event => isSameDay(parseISO(event.date), selectedDate));
        }
        return allEvents.filter(event => isAfter(parseISO(event.date), startOfDay(new Date())) || isSameDay(parseISO(event.date), new Date()));
    }, [selectedDate, allEvents]);

    const eventDates = useMemo(() => {
        return allEvents.map(event => event.date);
    }, [allEvents]);

    const handleEventAction = (event: ScheduleEvent) => {
        switch (event.type) {
            case "test":
                if (event.metadata?.subject && event.metadata?.testId) {
                    navigate(`/test-series/${event.metadata.subject}/test/${event.metadata.testId}`);
                } else {
                    navigate("/test-series");
                }
                break;
            case "topic_upcoming":
            case "topic_completed":
            case "deadline":
                if (event.metadata?.topicId) {
                    navigate(`/study-plan/topic/${event.metadata.topicId}`);
                } else {
                    navigate("/study-plan");
                }
                break;
            default:
                break;
        }
    };

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Widget */}
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-xl p-4 border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">
                                {format(currentMonth, "MMMM yyyy")}
                            </h3>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={previousMonth}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={nextMonth}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Day headers */}
                            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                                <div key={i} className="aspect-square flex items-center justify-center text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-tighter">
                                    {day}
                                </div>
                            ))}

                            {/* Days */}
                            {calendarDays.map((date, i) => {
                                const dateStr = format(date, "yyyy-MM-dd");
                                const hasEvent = eventDates.includes(dateStr);
                                const isSelected = selectedDate && isSameDay(date, selectedDate);
                                const isCurrentMonth = isSameMonth(date, currentMonth);
                                const today = isToday(date);

                                return (
                                    <div
                                        key={dateStr}
                                        onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "aspect-square flex items-center justify-center rounded-lg text-sm cursor-pointer transition-all relative group",
                                            !isCurrentMonth && "text-muted-foreground/20 pointer-events-none",
                                            isCurrentMonth && "text-foreground",
                                            isSelected && "bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 scale-105 z-10",
                                            today && !isSelected && "border border-primary text-primary",
                                            hasEvent && !isSelected && "bg-accent/10 font-medium",
                                            !isSelected && isCurrentMonth && "hover:bg-muted hover:scale-105"
                                        )}
                                    >
                                        <span className="relative z-10">{format(date, "d")}</span>
                                        {hasEvent && !isSelected && (
                                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                        )}
                                        {isSelected && (
                                            <div className="absolute inset-0 rounded-lg bg-primary/20 animate-pulse" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 flex flex-wrap gap-3 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded border border-primary" />
                                <span className="text-muted-foreground">Today</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-accent/30" />
                                <span className="text-muted-foreground">Event</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-primary" />
                                <span className="text-muted-foreground">Selected</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-card rounded-xl p-4 border border-border mt-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-foreground">Total Overview</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Daily Topics</span>
                                    <span className="text-foreground font-medium">
                                        {allEvents.filter(e => e.type === "topic_completed").length}/{allEvents.filter(e => e.type.startsWith("topic")).length}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-success transition-all duration-500"
                                        style={{ width: `${(allEvents.filter(e => e.type === "topic_completed").length / allEvents.filter(e => e.type.startsWith("topic")).length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-info" />
                                    <span className="text-sm text-muted-foreground">Mock Tests</span>
                                </div>
                                <span className="font-semibold text-foreground">
                                    {allEvents.filter(e => e.type === "test").length}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-destructive" />
                                    <span className="text-sm text-muted-foreground">Subject Deadlines</span>
                                </div>
                                <span className="font-semibold text-destructive">
                                    {allEvents.filter(e => e.type === "deadline").length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-xl border border-border min-h-[450px]">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">
                                {selectedDate
                                    ? `Activities for ${format(selectedDate, "MMMM d, yyyy")}`
                                    : "Upcoming Schedule"
                                }
                            </h3>
                            {selectedDate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDate(null)}
                                    className="text-xs h-7 text-primary hover:text-primary hover:bg-primary/10"
                                >
                                    View Full Schedule
                                </Button>
                            )}
                        </div>
                        <div className="divide-y divide-border">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event) => (
                                    <div key={event.id} className="p-3 sm:p-4 hover:bg-muted/30 transition-all duration-200">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            {/* Date Box */}
                                            <div className="bg-accent/20 rounded-lg py-2 px-2 sm:px-3 text-center min-w-[55px] sm:min-w-[65px] border border-border/50 shrink-0">
                                                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                                                    {format(parseISO(event.date), "MMM")}
                                                </span>
                                                <span className="text-lg sm:text-xl font-semibold text-foreground">
                                                    {format(parseISO(event.date), "d")}
                                                </span>
                                            </div>

                                            {/* Content Area - Responsive Stack */}
                                            <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0">
                                                {/* Event Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0", getEventColor(event.type))}>
                                                            {getEventIcon(event.type)}
                                                        </div>
                                                        <h4 className="font-semibold text-foreground truncate text-sm sm:text-base">{event.title}</h4>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-primary/70" />
                                                            {event.time}
                                                        </span>
                                                        {event.duration && (
                                                            <span className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded border border-border/50">
                                                                {event.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {event.description && (
                                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Action */}
                                                <Button
                                                    variant={event.type === "test" ? "default" : "outline"}
                                                    size="sm"
                                                    className={cn(
                                                        "w-full lg:w-auto shrink-0 transition-all",
                                                        event.type === "test" ? "bg-primary text-primary-foreground hover:bg-primary/90" :
                                                            event.type === "topic_completed" ? "border-success/50 text-success hover:bg-success/10" :
                                                                "border-primary/20 text-primary hover:bg-primary/5"
                                                    )}
                                                    onClick={() => handleEventAction(event)}
                                                >
                                                    {event.type === "test" ? "Start Test" :
                                                        event.type === "topic_completed" ? "Review" :
                                                            event.type === "topic_upcoming" ? "Continue" : "View Target"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-border">
                                        <CalendarIcon className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <h4 className="font-medium text-foreground mb-1">No activities found</h4>
                                    <p className="text-sm text-muted-foreground">Relax! There are no tasks scheduled for this date.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Schedule;
