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

  // Generate keywords from section content
  const generateKeywords = () => {
    const keywords: string[] = [];

    // Add key terms
    if (section.content?.keyTerms) {
      section.content.keyTerms.forEach((term: any) => {
        keywords.push(term.term);
      });
    }

    // Add key points titles
    if (section.content?.keyPoints) {
      section.content.keyPoints.forEach((point: any) => {
        if (typeof point === 'object' && point.title) {
          keywords.push(point.title);
        }
      });
    }

    // Add detailed notes headings
    if (section.content?.detailedNotes) {
      section.content.detailedNotes.forEach((note: any) => {
        if (note.heading) {
          keywords.push(note.heading);
        }
      });
    }

    return keywords.slice(0, 16); // Limit to 16 keywords
  };

  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [keywordNotes, setKeywordNotes] = useState<Record<string, string>>({});

  const keywords = generateKeywords();

  return (
    <div className="min-h-screen">
      {/* Main Content Area - Clean Reading Layout */}
      <div className="grid lg:grid-cols-12">
        {/* Left - Reading Content */}
        <div className={cn(
          "lg:col-span-7 xl:col-span-7 bg-[#E8E6E1] min-h-screen",
          isInQuizMode && "lg:col-span-12"
        )}>
          {/* Back Button - Fixed at top */}
          <div className="sticky top-0 z-10 bg-[#E8E6E1] px-8 lg:px-12 py-4">
            <button
              onClick={() => navigate('/study-plan')}
              className="flex items-center gap-2 text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Study Plan</span>
            </button>
          </div>

          {/* A4 Pages Container */}
          <div className="px-4 lg:px-8 pb-12 space-y-12">
            {/* Topic Header Page */}
            <div className="bg-white shadow-xl mx-auto border border-[#E5E5EA]" style={{
              width: '100%',
              maxWidth: '820px',
              minHeight: '1160px',
              aspectRatio: '1 / 1.414'
            }}>
              <div className="p-16 lg:p-24 h-full flex flex-col justify-center items-center text-center">
                <div className="max-w-xl">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#8E8E93] mb-6 font-sans">Educational Series</p>
                  <h1 className="text-4xl lg:text-5xl font-bold text-[#1C1C1E] leading-tight mb-8 font-serif">
                    {content.title}
                  </h1>
                  <div className="w-24 h-1 bg-[#1C1C1E] mx-auto mb-8"></div>
                  <p className="text-xl text-[#4A4A4A] mb-12 font-serif leading-relaxed">{content.description}</p>
                  <div className="pt-8 border-t border-[#F2F2F7] w-full">
                    <p className="text-sm font-sans text-[#8E8E93] uppercase tracking-widest">
                      {content.sections.length} Chapters • {content.sections.filter((s: any) => s.completed).length} Completed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Render each section as an A4 page */}
            {content.sections.filter((sec: any) => sec.type === 'reading').map((sec: any, sectionIndex: number) => (
              <div
                key={sec.id}
                id={`section-${sec.id}`}
                className="bg-white shadow-xl mx-auto border border-[#E5E5EA] scroll-mt-20 overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: '820px',
                  minHeight: '1160px',
                  aspectRatio: '1 / 1.414'
                }}
              >
                <div className="p-10 lg:p-16 h-full flex flex-col">
                  {/* Page Header */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#F2F2F7] font-sans">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#8E8E93] font-bold text-black/40">
                      Chapter {sectionIndex + 1}
                    </span>
                    <span className="text-xs text-[#8E8E93] font-medium italic">
                      Reading time: {sec.duration}
                    </span>
                  </div>

                  {/* Section Title */}
                  <h2 className="text-3xl lg:text-4xl font-bold text-[#1C1C1E] mb-8 leading-tight font-serif">
                    {sec.title}
                  </h2>

                  {/* Section Content */}
                  <div className="space-y-6 text-[#2C2C2E] font-serif flex-1">
                    {/* Introduction */}
                    {sec.content?.introduction && (
                      <p className="text-[18px] leading-[1.8] font-normal text-justify first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-[#1C1C1E]">
                        {sec.content.introduction}
                      </p>
                    )}

                    {/* Detailed Notes */}
                    <div className="space-y-8">
                      {sec.content?.detailedNotes?.map((note: any, noteIndex: number) => (
                        <div key={noteIndex} className="space-y-4">
                          {note.heading && (
                            <h3 className="text-2xl font-bold text-[#1C1C1E] mt-6 mb-3 border-l-4 border-[#1C1C1E] pl-4 font-serif">
                              {note.heading}
                            </h3>
                          )}
                          <p className="text-[18px] leading-[1.8] font-normal text-justify">
                            {note.content}
                          </p>

                          {/* Subtopics */}
                          {note.subtopics && (
                            <div className="space-y-4 mt-4 ml-6">
                              {note.subtopics.map((sub: any, subIndex: number) => (
                                <div key={subIndex} className="relative">
                                  <h4 className="text-xl font-bold text-[#1C1C1E] mb-2 flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-[#1C1C1E]"></span>
                                    {sub.title}
                                  </h4>
                                  <p className="text-[17px] leading-[1.7] text-[#4A4A4A] pl-5">
                                    {sub.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Additional Material Container to prevent overlap */}
                    <div className="space-y-10 mt-10 pt-8 border-t border-[#F2F2F7]">
                      {/* Key Points */}
                      {sec.content?.keyPoints && sec.content.keyPoints.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-[#1C1C1E] mb-4 font-sans uppercase tracking-widest flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-[#1C1C1E]"></span>
                            Essential Concepts
                          </h3>
                          <ul className="space-y-3">
                            {sec.content.keyPoints.map((point: any, pointIndex: number) => (
                              <li key={pointIndex} className="flex items-start gap-4 p-4 bg-[#F9FAFB] border border-[#F2F2F7] rounded-xl font-serif">
                                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-[#1C1C1E]/5 text-[#1C1C1E] text-xs font-bold shrink-0">{pointIndex + 1}</span>
                                <span className="text-[17px] leading-[1.6]">
                                  {typeof point === 'string' ? point : point.title}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Key Terms */}
                        {sec.content?.keyTerms && sec.content.keyTerms.length > 0 && (
                          <div className="p-6 bg-[#FAFAF8] border border-[#F2F2F7] rounded-2xl">
                            <h3 className="text-sm font-bold text-[#1C1C1E] mb-4 font-sans uppercase tracking-widest">Glossary</h3>
                            <dl className="space-y-4">
                              {sec.content.keyTerms.map((term: any, termIndex: number) => (
                                <div key={termIndex}>
                                  <dt className="font-bold text-[#1C1C1E] text-[16px] font-serif">{term.term}</dt>
                                  <dd className="text-[15px] text-[#5A5A5C] font-serif italic mt-1">{term.definition}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        )}

                        {/* Important Dates */}
                        {sec.content?.importantDates && sec.content.importantDates.length > 0 && (
                          <div className="p-6 bg-[#FAFAF8] border border-[#F2F2F7] rounded-2xl">
                            <h3 className="text-sm font-bold text-[#1C1C1E] mb-4 font-sans uppercase tracking-widest">Timeline</h3>
                            <div className="space-y-4">
                              {sec.content.importantDates.map((date: any, dateIndex: number) => (
                                <div key={dateIndex} className="flex gap-4 items-baseline">
                                  <span className="font-bold text-[#1C1C1E] text-[15px] shrink-0 font-sans">{date.year}</span>
                                  <span className="text-[15px] text-[#5A5A5C] font-serif">{date.event}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Page Footer */}
                  <div className="mt-12 pt-8 border-t border-[#F2F2F7] flex justify-between items-center font-sans">
                    <span className="text-[10px] uppercase tracking-widest text-[#8E8E93] font-bold">{content.title} &bull; {sec.title}</span>
                    <span className="text-xs font-bold text-[#1C1C1E] bg-[#F2F2F7] px-3 py-1 rounded">Page {sectionIndex + 2}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Quiz Section Pages */}
            {content.sections.filter((sec: any) => sec.type === 'quiz').map((sec: any, quizIndex: number) => (
              <div
                key={sec.id}
                id={`quiz-${sec.id}`}
                className="bg-white shadow-xl mx-auto border border-[#E5E5EA] scroll-mt-20 overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: '820px',
                  minHeight: '1160px',
                  aspectRatio: '1 / 1.414'
                }}
              >
                <div className="p-14 lg:p-20 h-full flex flex-col">
                  {/* Quiz Header */}
                  <div className="flex items-center justify-between mb-12 pb-4 border-b border-[#F2F2F7] font-sans">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#8E8E93] font-bold text-black/40">
                      Assessment
                    </span>
                    <span className="text-xs text-[#8E8E93] font-medium italic">
                      Time allowed: {sec.duration}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                    <div className="w-24 h-24 bg-[#1C1C1E]/5 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-300">
                      <Brain className="w-12 h-12 text-[#1C1C1E]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-[#1C1C1E] mb-4 font-serif">{sec.title}</h2>
                      <p className="text-[#8E8E93] max-w-sm mx-auto font-sans leading-relaxed">
                        Test your understanding with {sec.questions?.length || 10} carefully crafted questions from this chapter.
                      </p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-2xl p-6 grid grid-cols-2 gap-8 border border-[#F2F2F7] w-full max-w-md">
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-[#8E8E93] mb-1 font-bold">Time Limit</p>
                        <p className="text-lg font-bold text-[#1C1C1E]">10 Minutes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-[#8E8E93] mb-1 font-bold">Passing Score</p>
                        <p className="text-lg font-bold text-[#1C1C1E]">70%</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setCurrentSection(content.sections.findIndex((s: any) => s.id === sec.id));
                        startAssessment();
                      }}
                      className="bg-[#1C1C1E] text-white hover:bg-black font-bold px-12 py-6 text-lg rounded-xl transition-all shadow-lg hover:shadow-xl w-full max-w-sm font-sans"
                    >
                      <Play className="w-5 h-5 mr-3 fill-current" />
                      Begin Assessment
                    </Button>
                  </div>

                  {/* Page Footer */}
                  <div className="mt-12 pt-8 border-t border-[#F2F2F7] flex justify-between items-center font-sans">
                    <span className="text-[10px] uppercase tracking-widest text-[#8E8E93] font-bold">Final Evaluation</span>
                    <span className="text-xs font-bold text-[#1C1C1E] bg-[#F2F2F7] px-3 py-1 rounded">End of Part</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Keywords & Notes Sidebar */}
        {!isInQuizMode && (
          <div className="lg:col-span-5 xl:col-span-5 bg-[#FAF9F6] min-h-screen">
            <div className="px-8 lg:px-10 py-8 lg:sticky lg:top-0 space-y-6">
              {/* Keywords Section */}
              <div className="bg-white rounded-2xl p-6 border border-[#F0EDE8] shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#1C1C1E] mb-1">Keywords</h3>
                  <p className="text-xs text-[#8E8E93]">Updates based on visible content</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedKeyword(selectedKeyword === keyword ? null : keyword)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                        selectedKeyword === keyword
                          ? "bg-[#1C1C1E] text-white"
                          : "bg-[#F5F4F1] text-[#3C3C3E] hover:bg-[#E8E6E1] border border-[#E8E6E1]"
                      )}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-white rounded-2xl p-6 border border-[#F0EDE8] shadow-sm">
                <h3 className="text-lg font-bold text-[#1C1C1E] mb-4">Notes</h3>

                {selectedKeyword ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-[#1C1C1E] text-white text-xs rounded-full font-medium">
                        {selectedKeyword}
                      </span>
                    </div>
                    <Textarea
                      placeholder={`Add notes about "${selectedKeyword}"...`}
                      value={keywordNotes[selectedKeyword] || ''}
                      onChange={(e) => setKeywordNotes(prev => ({
                        ...prev,
                        [selectedKeyword]: e.target.value
                      }))}
                      className="min-h-[150px] resize-none border-[#E8E6E1] focus:border-[#1C1C1E] focus:ring-[#1C1C1E] rounded-xl bg-[#FAFAF8]"
                    />
                    <p className="text-xs text-[#8E8E93] flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Auto-saved
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#8E8E93] text-sm">
                      Select a keyword to start taking notes
                    </p>
                  </div>
                )}
              </div>

              {/* Section Navigation (Compact) */}
              <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8] shadow-sm">
                <h4 className="text-sm font-bold text-[#1C1C1E] mb-3">Sections</h4>
                <div className="space-y-1">
                  {content.sections.map((sec, index) => {
                    const isLocked = content.sections.slice(0, index).some(s => !s.completed);
                    return (
                      <button
                        key={sec.id}
                        onClick={() => !isLocked && setCurrentSection(index)}
                        disabled={isLocked}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2",
                          currentSection === index
                            ? "bg-[#1C1C1E] text-white"
                            : isLocked
                              ? "text-[#C7C7CC] cursor-not-allowed"
                              : "text-[#3C3C3E] hover:bg-[#F5F4F1]"
                        )}
                      >
                        {sec.completed ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        ) : isLocked ? (
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <div className={cn(
                            "w-3.5 h-3.5 rounded-full border-2 shrink-0",
                            currentSection === index ? "border-white" : "border-[#C7C7CC]"
                          )} />
                        )}
                        <span className="truncate">{sec.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyContent;
