import { useState, useRef, useEffect, useMemo } from "react";
import authService from "@/services/auth.service";
import studyService, { StudyPlanResponse, TopicTiming, RoadmapResponse } from "@/services/study.service";
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

import { cn, getErrorMessage, getMediaUrl } from "@/lib/utils";
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

  const { data: roadmapData, isLoading: roadmapLoading } = useQuery<RoadmapResponse>({
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
  const prevSelectedSubject = useRef<string | null>(null);
  const prevViewMode = useRef<'overall' | 'subject'>('overall');

  useEffect(() => {
    console.log('StudyPlan State Update:', {
      viewMode,
      selectedSubject,
      activeDay,
      userId: user?.id,
      hasRoadmapData: !!roadmapData,
      roadmapAccess: roadmapData?.access,
      plansCount: userPlans.length
    });
  }, [viewMode, selectedSubject, activeDay, roadmapData, userPlans, user]);

  // Show tab toggle whenever BOTH plan types have data available (regardless of subscription)
  const hasOverallPlanData = useMemo(() => {
    if (roadmapData?.access?.overall_plans && roadmapData.access.overall_plans.length > 0) return true;
    return !!roadmapData?.plan?.find(p => p.plan_type === 'OVERALL');
  }, [roadmapData]);

  const hasSubjectPlanData = useMemo(() => {
    if (roadmapData?.access?.subject_plans && roadmapData.access.subject_plans.length > 0) return true;
    return !!roadmapData?.plan?.find(p => p.plan_type === 'SUBJECT');
  }, [roadmapData]);

  // Show the tab switch as long as both plan types exist — subscribed or not
  const showPlanToggle = hasOverallPlanData && hasSubjectPlanData;

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

  const calculateCurrentProgressDay = (dayWisePlans: Record<number, StudyTopicCardData[]>, totalDays: number) => {
    const days = Object.keys(dayWisePlans).map(Number).sort((a, b) => a - b);
    if (days.length > 0) {
      for (const day of days) {
        const topics = dayWisePlans[day];
        if (!topics.every(t => t.status === 'completed')) {
          return day;
        }
      }
      return days[days.length - 1] < totalDays ? days[days.length - 1] + 1 : totalDays;
    }
    return 1;
  };

  const overallPlanDate = useMemo(() => {
    const p = roadmapData?.plan?.find(plan => plan.plan_type === 'OVERALL');
    if (p && p.days && p.days.length > 0) {
      return p.days[p.days.length - 1].date;
    }
    return undefined;
  }, [roadmapData]);

  const currentPlan = useMemo(() => {
    const result = (viewMode === 'overall')
      ? roadmapData?.plan?.find(p => p.plan_type === 'OVERALL')
      : roadmapData?.plan?.find(p => p.plan_type === 'SUBJECT' && p.subject_name === selectedSubject) || (function () {
        const overallPlan = roadmapData?.plan?.find(p => p.plan_type === 'OVERALL');
        if (overallPlan && selectedSubject) {
          const filteredDays = overallPlan.days.filter(d =>
            d.items.some(item => item.type === 'TOPIC' && item.subject === selectedSubject)
          );
          return {
            ...overallPlan,
            plan_type: 'SUBJECT' as const,
            subject_name: selectedSubject,
            label: selectedSubject,
            total_days: filteredDays.length,
            days: filteredDays,
            isVirtual: true
          };
        }
        return undefined;
      })();
    return result;
  }, [roadmapData, viewMode, selectedSubject]);

  useEffect(() => {
    // Auto-switch to subject view if overall plan is not available
    if (roadmapData && !hasOverallPlanData && hasSubjectPlanData && viewMode === 'overall') {
      setViewMode('subject');
    }
  }, [roadmapData, hasOverallPlanData, hasSubjectPlanData, viewMode]);

  useEffect(() => {
    console.log("roadmapData", roadmapData);
    console.log("userPlans", userPlans);
    if (roadmapData?.plan && userPlans) {
      console.log('Processing Roadmap Data...', {
        viewMode,
        selectedSubject,
        currentPlanLabel: currentPlan?.label,
        currentPlanDays: currentPlan?.days?.length
      });

      const wHistory = weeklyHistoryData?.history || [];
      const mHistory = monthlyHistoryData?.history || [];
      const relevantDays = currentPlan?.days || [];
      const totalRoadmapDays = currentPlan?.total_days || (relevantDays.length > 0 ? Math.max(...relevantDays.map(d => d.day)) : 120);

      if (relevantDays.length > 0) {
        const mappedPlans = mapRoadmapToFrontend(relevantDays, userPlans, topicTimings, wHistory, mHistory);
        console.log('Mapped Plans successfully:', Object.keys(mappedPlans).length, 'days');
        setDynamicDayWisePlans(mappedPlans);
        const currentDay = calculateCurrentProgressDay(mappedPlans, totalRoadmapDays);

        if (selectedSubject !== prevSelectedSubject.current || viewMode !== prevViewMode.current) {
          console.log('Resetting activeDay to:', currentDay);
          setActiveDay(currentDay);
          prevSelectedSubject.current = selectedSubject;
          prevViewMode.current = viewMode;
        } else if (activeDay > totalRoadmapDays) {
          setActiveDay(1);
        }
      } else {
        console.warn('No relevant days found for current plan');
        setDynamicDayWisePlans({});
      }
    }
  }, [roadmapData, userPlans, topicTimings, weeklyHistoryData, monthlyHistoryData, viewMode, selectedSubject, currentPlan]);

  const totalDays = currentPlan?.total_days || (currentPlan?.days && currentPlan.days.length > 0 ? Math.max(...currentPlan.days.map(d => d.day)) : 120);
  const currentProgressDay = calculateCurrentProgressDay(dynamicDayWisePlans, totalDays);
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
    const roadmapDay = currentPlan?.days?.find(d => d.day === dayNo);
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

  const sortedAvailableSubjects = useMemo(() => {
    console.log('Deriving subjects from roadmapData:', {
      hasAccess: !!roadmapData?.access,
      subjectPlansLength: roadmapData?.access?.subject_plans?.length,
      planLength: roadmapData?.plan?.length
    });

    // 1. Try to get subjects from the access metadata
    if (roadmapData?.access?.subject_plans && Array.isArray(roadmapData.access.subject_plans)) {
      const subjectsFromMetadata = roadmapData.access.subject_plans
        .map((p: any) => p.subject_name)
        .filter(Boolean)
        .sort() as string[];

      console.log('Derived subjects from metadata:', subjectsFromMetadata);
      if (subjectsFromMetadata.length > 0) return subjectsFromMetadata;
    }

    // 2. Fallback: Get subjects from dedicated SUBJECT plans in the data array
    if (roadmapData?.plan && Array.isArray(roadmapData.plan)) {
      const subjectsFromPlanItems = Array.from(new Set(
        roadmapData.plan
          .filter(p => p.plan_type === 'SUBJECT' && (p.subject_name || p.label))
          .map(p => (p.subject_name || p.label)!)
      )).sort();

      console.log('Derived subjects from plan array fallback:', subjectsFromPlanItems);
      return subjectsFromPlanItems;
    }

    console.warn('Could not derive any subjects from roadmapData');
    return [];
  }, [roadmapData]);

  const hasDynamicData = Object.keys(dynamicDayWisePlans).length > 0;

  const currentStudyTopics = (hasDynamicData
    ? (dynamicDayWisePlans[activeDay] || [])
    : (dayCycleRotation[activeDay] || dayCycleRotation[activeDay % 7] || []))
    .filter(t => {
      // If we're in a dedicated SUBJECT plan, show everything (it includes subject-specific tests/revisions)
      if (viewMode === 'subject' && currentPlan?.plan_type === 'SUBJECT' && (!currentPlan.isVirtual)) {
        return true;
      }
      // If we're in fallback mode or overall, filter by chosen subject
      if (selectedSubject) {
        // Show the specific subject topics, and all tests/revisions for the day
        return t.title === selectedSubject || t.type === 'TEST' || t.type === 'REVISION';
      }
      return true;
    });

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
  const avatarUrl = getMediaUrl(user?.photo_url, pic);

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
            const dayMatch = currentPlan?.days?.find(d => d.date === dateStr);
            if (dayMatch) setActiveDay(dayMatch.day);
          }}
          selectedDate={currentPlan?.days?.find(d => d.day === activeDay)?.date ? new Date(currentPlan.days.find(d => d.day === activeDay)!.date) : new Date()}
          planDays={dynamicDayCycle} notes={allNotes} areasToImprove={dashboardData?.areas_to_improve?.areas || []}
        />
      )}
    >
      <div className="px-1 mb-2">
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-end gap-1">
          <div>
            <div className="flex items-center gap-2">
              {(selectedTopic || (selectedSubject && showPlanToggle) || (selectedSubject && !hasOverallPlanData)) && (
                <button 
                  onClick={() => { 
                    setSelectedTopic(null); 
                    setSelectedSubject(null); 
                  }} 
                  className="p-1 hover:bg-muted rounded-full mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h1 className="text-xl sm:text-2xl font-medium">
                {selectedSubject ? selectedSubject : (currentPlan?.label || "Study Plan")}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {selectedSubject ? (currentPlan?.plan_type === 'SUBJECT' ? "Subject Roadmap" : "Filtered View") : `${user?.exam_type || "TNPSC"} – ${user?.sub_division || "Group IV"}`}
            </p>
          </div>
          {showPlanToggle && (
            <div className="flex bg-muted/30 p-1 rounded-xl sm:ml-auto">
              <button
                onClick={() => { setViewMode('overall'); setSelectedSubject(null); }}
                className={cn("px-4 py-2 text-xs font-medium rounded-lg", viewMode === 'overall' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")}
              >
                Overall Plan
              </button>
              <button
                onClick={() => setViewMode('subject')}
                className={cn("px-4 py-2 text-xs font-medium rounded-lg", viewMode === 'subject' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")}
              >
                Subject Wise
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-10 pt-4" >
        <motion.div variants={itemVariants}>
          <StudyBannerCountdown 
            daysLeft={daysLeft} 
            examEndDate={dashboardData?.exam_calendar?.exam_date || overallPlanDate || (currentPlan?.days && currentPlan.days.length > 0 ? currentPlan.days[currentPlan.days.length - 1].date : undefined)} 
            user={user} 
            overallProgress={overallProgress} 
            currentProgressDay={currentProgressDay} 
          />
        </motion.div>

        {viewMode === 'subject' && !selectedSubject ? (
          <motion.section variants={itemVariants}><h2 className="text-lg font-medium mb-5">Select a Subject</h2><SubjectPlanView subjects={sortedAvailableSubjects || []} onSelectSubject={setSelectedSubject} userPlans={userPlans || []} roadmapData={roadmapData} /></motion.section>
        ) : (
          <>
            <StudyDayCycleNavigation totalDays={totalDays || 1} dynamicDayCycle={dynamicDayCycle || []} activeDay={activeDay} showLeftArrow={showLeftArrow} showRightArrow={showRightArrow} scrollContainerRef={scrollContainerRef} handleScroll={handleScroll} scroll={scroll} handleDayClick={handleDayClick} />
            <motion.section variants={itemVariants}>
              <h2 className="text-lg font-medium mb-5">{selectedSubject ? `${currentPlan?.label} - Day ${activeDay}` : "Today's Study Plan"}</h2>
              <AnimatePresence mode="wait">
                <motion.div key={activeDay} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-cols-[250px] gap-5">
                  {currentStudyTopics.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-card rounded-2xl border border-dashed border-border"><div className="p-4 bg-secondary rounded-full mb-3"><BookOpen className="w-8 h-8 text-muted-foreground" /></div><h3 className="text-base font-medium">No Schedule Today</h3></div>
                  ) : (
                    currentStudyTopics.map((topic, index) => (
                      <StudyTopicCard
                        key={topic.id}
                        topic={topic}
                        index={index}
                        activeDay={activeDay}
                        currentProgressDay={currentProgressDay}
                        roadmapData={currentPlan} // Pass currentPlan instead of roadmapData
                        userPlans={userPlans}
                        user={user}
                        handleViewDetails={(t) => { setSelectedTopic(t); setIsDialogOpen(true); }}
                        prefetchTopic={prefetchTopic}
                        queryClient={queryClient}
                      />
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
