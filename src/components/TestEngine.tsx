import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

export interface Question {
    id: number;
    text?: string;
    question?: string;
    options: string[];
    correctAnswer: number;
    category?: string;
    difficulty?: "Easy" | "Medium" | "Hard";
}

export interface Answer {
    questionId: number;
    selectedOption: number | null;
    markedForReview: boolean;
}

interface TestEngineProps {
    questions: Question[];
    onComplete: (answers: Record<number, Answer>) => void;
    onExit?: () => void;
    initialTime?: number;
    title?: string;
    subtitle?: string;
    showHeader?: boolean;
    transparentBg?: boolean;
}

const TestEngine = ({
    questions,
    onComplete,
    onExit,
    initialTime = 7200,
    title = "Test",
    subtitle = "Assessment",
    showHeader = true,
    transparentBg = false
}: TestEngineProps) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, Answer>>({});
    const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        // Mark current question as visited
        setVisitedQuestions(prev => new Set([...prev, currentQuestion]));
    }, [currentQuestion]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleOptionSelect = (optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion]: {
                questionId: questions[currentQuestion].id,
                selectedOption: optionIndex,
                markedForReview: prev[currentQuestion]?.markedForReview || false,
            }
        }));
    };

    const handleMarkForReview = () => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion]: {
                questionId: questions[currentQuestion].id,
                selectedOption: prev[currentQuestion]?.selectedOption ?? null,
                markedForReview: !(prev[currentQuestion]?.markedForReview || false),
            }
        }));
        handleNext();
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = () => {
        onComplete(answers);
    };

    const getQuestionStatus = (index: number) => {
        if (!visitedQuestions.has(index)) {
            return "not-visited";
        }

        const answer = answers[index];
        if (!answer) {
            return "not-answered";
        }

        if (answer.markedForReview && answer.selectedOption !== null) {
            return "answered-marked";
        }
        if (answer.markedForReview) {
            return "marked";
        }
        if (answer.selectedOption !== null) {
            return "answered";
        }
        return "not-answered";
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "not-visited":
                return "bg-gray-200 text-gray-600";
            case "not-answered":
                return "bg-red-500 text-white";
            case "answered":
                return "bg-green-500 text-white";
            case "marked":
                return "bg-purple-500 text-white";
            case "answered-marked":
                return "bg-purple-700 text-white";
            default:
                return "bg-gray-200 text-gray-600";
        }
    };

    const answeredCount = Object.values(answers).filter((a) => a.selectedOption !== null).length;
    const question = questions[currentQuestion];

    return (
        <div className={cn(
            "min-h-full transition-all duration-300",
            transparentBg ? "bg-transparent" : "bg-[#F5F5F7]"
        )}>
            {/* Header */}
            {showHeader && (
                <div className="bg-white border-b border-border sticky top-0 z-50">
                    <div className="container mx-auto px-4 py-2 sm:py-3 font-sans">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                {onExit && (
                                    <button
                                        onClick={onExit}
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                                        title="Exit Test"
                                    >
                                        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                                    </button>
                                )}
                                <div className="min-w-0">
                                    <h1 className="text-sm sm:text-lg font-bold text-foreground truncate uppercase">{title}</h1>
                                    <p className="text-[10px] sm:text-sm text-muted-foreground truncate">{subtitle}</p>
                                </div>
                            </div>
                            <div className="text-xl sm:text-3xl font-bold text-[#0F172A] shrink-0 tabular-nums">
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={cn(
                "container mx-auto px-4 py-6",
                !showHeader && "pt-0"
            )}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Question Area */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Question Card */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                                <h2 className="text-lg sm:text-xl font-bold text-foreground">Question {currentQuestion + 1}</h2>
                                {question.category && (
                                    <Badge variant="outline" className="border-blue-500 text-blue-500 text-[10px] sm:text-xs">
                                        {question.category}
                                    </Badge>
                                )}
                                {question.difficulty && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] sm:text-xs",
                                            question.difficulty === "Easy" && "border-success text-success",
                                            question.difficulty === "Medium" && "border-warning text-warning",
                                            question.difficulty === "Hard" && "border-destructive text-destructive"
                                        )}
                                    >
                                        {question.difficulty}
                                    </Badge>
                                )}
                            </div>

                            <p className="text-base text-foreground leading-relaxed mb-6">
                                {question.text || question.question}
                            </p>

                            {/* Options */}
                            <div className="space-y-3">
                                {question.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionSelect(index)}
                                        className={cn(
                                            "w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3",
                                            answers[currentQuestion]?.selectedOption === index
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/40 hover:bg-gray-50"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0",
                                                answers[currentQuestion]?.selectedOption === index
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-gray-100 text-gray-600"
                                            )}
                                        >
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className="text-sm sm:text-base text-foreground">{option}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-[12px] sm:text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left flex items-center justify-center sm:justify-start gap-3">
                                    <span>{currentQuestion + 1} / {questions.length}</span>
                                    <span className="w-1 h-1 rounded-full bg-border"></span>
                                    <span>{answeredCount} Answered</span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrevious}
                                        disabled={currentQuestion === 0}
                                        className="flex-1 sm:flex-none gap-1 sm:gap-2 h-11 sm:h-10 text-xs sm:text-sm font-semibold rounded-xl"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </Button>

                                    <Button
                                        onClick={handleNext}
                                        disabled={currentQuestion === questions.length - 1}
                                        className="flex-1 sm:flex-none gap-1 sm:gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-md h-11 sm:h-10 text-xs sm:text-sm font-semibold rounded-xl order-1 sm:order-3"
                                    >
                                        Save & Next
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={handleMarkForReview}
                                        className={cn(
                                            "w-full sm:w-auto h-11 sm:h-10 text-xs sm:text-sm font-bold rounded-xl order-3 sm:order-2",
                                            answers[currentQuestion]?.markedForReview
                                                ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md border-none"
                                                : "border-2 border-border text-slate-700 hover:bg-slate-50"
                                        )}
                                    >
                                        Mark for Review & Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Navigator */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold text-foreground mb-4">Question Navigator</h3>

                            {/* Legend */}
                            <div className="space-y-2 mb-6 text-[10px]">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                                        <span className="text-muted-foreground whitespace-nowrap">Not Visited</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-muted-foreground whitespace-nowrap">Not Answered</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-muted-foreground whitespace-nowrap">Answered</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <span className="text-muted-foreground whitespace-nowrap">Marked</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-700"></div>
                                    <span className="text-muted-foreground whitespace-nowrap">Answered & Marked</span>
                                </div>
                            </div>

                            {/* Question Grid */}
                            <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 mb-6">
                                {questions.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={cn(
                                            "w-full aspect-square rounded-full flex items-center justify-center text-[10px] font-semibold transition-all",
                                            getStatusColor(getQuestionStatus(index)),
                                            currentQuestion === index && "ring-2 ring-primary ring-offset-2"
                                        )}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Help Section */}
                            <div className="border-t border-border pt-4">
                                <p className="text-xs text-muted-foreground mb-3">Finished all questions? Submit your test below.</p>
                                <Button
                                    onClick={handleSubmit}
                                    className="w-full bg-primary hover:bg-primary/90 font-bold"
                                    size="lg"
                                >
                                    Submit Test
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestEngine;
