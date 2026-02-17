import { DashboardLayout } from "@/components/layout";
import {
  StreakWidget,
  LeaderboardWidget,
  ProfileWidget,
  CalendarWidget,
} from "@/components/dashboard";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import authService, { UserMe } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bell, ChevronRight, ChevronDown } from "lucide-react";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import pic from "@/assets/pic.png";

// Dashboard assets
import heroBoy from "@/assets/dashboard/hero-boy.png";
import historyIcon from "@/assets/dashboard/history-icon.png";
import economyIcon from "@/assets/dashboard/economy-icon.png";
import currentAffairsIcon from "@/assets/dashboard/current-affairs-icon.png";
import dailyUpdatesImg from "@/assets/dashboard/daily-updates.png";
import aiTutorImg from "@/assets/dashboard/ai-tutor.png";
import studyHoursIcon from "@/assets/dashboard/study-hours-icon.png";
import accuracyIcon from "@/assets/dashboard/accuracy-icon.png";
import mcqsIcon from "@/assets/dashboard/mcqs-icon.png";
import rankIcon from "@/assets/dashboard/rank.png";
import playIcon from "@/assets/dashboard/play.svg";
import qrCode from "@/assets/dashboard/qr.png";
import imgCard2 from "@/assets/dashboard/img-card2.png";
import imgCard1 from "@/assets/dashboard/img-card1.png";

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

