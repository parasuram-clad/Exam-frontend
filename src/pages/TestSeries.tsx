import { useState, useEffect } from "react";
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
import { GeneratePlanModal } from "@/components/test-series/GeneratePlanModal";
import { toast } from "sonner";
import test1Icon from "../assets/test-1.png";
import test2Icon from "../assets/test-2.png";
import test3Icon from "../assets/test-3.png";
import test4Icon from "../assets/test-4.png";
import test5Icon from "../assets/tes-5.png";
import test6Icon from "../assets/test-6.png";
import testHero from "../assets/test-hero.png";

// Static categories for Subject Wise (can be fetched later)
const testSubjects: TestSubject[] = [];

const TestSeriesSidebar = ({ user }: { user: UserMe | null }) => {
  const navigate = useNavigate();
  // TODO: Fetch real last attempts from backend
  const attempts: any[] = [];

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-6 tracking-tight">
          Improve Your Last Attempts
        </h3>
        <div className="space-y-4">
          {attempts.length > 0 ? (
            attempts.map((attempt, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-white border border-slate-50 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-[12px] font-medium text-slate-800 mb-1 truncate">{attempt.name}</p>
                  <p className="text-[10px] text-slate-400 whitespace-nowrap">
                    Score: <span className="text-slate-900">{attempt.score}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/test-series/${attempt.subject}/test/${attempt.testId}`)}
                  className="h-9 px-4 rounded-xl bg-sky-50 border-0 text-sky-600 hover:bg-sky-100  text-xs font-medium transition-all"
                >
                  Start now
                </Button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400 font-medium">No recent attempts found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TestSeries = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"subject" | "sets">("sets");
  const [roadmap, setRoadmap] = useState<OverallRoadmapResponse['plans'][0] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const userName = user?.full_name || user?.username || "Student";

  useEffect(() => {
    const initTestSeries = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const roadmaps = await testSeriesOverallService.getRoadmap();

        if (roadmaps.plans && roadmaps.plans.length > 0) {
          // Select the first active plan
          setRoadmap(roadmaps.plans[0]);
          setLoading(false);
        } else {
          // No plan exists. Check if we can auto-generate
          const canAutoGenerate =
            user.exam_type &&
            user.sub_division &&
            user.target_exam_year &&
            user.preferred_language &&
            user.learner_type;

          if (canAutoGenerate) {
            toast.info("Initializing your personalized test series...", { icon: "🚀" });
            await testSeriesOverallService.generatePlan({
              exam_type: user.exam_type!,
              sub_division: user.sub_division!,
              year: Number(user.target_exam_year!),
              language: user.preferred_language === "ta" ? "Tamil" : "English",
              learner_type: user.learner_type || "Student"
            });
            // Fetch roadmap again after generation
            const updatedRoadmaps = await testSeriesOverallService.getRoadmap();
            if (updatedRoadmaps.plans.length > 0) setRoadmap(updatedRoadmaps.plans[0]);
          } else {
            // Missing details, show modal
            setIsModalOpen(true);
          }
        }
      } catch (error) {
        console.error("Test series initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initTestSeries();
  }, [user]);

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
  const mappedTestSets: TestSet[] = roadmap?.roadmap.map((test) => ({
    id: test.series_no.toString(),
    planId: roadmap.overall_plan_id,
    name: `Test Set ${test.series_no}`,
    duration: `${roadmap.test_details.duration_hours * 60} m`,
    questions: roadmap.test_details.total_questions,
    difficulty: test.series_no % 3 === 0 ? "Hard" : test.series_no % 2 === 0 ? "Moderate" : "Easy",
    syllabus: test.syllabus ? test.syllabus.map((s: any) => s.part) : ["Full Syllabus"],
    syllabus_detailed: test.syllabus,
    score: test.obtained_marks !== null ? {
      obtained: test.obtained_marks,
      total: test.total_marks || roadmap.test_details.total_marks
    } : undefined,
    status: test.status,
    planned_date: test.test_date
  })) || [];

  return (
    <DashboardLayout
      hideHeader={isDesktop}
      rightSidebar={<TestSeriesSidebar user={user} />}
    >
      <div className="px-1 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-slate-900">Test Series</h1>
          <p className="text-[12px] sm:text-sm text-slate-500 mt-1 font-medium">
            {roadmap ? `${roadmap.exam_type} – ${roadmap.sub_division} | ${roadmap.year}` : "Choose your path to success"}
          </p>
        </div>
        {!loading && (
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 gap-2 h-9 px-4 text-xs font-medium"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading your test series...</p>
        </div>
      ) : activeTab === "subject" ? (
        <SubjectWiseView subjects={testSubjects} />
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
