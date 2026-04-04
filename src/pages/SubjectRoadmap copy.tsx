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
import { testSeriesSubjectService, SubjectRoadmapResponse, SubjectPlan } from "@/services/testSeriesSubject.service";
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
    const [roadmap, setRoadmap] = useState<SubjectPlan | null>(null);
    const [selectedTest, setSelectedTest] = useState<{ seriesNo: number; date: string } | null>(null);
    const [selectedSeriesNo, setSelectedSeriesNo] = useState<number | null>(null);

    const handleInitialize = async () => {
        if (!subjectId || subjectId === "0") {
            toast.error("Invalid subject ID. Please go back and try again.");
            return;
        }

        try {
            setLoading(true);
            // Defaulting to user's exam preferences or generic defaults
            await testSeriesSubjectService.generatePlan(
                Number(subjectId),
                new Date().getFullYear(),
                "English",
                "GENERAL"
            );
            toast.success("Test series generated successfully!");
            fetchRoadmap();
        } catch (error: any) {
            console.error("Failed to initialize subject roadmap:", error);
            toast.error(error.response?.data?.detail || "Failed to initialize test series.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoadmap = useCallback(async () => {
        try {
            setLoading(true);
            const response = await testSeriesSubjectService.getRoadmap();
            
            // Find the roadmap that matches the current subject name
            const matchingRoadmap = response.plans.find(
                p => p.subject_name.toLowerCase() === subjectName.toLowerCase()
            );

            if (matchingRoadmap) {
                setRoadmap(matchingRoadmap);
            } else {
                // Not found. If we have Numeric subjectId (even if it's the planId usually),
                // we might try to find by ID, but name is more reliable for newly initialized.
                // If not found in and roadmap, we might need to initialize.
                // Wait, if it's not found, maybe initialize? 
                // BUT, initializing requires an ID for subject_configuration.
                // In my case, available subjects from backend have no plan_id until generated.
                // So clicking on "History" navigates to roadmap?name=History.
                // If no plan, matchingRoadmap is null. 
                // We should initialize here.
            }
        } catch (error) {
            console.error("Failed to fetch subject roadmap:", error);
        } finally {
            setLoading(false);
        }
    }, [subjectName]);

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
        navigate(`/test-series/subject/test/${selectedTest.seriesNo}?plan_id=${roadmap.plan_id}`);
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
                            {roadmap ? `${roadmap.roadmap?.filter(t => t.obtained_marks !== null).length || 0}/${roadmap.total_series} Tests Completed` : "Loading Roadmap..."}
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
                                <span className="text-xs font-bold text-slate-700">{roadmap?.test_details?.total_questions || 0} Questions</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/40">
                                <Timer className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-slate-700">{(roadmap?.test_details?.duration_hours || 0) * 60}m Duration</span>
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
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Fetching roadmap...</p>
                    </div>
                ) : !roadmap ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Roadmap Available</h3>
                        <p className="text-slate-500 text-sm mb-6">You haven't generated a test series for this subject yet.</p>
                        <Button 
                            onClick={handleInitialize}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Test Series
                        </Button>
                    </div>
                ) : (
                    <div className="relative py-10 px-4">
                        {/* Connecting Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-100 via-emerald-200 to-emerald-100 -translate-x-1/2 hidden md:block" />

                        <div className="space-y-12 relative z-10">
                            {roadmap.roadmap.map((test, index) => {
                                const isCompleted = test.status === "COMPLETED";
                                const isLocked = test.status === "LOCKED";
                                const isEven = index % 2 === 0;

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className={cn(
                                            "flex flex-col md:flex-row items-center gap-8 md:gap-0",
                                            isEven ? "md:flex-row" : "md:flex-row-reverse"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-full md:w-[45%] flex",
                                            isEven ? "md:justify-end" : "md:justify-start"
                                        )}>
                                            <div
                                                onClick={() => {
                                                    if (test.access === "REQUIRES_SUBSCRIPTION") {
                                                        navigate("/upgrade-plan");
                                                    } else if (test.obtained_marks !== null) {
                                                        navigate(`/test-series/subject/test/${test.series_no}/analytics?plan_id=${roadmap.plan_id}`);
                                                    } else {
                                                        setSelectedSeriesNo(test.series_no);
                                                    }
                                                }}
                                                className={cn(
                                                    "w-full sm:max-w-md bg-white rounded-2xl p-5 border shadow-sm transition-all duration-300 cursor-pointer group",
                                                    isLocked ? "bg-slate-50/50 border-slate-100 opacity-75" : "hover:shadow-md hover:border-emerald-200 border-slate-100",
                                                    isCompleted && "border-emerald-100"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                        isCompleted ? "bg-emerald-50 text-emerald-600" :
                                                            isLocked ? "bg-slate-100 text-slate-400" :
                                                                "bg-amber-50 text-amber-600"
                                                    )}>
                                                        {isCompleted ? "Completed" : isLocked ? "Locked" : "Next Up"}
                                                    </span>
                                                    {test.obtained_marks !== null && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                                            <span className="text-xs font-bold text-slate-700">
                                                                {test.obtained_marks}/{test.total_marks || roadmap.test_details.total_marks}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                                    Test Set - {String(test.series_no).padStart(2, '0')}
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400 font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(test.test_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <BookOpen className="w-3.5 h-3.5" />
                                                        {test.syllabus?.topics.length || 0} Topics
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative flex items-center justify-center md:w-[10%]">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110 shadow-sm",
                                                isCompleted ? "bg-emerald-500 text-white" :
                                                    isLocked ? "bg-slate-100 text-slate-400 border border-slate-200" :
                                                        "bg-white border-2 border-emerald-500 text-emerald-600 animate-pulse"
                                            )}>
                                                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                                                    isLocked ? <Lock className="w-4 h-4" /> :
                                                        <PlayCircle className="w-6 h-6" />
                                                }
                                            </div>
                                        </div>

                                        <div className="hidden md:block md:w-[45%]" />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <SyllabusModal
                isOpen={selectedSeriesNo !== null}
                onClose={() => setSelectedSeriesNo(null)}
                subjectId={roadmap?.plan_id ?? (isNaN(Number(subjectId)) ? 0 : Number(subjectId))}
                subjectPlanId={roadmap?.plan_id}
                subjectName={subjectName}
                seriesNo={selectedSeriesNo ?? 1}
                onStartTest={(seriesNo, subjectPlanId) => {
                    setSelectedSeriesNo(null);
                    navigate(`/test-series/subject/test/${seriesNo}?plan_id=${subjectPlanId}`);
                }}
            />
        </DashboardLayout>
    );
};

export default SubjectRoadmap;
