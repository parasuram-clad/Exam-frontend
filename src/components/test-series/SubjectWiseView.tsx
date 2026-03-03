import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { SyllabusModal } from "./SyllabusModal";

export interface TestSubject {
    id: string;
    icon: any;
    name: string;
    testsAvailable: number;
    completed: number;
    total: number;
    difficulty: "Easy" | "Moderate" | "Hard";
    items: { icon: any; text: string; color: string; bg: string }[];
    iconBg: string;
}

const CircularProgress = ({ completed, total }: { completed: number; total: number }) => {
    if (completed === 0) {
        return (
            <div className="text-[10px] text-slate-500 leading-tight text-right font-medium">
                Not<br />Attempted
            </div>
        );
    }

    const percentage = (completed / total) * 100;
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
        if (percentage >= 80) return "text-emerald-500";
        if (percentage >= 40) return "text-amber-500";
        return "text-orange-500";
    };

    return (
        <div className="relative flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="transparent"
                    className="text-slate-100"
                />
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn("transition-all duration-1000 ease-out", getColor())}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-medium text-slate-700">
                    {completed}/{total}
                </span>
            </div>
        </div>
    );
};

interface SubjectWiseViewProps {
    subjects: TestSubject[];
}

export const SubjectWiseView = ({ subjects }: SubjectWiseViewProps) => {
    const navigate = useNavigate();
    const [selectedSubject, setSelectedSubject] = useState<TestSubject | null>(null);

    const handleSubjectClick = (subject: TestSubject) => {
        setSelectedSubject(subject);
    };

    const handleStartTest = () => {
        if (selectedSubject) {
            // Navigate directly to the first test of this subject
            navigate(`/test-series/${selectedSubject.id}/test/1`);
            setSelectedSubject(null);
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-12">
            {subjects.map((subject, index) => (
                <div
                    key={index}
                    className="bg-card rounded-xl p-4 border border-border shadow-card hover:shadow-card-hover transition-shadow flex flex-col h-full group"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110")}>
                                <img src={subject.icon} alt={subject.name} className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-medium text-slate-900 leading-tight ">{subject.name}</h3>
                                <p className="text-[12px] text-slate-400 font-medium">
                                    {subject.testsAvailable} Tests Available
                                </p>
                            </div>
                        </div>
                        <CircularProgress completed={subject.completed} total={subject.total} />
                    </div>

                    {/* Difficulty Badge */}
                    <div className="mb-4">
                        <div
                            className={cn(
                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-[10px] font-medium",
                                subject.difficulty === "Easy" && "bg-emerald-50 text-emerald-600",
                                subject.difficulty === "Moderate" && "bg-[#fdff6a3f] text-[#7F7F00] ",
                                subject.difficulty === "Hard" && "bg-orange-50 text-orange-600"
                            )}
                        >
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                subject.difficulty === "Easy" && "bg-emerald-500",
                                subject.difficulty === "Moderate" && "bg-amber-500",
                                subject.difficulty === "Hard" && "bg-orange-500"
                            )} />
                            {subject.difficulty}
                        </div>
                    </div>

                    {/* Stats Items */}
                    <div className="flex flex-wrap items-center gap-1 mb-3 ">
                        {subject.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <div className={cn("p-1 rounded-md", item.bg, item.color)}>
                                    {item.icon}
                                </div>
                                <span className="text-xs sm:text-[9px] text-slate-500 font-medium whitespace-nowrap">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Action */}
                    <Button
                        className="w-full h-10 bg-[#0F172A] text-white hover:bg-[#1E293B] rounded-[10px] text-sm font-medium border-0 transition-all active:scale-[0.98] mt-auto"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSubjectClick(subject);
                        }}
                    >
                        View Details
                    </Button>
                </div>
            ))}

            <AnimatePresence>
                {selectedSubject && (
                    <SyllabusModal
                        isOpen={!!selectedSubject}
                        onClose={() => setSelectedSubject(null)}
                        subjectName={selectedSubject.name}
                        onStart={handleStartTest}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