const todaysPlan: StudyPlanItem[] = [
  {
    icon: historyIcon,
    title: "History",
    subtitle: "2 Topics",
    tag: "General studies",
    progress: 65,
    topics: ["Indus Valley Civilization", "Guptas, Delhi Sultans"],
    buttonLabel: "Continue Learning",
  },
  {
    icon: economyIcon,
    title: "Economy",
    subtitle: "2 Topics",
    tag: "General studies",
    progress: 30,
    topics: ["Nature of Indian economy", "Five-year plan models"],
    buttonLabel: "Start Now",
  },
  {
    icon: currentAffairsIcon,
    title: "Current Affairs",
    subtitle: "Test available",
    tag: "",
    progress: 0,
    topics: ["Daily & Monthly Updates", "TNPSC-Focused News"],
    buttonLabel: "View Details",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserMe | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isStreakInfoExpanded, setIsStreakInfoExpanded] = useState(false);

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
        <>
          {/* QR Code */}
          <div className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 p-2">
            <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <p className="text-md text-muted-foreground mb-1">Download our</p>
            <h3 className="text-2xl font-medium text-foreground mb-3">Mobile App</h3>
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-col gap-2">
            {/* Google Play Button */}
            <a href="#" className="bg-black text-white rounded-md px-3 py-2 flex items-center gap-2 hover:bg-gray-800 transition-colors">
              <img src={playIcon} alt="Google Play" className="w-5 object-contain" />
              <div className="text-left">
                <p className="text-[8px] leading-none opacity-80">GET IT ON</p>
                <p className="text-xs leading-tight">Google Play</p>
              </div>
            </a>

            {/* App Store Button */}
            <a href="#" className="bg-black text-white rounded-md px-3 py-2 flex items-center gap-2 hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
              <div className="text-left">
                <p className="text-[8px] leading-none opacity-80">Download on the</p>
                <p className="text-xs leading-tight">App Store</p>
              </div>
            </a>
          </div>
        </>
      ),
    },
    {
      id: 2,
      bgClass: "bg-[#FFF1F2] border-[#FEE2E2]",
      content: (
        <div className="flex items-center justify-between w-full h-full relative px-4 ">
          <div className="absolute left-[-20px] top-[-90px] w-40 h-40  bg-white/40 rounded-full z-0 opacity-60" />

          {/* Decorative Background Elements */}
          <div className="absolute  w-32 h-32 bg-white/40 rounded-full blur-2xl" />
          <div className="absolute  right-8 w-40 h-40 bg-[#FFE4E6] rounded-full z-0 opacity-50" />

          <div className="flex-1 z-10">
            <h3 className="text-xl font-semibold text-[#1a2b4b] mb-2 leading-tight">
              Launch Offer Live Now!
            </h3>
            <p className="text-[#1a2b4b] text-sm font-normal opacity-90">
              Unlock Full Test Series at a<br />Special Price.
            </p>
          </div>

          <div className="relative w-40 h-32 flex-shrink-0 flex items-center justify-center z-10">
            {/* Circle behind rocket */}
            <div className="absolute w-28  h-28 bg-white/30 rounded-full border border-white/50" />
            <img
              src={imgCard1}
              alt="Rocket"
              className="w-full h-full object-contain relative z-20 transform translate-x-2"
            />
          </div>
        </div>
      ),
    },
    {
      id: 3,
      bgClass: "bg-[#2D8A81] border-[#22746C]",
      content: (

        <div className="flex items-center justify-between w-full h-full relative px-4 ">
          <div className="absolute left-[-20px] top-[-90px] w-40 h-40 bg-[#bacecc] rounded-full z-0 opacity-10" />
          {/* Decorative Stars */}
          <div className="absolute top-4 right-1/4 text-white/40 text-xs translate-x-10">✦</div>
          <div className="absolute bottom-4 right-1/3 text-white/30 text-xs -translate-x-5">✦</div>
          <div className="absolute top-1/2 left-1/3 text-white/20 text-[10px]">✦</div>

          {/* Background Blob */}

          <div className="flex-1 z-10">
            <h3 className="text-xl font-medium text-white mb-2 leading-tight">
              Ramzan Exclusive Deal
            </h3>
            <p className="text-white/90 text-sm font-normal">
              Limited-Time Offer on Study<br />& Test Plans.
            </p>
          </div>
          <div className="relative w-44 h-36 flex-shrink-0 flex items-center justify-center ">
            <div className="absolute w-28 h-28  " />
            <img
              src={imgCard2}
              alt="Ramzan Deal"
              className="w-full h-full object-contain relative z-20"
            />
          </div>
        </div>

      ),
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await authService.getCurrentUser();
        setUser(u);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  const userName = user?.full_name || user?.username || "Arun";
  const userTitle = user?.qualification || "TNPSC Aspirant";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const avatarUrl = user?.photo_url
    ? user.photo_url.startsWith("http")
      ? user.photo_url
      : `${baseUrl}${user.photo_url}`
    : pic;

  return (
    <DashboardLayout
      hideHeader={true}
      rightSidebar={
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Top Row: Language, Notifications, Profile */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LanguageToggle />
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                  <AvatarImage src={avatarUrl} alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-[10px] text-white">⭐</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Performance */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Daily Performance</h3>
              <span className="text-muted-foreground text-sm cursor-pointer hover:text-foreground">›</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2">
                <img src={studyHoursIcon} alt="Study Hours" className="w-6 h-6" />
                <div>
                  <p className="text-xl font-semibold text-foreground">2.5</p>
                  <p className="text-[11px] text-muted-foreground">Study Hours</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2">
                <img src={accuracyIcon} alt="Accuracy" className="w-6 h-6" />
                <div>
                  <p className="text-xl font-semibold text-foreground">65%</p>
                  <p className="text-[11px] text-muted-foreground">Accuracy</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2">
                <img src={mcqsIcon} alt="MCQs" className="w-6 h-6" />
                <div>
                  <p className="text-xl font-semibold text-foreground">--</p>
                  <p className="text-[11px] text-muted-foreground">MCQs Solved</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2">
                <img src={rankIcon} alt="MCQs" className="w-6 h-6" />
                <div>
                  <p className="text-xl font-semibold text-foreground">--</p>
                  <p className="text-[11px] text-muted-foreground">Current Rank</p>
                </div>
              </div>
            </div>
          </div>

          <StreakWidget streakDays={3} />
          <LeaderboardWidget />
          {/* New Calendar Widget */}
          <CalendarWidget />

          {/* How Streak Works Collapsible */}
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden transition-all duration-300">
            <div
              className="py-3 px-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setIsStreakInfoExpanded(!isStreakInfoExpanded)}
            >
              <span className="text-sm font-semibold text-[#1a2b4b]">How Streak Works?</span>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", isStreakInfoExpanded && "rotate-180")} />
            </div>

            <AnimatePresence>
              {isStreakInfoExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4 bg-[#F9FAFB]/50"
                >
                  <div className="pt-2 text-[13px] text-slate-600 leading-relaxed font-medium">
                    Your streak grows when you complete an MCQ test from today's scheduled study plan topic.
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🔥</span>
                      <p className="text-[13px] text-slate-600 font-medium">Finish at least one planned topic test for the day</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🔥</span>
                      <p className="text-[13px] text-slate-600 font-medium">Complete it before the day ends</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


        </motion.div>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-4 pt-6"
      >
        {/* Hero Banner */}
        <motion.div
          variants={itemVariants}
          className="relative bg-gradient-to-r from-[#95DFFF] to-[#C4EDFF] rounded-2xl p-8  min-h-[100px] flex items-center shadow-sm "
        >
          <div className="relative z-20">
            <h1 className="text-xl md:text-3xl font-semibold text-white mb-4 drop-shadow-md flex items-center gap-2">
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
            <p className="text-[#1a2b4b] text-base md:text-lg font-medium">
              Let's learn something new today!
            </p>
          </div>

          {/* Decorative Animated Blobs */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <motion.div
              animate={{
                x: [0, 15, 0],
                y: [0, -10, 0],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 w-40 h-40 bg-white/40 rounded-full blur-2xl"
            />
            <motion.div
              animate={{
                x: [0, -20, 0],
                y: [0, 10, 0],
                opacity: [0.15, 0.3, 0.15]
              }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 left-1/4 w-32 h-32 bg-white/30 rounded-full blur-xl"
            />
          </div>

          {/* Hero illustration */}
          <img
            src={heroBoy}
            alt="Student"
            className="absolute right-8 bottom-0 h-32 md:h-48 object-contain hidden sm:block z-30"
          />
        </motion.div>

        {/* Today's Plan */}
        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Today's Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {todaysPlan.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-card rounded-2xl p-5 border border-border shadow-sm flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="w-12 h-12 object-contain"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  {item.tag && (
                    <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {item.tag}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <Progress
                    value={item.progress}
                    className="h-2 bg-muted"
                  />
                </div>

                {/* Topics */}
                <ul className="space-y-1.5 mb-4 flex-1">
                  {item.topics.map((topic) => (
                    <li
                      key={topic}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full flex-shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>

                {/* Action */}
                <Button
                  onClick={() => navigate("/study-plan")}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl font-medium h-10"
                >
                  {item.buttonLabel}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Daily Updates Banner */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-[#D2EDDD] to-[#F1F7D8] rounded-2xl p-4 md:p-9 flex items-center justify-between border border-[#F5EDCC]"
        >
          <div className="flex items-center gap-4">
            <img
              src={dailyUpdatesImg}
              alt="Daily Updates"
              className="w-20 h-20 object-contain"
            />
            <div>
              <h3 className="font-semibold text-foreground">
                Did You Catch Today's Key Updates?
              </h3>
              <p className="text-sm text-muted-foreground">
                Stay updated with daily current affairs and attempt the quick
                test.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl  text-foreground hover:bg-foreground hover:text-background whitespace-nowrap hidden sm:flex"
            onClick={() => navigate("/test-series")}
          >
            Explore Now
          </Button>
        </motion.div>

        {/* Bottom Banners */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Promotional Cards Carousel */}
          <div className="relative h-[160px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCardIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`rounded-2xl p-6 flex items-center h-full border transition-colors overflow-hidden duration-500 ${promotionalCards[currentCardIndex].bgClass}`}
              >
                {promotionalCards[currentCardIndex].content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* AI Tutor Banner */}
          <div className="bg-gradient-to-br from-[#E8E5FF] to-[#DBD6FF] rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden h-[160px]">
            <div className="flex-1 w-full relative z-10">
              {/* Input Field */}
              <div className="bg-white rounded-md px-4 py-2 flex items-center gap-3 mb-4 border border-gray-200 shadow-sm max-w-[280px]">
                <input
                  type="text"
                  placeholder="Ask your doubt"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 bg-gradient-to-br from-[#E2DDFF] to-[#A99AFF] text-[#1a2b4b] rounded-md flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                  </svg>
                </motion.button>
              </div>

              {/* Title */}
              <h3 className="text-xl font-medium text-[#1a2b4b]">
                Your Personal AI Tutor is here
              </h3>
            </div>

            {/* AI Tutor Illustration */}
            <div className="absolute right-[-10px] bottom-[-10px] w-40 h-40">
              <img
                src={aiTutorImg}
                alt="AI Tutor"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
