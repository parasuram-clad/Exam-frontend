import { motion } from "framer-motion";
import { X, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestSet {
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

interface TestSetSyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    testSet: TestSet | null;
    onStart?: () => void;
}

export const TestSetSyllabusModal = ({ isOpen, onClose, testSet, onStart }: TestSetSyllabusModalProps) => {
    if (!isOpen || !testSet) return null;

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

            {/* Modal Content - Reduced size to match SyllabusModal.tsx */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[24px] overflow-hidden shadow-2xl border border-slate-100 p-6 sm:p-8"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Badge */}
                <div className="mb-4">
                    <span className="px-3 py-1 bg-[#F0F7FF] text-[#3B82F6] text-[11px] font-semibold rounded-full uppercase tracking-wide">
                        Scheduled Test
                    </span>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-[#0F172A] leading-tight mb-4">
                        {testSet.name}
                    </h2>

                    <h3 className="text-base font-semibold text-[#0F172A] mb-3">
                        Syllabus Covered
                    </h3>

                    <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-[#334155]">
                            <span className="w-1 h-1 rounded-full bg-[#64748B] mt-1.5 flex-shrink-0" />
                            <span>General Science – Physics, Chemistry, Biology fundamentals</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-[#334155]">
                            <span className="w-1 h-1 rounded-full bg-[#64748B] mt-1.5 flex-shrink-0" />
                            <span>Geography – Indian Geography & Environmental Concepts</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-[#334155]">
                            <span className="w-1 h-1 rounded-full bg-[#64748B] mt-1.5 flex-shrink-0" />
                            <span>History – Modern India & Freedom Movement</span>
                        </li>
                    </ul>
                </div>

                {/* Info Card Container - More compact dimensions */}
                <div className="bg-[#F8FBFF] rounded-[24px] border border-[#E2E8F0] p-5 mb-6">
                    {/* Top Row Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-5 relative">
                        <div className="text-center">
                            <p className="text-xl font-semibold text-[#0F172A] mb-1">{testSet.questions}</p>
                            <p className="text-xs text-[#64748B] font-medium">Questions</p>
                        </div>

                        <div className="absolute left-[33.33%] top-1 bottom-1 w-[1px] bg-[#E2E8F0]" />

                        <div className="text-center">
                            <p className="text-xl font-semibold text-[#0F172A] mb-1">300</p>
                            <p className="text-xs text-[#64748B] font-medium">Marks</p>
                        </div>

                        <div className="absolute left-[66.66%] top-1 bottom-1 w-[1px] bg-[#E2E8F0]" />

                        <div className="text-center">
                            <p className="text-xl font-semibold text-[#0F172A] mb-1 whitespace-nowrap">{testSet.duration}</p>
                            <p className="text-xs text-[#64748B] font-medium">Duration</p>
                        </div>
                    </div>

                    <div className="h-[1px] bg-[#E2E8F0] w-full mb-5" />

                    {/* Marking Scheme Row */}
                    <div className="grid grid-cols-4 items-center gap-1">
                        <div className="col-span-1">
                            <p className="text-xs font-semibold text-[#0F172A]">Marking Scheme:</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-[#22C55E] mb-0.5">+1</p>
                            <p className="text-[10px] text-[#64748B] font-medium">Correct</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-[#0F172A] mb-0.5">0</p>
                            <p className="text-[10px] text-[#64748B] font-medium">Incorrect</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-[#0F172A] mb-0.5">0</p>
                            <p className="text-[10px] text-[#64748B] font-medium">Unattempted</p>
                        </div>
                    </div>
                </div>

                {/* Motivational Message */}
                <div className="flex items-center justify-center gap-2 mb-6 text-[#334155]">
                    <Smile className="w-5 h-5 text-[#64748B]" />
                    <p className="text-sm font-medium text-center">
                        Stay focused and manage your time wisely.
                    </p>
                </div>

                {/* Start Button - Reduced height to match reference */}
                <Button
                    onClick={onStart}
                    className="w-full h-12 bg-[#0F172A] text-white hover:bg-[#1E293B] rounded-xl text-base font-semibold transition-all shadow-md active:scale-[0.98]"
                >
                    Start Test
                </Button>
            </motion.div>
        </div>
    );
};
