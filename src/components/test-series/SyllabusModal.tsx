import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smile, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { testSeriesSubjectService, SubjectRoadmapResponse } from "@/services/testSeriesSubject.service";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface SyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: number;
    subjectPlanId?: number;
    subjectName: string;
    seriesNo: number;
    onStartTest?: (seriesNo: number, subjectPlanId: number) => void;
}

export const SyllabusModal = ({ isOpen, onClose, subjectId, subjectPlanId, subjectName, seriesNo, onStartTest }: SyllabusModalProps) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [roadmap, setRoadmap] = useState<SubjectRoadmapResponse | null>(null);

    useEffect(() => {
        const fetchRoadmap = async () => {
            if (!isOpen || !subjectId) return;
            try {
                setLoading(true);
                try {
                    const planId = subjectPlanId ?? subjectId;
                    const data = await testSeriesSubjectService.getRoadmap(planId);
                    setRoadmap(data);
                } catch (err: any) {
                    if (err.response?.status === 404 && user) {
                        toast.info(`Generating ${subjectName} test plan...`);
                        await testSeriesSubjectService.generatePlan(
                            subjectId,
                            Number(user.target_exam_year || 2026),
                            user.preferred_language === "ta" ? "Tamil" : "English"
                        );
                        const data = await testSeriesSubjectService.getRoadmap(subjectId);
                        setRoadmap(data);
                    } else {
                        throw err;
                    }
                }
            } catch (error) {
                console.error("Failed to fetch subject roadmap:", error);
                toast.error("Failed to load test details");
            } finally {
                setLoading(false);
            }
        };
        fetchRoadmap();
    }, [isOpen, subjectId, user]);

    const testEntry = roadmap?.roadmap.find(t => t.series_no === seriesNo);
    const isLocked = testEntry?.status === "LOCKED";
    const unlockDate = testEntry?.test_date
        ? new Date(testEntry.test_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;
    const syllabus = testEntry?.syllabus;
    const syllabusSubject = syllabus?.subject ?? subjectName;
    const syllabusTopics: string[] = Array.isArray(syllabus?.topics) && syllabus.topics.length > 0
        ? syllabus.topics
        : ["Core Concepts & Fundamentals"];

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
                        className="relative w-full sm:max-w-[580px] bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl border border-slate-100 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
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
                            {/* Mobile header */}
                            <div className="flex items-center justify-between mb-4 sm:hidden">
                                <span className="px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide bg-[#F0F7FF] text-[#3B82F6]">
                                    {isLocked ? "Coming Soon" : "Scheduled Test"}
                                </span>
                                <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-14 gap-3">
                                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                    <p className="text-sm text-slate-500 font-medium">Loading test details...</p>
                                </div>
                            ) : roadmap ? (
                                <>
                                    {/* Desktop badge */}
                                    <div className="hidden sm:block mb-4">
                                        <span className="px-3.5 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wide bg-[#F0F7FF] text-[#3B82F6]">
                                            {isLocked ? "Coming Soon" : "Scheduled Test"}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-xl sm:text-3xl font-bold text-[#1E293B] leading-tight mb-4 sm:mb-6">
                                        Test Set - {String(seriesNo).padStart(2, '0')}
                                    </h2>

                                    {/* Syllabus */}
                                    <h3 className="text-sm sm:text-lg font-bold text-[#1E293B] mb-2 sm:mb-3">
                                        Syllabus Covered
                                    </h3>
                                    {/* Subject label */}
                                    <p className="text-xs sm:text-sm font-bold text-[#1E293B] mb-2">{syllabusSubject}</p>
                                    <ul className="space-y-2 mb-5 sm:mb-6">
                                        {syllabusTopics.map((topic, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-[7px] flex-shrink-0" />
                                                <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">{topic}</p>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Info Card */}
                                    <div className="bg-[#F8FBFF] rounded-2xl border border-[#E0F2FE] p-4 sm:p-6 mb-5 sm:mb-6">
                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-2 mb-4 sm:mb-6 relative text-center">
                                            <div>
                                                <p className="text-xl sm:text-2xl font-bold text-[#1E293B] mb-0.5">{roadmap.test_details.total_questions}</p>
                                                <p className="text-[9px] sm:text-[10px] text-[#94A3B8] font-bold uppercase">Questions</p>
                                            </div>
                                            <div className="absolute left-[33.33%] top-2 bottom-2 w-[1px] bg-[#E2E8F0]" />
                                            <div>
                                                <p className="text-xl sm:text-2xl font-bold text-[#1E293B] mb-0.5">{roadmap.test_details.total_marks}</p>
                                                <p className="text-[9px] sm:text-[10px] text-[#94A3B8] font-bold uppercase">Marks</p>
                                            </div>
                                            <div className="absolute left-[66.66%] top-2 bottom-2 w-[1px] bg-[#E2E8F0]" />
                                            <div>
                                                <p className="text-xl sm:text-2xl font-bold text-[#1E293B] mb-0.5 whitespace-nowrap">{roadmap.test_details.duration_hours} Hrs</p>
                                                <p className="text-[9px] sm:text-[10px] text-[#94A3B8] font-bold uppercase">Duration</p>
                                            </div>
                                        </div>

                                        <div className="h-[1px] bg-[#E2E8F0] w-full mb-4 sm:mb-6" />

                                        {/* Marking Scheme */}
                                        <div className="grid grid-cols-4 items-center gap-1">
                                            <div className="col-span-1 text-left">
                                                <p className="text-[10px] sm:text-[11px] font-bold text-[#1E293B] uppercase leading-tight">Marking:<br className="hidden sm:block" /> Scheme</p>
                                            </div>
                                            <div className="text-center relative">
                                                <p className="text-lg sm:text-xl font-bold text-emerald-500 mb-0.5">+{roadmap.test_details.marking_scheme.correct}</p>
                                                <p className="text-[8px] sm:text-[9px] text-[#94A3B8] font-bold uppercase">Correct</p>
                                                <div className="absolute left-0 top-1 bottom-1 w-[1px] bg-[#E2E8F0]" />
                                            </div>
                                            <div className="text-center relative">
                                                <p className="text-lg sm:text-xl font-bold text-[#1E293B] mb-0.5">{roadmap.test_details.marking_scheme.incorrect}</p>
                                                <p className="text-[8px] sm:text-[9px] text-[#94A3B8] font-bold uppercase">Incorrect</p>
                                                <div className="absolute left-0 top-1 bottom-1 w-[1px] bg-[#E2E8F0]" />
                                            </div>
                                            <div className="text-center relative">
                                                <p className="text-lg sm:text-xl font-bold text-[#1E293B] mb-0.5">0</p>
                                                <p className="text-[8px] sm:text-[9px] text-[#94A3B8] font-bold uppercase">Unattempted</p>
                                                <div className="absolute left-0 top-1 bottom-1 w-[1px] bg-[#E2E8F0]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center gap-2.5 mb-5 sm:mb-8">
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
                                                    Stay focused and manage your time wisely throughout the test.
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <Button
                                        onClick={() => onStartTest?.(seriesNo, roadmap.subject_plan_id)}
                                        disabled={isLocked}
                                        className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-medium transition-all shadow-lg active:scale-[0.98] bg-[#111827] text-white hover:bg-[#1F2937] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    >
                                        {isLocked ? "Currently Locked" : "Start Test"}
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 text-sm">No test data found for this subject.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
