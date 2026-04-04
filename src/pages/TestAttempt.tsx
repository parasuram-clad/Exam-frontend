import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TestEngine, { Question, Answer } from "@/components/TestEngine";
import studyService from "@/services/study.service";
import { testSeriesOverallService } from "@/services/testSeriesOverall.service";
import { testSeriesSubjectService } from "@/services/testSeriesSubject.service";
import authService from "@/services/auth.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle2, Lock, AlertTriangle, BarChart2, Zap } from "lucide-react";

const TestAttempt = () => {
    const { subject, testId } = useParams<{ subject: string; testId: string }>();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get("plan_id");
    const navigate = useNavigate();
    const [startedAt] = useState<string>(new Date().toISOString());

    const isWeekly = subject?.toLowerCase() === 'weekly';
    const isMonthly = subject?.toLowerCase() === 'monthly';
    const isOverall = subject?.toLowerCase() === 'overall' || subject?.toLowerCase() === 'general';
    const isSubject = subject?.toLowerCase() === 'subject';

    const { data: user } = useQuery({
        queryKey: ['user-me'],
        queryFn: () => authService.getCurrentUser(),
        staleTime: Infinity,
    });

    const { data: testData, isLoading, error } = useQuery({
        queryKey: [
            isWeekly ? 'weekly-test' : isMonthly ? 'monthly-test' : isOverall ? 'overall-test' : 'subject-test', 
            user?.id, 
            testId,
            planId
        ],
        queryFn: async () => {
            if (!user?.id || !testId) return null;
            if (isWeekly) {
                return studyService.getWeeklyTestQuestions(user.id, parseInt(testId));
            } else if (isMonthly) {
                return studyService.getMonthlyTestQuestions(user.id, parseInt(testId));
            } else if (isOverall) {
                return testSeriesOverallService.getQuestions(parseInt(testId), parseInt(planId || "0"));
            } else if (isSubject) {
                return testSeriesSubjectService.getQuestions(parseInt(planId || "0"), parseInt(testId));
            }
            return null;
        },
        enabled: !!user?.id && !!testId && (isWeekly || isMonthly || (isOverall && !!planId) || (isSubject && !!planId)),
    });

    const questions: Question[] = testData?.questions?.map((q: any) => {
        return {
            id: q.mcq_id,
            text: q.question,
            options: [q.options?.A || "", q.options?.B || "", q.options?.C || "", q.options?.D || ""],
            correctAnswer: 0,
            category: q.subject || q.unit_name || "General"
        };
    }) || [];

    const handleComplete = async (answers: Record<number, Answer>) => {
        if (!user?.id || !testId) return;

        const answerMap = ["A", "B", "C", "D"];
        const formattedAnswers = Object.values(answers)
            .filter(a => a.selectedOption !== null)
            .map(a => ({
                mcq_id: a.questionId,
                selected_option: answerMap[a.selectedOption as number]
            }));

        try {
            if (isOverall) {
                await testSeriesOverallService.submitTest({
                    test_series_attempt_id: testData.test_series_attempt_id,
                    answers: formattedAnswers,
                    started_at: startedAt,
                    submitted_at: new Date().toISOString()
                });
            } else if (isSubject) {
                await testSeriesSubjectService.submitTest({
                    test_series_attempt_id: testData.test_series_attempt_id,
                    answers: formattedAnswers,
                    started_at: startedAt,
                    submitted_at: new Date().toISOString()
                });
            } else if (isWeekly) {
                await studyService.submitWeeklyTest({
                    weekly_test_id: parseInt(testId),
                    answers: formattedAnswers,
                    started_at: startedAt,
                    submitted_at: new Date().toISOString()
                });
            } else if (isMonthly) {
                await studyService.submitMonthlyTest({
                    monthly_test_id: parseInt(testId),
                    answers: formattedAnswers,
                    started_at: startedAt,
                    submitted_at: new Date().toISOString()
                });
            }
            toast.success("Test submitted successfully!");
            navigate(`/test-series/${subject}/test/${testId}/analytics${(isOverall || isSubject) ? `?plan_id=${planId}` : ''}`, { replace: true });
        } catch (err: any) {
            console.error("Test submit error:", err);
            toast.error(err.response?.data?.detail || "Failed to submit test.");
        }
    };

    const handleExit = () => {
        if (window.confirm("Are you sure you want to exit? Your progress will not be saved.")) {
            navigate("/test-series");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">
                        Preparing your {isWeekly ? 'Weekly' : isMonthly ? 'Monthly' : (isOverall || isSubject) ? 'Series' : ''} Test...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        const errObj = error as any;
        const detail = errObj.response?.data?.detail || "";
        const status = errObj.response?.status;
        
        const isCompleted = status === 403 && String(detail).toLowerCase().includes("already completed");
        const isLocked = (status === 403 || status === 400) && String(detail).toLowerCase().includes("not yet available");
        const isSubscriptionRequired = status === 403 && String(detail).toLowerCase().includes("subscription");

        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 text-center">
                <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center">
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mb-6",
                        isCompleted ? "bg-emerald-50 text-emerald-500" : 
                        isLocked ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"
                    )}>
                        {isCompleted ? <CheckCircle2 className="w-10 h-10" /> : 
                         isLocked ? <Lock className="w-10 h-10" /> : 
                         <AlertTriangle className="w-10 h-10" />}
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
                        {isCompleted ? "Test Completed" : 
                         isLocked ? "Test Locked" : 
                         isSubscriptionRequired ? "Premium Required" : "Something went wrong"}
                    </h2>

                    <p className="text-slate-500 mb-8 leading-relaxed">
                        {isCompleted ? "You have already completed this test and submitted your answers. You can view your performance analytics." : 
                         isLocked ? (detail || "This test is not yet available for attempt.") : 
                         isSubscriptionRequired ? "You need a premium subscription to access this test series." :
                         (detail || "We couldn't load the test questions. Please check your connection and try again.")}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        {isCompleted ? (
                            <button
                                onClick={() => navigate(`/test-series/${subject}/test/${testId}/analytics${(isOverall || isSubject) ? `?plan_id=${planId}` : ''}`, { replace: true })}
                                className="w-full h-12 bg-[#0F172A] text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            >
                                <BarChart2 className="w-4 h-4" />
                                View Analysis
                            </button>
                        ) : isSubscriptionRequired ? (
                            <button
                                onClick={() => navigate("/upgrade-plan")}
                                className="w-full h-12 bg-[#C7DD64] text-[#0F172A] rounded-2xl font-bold hover:bg-[#B8CD5B] transition-all flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                Upgrade Plan
                            </button>
                        ) : null}

                        <button 
                            onClick={() => navigate(-1)} 
                            className="w-full h-12 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                        >
                            {isLocked || isSubscriptionRequired ? "Go Back" : "Try Again"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <p className="text-muted-foreground font-medium text-lg">No questions found for this test.</p>
                    <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <TestEngine
            questions={questions}
            onComplete={handleComplete}
            onExit={handleExit}
            title={`${isWeekly ? 'Weekly' : isMonthly ? 'Monthly' : 'Practice'} Test - ${testId}`}
            subtitle={testData?.total_questions ? `${testData.total_questions} Questions` : "Assessment"}
            initialTime={testData?.duration_hours ? testData.duration_hours * 3600 : 7200}
        />
    );
};

export default TestAttempt;
