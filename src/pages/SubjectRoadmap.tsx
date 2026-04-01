import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Lock,
    CheckCircle2,
    PlayCircle,
    Loader2,
    Calendar,
    Timer,
    FileText,
    Trophy,
    Sparkles,
    Info,
    Library,
    BookOpen,
    BarChart2
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { testSeriesSubjectService, SubjectRoadmapResponse } from "@/services/testSeriesSubject.service";
import { SyllabusModal } from "@/components/test-series/SyllabusModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import testHero from "../assets/test-hero.png";

const SubjectRoadmap = () => {
    const { subjectId } = useParams();
    const [searchParams] = useSearchParams();
    const subjectName = searchParams.get("name") || "Subject Tests";
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [roadmap, setRoadmap] = useState<SubjectRoadmapResponse | null>(null);
    const [selectedTest, setSelectedTest] = useState<{ seriesNo: number; date: string } | null>(null);
    const [selectedSeriesNo, setSelectedSeriesNo] = useState<number | null>(null);

    const fetchRoadmap = useCallback(async () => {
        if (!subjectId) return;

        try {
            setLoading(true);
            try {
                const data = await testSeriesSubjectService.getRoadmap(Number(subjectId));
                setRoadmap(data);
            } catch (err: any) {
                if (err.response?.status === 404 && user) {
                    toast.info(`Initializing ${subjectName} roadmap...`);
                    await testSeriesSubjectService.generatePlan(
                        Number(subjectId),
                        Number(user.target_exam_year || 2026),
                        user.preferred_language === "ta" ? "Tamil" : "English"
                    );
                    const data = await testSeriesSubjectService.getRoadmap(Number(subjectId));
                    setRoadmap(data);
                } else {
                    throw err;
                }
            }
        } catch (error) {
            console.error("Failed to fetch subject roadmap:", error);
            // toast.error("Failed to load test series roadmap");
        } finally {
            setLoading(false);
        }
    }, [subjectId, user, subjectName]);

    // Handle auto-refresh when window gains focus
    useEffect(() => {
        window.addEventListener('focus', fetchRoadmap);
        return () => window.removeEventListener('focus', fetchRoadmap);
    }, [fetchRoadmap]);

    useEffect(() => {
        fetchRoadmap();
    }, [fetchRoadmap]);

    const handleStartTest = () => {
        if (!selectedTest || !roadmap) return;
        navigate(`/test-series/subject/test/${selectedTest.seriesNo}?planId=${roadmap.subject_plan_id}`);
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-1 py-1 sm:px-6 lg:px-2">
                {/* Header/Breadcrumb */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{subjectName}</h1>
                            <p className="text-slate-400 text-xs font-medium">Test Series Roadmap</p>
                        </div>
                    </div>
                </div>

                {/* Hero Banner (Same as TestSeries) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-r from-[#D2EDDD] to-[#F1F7D8] rounded-2xl p-6 md:px-10 md:py-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden border border-[#C7DD66]/20 shadow-sm"
                >
                    <div className="flex-1 relative z-10 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/40 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase tracking-widest mb-4 border border-emerald-200/30">
                            <Sparkles className="w-3 h-3" />
                            {roadmap ? `${roadmap.roadmap.filter(t => t.obtained_marks !== null).length}/${roadmap.total_series} Tests Completed` : "Loading Roadmap..."}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-2 tracking-tight leading-tight">
                            Master your {subjectName} <br className="hidden sm:block" /> skills with practice.
                        </h1>
                        <p className="text-[#0F172A]/70 text-sm md:text-base font-medium mb-6">
                            Tailored roadmap designed for your exam target goals.
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/40">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-slate-700">{roadmap?.test_details.total_questions || 0} Questions</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/40">
                                <Timer className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-slate-700">{(roadmap?.test_details.duration_hours || 0) * 60}m Duration</span>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-32 md:w-48 lg:w-56 shrink-0 relative z-10 select-none hidden sm:block"
                    >
                        <img src={testHero} alt="Hero" className="w-full h-auto object-contain drop-shadow-2xl" />
                    </motion.div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100/30 rounded-full blur-2xl pointer-events-none" />
                </motion.div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                        <p className="text-slate-500 font-medium">Preparing your personalized roadmap...</p>
                    </div>
                ) : roadmap ? (
                    <div className="space-y-4">
                        <div className="px-1 mb-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-1">Available Tests</h2>
                            <p className="text-xs text-slate-400 tracking-wide font-medium uppercase">Step by step practice for your success</p>
                        </div>

                        {/* Roadmap List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {roadmap.roadmap.map((test, index) => (
                                <motion.div
                                    key={test.series_no}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "group bg-white rounded-xl p-8 border border-slate-100 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col min-h-[220px]",
                                        test.status === "LOCKED"
                                            ? "opacity-60 grayscale cursor-not-allowed"
                                            : "hover:border-emerald-200 hover:shadow-[0_25px_50px_rgba(0,0,0,0.06)] scale-100 hover:scale-[1.02]"
                                    )}
                                >
                                    {/* Top Row: Icon + Title + Score */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0",
                                                test.status === "LOCKED" || test.access === "REQUIRES_SUBSCRIPTION"
                                                    ? "bg-slate-50 text-slate-400"
                                                    : "bg-sky-50 text-sky-600 shadow-sm"
                                            )}>
                                                {test.access === "REQUIRES_SUBSCRIPTION" ? (
                                                    <Lock className="w-5 h-5 shadow-sm" />
                                                ) : (
                                                    <BookOpen className="w-6 h-6" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-800 tracking-tight leading-tight">
                                                    Test Set {test.series_no}
                                                </h3>
                                                <p className={cn(
                                                    "text-[10px] font-bold mt-1 px-2 py-0.5 rounded-md inline-block uppercase tracking-wider",
                                                    test.obtained_marks !== null 
                                                        ? "bg-emerald-100 text-emerald-700" 
                                                        : test.status === "LOCKED"
                                                            ? "bg-slate-100 text-slate-400"
                                                            : test.access === "REQUIRES_SUBSCRIPTION"
                                                                ? "bg-[#eff7db] text-[#0F172A]"
                                                                : "bg-sky-50 text-sky-600"
                                                )}>
                                                    {test.obtained_marks !== null 
                                                        ? "Completed" 
                                                        : test.status === "LOCKED" 
                                                            ? "Locked"
                                                            : test.access === "REQUIRES_SUBSCRIPTION" 
                                                                ? "Premium"
                                                                : "Unlocked"
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Score Display / Unlock Info (Top Right) */}
                                        {test.obtained_marks !== null ? (
                                            <div className="text-right">
                                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">Score</p>
                                                <p className="text-lg text-slate-800 mt-1 font-bold">
                                                    {test.obtained_marks}<span className="text-slate-400 text-sm">/{roadmap.test_details.total_marks || roadmap.test_details.total_questions}</span>
                                                </p>
                                            </div>
                                        ) : test.status === "LOCKED" && test.test_date && (
                                            <div className="text-right">
                                                <div className="bg-slate-50 border border-slate-100 flex flex-col items-end px-2 py-1 rounded-md">
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-none mb-1">Unlocks</p>
                                                    <p className="text-[11px] font-bold text-slate-600 leading-none">
                                                        {new Date(test.test_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                    {/* Test Details row – single line, no wrap */}
                                    <div className="flex items-center justify-between mb-4 overflow-hidden">
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-sm">🧠</span>
                                            <span className="text-[11px] text-slate-500 whitespace-nowrap">{roadmap.test_details.marking_scheme.correct} Mark/Q</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-sm">📖</span>
                                            <span className="text-[11px] text-slate-500 whitespace-nowrap">{roadmap.test_details.total_questions} Qs</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-sm">📝</span>
                                            <span className="text-[11px] text-slate-500 whitespace-nowrap">{roadmap.test_details.duration_hours * 60}m</span>
                                        </div>
                                    </div>

                                    {/* Action button: View Analysis (if finished) OR View Details (if pending) */}
                                    <div className="flex flex-col gap-2 mt-auto">
                                        <Button
                                            disabled={test.status === "LOCKED"}
                                            onClick={() => {
                                                if (test.access === "REQUIRES_SUBSCRIPTION") {
                                                    navigate("/upgrade-plan");
                                                } else if (test.obtained_marks !== null) {
                                                    navigate(`/test-series/subject/test/${test.series_no}/analytics?planId=${roadmap.subject_plan_id}`);
                                                } else {
                                                    setSelectedSeriesNo(test.series_no);
                                                }
                                            }}
                                            className={cn(
                                                "w-full h-10 rounded-lg text-sm font-medium transition-all active:scale-[0.98] shadow-sm",
                                                test.access === "REQUIRES_SUBSCRIPTION"
                                                    ? "bg-[#eff7db] text-[#0F172A] hover:bg-[#C7DD64] border border-[#C7DD66]/30 shadow-none"
                                                    : "bg-[#0F172A] text-white hover:bg-[#1E293B]",
                                                test.status === "LOCKED" && "bg-slate-200 text-slate-400 shadow-none pointer-events-none"
                                            )}
                                        >
                                            {test.access === "REQUIRES_SUBSCRIPTION"
                                                ? "Upgrade Plan"
                                                : test.obtained_marks !== null
                                                    ? "View Analysis"
                                                    : "Attempt Test"
                                            }
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[32px] p-16 text-center border border-dashed border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Info className="w-10 h-10 text-slate-200" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No tests found</h2>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">We couldn't find any tests for this subject. Your roadmap might be under construction.</p>
                        <Button onClick={() => navigate(-1)} className="rounded-xl px-8 h-12">Go Back</Button>
                    </div>
                )}
            </div>

            {/* Syllabus Modal – shows single test details from backend */}
            <SyllabusModal
                isOpen={selectedSeriesNo !== null}
                onClose={() => setSelectedSeriesNo(null)}
                subjectId={Number(subjectId)}
                subjectPlanId={roadmap?.subject_plan_id}
                subjectName={subjectName}
                seriesNo={selectedSeriesNo ?? 1}
                onStartTest={(seriesNo, subjectPlanId) => {
                    setSelectedSeriesNo(null);
                    navigate(`/test-series/subject/test/${seriesNo}?planId=${subjectPlanId}`);
                }}
            />
        </DashboardLayout>
    );
};

export default SubjectRoadmap;
