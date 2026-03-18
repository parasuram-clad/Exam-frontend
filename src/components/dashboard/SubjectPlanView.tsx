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
    userPlans: any[];
    roadmapData?: any;
}

const CircularProgress = ({ progress, size = 48 }: { progress: number; size?: number }) => {
    const radius = (size - 4) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

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
                    className="text-accent transition-all duration-700 ease-out"
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
            <span className="absolute text-[10px] font-semibold text-foreground">{progress}%</span>
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
    userPlans,
    roadmapData
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
        if (!subject || !userPlans || !Array.isArray(userPlans)) return 0;
        const subjectPlans = userPlans.filter(
            p => p?.subject === subject || (p?.plan_type === 'SUBJECT' && p?.subject_name === subject)
        );
        if (subjectPlans.length === 0) return 0;
        const completed = subjectPlans.filter(p => p?.plan_status === 'COMPLETED').length;
        return Math.round((completed / subjectPlans.length) * 100);
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
                                label: `Day ${d?.day || '?'}: ${typeLabel ? typeLabel + " - " : ""}${topicName}`,
                                id: `roadmap-${subject}-day${d?.day}-${t.identifier || Math.random()}`,
                                dayNo: d?.day || 0,
                            };
                        })
                );
        } else if (userPlans && Array.isArray(userPlans)) {
            const subjectPlans = userPlans
                .filter(p => p?.subject === subject)
                .sort((a, b) => (a?.day_no || 0) - (b?.day_no || 0));
            allDayItems = subjectPlans.map(p => ({
                label: `Day ${p?.day_no || '?'}: ${p?.topic || 'Untitled'}`,
                id: p?.id?.toString() || Math.random().toString(),
                dayNo: p?.day_no || 0,
            }));
        }

        if (allDayItems.length === 0) {
            allDayItems = [
                { label: "Day 1: Core Fundamentals", id: "m1", dayNo: 1 },
                { label: "Day 2: Advanced Concepts", id: "m2", dayNo: 2 },
                { label: "Day 3: Practice Session", id: "m3", dayNo: 3 },
            ];
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
        if (userPlans && userPlans.length > 0) {
            return new Set(userPlans.filter(p => p.subject === subject).map(p => p.day_no)).size;
        }
        return 12;
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
                            "bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer active:scale-[0.98] h-[230px]",
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
                        <div className="p-4 flex-1">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {/* Subject Icon from backend */}
                                    <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl bg-muted/30 shrink-0">
                                        <img
                                            src={icon}
                                            alt={subject}
                                            className="w-11 h-11 object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = getSubjectIconFallback(subject);
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h3 className="text-[14px] font-semibold text-foreground leading-tight truncate max-w-[160px]">
                                                {subject}
                                            </h3>
                                            {/* {!subscribed && (
                                                <span className="flex items-center gap-0.5 bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                                                    <Lock className="w-2.5 h-2.5" />
                                                    Locked
                                                </span>
                                            )} */}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{unitCount} Study Days</p>
                                    </div>
                                </div>
                                <CircularProgress progress={subscribed ? progress : 0} />
                            </div>

                            {/* Daily Schedule Preview */}
                            <ul className="space-y-2 mb-3">
                                {schedule.map((item) => (
                                    <li key={item.id} className="flex items-center gap-2.5 text-xs text-foreground/80 truncate">
                                        <div className="w-[6px] h-[6px] rounded-full bg-[#7C79EC] shrink-0" />
                                        <span className="truncate">{item.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="px-4 pb-4 mt-auto">
                            <button
                                className="w-full h-10 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white"
                            >
                                View Daily Plan <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
