import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { cn, getMediaUrl } from "@/lib/utils";
import {
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Info,
    Bell,
    Calendar,
    Loader2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import authService, { UserMe } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/env";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import studyService from "@/services/study.service";
import { LeaderboardWidget, type LeaderboardEntry } from "@/components/dashboard/LeaderboardWidget";
import pic from "@/assets/pic.png";
import trophyHero from "@/assets/results/trophy-hero.png";
import trophyRank from "@/assets/results/trophy-rank.png";
import scoreMedium from "@/assets/results/score-medium.png";
import scoreLow from "@/assets/results/score-low.png";
import scienceIcon from "@/assets/results/science-icon.png";
import geographyIcon from "@/assets/results/geography-icon.png";
import historyIcon from "@/assets/results/history-icon.png";
import correctIcon from "@/assets/results/correct-icon.png";
import incorrectIcon from "@/assets/results/incorrect-icon.png";
import unattemptedIcon from "@/assets/results/unattempted-icon.png";
import clockIcon from "@/assets/results/clock-icon.png";

import { testSeriesOverallService } from "@/services/testSeriesOverall.service";
import { testSeriesSubjectService } from "@/services/testSeriesSubject.service";

// ── Types ──
interface UnitTopic {
    name: string;
    score: number;
    total: number;
}

interface UnitAnalysis {
    name: string;
    icon: string;
    badge: string;
    badgeColor: string;
    score: number;
    total: number;
    questionCount: number;
    topics: UnitTopic[];
}

// ── Circular Progress Ring ──
const CircularProgress = ({ value, total, size = 56, strokeWidth = 4, color = "#14B8A6" }: { value: number; total: number; size?: number; strokeWidth?: number; color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = (value / total) * 100;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700" />
        </svg>
    );
};

// ── Score Color Helper ──
const getScoreColor = (score: number, total: number) => {
    const pct = (score / total) * 100;
    if (pct >= 80) return "text-green-600";
    if (pct >= 50) return "text-yellow-600";
    return "text-red-600";
};


// ── Main Component ──
const TestAnalytics = () => {
    const { subject, testId } = useParams<{ subject: string; testId: string }>();
    const [searchParams] = useSearchParams();
    const weekNoStr = searchParams.get('week');
    const weekNo = weekNoStr ? parseInt(weekNoStr) : null;
    const planIdStr = searchParams.get('plan_id');
    const planId = planIdStr ? parseInt(planIdStr) : null;

    const navigate = useNavigate();
    const { user } = useAuth();
    const isDesktop = useMediaQuery("(min-width: 1280px)");

    const isOverall = subject?.toLowerCase().includes('overall') || subject?.toLowerCase() === 'general';
    const isSubject = subject?.toLowerCase() === 'subject';

    const { data: resultData, isLoading: resultLoading, refetch } = useQuery({
        queryKey: [
            subject === 'weekly' ? 'weekly-test-result' : 
            subject === 'monthly' ? 'monthly-test-result' : 
            'overall-test-result', 
            user?.id, 
            testId, 
            planId
        ],
        queryFn: async () => {
            if (subject === 'weekly' || subject === 'subject-weekly') {
                const wNo = weekNo || parseInt(testId || "1");
                return await studyService.getWeeklyTestResult(user!.id, wNo, planId || undefined);
            } else if (subject === 'monthly' || subject === 'subject-monthly') {
                const mNoStr = searchParams.get('month');
                const mNo = mNoStr ? parseInt(mNoStr) : parseInt(testId || "1");
                return await studyService.getMonthlyTestResult(user!.id, mNo, planId || undefined);
            } else if (isOverall) {
                return await testSeriesOverallService.getResult(parseInt(testId || "0"), planId || 0);
            } else if (isSubject) {
                return await testSeriesSubjectService.getResult(planId || 0, parseInt(testId || "0"));
            }
            return null;
        },
        enabled: !!user?.id && (
            (subject?.includes('weekly') || subject?.includes('monthly')) || 
            ((isOverall || isSubject) && !!planId)
        ),
    });

    const { data: dashboardData, refetch: refetchDashboard } = useQuery({
        queryKey: ['dashboard-data', user?.id, planId],
        queryFn: () => studyService.getDashboardData(user!.id, planId || undefined),
        enabled: !!user?.id,
    });

    // Handle auto-refresh when window gains focus
    useEffect(() => {
        const handleFocus = () => {
            refetch();
            refetchDashboard();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [refetch, refetchDashboard]);

    // Helper to map backend leaderboard entries
    const mapLeaderboard = (lb: any) => lb?.leaderboard?.map((l: any) => ({
        rank: l.rank,
        name: l.name,
        initials: l.initials || l.name.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase(),
        marks: l.total_marks || l.score,
        accuracy: `${l.accuracy}%`,
        isYou: l.is_current_user || l.is_you,
        color: (l.is_current_user || l.is_you) ? "bg-slate-500" : (l.rank === 1 ? "bg-amber-500" : "bg-blue-600")
    })) || [];

    // Map backend data to frontend format
    const leaderboards = dashboardData?.leaderboards;
    const data = resultData ? {
        correct: resultData.correct_answers || 0,
        incorrect: resultData.wrong_answers || 0,
        unattempted: resultData.unattempted || 0,
        total: resultData.total_questions || 0,
        timeTaken: resultData.time_spent_seconds ? `${Math.floor(resultData.time_spent_seconds / 60)}m ${resultData.time_spent_seconds % 60}s` : "0m",
        score: resultData.correct_answers || 0,
        totalMarks: resultData.total_questions || 0,
        accuracy: resultData.score_percentage || 0,
        units: resultData.unit_analysis?.map((partData: any) => {
            const percentage = partData.total > 0 ? (partData.correct / partData.total) * 100 : 0;
            const badge = percentage >= 80 ? "Excellence" : percentage >= 50 ? "Moderate" : "Needs Improvement";
            const badgeColor = badge === "Excellence" ? "bg-green-100 text-green-700" :
                badge === "Moderate" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700";

            const allTopics: any[] = [];
            if (partData.subjects) {
                partData.subjects.forEach((subj: any) => {
                    if (subj.topics) {
                        subj.topics.forEach((t: any) => {
                            allTopics.push({
                                name: t.topic,
                                score: t.correct,
                                total: t.total
                            });
                        });
                    }
                });
            }

            return {
                name: partData.part,
                icon: partData.part.toLowerCase().includes('science') ? scienceIcon : partData.part.toLowerCase().includes('history') ? historyIcon : geographyIcon,
                badge: badge,
                badgeColor: badgeColor,
                score: partData.correct,
                total: partData.total,
                questionCount: partData.total,
                topics: allTopics
            };
        }) || [],
        leaderboard: mapLeaderboard(resultData), // Test specific leaderboard
        yourRank: leaderboards?.weekly?.your_rank || leaderboards?.overall?.your_rank || dashboardData?.daily_performance?.current_rank || resultData.your_rank || 0,
        questions: resultData.questions || [],
        weeklyData: mapLeaderboard(leaderboards?.weekly),
        overallData: mapLeaderboard(leaderboards?.overall),
        headerLeaderboard: mapLeaderboard(dashboardData?.leaderboard) // legacy fallback
    } : null;

    const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
    const [showQuestions, setShowQuestions] = useState(false);
    const questionsRef = useRef<HTMLDivElement>(null);

    const toggleQuestions = () => {
        setShowQuestions(prev => !prev);
        if (!showQuestions) {
            setTimeout(() => {
                questionsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        }
    };

    const userName = user?.full_name || user?.username || "Aspirant";

    const completedDate = resultData?.submitted_at
        ? new Date(resultData.submitted_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const handleBack = () => {
        if (subject?.toLowerCase().includes('weekly') || subject?.toLowerCase().includes('monthly')) {
            const params = new URLSearchParams();
            if (planId) params.set("plan_id", planId.toString());
            navigate(`/study-plan${params.toString() ? `?${params.toString()}` : ""}`, { replace: true });
        } else {
            navigate("/test-series", { replace: true });
        }
    };

    if (resultLoading || !user) {
        return (
            <DashboardLayout
                hideHeader={isDesktop}
                activePath={subject === 'weekly' ? '/study-plan' : '/test-series'}
            >
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground animate-pulse font-medium">Loading test results...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!data) {
        return (
            <DashboardLayout
                hideHeader={isDesktop}
                activePath={subject === 'weekly' ? '/study-plan' : '/test-series'}
            >
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <p className="text-muted-foreground font-medium text-lg">No results found for this test.</p>
                    <Button onClick={handleBack} variant="outline" className="rounded-xl">Go Back</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            hideHeader={isDesktop}
            activePath={subject === 'weekly' ? '/study-plan' : '/test-series'}
            rightSidebar={
                <div className="space-y-6">


                    {/* Your Rank Card */}
                    <div className="bg-[#FFFAFA] rounded-2xl p-5 sm:p-6 flex flex-col justify-center min-h-[140px] shadow-sm overflow-hidden relative">
                        <div className="relative z-10">
                            <p className="text-xs sm:text-sm font-medium text-foreground">Your Rank</p>
                            <p className="text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-tight">{data.yourRank}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">Keep going!</p>
                        </div>
                        <img src={trophyRank} alt="Trophy" className="absolute -bottom-2 -right-2 w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 object-contain opacity-90 transition-transform hover:scale-105" />
                    </div>

                    {/* Leaderboard */}
                    <LeaderboardWidget 
                        weeklyData={data.weeklyData} 
                        overallData={data.overallData}
                        data={data.headerLeaderboard} 
                    />
                </div>
            }
        >
            <div className="hidden lg:block px-4 lg:px-0">
                <h1 className="text-xl sm:text-2xl font-medium text-[#1e293b] capitalize">
                    {subject === 'weekly' ? `Weekly Test Review` : subject === 'monthly' ? `Monthly Test Review` : (isOverall || isSubject) ? `Full Test Review` : 'Test Review'}
                </h1>
                <p className="text-[12px] sm:text-sm text-[#64748B] mt-0.5 font-medium">
                    {subject === 'weekly' ? `Week ${weekNo || testId}` : subject === 'monthly' ? `Month ${searchParams.get('month') || testId}` : isOverall ? `Test Set ${testId}` : 'TNPSC – Group II'} | 2026
                </p>
            </div>
            <div
                className="min-h-screen w-full rounded-4xl mt-5"
                style={{ background: 'linear-gradient(to bottom right, #FAFFFC 0%,  #FFFFFF 100%)' }}
            >
                <div className="mx-auto px-4 sm:px-6 py-6 lg:py-8">

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-10">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleBack}
                                className="p-1.5 hover:bg-muted/50 rounded-full transition-colors flex-shrink-0"
                            >
                                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Test Results</h1>
                        </div>
                        <div className="flex sm:justify-end">
                            <p className="text-[11px] sm:text-xs text-muted-foreground border border-border rounded-full px-3 py-1.5 bg-white/50 backdrop-blur-sm">
                                Completed on {completedDate}
                            </p>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-semibold text-foreground mb-2">Great Effort!</h2>
                        <p className="text-base text-muted-foreground">You are making consistent progress towards your goal.</p>
                    </div>

                    <div className=" mx-auto">
                        {/* ─── Left Column content ─── */}
                        <div className="space-y-8">
                            {/* Hero Stats Card */}
                            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-12 items-center mb-16">
                                {/* Left: Stats Card with Dividers */}
                                <div className="bg-white rounded-2xl border border-[#F1F3F9] overflow-hidden p-6 sm:p-8 lg:p-10 relative min-h-[300px] sm:min-h-[360px] flex items-center justify-center shadow-sm">
                                    {/* Cross Dividers */}
                                    <div className="absolute inset-x-6 sm:inset-x-10 inset-y-8 sm:inset-y-14 pointer-events-none opacity-50">
                                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#F1F4F8] -translate-x-1/2" />
                                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#F1F4F8] -translate-y-1/2" />
                                    </div>

                                    <div className="grid grid-cols-2 w-full relative z-10">
                                        {/* Correct */}
                                        <div className="flex flex-col items-center justify-center py-4 sm:py-6">
                                            <p className="text-[10px] sm:text-[13px] font-medium text-muted-foreground/70 mb-3 sm:mb-5 uppercase tracking-wide text-center">Correct</p>
                                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                                                <img src={correctIcon} alt="Correct" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
                                                <span className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">{data.correct}</span>
                                            </div>
                                        </div>

                                        {/* Incorrect */}
                                        <div className="flex flex-col items-center justify-center py-4 sm:py-6">
                                            <p className="text-[10px] sm:text-[13px] font-medium text-muted-foreground/70 mb-3 sm:mb-5 uppercase tracking-wide text-center">Incorrect</p>
                                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                                                <img src={incorrectIcon} alt="Incorrect" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
                                                <span className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">{data.incorrect}</span>
                                            </div>
                                        </div>

                                        {/* Unattempted */}
                                        <div className="flex flex-col items-center justify-center py-4 sm:py-6">
                                            <p className="text-[10px] sm:text-[13px] font-medium text-muted-foreground/70 mb-3 sm:mb-5 uppercase tracking-wide text-center">Unattempted</p>
                                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                                                <img src={unattemptedIcon} alt="Unattempted" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
                                                <span className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">{data.unattempted}</span>
                                            </div>
                                        </div>

                                        {/* Time Taken */}
                                        <div className="flex flex-col items-center justify-center py-4 sm:py-6">
                                            <p className="text-[10px] sm:text-[13px] font-medium text-muted-foreground/70 mb-3 sm:mb-5 uppercase tracking-wide text-center">Time Taken</p>
                                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                                                <img src={clockIcon} alt="Clock" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
                                                <span className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">{data.timeTaken}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Illustration & Score */}
                                <div className="flex flex-col items-center text-center px-4 md:px-0">
                                    <div className="relative mb-6 sm:mb-8 transform hover:scale-105 transition-transform duration-500">
                                        <div className={cn(
                                            "absolute inset-0 rounded-full blur-[60px] opacity-20",
                                            data.accuracy >= 80 ? "bg-emerald-400" : data.accuracy >= 50 ? "bg-blue-400" : "bg-orange-400"
                                        )} />
                                        <img
                                            src={data.accuracy >= 80 ? trophyHero : data.accuracy >= 50 ? scoreMedium : scoreLow}
                                            alt="Achievement"
                                            className="w-40 h-40 sm:w-56 sm:h-56 object-contain drop-shadow-xl relative z-10 animate-float"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] sm:text-sm text-muted-foreground font-medium uppercase tracking-widest">Your Score</p>
                                        <div className="text-3xl sm:text-4xl font-semibold">
                                            <span className="text-[#10B981]">{data.score}</span>
                                            <span className="text-slate-800"> / {data.totalMarks}</span>
                                        </div>
                                        <p className="text-md sm:text-lg text-slate-600 font-medium pt-2 sm:pt-3">{data.accuracy}% Accuracy</p>
                                    </div>
                                </div>
                            </div>

                            {/* Unit-Wise Analysis */}
                            <div className="bg-card rounded-2xl border border-border shadow-sm p-4 sm:p-6 lg:p-10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h3 className="text-lg  font-semibold text-foreground">Unit-Wise Analysis</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Strategic Performance insights based on this test</p>
                                    </div>
                                    <Button
                                        onClick={toggleQuestions}
                                        variant="outline"
                                        className="rounded-xl gap-2 w-full sm:text-medium sm:w-auto px-6 h-11 hover:bg-[#f3f4f6] transition-colors"
                                    >
                                        {showQuestions ? "Hide Review" : "Check All Answers"} <ArrowRight className={cn("w-4 h-4 transition-transform", showQuestions && "rotate-90")} />
                                    </Button>
                                </div>

                                {showQuestions && (
                                    <div ref={questionsRef} className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center justify-between border-b border-border pb-4">
                                            <h4 className="text-xl font-medium text-foreground">Review All Questions</h4>
                                            <p className="text-sm text-muted-foreground">{data.questions.length || 0} Questions</p>
                                        </div>

                                        <div className="space-y-6">
                                            {data.questions.map((q: any, i: number) => (
                                                <div key={q.mcq_id} className="bg-white rounded-2xl border border-border p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 text-primary text-sm font-medium shrink-0">
                                                            {i + 1}
                                                        </span>
                                                        <h5 className="sm:text-md font-medium text-foreground leading-relaxed">
                                                            {q.question}
                                                        </h5>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3 ml-0 sm:ml-12">
                                                        {/* User Choice */}
                                                        <div className={cn(
                                                            "p-4 rounded-xl border flex items-center justify-between",
                                                            q.is_correct
                                                                ? "bg-green-50/50 border-green-100 text-green-800"
                                                                : "bg-red-50/50 border-red-100 text-red-800"
                                                        )}>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs uppercase font-medium">Your Answer:</span>
                                                                <span className="text-sm font-medium">{q.user_choice}</span>
                                                            </div>
                                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-inherit">
                                                                {q.is_correct ? (
                                                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                                                                ) : (
                                                                    <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Correct Option */}
                                                        {!q.is_correct && (
                                                            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 text-blue-900 flex items-center gap-3">
                                                                <span className="text-xs uppercase font-medium">Correct Option:</span>
                                                                <span className="text-sm font-medium">{q.correct_option}</span>
                                                            </div>
                                                        )}

                                                        {/* Reason/Explanation */}
                                                        {q.reason && (
                                                            <div className="mt-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                                <div className="flex items-center gap-2 mb-2 text-slate-500">
                                                                    <Info className="w-4 h-4" />
                                                                    <span className="text-xs uppercase font-medium tracking-wider">Explanation</span>
                                                                </div>
                                                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                                                    {q.reason}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {data.units.map((unit) => {
                                        const isExpanded = expandedUnit === unit.name;
                                        const ringColor =
                                            unit.badge === "Moderate" ? "#EAB308" : "#14B8A6";

                                        return (
                                            <div key={unit.name} className={cn("bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300", isExpanded && "ring-2 ring-primary/5 shadow-md border-primary/10")}>
                                                {/* Unit Header */}
                                                <button
                                                    onClick={() => setExpandedUnit(isExpanded ? null : unit.name)}
                                                    className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-6 hover:bg-muted/10 transition-colors"
                                                >
                                                    <img src={unit.icon} alt={unit.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0" />
                                                    <div className="flex-1 text-left min-w-0">
                                                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                                            <h4 className="font-medium text-foreground text-sm sm:text-md truncate">{unit.name}</h4>
                                                            <span className={cn("text-[8px] sm:text-[9px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium uppercase tracking-wider", unit.badgeColor)}>
                                                                {unit.badge}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1">
                                                            <span className="hidden sm:inline">TNPSC Standard: </span><span className="text-foreground">{unit.questionCount} Questions</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                                        <div className="relative">
                                                            <CircularProgress value={unit.score} total={unit.total} color={ringColor} size={isDesktop ? 64 : 52} strokeWidth={isDesktop ? 5 : 4} />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-[10px] sm:text-xs font-medium text-foreground">{unit.score}</span>
                                                            </div>
                                                        </div>
                                                        {isExpanded ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />}
                                                    </div>
                                                </button>

                                                {/* Expanded Topics */}
                                                {isExpanded && (
                                                    <div className="px-3 sm:px-6 pb-6">
                                                        <div className="ml-0 ">
                                                            <div className="rounded-2xl border border-blue-100 bg-blue-50/20 overflow-hidden shadow-inner overflow-x-auto">
                                                                <div className="min-w-[400px]">
                                                                    <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] bg-blue-50/40 px-4 sm:px-5 py-3 sm:py-4 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                                                        <span>Topic Name</span>
                                                                        <span className="text-center">Score</span>
                                                                        <span className="text-center">Action</span>
                                                                    </div>
                                                                    {unit.topics.map((topic, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] px-4 sm:px-5 py-3 sm:py-4 border-t border-blue-100/50 items-center hover:bg-white/50 transition-colors"
                                                                        >
                                                                            <span className="text-xs sm:text-sm font-medium text-foreground">{topic.name}</span>
                                                                            <span className="text-center text-xs sm:text-sm font-medium">
                                                                                <span className={getScoreColor(topic.score, topic.total)}>{topic.score}</span>
                                                                                <span className="text-muted-foreground/60">/{topic.total}</span>
                                                                            </span>
                                                                            <span className="text-center">
                                                                                <button
                                                                                    onClick={toggleQuestions}
                                                                                    className="text-xs sm:text-sm font-medium text-primary hover:underline underline-offset-4 decoration-2"
                                                                                >
                                                                                    Review
                                                                                </button>
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-start mt-4">
                                                                <Button
                                                                    onClick={toggleQuestions}
                                                                    className="bg-foreground hover:bg-foreground/90 text-background rounded-xl gap-2 font-medium h-10 sm:h-11 px-6 text-sm"
                                                                >
                                                                    Check Answers<ArrowRight className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Insight Banner */}
                                <div className="mt-8 flex items-start gap-4 bg-amber-50 rounded-2xl p-5 border border-amber-200/50 shadow-sm">
                                    <div className="bg-amber-100 p-2 rounded-xl">
                                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-amber-900 text-sm">Actionable Insight</h4>
                                        <p className="text-sm text-amber-800/80 mt-1 leading-relaxed">Your History score is slightly below average. Focus on core concepts and map-based questions to improve your score by ~15%.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TestAnalytics;
