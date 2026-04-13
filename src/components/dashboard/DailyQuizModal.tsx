import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import scoreHigh from "@/assets/results/trophy-hero.png";
import scoreMedium from "@/assets/results/score-medium.png";
import scoreLow from "@/assets/results/score-low.png";

export interface QuizQuestion {
    id: string | number;
    mcq_id?: number;
    question: string;
    subject: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | string;
    options: string[];
    correctAnswer?: number | string;
    correct_answer_index?: number | string;
    explanation: string;
    is_correct?: boolean;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [];

interface DailyQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (results: { answers: (number | null)[], questions: QuizQuestion[] }) => void;
    questions?: QuizQuestion[];
    title?: string;
    subtitle?: string;
    initialAnswers?: (number | null)[];
    initialShowEvaluation?: boolean;
    initialShowDetails?: boolean;
    timeTaken?: number; // seconds
    isSubmitted?: boolean;
    isLoading?: boolean;
    score?: number | null;
}

// Pre-computed confetti positions for result screen
const CONFETTI = [
    { color: "#4FAA60", left: "8%", w: 8, h: 10, delay: 0, dur: 3.2 },
    { color: "#FFD700", left: "20%", w: 10, h: 7, delay: 0.4, dur: 3.8 },
    { color: "#FF4B4B", left: "32%", w: 7, h: 9, delay: 0.8, dur: 3.5 },
    { color: "#4D96FF", left: "44%", w: 9, h: 7, delay: 0.2, dur: 4.0 },
    { color: "#A78BFA", left: "56%", w: 8, h: 11, delay: 1.0, dur: 3.3 },
    { color: "#FFD700", left: "66%", w: 11, h: 8, delay: 0.6, dur: 3.7 },
    { color: "#4FAA60", left: "76%", w: 7, h: 9, delay: 0.3, dur: 4.1 },
    { color: "#FF4B4B", left: "86%", w: 9, h: 7, delay: 0.9, dur: 3.4 },
    { color: "#4D96FF", left: "14%", w: 8, h: 10, delay: 0.5, dur: 3.6 },
    { color: "#A78BFA", left: "50%", w: 10, h: 8, delay: 1.2, dur: 3.9 },
];


function TrophyIllustration({ accuracy }: { accuracy: number }) {
    let illustration = scoreHigh;
    if (accuracy < 50) illustration = scoreLow;
    else if (accuracy < 80) illustration = scoreMedium;

    return (
        <div className="relative w-full flex items-center justify-center" style={{ height: 220 }}>
            {/* Confetti scattered around - only for high accuracy */}
            {accuracy >= 80 && (
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    {CONFETTI.map((c, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{ width: c.w, height: c.h, backgroundColor: c.color, left: c.left, top: -14 }}
                            animate={{ y: [0, 460], opacity: [0, 0.6, 0.6, 0], rotate: [0, 360] }}
                            transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: "linear" }}
                        />
                    ))}
                </div>
            )}
            {/* Character hero image — centered */}
            <motion.img
                src={illustration}
                alt="Achievement"
                className="relative z-10 object-contain"
                style={{ height: 200 }}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            />
        </div>
    );
}

