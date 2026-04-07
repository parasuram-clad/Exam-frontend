import { useState, useRef, useEffect, useMemo } from "react";
import authService from "@/services/auth.service";
import studyService, { TopicTiming, RoadmapResponse } from "@/services/study.service";
import { toast } from "sonner";
import { useNavigate, useBlocker, useSearchParams } from "react-router-dom";
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
import { format } from "date-fns";
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
  getSubjectIconFallback,
  dayCycleRotation,
  mapRoadmapToFrontend
} from "@/components/dashboard/study-plan";
import { useAuth } from "@/context/AuthContext";

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
  const [searchParams] = useSearchParams();
  const urlPlanId = searchParams.get('plan_id');
  const { user, currentContext, currentContextId, setCurrentContextId } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Combined Roadmap and Progress data - we no longer need a separate user-plans fetch
  const { data: roadmapData, isLoading: roadmapLoading } = useQuery<RoadmapResponse>({
    queryKey: ['roadmap', user?.id, currentContext?.plan_id],
    queryFn: () => studyService.getUserRoadmap(user!.id, currentContext!.plan_id),
    enabled: !!user?.id && !!currentContext?.plan_id,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const [viewMode, setViewMode] = useState<'overall' | 'subject'>('overall');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const prevSelectedSubject = useRef<string | null>(null);
  const prevViewMode = useRef<'overall' | 'subject'>('overall');
  const prevCurrentProgressDay = useRef<number>(1);

  const currentPlan = useMemo(() => {
    const result = (viewMode === 'overall')
      ? roadmapData?.plan?.find(p => p.plan_type === 'OVERALL')
      : (roadmapData?.plan?.find(p => p.plan_type === 'SUBJECT' && (p.subject_name === selectedSubject || p.label === selectedSubject)) || (function () {
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
      })());
    return result;
  }, [roadmapData, viewMode, selectedSubject]);

  const { data: weeklyHistoryData } = useQuery({
    queryKey: ['weekly-history', user?.id, currentPlan?.plan_id],
    queryFn: () => studyService.getWeeklyTestHistory(user!.id, currentPlan?.plan_id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: monthlyHistoryData } = useQuery({
    queryKey: ['monthly-history', user?.id, currentPlan?.plan_id],
    queryFn: () => studyService.getMonthlyTestHistory(user!.id, currentPlan?.plan_id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: topicTimings = [] } = useQuery({
    queryKey: ['topic-timings', user?.id, currentPlan?.plan_id],
    queryFn: () => studyService.getUserTopicTimings(undefined, currentPlan?.plan_id),
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
    queryKey: ['dashboard', user?.id, currentContext?.plan_id],
    queryFn: () => studyService.getDashboardData(user!.id, currentContext?.plan_id),
    enabled: !!user?.id && !!currentContext?.plan_id,
    staleTime: 5 * 60 * 1000,
  });

  const features = dashboardData?.context?.features;

  const loading = roadmapLoading || dashboardLoading;

  const [dynamicDayWisePlans, setDynamicDayWisePlans] = useState<Record<number, StudyTopicCardData[]>>({});
  const [selectedTopic, setSelectedTopic] = useState<StudyTopicCardData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [setupData, setSetupData] = useState({
    name: user?.full_name || "",
    medium: user?.preferred_language === 'ta' ? 'tamil' : 'english',
    examType: user?.exam_type || "TNPSC",
    subDivision: user?.sub_division ? user.sub_division.split(", ") : ["Group IV"] as string[],
    learnerType: user?.learner_type || "Student",
    studyGoal: "4 Hours",
    targetYear: user?.target_exam_year?.toString() || new Date().getFullYear().toString()
  });

  useEffect(() => {
    if (user) {
      setSetupData(prev => ({
        ...prev,
        name: user.full_name || prev.name,
        medium: user.preferred_language === 'ta' ? 'tamil' : 'english',
        examType: user.exam_type || prev.examType,
        subDivision: user.sub_division ? user.sub_division.split(", ") : prev.subDivision,
        learnerType: user.learner_type || prev.learnerType,
        targetYear: user.target_exam_year?.toString() || prev.targetYear || new Date().getFullYear().toString()
      }));
    }
  }, [user]);

  useEffect(() => {
    if (currentContext && !selectedTopic) {
      if (currentContext.plan_type === 'OVERALL') {
        setViewMode('overall');
        setSelectedSubject(null);
      } else if (currentContext.plan_type === 'SUBJECT') {
        setViewMode('subject');
        setSelectedSubject(currentContext.subject_name || currentContext.label);
      }
    }
  }, [currentContext?.context_id, selectedTopic]);

  useEffect(() => {
    if (selectedSubject) {
      const subjectCtx = user?.dashboard?.contexts?.find(c => c.plan_type === 'SUBJECT' && c.subject_name === selectedSubject);
      if (subjectCtx && currentContextId !== subjectCtx.context_id) {
        setCurrentContextId(subjectCtx.context_id);
      }
    }
  }, [selectedSubject, user, currentContextId]);

  useEffect(() => {
    if (urlPlanId && user?.dashboard?.contexts) {
      const targetPlanIdNum = parseInt(urlPlanId);
      const matchingContext = user.dashboard.contexts.find(ctx => ctx.plan_id === targetPlanIdNum);
      if (matchingContext && matchingContext.context_id !== currentContextId) {
        setCurrentContextId(matchingContext.context_id);
      }
    }
  }, [urlPlanId, user?.dashboard?.contexts, currentContextId, setCurrentContextId]);

  useEffect(() => {
    if (!loading && user && roadmapData) {
      const hasPlan = roadmapData.plan && roadmapData.plan.length > 0;
      if (!hasPlan && !isGenerating) {
        setIsSetupModalOpen(true);
      }
    }
  }, [loading, roadmapData, user, isGenerating]);

  const hasOverallPlanData = useMemo(() => {
    if (roadmapData?.access?.overall_plans && roadmapData.access.overall_plans.length > 0) return true;
    return !!roadmapData?.plan?.find(p => p.plan_type === 'OVERALL');
  }, [roadmapData]);

  const hasSubjectPlanData = useMemo(() => {
    if (roadmapData?.access?.subject_plans && roadmapData.access.subject_plans.length > 0) return true;
    return !!roadmapData?.plan?.find(p => p.plan_type === 'SUBJECT');
  }, [roadmapData]);

  const showPlanToggle = hasOverallPlanData && hasSubjectPlanData;

  useEffect(() => {
    if (hasOverallPlanData && !hasSubjectPlanData) {
      setViewMode('overall');
    } else if (!hasOverallPlanData && hasSubjectPlanData) {
      setViewMode('subject');
    }
  }, [hasOverallPlanData, hasSubjectPlanData]);

  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  const calculateCurrentProgressDay = (dayWisePlans: Record<number, StudyTopicCardData[]>, totalDays: number) => {
    const days = Object.keys(dayWisePlans).map(Number).sort((a, b) => a - b);
    if (days.length > 0) {
      for (const day of days) {
        const topics = dayWisePlans[day];
        if (topics && !topics.every(t => t.status === 'completed')) return day;
      }
      return totalDays + 1;
    }
    return 1;
  };

  const overallPlanDate = useMemo(() => {
    const p = roadmapData?.plan?.find(plan => plan.plan_type === 'OVERALL');
    if (p && p.days && p.days.length > 0) return p.days[p.days.length - 1].date;
    return undefined;
  }, [roadmapData]);

  useEffect(() => {
    if (roadmapData && !hasOverallPlanData && hasSubjectPlanData && viewMode === 'overall') {
      setViewMode('subject');
    }
  }, [roadmapData, hasOverallPlanData, hasSubjectPlanData, viewMode]);

  useEffect(() => {
    if (roadmapData?.plan) {
      const wHistory = weeklyHistoryData?.history || [];
      const mHistory = monthlyHistoryData?.history || [];
      const relevantDays = currentPlan?.days || [];
      const totalRoadmapDays = currentPlan?.total_days || (relevantDays.length > 0 ? Math.max(...relevantDays.map(d => d.day)) : 120);

      if (relevantDays.length > 0) {
        const mappedPlans = mapRoadmapToFrontend(relevantDays, [], topicTimings, wHistory, mHistory);
        setDynamicDayWisePlans(mappedPlans);
        const currentDay = calculateCurrentProgressDay(mappedPlans, totalRoadmapDays);
        
        // Always update activeDay if context changed
        if (selectedSubject !== prevSelectedSubject.current || viewMode !== prevViewMode.current) {
          setActiveDay(currentDay);
          prevSelectedSubject.current = selectedSubject;
          prevViewMode.current = viewMode;
        } else {
          // If we are on the currentProgressDay and it just completed, move to next!
          const prevDay = prevCurrentProgressDay.current;
          if (currentDay > prevDay && activeDay === prevDay) {
            setActiveDay(currentDay);
          }
        }
        prevCurrentProgressDay.current = currentDay;
      } else {
        setDynamicDayWisePlans({});
      }
    }
  }, [roadmapData, topicTimings, weeklyHistoryData, monthlyHistoryData, viewMode, selectedSubject, currentPlan]);

  const totalDays = useMemo(() => currentPlan?.total_days || (currentPlan?.days && currentPlan.days.length > 0 ? Math.max(...currentPlan.days.map(d => d.day)) : 120), [currentPlan]);
  const currentProgressDay = useMemo(() => calculateCurrentProgressDay(dynamicDayWisePlans, totalDays), [dynamicDayWisePlans, totalDays]);

  const overallProgress = useMemo(() => {
    if (!totalDays || totalDays === 0) return 0;
    const timingMap: Record<number, number> = {};
    const now = new Date();
    const statusMap: Record<number, boolean> = {};
    if (currentPlan) {
      currentPlan.days.forEach(d => {
        d.items.forEach(item => {
          if (item.type === 'TOPIC' && item.topic) {
            item.topic.forEach((t: any) => { if (t.is_completed || t.plan_status === 'COMPLETED') statusMap[t.id] = true; });
          } else if (item.is_completed || item.plan_status === 'COMPLETED') {
            statusMap[item.identifier || item.title || 0] = true;
          }
        });
      });
    }

    topicTimings.forEach((tValue: TopicTiming) => {
      if (currentPlan?.plan_id && tValue.plan_id !== currentPlan.plan_id) return;
      let m = Number(tValue.total_estimate || 0);
      if (!tValue.end_time && tValue.start_time && !statusMap[tValue.syllabus_id]) {
        const startTimeStr = tValue.start_time.endsWith('Z') ? tValue.start_time : `${tValue.start_time}Z`;
        const start = new Date(startTimeStr);
        if (!isNaN(start.getTime())) m += Math.max(0, Math.round((now.getTime() - start.getTime()) / (1000 * 60)));
      }
      timingMap[tValue.syllabus_id] = (timingMap[tValue.syllabus_id] || 0) + m;
    });

    const completedFullDays = Math.max(0, currentProgressDay - 1);
    let currentDayFraction = 0;
    if (currentProgressDay <= totalDays) {
      const todayCards = dynamicDayWisePlans[currentProgressDay] || [];
      const allSubtopics: { syllabusId: number; minutes: number; isCompleted: boolean }[] = [];
      todayCards.forEach(card => {
        if (card.subtopics) {
          card.subtopics.forEach(st => {
            const sid = parseInt(st.id, 10);
            if (!isNaN(sid)) allSubtopics.push({ syllabusId: sid, minutes: st.totalTime || 45, isCompleted: st.status === 'completed' });
          });
        }
      });
      if (allSubtopics.length > 0) {
        let topicProgressSum = 0;
        allSubtopics.forEach(st => {
          if (st.isCompleted) topicProgressSum += 100;
          else topicProgressSum += Math.min(90, ((timingMap[st.syllabusId] || 0) / (st.minutes || 45)) * 100);
        });
        currentDayFraction = (topicProgressSum / allSubtopics.length) / 100;
      }
    }
    return Math.min(100, Math.round(((completedFullDays + currentDayFraction) / totalDays) * 100));
  }, [currentProgressDay, totalDays, dynamicDayWisePlans, topicTimings, roadmapData]);

  const daysLeft = Math.max(0, totalDays - currentProgressDay + 1);
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
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
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
    if (planDateStr && planDateStr > todayStr && dayNo > currentProgressDay && status !== 'completed') status = 'locked';
    return { day: dayNo, status, label: (testItem ? (testItem.title || "Assessment") : revisionItem ? (revisionItem.title || "Revision") : `Day ${dayNo}`).replace('_', ' '), date: planDateStr, isAssessment: !!testItem, isRevision: !!revisionItem };
  });

  const sortedAvailableSubjects = useMemo(() => {
    if (roadmapData?.access?.subject_plans && Array.isArray(roadmapData.access.subject_plans)) {
      const fromMetadata = roadmapData.access.subject_plans.map((p: any) => p.subject_name).filter(Boolean).sort() as string[];
      if (fromMetadata.length > 0) return fromMetadata;
    }
    const fromPlans = Array.from(new Set(roadmapData?.plan?.filter(p => p.plan_type === 'SUBJECT' && (p.subject_name || p.label)).map(p => (p.subject_name || p.label)!))).sort();
    if (fromPlans.length > 0) return fromPlans;
    const overall = roadmapData?.plan?.find(p => p.plan_type === 'OVERALL');
    if (overall?.days) {
      const fromOverall = new Set<string>();
      overall.days.forEach(d => d.items.forEach((it: any) => { if (it.type === 'TOPIC' && it.subject) fromOverall.add(it.subject); }));
      return Array.from(fromOverall).sort();
    }
    return [];
  }, [roadmapData]);

  const hasDynamicData = Object.keys(dynamicDayWisePlans).length > 0;
  const currentStudyTopics = (hasDynamicData ? (dynamicDayWisePlans[activeDay] || []) : (dayCycleRotation[activeDay] || dayCycleRotation[activeDay % 7] || []))
    .filter(tValue => {
      if (viewMode === 'subject' && currentPlan?.plan_type === 'SUBJECT' && (!currentPlan.isVirtual)) return true;
      if (selectedSubject) {
        const title = (tValue.title || "").toLowerCase();
        const sel = selectedSubject.toLowerCase();
        return title === sel || sel.includes(title) || title.includes(sel) || tValue.type === 'TEST' || tValue.type === 'REVISION';
      }
      return true;
    });

  const handleDayClick = (day: DayCycleItem) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isFuture = day.date && day.date > todayStr;
    const prevAssessmentDay = Math.floor((day.day - 1) / 7) * 7;
    const prevDayItems = currentPlan?.days?.find((d: any) => d.day === prevAssessmentDay)?.items || [];
    const assessmentItems = prevDayItems.filter((it: any) => it.type === 'TEST');
    const isPrevAssessmentMissing = assessmentItems.length > 0 && !assessmentItems.every((it: any) => it.is_completed === true);

    if (isFuture && day.day > currentProgressDay) toast.warning(`Day ${day.day} is scheduled for future.`);
    else if (isPrevAssessmentMissing) toast.warning(`Please complete Assessment on Day ${prevAssessmentDay}.`);
    setActiveDay(day.day);
    if (dynamicDayWisePlans[day.day] && user?.id) dynamicDayWisePlans[day.day].forEach(topic => topic.subtopics.forEach(st => prefetchTopic(queryClient, st.id, user.id)));
  };

  const handleGeneratePlan = async () => {
    if (!user) return;
    try {
      setIsGenerating(true);
      const hours = parseInt(setupData.studyGoal.replace(/[^0-9]/g, '')) || 4;
      await authService.updateProfile(user.id, { full_name: setupData.name, exam_type: setupData.examType, sub_division: setupData.subDivision.join(", "), target_exam_year: parseInt(setupData.targetYear), learner_type: setupData.learnerType, preferred_language: setupData.medium === 'tamil' ? 'ta' : 'en' });
      await studyService.generateStudyPlan({ user_id: user.id, exam_type: setupData.examType, sub_division: setupData.subDivision.join(", "), year: parseInt(setupData.targetYear), learner_type: setupData.learnerType, daily_study_hours: hours, language: setupData.medium === 'tamil' ? 'Tamil' : 'English' });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['roadmap', user.id] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', user.id] }),
      ]);
      setActiveDay(1);
      toast.success("Study plan generated successfully!");
      setIsSetupModalOpen(false);
    } catch { toast.error("Failed to generate plan."); } finally { setIsGenerating(false); }
  };

  const handleSubtopicClick = async (topicId: string, subtopicId: string) => {
    if (selectedTopic?.subtopics) {
      const subtopic = selectedTopic.subtopics.find(st => st.id === subtopicId);
      if (subtopic?.isTest) {
        const type = subtopic.testType || 'WEEKLY';
        const pType = currentPlan?.plan_type || 'OVERALL';
        const wNo = subtopic.weekNo || Math.ceil(activeDay / 7);
        const mNo = subtopic.monthNo || Math.ceil(activeDay / 30);
        const planParam = currentPlan?.plan_id ? `&plan_id=${currentPlan.plan_id}` : '';

        if (subtopic.status === 'completed') {
          if (type === 'MONTHLY') navigate(`/test-series/${pType === 'SUBJECT' ? 'subject-monthly' : 'monthly'}/test/${mNo}/analytics?month=${mNo}${planParam}`);
          else navigate(`/test-series/${pType === 'SUBJECT' ? 'subject-weekly' : 'weekly'}/test/${wNo}/analytics?week=${wNo}${planParam}`);
          setIsDialogOpen(false);
          return;
        }

        // Navigate to standalone TestAttempt page
        const testRouteSegment = pType === 'SUBJECT'
          ? (type === 'MONTHLY' ? 'subject-monthly' : 'subject-weekly')
          : (type === 'MONTHLY' ? 'monthly' : 'weekly');

        const testIdValue = type === 'MONTHLY' ? mNo : wNo;
        navigate(`/test-series/${testRouteSegment}/test/${testIdValue}?${planParam.slice(1)}`);
        setIsDialogOpen(false);
        return;
      }
      if (subtopic?.planRowId && (subtopic.status === 'start' || !subtopic.status)) {
        try {
          setIsFetchingQuestions(true);
          await studyService.updateStudyPlan(subtopic.planRowId, { plan_status: 'IN_PROGRESS' });
          queryClient.invalidateQueries({ queryKey: ['roadmap', user?.id] });
        } catch (err) { console.error('Failed to update plan status:', err); } finally { setIsFetchingQuestions(false); }
      }
      const query = currentPlan?.plan_id ? `?plan_id=${currentPlan.plan_id}${subtopic?.planRowId ? `&plan_row_id=${subtopic.planRowId}` : ''}` : '';
      setIsDialogOpen(false);
      navigate(`/study-plan/topic/${topicId}/subtopic/${subtopicId}${query}`);
    }
  };

  const bannerProgress = overallProgress;
  const bannerDay = Math.min(currentProgressDay, totalDays || 1);
  const bannerLabel = (viewMode === 'subject' && selectedSubject) ? `${selectedSubject} Progress` : "Overall Progress";
  const avatarUrl = getMediaUrl(user?.photo_url, pic);

  if (loading || isGenerating) return <DashboardLayout hideHeader={isDesktop} rightSidebar={() => <div className="space-y-6"><Skeleton className="h-[300px] w-full rounded-2xl" /></div>}><div className="space-y-8 pb-10 pt-4"><Skeleton className="h-[200px] w-full rounded-2xl" /></div></DashboardLayout>;

  return (
    <DashboardLayout
      hideHeader={isDesktop}
      rightSidebar={() => (
        <StudyPlanRightSidebar
          user={user} avatarUrl={avatarUrl} initials={(user?.full_name || "A").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
          onDateClick={(date) => { const ds = format(date, 'yyyy-MM-dd'); const dm = currentPlan?.days?.find(d => d.date === ds); if (dm) setActiveDay(dm.day); }}
          selectedDate={currentPlan?.days?.find(d => d.day === activeDay)?.date ? new Date(currentPlan.days.find(d => d.day === activeDay)!.date) : new Date()}
          planDays={dynamicDayCycle} notes={allNotes} areasToImprove={dashboardData?.areas_to_improve?.areas || []} features={features}
          examDate={features?.exam_calendar ? dashboardData?.exam_calendar?.exam_date : undefined}
        />
      )}
    >
      <div className="px-1 mb-2">
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-end gap-1">
          <div>
            <div className="flex items-center gap-2">{(selectedTopic || selectedSubject) && (<button onClick={() => { setSelectedTopic(null); setSelectedSubject(null); }} className="p-1 hover:bg-muted rounded-full mr-1"><ArrowLeft className="w-4 h-4" /></button>)}<h1 className="text-xl sm:text-2xl font-medium">{selectedSubject ? selectedSubject : (currentPlan?.label || "Study Plan")}</h1></div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{selectedSubject ? (currentPlan?.plan_type === 'SUBJECT' ? "Roadmap" : "Filtered") : `${user?.exam_type || "TNPSC"} – ${user?.sub_division || "Group IV"}`}</p>
          </div>
          {showPlanToggle && (
            <div className="flex bg-muted/30 p-1 rounded-xl sm:ml-auto shadow-inner">
              <button
                onClick={() => {
                  setViewMode('overall'); setSelectedSubject(null);
                  const ctx = user?.dashboard?.contexts?.find(c => c.plan_type === 'OVERALL');
                  if (ctx && currentContextId !== ctx.context_id) setCurrentContextId(ctx.context_id);
                }}
                className={cn("px-6 py-2 text-xs font-semibold rounded-lg transition-all duration-300", viewMode === 'overall' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >Overall</button>
              <button
                onClick={() => { setViewMode('subject'); setSelectedSubject(null); }}
                className={cn("px-6 py-2 text-xs font-semibold rounded-lg transition-all duration-300", viewMode === 'subject' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >Subject-Wise</button>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-10 pt-4" >

        <motion.div variants={itemVariants}>
          <StudyBannerCountdown
            daysLeft={daysLeft}
            examEndDate={dashboardData?.exam_calendar?.exam_date || overallPlanDate}
            user={user}
            overallProgress={bannerProgress}
            currentProgressDay={bannerDay}
            progressLabel={bannerLabel}
            hideProgressBar={viewMode === 'subject' && !selectedSubject}
          />
        </motion.div>

        {(!roadmapData?.plan || roadmapData.plan.length === 0) ? (
          <motion.div variants={itemVariants} className="w-full bg-card rounded-2xl p-12 border border-dashed flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-6 bg-primary/10 rounded-full"><BookOpen className="w-12 h-12 text-primary" /></div>
            <h3 className="text-xl font-semibold">No Plan Generated</h3>
            <Button onClick={() => setIsSetupModalOpen(true)} disabled={isGenerating} className="rounded-full px-10 h-12 bg-[#1a2b4b]">{isGenerating ? (<span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Generating...</span>) : "Set Up Plan"}</Button>
          </motion.div>
        ) : viewMode === 'subject' && !selectedSubject ? (
          <motion.section variants={itemVariants}><h2 className="text-lg font-medium mb-5">Select a Subject</h2><SubjectPlanView subjects={sortedAvailableSubjects || []} onSelectSubject={(s) => { setViewMode('subject'); setSelectedSubject(s); if (user?.dashboard?.contexts) { const ctx = user.dashboard.contexts.find(c => c.plan_type === 'SUBJECT' && (c.subject_name === s || c.label === s)); if (ctx && ctx.context_id !== currentContextId) setCurrentContextId(ctx.context_id); } }} roadmapData={roadmapData} topicTimings={topicTimings} /></motion.section>
        ) : (
          <>
            <StudyDayCycleNavigation totalDays={totalDays || 1} dynamicDayCycle={dynamicDayCycle || []} activeDay={activeDay} showLeftArrow={showLeftArrow} showRightArrow={showRightArrow} scrollContainerRef={scrollContainerRef} handleScroll={handleScroll} scroll={scroll} handleDayClick={handleDayClick} />
            <motion.section variants={itemVariants}>
              <h2 className="text-lg font-medium mb-5">{selectedSubject ? `${currentPlan?.label} - Day ${activeDay}` : "Today's Study Plan"}</h2>
              <AnimatePresence mode="wait"><motion.div key={activeDay} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{currentStudyTopics.length === 0 ? (<div className="col-span-full py-16 text-center border rounded-2xl">No Schedule</div>) : (currentStudyTopics.map((topic, index) => (<StudyTopicCard key={topic.id} topic={topic} index={index} activeDay={activeDay} currentProgressDay={currentProgressDay} roadmapData={currentPlan} user={user} handleViewDetails={(t) => { setSelectedTopic(t); setIsDialogOpen(true); }} prefetchTopic={prefetchTopic} queryClient={queryClient} />)))}</motion.div></AnimatePresence>
            </motion.section>
          </>
        )}
      </motion.div>
      <StudyTopicDetailDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} selectedTopic={selectedTopic} topicTimings={topicTimings} user={user} onSubtopicClick={handleSubtopicClick} getSubjectIconFallback={getSubjectIconFallback} isFetching={isFetchingQuestions} />
      <StudySetupModal isOpen={isSetupModalOpen} onOpenChange={setIsSetupModalOpen} isGenerating={isGenerating} setupData={setupData} setSetupData={setSetupData} onGenerate={handleGeneratePlan} />
    </DashboardLayout>
  );
};

export default StudyPlan;
