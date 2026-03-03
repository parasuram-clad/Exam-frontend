import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import trophyHero from "@/assets/results/trophy-hero.png";

export interface QuizQuestion {
    id: number;
    question: string;
    subject: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 1,
        question: 'The Sangam Age in Tamil Nadu history is primarily known for which of the following?',
        subject: 'History',
        difficulty: 'Easy',
        options: [
            'Trade and commerce with Roman Empire',
            'Development of Dravidian architecture',
            'Tamil literature and poetry',
            'Formation of first democratic assembly'
        ],
        correctAnswer: 2,
        explanation: 'The Sangam Age (300 BCE - 300 CE) is primarily known for its rich Tamil literature and poetry. Sangam literature consists of the earliest known Tamil literary works.'
    },
    {
        id: 2,
        question: 'Which river is known as the "Sorrow of Tamil Nadu" due to frequent floods?',
        subject: 'Geography',
        difficulty: 'Medium',
        options: [
            'Cauvery River',
            'Vaigai River',
            'Thamirabarani River',
            'Palar River'
        ],
        correctAnswer: 1,
        explanation: 'The Vaigai River has historically caused devastating floods in the Madurai region, earning it the nickname "Sorrow of Tamil Nadu". However, the river also provides essential irrigation.'
    },
    {
        id: 3,
        question: 'The concept of "Separation of Powers" in the Indian Constitution is borrowed from which country?',
        subject: 'Polity',
        difficulty: 'Medium',
        options: [
            'United Kingdom',
            'United States of America',
            'France',
            'Ireland'
        ],
        correctAnswer: 1,
        explanation: 'The principle of Separation of Powers, dividing government into Legislative, Executive, and Judicial branches, was borrowed from the USA. Montesquieu\'s theory influenced the American system, which in turn influenced India.'
    },
    {
        id: 4,
        question: 'What is the full form of NITI Aayog?',
        subject: 'Economy',
        difficulty: 'Easy',
        options: [
            'National Institution for Transforming India',
            'National Institute for Trade and Industry',
            'National Integration and Technological Innovation',
            'National Investment and Trade Initiative'
        ],
        correctAnswer: 0,
        explanation: 'NITI Aayog stands for National Institution for Transforming India. It was formed in 2015, replacing the Planning Commission, to serve as a think tank of the Government of India.'
    },
    {
        id: 5,
        question: 'If 5 workers can complete a task in 12 days, how many days will 3 workers take to complete the same task?',
        subject: 'Aptitude',
        difficulty: 'Hard',
        options: [
            '15 days',
            '18 days',
            '20 days',
            '24 days'
        ],
        correctAnswer: 2,
        explanation: 'Using inverse proportion: If workers decrease, days increase proportionally. (5 × 12) / 3 = 60 / 3 = 20 days. This is a classic work-time problem solved using the formula: M1 × D1 = M2 × D2.'
    }
];

interface DailyQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
    questions?: QuizQuestion[];
    title?: string;
    subtitle?: string;
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


function TrophyIllustration() {
    return (
        <div className="relative w-full flex items-center justify-center" style={{ height: 220 }}>
            {/* Confetti scattered around */}
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
            {/* Trophy hero image — centered */}
            <motion.img
                src={trophyHero}
                alt="Trophy"
                className="relative z-10 object-contain"
                style={{ height: 180 }}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            />
        </div>
    );
}

export function DailyQuizModal({ isOpen, onClose, onComplete, questions, title, subtitle }: DailyQuizModalProps) {
    console.log("DailyQuizModal Props - questions:", questions);
    const activeQuestions = questions && questions.length > 0 ? questions : QUIZ_QUESTIONS;
    console.log("DailyQuizModal activeQuestions:", activeQuestions);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
    const [showEvaluation, setShowEvaluation] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    // Sync state when activeQuestions change
    useEffect(() => {
        if (activeQuestions.length > 0) {
            setSelectedAnswers(Array(activeQuestions.length).fill(null));
            setCurrentQuestionIndex(0);
        }
    }, [activeQuestions]);

    if (!isOpen) return null;

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

    const currentQuestion = activeQuestions[currentQuestionIndex];
    if (!currentQuestion && !showEvaluation) return null;

    const currentAnswer = selectedAnswers[currentQuestionIndex];

    const handleOptionSelect = (optionIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < activeQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleEvaluate = () => {
        setShowEvaluation(true);
        setShowDetails(false);
        onComplete?.();
    };

    const handleClose = () => {
        // Reset state
        setCurrentQuestionIndex(0);
        setSelectedAnswers(Array(activeQuestions.length).fill(null));
        setShowEvaluation(false);
        setShowDetails(false);
        onClose();
    };

    const calculateScore = () => {
        let correct = 0;
        activeQuestions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                correct++;
            }
        });
        return correct;
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

    const score = calculateScore();
    const accuracy = Math.round((score / activeQuestions.length) * 100);

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
                                <span className="font-sans font-normal text-muted-foreground text-xs">
                                    {currentQuestion?.subject}
                                </span>
                                <div className="size-1 bg-border rounded-full" />
                                <span
                                    className="font-sans font-semibold text-xs"
                                    style={{ color: getDifficultyColor(currentQuestion?.difficulty) }}
                                >
                                    {currentQuestion?.difficulty}
                                </span>
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
                                            i === currentQuestionIndex ? "bg-foreground" : "bg-muted"
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
                            <TrophyIllustration />

                            {/* Score */}
                            <div className="flex flex-col items-center mt-2 mb-5">
                                <p className="text-foreground text-sm font-medium">Your Score</p>
                                <p className="text-4xl tracking-tight my-1.5">
                                    <span className="text-green-500 font-semibold">{score}</span>
                                    <span className="text-muted-foreground text-2xl font-medium"> / {activeQuestions.length}</span>
                                </p>
                                <p className="text-foreground text-base font-medium">{accuracy}% Accuracy</p>
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
                                            {activeQuestions.map((question, index) => {
                                                const isCorrect = selectedAnswers[index] === (question?.correctAnswer ?? -1);
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
                                                        <div className="flex flex-col gap-2 mt-1">
                                                            {userAnswer !== null && (
                                                                <div className="flex gap-2 items-start">
                                                                    <p className="text-muted-foreground text-sm shrink-0 w-24">Your answer:</p>
                                                                    <p className={cn('text-sm font-medium', isCorrect ? 'text-green-600' : 'text-red-600')}>
                                                                        {question.options[userAnswer]}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {!isCorrect && (
                                                                <div className="flex gap-2 items-start">
                                                                    <p className="text-muted-foreground text-sm shrink-0 w-24">Correct answer:</p>
                                                                    <p className="text-green-600 text-sm font-medium">{question.options[question.correctAnswer]}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="bg-muted/50 border border-border rounded-lg p-3 mt-1">
                                                            <p className="text-muted-foreground text-xs font-medium mb-1">Explanation:</p>
                                                            <p className="text-foreground text-sm leading-relaxed">{question?.explanation}</p>
                                                        </div>
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
