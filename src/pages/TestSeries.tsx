import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import {
  StreakWidget,
  LeaderboardWidget,
  ScheduleWidget,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Trophy, Library, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import svgPaths from './svg-qnm9pk5qsq';
import testImage from "../assets/test-image.png";
import testHero from "../assets/test-hero.png";

interface TestSubject {
  id: string;
  icon: string;
  name: string;
  testsAvailable: number;
  completed: number;
  total: number;
  difficulty: "Easy" | "Moderate" | "Hard";
  tags: string[];
}

const testSubjects: TestSubject[] = [
  {
    id: "history",
    icon: "📚",
    name: "History",
    testsAvailable: 25,
    completed: 6,
    total: 25,
    difficulty: "Moderate",
    tags: ["25 Apt", "75 History + CA", "100 Lang"],
  },
  {
    id: "polity",
    icon: "⚖️",
    name: "Polity",
    testsAvailable: 25,
    completed: 0,
    total: 25,
    difficulty: "Hard",
    tags: ["25 Apt", "75 Polity+ CA", "100 Lang"],
  },
  {
    id: "geography",
    icon: "🌍",
    name: "Geography",
    testsAvailable: 25,
    completed: 20,
    total: 25,
    difficulty: "Easy",
    tags: ["25 Apt", "75 Geography+ CA", "100 Lang"],
  },
  {
    id: "economy",
    icon: "💰",
    name: "Economy",
    testsAvailable: 25,
    completed: 23,
    total: 25,
    difficulty: "Easy",
    tags: ["25 Apt", "75 Economy+ CA", "100 Lang"],
  },
  {
    id: "science-tech",
    icon: "🔬",
    name: "Science & Tech",
    testsAvailable: 25,
    completed: 10,
    total: 25,
    difficulty: "Moderate",
    tags: ["25 Apt", "75 Science + Tech + CA", "100 Lang"],
  },
  {
    id: "current-affairs",
    icon: "📰",
    name: "Current Affairs",
    testsAvailable: 25,
    completed: 10,
    total: 25,
    difficulty: "Easy",
    tags: ["25 Apt", "75 Current Affairs", "100 Lang"],
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
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-6 tracking-tight">Subject-Wise Test Series</h2>

          <div className="">
            <div className="flex items-center gap-3 text-base md:text-lg text-slate-700/90 font-medium">
              <div className="bg-white/60  rounded-lg">
                <Library className="w-5 h-5 text-emerald-600" />
              </div>
              <span>25 test sets per subject</span>
            </div>

            <div className="flex items-center gap-3 text-base md:text-lg text-slate-700/90 font-medium">
              <div className="bg-white/60 rounded-lg">
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
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {testSubjects.map((subject, index) => (
          <div
            key={index}
            className="bg-card rounded-xl p-4 border border-border shadow-card hover:shadow-card-hover transition-shadow flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{subject.icon}</span>
                <div>
                  <h3 className="font-semibold">{subject.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {subject.testsAvailable} Tests Available
                  </p>
                </div>
              </div>
              <div className="text-sm font-bold bg-muted rounded-full px-2 py-1">
                {subject.completed}/{subject.total}
              </div>
            </div>

            {/* Difficulty Badge */}
            <div>
              <Badge
                variant="outline"
                className={cn(
                  "mb-3",
                  subject.difficulty === "Easy" && "border-success text-success",
                  subject.difficulty === "Moderate" && "border-warning text-warning",
                  subject.difficulty === "Hard" && "border-destructive text-destructive"
                )}
              >
                {subject.difficulty}
              </Badge>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
              {subject.tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Action */}
            <div className="mt-auto">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate(`/test-series/${subject.id}`)}
              >
                View Tests
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Special Full-Length Tests */}
      <section>
        <h2 className="text-lg font-semibold mb-6">Special Full-Length Tests</h2>
        <div className="bg-[#C7DD66] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-12 relative overflow-hidden group mb-8 border border-[#B8CE55]/20">
          {/* Subtle Square Patterns from Image */}
          <div className="absolute top-4 left-4 w-32 h-32 bg-white/20 rounded-3xl rotate-12 -translate-x-12 -translate-y-8" />
          <div className="absolute top-1/2 right-4 w-24 h-24 bg-white/10 rounded-2xl -rotate-12 translate-x-8" />
          <div className="absolute bottom-4 right-20 w-16 h-16 bg-white/15 rounded-xl rotate-45" />
          <div className="absolute top-1/4 left-1/2 w-40 h-40 bg-white/5 rounded-[40px] rotate-12" />

          {/* Left Illustration */}
          <div className="w-full md:w-auto flex justify-center relative z-10 transition-transform duration-500 group-hover:scale-105">
            <img
              src={testImage}
              alt="Test Illustration"
              className="w-[120px] md:w-[150px] h-auto object-contain"
            />
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-1">TNPSC Mock – 2026</h3>
            <p className="text-base md:text-lg text-[#1E293B]/70 font-medium mb-4">Full-Length Test</p>

            <div className="space-y-3 mb-6">
              <p className="text-sm md:text-base text-[#1E293B]/80">
                Available from: <span className="font-bold">15 Jan 2026</span>
              </p>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-sm font-bold text-[#1E293B]">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Clock className="w-4 h-4 opacity-70" /> 3 Hrs
                </span>
                <span className="opacity-30">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <FileText className="w-4 h-4 opacity-70" /> 200 Qs
                </span>
                <span className="opacity-30">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Trophy className="w-4 h-4 opacity-70" /> 300 Marks
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="bg-[#F1F7D8] text-[#7A8A3E] px-8 py-3 rounded-xl font-bold text-base shadow-sm min-w-[160px] text-center">
                Coming Soon
              </div>
              <Button
                variant="outline"
                className="w-full sm:w-auto px-10 py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground font-bold text-base transition-all duration-300 border-none"
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
