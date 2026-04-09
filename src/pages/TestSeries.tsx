import { useState, useEffect, useCallback, useMemo } from "react";
import authService, { UserMe } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout";
import {
  StreakWidget,
  LeaderboardWidget,
  ScheduleWidget,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Trophy, Library, BookOpen, Landmark, Globe, Banknote, Microscope, Newspaper, Brain, Pencil, Timer, Layout, Bell, Star, Sparkles, Loader2 } from "lucide-react";
import { cn, getMediaUrl } from "@/lib/utils";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/env";
import { SubjectWiseView, TestSubject } from "@/components/test-series/SubjectWiseView";
import { TestSetsView, TestSet } from "@/components/test-series/TestSetsView";
import { testSeriesOverallService, OverallRoadmapResponse, RoadmapEntry } from "@/services/testSeriesOverall.service";
import { testSeriesSubjectService } from "@/services/testSeriesSubject.service";
import { GeneratePlanModal } from "@/components/test-series/GeneratePlanModal";
import { toast } from "sonner";
import test1Icon from "../assets/test-1.png";
import test2Icon from "../assets/test-2.png";
import test3Icon from "../assets/test-3.png";
import test4Icon from "../assets/test-4.png";
import test5Icon from "../assets/tes-5.png";
import test6Icon from "../assets/test-6.png";
import testHero from "../assets/test-hero.png";

