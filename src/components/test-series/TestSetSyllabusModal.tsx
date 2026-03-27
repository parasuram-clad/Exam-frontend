import { motion } from "framer-motion";
import { X, Smile, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
interface TestSet {
    id: string;
    name: string;
    duration: string;
    questions: number;
    score?: {
        obtained: number | null;
        total: number | null;
    };
    difficulty: "Easy" | "Moderate" | "Hard";
    syllabus: string[];
    syllabus_detailed?: any[];
    status?: "LOCKED" | "UNLOCKED" | "COMPLETED";
    planned_date?: string;
}

interface TestSetSyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    testSet: TestSet | null;
    onStart?: () => void;
}

export const TestSetSyllabusModal = ({ isOpen, onClose, testSet, onStart }: TestSetSyllabusModalProps) => {
    if (!isOpen || !testSet) return null;

    const isLocked = testSet.status === "LOCKED";
    const unlockDate = testSet.planned_date ? new Date(testSet.planned_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-[580px] bg-white rounded-lg overflow-hidden shadow-2xl border border-slate-100 p-6 sm:p-10"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Badge */}
                <div className="mb-4">
                    <span className={cn(
                        "px-3.5 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wide",
                        isLocked ? "bg-amber-50 text-amber-600" : "bg-[#F0F7FF] text-[#3B82F6]"
                    )}>
                        {testSet.score ? "Test Result" : isLocked ? "Coming Soon" : "Scheduled Test"}
                    </span>
                </div>

                {/* Main Heading */}
                <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] leading-tight mb-4">
                        {testSet.name}
                    </h2>

                    <h3 className="text-base sm:text-lg font-bold text-[#1E293B] mb-3">
                        Syllabus Covered
                    </h3>

                    <div className="mb-6">
                        {testSet.syllabus_detailed && testSet.syllabus_detailed.length > 0 ? (
                            <ul className="space-y-2.5">
                                {testSet.syllabus_detailed.map((part, pIdx) => (
                                    <li key={pIdx} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                                        <p className="text-xs sm:text-[13px] text-[#475569] font-medium leading-relaxed">
                                            <span className="font-bold text-[#1E293B]">{part.part}</span> – {part.subjects.map((s: any) => s.subject).join(", ")}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <ul className="space-y-2.5">
                                {testSet.syllabus.map((tag, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                                        <span className="text-xs sm:text-[13px] text-[#475569] font-bold text-[#1E293B]">{tag}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Info Card Container */}
                <div className="bg-[#F8FBFF] rounded-[24px] border border-[#E0F2FE] p-6 mb-6">
                    {/* Top Row: Questions, Marks, Duration */}
                    <div className="grid grid-cols-3 gap-2 mb-6 relative text-center">
                        <div>
                            <p className="text-2xl font-bold text-[#1E293B] mb-0.5">{testSet.questions}</p>
                            <p className="text-[10px] text-[#94A3B8] font-bold uppercase ">Questions</p>
                        </div>

                        <div className="absolute left-[33.33%] top-1 bottom-1 w-[1px] bg-[#E2E8F0]" />

                        <div>
                            <p className="text-2xl font-bold text-[#1E293B] mb-0.5">{testSet.score?.total || 300}</p>
                            <p className="text-[10px] text-[#94A3B8] font-bold uppercase ">Marks</p>
                        </div>

                        <div className="absolute left-[66.66%] top-1 bottom-1 w-[1px] bg-[#E2E8F0]" />

                        <div>
                            <p className="text-2xl font-bold text-[#1E293B] mb-0.5 whitespace-nowrap">{testSet.duration}</p>
                            <p className="text-[10px] text-[#94A3B8] font-bold uppercase ">Duration</p>
                        </div>
                    </div>

                    {/* Horizontal Divider */}
                    <div className="h-[1px] bg-[#E2E8F0] w-full mb-6" />

                    {/* Bottom Row: Marking Scheme */}
                    <div className="grid grid-cols-4 items-center gap-1">
                        <div className="col-span-1 text-left">
                            <p className="text-[10px] font-bold text-[#1E293B] uppercase ">Marking:</p>
                        </div>

                        <div className="text-center relative">
                            <p className="text-xl font-bold text-emerald-500 mb-0.5">+1</p>
                            <p className="text-[9px] text-[#94A3B8] font-bold uppercase">Correct</p>
                            <div className="absolute left-[-4px] top-1 bottom-1 w-[1px] bg-[#E2E8F0] opacity-50" />
                        </div>

                        <div className="text-center relative">
                            <p className="text-xl font-bold text-[#1E293B] mb-0.5">0</p>
                            <p className="text-[9px] text-[#94A3B8] font-bold uppercase">Wrong</p>
                            <div className="absolute left-[-4px] top-1 bottom-1 w-[1px] bg-[#E2E8F0] opacity-50" />
                        </div>

                        <div className="text-center relative">
                            <p className="text-xl font-bold text-[#1E293B] mb-0.5">0</p>
                            <p className="text-[9px] text-[#94A3B8] font-bold uppercase">Empty</p>
                            <div className="absolute left-[-4px] top-1 bottom-1 w-[1px] bg-[#E2E8F0] opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Motivational Footer */}
                <div className="flex items-center justify-center gap-2.5 mb-8 text-[#475569]">
                    {isLocked ? (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3 w-full">
                            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-sm font-semibold text-amber-800">
                                This test series will be available on <span className="underline decoration-amber-300 decoration-2">{unlockDate}</span>.
                            </p>
                        </div>
                    ) : (
                        <>
                            <Smile className="w-5 h-5 text-[#3B82F6]" />
                            <p className="text-sm font-medium text-[#1E293B]">
                                Stay focused and manage your time wisely.
                            </p>
                        </>
                    )}
                </div>

                {/* Start Button */}
                <Button
                    onClick={onStart}
                    disabled={isLocked}
                    className={cn(
                        "w-full h-12 rounded-lg text-base font-bold transition-all shadow-lg active:scale-[0.98]",
                        isLocked
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-[#111827] text-white hover:bg-[#1F2937]"
                    )}
                >
                    {isLocked ? "Currently Locked" : "Start Test"}
                </Button>
            </motion.div>
        </div>
    );
};
