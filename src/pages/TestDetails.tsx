import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import {
  StreakWidget,
  LeaderboardWidget,
  ScheduleWidget,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileText, Trophy, List, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Test {
  id: number;
  name: string;
  topic: string;
  duration: string;
  questions: number;
  marks: number;
  status: "not_started" | "in_progress" | "completed";
  score?: string;
}

const generateTests = (subject: string): Test[] => {
  const topics = {
    history: ["Ancient History – Sources", "Freedom Movement", "Post-Independence India", "Medieval History – Delhi Sultanate", "Modern Indian History"],
    polity: ["Constitutional Framework", "Fundamental Rights", "Directive Principles", "Union Government", "State Government"],
    geography: ["Physical Geography", "Indian Geography", "World Geography", "Climate", "Natural Resources"],
    economy: ["Microeconomics", "Macroeconomics", "Indian Economy", "Banking", "International Trade"],
    science: ["Physics Concepts", "Chemistry Basics", "Biology", "Technology & IT", "Space Science"],
    current: ["National Affairs", "International Affairs", "Sports", "Awards", "Government Schemes"],
  };

  const subjectTopics = topics[subject as keyof typeof topics] || topics.history;

  return Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `${subject.charAt(0).toUpperCase() + subject.slice(1)} – Test ${String(i + 1).padStart(2, "0")}`,
    topic: subjectTopics[i % subjectTopics.length],
    duration: "2 Hrs",
    questions: 200,
    marks: 300,
    status: i < 2 ? "completed" : i === 2 ? "in_progress" : "not_started" as const,
    score: i < 2 ? `${220 + Math.floor(Math.random() * 60)}/300` : undefined,
  }));
};

const TestDetails = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"featured" | "completed">("featured");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const subjectName = subject
    ? subject.charAt(0).toUpperCase() + subject.slice(1).replace("-", " & ")
    : "History";

  const tests = generateTests(subject || "history");
  const completedTests = tests.filter((t) => t.status === "completed");
  const featuredTests = tests.filter((t) => t.status !== "completed");

  const displayTests = activeTab === "completed" ? completedTests : featuredTests;

  return (
    <DashboardLayout>
      {/* Back Button and Title */}
      <button
        onClick={() => navigate('/test-series')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2 text-[10px] font-bold tracking-widest uppercase"
      >
        <ArrowLeft className="w-3 h-3" />
        BACK TO TEST SERIES
      </button>
      <h1 className="text-3xl font-bold text-foreground mb-4">Test Sets</h1>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span className="text-muted-foreground">{subjectName}</span>
        <span className="text-muted-foreground">→</span>
        <span className="text-foreground font-medium">Test Series</span>
      </div>

      {/* Tabs and View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("featured")}
            className={cn(
              "pb-2 text-sm font-medium transition-colors relative",
              activeTab === "featured"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Featured
            {activeTab === "featured" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "pb-2 text-sm font-medium transition-colors relative",
              activeTab === "completed"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Completed
            {activeTab === "completed" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        </div>

        <div className="flex gap-1 bg-accent p-1 rounded-lg">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "text-accent-foreground hover:bg-primary/10"
            )}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-accent-foreground hover:bg-primary/10"
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Test List/Grid */}
      <div className={cn(
        "transition-all duration-300",
        viewMode === "list" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      )}>
        {displayTests.map((test) => (
          <div
            key={test.id}
            className={cn(
              "bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all flex flex-col",
              viewMode === "list" ? "p-5" : "p-6"
            )}
          >
            <div className={cn(
              "flex gap-4 h-full",
              viewMode === "list" ? "flex-col lg:flex-row lg:items-center justify-between" : "flex-col"
            )}>
              {/* Test Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-base mb-1">{test.name}</h3>
                <p className="text-sm text-muted-foreground">{test.topic}</p>
              </div>

              {/* Stats and Action */}
              <div className={cn(
                "flex gap-4",
                viewMode === "list" ? "flex-col sm:flex-row items-start sm:items-center" : "flex-col mt-4"
              )}>
                {/* Stats Badge */}
                <div className={cn(
                  "inline-flex items-center gap-2 bg-accent/30 text-accent-foreground px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap",
                  viewMode === "grid" ? "w-fit" : ""
                )}>
                  <span className="flex items-center gap-1">
                    ⏱️ {test.duration}
                  </span>
                  <span className="text-accent-foreground/20 italic">•</span>
                  <span className="flex items-center gap-1">
                    📄 {test.questions} Qs
                  </span>
                  <span className="text-accent-foreground/20 italic">•</span>
                  <span className="flex items-center gap-1">
                    🏆 {test.marks} Marks
                  </span>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => {
                    if (test.status === "completed") {
                      navigate(`/test-series/${subject}/test/${test.id}/analytics`);
                    } else {
                      navigate(`/test-series/${subject}/test/${test.id}`);
                    }
                  }}
                  className={cn(
                    "rounded-xl font-bold transition-all",
                    viewMode === "list" ? "min-w-[140px]" : "w-full mt-2",
                    test.status === "completed"
                      ? "bg-card text-foreground border-2 border-border hover:bg-muted"
                      : "bg-[#0F172A] text-white hover:bg-[#0F172A]/90"
                  )}
                  size={viewMode === "list" ? "lg" : "default"}
                  variant={test.status === "completed" ? "outline" : "default"}
                >
                  {test.status === "completed"
                    ? "View Analysis"
                    : test.status === "in_progress"
                      ? "Continue"
                      : "Start Test"}
                </Button>
              </div>
            </div>

            {/* Score Badge for Completed Tests */}
            {test.score && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Your Score:</span>
                  <Badge className="bg-success/10 text-success border border-success/20 font-semibold">
                    {test.score}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default TestDetails;
