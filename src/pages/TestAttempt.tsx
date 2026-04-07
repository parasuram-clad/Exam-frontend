import { useParams, useNavigate, useSearchParams, useBlocker } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";


const TestAttempt = () => {
    const { subject, testId } = useParams<{ subject: string; testId: string }>();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get("plan_id");
    const navigate = useNavigate();
    const [startedAt] = useState<string>(new Date().toISOString());
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [shouldBlock, setShouldBlock] = useState(true);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            shouldBlock && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker.state === "blocked") {
            setShowExitDialog(true);
        }
    }, [blocker]);

    const isWeekly = subject?.toLowerCase() === 'weekly';
    const isMonthly = subject?.toLowerCase() === 'monthly';
    const isSubjectWeekly = subject?.toLowerCase() === 'subject-weekly';
    const isSubjectMonthly = subject?.toLowerCase() === 'subject-monthly';
    const isOverall = subject?.toLowerCase() === 'overall' || subject?.toLowerCase() === 'general';
    const isSubject = subject?.toLowerCase() === 'subject';

    const { data: user } = useQuery({
        queryKey: ['user-me'],
        queryFn: () => authService.getCurrentUser(),
        staleTime: Infinity,
    });

    const { data: testData, isLoading, error } = useQuery({
        queryKey: [
            isWeekly || isSubjectWeekly ? 'weekly-test' : isMonthly || isSubjectMonthly ? 'monthly-test' : isOverall ? 'overall-test' : 'subject-test',
            user?.id,
            testId,
            planId
        ],
        queryFn: async () => {
            if (!user?.id || !testId) return null;
            if (isWeekly) {
                return studyService.getWeeklyTestQuestions(user.id, parseInt(testId), parseInt(planId || "0"));
            } else if (isMonthly) {
                return studyService.getMonthlyTestQuestions(user.id, parseInt(testId), parseInt(planId || "0"));
            } else if (isSubjectWeekly) {
                return studyService.getSubjectWeeklyTestQuestions(parseInt(planId || "0"), parseInt(testId));
            } else if (isSubjectMonthly) {
                return studyService.getSubjectMonthlyTestQuestions(parseInt(planId || "0"), parseInt(testId));
            } else if (isOverall) {
                return testSeriesOverallService.getQuestions(parseInt(testId), parseInt(planId || "0"));
            } else if (isSubject) {
                return testSeriesSubjectService.getQuestions(parseInt(planId || "0"), parseInt(testId));
            }
            return null;
        },
        enabled: !!user?.id && !!testId && (isWeekly || isMonthly || isSubjectWeekly || isSubjectMonthly || (isOverall && !!planId) || (isSubject && !!planId)),
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async (answers: Record<number, Answer>) => {
        if (!user?.id || !testId) return;
        setIsSubmitting(true);

        const answerMap = ["A", "B", "C", "D"];
        const formattedAnswers = Object.values(answers)
            .filter(a => a.selectedOption !== null)
            .map(a => ({
                mcq_id: a.questionId,
                selected_option: answerMap[a.selectedOption as number]
            }));

        try {
            if (isOverall) {
                const attemptId = testData.test_series_attempt_id || testData.attempt_id || testData.id;
                if (!attemptId) throw new Error("Attempt ID not found in test data");

                await testSeriesOverallService.submitTest({
                    test_series_attempt_id: Number(attemptId),
                    answers: formattedAnswers,
                    started_at: startedAt,
                    submitted_at: new Date().toISOString()
                });
            } else if (isSubject) {
                const attemptId = testData.test_series_attempt_id || testData.attempt_id || testData.id;
                if (!attemptId) throw new Error("Attempt ID not found in test data");

                await testSeriesSubjectService.submitTest({
                    test_series_attempt_id: Number(attemptId),
                    answers: formattedAnswers,
                    started_at: startedAt,
                    submitted_at: new Date().toISOString()
                });
            } else if (isWeekly) {
                const testIdValue = testData.weekly_test_id || testData.id || parseInt(testId);
                await studyService.submitWeeklyTest({
                    weekly_test_id: Number(testIdValue),
                    answers: formattedAnswers,
                    started_at: startedAt,
                    submitted_at: new Date().toISOString(),
                    plan_id: planId ? parseInt(planId) : undefined
                });
            } else if (isMonthly) {
                const testIdValue = testData.monthly_test_id || testData.id || parseInt(testId);
                await studyService.submitMonthlyTest({
                    monthly_test_id: Number(testIdValue),
                    answers: formattedAnswers,
                    started_at: startedAt,
                    submitted_at: new Date().toISOString(),
                    plan_id: planId ? parseInt(planId) : undefined
                });
            } else if (isSubjectWeekly) {
                const testIdValue = testData.subject_weekly_test_id || testData.id || parseInt(testId);
                await studyService.submitSubjectWeeklyTest({
                    subject_weekly_test_id: Number(testIdValue),
                    answers: formattedAnswers,
                    started_at: startedAt,
                    submitted_at: new Date().toISOString(),
                    plan_id: planId ? parseInt(planId) : undefined
                });
            } else if (isSubjectMonthly) {
                const testIdValue = testData.subject_monthly_test_id || testData.id || parseInt(testId);
                await studyService.submitSubjectMonthlyTest({
                    subject_monthly_test_id: Number(testIdValue),
                    answers: formattedAnswers,
                    started_at: startedAt,
                    submitted_at: new Date().toISOString(),
                    plan_id: planId ? parseInt(planId) : undefined
                });
            }

            setShouldBlock(false); // Disable blocker before navigation

            toast.success("Test submitted successfully!");

            // Short delay to show the success state before navigating
            setTimeout(() => {
                const params = new URLSearchParams();
                if (planId) params.set("plan_id", planId);

                const finalUrl = `/test-series/${subject}/test/${testId}/analytics${params.toString() ? `?${params.toString()}` : ""}`;
                navigate(finalUrl, { replace: true });
            }, 1000);

        } catch (err: any) {
            console.error("Test submit error:", err);
            setIsSubmitting(false);
            toast.error(err.response?.data?.detail || err.message || "Failed to submit test.");
        }
    };

    const handleExit = () => {
        setShowExitDialog(true);
    };

    const confirmExit = () => {
        setShouldBlock(false);
        setShowExitDialog(false);
        // Use a timeout to ensure state is updated before proceeding
        setTimeout(() => {
            if (blocker.state === "blocked") {
                blocker.proceed();
            } else {
                navigate("/test-series");
            }
        }, 0);
    };

    const cancelExit = () => {
        setShowExitDialog(false);
        if (blocker.state === "blocked") {
            blocker.reset();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">
                        Preparing your {subject?.toLowerCase().includes('weekly') ? 'Weekly' : subject?.toLowerCase().includes('monthly') ? 'Monthly' : (isOverall || isSubject) ? 'Series' : ''} Test...
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
                                onClick={() => {
                                    setShouldBlock(false);
                                    navigate(`/test-series/${subject}/test/${testId}/analytics${(isOverall || isSubject) ? `?plan_id=${planId}` : ''}`, { replace: true });
                                }}
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
                            onClick={() => {
                                setShouldBlock(false);
                                navigate(-1);
                            }} 
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
                    <button onClick={() => {
                        setShouldBlock(false);
                        navigate(-1);
                    }} className="text-primary hover:underline">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <TestEngine
                questions={questions}
                onComplete={handleComplete}
                onExit={handleExit}
                isSubmitting={isSubmitting}
                title={isWeekly || isSubjectWeekly ? `Weekly Test - ${testId}` : isMonthly || isSubjectMonthly ? `Monthly Test - ${testId}` : `Practice Test - ${testId}`}
                subtitle={testData?.total_questions ? `${testData.total_questions} Questions` : "Assessment"}
                initialTime={testData?.duration_hours ? testData.duration_hours * 3600 : 7200}
            />

            {/* Exit Confirmation Dialog */}
            <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <DialogContent className="sm:max-w-md rounded-3xl p-6 sm:p-8 border-none shadow-2xl">
                    <DialogTitle className="sr-only">Exit Test Confirmation</DialogTitle>
                    <DialogDescription className="sr-only">Confirm if you want to exit the test and lose progress.</DialogDescription>
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Exit Test?</h3>
                            <p className="text-muted-foreground mt-2">
                                Are you sure you want to exit? Your progress will not be saved and you will lose any unsaved answers.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={cancelExit}
                                className="flex-1 h-12 rounded-xl text-sm font-semibold border-2"
                            >
                                Continue Test
                            </Button>
                            <Button
                                onClick={confirmExit}
                                className="flex-1 h-12 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white"
                            >
                                Exit Anyway
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TestAttempt;
