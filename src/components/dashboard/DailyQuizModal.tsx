import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export interface QuizQuestion {
    id: number;
    question: string;
    subject: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    options: string[];
    correctAnswer: number;
    explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
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

// Confetti illustration component
function ConfettiIllustration() {
    return (
        <div className="relative w-full h-[200px]">
            {/* Confetti pieces - scattered around */}
            <div className="absolute inset-0">
                <svg className="absolute" style={{ left: '10%', top: '10%', width: '10px', height: '10px' }} viewBox="0 0 10 10">
                    <rect fill="#FBC343" opacity="0.6" width="10" height="10" />
                </svg>
                <svg className="absolute" style={{ left: '85%', top: '15%', width: '8px', height: '12px' }} viewBox="0 0 8 12">
                    <rect fill="#9490E6" opacity="0.6" width="8" height="12" />
                </svg>
                <svg className="absolute" style={{ left: '15%', top: '60%', width: '12px', height: '8px' }} viewBox="0 0 12 8">
                    <rect fill="#8CBFBE" opacity="0.6" width="12" height="8" />
                </svg>
                <svg className="absolute" style={{ left: '90%', top: '65%', width: '10px', height: '10px' }} viewBox="0 0 10 10">
                    <rect fill="#EE6F57" opacity="0.6" width="10" height="10" />
                </svg>
                <svg className="absolute" style={{ left: '20%', top: '85%', width: '9px', height: '9px' }} viewBox="0 0 9 9">
                    <rect fill="#708CD5" opacity="0.6" width="9" height="9" />
                </svg>
                <svg className="absolute" style={{ left: '75%', top: '80%', width: '10px', height: '10px' }} viewBox="0 0 10 10">
                    <rect fill="#FBC343" opacity="0.6" width="10" height="10" />
                </svg>
                <svg className="absolute" style={{ left: '50%', top: '5%', width: '11px', height: '7px' }} viewBox="0 0 11 7">
                    <rect fill="#EE6F57" opacity="0.6" width="11" height="7" />
                </svg>
                <svg className="absolute" style={{ left: '82%', top: '90%', width: '8px', height: '10px' }} viewBox="0 0 8 10">
                    <rect fill="#FBC343" opacity="0.6" width="8" height="10" />
                </svg>
            </div>

            {/* Person with trophy on podium illustration */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[150px]">
                <svg viewBox="0 0 180 150" fill="none" className="w-full h-full">
                    {/* Podium steps */}
                    <path d="M40 100 L60 100 L60 140 L40 140 Z" fill="#D33327" />
                    <path d="M60 85 L90 85 L90 140 L60 140 Z" fill="#D33327" />
                    <path d="M90 95 L110 95 L110 140 L90 140 Z" fill="#B22724" />

                    {/* Person body */}
                    <ellipse cx="75" cy="70" rx="8" ry="10" fill="#F28A5C" />
                    <path d="M75 80 L75 105" stroke="#D15828" strokeWidth="6" strokeLinecap="round" />
                    <path d="M75 90 L65 100" stroke="#D15828" strokeWidth="5" strokeLinecap="round" />
                    <path d="M75 90 L85 100" stroke="#B74821" strokeWidth="5" strokeLinecap="round" />
                    <path d="M75 105 L65 125" stroke="#1C3E60" strokeWidth="6" strokeLinecap="round" />
                    <path d="M75 105 L85 125" stroke="#0D2B4D" strokeWidth="6" strokeLinecap="round" />

                    {/* Cape */}
                    <path d="M72 82 Q65 95 62 110 Q70 105 75 100" fill="#E84A46" />

                    {/* Trophy */}
                    <g transform="translate(80, 62)">
                        <rect x="0" y="0" width="12" height="16" fill="#EDB73E" rx="2" />
                        <ellipse cx="6" cy="2" rx="5" ry="3" fill="#F2C56D" />
                        <rect x="4" y="16" width="4" height="3" fill="#D39735" />
                    </g>

                    {/* Trophy sparkles */}
                    <circle cx="95" cy="65" r="2" fill="#FBC343" opacity="0.8" />
                    <circle cx="102" cy="72" r="1.5" fill="#FBC343" opacity="0.6" />
                </svg>
            </div>
        </div>
    );
}

export function DailyQuizModal({ isOpen, onClose, onComplete, questions, title, subtitle }: DailyQuizModalProps) {
    const activeQuestions = questions || QUIZ_QUESTIONS;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(Array(activeQuestions.length).fill(null));
    const [showEvaluation, setShowEvaluation] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    if (!isOpen) return null;

    const currentQuestion = activeQuestions[currentQuestionIndex];
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
        setSelectedAnswers(Array(activeQuestions.length).fill(null)); // Reset based on length
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

    const getDifficultyColor = (difficulty: string) => {
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
                className="bg-background rounded-[14px] shadow-2xl w-[680px] max-w-[90vw] max-h-[90vh] overflow-y-auto animate-fade-in scrollbar-hide"
                onClick={(e) => e.stopPropagation()}
            >
                {!showEvaluation ? (
                    // Question Screen
                    <div className="relative p-6 sm:p-8">
                        {/* Title Section */}
                        <div className="flex flex-col gap-1 mb-6">
                            <h2 className="font-sans font-medium leading-tight text-foreground text-xl">
                                {title || "Daily Quiz"}
                            </h2>
                            <p className="font-sans font-normal text-muted-foreground text-sm">
                                {subtitle || `${activeQuestions.length} Questions • Mixed Subjects`}
                            </p>
                        </div>

                        {/* Question Header */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="font-sans font-medium text-foreground text-base">
                                Question {currentQuestionIndex + 1}
                            </p>
                            <div className="flex gap-3 items-center">
                                <span className="font-sans font-normal text-muted-foreground text-sm">
                                    {currentQuestion.subject}
                                </span>
                                <div className="size-1 bg-border rounded-full" />
                                <span
                                    className="font-sans font-semibold text-sm"
                                    style={{ color: getDifficultyColor(currentQuestion.difficulty) }}
                                >
                                    {currentQuestion.difficulty}
                                </span>
                            </div>
                        </div>

                        {/* Question Content - Dark gradient box */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 mb-6 shadow-md">
                            <p className="font-medium leading-relaxed text-white text-base">
                                {currentQuestion.question}
                            </p>
                        </div>

                        {/* MCQ Options */}
                        <div className="flex flex-col gap-3 mb-6">
                            {currentQuestion.options.map((option, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "relative rounded-xl transition-all duration-200 cursor-pointer p-4 border",
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
                        <div className="flex gap-3 items-center justify-center mb-6">
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
                                className="h-11 px-6 rounded-xl border-border text-foreground hover:bg-muted"
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
                                        "h-11 px-8 rounded-xl font-medium text-primary-foreground transition-all duration-200",
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
                    // Evaluation/Reward Screen
                    <div className="relative bg-gradient-to-b from-green-50/50 to-white rounded-[14px] overflow-hidden">
                        {/* Main reward summary - always visible */}
                        <div className="p-8 pb-6">
                            {/* Title */}
                            <div className="mb-6 text-center">
                                <h2 className="font-medium text-foreground text-xl mb-1">
                                    Great Effort!
                                </h2>
                                <p className="font-sans text-muted-foreground text-base">
                                    Here's your performance summary
                                </p>
                            </div>

                            {/* Illustration with confetti */}
                            <ConfettiIllustration />

                            {/* Score Display */}
                            <div className="flex flex-col items-center gap-2 mt-6 mb-8">
                                <div className="flex flex-col items-center">
                                    <p className="font-sans font-medium text-foreground text-lg">
                                        Your Score
                                    </p>
                                    <p className="font-bold text-5xl tracking-tight my-2">
                                        <span className="text-success">{score}</span>
                                        <span className="text-muted-foreground text-3xl font-medium">/{activeQuestions.length}</span>
                                    </p>
                                </div>
                                <p className="font-sans font-medium text-foreground text-lg">
                                    {accuracy}% Accuracy
                                </p>
                            </div>

                            {/* Motivational message */}
                            <div className="text-center mb-6">
                                <p className="font-medium text-foreground text-sm">
                                    Good start!
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Review your mistakes to improve.
                                </p>
                            </div>

                            {/* View Details Button */}
                            <div className="flex justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="h-11 rounded-full px-6 flex items-center gap-2 border-border hover:bg-muted"
                                >
                                    {showDetails ? 'Hide Details' : 'View Details'}
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={cn("transition-transform duration-200", showDetails && "rotate-90")}>
                                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Button>
                            </div>
                        </div>

                        {/* Detailed Review - Expandable */}
                        {showDetails && (
                            <div className="px-8 pb-8 border-t border-border pt-6 animate-in slide-in-from-top-4 duration-300">
                                <div className="flex flex-col gap-4">
                                    <p className="font-medium text-foreground text-base">
                                        Detailed Review
                                    </p>

                                    {activeQuestions.map((question, index) => {
                                        const isCorrect = selectedAnswers[index] === question.correctAnswer;
                                        const userAnswer = selectedAnswers[index];

                                        return (
                                            <div key={question.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                                                {/* Question Header */}
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-2 items-center">
                                                        <p className="font-medium text-foreground text-sm">
                                                            Question {index + 1}
                                                        </p>
                                                        <span className="text-muted-foreground text-xs">
                                                            • {question.subject}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "px-3 py-1 rounded-md text-xs font-medium",
                                                        isCorrect
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    )}>
                                                        {isCorrect ? '✅ Correct' : '❌ Wrong'}
                                                    </div>
                                                </div>

                                                {/* Question Text */}
                                                <p className="text-foreground text-sm leading-relaxed">
                                                    {question.question}
                                                </p>

                                                {/* Answers */}
                                                <div className="flex flex-col gap-2 mt-1">
                                                    {userAnswer !== null && (
                                                        <div className="flex gap-2 items-start">
                                                            <p className="text-muted-foreground text-sm shrink-0 w-24">
                                                                Your answer:
                                                            </p>
                                                            <p className={cn(
                                                                "text-sm font-medium",
                                                                isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                            )}>
                                                                {question.options[userAnswer]}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {!isCorrect && (
                                                        <div className="flex gap-2 items-start">
                                                            <p className="text-muted-foreground text-sm shrink-0 w-24">
                                                                Correct answer:
                                                            </p>
                                                            <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                                                                {question.options[question.correctAnswer]}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Explanation */}
                                                <div className="bg-muted/50 border border-border rounded-lg p-3 mt-2">
                                                    <p className="text-muted-foreground text-xs font-semibold mb-1">
                                                        Explanation:
                                                    </p>
                                                    <p className="text-foreground text-sm leading-relaxed">
                                                        {question.explanation}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Close Button */}
                                <div className="flex justify-center mt-6">
                                    <Button
                                        className="h-11 px-12 rounded-xl font-medium"
                                        onClick={handleClose}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Close button when details are hidden */}
                        {!showDetails && (
                            <div className="px-8 pb-8 flex justify-center">
                                <Button
                                    className="h-11 px-12 rounded-xl font-medium"
                                    onClick={handleClose}
                                >
                                    Close
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
