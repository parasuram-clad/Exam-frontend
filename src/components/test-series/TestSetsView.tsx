import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Timer, FileText, Landmark } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { TestSetSyllabusModal } from "./TestSetSyllabusModal";
import testImage from "@/assets/test-1.png";

export interface TestSet {
    id: string;
    plan_id: number;
    name: string;
    duration: string;
    questions: number;
    score?: {
        obtained: number | null;
        total: number | null;
    };
    marking_scheme?: {
        correct: number;
        incorrect: number;
        unattempted: number;
    };
    difficulty: "Easy" | "Moderate" | "Hard";
    syllabus: string[];
    syllabus_detailed?: any[];
    status?: "LOCKED" | "UNLOCKED" | "COMPLETED";
    planned_date?: string;
}

interface TestSetsViewProps {
    testSets: TestSet[];
}

const getSyllabusStyles = (tag: string) => {
    const lowerTag = tag.toLowerCase();

    if (lowerTag === "full syllabus") return "bg-indigo-50 text-indigo-600";
    if (lowerTag === "general studies" || lowerTag === "gs") return "bg-sky-50 text-sky-600";
    if (lowerTag.includes("aptitude")) return "bg-emerald-50 text-emerald-600";
    if (lowerTag.includes("english")) return "bg-violet-50 text-violet-600";
    if (lowerTag.includes("tamil")) return "bg-rose-50 text-rose-600";
    if (lowerTag.includes("history")) return "bg-amber-50 text-amber-600";
    if (lowerTag.includes("polity")) return "bg-blue-50 text-blue-600";
    if (lowerTag.includes("geography")) return "bg-teal-50 text-teal-600";
    if (lowerTag.includes("science")) return "bg-orange-50 text-orange-600";
    if (lowerTag.includes("inm")) return "bg-cyan-50 text-cyan-600";
    if (lowerTag.includes("admin")) return "bg-pink-50 text-pink-600";
    if (lowerTag.includes("ca") || lowerTag.includes("current")) return "bg-slate-50 text-slate-600";

    return "bg-slate-50 text-slate-500";
};

const getSyllabusAbbreviation = (tag: string) => {
    const map: Record<string, string> = {
        "Aptitude & Mental Ability": "Aptitude",
        "General English": "Gen English",
        "General Studies": "Gen Studies",
        "Tamil Eligibility & Scoring Test": "Tamil",
        "General Science": "Science",
        "Indian National Movement": "INM",
        "Indian Polity": "Polity",
        "History & Culture": "History",
        "History": "History",
        "Geography": "Geography",
        "Development Administration": "Admin",
        "Current Events": "CA"
    };
    return map[tag] || tag;
};

export const TestSetsView = ({ testSets }: TestSetsViewProps) => {
    const navigate = useNavigate();
    const [selectedSet, setSelectedSet] = useState<TestSet | null>(null);

    const handleSetClick = (set: TestSet) => {
        setSelectedSet(set);
    };

    const handleStartTest = () => {
        if (selectedSet && selectedSet.plan_id > 0) {
            navigate(`/test-series/overall/test/${selectedSet.id}?plan_id=${selectedSet.plan_id}`);
            setSelectedSet(null);
        } else if (selectedSet) {
            toast.error("Please generate or select an active test series plan first.");
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {testSets.map((set, index) => (
                <div
                    key={index}
                    className={cn(
                        "bg-white rounded-xl p-4 border border-slate-100 shadow-sm transition-all flex flex-col h-full group relative overflow-hidden",
                        set.status !== "LOCKED" ? "hover:shadow-md" : "opacity-80"
                    )}
                >
                    {/* Locked Overlay */}
                    {set.status === "LOCKED" && (
                        <div className="absolute inset-0 z-10 bg-slate-50/10 backdrop-blur-[1px] flex flex-col items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center">
                                <Landmark className="w-5 h-5 text-slate-400" />
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                                <img src={testImage} alt="Set Icon" className="w-full h-full object-contain opacity-80" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-medium text-slate-900 mb-1 truncate">{set.name}</h3>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-[9px] text-slate-400 font-medium">
                                    <span className="flex items-center gap-1 whitespace-nowrap">
                                        <Timer className="w-3 h-3 flex-shrink-0" />
                                        {set.duration}
                                    </span>
                                    <span className="flex items-center gap-1 whitespace-nowrap">
                                        <FileText className="w-3 h-3 flex-shrink-0" />
                                        {set.questions} Questions
                                    </span>
                                </div>
                            </div>
                        </div>
                        {(set.score || (set.status === "LOCKED" && set.planned_date)) && (
                            <div className="text-right flex-shrink-0 ml-1">
                                {set.score ? (
                                    <>
                                        <p className="text-xs sm:text-[9px] text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Score</p>
                                        <p className="text-xs font-medium text-slate-800 leading-none whitespace-nowrap">
                                            {set.score.obtained}<span className="text-slate-400">/{set.score.total}</span>
                                        </p>
                                    </>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight leading-none mb-1">Unlocks</p>
                                        <p className="text-[10px] font-bold text-slate-600 leading-none">
                                            {new Date(set.planned_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Difficulty Badge */}
                    <div className="mb-4">
                        {/* <div
                            className={cn(
                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-[10px] font-medium",
                                set.difficulty === "Easy" && "bg-emerald-50 text-emerald-600",
                                set.difficulty === "Moderate" && "bg-[#fdff6a3f] text-[#7F7F00] ",
                                set.difficulty === "Hard" && "bg-orange-50 text-orange-600"
                            )}
                        >
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                set.difficulty === "Easy" && "bg-emerald-500",
                                set.difficulty === "Moderate" && "bg-amber-500",
                                set.difficulty === "Hard" && "bg-orange-500"
                            )} />
                            {set.difficulty}
                        </div> */}
                    </div>

                    {/* Syllabus Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 mt-auto">
                        <span className="text-xs sm:text-[10px] text-slate-400 font-medium">Syllabus |</span>
                        {set.syllabus.map((tag, i) => {
                            const abbreviation = getSyllabusAbbreviation(tag);
                            const styleClass = getSyllabusStyles(tag);
                            return (
                                <span key={i} className={cn(
                                    "px-3 py-0.5 rounded-lg text-xs sm:text-[10px] font-medium whitespace-nowrap transition-colors",
                                    styleClass
                                )}>
                                    {abbreviation}
                                </span>
                            );
                        })}
                    </div>

                    {/* Action */}
                    <Button
                        className={cn(
                            "w-full h-10 rounded-[10px] text-sm font-medium border-0 transition-all active:scale-[0.98] mt-auto relative z-20",
                            set.status === "LOCKED"
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100"
                                : "bg-[#0F172A] text-white hover:bg-[#1E293B]"
                        )}
                        disabled={set.status === "LOCKED"}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (set.score) {
                                navigate(`/test-series/overall/test/${set.id}/analytics?plan_id=${set.plan_id}`);
                            } else {
                                handleSetClick(set);
                            }
                        }}
                    >
                        {set.score ? "View Analysis" : set.status === "LOCKED" ? "Coming Soon" : "Attempt Test"}
                    </Button>
                </div>
            ))}

            <AnimatePresence>
                {selectedSet && (
                    <TestSetSyllabusModal
                        isOpen={!!selectedSet}
                        onClose={() => setSelectedSet(null)}
                        testSet={selectedSet}
                        onStart={handleStartTest}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
