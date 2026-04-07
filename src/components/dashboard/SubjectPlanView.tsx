import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/utils";
import { toast } from "sonner";
import studyPlan1 from "@/assets/study-plan1.png";
import studyPlan2 from "@/assets/study-plan2.png";
import studyPlan3 from "@/assets/study-plan3.png";
import studyPlan4 from "@/assets/study-plan4.png";

const FREE_PREVIEW_DAYS = 3;

interface SubjectPlanViewProps {
    subjects: string[];
    onSelectSubject: (subject: string) => void;
    roadmapData?: any;
    topicTimings?: any[];
}

const CircularProgress = ({ progress, size = 48 }: { progress: number; size?: number }) => {
    const radius = (size - 4) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    const isComplete = progress >= 100;

    return (
        <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-muted-foreground/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={cn(
                        "transition-all duration-700 ease-out",
                        isComplete ? "text-emerald-500" : "text-accent"
                    )}
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <span className={cn(
                "absolute text-[10px] font-semibold",
                isComplete ? "text-emerald-600" : "text-foreground"
            )}>{progress}%</span>
        </div>
    );
};

const getSubjectIconFallback = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('history') || s.includes('kural')) return studyPlan1;
    if (s.includes('geography') || s.includes('admin')) return studyPlan2;
    if (s.includes('science') || s.includes('polity')) return studyPlan3;
    return studyPlan4;
};

