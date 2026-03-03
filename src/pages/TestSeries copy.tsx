import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import {
  StreakWidget,
  LeaderboardWidget,
  ScheduleWidget,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Trophy, Library, BookOpen, Landmark, Globe, Banknote, Microscope, Newspaper, Brain, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import testImage from "../assets/test-image.png";
import testHero from "../assets/test-hero.png";

interface TestSubject {
  id: string;
  icon: any;
  name: string;
  testsAvailable: number;
  completed: number;
  total: number;
  difficulty: "Easy" | "Moderate" | "Hard";
  items: { icon: any; text: string; color: string; bg: string }[];
  iconBg: string;
}

const CircularProgress = ({ completed, total }: { completed: number; total: number }) => {
  if (completed === 0) {
    return (
      <div className="text-[10px] text-slate-500 leading-tight text-right font-medium">
        Not<br />Attempted
      </div>
    );
  }

  const percentage = (completed / total) * 100;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return "text-emerald-500";
    if (percentage >= 40) return "text-amber-500";
    return "text-orange-500";
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-12 h-12 transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-out", getColor())}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-medium text-slate-700">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
};

const testSubjects: TestSubject[] = [
  {
    id: "history",
    icon: "📚",
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
    icon: "⚖️",
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
    icon: "🌍",
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
    icon: "💰",
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
    icon: "🔬",
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
    icon: "📰",
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

const TestSeries = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      {/* Subject-Wise Banner */}
      <div className="bg-gradient-to-r from-[#D2EDDD] to-[#F1F7D8] rounded-2xl p-6 md:p-10 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group border border-[#C7DD66]/20 shadow-sm">
        {/* Content */}
        <div className="flex-1 relative z-10">
          <h2 className="text-2xl md:text-3xl font-medium text-[#0F172A] mb-6 tracking-tight">Subject-Wise Test Series</h2>

          <div className="">
            <div className="flex items-center gap-3 text-base md:text-lg text-slate-700/90 font-medium">
              <div className="bg-white/60 p-1 rounded-lg">
                <Library className="w-5 h-5 text-emerald-600" />
              </div>
              <span>25 test sets per subject</span>
            </div>

            <div className="flex items-center gap-3 text-base md:text-lg text-slate-700/90 font-medium">
              <div className="bg-white/60 p-1 rounded-lg">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <span>Fixed syllabus + dynamic current affairs</span>
            </div>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="w-full md:w-1/3 max-w-[300px] relative z-10 transition-transform duration-500 group-hover:scale-105 select-none">
          <img
            src={testHero}
            alt="Subject Wise Tests"
            className="w-[150px] md:w-[250px] h-auto object-contain drop-shadow-xl"
          />
        </div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-emerald-100/30 rounded-br-full" />
        <div className="absolute bottom-4 left-1/4 w-32 h-32 bg-emerald-50/20 rounded-full blur-3xl opacity-60" />
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-12">
        {testSubjects.map((subject, index) => (
          <div
            key={index}
            className="bg-card rounded-xl p-4 border border-border shadow-card hover:shadow-card-hover transition-shadow flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", subject.iconBg)}>
                  {subject.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 leading-tight ">{subject.name}</h3>
                  <p className="text-[13px] text-slate-400 font-medium">
                    {subject.testsAvailable} Tests Available
                  </p>
                </div>
              </div>
              <CircularProgress completed={subject.completed} total={subject.total} />
            </div>

            {/* Difficulty Badge */}
            <div className="mb-2">
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                  subject.difficulty === "Easy" && "bg-emerald-50 text-emerald-600",
                  subject.difficulty === "Moderate" && "bg-[#fdff6a3f] text-[#7F7F00] ",
                  subject.difficulty === "Hard" && "bg-orange-50 text-orange-600"
                )}
              >
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  subject.difficulty === "Easy" && "bg-emerald-500",
                  subject.difficulty === "Moderate" && "bg-amber-500",
                  subject.difficulty === "Hard" && "bg-orange-500"
                )} />
                {subject.difficulty}
              </div>
            </div>

            {/* Stats Items */}
            <div className="flex flex-wrap items-center gap-4 mb-6 mt-auto">
              {subject.items.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={cn("p-1 rounded-md", item.bg, item.color)}>
                    {item.icon}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Action */}
            <Button
              className="w-full h-12 bg-[#0F172A] text-white hover:bg-[#1E293B] rounded-[14px] text-sm font-medium border-0 transition-all active:scale-[0.98]"
              onClick={() => navigate(`/test-series/${subject.id}`)}
            >
              View Tests
            </Button>
          </div>
        ))}
      </div>

      {/* Special Full-Length Tests */}
      <section>
        <h2 className="text-xl font-medium text-slate-900 mb-6">Special Full-Length Tests</h2>
        <div className="bg-[#C7DD66] rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-12 relative overflow-hidden group mb-12 shadow-sm">
          {/* Subtle Square Patterns */}
          <div className="absolute top-4 left-4 w-32 h-32 bg-white/20 rounded-3xl rotate-12 -translate-x-12 -translate-y-8" />
          <div className="absolute top-1/2 right-4 w-24 h-24 bg-white/10 rounded-2xl -rotate-12 translate-x-8" />
          <div className="absolute bottom-4 right-20 w-16 h-16 bg-white/15 rounded-xl rotate-45" />

          {/* Left Illustration */}
          <div className="w-full md:w-auto flex justify-center relative z-10 transition-all duration-500 group-hover:scale-105">
            <img
              src={testImage}
              alt="Test Illustration"
              className="w-[120px] md:w-[150px] h-auto object-contain drop-shadow-lg"
            />
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left relative z-10">
            <h3 className="text-2xl md:text-3xl font-medium text-[#1E293B] mb-1">TNPSC Mock – 2026</h3>
            <p className="text-base md:text-lg text-[#1E293B]/70 font-medium mb-6">Full-Length Test</p>

            <div className="space-y-4 mb-8">
              <p className="text-sm md:text-base text-[#1E293B]/80 font-medium">
                Available from: <span className="underline decoration-slate-400/30">15 Jan 2026</span>
              </p>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs font-medium text-[#1E293B]/90">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/30 rounded-full">
                  <Clock className="w-3.5 h-3.5 opacity-70" /> 3 Hrs
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/30 rounded-full">
                  <FileText className="w-3.5 h-3.5 opacity-70" /> 200 Qs
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/30 rounded-full">
                  <Trophy className="w-3.5 h-3.5 opacity-70" /> 300 Marks
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="bg-[#F1F7D8] text-[#7A8A3E] px-8 py-3.5 rounded-[14px] font-medium text-sm shadow-sm min-w-[160px] text-center">
                Coming Soon
              </div>
              <Button
                variant="outline"
                className="w-full sm:w-auto px-10 h-[52px] rounded-[14px] bg-[#0F172A] hover:bg-[#1E293B] text-white hover:text-white font-medium text-sm transition-all duration-300 border-none shadow-lg"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default TestSeries;
