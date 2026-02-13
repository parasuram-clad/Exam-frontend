import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { topicContent } from "@/data/studyData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lightbulb,
  Play,
  Star,
  Clock,
  Image as ImageIcon,
  StickyNote,
  Bookmark,
  Download,
  Bot,
  MessageSquare,
  Send,
  User,
  Search,
  Hash,
  ChevronDown,
  X,
  PanelRight,
  HelpCircle,
  Network,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import TestEngine from "@/components/TestEngine";


// Import study plan images
import studyPlan1 from "@/assets/study-plan1.png";

// Local data moved to @/data/studyData


const BulbIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 18 18"
    fill="none"
    className="flex-shrink-0"
  >
    <g
      style={{
        animation: isActive ? 'none' : 'bulbOnOffLoop 4s ease-in-out infinite',
        transformOrigin: 'center',
      }}
    >
      <g className="bulb-rays" style={{
        animation: isActive ? 'none' : 'rayVisibilityLoop 4s ease-in-out infinite',
        opacity: isActive ? 1 : 0
      }}>
        <line x1="9" y1="0.5" x2="9" y2="2" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="13.5" y1="2.5" x2="12.5" y2="3.5" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="17.5" y1="7" x2="16" y2="7" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="14.5" y1="12" x2="13.5" y2="11" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="4.5" y1="2.5" x2="5.5" y2="3.5" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="0.5" y1="7" x2="2" y2="7" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="3.5" y1="12" x2="4.5" y2="11" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
      </g>

      <g className="bulb-body">
        <path
          d="M9 2C6.5 2 4.5 4 4.5 6.5C4.5 8.5 5.5 10 7 11V13C7 13.5 7.5 14 8 14H10C10.5 14 11 13.5 11 13V11C12.5 10 13.5 8.5 13.5 6.5C13.5 4 11.5 2 9 2Z"
          stroke={isActive ? "#fbbf24" : "#9ca3af"}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isActive ? "rgba(251, 191, 36, 0.4)" : "none"}
          style={{
            filter: isActive ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'none',
            animation: isActive ? 'none' : 'bulbColorLoop 4s ease-in-out infinite'
          }}
        />
        <path
          d="M7.5 14V15C7.5 15.5 8 16 8.5 16H9.5C10 16 10.5 15.5 10.5 15V14"
          stroke={isActive ? "#fbbf24" : "#9ca3af"}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  </svg>
);