export const SubjectPlanView: React.FC<SubjectPlanViewProps> = ({
    subjects,
    onSelectSubject,
    roadmapData,
    topicTimings = []
}) => {
    // Get the icon for a subject — prefer backend image_url from the roadmap plan
    const getSubjectIcon = (subject: string): string => {
        const subjectPlan = roadmapData?.plan?.find(
            (p: any) => p.plan_type === 'SUBJECT' && p.subject_name === subject
        );
        // Walk through the plan days to find any TOPIC item that has an image_url
        if (subjectPlan?.days) {
            for (const day of subjectPlan.days) {
                for (const item of day?.items || []) {
                    if (item?.image_url) {
                        return getMediaUrl(item.image_url, getSubjectIconFallback(subject));
                    }
                }
            }
        }
        // Also check the OVERALL plan for TOPIC items belonging to this subject
        const overallPlan = roadmapData?.plan?.find((p: any) => p.plan_type === 'OVERALL');
        if (overallPlan?.days) {
            for (const day of overallPlan.days) {
                for (const item of day?.items || []) {
                    if (item?.type === 'TOPIC' && item?.subject === subject && item?.image_url) {
                        return getMediaUrl(item.image_url, getSubjectIconFallback(subject));
                    }
                }
            }
        }
        return getSubjectIconFallback(subject);
    };

    const getSubjectProgress = (subject: string) => {
        if (!subject || !roadmapData?.plan) return 0;

        // Find IDs for both the specific subject plan and the overall plan
        const subjectPlan = roadmapData.plan.find((p: any) => p.plan_type === 'SUBJECT' && p.subject_name === subject);
        const overallPlan = roadmapData.plan.find((p: any) => p.plan_type === 'OVERALL');
        const subjectPlanId = subjectPlan?.plan_id;
        const overallPlanId = overallPlan?.plan_id;

        // Collect all target items for this subject
        const allItems: any[] = [];
        
        // If we have a specific SUBJECT plan for this subject, use ONLY its items.
        // If not, we fallback to filtering topics from the OVERALL plan (virtual subject mode).
        if (subjectPlan) {
            subjectPlan.days.forEach((d: any) => allItems.push(...(d.items || [])));
        } else if (overallPlan) {
            overallPlan.days.forEach((d: any) => {
                d.items.forEach((item: any) => {
                    if (item.type === 'TOPIC' && item.subject === subject) allItems.push(item);
                });
            });
        }

        if (allItems.length === 0) return 0;

        // Create a context-aware timing map
        const timingMap: Record<number, number> = {};
        const now = new Date();
        topicTimings.forEach(t => {
            // A timing record is relevant if it belongs to the target plan we are showing
            const targetPlanId = subjectPlanId || overallPlanId;
            const isRelevant = t.plan_id === targetPlanId;

            if (isRelevant) {
                let m = Number(t.total_estimate || 0);
                if (!t.end_time && t.start_time) {
                    const startTimeStr = t.start_time.endsWith('Z') ? t.start_time : `${t.start_time}Z`;
                    const start = new Date(startTimeStr);
                    if (!isNaN(start.getTime())) m += Math.max(0, Math.round((now.getTime() - start.getTime()) / (1000 * 60)));
                }
                timingMap[t.syllabus_id] = (timingMap[t.syllabus_id] || 0) + m;
            }
        });

        let totalProgressWeight = 0;
        let count = 0;

        allItems.forEach(item => {
            if (item.type === 'TOPIC' && item.topic) {
                item.topic.forEach((t: any) => {
                    count++;
                    if (t.is_completed || t.plan_status === 'COMPLETED') {
                        totalProgressWeight += 100;
                    } else {
                        const spent = timingMap[t.id] || 0;
                        const planned = t.minutes || 45;
                        totalProgressWeight += Math.min(90, (spent / (planned || 1)) * 100);
                    }
                });
            }
        });

        const progress = count === 0 ? 0 : Math.round(totalProgressWeight / count);
        return progress;
    };

    const isSubscribed = (subject: string) => {
        if (!roadmapData?.access?.subject_plans) return true;
        const access = roadmapData.access.subject_plans.find((p: any) => p.subject_name === subject);
        return access ? access.subscribed : true;
    };

    // Returns schedule items. For unsubscribed subjects, show first FREE_PREVIEW_DAYS days
    // as preview and mark the rest as locked.
    const getDailyScheduleSample = (subject: string, subscribed: boolean) => {
        if (!subject) return { preview: [], lockedCount: 0 };

        const subjectPlan = roadmapData?.plan?.find(
            (p: any) => p?.plan_type === 'SUBJECT' && p?.subject_name === subject
        );

        let allDayItems: { label: string; id: string; dayNo: number }[] = [];

        if (subjectPlan?.days) {
            allDayItems = subjectPlan.days
                .flatMap((d: any) =>
                    (d?.items || [])
                        .map((t: any) => {
                            let typeLabel = "";
                            if (t.type === 'REVISION') typeLabel = "Revision";
                            if (t.type === 'TEST') typeLabel = "Test";

                            const topicName =
                                (Array.isArray(t?.topic) && t.topic[0]?.name) ||
                                t?.title ||
                                t?.subject ||
                                t?.identifier ||
                                (t.type === 'REVISION' ? "Revision Day" : "Study Topic");

                            return {
                                label: `${typeLabel ? typeLabel + " - " : ""}${topicName}`,
                                id: `roadmap-${subject}-day${d?.day}-${t.identifier || Math.random()}`,
                                dayNo: d?.day || 0,
                            };
                        })
                );
        }

        if (allDayItems.length === 0) {
            allDayItems = [];
        }

        if (subscribed) {
            return { preview: allDayItems.slice(0, 3), lockedCount: 0 };
        }

        // Unsubscribed: show first FREE_PREVIEW_DAYS day labels, then show how many are locked
        const freeItems = allDayItems.filter(d => d.dayNo <= FREE_PREVIEW_DAYS).slice(0, 3);
        const lockedCount = Math.max(0, allDayItems.length - FREE_PREVIEW_DAYS);
        return { preview: freeItems, lockedCount };
    };

    const getSubjectUnitCount = (subject: string) => {
        const subjectPlan = roadmapData?.plan?.find(
            (p: any) => p.plan_type === 'SUBJECT' && p.subject_name === subject
        );
        if (subjectPlan) return subjectPlan.total_days;

        // If it's only in overall plan, count distinct days where this subject appears
        const overallPlan = roadmapData?.plan?.find((p: any) => p.plan_type === 'OVERALL');
        if (overallPlan?.days) {
            const subjectDays = overallPlan.days.filter((d: any) =>
                d.items.some((item: any) => item.type === 'TOPIC' && item.subject === subject)
            );
            return subjectDays.length;
        }
        return 0;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject, index) => {
                const progress = getSubjectProgress(subject);
                const icon = getSubjectIcon(subject);
                const subscribed = isSubscribed(subject);
                const { preview: schedule, lockedCount } = getDailyScheduleSample(subject, subscribed);
                const unitCount = getSubjectUnitCount(subject);

                return (
                    <motion.div
                        key={subject}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, type: "spring", stiffness: 120, damping: 18 }}
                        className={cn(
                            "group bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col active:scale-[0.98] h-full relative overflow-hidden",
                            !subscribed && "border-dashed"
                        )}
                        onClick={() => {
                            if (!subscribed) {
                                toast.warning(`${subject} is currently locked.`, {
                                    description: `You can preview the first ${FREE_PREVIEW_DAYS} days. Subscribe to unlock full access.`
                                });
                            }
                            onSelectSubject(subject);
                        }}
                    >
                        <div className="absolute top-4 right-4">
                            <CircularProgress progress={progress} size={42} />
                        </div>


                        {/* Centered Header Content */}
                        <div className="flex flex-col items-center text-center gap-4 mb-4">
                            {/* Subject Icon Container */}
                            <div className="w-16 h-16 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110">
                                <img
                                    src={icon}
                                    alt={subject}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = getSubjectIconFallback(subject);
                                    }}
                                />
                            </div>

                            {/* Title & Stats */}
                            <div className="flex flex-col">
                                <h3 className="text-[17px] font-bold text-foreground tracking-tight leading-tight mb-1.5">
                                    {subject}
                                </h3>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                        {unitCount} Study Days
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Compact Action Button at the bottom */}
                        <div className="mt-auto">
                            <button
                                className="w-full h-11 bg-[#0F172A] text-white hover:bg-[#1E293B] rounded-xl text-sm font-medium shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                View Plan <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
