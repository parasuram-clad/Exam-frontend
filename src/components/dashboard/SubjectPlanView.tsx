import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import studyPlan1 from "@/assets/study-plan1.png";
import studyPlan2 from "@/assets/study-plan2.png";
import studyPlan3 from "@/assets/study-plan3.png";
import studyPlan4 from "@/assets/study-plan4.png";

interface SubjectPlanViewProps {
    subjects: string[];
    onSelectSubject: (subject: string) => void;
    userPlans: any[];
    dayWiseStudyPlans: any;
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
    dayWiseStudyPlans
}) => {
    const getSubjectIcon = (subject: string) => {
        return getSubjectIconFallback(subject);
    };

    const getSubjectProgress = (subject: string) => {
        if (userPlans && userPlans.length > 0) {
            const subjectPlans = userPlans.filter(p => p.subject === subject);
            if (subjectPlans.length === 0) return 0;
            const completed = subjectPlans.filter(p => p.plan_status === 'COMPLETED').length;
            return Math.round((completed / subjectPlans.length) * 100);
        }
        return 0;
    };

    const getDailyScheduleSample = (subject: string) => {
        if (userPlans && userPlans.length > 0) {
            const subjectPlans = userPlans.filter(p => p.subject === subject);
            // Show next 2 incomplete days/topics
            const incomplete = subjectPlans
                .filter(p => p.plan_status !== 'COMPLETED')
                .sort((a, b) => a.day_no - b.day_no);

            if (incomplete.length > 0) {
                return incomplete.slice(0, 2).map(p => ({
                    label: `Day ${p.day_no}: ${p.topic}`,
                    id: p.id
                }));
            }
            // If all complete, show the last few
            return subjectPlans.slice(-2).map(p => ({
                label: `Day ${p.day_no}: ${p.topic}`,
                id: p.id
            }));
        }

        // Fallback mock data with Day indicators
        return [
            { label: "Day 1: Core Fundamentals", id: "m1" },
            { label: "Day 3: Practice Session", id: "m2" }
        ];
    };

    const getSubjectUnitCount = (subject: string) => {
        if (userPlans && userPlans.length > 0) {
            return new Set(userPlans.filter(p => p.subject === subject).map(p => p.day_no)).size;
        }
        return 12; // Default mock count
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject, index) => {
                const progress = getSubjectProgress(subject);
                const icon = getSubjectIcon(subject);
                const schedule = getDailyScheduleSample(subject);
                const unitCount = getSubjectUnitCount(subject);

                return (
                    <motion.div
                        key={subject}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, type: "spring", stiffness: 120, damping: 18 }}
                        className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden"
                    >
                        <div className="p-3 flex-1">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12  flex items-center justify-center overflow-hidden">
                                        <img
                                            src={icon}
                                            alt={subject}
                                            className="w-8 h-8 object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = getSubjectIconFallback(subject);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-medium text-foreground leading-tight">{subject}</h3>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{unitCount} Study Days</p>
                                    </div>
                                </div>
                                <CircularProgress progress={progress} />
                            </div>

                            {/* Daily Schedule Preview with Dots */}
                            <ul className="space-y-2 mb-3">
                                {schedule.map((item) => (
                                    <li key={item.id} className="flex items-center gap-2.5 text-xs text-foreground/80 truncate">
                                        <div className="w-[6px] h-[6px] rounded-full bg-[#7C79EC] shrink-0" />
                                        <span className="truncate">{item.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Action Section */}
                        <div className="px-5 pb-5 mt-auto">
                            <button
                                onClick={() => onSelectSubject(subject)}
                                className="w-full h-11 rounded-xl text-sm font-medium bg-[#0F172A] hover:bg-[#1E293B] text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                View Daily Plan
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
