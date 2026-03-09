import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TestEngine, { Question, Answer } from "@/components/TestEngine";
import studyService from "@/services/study.service";
import authService from "@/services/auth.service";
import { toast } from "sonner";

const TestAttempt = () => {
    const { subject, testId } = useParams<{ subject: string; testId: string }>();
    const navigate = useNavigate();
    const [startedAt] = useState<string>(new Date().toISOString());

    const isWeekly = subject?.toLowerCase() === 'weekly';
    const isMonthly = subject?.toLowerCase() === 'monthly';

    const { data: user } = useQuery({
        queryKey: ['user-me'],
        queryFn: () => authService.getCurrentUser(),
        staleTime: Infinity,
    });

    const { data: testData, isLoading, error } = useQuery({
        queryKey: [isWeekly ? 'weekly-test' : 'monthly-test', user?.id, testId],
        queryFn: async () => {
            if (!user?.id || !testId) return null;
            if (isWeekly) {
                return studyService.getWeeklyTestQuestions(user.id, parseInt(testId));
            } else if (isMonthly) {
                return studyService.getMonthlyTestQuestions(user.id, parseInt(testId));
            }
            return null;
        },
        enabled: !!user?.id && !!testId && (isWeekly || isMonthly),
    });

    const questions: Question[] = testData?.questions?.map((q: any) => {
        // Requirement: console log each question correct option for testing
        console.log(`TESTING: Question ID ${q.mcq_id} correct option is: ${q.correct_option || q.correct_answer || "N/A"}`);
        return {
            id: q.mcq_id,
            text: q.question,
            options: [q.options?.A || "", q.options?.B || "", q.options?.C || "", q.options?.D || ""],
            correctAnswer: 0,
            category: q.subject || "General",
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

        const payload = {
            [isWeekly ? "weekly_test_id" : "monthly_test_id"]: parseInt(testId),
            answers: formattedAnswers,
            started_at: startedAt,
            submitted_at: new Date().toISOString()
        };

        try {
            if (isWeekly) {
                await studyService.submitWeeklyTest(payload as any);
            } else if (isMonthly) {
                await studyService.submitMonthlyTest(payload as any);
            }
            toast.success("Test submitted successfully!");
            navigate(`/test-series/${subject}/test/${testId}/analytics`, { replace: true });
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
                    <p className="text-muted-foreground font-medium">Preparing your {!isMonthly ? 'Weekly' : 'Monthly'} Test...</p>
                </div>
            </div>
        );
    }

    if (error) {
        const isCompleted = (error as any).response?.status === 403 ||
            String((error as any).response?.data?.detail || "").includes("already completed");

        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <p className="text-muted-foreground font-medium text-lg">
                        {isCompleted ? "You have already completed this test." : "Failed to load test."}
                    </p>
                    {isCompleted ? (
                        <button
                            onClick={() => navigate(`/test-series/${subject}/test/${testId}/analytics`, { replace: true })}
                            className="px-6 py-2 bg-[#0F172A] text-white rounded-lg font-medium shadow-[0_4px_14px_0_rgb(0,0,0,20%)] hover:shadow-[0_6px_20px_rgba(0,0,0,25%)] hover:bg-[#1E293B] transition-all"
                        >
                            View Analytics
                        </button>
                    ) : (
                        <button onClick={() => navigate(-1)} className="text-primary hover:underline font-medium">Go Back</button>
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