export function DailyQuizModal({ isOpen, onClose, onComplete, questions, title, subtitle, initialAnswers, initialShowEvaluation, initialShowDetails, timeTaken, isSubmitted, isLoading, score }: DailyQuizModalProps) {
    const activeQuestions = questions && questions.length > 0 ? questions : [];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(initialAnswers || []);
    const [showEvaluation, setShowEvaluation] = useState(initialShowEvaluation || false);
    const [showDetails, setShowDetails] = useState(initialShowDetails || false);
    const [frozenQuestions, setFrozenQuestions] = useState<QuizQuestion[]>([]);

    // Freeze questions when the quiz starts, but allow updates if results/history are provided
    useEffect(() => {
        if (isOpen && activeQuestions.length > 0) {
            // Case 1: Starting a fresh quiz
            if (frozenQuestions.length === 0 && !initialShowEvaluation) {
                setFrozenQuestions(activeQuestions);
            }
            // Case 2: We just submitted and got results, or we are viewing history
            // We should update frozenQuestions to the ones containing results (is_correct, explanation)
            else if (initialShowEvaluation || isSubmitted) {
                setFrozenQuestions(activeQuestions);
            }
        }
    }, [isOpen, activeQuestions, frozenQuestions.length, initialShowEvaluation, isSubmitted]);

    // Clear frozen state only when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setFrozenQuestions([]);
        }
    }, [isOpen]);

    const displayQuestions = frozenQuestions.length > 0 ? frozenQuestions : activeQuestions;

    // Sync state when activeQuestions change or review props provided
    useEffect(() => {
        if (displayQuestions.length > 0) {
            // Case 1: External answers provided (e.g. Review Mode from history)
            if (initialAnswers && initialAnswers.length === displayQuestions.length) {
                setSelectedAnswers(initialAnswers);
                setCurrentQuestionIndex(0);
            }
            // Case 2: Starting a fresh quiz (no initial answers and internal state is empty or mismatched)
            else if (!initialAnswers && (selectedAnswers.length === 0 || selectedAnswers.length !== displayQuestions.length)) {
                setSelectedAnswers(Array(displayQuestions.length).fill(null));
                setCurrentQuestionIndex(0);
            }
        }
    }, [displayQuestions.length, initialAnswers]);

    useEffect(() => {
        if (isOpen) {
            if (initialShowEvaluation !== undefined) setShowEvaluation(initialShowEvaluation);
            if (initialShowDetails !== undefined) setShowDetails(initialShowDetails);

            // If we have answers provided, also sync those
            if (initialAnswers && initialAnswers.length === displayQuestions.length) {
                setSelectedAnswers(initialAnswers);
            }
        }
    }, [isOpen, initialShowEvaluation, initialShowDetails]);

    if (!isOpen) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-[32px] p-10 max-w-sm w-full mx-auto shadow-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        <CheckCircle className="absolute inset-0 m-auto w-6 h-6 text-blue-600/30" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Saving Your Progress</h3>
                        <p className="text-sm text-gray-500 mt-2">Connecting to secure server and recording your results...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isOpen && (!activeQuestions || activeQuestions.length === 0)) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-background rounded-2xl p-8 flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Preparing assessment...</p>
                </div>
            </div>
        );
    }

    const currentQuestion = displayQuestions[currentQuestionIndex];
    if (!currentQuestion && !showEvaluation) return null;

    const currentAnswer = selectedAnswers[currentQuestionIndex];

    const handleOptionSelect = (optionIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < displayQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleEvaluate = () => {
        // Parent will set isLoading=true, and later initialShowEvaluation=true
        onComplete?.({
            answers: selectedAnswers,
            questions: displayQuestions
        });
    };

    const handleClose = () => {
        // Reset state
        setCurrentQuestionIndex(0);
        setSelectedAnswers(Array(displayQuestions.length).fill(null));
        setShowEvaluation(false);
        setShowDetails(false);
        setFrozenQuestions([]);
        onClose();
    };


    const getDifficultyColor = (difficulty?: string) => {
        if (!difficulty) return '#64748b';
        switch (difficulty) {
            case 'Easy':
                return '#10b981';
            case 'Medium':
                return '#f59e0b';
            case 'Hard':
                return '#ef4444';
            default:
                return '#64748b';
        }
    };

    const displayScore = score !== undefined && score !== null ? score : 0;
    const accuracy = displayQuestions.length > 0 ? Math.round((displayScore / displayQuestions.length) * 100) : 0;

    const formatTime = (seconds?: number) => {
        if (seconds === undefined) return null;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleClose}>
            <div
                className="bg-background rounded-[14px] shadow-2xl w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto animate-fade-in scrollbar-hide"
                onClick={(e) => e.stopPropagation()}
            >
                {!showEvaluation ? (
                    // Question Screen
                    <div className="relative p-5 sm:p-7">
                        {/* Title Section */}
                        <div className="flex flex-col gap-0.5 mb-5">
                            <h2 className="font-sans font-medium leading-tight text-foreground text-lg">
                                {title || "Daily Quiz"}
                            </h2>
                            <p className="font-sans font-normal text-muted-foreground text-[13px]">
                                {subtitle || `${activeQuestions.length} Questions • Mixed Subjects`}
                            </p>
                        </div>

                        {/* Question Header */}
                        <div className="flex justify-between items-center mb-5">
                            <p className="font-sans font-medium text-foreground text-sm">
                                Question {currentQuestionIndex + 1}
                            </p>
                            <div className="flex gap-2 items-center">
                                {/*  <span className="font-sans font-normal text-muted-foreground text-xs">
                                    {currentQuestion?.subject}
                                </span>
                                <div className="size-1 bg-border rounded-full" />
                                <span
                                    className="font-sans font-semibold text-xs"
                                    style={{ color: getDifficultyColor(currentQuestion?.difficulty) }}
                                >
                                    {currentQuestion?.difficulty}
                                </span>*/}
                            </div>
                        </div>

                        {/* Question Content - Dark gradient box */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 mb-5 shadow-md">
                            <p className="font-medium leading-relaxed text-white text-[15px]">
                                {currentQuestion?.question}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2.5 mb-5">
                            {currentQuestion?.options?.map((option, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "relative rounded-xl transition-all duration-200 cursor-pointer p-3.5 border",
                                        currentAnswer === index
                                            ? "bg-accent/10 border-accent border-l-4 shadow-sm"
                                            : "bg-card border-border hover:border-foreground/20 hover:bg-muted/50"
                                    )}
                                    onClick={() => handleOptionSelect(index)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                            currentAnswer === index
                                                ? "border-accent"
                                                : "border-muted-foreground/30"
                                        )}>
                                            {currentAnswer === index && (
                                                <div className="size-2.5 rounded-full bg-accent" />
                                            )}
                                        </div>
                                        <p className="font-sans font-normal text-foreground text-sm leading-relaxed">
                                            {option}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>


                        {/* Progress Indicator - centered */}
                        <div className="flex gap-3 items-center justify-center mb-5">
                            <div className="flex gap-2 items-center">
                                {[...Array(activeQuestions.length).keys()].map((i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1.5 w-8 rounded-full transition-colors",
                                            i === currentQuestionIndex
                                                ? "bg-foreground"
                                                : selectedAnswers[i] !== null
                                                    ? "bg-foreground/50"
                                                    : "bg-muted"
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="font-sans font-medium text-muted-foreground text-sm ml-2">
                                {currentQuestionIndex + 1} / {activeQuestions.length}
                            </p>
                        </div>

                        {/* Footer Navigation */}
                        <div className="flex justify-between items-center">
                            <Button
                                variant="outline"
                                className="h-10 px-5 rounded-xl border-border text-foreground hover:bg-muted text-sm"
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                            >
                                Previous
                            </Button>

                            {currentQuestionIndex === activeQuestions.length - 1 ? (
                                <Button
                                    className={cn(
                                        "h-11 px-8 rounded-xl font-medium text-primary-foreground transition-all duration-200",
                                        currentAnswer !== null
                                            ? "bg-primary hover:bg-primary/90"
                                            : "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={handleEvaluate}
                                    disabled={currentAnswer === null}
                                >
                                    Evaluate
                                </Button>
                            ) : (
                                <Button
                                    className={cn(
                                        "h-10 px-7 rounded-xl font-medium text-primary-foreground transition-all duration-200 text-sm",
                                        currentAnswer !== null
                                            ? "bg-primary hover:bg-primary/90"
                                            : "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={handleNext}
                                    disabled={currentAnswer === null}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    // ── Result / Reward Screen ──
                    <div className="relative bg-[#F7FAF8] rounded-[14px] overflow-hidden">

                        <div className="p-6 pb-4">
                            {/* Header */}
                            <div className="mb-4">
                                <h2 className="font-semibold text-foreground text-lg leading-tight">
                                    Great Effort!
                                </h2>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                    Here's your performance summary
                                </p>
                            </div>

                            {/* Trophy illustration + confetti */}
                            <TrophyIllustration accuracy={accuracy} />

                            {/* Score */}
                            <div className="flex flex-col items-center mt-2 mb-5">

                                <p className="text-4xl tracking-tight my-1.5 font-medium">
                                    <span className="text-green-500">{displayScore}</span>
                                    <span className="text-muted-foreground text-2xl"> / {displayQuestions.length}</span>
                                </p>
                                <div className="flex items-center gap-3">
                                    <p className="text-foreground text-[15px] font-medium">{accuracy}% Accuracy</p>
                                    {timeTaken !== undefined && (
                                        <>
                                            <div className="size-1 bg-border rounded-full" />
                                            <p className="text-foreground text-[15px] font-medium">
                                                Time: {formatTime(timeTaken)}
                                            </p>
                                        </>
                                    )}
                                </div>
                                {isSubmitted && (
                                    <div className="mt-2 px-2 py-0.5 bg-green-50 rounded-full border border-green-100 flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                                        <div className="size-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-medium text-green-600 uppercase tracking-wider">Assessment Recorded</span>
                                    </div>
                                )}
                            </div>

                            {/* Motivational note */}
                            <div className="text-center mb-5">
                                <p className="font-semibold text-foreground text-sm">Good start!</p>
                                <p className="text-muted-foreground text-sm">Review your mistakes to improve.</p>
                            </div>

                            {/* View Details */}
                            <div className="flex justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="h-10 rounded-full px-6 flex items-center gap-2 border-border text-sm"
                                >
                                    {showDetails ? 'Hide Details' : 'View Details'}
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                        className={cn('transition-transform duration-200', showDetails && 'rotate-180')}>
                                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Button>
                            </div>
                        </div>

                        {/* Detailed Review */}
                        <AnimatePresence>
                            {showDetails && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-8 border-t border-border pt-5">
                                        <p className="font-semibold text-foreground text-base mb-4">Detailed Review</p>
                                        <div className="flex flex-col gap-4">
                                            {displayQuestions.map((question, index) => {
                                                const isCorrect = question.is_correct || false;
                                                const letterMap: Record<string, string> = { "0": "A", "1": "B", "2": "C", "3": "D" };
                                                const userAnswer = selectedAnswers[index];

                                                return (
                                                    <div key={question?.id || index} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex gap-2 items-center">
                                                                <p className="font-medium text-foreground text-sm">Question {index + 1}</p>
                                                                <span className="text-muted-foreground text-xs">• {question?.subject}</span>
                                                            </div>

                                                            <div className={cn(
                                                                'px-2.5 py-0.5 rounded-md text-xs font-medium',
                                                                isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                            )}>
                                                                {isCorrect ? '✅ Correct' : '❌ Wrong'}
                                                            </div>
                                                        </div>
                                                        <p className="text-foreground text-sm leading-relaxed">{question.question}</p>
                                                        <div className="flex flex-col gap-2.5 mt-1">
                                                            {userAnswer !== null && (
                                                                <div className="flex gap-2 items-start">
                                                                    <p className="text-muted-foreground text-sm shrink-0 w-28">Your answer:</p>
                                                                    <p className={cn('text-sm font-medium', isCorrect ? 'text-green-600' : 'text-red-500')}>
                                                                        <span className="font-bold mr-1">{letterMap[String(userAnswer)]}.</span> {question.options?.[userAnswer] || "N/A"}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {!isCorrect && (
                                                                <div className="flex gap-2 items-start">
                                                                    <p className="text-muted-foreground text-sm shrink-0 w-28">Correct answer:</p>
                                                                    <p className="text-green-600 text-sm font-medium">
                                                                        <span className="font-bold mr-1">{letterMap[String(question.correct_answer_index)]}.</span> {question.options?.[Number(question.correct_answer_index)] || "N/A"}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {question.explanation && (
                                                            <div className="bg-muted/50 border border-border rounded-lg p-3 mt-1">
                                                                <p className="text-muted-foreground text-xs font-medium mb-1">Explanation:</p>
                                                                <p className="text-foreground text-sm leading-relaxed">{question.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="px-2 mt-5">
                                            <Button className="w-full h-10 rounded-xl font-medium text-sm" onClick={handleClose}>Close</Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!showDetails && (
                            <div className="px-6 pb-7">
                                <Button className="w-full h-10 rounded-xl font-medium text-sm" onClick={handleClose}>Close</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
