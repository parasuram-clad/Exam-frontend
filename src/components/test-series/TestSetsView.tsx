import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Timer, FileText } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { TestSetSyllabusModal } from "./TestSetSyllabusModal";
import testImage from "@/assets/test-1.png";

export interface TestSet {
    id: string;
    name: string;
    duration: string;
    questions: number;
    score?: {
        obtained: number;
        total: number;
    };
    difficulty: "Easy" | "Moderate" | "Hard";
    syllabus: string[];
}

interface TestSetsViewProps {
    testSets: TestSet[];
}

export const TestSetsView = ({ testSets }: TestSetsViewProps) => {
    const navigate = useNavigate();
    const [selectedSet, setSelectedSet] = useState<TestSet | null>(null);

    const handleSetClick = (set: TestSet) => {
        setSelectedSet(set);
    };

    const handleStartTest = () => {
        if (selectedSet) {
            // For general test sets, we use a 'general' or 'mock' subject name
            navigate(`/test-series/general/test/${selectedSet.id}`);
            setSelectedSet(null);
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-12">
            {testSets.map((set, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative"
                >
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
                        {set.score && (
                            <div className="text-right flex-shrink-0 ml-1">
                                <p className="text-xs sm:text-[9px] text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Score</p>
                                <p className="text-xs font-medium text-slate-800 leading-none whitespace-nowrap">
                                    {set.score.obtained}<span className="text-slate-400">/{set.score.total}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Difficulty Badge */}
                    <div className="mb-4">
                        <div
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
                        </div>
                    </div>

                    {/* Syllabus */}
                    <div className="flex items-center gap-2 mb-4 mt-auto">
                        <span className="text-xs sm:text-[10px] text-slate-400 font-medium">Syllabus |</span>
                        {set.syllabus.map((tag, i) => (
                            <span key={i} className={cn(
                                "px-3 py-0.5 rounded-lg text-xs sm:text-[10px] font-medium",
                                tag === "GS" ? "bg-sky-50 text-sky-600" : "bg-rose-50 text-rose-600"
                            )}>
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Action */}
                    <Button
                        className="w-full h-10 bg-[#0F172A] text-white hover:bg-[#1E293B] rounded-[10px] text-sm font-medium border-0 transition-all active:scale-[0.98] mt-auto"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (set.score) {
                                navigate(`/test-series/general/test/${set.id}/analytics`);
                            } else {
                                handleSetClick(set);
                            }
                        }}
                    >
                        {set.score ? "View Analysis" : "View Details"}
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
