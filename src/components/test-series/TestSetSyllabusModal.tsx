import { motion, AnimatePresence } from "framer-motion";
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

interface TestSetSyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    testSet: TestSet | null;
    onStart?: () => void;
}

export const TestSetSyllabusModal = ({ isOpen, onClose, testSet, onStart }: TestSetSyllabusModalProps) => {
    if (!testSet) return null;

    const isLocked = testSet.status === "LOCKED";
    const unlockDate = testSet.planned_date
        ? new Date(testSet.planned_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal – bottom sheet on mobile, centered dialog on sm+ */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full sm:max-w-[580px] bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl border border-slate-100 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                        {/* Drag handle – mobile only */}
                        <div className="flex justify-center pt-3 pb-1 sm:hidden">
                            <div className="w-10 h-1 rounded-full bg-slate-200" />
                        </div>

                        {/* Close – desktop */}
                        <button
                            onClick={onClose}
                            className="hidden sm:flex absolute top-5 right-5 items-center justify-center p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-5 sm:p-10">
                            {/* Mobile header row */}
                            <div className="flex items-center justify-between mb-4 sm:hidden">
                                <span className={cn(
                                    "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide",
                                    isLocked ? "bg-amber-50 text-amber-600" : "bg-[#F0F7FF] text-[#3B82F6]"
                                )}>
                                    {testSet.score ? "Test Result" : isLocked ? "Coming Soon" : "Scheduled Test"}
                                </span>
                                <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Desktop badge */}
                            <div className="hidden sm:block mb-4">
                                <span className={cn(
                                    "px-3.5 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wide",
                                    isLocked ? "bg-amber-50 text-amber-600" : "bg-[#F0F7FF] text-[#3B82F6]"
                                )}>
                                    {testSet.score ? "Test Result" : isLocked ? "Coming Soon" : "Scheduled Test"}
                                </span>
                            </div>

                            {/* Title */}
                            <div className="mb-4 sm:mb-6">
                                <h2 className="text-xl sm:text-3xl font-bold text-[#1E293B] leading-tight mb-3 sm:mb-4">
                                    {testSet.name}
                                </h2>

                                <h3 className="text-sm sm:text-lg font-bold text-[#1E293B] mb-2 sm:mb-3">
                                    Syllabus Covered
                                </h3>

                                <div className="mb-4 sm:mb-6">
                                    {testSet.syllabus_detailed && testSet.syllabus_detailed.length > 0 ? (
                                        <ul className="space-y-3.5">
                                            {testSet.syllabus_detailed.map((part: any, pIdx: number) => (
                                                <li key={pIdx} className="flex items-start gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-[7px] flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        {/* Part name */}
                                                        <p className="text-xs sm:text-[13px] text-[#475569] font-medium leading-snug">
                                                            <span className="font-bold text-[#1E293B]">{part.part}</span>
                                                            {" – "}
                                                            {Array.isArray(part.subjects) && part.subjects.map((s: any) => s.subject).join(", ")}
                                                        </p>
                                                        {/* Topics per subject */}
                                                        {Array.isArray(part.subjects) && part.subjects.some((s: any) => s.topics?.length > 0) && (
                                                            <div className="mt-1.5 space-y-1 pl-1">
                                                                {part.subjects.map((subj: any, sIdx: number) =>
                                                                    Array.isArray(subj.topics) && subj.topics.length > 0 ? (
                                                                        <p key={sIdx} className="text-[10px] sm:text-[11px] text-[#94A3B8] font-medium leading-relaxed">
                                                                            <span className="text-[#64748B] font-semibold">{subj.subject}:</span>{" "}
                                                                            {subj.topics.join(", ")}
                                                                        </p>
                                                                    ) : null
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <ul className="space-y-2">
                                            {testSet.syllabus.map((tag: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-[7px] flex-shrink-0" />
                                                    <span className="text-xs sm:text-[13px] font-bold text-[#1E293B]">{tag}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="bg-[#F8FBFF] rounded-2xl border border-[#E0F2FE] p-4 sm:p-6 mb-5 sm:mb-6">
                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 mb-4 sm:mb-6 relative text-center">
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold text-[#1E293B] mb-0.5">{testSet.questions}</p>
                                        <p className="text-[9px] sm:text-[10px] text-[#94A3B8] font-bold uppercase">Questions</p>
                                    </div>
                                    <div className="absolute left-[33.33%] top-1 bottom-1 w-[1px] bg-[#E2E8F0]" />
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold text-[#1E293B] mb-0.5">
                                            {testSet.score?.total ?? (testSet.questions * (testSet.marking_scheme?.correct ?? 1))}
                                        </p>
                                        <p className="text-[9px] sm:text-[10px] text-[#94A3B8] font-bold uppercase">Marks</p>
                                    </div>
                                    <div className="absolute left-[66.66%] top-1 bottom-1 w-[1px] bg-[#E2E8F0]" />
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold text-[#1E293B] mb-0.5 whitespace-nowrap">{testSet.duration}</p>
                                        <p className="text-[9px] sm:text-[10px] text-[#94A3B8] font-bold uppercase">Duration</p>
                                    </div>
                                </div>

                                <div className="h-[1px] bg-[#E2E8F0] w-full mb-4 sm:mb-6" />

                                {/* Marking Scheme */}
                                <div className="grid grid-cols-4 items-center gap-1">
                                    <div className="col-span-1 text-left">
                                        <p className="text-[10px] sm:text-[11px] font-bold text-[#1E293B] uppercase leading-tight">Marking:</p>
                                    </div>
                                    <div className="text-center relative">
                                        <p className="text-lg sm:text-xl font-bold text-emerald-500 mb-0.5">+{testSet.marking_scheme?.correct ?? 1}</p>
                                        <p className="text-[8px] sm:text-[9px] text-[#94A3B8] font-bold uppercase">Correct</p>
                                        <div className="absolute left-[-4px] top-1 bottom-1 w-[1px] bg-[#E2E8F0] opacity-50" />
                                    </div>
                                    <div className="text-center relative">
                                        <p className="text-lg sm:text-xl font-bold text-[#1E293B] mb-0.5">{testSet.marking_scheme?.incorrect ?? 0}</p>
                                        <p className="text-[8px] sm:text-[9px] text-[#94A3B8] font-bold uppercase">Wrong</p>
                                        <div className="absolute left-[-4px] top-1 bottom-1 w-[1px] bg-[#E2E8F0] opacity-50" />
                                    </div>
                                    <div className="text-center relative">
                                        <p className="text-lg sm:text-xl font-bold text-[#1E293B] mb-0.5">{testSet.marking_scheme?.unattempted ?? 0}</p>
                                        <p className="text-[8px] sm:text-[9px] text-[#94A3B8] font-bold uppercase">Empty</p>
                                        <div className="absolute left-[-4px] top-1 bottom-1 w-[1px] bg-[#E2E8F0] opacity-50" />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center gap-2.5 mb-5 sm:mb-8 text-[#475569]">
                                {isLocked ? (
                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3 w-full">
                                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                                        <p className="text-xs sm:text-sm font-semibold text-amber-800">
                                            Available on <span className="underline decoration-amber-300 decoration-2">{unlockDate}</span>.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B82F6] shrink-0" />
                                        <p className="text-xs sm:text-sm font-medium text-[#1E293B]">
                                            Stay focused and manage your time wisely.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* CTA */}
                            <Button
                                onClick={onStart}
                                disabled={isLocked}
                                className={cn(
                                    "w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-bold transition-all shadow-lg active:scale-[0.98]",
                                    isLocked
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-[#111827] text-white hover:bg-[#1F2937]"
                                )}
                            >
                                {isLocked ? "Currently Locked" : "Start Test"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
