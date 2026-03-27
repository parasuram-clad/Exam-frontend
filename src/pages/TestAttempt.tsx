import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TestEngine, { Question, Answer } from "@/components/TestEngine";
import studyService from "@/services/study.service";
import { testSeriesOverallService } from "@/services/testSeriesOverall.service";
import authService from "@/services/auth.service";
import { toast } from "sonner";

const TestAttempt = () => {
    const { subject, testId } = useParams<{ subject: string; testId: string }>();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get("planId");
    const navigate = useNavigate();
    const [startedAt] = useState<string>(new Date().toISOString());

    const isWeekly = subject?.toLowerCase() === 'weekly';
    const isMonthly = subject?.toLowerCase() === 'monthly';
    const isOverall = subject?.toLowerCase() === 'overall' || subject?.toLowerCase() === 'general';

    const { data: user } = useQuery({
        queryKey: ['user-me'],
        queryFn: () => authService.getCurrentUser(),
        staleTime: Infinity,
    });

    const { data: testData, isLoading, error } = useQuery({
        queryKey: [
            isWeekly ? 'weekly-test' : isMonthly ? 'monthly-test' : 'overall-test', 
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
            }
            return null;
        },
        enabled: !!user?.id && !!testId && (isWeekly || isMonthly || isOverall),
    });

    const questions: Question[] = testData?.questions?.map((q: any) => {
        return {
            id: q.mcq_id,
            text: q.question,
            options: [q.options?.A || "", q.options?.B || "", q.options?.C || "", q.options?.D || ""],
            correctAnswer: 0,
            category: q.subject || q.unit_name || "General",
            difficulty: q.difficulty || "Medium"
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
            navigate(`/test-series/${subject}/test/${testId}/analytics${isOverall ? `?planId=${planId}` : ''}`, { replace: true });
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
                        Preparing your {isWeekly ? 'Weekly' : isMonthly ? 'Monthly' : 'Full'} Test...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        const detail = (error as any).response?.data?.detail;
        const isForbidden = (error as any).response?.status === 403;
        const isCompleted = isForbidden && String(detail || "").includes("already completed");
        const isLocked = isForbidden && String(detail || "").includes("not yet available");

        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
                <div className="flex flex-col items-center justify-center space-y-4 max-w-md text-center p-6">
                    <p className="text-muted-foreground font-medium text-lg">
                        {isCompleted ? "You have already completed this test." : 
                         isLocked ? (detail || "This test is not yet available.") : 
                         "Failed to load test."}
                    </p>
                    {isCompleted ? (
                        <button
                            onClick={() => navigate(`/test-series/${subject}/test/${testId}/analytics`, { replace: true })}
                            className="px-6 py-2 bg-[#0F172A] text-white rounded-lg font-medium shadow-[0_4px_14px_0_rgb(0,0,0,20%)] hover:shadow-[0_6px_20px_rgba(0,0,0,25%)] hover:bg-[#1E293B] transition-all"
                        >
                            View Analytics
                        </button>
                    ) : (
                        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#0F172A] text-white rounded-lg font-medium hover:bg-[#1E293B] transition-all">Go Back</button>
                    )}
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
            title={`${isWeekly ? 'Weekly' : 'Monthly'} Test - ${testId}`}
            subtitle={testData?.total_questions ? `${testData.total_questions} Questions` : "Assessment"}
            initialTime={7200}
        />
    );
};

export default TestAttempt;