const StudyContent = () => {
  const { topicId, subtopicId } = useParams();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [userNotes, setUserNotes] = useState("");
  const [showNotesPanel, setShowNotesPanel] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "bot", text: "Hi! I'm your AI study assistant. Ask me anything about this topic!" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openPyqHeading, setOpenPyqHeading] = useState<string | null>(null);
  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  const [isAssessmentFinished, setIsAssessmentFinished] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAssessmentStarted && !isAssessmentFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAssessmentFinished) {
      submitAssessment();
    }
    return () => clearInterval(timer);
  }, [isAssessmentStarted, isAssessmentFinished, timeLeft]);

  // Custom accordion state for dynamic flexible layout
  const [openSections, setOpenSections] = useState<string[]>(['notes', 'ai', 'keywords']);
  const [expandedConcepts, setExpandedConcepts] = useState<number[]>([]);

  useEffect(() => {
    setExpandedConcepts([]);
  }, [currentSection]);

  const toggleConcept = (index: number) => {
    setExpandedConcepts(prev =>
      prev.includes(index)
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const toggleSection = (value: string) => {
    setOpenSections(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const isInQuizMode = isAssessmentStarted && !isAssessmentFinished;

  // Open MindMap Page
  const openMindMap = (sectionId?: number) => {
    if (sectionId) {
      navigate(`/study-plan/topic/${topicId}/subtopic/${subtopicId}/section/${sectionId}/mindmap`);
    } else {
      navigate(`/study-plan/topic/${topicId}/subtopic/${subtopicId}/mindmap`);
    }
  };

  // Get content data
  const content = topicContent[topicId as keyof typeof topicContent]?.[subtopicId as string];

  if (!content) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Content not found</p>
          <Button onClick={() => navigate('/study-plan')}>
            Back to Study Plan
          </Button>
        </div>
      </div>
    );
  }

  const section = content.sections[currentSection];
  const progress = (content.completedSections / content.totalSections) * 100;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newUserMsg = { id: Date.now(), sender: "user", text: chatInput };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput("");

    // Simulate AI response
    setTimeout(() => {
      const botResponses = [
        "That's a great question! Based on the Sangam literature...",
        "The historical evidence suggests that...",
        "Here's a simplified explanation: The three kingdoms were constantly...",
        "In the context of the Sangam age, this term refers to..."
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: randomResponse }]);
    }, 1000);
  };

  const handleNext = () => {
    if (currentSection < content.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      // Reset assessment state when changing sections
      setIsAssessmentStarted(false);
      setIsAssessmentFinished(false);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizScore(null);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      // Reset assessment state when changing sections
      setIsAssessmentStarted(false);
      setIsAssessmentFinished(false);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizScore(null);
    }
  };

  const startAssessment = () => {
    setIsAssessmentStarted(true);
    setIsAssessmentFinished(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setMarkedForReview({});
    setQuizScore(null);
    setTimeLeft(600); // Reset timer to 10 minutes
  };

  const handleOptionSelect = (optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex]
    }));
  };

  const submitAssessment = (finalAnswers?: any) => {
    const questions = section.questions;
    let score = 0;

    // Use provided answers or fallback to state
    const sourceAnswers = finalAnswers || userAnswers;

    // Normalize format if answers are from TestEngine
    const normalizedAnswers = typeof Object.values(sourceAnswers)[0] === 'object'
      ? Object.keys(sourceAnswers).reduce((acc: any, key: any) => {
        acc[key] = sourceAnswers[key].selectedOption;
        return acc;
      }, {})
      : sourceAnswers;

    questions.forEach((q: any, idx: number) => {
      if (normalizedAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });

    const finalScore = (score / questions.length) * 100;
    setQuizScore(finalScore);
    setIsAssessmentFinished(true);

    if (finalScore >= 70) {
      section.completed = true;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="w-full px-4 py-6">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/study-plan')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Study Plan</span>
          </button>

          <div className="bg-white rounded-lg p-5 border border-[#F2F2F7] shadow-sm">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-4">
              {/* Topic Image */}
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F2F2F7] rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    <img src={content.image} alt={content.title} className="w-10 h-10 sm:w-12 sm:h-12 object-contain opacity-70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1E] mb-1 sm:mb-2 leading-tight">{content.title}</h1>
                    <p className="text-xs sm:text-sm text-[#8E8E93] line-clamp-2 md:line-clamp-none">{content.description}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <Button
                  onClick={() => openMindMap()}
                  className="flex-1 sm:flex-none relative bg-gradient-to-r from-[#7C79EC] to-[#5B58D8] hover:from-[#6B68DB] hover:to-[#4A47C7] text-white border-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold shadow-lg shadow-[#7C79EC]/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group h-10"
                >
                  <Network className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                  <span>Mind Map</span>
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
                </Button>
                <Button variant="outline" size="icon" className="border-[#E5E5EA] rounded-xl shrink-0 h-10 w-10">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <div className="hidden sm:flex items-center gap-2 bg-[#F2F2F7] px-4 py-2 rounded-xl h-10">
                  <Clock className="w-4 h-4 text-[#8E8E93]" />
                  <span className="text-xs sm:text-sm font-bold text-[#1C1C1E]">
                    {section.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8E8E93] font-medium">Overall Progress</span>
                <span className="text-[#1C1C1E] font-bold">
                  {content.completedSections} of {content.totalSections} sections • {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-[#E5E5EA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Left Sidebar - Section Navigation */}
          {!isInQuizMode && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-4 border border-[#F2F2F7] shadow-sm lg:sticky lg:top-4 overflow-hidden">
                <h3 className="text-base sm:text-lg font-bold text-[#1C1C1E] mb-4">Sections</h3>

                {/* Mobile/Tablet: Horizontal scroll list */}
                {/* Desktop: Vertical list */}
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide snap-x">
                  {content.sections.map((sec, index) => {
                    const isLocked = content.sections.slice(0, index).some(s => !s.completed);

                    return (
                      <div key={sec.id} className="relative group shrink-0 w-[240px] lg:w-full snap-start">
                        <button
                          onClick={() => !isLocked && setCurrentSection(index)}
                          disabled={isLocked}
                          className={cn(
                            "w-full text-left p-3 rounded-xl transition-all h-full lg:h-auto",
                            currentSection === index
                              ? "bg-accent text-accent-foreground shadow-md ring-1 ring-accent-foreground/10"
                              : isLocked
                                ? "bg-slate-50 text-[#8E8E93] opacity-60 cursor-not-allowed border border-slate-100"
                                : "bg-slate-50 text-[#1C1C1E] hover:bg-[#E5E5EA] border border-slate-100"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                sec.completed
                                  ? "bg-primary"
                                  : currentSection === index
                                    ? "bg-white/40"
                                    : "bg-white"
                              )}
                            >
                              {sec.completed ? (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              ) : isLocked ? (
                                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-[#8E8E93]" />
                              ) : sec.type === "quiz" ? (
                                <Brain className={cn("w-3 h-3 sm:w-4 sm:h-4", currentSection === index ? "text-accent-foreground" : "text-[#8E8E93]")} />
                              ) : (
                                <BookOpen className={cn("w-3 h-3 sm:w-4 sm:h-4", currentSection === index ? "text-accent-foreground" : "text-[#8E8E93]")} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pr-8 relative">
                              <p className={cn(
                                "text-[13px] sm:text-sm font-bold truncate",
                                currentSection === index ? "text-accent-foreground" : "text-[#1C1C1E]"
                              )}>
                                {sec.title}
                              </p>
                              {!isLocked && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openMindMap(sec.id);
                                  }}
                                  className={cn(
                                    "absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all",
                                    currentSection === index
                                      ? "opacity-100 bg-gradient-to-r from-[#7C79EC] to-[#5B58D8] hover:from-[#6B68DB] hover:to-[#4A47C7] text-white shadow-lg"
                                      : "opacity-0 group-hover:opacity-100 bg-gradient-to-r from-[#7C79EC] to-[#5B58D8] hover:from-[#6B68DB] hover:to-[#4A47C7] text-white"
                                  )}
                                  title="Section Mind Map"
                                >
                                  <Network className="w-4 h-4" />
                                </button>
                              )}
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className={cn(
                                  "text-[10px] sm:text-xs font-medium",
                                  currentSection === index ? "text-accent-foreground/70" : "text-[#8E8E93]"
                                )}>
                                  {isLocked ? "Locked" : sec.duration}
                                </p>
                                {sec.type === "quiz" && (
                                  <span className="w-1 h-1 rounded-full bg-current opacity-30"></span>
                                )}
                                {sec.type === "quiz" && (
                                  <p className={cn("text-[10px] sm:text-xs font-bold", currentSection === index ? "text-accent-foreground/70" : "text-[#8E8E93]")}>Quiz</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={cn(
            "space-y-4 transition-all duration-500",
            isInQuizMode ? "lg:col-span-4 w-full" : showNotesPanel ? "lg:col-span-2 md:col-span-3" : "lg:col-span-3 md:col-span-4"
          )}>
            {/* Current Section Content */}
            <div className={cn(
              "bg-white rounded-xl p-4 sm:p-6 border border-[#F2F2F7] shadow-sm",
              isInQuizMode && "shadow-xl border-accent/20"
            )}>
              {!isInQuizMode && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                    {section.type === "quiz" ? (
                      <Brain className="w-6 h-6 text-accent" />
                    ) : (
                      <FileText className="w-6 h-6 text-accent" />
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#1C1C1E]">{section.title}</h2>
                      <p className="text-sm text-[#8E8E93]">
                        Section {currentSection + 1} of {content.sections.length}
                      </p>
                    </div>
                    {section.type !== "quiz" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMindMap(section.id)}
                        className="bg-gradient-to-r from-[#7C79EC] to-[#5B58D8] hover:from-[#6B68DB] hover:to-[#4A47C7] text-white border-0 hover:text-white rounded-xl gap-2  shadow-md shadow-[#7C79EC]/20 transition-all hover:scale-105 active:scale-95 px-4"
                      >
                        <Network className="w-4 h-4" />
                        <span className="hidden sm:inline">Section Mind Map</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}


              {section.type === "reading" ? (

                <div className="space-y-6">
                  {/* Introduction */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-bold text-[#1C1C1E]">Overview</h3>
                    </div>
                    <p className="text-[#3A3A3C] leading-relaxed text-[15px] font-medium marker:text-accent">
                      {section.content.introduction}
                    </p>
                  </div>

                  {/* Key Points */}
                  {section.content.keyPoints && (
                    <div className="bg-accent/5 rounded-2xl p-6 border border-accent/20">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-accent fill-accent" />
                          <h3 className="text-xl font-bold text-[#1C1C1E]">Mastery Concepts</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (expandedConcepts.length === section.content.keyPoints.length) {
                              setExpandedConcepts([]);
                            } else {
                              setExpandedConcepts(section.content.keyPoints.map((_: any, i: number) => i));
                            }
                          }}
                          className="text-xs font-bold text-accent hover:bg-accent/10"
                        >
                          {expandedConcepts.length === section.content.keyPoints.length ? "Collapse All" : "Expand All"}
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {section.content.keyPoints.map((point: any, index: number) => {
                          const isExpanded = expandedConcepts.includes(index);
                          return (
                            <div key={index} className="bg-white/50 rounded-xl border border-accent/10 overflow-hidden transition-all duration-300">
                              <button
                                onClick={() => toggleConcept(index)}
                                className="w-full flex items-center justify-between p-4 hover:bg-accent/5 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-8 h-8 border-2 text-sm font-bold rounded-lg flex items-center justify-center transition-all duration-300",
                                    isExpanded ? "bg-accent border-accent text-accent-foreground" : "bg-white border-accent/20 text-accent"
                                  )}>
                                    {index + 1}
                                  </div>
                                  <span className="text-[#1C1C1E] text-base font-bold text-left">
                                    {typeof point === 'string' ? point : point.title}
                                  </span>
                                </div>
                                <ChevronDown className={cn(
                                  "w-5 h-5 text-accent transition-transform duration-300",
                                  isExpanded ? "rotate-180" : ""
                                )} />
                              </button>

                              {isExpanded && typeof point !== 'string' && point.details && (
                                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                  <div className="pl-11 space-y-4 pt-2 border-t border-accent/5">
                                    {point.details.map((detail: any, dIdx: number) => (
                                      <div key={dIdx} className="space-y-2">
                                        <div className="flex items-start gap-3">
                                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                                          <p className="text-[15px] text-[#3A3A3C] font-semibold leading-relaxed">
                                            {typeof detail === 'string' ? detail : detail.title}
                                          </p>
                                        </div>
                                        {typeof detail !== 'string' && detail.details && (
                                          <ul className="pl-5 space-y-2">
                                            {detail.details.map((sub: string, sIdx: number) => (
                                              <li key={sIdx} className="text-[13px] text-[#64748B] list-none flex items-start gap-2">
                                                <span className="w-1.5 h-[1px] bg-slate-300 mt-2 shrink-0" />
                                                <span>{sub}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}


                  {/* Key Terms Glossary */}
                  {section.content.keyTerms && section.content.keyTerms.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-slate-100">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-[#F0F9FF] rounded-xl flex items-center justify-center">
                          <Hash className="w-5 h-5 text-[#0369A1]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1C1C1E]">Key Vocabulary</h3>
                      </div>
                      <div className="space-y-4">
                        {section.content.keyTerms.map((term: any, idx: number) => (
                          <div key={idx} className="flex gap-4 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0369A1] mt-2.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                            <div className="pb-4 border-b border-dashed border-slate-100 flex-1">
                              <span className="font-bold text-[#1C1C1E] text-[15px] mr-2">{term.term}:</span>
                              <span className="text-[#64748B] text-[15px] leading-relaxed">{term.definition}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}


                  {/* Detailed Notes */}
                  {section.content.detailedNotes && (
                    <div className="mt-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#EEF2FF] rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-[#4F46E5]" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-[#1C1C1E]">Detailed Study Notes</h3>
                            <p className="text-sm text-[#64748B]">In-depth analysis and exam-oriented content</p>
                          </div>
                        </div>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-[#E2E8F0] to-transparent ml-6"></div>
                      </div>

                      <div className="space-y-12">
                        {section.content.detailedNotes.map((note: any, index: number) => (
                          <div key={index} className="relative group">
                            {/* Accent Line */}
                            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#4F46E5] via-[#818CF8] to-transparent rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />

                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded uppercase tracking-wider">Concept {index + 1}</span>
                                <h4 className="font-bold text-[#1F2937] text-xl leading-tight">{note.heading}</h4>
                              </div>

                              <div className={cn(
                                "text-[#475569] leading-relaxed text-[15px] font-medium transition-all duration-300 rounded-2xl",
                                openPyqHeading === note.heading ? "bg-amber-50/50 p-6 border border-amber-100/50" : ""
                              )}>
                                <div className="space-y-4">
                                  {note.content.split('\n').map((paragraph: string, pIdx: number, arr: string[]) => (
                                    <p key={pIdx}>
                                      {paragraph}
                                      {pIdx === arr.length - 1 && note.pyqs && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenPyqHeading(openPyqHeading === note.heading ? null : note.heading);
                                          }}
                                          className={cn(
                                            "inline-flex items-center justify-center ml-2 cursor-pointer transition-all duration-300 align-middle p-1 rounded-full hover:bg-amber-50 group",
                                            openPyqHeading === note.heading ? "bg-amber-100" : ""
                                          )}
                                          title="Exam Insights"
                                        >
                                          <BulbIcon isActive={openPyqHeading === note.heading} />
                                        </button>
                                      )}
                                    </p>
                                  ))}
                                </div>

                                {/* Render Subtopics if they exist */}
                                {note.subtopics && (
                                  <div className="mt-8 space-y-6">
                                    {note.subtopics.map((sub: any, sIdx: number) => (
                                      <div key={sIdx} className="relative pl-6 pb-2 border-l border-slate-200 hover:border-[#4F46E5] transition-colors">
                                        <div className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-white border-2 border-[#4F46E5] shadow-[0_0_0_2px_white]" />
                                        <h5 className="font-extrabold text-[#1F2937] text-[15px] mb-2 flex items-center gap-2">
                                          {sub.title}
                                        </h5>
                                        <p className="text-[15px] text-[#475569] leading-relaxed font-normal">
                                          {sub.content}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                              </div>

                              {/* Expanded PYQ Content */}
                              {note.pyqs && openPyqHeading === note.heading && (
                                <div className="mt-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-[#0EA5E9]/10 rounded-lg flex items-center justify-center">
                                      <HelpCircle className="w-4 h-4 text-[#0EA5E9]" />
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-sm text-[#1E293B]">Previous Year Questions Analysis</h5>
                                      <p className="text-[10px] text-[#64748B] uppercase tracking-widest font-bold">Exam Pattern Insight</p>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    {note.pyqs.map((q: any, i: number) => (
                                      <div key={i} className="bg-white p-4 rounded-xl border border-[#F1F5F9] shadow-sm hover:border-[#0EA5E9]/30 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-[10px] font-extrabold text-[#0EA5E9] bg-[#0EA5E9]/10 px-2 py-0.5 rounded-full">{q.year} TNPSC Exam</span>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-sm font-bold text-[#334155] leading-snug">Q: {q.question}</p>
                                          <div className="flex items-start gap-2 pt-1">
                                            <div className="w-5 h-5 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0 mt-0.5">
                                              <CheckCircle className="w-3 h-3 text-[#10B981]" />
                                            </div>
                                            <p className="text-sm text-[#64748B] font-medium italic">Answer: {q.answer}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}


                  {/* Important Dates Timeline */}
                  {section.content.importantDates && (
                    <div className="bg-gradient-to-br from-[#FFF4E5] to-[#FFF8ED] rounded-lg p-5 border border-[#FFE4B5]">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-[#FFCC1F]" />
                        <h3 className="text-lg font-bold text-[#1C1C1E]">Important Timeline</h3>
                      </div>
                      <div className="space-y-4">
                        {section.content.importantDates.map((item: any, index: number) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="bg-[#FFCC1F] text-[#1C1C1E] px-3 py-1.5 rounded-lg font-bold text-sm shrink-0 min-w-[100px] text-center">
                              {item.year}
                            </div>
                            <p className="text-[#3A3A3C] leading-relaxed flex-1 pt-1 text-[15px]">{item.event}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : isAssessmentFinished ? (
                <div className="text-center py-12 animate-in fade-in scale-in">
                  <div className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6",
                    quizScore! >= 70 ? "bg-[#34C759]/20" : "bg-[#FF3B30]/20"
                  )}>
                    {quizScore! >= 70 ? (
                      <CheckCircle className="w-12 h-12 text-[#34C759]" />
                    ) : (
                      <Brain className="w-12 h-12 text-[#FF3B30]" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1C1C1E] mb-2">Assessment Result</h3>
                  <div className="text-5xl font-extrabold mb-4" style={{ color: quizScore! >= 70 ? '#34C759' : '#FF3B30' }}>
                    {quizScore}%
                  </div>
                  <p className="text-[#8E8E93] mb-8 text-lg">
                    {quizScore! >= 70
                      ? "Congratulations! You've successfully completed the assessment."
                      : "Don't worry! Keep studying and try again to improve your score."}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={startAssessment}
                      className="border-[#E5E5EA] rounded-lg px-6"
                    >
                      Try Again
                    </Button>
                    {quizScore! >= 70 && (
                      <Button
                        onClick={() => navigate('/study-plan')}
                        className="bg-[#1D1E2C] hover:bg-[#2C3142] text-white rounded-lg px-6"
                      >
                        Finish Journey
                      </Button>
                    )}
                  </div>
                </div>
              ) : isAssessmentStarted && !isAssessmentFinished ? (
                <div className="py-2 animate-in fade-in slide-in-from-right-4">
                  <div className="lg:-mx-6 -mx-4 -mt-6">
                    <TestEngine
                      questions={section.questions}
                      onComplete={(answers) => submitAssessment(answers)}
                      title={section.title}
                      subtitle={`${section.duration} • ${section.questions.length} Questions`}
                      initialTime={600}
                      transparentBg={true}
                    />
                  </div>
                </div>

              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1C1C1E] mb-2">Ready for Assessment?</h3>
                  <p className="text-[#8E8E93] mb-2 max-w-sm mx-auto">
                    Test your understanding with {section.questions.length} carefully crafted questions based on the Sangam Period.
                  </p>
                  <div className="bg-[#F9FAFB] rounded-xl p-4 inline-flex flex-col gap-2 mb-8 border border-[#F2F2F7]">
                    <p className="text-sm font-semibold text-[#3A3A3C]">
                      ⏱️ Time limit: 10 minutes
                    </p>
                    <p className="text-sm font-semibold text-[#3A3A3C]">
                      📊 Passing score: 70% (7/10 questions)
                    </p>
                  </div>
                  <br />
                  <Button
                    onClick={startAssessment}
                    className="bg-accent text-accent-foreground hover:bg-accent hover:shadow-[0_0_20px_rgba(250,222,81,0.5)] font-bold px-12 py-6 text-lg rounded-xl transition-all hover:scale-105"
                  >
                    <Play className="w-5 h-5 mr-3 fill-current" />
                    Start Assessment
                  </Button>
                </div>
              )}

              {/* Navigation Buttons - Only show when not in an active assessment */}
              {(!isAssessmentStarted || isAssessmentFinished) && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#F2F2F7]">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentSection === 0}
                    variant="outline"
                    className="border-[#E5E5EA] rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {section.type === "reading" && !section.completed && (
                      <Button
                        onClick={() => {
                          section.completed = true;
                          handleNext();
                        }}
                        variant="outline"
                        className="border-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground rounded-lg"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      disabled={currentSection === content.sections.length - 1}
                      className="bg-[#1D1E2C] hover:bg-[#2C3142] rounded-lg"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Tools Panel (Accordion) */}
          {showNotesPanel && !isInQuizMode && (
            <div className="lg:col-span-1">
              <div className={cn(
                "bg-white rounded-lg border border-[#F2F2F7] shadow-sm sticky top-4 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
                openSections.length > 0 ? "h-[calc(100vh-2rem)]" : "h-auto"
              )}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#F2F2F7] bg-white sticky top-0 z-10">
                  <h3 className="text-sm font-bold text-[#1C1C1E]">Study Tools</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotesPanel(false)}
                    className="h-6 w-6 rounded-full hover:bg-[#F2F2F7] text-[#8E8E93] hover:text-[#1C1C1E]"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Notes Section */}
                <div className={cn(
                  "border-b border-[#F2F2F7] flex flex-col transition-all duration-300 ease-in-out",
                  openSections.includes("notes") ? "flex-1 min-h-0" : "flex-none"
                )}>
                  <button
                    onClick={() => toggleSection("notes")}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-[#7C79EC]" />
                      <span className="text-sm font-bold text-[#1C1C1E]">My Notes</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-[#8E8E93] transition-transform duration-200",
                      openSections.includes("notes") && "rotate-180"
                    )} />
                  </button>
                  {openSections.includes("notes") && (
                    <div className="flex-1 min-h-0 flex flex-col p-4 pt-0 overflow-hidden">
                      <div className="flex justify-end mb-2 shrink-0">
                        <Button variant="ghost" size="sm" className="h-6 gap-1 text-[#8E8E93]">
                          <Download className="w-3 h-3" /> Save
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Take notes here..."
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                        className="flex-1 resize-none border-[#E5E5EA] focus:border-[#7C79EC] focus:ring-[#7C79EC] rounded-lg p-3 min-h-0"
                      />
                      <p className="text-xs text-[#8E8E93] mt-2 shrink-0">
                        <CheckCircle className="w-3 h-3 inline mr-1" /> Auto-saved
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Chat Section */}
                <div className={cn(
                  "border-b border-[#F2F2F7] flex flex-col transition-all duration-300 ease-in-out",
                  openSections.includes("ai") ? "flex-1 min-h-0" : "flex-none"
                )}>
                  <button
                    onClick={() => toggleSection("ai")}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-bold text-[#1C1C1E]">AI Assistant</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-[#8E8E93] transition-transform duration-200",
                      openSections.includes("ai") && "rotate-180"
                    )} />
                  </button>
                  {openSections.includes("ai") && (
                    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFAFA] overflow-hidden">
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-3">
                          {chatMessages.map(msg => (
                            <div key={msg.id} className={cn("flex gap-2", msg.sender === 'user' ? "flex-row-reverse" : "")}>
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-[#E5E5EA]",
                                msg.sender === 'bot' ? "bg-white" : "bg-[#1D1E2C]"
                              )}>
                                {msg.sender === 'bot' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3 text-white" />}
                              </div>
                              <div className={cn(
                                "p-2.5 rounded-2xl text-xs max-w-[85%] shadow-sm",
                                msg.sender === 'user' ? "bg-[#1D1E2C] text-white rounded-tr-sm" : "bg-white border border-[#E5E5EA] text-[#1C1C1E] rounded-tl-sm"
                              )}>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                      <div className="p-3 bg-white border-t border-[#F2F2F7] shrink-0">
                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                          <Input
                            placeholder="Ask anything..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            className="rounded-lg border-[#E5E5EA] h-9 text-sm"
                          />
                          <Button type="submit" size="icon" className="rounded-lg bg-[#1D1E2C] hover:bg-[#2C3142] h-9 w-9 shrink-0">
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>

                {/* Keywords Section */}
                <div className={cn(
                  "flex flex-col transition-all duration-300 ease-in-out",
                  openSections.includes("keywords") ? "flex-1 min-h-0" : "flex-none"
                )}>
                  <button
                    onClick={() => toggleSection("keywords")}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-[#1C1C1E]">Key Terms</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-[#8E8E93] transition-transform duration-200",
                      openSections.includes("keywords") && "rotate-180"
                    )} />
                  </button>
                  {openSections.includes("keywords") && (
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                      <div className="p-3 bg-white border-b border-[#F2F2F7] shrink-0">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#8E8E93]" />
                          <Input
                            placeholder="Search definitions..."
                            className="pl-8 rounded-lg border-[#E5E5EA] h-8 text-xs bg-[#F9FAFB]"
                          />
                        </div>
                      </div>
                      <ScrollArea className="flex-1 bg-white">
                        <div className="p-3 space-y-2">
                          {section.content?.keyTerms?.map((term, i) => (
                            <div key={i} className="bg-white rounded-lg p-3 border border-[#E5E5EA] hover:border-[#7C79EC]/30">
                              <h4 className="font-bold text-[#1C1C1E] text-xs mb-1">{term.term}</h4>
                              <p className="text-[11px] text-[#6366F1] font-medium leading-relaxed bg-[#EEF2FF] inline-block px-1.5 py-0.5 rounded">{term.definition}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>
            </div>

          )}
        </div>
      </div>

      {/* Floating Sidebar Toggle */}
      {!isInQuizMode && (
        <Button
          onClick={() => setShowNotesPanel(!showNotesPanel)}
          className={cn(
            "fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 transition-all duration-300 flex items-center justify-center hover:scale-105",
            showNotesPanel
              ? "bg-white text-[#1C1C1E] border border-[#E5E5EA] hover:bg-[#F2F2F7]"
              : "bg-[#1D1E2C] text-white hover:bg-[#2C3142]"
          )}
        >
          {showNotesPanel ? (
            <PanelRight className="w-6 h-6" />
          ) : (
            <PanelRight className="w-6 h-6" />
          )}
        </Button>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bulbOnOffLoop {
          0%, 40%, 100% { transform: rotate(0deg) scale(1); }
          45% { transform: rotate(-8deg) scale(1.1); }
          50% { transform: rotate(8deg) scale(1.1); }
          55% { transform: rotate(-5deg) scale(1.1); }
          60% { transform: rotate(0deg) scale(1); }
        }

        @keyframes rayVisibilityLoop {
          0%, 40%, 100% { opacity: 0; transform: scale(0.8); }
          45%, 90% { opacity: 1; transform: scale(1); }
        }

        @keyframes bulbColorLoop {
          0%, 40%, 100% { 
            stroke: #9ca3af; 
            fill: none;
          }
          45%, 90% { 
            stroke: #fbbf24; 
            fill: rgba(251, 191, 36, 0.2);
          }
        }
      `}} />
    </div>
  );
};

export default StudyContent;
