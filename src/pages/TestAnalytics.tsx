import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import {
    StreakWidget,
    LeaderboardWidget,
    ScheduleWidget,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    Clock,
    Trophy,
    Target,
    TrendingUp,
    CheckCircle2,
    XCircle,
    AlertCircle,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Zap,
    Medal,
} from "lucide-react";
import { useState } from "react";

interface QuestionAnalysis {
    id: number;
    question: string;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard";
    userAnswer: number | null;
    correctAnswer: number;
    options: string[];
    timeTaken: number;
    isCorrect: boolean;
    markedForReview: boolean;
}

// Generate sample analytics data
const generateAnalyticsData = () => {
    const categories = ["Aptitude", "General Knowledge", "Reasoning", "English"];
    const difficulties: ("Easy" | "Medium" | "Hard")[] = ["Easy", "Medium", "Hard"];

    return Array.from({ length: 100 }, (_, i) => {
        const correctAnswer = Math.floor(Math.random() * 4);
        const userAnswer = Math.random() > 0.3 ? Math.floor(Math.random() * 4) : null;

        return {
            id: i + 1,
            question: `Question ${i + 1}: This is a sample question text that demonstrates how questions appear in the analysis view for review purposes.`,
            category: categories[i % categories.length],
            difficulty: difficulties[i % difficulties.length],
            userAnswer,
            correctAnswer,
            options: [
                `Option A - This is choice one`,
                `Option B - This is choice two`,
                `Option C - This is choice three`,
                `Option D - This is choice four`,
            ],
            timeTaken: Math.floor(Math.random() * 120) + 30,
            isCorrect: userAnswer === correctAnswer,
            markedForReview: Math.random() > 0.8,
        };
    });
};