const TestSeriesSidebar = ({ user, attempts, activeTab }: { user: UserMe | null, attempts: any[], activeTab: "subject" | "sets" }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-6 tracking-tight">
          Analyze Last Attempts
        </h3>
        <div className="space-y-4">
          {attempts.length > 0 ? (
            attempts.map((attempt, index) => {
              const planType = activeTab === "sets" ? "overall" : "subject";
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-white border border-slate-50 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-1.5 py-0.5 rounded">
                        Set {attempt.series_no}
                      </span>
                      <p className="text-[12px] font-medium text-slate-800 truncate">{attempt.subject_name || (activeTab === "sets" ? "Overall Test" : "Subject Test")}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 whitespace-nowrap">
                      Score: <span className={cn(
                        "font-bold",
                        attempt.score_percentage > 70 ? "text-emerald-600" : attempt.score_percentage > 40 ? "text-amber-600" : "text-rose-600"
                      )}>{attempt.correct_answers}/{attempt.total_questions} ({attempt.score_percentage}%)</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/test-series/${planType}/test/${attempt.series_no}/analytics?plan_id=${attempt.plan_id}`)}
                    className="h-8 px-3 rounded-lg bg-sky-50 border-0 text-sky-600 hover:bg-sky-100 text-[10px] font-bold transition-all"
                  >
                    View Analysis
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No recent attempts</p>
              <p className="text-[9px] text-slate-300 mt-1 uppercase font-bold tracking-tight">Complete a test to see history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TestSeries = () => {
  const navigate = useNavigate();
  const { user, currentContext } = useAuth();

  // Removed testContext fallback to ensure the page reflects the sidebar selection directly.

  const [activeTab, setActiveTab] = useState<"subject" | "sets">("sets");

  // Determine purchased test plan types
  const hasOverallTests = useMemo(() =>
    user?.dashboard?.contexts?.some(c => c.plan_type === 'OVERALL_TEST_SERIES'), [user]);
  const hasSubjectTests = useMemo(() =>
    user?.dashboard?.contexts?.some(c => c.plan_type === 'SUBJECT_TEST_SERIES'), [user]);
  const showTabs = hasOverallTests && hasSubjectTests;

  // Sync activeTab with current context type if it's a test series
  useEffect(() => {
    if (currentContext?.plan_type === 'OVERALL_TEST_SERIES') {
      setActiveTab("sets");
    } else if (currentContext?.plan_type === 'SUBJECT_TEST_SERIES') {
      setActiveTab("subject");
    } else if (hasOverallTests && !hasSubjectTests) {
      setActiveTab("sets");
    } else if (!hasOverallTests && hasSubjectTests) {
      setActiveTab("subject");
    }
  }, [currentContext?.plan_type, hasOverallTests, hasSubjectTests]);

  const [roadmap, setRoadmap] = useState<OverallRoadmapResponse['plans'][0] | null>(null);
  const [subjects, setSubjects] = useState<TestSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const userName = user?.full_name || user?.username || "Student";

  const getSubjectIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('history')) return <Landmark className="w-4 h-4" />;
    if (n.includes('polity')) return <Globe className="w-4 h-4" />;
    if (n.includes('geo')) return <Globe className="w-4 h-4" />;
    if (n.includes('eco')) return <Banknote className="w-4 h-4" />;
    if (n.includes('aptitude')) return <Brain className="w-4 h-4" />;
    if (n.includes('science')) return <Microscope className="w-4 h-4" />;
    if (n.includes('english') || n.includes('tamil')) return <BookOpen className="w-4 h-4" />;
    return <Newspaper className="w-4 h-4" />;
  };

  const getSubjectColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('history')) return { text: "text-amber-600", bg: "bg-amber-50" };
    if (n.includes('polity')) return { text: "text-blue-600", bg: "bg-blue-50" };
    if (n.includes('geo')) return { text: "text-teal-600", bg: "bg-teal-50" };
    if (n.includes('aptitude')) return { text: "text-emerald-600", bg: "bg-emerald-50" };
    if (n.includes('science')) return { text: "text-orange-600", bg: "bg-orange-50" };
    if (n.includes('english')) return { text: "text-indigo-600", bg: "bg-indigo-50" };
    if (n.includes('tamil')) return { text: "text-rose-600", bg: "bg-rose-50" };
    return { text: "text-slate-600", bg: "bg-slate-50" };
  };

  const fetchHistory = useCallback(async () => {
    if (!user) return;

    try {
      setHistoryLoading(true);
      if (activeTab === "sets" && roadmap?.plan_id) {
        const response = await testSeriesOverallService.getHistory(roadmap.plan_id);
        const list = response.history || [];
        const sorted = list
          .filter((a: any) => a.status === "COMPLETED")
          .sort((a: any, b: any) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime())
          .slice(0, 5)
          .map((a: any) => ({ ...a, plan_id: roadmap.plan_id }));
        setHistory(sorted);
      } else if (activeTab === "subject" && subjects.length > 0) {
        // Fetch history for first 3 subjects as recent attempts
        const historyPromises = subjects.slice(0, 5).map(sub =>
          testSeriesSubjectService.getHistory(sub.subjectId).catch(() => ({ history: [] }))
        );
        const historyResponses = await Promise.all(historyPromises);
        const allHistory = historyResponses.flatMap((res, idx) =>
          (res.history || []).map((a: any) => ({ ...a, plan_id: subjects[idx].subjectId }))
        );
        // Sort all subject history by date completed
        setHistory(allHistory.filter((a: any) => a.status === "COMPLETED").sort((a, b) =>
          new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime()
        ).slice(0, 5));
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user, activeTab, roadmap, subjects]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const initTestSeries = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Fetch Overall Roadmap
      const targetOverallId = currentContext?.plan_type === 'OVERALL_TEST_SERIES'
        ? currentContext.plan_id
        : user?.dashboard?.contexts?.find(c => c.plan_type === 'OVERALL_TEST_SERIES')?.plan_id;

      if (targetOverallId || hasOverallTests) {
        const roadmaps = await testSeriesOverallService.getRoadmap(targetOverallId);
        if (roadmaps.plans && roadmaps.plans.length > 0) {
          setRoadmap(roadmaps.plans[0]);
        } else if (hasOverallTests && activeTab === "sets") {
          setIsModalOpen(true);
        }
      }

      // 2. Fetch Available Subjects for Subject-Wise View
      const subjectPlan = user?.dashboard?.contexts?.find(c => c.plan_type === 'SUBJECT_TEST_SERIES');

      if (user.exam_type && user.sub_division) {
        setSubjectsLoading(true);
        const response = await testSeriesSubjectService.getAvailableSubjects(
          user.exam_type!,
          user.sub_division!,
          user.preferred_language === "ta" ? "Tamil" : "English"
        );

        if (response.subjects) {
          const mappedSubjects: TestSubject[] = response.subjects.map((sub: any) => {
            const { text: color, bg } = getSubjectColor(sub.subject_name);
            return {
              id: sub.subject_name.toLowerCase().replace(/\s+/g, '-'),
              subjectId: Number(sub.id) || 0,
              name: sub.subject_name,
              icon: sub.subject_image || test1Icon,
              testsAvailable: sub.available || 0,
              completed: sub.completed || 0,
              total: sub.total_series || 0,
              difficulty: sub.difficulty || "Moderate",
              iconBg: bg
            };
          });
          setSubjects(mappedSubjects);
        }
      }
    } catch (error) {
      console.error("Test series initialization failed:", error);
    } finally {
      setLoading(false);
      setSubjectsLoading(false);
    }
  }, [user, currentContext, hasOverallTests, hasSubjectTests, activeTab]);

  // Handle auto-refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      initTestSeries();
      fetchHistory();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [initTestSeries, fetchHistory]);

  useEffect(() => {
    initTestSeries();
  }, [initTestSeries]);

  const handleGeneratePlan = async (formData: any) => {
    try {
      await testSeriesOverallService.generatePlan(formData);
      const updatedRoadmaps = await testSeriesOverallService.getRoadmap();
      if (updatedRoadmaps.plans.length > 0) setRoadmap(updatedRoadmaps.plans[0]);
      toast.success("Test series plan generated successfully!", { icon: "✨" });
    } catch (error) {
      toast.error("Failed to generate plan. Please try again.");
      throw error;
    }
  };

  // Map backend roadmap to UI TestSet format
  const mappedTestSets: TestSet[] = (roadmap?.roadmap || []).map((test) => ({
    id: test.series_no.toString(),
    plan_id: roadmap!.plan_id,
    name: `Test Set ${test.series_no}`,
    duration: `${(roadmap!.test_details.duration_hours || 1.5) * 60} m`,
    questions: roadmap!.test_details.total_questions,
    marking_scheme: roadmap!.test_details.marking_scheme,
    difficulty: test.series_no % 3 === 0 ? "Hard" : test.series_no % 2 === 0 ? "Moderate" : "Easy",
    syllabus: test.syllabus ? test.syllabus.map((s: any) => s.part) : ["Full Syllabus"],
    syllabus_detailed: test.syllabus,
    score: test.obtained_marks !== null ? {
      obtained: test.obtained_marks,
      total: test.total_marks || roadmap!.test_details.total_marks
    } : undefined,
    status: test.status,
    access: test.access,
    planned_date: test.test_date
  }));

  return (
    <DashboardLayout
      hideHeader={isDesktop}
      rightSidebar={<TestSeriesSidebar user={user} attempts={history} activeTab={activeTab} />}
    >
      <div className="px-1 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-slate-900">Test Series</h1>
          <p className="text-[12px] sm:text-sm text-slate-500 mt-1 font-medium">
            {roadmap ? `${roadmap.exam_type} – ${roadmap.sub_division} | ${roadmap.year}` : "Choose your path to success"}
          </p>
        </div>
        {roadmap && (
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 gap-2 h-9 px-4 text-xs font-medium shadow-sm transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Switch Plan
          </Button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-[#D2EDDD] to-[#F1F7D8] rounded-2xl p-4 md:px-8 md:py-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 overflow-hidden border border-[#C7DD66]/20 shadow-sm"
      >
        <div className="flex-1 relative z-10 text-center md:text-left order-2 md:order-1">
          <h1 className="text-xl md:text-2xl font-semibold text-[#0F172A] mb-1 tracking-tight">
            Hi, {userName} 👋
          </h1>
          <p className="text-[#0F172A]/70 text-sm md:text-base font-medium mb-3 md:mb-4">
            {roadmap ? `You have ${roadmap.total_series} tests in your roadmap.` : "Ready to test your knowledge?"}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2.5 text-[12px] md:text-[14px] text-slate-700/80 font-medium">
              <Library className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>25+ test sets per subject</span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2.5 text-[12px] md:text-[14px] text-slate-700/80 font-medium">
              <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Updated Syllabus & Current Affairs</span>
            </div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 sm:w-24 md:w-32 lg:w-40 shrink-0 relative z-10 select-none order-1 md:order-2"
        >
          <img src={testHero} alt="Hero" className="w-full h-auto object-contain drop-shadow-xl" />
        </motion.div>

        <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100/30 rounded-full blur-2xl pointer-events-none" />
      </motion.div>

      {showTabs && (
        <div className="flex items-center gap-4 mb-8 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("sets")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
              activeTab === "sets"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Test Sets
          </button>

          <button
            onClick={() => setActiveTab("subject")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
              activeTab === "subject"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Subject-Wise
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading your test series...</p>
        </div>
      ) : !roadmap ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Test Series Roadmap Found</h2>
          <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
            Personalize your exam preparation by generating a custom test series roadmap based on your target exam and learning style.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 h-12 text-sm font-medium transition-all active:scale-[0.98] shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:animate-pulse" />
            Generate My Test Series Plan
          </Button>
        </motion.div>
      ) : activeTab === "subject" ? (
        <SubjectWiseView subjects={subjects} />
      ) : (
        <TestSetsView testSets={mappedTestSets} />
      )}

      <GeneratePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGeneratePlan}
        initialData={user}
      />
    </DashboardLayout>
  );
};

export default TestSeries;
