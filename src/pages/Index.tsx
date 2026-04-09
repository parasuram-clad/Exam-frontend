import { cn, getMediaUrl } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout";
import {
  RightSidebarWidgets,
} from "@/components/dashboard";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import authService, { UserMe } from "@/services/auth.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { prefetchAllUserData } from "@/services/prefetch";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/env";
import { Button } from "@/components/ui/button";
import { Bell, ChevronLeft, ChevronRight, Calendar, FileText, Trophy, Loader2 } from "lucide-react";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, User, LogOut, Medal } from "lucide-react";
import pic from "@/assets/pic.png";
import { useMediaQuery } from "@/hooks/use-media-query";
import WelcomeModal from "@/components/auth/WelcomeModal";
import { useSearchParams } from "react-router-dom";
import { StudySetupModal } from "@/components/dashboard/study-plan";
import { toast } from "sonner";

// Dashboard assets
import heroBoy from "@/assets/dashboard/hero-boy.png";
import historyIcon from "@/assets/dashboard/history-icon.png";
import economyIcon from "@/assets/dashboard/economy-icon.png";
import currentAffairsIcon from "@/assets/dashboard/current-affairs-icon.png";
import dailyUpdatesImg from "@/assets/dashboard/daily-updates.png";
import aiTutorImg from "@/assets/dashboard/ai-tutor.png";
import playIcon from "@/assets/dashboard/play.svg";
import qrCode from "@/assets/dashboard/qr.png";
import imgCard2 from "@/assets/dashboard/img-card2.png";
import imgCard1 from "@/assets/dashboard/img-card1.png";
import testBannerImg from "@/assets/test-image.png";
import mockTestGirl from "@/assets/dashboard/mock-test-girl.png";
import studyService, { RoadmapResponse } from "@/services/study.service";
import { mapRoadmapToFrontend } from "@/components/dashboard/study-plan/mapping";
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

interface StudyPlanItem {
  icon: string;
  title: string;
  subtitle: string;
  tag: string;
  progress: number;
  topics: string[];
  buttonLabel: string;
}