const TestAnalytics = () => {
    const { subject, testId } = useParams<{ subject: string; testId: string }>();
    const navigate = useNavigate();
    const questions = generateAnalyticsData();
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
    const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "unattempted">("all");

    // Calculate statistics
    const totalQuestions = questions.length;
    const attempted = questions.filter((q) => q.userAnswer !== null).length;
    const correct = questions.filter((q) => q.isCorrect).length;
    const incorrect = questions.filter((q) => q.userAnswer !== null && !q.isCorrect).length;
    const unattempted = totalQuestions - attempted;
    const score = Math.round((correct / totalQuestions) * 300);
    const percentage = Math.round((correct / totalQuestions) * 100);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const totalTimeTaken = questions.reduce((sum, q) => sum + q.timeTaken, 0);
    const avgTimePerQuestion = Math.round(totalTimeTaken / attempted);

    // Category-wise analysis
    const categoryStats = questions.reduce((acc, q) => {
        if (!acc[q.category]) {
            acc[q.category] = { total: 0, correct: 0, attempted: 0 };
        }
        acc[q.category].total++;
        if (q.userAnswer !== null) acc[q.category].attempted++;
        if (q.isCorrect) acc[q.category].correct++;
        return acc;
    }, {} as Record<string, { total: number; correct: number; attempted: number }>);

    // Difficulty-wise analysis
    const difficultyStats = questions.reduce((acc, q) => {
        if (!acc[q.difficulty]) {
            acc[q.difficulty] = { total: 0, correct: 0, attempted: 0 };
        }
        acc[q.difficulty].total++;
        if (q.userAnswer !== null) acc[q.difficulty].attempted++;
        if (q.isCorrect) acc[q.difficulty].correct++;
        return acc;
    }, {} as Record<string, { total: number; correct: number; attempted: number }>);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatTotalTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const toggleQuestion = (id: number) => {
        setExpandedQuestion(expandedQuestion === id ? null : id);
    };

    // Filter questions
    const filteredQuestions = questions.filter((q) => {
        if (filter === "all") return true;
        if (filter === "correct") return q.isCorrect;
        if (filter === "incorrect") return q.userAnswer !== null && !q.isCorrect;
        if (filter === "unattempted") return q.userAnswer === null;
        return true;
    });

    const subjectName = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : "History";

    return (
        <DashboardLayout>
            {/* Back Button and Title */}
            <button
                onClick={() => navigate(`/test-series/${subject}`)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2 text-[10px] font-bold tracking-widest uppercase"
            >
                <ArrowLeft className="w-3 h-3" />
                BACK TO TESTS
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h1 className="text-3xl font-bold text-foreground">Test Analysis</h1>
                <Badge className="bg-accent text-accent-foreground px-3 py-1.5 text-sm font-semibold self-start sm:self-auto">
                    <Medal className="w-4 h-4 mr-1.5" />
                    Rank #12
                </Badge>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 mb-8 text-sm">
                <span className="text-muted-foreground">{subjectName}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-foreground font-medium">Test Series</span>
            </div>

            {/* Main Score Card */}
            <div className="bg-accent rounded-2xl p-6 mb-6">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Score Circle with Progress */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                            {/* SVG Circular Progress */}
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                {/* Background Circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="hsl(var(--border))"
                                    strokeWidth="8"
                                />
                                {/* Progress Circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${percentage * 2.83} 283`}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            {/* Center Content */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-card shadow-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-3xl sm:text-4xl font-bold text-foreground">{score}</div>
                                        <div className="text-xs text-muted-foreground">out of 300</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 text-lg font-bold text-accent-foreground">{percentage}% Score</div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-card rounded-xl p-4 text-center border border-border shadow-sm">
                                <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                                <div className="text-2xl font-bold text-foreground">{accuracy}%</div>
                                <div className="text-xs text-muted-foreground">Accuracy</div>
                            </div>
                            <div className="bg-card rounded-xl p-4 text-center border border-border shadow-sm">
                                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                                <div className="text-2xl font-bold text-foreground">{formatTotalTime(totalTimeTaken)}</div>
                                <div className="text-xs text-muted-foreground">Time Taken</div>
                            </div>
                            <div className="bg-card rounded-xl p-4 text-center border border-border shadow-sm">
                                <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
                                <div className="text-2xl font-bold text-foreground">{avgTimePerQuestion}s</div>
                                <div className="text-xs text-muted-foreground">Avg/Question</div>
                            </div>
                            <div className="bg-card rounded-xl p-4 text-center border border-border shadow-sm">
                                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                                <div className="text-2xl font-bold text-foreground">#12</div>
                                <div className="text-xs text-muted-foreground">Rank</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
                <div className="bg-green-100 dark:bg-green-900/40 rounded-xl p-3 sm:p-4 text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-400">{correct}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-500">Correct</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/40 rounded-xl p-3 sm:p-4 text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-red-500 flex items-center justify-center mx-auto mb-2">
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-red-700 dark:text-red-400">{incorrect}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-red-600 dark:text-red-500">Incorrect</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/60 rounded-xl p-3 sm:p-4 text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-400 flex items-center justify-center mx-auto mb-2">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-gray-700 dark:text-gray-300">{unattempted}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-gray-500">Skipped</div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-xl p-3 sm:p-4 text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 flex items-center justify-center mx-auto mb-2">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-400">{attempted}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-500">Attempted</div>
                </div>
            </div>

            {/* Performance Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* Category-wise */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <h2 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Category Performance
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(categoryStats).map(([category, stats]) => {
                            const catPercentage = Math.round((stats.correct / stats.total) * 100);
                            return (
                                <div key={category}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-foreground">{category}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {stats.correct}/{stats.total}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Progress value={catPercentage} className="h-2 flex-1" />
                                        <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                                            {catPercentage}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Difficulty-wise */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <h2 className="text-base sm:text-lg font-bold text-foreground mb-4">
                        Difficulty Breakdown
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        {(["Easy", "Medium", "Hard"] as const).map((difficulty) => {
                            const stats = difficultyStats[difficulty] || { total: 0, correct: 0, attempted: 0 };
                            const diffPercentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                            return (
                                <div
                                    key={difficulty}
                                    className={cn(
                                        "rounded-xl p-4 text-center border-2",
                                        difficulty === "Easy" && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                                        difficulty === "Medium" && "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
                                        difficulty === "Hard" && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                                    )}
                                >
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "mb-2 text-xs",
                                            difficulty === "Easy" && "border-green-500 text-green-600",
                                            difficulty === "Medium" && "border-amber-500 text-amber-600",
                                            difficulty === "Hard" && "border-red-500 text-red-600"
                                        )}
                                    >
                                        {difficulty}
                                    </Badge>
                                    <div className="text-xl sm:text-2xl font-bold text-foreground">
                                        {stats.correct}/{stats.total}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {diffPercentage}% correct
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Question Analysis */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Filter Tabs */}
                <div className="p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-base sm:text-lg font-bold text-foreground">
                            Question Analysis
                        </h2>
                        <div className="flex gap-1 p-1 bg-muted rounded-lg">
                            {[
                                { key: "all", label: "All", count: totalQuestions },
                                { key: "correct", label: "Correct", count: correct },
                                { key: "incorrect", label: "Wrong", count: incorrect },
                                { key: "unattempted", label: "Skipped", count: unattempted },
                            ].map(({ key, label, count }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key as typeof filter)}
                                    className={cn(
                                        "px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors",
                                        filter === key
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {label}
                                    <span className="ml-1 opacity-70">({count})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
                    {filteredQuestions.map((q) => (
                        <div
                            key={q.id}
                            className={cn(
                                "border-b border-border last:border-b-0 transition-colors",
                                q.isCorrect && "hover:bg-green-50/50 dark:hover:bg-green-950/20",
                                !q.isCorrect && q.userAnswer !== null && "hover:bg-red-50/50 dark:hover:bg-red-950/20",
                                q.userAnswer === null && "hover:bg-muted/50"
                            )}
                        >
                            {/* Question Row */}
                            <button
                                onClick={() => toggleQuestion(q.id)}
                                className="w-full p-4 flex items-center gap-3 text-left"
                            >
                                {/* Status Icon */}
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    q.isCorrect && "bg-green-100 dark:bg-green-900/40",
                                    !q.isCorrect && q.userAnswer !== null && "bg-red-100 dark:bg-red-900/40",
                                    q.userAnswer === null && "bg-gray-100 dark:bg-gray-800"
                                )}>
                                    {q.isCorrect ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    ) : q.userAnswer !== null ? (
                                        <XCircle className="w-4 h-4 text-red-600" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>

                                {/* Question Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-semibold text-foreground text-sm">
                                            Question {q.id}
                                        </span>
                                        <Badge variant="outline" className="text-[10px]">
                                            {q.category}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-[10px]",
                                                q.difficulty === "Easy" && "border-green-500 text-green-600",
                                                q.difficulty === "Medium" && "border-amber-500 text-amber-600",
                                                q.difficulty === "Hard" && "border-red-500 text-red-600"
                                            )}
                                        >
                                            {q.difficulty}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{q.question}</p>
                                </div>

                                {/* Time & Expand */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-xs text-muted-foreground hidden sm:block">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {formatTime(q.timeTaken)}
                                    </div>
                                    {expandedQuestion === q.id ? (
                                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                            </button>

                            {/* Expanded Details */}
                            {expandedQuestion === q.id && (
                                <div className="px-4 pb-4 pt-0 ml-11">
                                    <div className="bg-muted/50 rounded-xl p-4">
                                        <p className="text-sm text-foreground mb-4">{q.question}</p>
                                        <div className="space-y-2">
                                            {q.options.map((option, idx) => (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "p-3 rounded-lg flex items-center gap-3 text-sm",
                                                        idx === q.correctAnswer && "bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700",
                                                        idx === q.userAnswer && idx !== q.correctAnswer && "bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700",
                                                        idx !== q.correctAnswer && idx !== q.userAnswer && "bg-white dark:bg-gray-800 border border-border"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                                                        idx === q.correctAnswer && "bg-green-500 text-white",
                                                        idx === q.userAnswer && idx !== q.correctAnswer && "bg-red-500 text-white",
                                                        idx !== q.correctAnswer && idx !== q.userAnswer && "bg-gray-200 dark:bg-gray-700 text-foreground"
                                                    )}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="flex-1">{option}</span>
                                                    {idx === q.correctAnswer && (
                                                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                                    )}
                                                    {idx === q.userAnswer && idx !== q.correctAnswer && (
                                                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Time: {formatTime(q.timeTaken)}</span>
                                            {q.markedForReview && (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    Marked for Review
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                    variant="outline"
                    onClick={() => navigate(`/test-series/${subject}/test/${testId}`)}
                    className="flex-1"
                    size="lg"
                >
                    Retake Test
                </Button>
                <Button
                    onClick={() => navigate(`/test-series/${subject}`)}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    size="lg"
                >
                    Back to Test Series
                </Button>
            </div>
        </DashboardLayout>
    );
};

export default TestAnalytics;
