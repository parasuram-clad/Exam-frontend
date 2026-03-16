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
import { Clock, FileText, Trophy, Library, BookOpen, Landmark, Globe, Banknote, Microscope, Newspaper, Brain, Pencil, Timer, Layout, Bell, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/env";
import { SubjectWiseView, TestSubject } from "@/components/test-series/SubjectWiseView";
import { TestSetsView, TestSet } from "@/components/test-series/TestSetsView";
import testImage from "../assets/test-1.png";
import testHero from "../assets/test-hero.png";
import test1Icon from "../assets/test-1.png";
import test2Icon from "../assets/test-2.png";
import test3Icon from "../assets/test-3.png";
import test4Icon from "../assets/test-4.png";
import test5Icon from "../assets/tes-5.png";
import test6Icon from "../assets/test-6.png";



const testSubjects: TestSubject[] = [
  {
    id: "history",
    icon: test1Icon,
    name: "History",
    testsAvailable: 25,
    completed: 6,
    total: 25,
    difficulty: "Moderate",
    iconBg: "bg-amber-50",
    items: [
      { icon: <Brain className="w-3 h-3" />, text: "25 Apt", color: "text-pink-500", bg: "bg-pink-50" },
      { icon: <BookOpen className="w-3 h-3" />, text: "75 History + CA", color: "text-blue-500", bg: "bg-blue-50" },
      { icon: <Pencil className="w-3 h-3" />, text: "100 Lang", color: "text-amber-500", bg: "bg-amber-50" },
    ],
  },
  {
    id: "polity",
    icon: test2Icon,
    name: "Polity",
    testsAvailable: 25,
    completed: 0,
    total: 25,
    difficulty: "Hard",
    iconBg: "bg-orange-50",
    items: [
      { icon: <Brain className="w-3 h-3" />, text: "25 Apt", color: "text-pink-500", bg: "bg-pink-50" },
      { icon: <BookOpen className="w-3 h-3" />, text: "75 Polity + CA", color: "text-blue-500", bg: "bg-blue-50" },
      { icon: <Pencil className="w-3 h-3" />, text: "100 Lang", color: "text-amber-500", bg: "bg-amber-50" },
    ],
  },
  {
    id: "geography",
    icon: test3Icon,
    name: "Geography",
    testsAvailable: 25,
    completed: 20,
    total: 25,
    difficulty: "Easy",
    iconBg: "bg-emerald-50",
    items: [
      { icon: <Brain className="w-3 h-3" />, text: "25 Apt", color: "text-pink-500", bg: "bg-pink-50" },
      { icon: <BookOpen className="w-3 h-3" />, text: "75 Geography + CA", color: "text-blue-500", bg: "bg-blue-50" },
      { icon: <Pencil className="w-3 h-3" />, text: "100 Lang", color: "text-amber-500", bg: "bg-amber-50" },
    ],
  },
  {
    id: "economy",
    icon: test4Icon,
    name: "Economy",
    testsAvailable: 25,
    completed: 23,
    total: 25,
    difficulty: "Easy",
    iconBg: "bg-sky-50",
    items: [
      { icon: <Brain className="w-3 h-3" />, text: "25 Apt", color: "text-pink-500", bg: "bg-pink-50" },
      { icon: <BookOpen className="w-3 h-3" />, text: "75 Economy + CA", color: "text-blue-500", bg: "bg-blue-50" },
      { icon: <Pencil className="w-3 h-3" />, text: "100 Lang", color: "text-amber-500", bg: "bg-amber-50" },
    ],
  },
  {
    id: "science-tech",
    icon: test5Icon,
    name: "Science & Tech",
    testsAvailable: 25,
    completed: 10,
    total: 25,
    difficulty: "Moderate",
    iconBg: "bg-indigo-50",
    items: [
      { icon: <Brain className="w-3 h-3" />, text: "25 Apt", color: "text-pink-500", bg: "bg-pink-50" },
      { icon: <BookOpen className="w-3 h-3" />, text: "75 Science + CA", color: "text-blue-500", bg: "bg-blue-50" },
      { icon: <Pencil className="w-3 h-3" />, text: "100 Lang", color: "text-amber-500", bg: "bg-amber-50" },
    ],
  },
  {
    id: "current-affairs",
    icon: test6Icon,
    name: "Current Affairs",
    testsAvailable: 25,
    completed: 10,
    total: 25,
    difficulty: "Easy",
    iconBg: "bg-slate-50",
    items: [
      { icon: <Brain className="w-3 h-3" />, text: "25 Apt", color: "text-pink-500", bg: "bg-pink-50" },
      { icon: <BookOpen className="w-3 h-3" />, text: "75 Current Affairs", color: "text-blue-500", bg: "bg-blue-50" },
      { icon: <Pencil className="w-3 h-3" />, text: "100 Lang", color: "text-amber-500", bg: "bg-amber-50" },
    ],
  },
];

const testSets: TestSet[] = [
  {
    id: "set-1",
    name: "Test Set 1",
    duration: "3 Hours",
    questions: 200,
    score: { obtained: 158, total: 300 },
    difficulty: "Moderate",
    syllabus: ["GS", "Tamil"],
  },
  {
    id: "set-2",
    name: "Test Set 2",
    duration: "3 Hours",
    questions: 200,
    difficulty: "Moderate",
    syllabus: ["GS", "Tamil"],
  },
  {
    id: "set-3",
    name: "Test Set 3",
    duration: "3 Hours",
    questions: 200,
    difficulty: "Easy",
    syllabus: ["GS", "English"],
  },
];

const TestSeriesSidebar = ({ user }: { user: UserMe | null }) => {
  const navigate = useNavigate();
  const attempts = [
    { name: "Polity – Test 4", subject: "polity", testId: "4", score: "5/15" },
    { name: "Geography – Test 6", subject: "geography", testId: "6", score: "12/15" },
    { name: "Current Affairs – Test 6", subject: "current-affairs", testId: "6", score: "12/15" },
  ];

  // Helper for initials
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || "A";

  // Handle relative avatar URL
  const avatarUrl = user?.photo_url
    ? (user.photo_url.startsWith('http') ? user.photo_url : `${BASE_URL}${user.photo_url}`)
    : undefined;

  return (
    <div className="flex flex-col gap-6">


      {/* Improve Last Attempts Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-6 tracking-tight">
          Improve Your Last Attempts
        </h3>
        <div className="space-y-4">
          {attempts.map((attempt, index) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

const TestSeries = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"subject" | "sets">("subject");
  const { user } = useAuth();

  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const userName = user?.full_name || user?.username || "Student";

  return (
    <DashboardLayout
      hideHeader={isDesktop}
      rightSidebar={<TestSeriesSidebar user={user} />}
    >
      <div className="px-1 mb-6">
        <h1 className="text-xl sm:text-2xl font-medium text-slate-900">Test Series</h1>
        <p className="text-[12px] sm:text-sm text-slate-500 mt-1 font-medium">
          TNPSC – Group IV | 2026
        </p>
      </div>

      {/* Hero Banner */}
      {/* Compact Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-[#D2EDDD] to-[#F1F7D8] rounded-2xl p-4 md:px-8 md:py-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 overflow-hidden border border-[#C7DD66]/20 shadow-sm"
      >
        {/* Content */}
        <div className="flex-1 relative z-10 text-center md:text-left order-2 md:order-1">
          <h1 className="text-xl md:text-2xl font-semibold text-[#0F172A] mb-1 tracking-tight">
            Hi, {userName} 👋
          </h1>
          <p className="text-[#0F172A]/70 text-sm md:text-base font-medium mb-3 md:mb-4">Ready to test your knowledge?</p>

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

        {/* Hero Illustration - Reduced Size */}
        <motion.div
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-20 sm:w-24 md:w-32 lg:w-40 shrink-0 relative z-10 select-none order-1 md:order-2"
        >
          <img
            src={testHero}
            alt="Subject Wise Tests"
            className="w-full h-auto object-contain drop-shadow-xl"
          />
        </motion.div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100/30 rounded-full blur-2xl pointer-events-none" />
      </motion.div>

      {/* Selection Tabs */}
      <div className="flex items-center gap-4 mb-8 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
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
      </div>

      {
        activeTab === "subject" ? (
          <SubjectWiseView subjects={testSubjects} />
        ) : (
          <TestSetsView testSets={testSets} />
        )
      }

      {/* Special Full-Length Tests */}

    </DashboardLayout >
  );
};

export default TestSeries;