const fallbackTodaysPlan: StudyPlanItem[] = [];

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, currentContext } = useAuth();
  const queryClient = useQueryClient();


  const { data: roadmapData, isLoading: isLoadingRoadmap } = useQuery<RoadmapResponse>({
    queryKey: ['roadmap', user?.id, currentContext?.plan_id],
    queryFn: () => studyService.getUserRoadmap(user!.id, currentContext?.plan_id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: topicTimings } = useQuery({
    queryKey: ['topicTimings', user?.id, currentContext?.plan_id],
    queryFn: () => studyService.getUserTopicTimings(undefined, currentContext?.plan_id),
    enabled: !!user?.id,
  });

  const { data: weeklyHistory } = useQuery({
    queryKey: ['weeklyHistory', user?.id, currentContext?.plan_id],
    queryFn: () => studyService.getWeeklyTestHistory(user!.id, currentContext?.plan_id),
    enabled: !!user?.id,
  });

  const { data: monthlyHistory } = useQuery({
    queryKey: ['monthlyHistory', user?.id, currentContext?.plan_id],
    queryFn: () => studyService.getMonthlyTestHistory(user!.id, currentContext?.plan_id),
    enabled: !!user?.id,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', user?.id, currentContext?.plan_id],
    queryFn: () => studyService.getDashboardData(user!.id, currentContext?.plan_id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  // useMediaQuery to detect desktop (xl breakpoint)
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [canScroll, setCanScroll] = useState(false);
  const [doubtInput, setDoubtInput] = useState("");
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

  // Update setupData when user changes
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

  const handleGeneratePlan = async () => {
    if (!user) return;
    if (!setupData.name.trim() || !setupData.medium || setupData.subDivision.length === 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsGenerating(true);
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
        queryClient.invalidateQueries({ queryKey: ['dashboard', user!.id] }),
      ]);

      toast.success("Study plan generated successfully!");
      setIsSetupModalOpen(false); // Only close after successful generation
    } catch (err) {
      toast.error("Failed to generate study plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAskDoubt = () => {
    if (doubtInput.trim()) {
      navigate("/ask-doubt", { state: { initialQuery: doubtInput.trim() } });
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      setCanScroll(scrollWidth > clientWidth + 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);

    // Check for welcome trigger - only show once per user AND only for new users
    const welcomeParam = searchParams.get("welcome") === "true";
    const storageKey = `welcome_modal_shown_${user?.id}`;
    const hasShownWelcome = localStorage.getItem(storageKey);
    const isNewUser = user && !user.is_onboarded;

    if (welcomeParam && isNewUser && !hasShownWelcome) {
      setIsWelcomeModalOpen(true);
      localStorage.setItem(storageKey, "true");

      // Clean up the URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("welcome");
      setSearchParams(newParams, { replace: true });
    } else if (welcomeParam) {
      // If user is already onboarded or welcome was shown, just clean up params
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("welcome");
      setSearchParams(newParams, { replace: true });
    }

    return () => window.removeEventListener('resize', checkScroll);
  }, [searchParams, setSearchParams]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const calculateCurrentProgressDay = (roadmap: RoadmapResponse | undefined) => {
    if (roadmap?.plan && roadmap.plan.length > 0) {
      const overallPlan = roadmap.plan.find(p => p.plan_type === 'OVERALL') || roadmap.plan[0];
      const sortedDays = [...overallPlan.days].sort((a, b) => a.day - b.day);

      // 1. Try to find today's calendar date first to prevent auto-skipping to tomorrow
      // Use local date string (YYYY-MM-DD)
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const todayPlanning = sortedDays.find(d => d.date === todayStr);
      if (todayPlanning) return todayPlanning.day;

      // 2. Fallback to first incomplete day
      const firstIncomplete = sortedDays.find(day => {
        return !day.items.every(item => {
          if (item.type === 'TOPIC') {
            const subtopics = Array.isArray(item.topic) ? item.topic : [];
            return subtopics.every(t => t.is_completed === true || t.plan_status === 'COMPLETED');
          }
          return item.is_completed === true || item.plan_status === 'COMPLETED';
        });
      });
      return firstIncomplete?.day || sortedDays[0]?.day || 1;
    }
    return 1;
  };

  const currentProgressDay = calculateCurrentProgressDay(roadmapData);

  const todaysPlan = useMemo(() => {
    if (!roadmapData?.plan || roadmapData.plan.length === 0) return [];

    // Respect the current context's plan_id if set, else prefer OVERALL plan
    const currentActivePlanId = currentContext?.plan_id;
    const currentPlan = roadmapData.plan.find(p => p.plan_id === currentActivePlanId) 
                      || roadmapData.plan.find(p => p.plan_type === 'OVERALL') 
                      || roadmapData.plan[0];
                      
    const relevantDays = currentPlan?.days || [];

    const mappedResult = mapRoadmapToFrontend(
      relevantDays,
      [],
      topicTimings || [],
      weeklyHistory || [],
      monthlyHistory || [],
      user?.id,
      currentActivePlanId
    );
    
    const dayTopics = mappedResult[currentProgressDay] || [];

    return dayTopics.map((item) => {
      let buttonLabel = "Start Now";
      if (item.status === 'completed') buttonLabel = "Review";
      else if (item.status === 'in-progress') buttonLabel = "Continue Learning";

      return {
        icon: item.image,
        title: item.title,
        subtitle: `${item.topicCount} Topic${item.topicCount !== 1 ? 's' : ''}`,
        tag: item.type === 'TEST' ? 'Assessment' : 'Topic',
        progress: item.progress,
        topics: item.topics.map(t => t.name),
        rawTopics: item.topics,
        buttonLabel
      };
    });
  }, [roadmapData, topicTimings, weeklyHistory, monthlyHistory, currentProgressDay, user?.id, currentContext?.plan_id]);

  const { logout } = useAuth();
  const handleLogout = async () => {
    try {
      logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Auto-rotate promotional cards every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Promotional cards data
  const promotionalCards = [
    {
      id: 1,
      bgClass: "bg-gradient-to-br from-[#E8F5E9] to-[#F1F8E9] border-[#C8E6C9]",
      content: (
        <div className="flex flex-row items-center justify-between w-full h-full gap-1.5 sm:gap-2 lg:gap-4 relative">
          {/* QR Code */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-14 lg:h-14 bg-white rounded-lg flex items-center justify-center flex-shrink-0 p-1 lg:p-1.5 shadow-sm border border-[#C8E6C9]/50">
            <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 z-10 px-0.5">
            <p className="banner-label-fluid text-muted-foreground mb-0.5 leading-none whitespace-nowrap">Download our</p>
            <h3 className="banner-title-fluid text-foreground leading-tight">Mobile App</h3>
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-col gap-0.5 lg:gap-1.5 flex-shrink-0">
            {/* Google Play Button */}
            <a href="#" className="bg-black text-white rounded-sm px-1 py-0.5 sm:px-1.5 sm:py-0.5 lg:px-2 lg:py-1.5 flex items-center gap-1 lg:gap-1.5 hover:bg-gray-800 transition-colors">
              <img src={playIcon} alt="Google Play" className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3.5 lg:h-3.5 object-contain flex-shrink-0" />
              <div className="text-left">
                <p className="app-btn-label leading-none opacity-70 mb-0">GET IT ON</p>
                <p className="app-btn-title leading-none whitespace-nowrap">Google Play</p>
              </div>
            </a>

            {/* App Store Button */}
            <a href="#" className="bg-black text-white rounded-sm px-1 py-0.5 sm:px-1.5 sm:py-0.5 lg:px-2 lg:py-1.5 flex items-center gap-1 lg:gap-1.5 hover:bg-gray-800 transition-colors">
              <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3.5 lg:h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
              <div className="text-left">
                <p className="app-btn-label leading-none opacity-70 mb-0">Download on the</p>
                <p className="app-btn-title leading-none whitespace-nowrap">App Store</p>
              </div>
            </a>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      bgClass: "bg-[#FFF1F2] border-[#FEE2E2]",
      content: (
        <div className="flex items-center justify-between w-full h-full relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute w-28 h-28 bg-white/40 rounded-full blur-2xl left-0 top-0" />
          <div className="absolute right-4 w-36 h-36 bg-[#FFE4E6] rounded-full z-0 opacity-50" />

          <div className="flex-1 z-10 min-w-0 pr-1 pl-1 md:pl-2">
            <h3 className="banner-title-fluid text-[#1a2b4b] mb-1 leading-tight tracking-tight">
              Launch Offer<br />Live Now!
            </h3>
            <p className="banner-label-fluid text-[#1a2b4b] opacity-80 leading-snug">
              Unlock Full Test Series<br />at a Special Price.
            </p>
          </div>

          <div className="relative flex-shrink-0 h-full w-16 sm:w-20 md:w-20 lg:w-28 flex items-center justify-center z-10">
            <div className="absolute inset-0 m-auto w-12 h-12 lg:w-20 lg:h-20 bg-white/30 rounded-full border border-white/50" />
            <img
              src={imgCard1}
              alt="Rocket"
              className="relative z-20 h-full w-auto max-h-full object-contain"
            />
          </div>
        </div>
      ),
    },
    {
      id: 3,
      bgClass: "bg-[#2D8A81] border-[#22746C]",
      content: (
        <div className="flex items-center justify-between w-full h-full relative overflow-hidden">
          {/* Decorative Stars */}
          <div className="absolute top-3 right-1/4 text-white/40 text-xs">✦</div>
          <div className="absolute bottom-3 right-1/3 text-white/30 text-xs">✦</div>
          <div className="absolute top-1/2 left-1/3 text-white/20 text-[10px]">✦</div>

          <div className="flex-1 z-10 min-w-0 pr-1 pl-1 md:pl-2">
            <h3 className="banner-title-fluid text-white mb-1.5 leading-tight tracking-tight">
              Ramzan<br />Exclusive Deal
            </h3>
            <p className="banner-label-fluid text-white/80 leading-snug">
              Limited-Time Offer on<br />Study &amp; Test Plans.
            </p>
          </div>
          <div className="relative flex-shrink-0 h-full w-16 sm:w-20 md:w-20 lg:w-28 flex items-center justify-center">
            <img
              src={imgCard2}
              alt="Ramzan Deal"
              className="relative z-20 h-full w-auto max-h-full object-contain"
            />
          </div>
        </div>
      ),
    },
  ];

  // No need for local fetchUser effect anymore as it's handled by useQuery and pre-fetched

  const userName = user?.full_name || user?.username || "Arun";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const avatarUrl = getMediaUrl(user?.photo_url, pic);



  const RightSidebarContent = ({ mobileView }: { mobileView?: 'streak' | 'leaderboard' | 'all' }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-8"
    >
      <RightSidebarWidgets initialView={mobileView} />
    </motion.div>
  );

  return (
    <DashboardLayout
      hideHeader={isDesktop}
      rightSidebar={RightSidebarContent}
    >
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-4 md:space-y-6 lg:space-y-8 pt-4 lg:pt-6"
      >
        {/* Hero Banner */}
        <motion.div
          variants={itemVariants}
          className="relative bg-gradient-to-r from-[#95DFFF] to-[#C4EDFF] rounded-2xl p-6 md:p-8 min-h-[100px] flex flex-col md:flex-row items-center shadow-sm"
        >
          <div className="relative z-20 flex-1 w-full text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 md:mb-4 drop-shadow-md flex items-center justify-center md:justify-start gap-2">
              Hi, {userName}
              <motion.span
                animate={{
                  rotate: [0, 25, -15, 25, -15, 0],
                }}
                whileHover={{
                  scale: 1.2,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.9 }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
                className="cursor-pointer"
                style={{ display: "inline-block", transformOrigin: "bottom right" }}
              >
                👋
              </motion.span>
            </h1>
            <p className="text-[#1a2b4b] text-sm md:text-lg font-medium">
              Let's learn something new today!
            </p>

          </div>

          {/* Decorative Liquid Animated Blobs */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-2xl">
            {/* Top Right Liquid Blob */}
            <motion.div
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                rotate: [0, 90, 0],
                borderRadius: [
                  "30% 70% 70% 30% / 30% 30% 70% 70%",
                  "50% 50% 20% 80% / 25% 80% 20% 75%",
                  "30% 70% 70% 30% / 30% 30% 70% 70%"
                ],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-white/40"
            />

            {/* Middle Liquid Blob */}
            <motion.div
              animate={{
                x: [0, -20, 0],
                y: [0, 40, 0],
                rotate: [0, -45, 0],
                borderRadius: [
                  "60% 40% 30% 70% / 60% 30% 70% 40%",
                  "40% 60% 50% 50% / 40% 40% 60% 60%",
                  "60% 40% 30% 70% / 60% 30% 70% 40%"
                ],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/4 right-[5%] w-32 h-32 bg-white/30"
            />

            {/* Bottom Left Shifting Blob */}
            <motion.div
              animate={{
                x: [0, 40, 0],
                y: [0, -30, 0],
                borderRadius: [
                  "50% 50% 50% 50% / 30% 30% 70% 70%",
                  "70% 30% 70% 30% / 50% 50% 50% 50%",
                  "50% 50% 50% 50% / 30% 30% 70% 70%"
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-12 left-1/4 w-36 h-36 bg-white/25"
            />

            {/* Small Organic Sparkle */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                borderRadius: ["40% 60% 40% 60% / 60% 40% 60% 40%", "60% 40% 60% 40% / 40% 60% 40% 60%", "40% 60% 40% 60% / 60% 40% 60% 40%"]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-6 right-1/4 w-12 h-12 bg-white/50"
            />
          </div>

          {/* Hero illustration */}
          <img
            src={heroBoy}
            alt="Student"
            className="absolute right-4 md:right-8 bottom-0 h-24 md:h-48 object-contain hidden sm:block z-30"
          />
        </motion.div>

        {/* Today's Plan */}
        {/* Today's Plan */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Today's Plan
            </h2>
            {canScroll && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`h-8 w-8 rounded-full bg-muted/40 hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-200 ${!canScrollLeft ? 'opacity-30 scale-90 cursor-not-allowed' : 'opacity-100 scale-100'}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`h-8 w-8 rounded-full bg-muted/40 hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-200 ${!canScrollRight ? 'opacity-30 scale-90 cursor-not-allowed' : 'opacity-100 scale-100'}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className={cn(
              "flex gap-4 -mx-4 px-4 lg:mx-0 lg:px-0 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              todaysPlan.length === 0 ? "flex-col" : "grid grid-flow-col auto-cols-[250px]"
            )}
          >
            {(isLoadingRoadmap) ? (
              <div className="w-full bg-card rounded-2xl p-8 border border-border flex flex-col items-center justify-center text-center space-y-4">
                 <Loader2 className="w-8 h-8 text-primary animate-spin" />
                 <p className="text-sm text-muted-foreground">Refreshing your plan...</p>
              </div>
            ) : !roadmapData?.plan || roadmapData.plan.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="w-full bg-card rounded-2xl p-8 border border-dashed border-border flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="p-4 bg-primary/10 rounded-full">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No Study Plan Generated</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Set up your personalized exam preparation roadmap to start tracking your daily progress.
                  </p>
                </div>
                <Button
                  onClick={() => setIsSetupModalOpen(true)}
                  disabled={isGenerating}
                  className="rounded-xl px-8 h-12 bg-[#1a2b4b] text-white hover:bg-[#1a2b4b]/90 shadow-lg shadow-[#1a2b4b]/10"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </span>
                  ) : "Set Up My Plan"}
                </Button>
              </motion.div>
            ) : todaysPlan.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="w-full bg-card rounded-2xl p-8 border border-border flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="p-4 bg-emerald-50 rounded-full">
                  <Trophy className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">All Tasks Completed!</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Great job! You've finished everything for today. Check your progress in the Study Plan tab.
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/study-plan")}
                  className="rounded-xl px-8 h-12 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/10"
                >
                  View Roadmap
                </Button>
              </motion.div>
            ) : (
              todaysPlan.map((item) => (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col h-[230px] snap-center relative"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.icon}
                        alt={item.title}
                        className="w-14 h-14 object-contain flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    {item.tag && (
                      <span className="text-[9px] font-medium bg-yellow-100   text-yellow-600 px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 flex-shrink-0 mt-1">
                        <span className="w-1 h-1 bg-yellow-600 rounded-full" />
                        {item.tag}
                      </span>
                    )}
                  </div>

                  {/* Progress bar — colored by status like mobile */}
                  <div className="mb-3">
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          item.progress >= 100 ? "bg-emerald-500" :
                            item.progress > 0 ? "bg-primary" :
                              "bg-muted-foreground/20"
                        )}
                        style={{ width: `${Math.min(100, item.progress || 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Topics — max 2 + N more, matching mobile */}
                  <ul className="space-y-1 mb-2 flex-1">
                    {item.rawTopics?.slice(0, 2).map((topic: any) => (
                      <li
                        key={topic.name}
                        className="flex items-center gap-2 text-[12px] text-foreground/80 truncate"
                      >
                        {topic.status === 'completed' ? (
                          <div className="w-3 h-3 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                        ) : (
                          <span className="w-1 h-1 bg-foreground/40 rounded-full flex-shrink-0" />
                        )}
                        <span className={cn("truncate", topic.status === 'completed' && "text-emerald-600 font-medium")}>
                          {topic.name}
                        </span>
                      </li>
                    ))}
                    {(item.topics?.length || 0) > 2 && (
                      <li className="text-[11px] font-semibold text-primary pl-3">
                        + {(item.topics?.length || 0) - 2} more
                      </li>
                    )}
                  </ul>

                  {/* Action */}
                  <Button
                    onClick={() => navigate("/study-plan")}
                    onMouseEnter={() => {
                      if (user?.id) prefetchAllUserData(queryClient, user);
                    }}
                    className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl font-medium h-10 mt-auto text-sm"
                  >
                    {item.buttonLabel}
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>



        {/* Daily Updates Banner */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-[#D2EDDD] to-[#F1F7D8] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between border border-[#F5EDCC] gap-4"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <img
              src={dailyUpdatesImg}
              alt="Daily Updates"
              className="w-16 h-16 md:w-20 md:h-20 object-contain flex-shrink-0"
            />
            <div>
              <h3 className="font-semibold text-foreground text-sm md:text-base">
                Did You Catch Today's Key Updates?
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Stay updated with daily current affairs and attempt the quick
                test.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl w-full sm:w-auto text-foreground hover:bg-foreground hover:text-background whitespace-nowrap font-semibold"
            onClick={() => navigate("/current-affairs")}
          >
            Explore Now
          </Button>
        </motion.div>

        {/* Bottom Banners */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 "
        >
          {/* Promotional Cards Carousel */}
          <div className="relative h-[130px] sm:h-[145px] md:h-[160px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCardIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`rounded-2xl px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 flex items-center h-full border transition-colors duration-500 ${promotionalCards[currentCardIndex].bgClass}`}
              >
                {promotionalCards[currentCardIndex].content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* AI Tutor Banner - Hidden on mobile */}
          <div className="hidden md:flex bg-gradient-to-br from-[#E8E5FF] to-[#DBD6FF] rounded-2xl px-3 py-3 lg:px-5 lg:py-4 flex-col justify-center gap-1.5 lg:gap-3 relative overflow-hidden h-[130px] sm:h-[145px] md:h-[160px]">
            <div className="flex-1 w-full relative z-10 flex flex-col justify-center">
              {/* Input Field */}
              <div className="bg-white rounded-md px-2 py-1 lg:px-3 lg:py-3 flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-3 border border-gray-200 shadow-sm w-full max-w-[55%] lg:max-w-[280px]">
                <input
                  type="text"
                  placeholder="Ask your doubt"
                  value={doubtInput}
                  onChange={(e) => setDoubtInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAskDoubt();
                    }
                  }}
                  className="flex-1 bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground min-w-0"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAskDoubt}
                  className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-[#E2DDFF] to-[#A99AFF] text-[#1a2b4b] rounded-md flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg transition-all"
                >
                  <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                  </svg>
                </motion.button>
              </div>

              {/* Title */}
              <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-[#1a2b4b] ">
                Your Personal AI Tutor is here
              </h3>
            </div>

            {/* AI Tutor Illustration */}
            <div className="absolute right-[-8px] bottom-[-8px] w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 opacity-90">
              <img
                src={aiTutorImg}
                alt="AI Tutor"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </motion.div>
        {/* Mock Test Banner */}
        <motion.div
          variants={itemVariants}
          className="relative bg-[#F9D74B] rounded-2xl p-5 md:p-8 overflow-hidden min-h-[160px] md:min-h-[180px] flex items-center"
        >
          {/* Animated floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <motion.div
              animate={{ x: [0, 15, -10, 0], y: [0, -20, 10, 0], rotate: [0, 8, -5, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 right-[15%] w-28 h-28 md:w-36 md:h-36 bg-[#FBE77A]/40 rounded-3xl"
            />
            <motion.div
              animate={{ x: [0, -20, 15, 0], y: [0, 10, -15, 0], rotate: [0, -10, 6, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-4 right-[30%] w-24 h-24 md:w-32 md:h-32 bg-[#FBE77A]/30 rounded-2xl"
            />
            <motion.div
              animate={{ x: [0, 10, -8, 0], y: [0, -12, 18, 0], rotate: [0, 5, -8, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-2 right-[10%] w-14 h-14 md:w-20 md:h-20 bg-[#FBE77A]/35 rounded-xl"
            />
            <motion.div
              animate={{ x: [0, -8, 12, 0], y: [0, 15, -8, 0], rotate: [0, -6, 10, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute -bottom-6 left-[55%] w-32 h-32 md:w-40 md:h-40 bg-[#FBE77A]/25 rounded-3xl"
            />
            <motion.div
              animate={{ x: [0, 6, -6, 0], y: [0, -8, 6, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-6 right-[5%] w-8 h-8 md:w-10 md:h-10 bg-[#FBE77A]/40 rounded-lg"
            />
          </div>

          {/* Girl illustration */}
          <img
            src={mockTestGirl}
            alt="Student"
            className="absolute left-3 md:left-6 bottom-0 h-[120px] md:h-[160px] object-contain hidden sm:block z-10"
          />

          {/* Content */}
          <div className="relative z-20 w-full sm:pl-36 md:pl-48">
            <h3 className="text-xl md:text-2xl font-bold text-[#1a2b4b] mb-0.5">
              TNPSC Mock – 2026
            </h3>
            <p className="text-sm md:text-base text-[#1a2b4b]/70 mb-2">
              Full-Length Test
            </p>
            <p className="text-xs md:text-sm text-[#1a2b4b]/80 mb-3">
              Available from: 15 Jan 2026
            </p>
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#1a2b4b] mb-4 flex-wrap">
              <span>🕐 3 Hrs</span>
              <span>•</span>
              <span>📝 200 Qs</span>
              <span>•</span>
              <span>🏆 300 Marks</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-xl bg-[#FFF8DC] border-[#F5E06B] text-[#1a2b4b] hover:bg-[#FFF0B3] font-semibold px-5"
              >
                Coming Soon
              </Button>
              <Button
                onClick={() => navigate("/test-series")}
                variant="default"
                className="rounded-xl bg-primary text-white hover:bg-primary/90 hover:text-white font-semibold px-5"
              >
                View Details
              </Button>
            </div>
          </div>
        </motion.div>

      </motion.div>
      <StudySetupModal
        isOpen={isSetupModalOpen}
        onOpenChange={setIsSetupModalOpen}
        isGenerating={isGenerating}
        setupData={setupData}
        setSetupData={setSetupData}
        onGenerate={handleGeneratePlan}
      />
    </DashboardLayout>
  );
};

export default Index;
