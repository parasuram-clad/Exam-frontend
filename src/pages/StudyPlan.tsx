import { useState, useRef, useEffect } from "react";
import authService from "@/services/auth.service";
import studyService, { StudyPlanResponse, TopicTiming } from "@/services/study.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout";
import { DayCycleItem } from "@/components/dashboard/StudyPlanCalendar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { prefetchTopic } from "@/services/prefetch";
import { Question as TestQuestion } from "@/components/TestEngine";

import { cn, getErrorMessage } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectPlanView } from "@/components/dashboard/SubjectPlanView";
import { startOfDay, format } from "date-fns";
import pic from "@/assets/pic.png";
import { 
  StudySetupModal, 
  StudyTopicDetailDialog, 
  StudyBannerCountdown,
  StudyDayCycleNavigation,
  StudyPlanRightSidebar,
  StudyTopicCard,
  WeeklyTestModal,
  StudyTopicCardData,
  EXAM_SUB_DIVISIONS,
  getSubjectIconFallback,
  dayCycleRotation,
  mapRoadmapToFrontend
} from "@/components/dashboard/study-plan";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/env";

// Local assets only needed for fallback or specific UI if any

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
};

const StudyPlan = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const { user } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: userPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['study-plans', user?.id],
    queryFn: async () => {
      try {
        return await studyService.getUserStudyPlans(user!.id);
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: roadmapData, isLoading: roadmapLoading } = useQuery({
    queryKey: ['roadmap', user?.id],
    queryFn: () => studyService.getUserRoadmap(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: topicTimings = [] } = useQuery({
    queryKey: ['topic-timings', user?.id],
    queryFn: () => studyService.getUserTopicTimings(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allNotes = [] } = useQuery({
    queryKey: ['user-notes', user?.id],
    queryFn: () => studyService.getUserNotes(user!.id),
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000,
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () => studyService.getDashboardData(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: weeklyHistoryData } = useQuery({
    queryKey: ['weekly-history', user?.id],
    queryFn: () => studyService.getWeeklyTestHistory(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: monthlyHistoryData } = useQuery({
    queryKey: ['monthly-history', user?.id],
    queryFn: () => studyService.getMonthlyTestHistory(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const loading = plansLoading || roadmapLoading || dashboardLoading;

  const [dynamicDayWisePlans, setDynamicDayWisePlans] = useState<Record<number, StudyTopicCardData[]>>({});
  const [selectedTopic, setSelectedTopic] = useState<StudyTopicCardData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [setupData, setSetupData] = useState({
    name: "",
    medium: "",
    examType: "TNPSC",
    subDivision: ["Group IV"] as string[],
    learnerType: "Student",
    studyGoal: "4 Hours",
    targetYear: "2026"
  });
  const [viewMode, setViewMode] = useState<'overall' | 'subject'>('overall');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Weekly Test State
  const [isWeeklyTestModalOpen, setIsWeeklyTestModalOpen] = useState(false);
  const [weeklyTestQuestions, setWeeklyTestQuestions] = useState<TestQuestion[]>([]);
  const [currentWeeklyTestId, setCurrentWeeklyTestId] = useState<number | null>(null);
  const [currentWeekNo, setCurrentWeekNo] = useState<number | null>(null);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  const [testStartTime, setTestStartTime] = useState<number | null>(null);

  const weeklyTestSubmitMutation = useMutation({
    mutationFn: (data: any) => studyService.submitWeeklyTest(data),
    onSuccess: () => {
      toast.success("Weekly test submitted successfully!");
      setIsWeeklyTestModalOpen(false);
      navigate(`/test-series/weekly/test/${currentWeeklyTestId}/analytics?week=${currentWeekNo}`);
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to submit weekly test"));
    }
  });

  // Calculate current progress day
  const calculateCurrentProgressDay = (plans: StudyPlanResponse[]) => {
    if (plans.length > 0) {
      const sortedDays = Array.from(new Set(plans.map(p => p.day_no))).sort((a, b) => a - b);
      const firstIncomplete = sortedDays.find(day => {
        const dayPlans = plans.filter(p => p.day_no === day);
        return !dayPlans.every(p => p.plan_status === 'COMPLETED');
      });
      return firstIncomplete || sortedDays[0] || 1;
    }
    return 1;
  };

  useEffect(() => {
    if (roadmapData?.plan && userPlans) {
      const wHistory = weeklyHistoryData?.history || [];
      const mHistory = monthlyHistoryData?.history || [];
      setDynamicDayWisePlans(mapRoadmapToFrontend(roadmapData.plan, userPlans, topicTimings, wHistory, mHistory));
      const currentDay = calculateCurrentProgressDay(userPlans);
      setActiveDay(currentDay);
    }
  }, [roadmapData, userPlans, topicTimings, weeklyHistoryData, monthlyHistoryData]);

  useEffect(() => {
    if (loading || isGenerating) return;
    const hasNoPlan = !userPlans || userPlans.length === 0;
    const isProfileEmpty = !user?.full_name?.trim() || !user?.exam_type?.trim() || !user?.sub_division?.trim() || !user?.target_exam_year || !user?.learner_type?.trim();
    if (isProfileEmpty || hasNoPlan) {
      setIsSetupModalOpen(true);
    } else {
      setIsSetupModalOpen(false);
    }
  }, [loading, isGenerating, user, userPlans]);

  // Pre-fill setup modal
  useEffect(() => {
    if (user) {
      setSetupData(prev => ({
        ...prev,
        name: user.full_name || "",
        medium: user.preferred_language === 'ta' ? 'tamil' : 'english',
        examType: (user.exam_type as any) || "TNPSC",
        subDivision: user.sub_division ? user.sub_division.split(", ") : ["Group IV"],
        targetYear: user.target_exam_year?.toString() || "2026",
        learnerType: user.learner_type || "Student"
      }));
    }
  }, [user]);

  const totalDays = roadmapData?.total_days || (roadmapData?.plan && roadmapData.plan.length > 0 ? Math.max(...roadmapData.plan.map((p: any) => p.day)) : 120);
  const currentProgressDay = calculateCurrentProgressDay(userPlans);
  const daysLeft = Math.max(0, totalDays - currentProgressDay + 1);

  // Navigation Logic
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
    }
  };

  const dynamicDayCycle: DayCycleItem[] = Array.from({ length: totalDays }, (_, i) => {
    const dayNo = i + 1;
    const roadmapDay = roadmapData?.plan?.find((p: any) => p.day === dayNo);
    const planDateStr = roadmapDay?.date;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const testItem = roadmapDay?.items?.find((it: any) => it.type === 'TEST');
    const revisionItem = roadmapDay?.items?.find((it: any) => it.type === 'REVISION');

    let status: DayCycleItem['status'] = 'locked';
    if (dayNo < currentProgressDay) status = 'completed';
    else if (dayNo === currentProgressDay) status = 'current';
    else if (testItem) status = 'assessment';

    if (planDateStr && planDateStr > todayStr && dayNo > currentProgressDay && status !== 'completed') {
      status = 'locked';
    }

    return {
      day: dayNo,
      status,
      label: (testItem ? (testItem.title || "Assessment") : revisionItem ? (revisionItem.title || "Revision") : `Day ${dayNo}`).replace('_', ' '),
      date: planDateStr,
      isAssessment: !!testItem,
      isRevision: !!revisionItem
    };
  });

  const availableSubjects = Array.from(new Set(
    userPlans.length > 0
      ? userPlans.map(p => p.subject)
      : Object.values(dayCycleRotation).flatMap(days => days.map(t => t.title))
  )).sort();

  const currentStudyTopics = (userPlans.length > 0
    ? (dynamicDayWisePlans[activeDay] || [])
    : (dayCycleRotation[activeDay] || dayCycleRotation[activeDay % 7] || []))
    .filter(t => !selectedSubject || t.title === selectedSubject);

  const handleDayClick = (day: DayCycleItem) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isFuture = day.date && day.date > todayStr;
    const previousAssessmentDay = Math.floor((day.day - 1) / 7) * 7;
    let isPrevAssessmentMissing = false;
    if (previousAssessmentDay > 0 && day.day > previousAssessmentDay) {
      const assessmentRows = userPlans.filter(p => p.day_no === previousAssessmentDay);
      isPrevAssessmentMissing = assessmentRows.length > 0 && !assessmentRows.every(p => p.plan_status === 'COMPLETED');
    }

    if (isFuture && day.day > currentProgressDay) {
      toast.warning(`Day ${day.day} is scheduled for ${day.date ? format(new Date(day.date), 'MMM dd, yyyy') : 'the future'}. Topics are locked!`);
    } else if (isPrevAssessmentMissing) {
      toast.warning(`Please complete the Assessment on Day ${previousAssessmentDay} before proceeding to Day ${day.day}. Topics are locked!`);
    }

    setActiveDay(day.day);
    const dayTopics = dynamicDayWisePlans[day.day] || [];
    if (dayTopics.length > 0 && user?.id) {
      dayTopics.forEach(topic => {
        topic.subtopics.forEach(st => prefetchTopic(queryClient, st.id, user.id));
      });
    }
  };

  const handleGeneratePlan = async () => {
    if (!user) return;
    if (!setupData.name.trim() || !setupData.medium || setupData.subDivision.length === 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsGenerating(true);
      setIsSetupModalOpen(false);
      const dailyHours = parseInt(setupData.studyGoal.replace(/[^0-9]/g, '')) || 4;
      await authService.updateProfile(user!.id, {
        full_name: setupData.name,
        exam_type: setupData.examType,
        sub_division: setupData.subDivision.join(", "),
        target_exam_year: parseInt(setupData.targetYear),
        learner_type: setupData.learnerType,
        preferred_language: setupData.medium === 'tamil' ? 'ta' : 'en',
      });

      await studyService.generateStudyPlan({
        user_id: user!.id,
        exam_type: setupData.examType,
        sub_division: setupData.subDivision.join(", "),
        year: parseInt(setupData.targetYear),
        learner_type: setupData.learnerType,
        daily_study_hours: dailyHours,
        language: setupData.medium === 'tamil' ? 'Tamil' : 'English',
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user-me'] }),
        queryClient.invalidateQueries({ queryKey: ['study-plans', user!.id] }),
        queryClient.invalidateQueries({ queryKey: ['roadmap', user!.id] }),
      ]);

      setActiveDay(1);
      toast.success("Study plan generated successfully!");
    } catch (err) {
      toast.error("Failed to generate study plan.");
      setIsSetupModalOpen(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubtopicClick = async (topicId: string, subtopicId: string) => {
    if (selectedTopic?.subtopics) {
      const subtopic = selectedTopic.subtopics.find(st => st.id === subtopicId);
      if (subtopic?.isTest) {
        setIsFetchingQuestions(true);
        try {
          const weekNo = subtopic.weekNo || Math.ceil(activeDay / 7);
          if (subtopic.status === 'completed') {
            navigate(`/test-series/weekly/test/0/analytics?week=${weekNo}`);
            setIsDialogOpen(false);
            return;
          }
          const response = await studyService.getWeeklyTestQuestions(user!.id, weekNo);
          const transformedQuestions: TestQuestion[] = response.questions.map((q: any) => ({
            id: q.mcq_id, question: q.question, options: Object.values(q.options), correctAnswer: 0, category: "Weekly Test", difficulty: "Medium"
          }));
          setWeeklyTestQuestions(transformedQuestions);
          setCurrentWeeklyTestId(response.weekly_test_id);
          setCurrentWeekNo(response.week_no);
          setTestStartTime(Date.now());
          setIsWeeklyTestModalOpen(true);
          setIsDialogOpen(false);
        } catch (error: any) {
          toast.error(getErrorMessage(error, "Failed to fetch test questions"));
        } finally {
          setIsFetchingQuestions(false);
        }
        return;
      }
    }
    const subIdNum = parseInt(subtopicId);
    if (!isNaN(subIdNum)) {
      const plan = userPlans.find(p => p.id === subIdNum || p.syllabus_id === subIdNum);
      if (plan && plan.plan_status === 'start') {
        try {
          await studyService.updateStudyPlan(plan.id, { plan_status: 'IN_PROGRESS' });
          queryClient.invalidateQueries({ queryKey: ['study-plans', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['roadmap', user?.id] });
        } catch (err) { console.error(err); }
      }
    }
    setIsDialogOpen(false);
    navigate(`/study-plan/topic/${topicId}/subtopic/${subtopicId}`);
  };

  const overallProgress = userPlans.length > 0 ? Math.round((userPlans.filter(p => p.plan_status === 'COMPLETED').length / userPlans.length) * 100) : Math.round(((currentProgressDay - 1) / totalDays) * 100);
  const userName = user?.full_name || user?.username || "Aspirant";
  const initials = userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const avatarUrl = user?.photo_url ? (user.photo_url.startsWith("http") ? user.photo_url : `${BASE_URL}${user.photo_url}`) : pic;

  if (loading || isGenerating) {
    return (
      <DashboardLayout hideHeader={isDesktop} rightSidebar={() => <div className="space-y-6"><Skeleton className="h-[300px] w-full rounded-2xl" /><Skeleton className="h-[200px] w-full rounded-2xl" /></div>}>
        <div className="space-y-8 pb-10 pt-4"><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-[200px] w-full rounded-2xl" /><section className="space-y-4"><div className="flex gap-4">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-14 w-14 rounded-2xl shrink-0" />)}</div></section></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      hideHeader={isDesktop}
      rightSidebar={() => (
        <StudyPlanRightSidebar
          user={user} avatarUrl={avatarUrl} initials={initials} onDateClick={(date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayMatch = roadmapData?.plan?.find((p: any) => p.date === dateStr);
            if (dayMatch) setActiveDay(dayMatch.day);
          }}
          selectedDate={roadmapData?.plan?.find((p: any) => p.day === activeDay)?.date ? new Date(roadmapData.plan.find((p: any) => p.day === activeDay).date) : new Date()}
          planDays={dynamicDayCycle} notes={allNotes} areasToImprove={dashboardData?.areas_to_improve?.areas || []}
        />
      )}
    >
      <div className="px-1 mb-2">
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-end gap-1">
          <div>
            <div className="flex items-center gap-2">
              {(selectedTopic || selectedSubject) && <button onClick={() => { setSelectedTopic(null); setSelectedSubject(null); }} className="p-1 hover:bg-muted rounded-full mr-1"><ArrowLeft className="w-4 h-4" /></button>}
              <h1 className="text-xl sm:text-2xl font-medium">{selectedSubject || "Study Plan"}</h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{selectedSubject ? "Daily Schedule" : `${user?.exam_type || "TNPSC"} – ${user?.sub_division || "Group IV"}`}</p>
          </div>
          <div className="flex bg-muted/30 p-1 rounded-xl sm:ml-auto">
            <button onClick={() => { setViewMode('overall'); setSelectedSubject(null); }} className={cn("px-4 py-2 text-xs font-medium rounded-lg", viewMode === 'overall' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")}>Overall Plan</button>
            <button onClick={() => setViewMode('subject')} className={cn("px-4 py-2 text-xs font-medium rounded-lg", viewMode === 'subject' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")}>Subject Wise</button>
          </div>
        </motion.div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-10 pt-4" >
        <motion.div variants={itemVariants}>
          <StudyBannerCountdown daysLeft={daysLeft} user={user} overallProgress={overallProgress} currentProgressDay={currentProgressDay} />
        </motion.div>

        {viewMode === 'subject' && !selectedSubject ? (
          <motion.section variants={itemVariants}><h2 className="text-lg font-medium mb-5">Select a Subject</h2><SubjectPlanView subjects={availableSubjects} onSelectSubject={setSelectedSubject} userPlans={userPlans} dayWiseStudyPlans={dayCycleRotation} /></motion.section>
        ) : (
          <>
            <StudyDayCycleNavigation totalDays={totalDays} dynamicDayCycle={dynamicDayCycle} activeDay={activeDay} showLeftArrow={showLeftArrow} showRightArrow={showRightArrow} scrollContainerRef={scrollContainerRef} handleScroll={handleScroll} scroll={scroll} handleDayClick={handleDayClick} />
            <motion.section variants={itemVariants}>
              <h2 className="text-lg font-medium mb-5">{selectedSubject ? `${selectedSubject} - Day ${activeDay}` : "Today's Study Plan"}</h2>
              <AnimatePresence mode="wait">
                <motion.div key={activeDay} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {currentStudyTopics.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-card rounded-2xl border border-dashed border-border"><div className="p-4 bg-secondary rounded-full mb-3"><BookOpen className="w-8 h-8 text-muted-foreground" /></div><h3 className="text-base font-medium">No Schedule Today</h3></div>
                  ) : (
                    currentStudyTopics.map((topic, index) => (
                      <StudyTopicCard key={topic.id} topic={topic} index={index} activeDay={activeDay} currentProgressDay={currentProgressDay} roadmapData={roadmapData} userPlans={userPlans} user={user} handleViewDetails={(t) => { setSelectedTopic(t); setIsDialogOpen(true); }} prefetchTopic={prefetchTopic} queryClient={queryClient} />
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.section>
          </>
        )}
      </motion.div>

      <StudyTopicDetailDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} selectedTopic={selectedTopic} topicTimings={topicTimings} user={user} onSubtopicClick={handleSubtopicClick} getSubjectIconFallback={getSubjectIconFallback} />
      <StudySetupModal isOpen={isSetupModalOpen} onOpenChange={setIsSetupModalOpen} isGenerating={isGenerating} setupData={setupData} setSetupData={setSetupData} onGenerate={handleGeneratePlan} />
      <WeeklyTestModal
        isOpen={isWeeklyTestModalOpen}
        onOpenChange={setIsWeeklyTestModalOpen}
        questions={weeklyTestQuestions}
        weekNo={currentWeekNo}
        testId={currentWeeklyTestId}
        testStartTime={testStartTime}
        isSubmitting={weeklyTestSubmitMutation.isPending}
        onSubmit={(answersRecord) => {
          if (!user?.id || !currentWeeklyTestId) return;
          const optionLetters = ['A', 'B', 'C', 'D', 'E'];
          const answers = Object.entries(answersRecord).map(([idx, ans]: [string, any]) => ({
            mcq_id: weeklyTestQuestions[parseInt(idx)].id,
            selected_option: ans.selectedOption !== null ? optionLetters[ans.selectedOption] : ''
          }));
          weeklyTestSubmitMutation.mutate({
            weekly_test_id: currentWeeklyTestId,
            answers,
            started_at: testStartTime ? new Date(testStartTime).toISOString() : new Date().toISOString(),
            submitted_at: new Date().toISOString()
          });
        }}
      />
    </DashboardLayout>
  );
};
export default StudyPlan;