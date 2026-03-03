import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Timer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectName: string;
    onStart?: () => void;
}

export const SyllabusModal = ({ isOpen, onClose, subjectName, onStart }: SyllabusModalProps) => {
    if (!isOpen) return null;

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
                className="relative w-full max-w-md bg-white rounded-[24px] overflow-hidden shadow-2xl border border-slate-100"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Syllabus Covered</h2>
                        <p className="text-slate-500 text-sm mt-0.5 font-medium">{subjectName}</p>
                    </div>

                    {/* Syllabus Content */}
                    <div className="space-y-5 mb-6">
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 mb-2">General Studies</h3>
                            <ul className="space-y-1.5">
                                <li className="flex items-start gap-2.5 text-slate-600 text-[14px] group">
                                    <span className="w-1 h-1 rounded-full bg-slate-300 mt-2 flex-shrink-0 group-hover:bg-primary transition-colors" />
                                    <span>Unit 1: Indian Polity (Constitution, Rights, DPSP)</span>
                                </li>
                                <li className="flex items-start gap-2.5 text-slate-600 text-[14px] group">
                                    <span className="w-1 h-1 rounded-full bg-slate-300 mt-2 flex-shrink-0 group-hover:bg-primary transition-colors" />
                                    <span>Unit 2: Indian Economy (Budget basics, Banking)</span>
                                </li>
                                <li className="flex items-start gap-2.5 text-slate-600 text-[14px] group">
                                    <span className="w-1 h-1 rounded-full bg-slate-300 mt-2 flex-shrink-0 group-hover:bg-primary transition-colors" />
                                    <span>Unit 3: Geography (TN Rivers, Climate)</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-base font-semibold text-slate-900 mb-2">Tamil</h3>
                            <ul className="space-y-1.5">
                                <li className="flex items-start gap-2.5 text-slate-600 text-[14px] group">
                                    <span className="w-1 h-1 rounded-full bg-slate-300 mt-2 flex-shrink-0 group-hover:bg-primary transition-colors" />
                                    <span className="font-tamil">இலக்கணம்: பெயர்ச்சொல், வினைச்சொல்</span>
                                </li>
                                <li className="flex items-start gap-2.5 text-slate-600 text-[14px] group">
                                    <span className="w-1 h-1 rounded-full bg-slate-300 mt-2 flex-shrink-0 group-hover:bg-primary transition-colors" />
                                    <span className="font-tamil">இலக்கியம்: முக்கிய படைப்புகள்</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Guidelines Box */}
                    <div className="bg-[#f0f9ff] rounded-[18px] p-4 border border-[#e0f2fe] space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-[#0369a1]">
                            <Info className="w-4 h-4 shrink-0" />
                            <span className="text-[13px] font-medium leading-tight">One attempt per unlock cycle</span>
                        </div>
                        <div className="flex items-center gap-3 text-[#0369a1]">
                            <Timer className="w-4 h-4 shrink-0" />
                            <span className="text-[13px] font-medium leading-tight">Timer starts when you begin</span>
                        </div>
                        <div className="flex items-center gap-3 text-[#0369a1]">
                            <Trophy className="w-4 h-4 shrink-0" />
                            <span className="text-[13px] font-medium leading-tight">Results available after submission</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button
                        onClick={onStart}
                        className="w-full h-12 bg-[#0F172A] text-white hover:bg-[#1e293b] rounded-xl text-[15px] font-semibold transition-all active:scale-[0.98] shadow-md shadow-slate-100"
                    >
                        Start Test
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
