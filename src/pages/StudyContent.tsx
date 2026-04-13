import { useState, useRef, useEffect, useMemo } from "react";
import authService from "@/services/auth.service";
import studyService from "@/services/study.service";
import { toast } from "sonner";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  Play,
  Clock,
  Hash,
  X,
  Book,
  PenTool,
  History as HistoryIcon,
  Sparkles,
  Save,
  Edit3,
  Trash2,
  BarChart2,
  Calendar,
  Layers,
  Loader2,
  Pin,
  MousePointer2,
  ArrowRight
} from "lucide-react";
import { cn, getErrorMessage, getMediaUrl } from "@/lib/utils";
import { DailyQuizModal, QUIZ_QUESTIONS } from "@/components/dashboard/DailyQuizModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import scoreHigh from "@/assets/results/trophy-hero.png";
import scoreMedium from "@/assets/results/score-medium.png";
import scoreLow from "@/assets/results/score-low.png";

// Types from StudyInterface
type Mode = "reading" | "study" | "revision";
type BackgroundPreset = "light" | "warm" | "dark";

interface PYQ {
  id: string;
  examName: string;
  year: number;
  question: string;
  answer: string;
}

interface ContentSection {
  id: string;
  title: string;
  type?: string;
  content_blocks?: {
    block_id: string;
    type: string;
    sub_heading?: string;
    keywords: string[];
    text: string;
    image?: string | null;
    pyqs: any[];
  }[];
  paragraphs?: string[];
  keywords?: string[];
  importantParagraphIndices?: number[];
  pyqData?: any;
  mindmap_structure?: any;
}

// Content sections for Tamil Nadu History provided by the USER
const contentSections: ContentSection[] = [];

// Textbook-style infographic components
const ThreeKingdomsInfographic = ({ isDark }: { isDark: boolean }) => {
  const strokeColor = isDark ? '#9ca3af' : '#6b7280';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const accentColor = isDark ? '#60a5fa' : '#3b82f6';

  return (
    <div className="my-8 flex justify-center">
      <svg width="520" height="160" viewBox="0 0 520 160" className="max-w-full">
        <text x="260" y="20" textAnchor="middle" fill={textColor} fontSize="13" fontWeight="500">
          Three Great Tamil Kingdoms
        </text>
        <g>
          <rect x="20" y="45" width="140" height="90" rx="4" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="90" y="65" textAnchor="middle" fill={accentColor} fontSize="12" fontWeight="600">CHERA</text>
          <text x="90" y="82" textAnchor="middle" fill={textColor} fontSize="10">Kerala & West TN</text>
          <line x1="30" y1="90" x2="150" y2="90" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2,2" />
          <text x="90" y="105" textAnchor="middle" fill={textColor} fontSize="9">Trade Routes</text>
          <text x="90" y="118" textAnchor="middle" fill={textColor} fontSize="9">Maritime Commerce</text>
        </g>
        <g>
          <rect x="190" y="45" width="140" height="90" rx="4" fill="none" stroke={accentColor} strokeWidth="2" />
          <text x="260" y="65" textAnchor="middle" fill={accentColor} fontSize="12" fontWeight="600">CHOLA</text>
          <text x="260" y="82" textAnchor="middle" fill={textColor} fontSize="10">Kaveri Delta</text>
          <line x1="200" y1="90" x2="320" y2="90" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2,2" />
          <text x="260" y="105" textAnchor="middle" fill={textColor} fontSize="9">Most Powerful</text>
          <text x="260" y="118" textAnchor="middle" fill={textColor} fontSize="9">Longest Dynasty</text>
        </g>
        <g>
          <rect x="360" y="45" width="140" height="90" rx="4" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="430" y="65" textAnchor="middle" fill={accentColor} fontSize="12" fontWeight="600">PANDYA</text>
          <text x="430" y="82" textAnchor="middle" fill={textColor} fontSize="10">Madurai Region</text>
          <line x1="370" y1="90" x2="490" y2="90" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2,2" />
          <text x="430" y="105" textAnchor="middle" fill={textColor} fontSize="9">Tamil Literature</text>
          <text x="430" y="118" textAnchor="middle" fill={textColor} fontSize="9">Learning Center</text>
        </g>
        <line x1="40" y1="150" x2="480" y2="150" stroke={strokeColor} strokeWidth="1" markerEnd="url(#arrowhead)" />
        <text x="260" y="145" textAnchor="middle" fill={textColor} fontSize="9" opacity="0.7">Ancient South India</text>
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={strokeColor} />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

const SangamTimelineInfographic = ({ isDark }: { isDark: boolean }) => {
  const strokeColor = isDark ? '#9ca3af' : '#6b7280';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const accentColor = isDark ? '#a78bfa' : '#8b5cf6';

  return (
    <div className="my-8 flex justify-center">
      <svg width="500" height="140" viewBox="0 0 500 140" className="max-w-full">
        <text x="250" y="20" textAnchor="middle" fill={textColor} fontSize="13" fontWeight="500">
          Sangam Period Timeline
        </text>
        <line x1="50" y1="70" x2="450" y2="70" stroke={strokeColor} strokeWidth="2" />
        <circle cx="50" cy="70" r="4" fill={accentColor} />
        <circle cx="450" cy="70" r="4" fill={accentColor} />
        <line x1="50" y1="70" x2="50" y2="50" stroke={accentColor} strokeWidth="1.5" />
        <text x="50" y="45" textAnchor="middle" fill={accentColor} fontSize="11" fontWeight="600">300 BCE</text>
        <line x1="250" y1="70" x2="250" y2="90" stroke={strokeColor} strokeWidth="1" />
        <circle cx="250" cy="70" r="3" fill={accentColor} />
        <text x="250" y="105" textAnchor="middle" fill={textColor} fontSize="10">Golden Age</text>
        <text x="250" y="118" textAnchor="middle" fill={textColor} fontSize="9">2,000+ Poems</text>
        <line x1="450" y1="70" x2="450" y2="50" stroke={accentColor} strokeWidth="1.5" />
        <text x="450" y="45" textAnchor="middle" fill={accentColor} fontSize="11" fontWeight="600">300 CE</text>
        <text x="250" y="135" textAnchor="middle" fill={textColor} fontSize="10" opacity="0.8">
          ~600 years of Tamil Literary Tradition
        </text>
      </svg>
    </div>
  );
};

const AdministrationHierarchyInfographic = ({ isDark }: { isDark: boolean }) => {
  const strokeColor = isDark ? '#9ca3af' : '#6b7280';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const accentColor = isDark ? '#34d399' : '#10b981';

  return (
    <div className="my-8 flex justify-center">
      <svg width="400" height="200" viewBox="0 0 400 200" className="max-w-full">
        <text x="200" y="20" textAnchor="middle" fill={textColor} fontSize="13" fontWeight="500">
          Administrative Hierarchy
        </text>
        <rect x="140" y="40" width="120" height="32" rx="3" fill="none" stroke={accentColor} strokeWidth="2" />
        <text x="200" y="60" textAnchor="middle" fill={textColor} fontSize="11" fontWeight="600">Kingdom</text>
        <line x1="200" y1="72" x2="200" y2="90" stroke={strokeColor} strokeWidth="1.5" markerEnd="url(#arrow1)" />
        <g>
          <rect x="60" y="95" width="100" height="30" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="110" y="113" textAnchor="middle" fill={textColor} fontSize="10">Nadus</text>
          <rect x="240" y="95" width="100" height="30" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="290" y="113" textAnchor="middle" fill={textColor} fontSize="10">Kurrams</text>
          <line x1="200" y1="90" x2="110" y2="95" stroke={strokeColor} strokeWidth="1" />
          <line x1="200" y1="90" x2="290" y2="95" stroke={strokeColor} strokeWidth="1" />
        </g>
        <line x1="110" y1="125" x2="110" y2="145" stroke={strokeColor} strokeWidth="1.5" markerEnd="url(#arrow2)" />
        <line x1="290" y1="125" x2="290" y2="145" stroke={strokeColor} strokeWidth="1.5" markerEnd="url(#arrow2)" />
        <g>
          <rect x="20" y="150" width="75" height="28" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="57.5" y="167" textAnchor="middle" fill={textColor} fontSize="9">Sabhas</text>
          <rect x="115" y="150" width="75" height="28" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="152.5" y="167" textAnchor="middle" fill={textColor} fontSize="9">Urs</text>
          <rect x="210" y="150" width="75" height="28" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="247.5" y="167" textAnchor="middle" fill={textColor} fontSize="9">Local</text>
          <rect x="305" y="150" width="75" height="28" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="342.5" y="167" textAnchor="middle" fill={textColor} fontSize="9">Assemblies</text>
        </g>
        <text x="200" y="193" textAnchor="middle" fill={textColor} fontSize="8" opacity="0.7">
          Decentralized system ensuring local autonomy
        </text>
        <defs>
          <marker id="arrow1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill={strokeColor} />
          </marker>
          <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill={strokeColor} />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

const TradeNetworkInfographic = ({ isDark }: { isDark: boolean }) => {
  const strokeColor = isDark ? '#9ca3af' : '#6b7280';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const accentColor = isDark ? '#f59e0b' : '#d97706';

  return (
    <div className="my-8 flex justify-center">
      <svg width="520" height="180" viewBox="0 0 520 180" className="max-w-full">
        <text x="260" y="20" textAnchor="middle" fill={textColor} fontSize="13" fontWeight="500">
          Maritime Trade Network
        </text>
        <ellipse cx="260" cy="90" rx="80" ry="45" fill="none" stroke={accentColor} strokeWidth="2" />
        <text x="260" y="85" textAnchor="middle" fill={accentColor} fontSize="11" fontWeight="600">Tamil Ports</text>
        <text x="260" y="98" textAnchor="middle" fill={textColor} fontSize="9">Kaveripattinam</text>
        <text x="260" y="110" textAnchor="middle" fill={textColor} fontSize="9">Korkai • Muziris</text>
        <g>
          <rect x="20" y="30" width="100" height="50" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="70" y="50" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">Roman Empire</text>
          <text x="70" y="65" textAnchor="middle" fill={textColor} fontSize="8">Gold, Wine</text>
          <text x="70" y="76" textAnchor="middle" fill={textColor} fontSize="8">Luxury Goods</text>
        </g>
        <line x1="120" y1="55" x2="185" y2="75" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#trade-arrow)" />
        <line x1="185" y1="85" x2="120" y2="65" stroke={accentColor} strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#export-arrow)" />
        <g>
          <rect x="400" y="30" width="100" height="50" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="450" y="50" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">Southeast Asia</text>
          <text x="450" y="65" textAnchor="middle" fill={textColor} fontSize="8">Trade</text>
          <text x="450" y="76" textAnchor="middle" fill={textColor} fontSize="8">Commerce</text>
        </g>
        <line x1="335" y1="75" x2="400" y2="55" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#trade-arrow)" />
        <line x1="400" y1="65" x2="335" y2="85" stroke={accentColor} strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#export-arrow)" />
        <g>
          <rect x="400" y="120" width="100" height="40" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="450" y="140" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">China</text>
          <text x="450" y="153" textAnchor="middle" fill={textColor} fontSize="8">Silk Trade</text>
        </g>
        <line x1="335" y1="105" x2="400" y2="135" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#trade-arrow)" />
        <g>
          <rect x="20" y="130" width="150" height="35" rx="2" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.3" />
          <text x="95" y="144" textAnchor="middle" fill={accentColor} fontSize="9" fontWeight="600">Tamil Exports:</text>
          <text x="95" y="158" textAnchor="middle" fill={textColor} fontSize="8">Spices • Pearls • Textiles</text>
        </g>
        <defs>
          <marker id="trade-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={strokeColor} />
          </marker>
          <marker id="export-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={accentColor} />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

const TempleArchitectureInfographic = ({ isDark }: { isDark: boolean }) => {
  const strokeColor = isDark ? '#9ca3af' : '#6b7280';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const accentColor = isDark ? '#ec4899' : '#db2777';

  return (
    <div className="my-8 flex justify-center">
      <svg width="450" height="200" viewBox="0 0 450 200" className="max-w-full">
        <text x="225" y="20" textAnchor="middle" fill={textColor} fontSize="13" fontWeight="500">
          Dravidian Temple Architecture Elements
        </text>
        <g>
          <polygon points="120,50 140,180 100,180" fill="none" stroke={accentColor} strokeWidth="2" />
          <line x1="105" y1="160" x2="135" y2="160" stroke={strokeColor} strokeWidth="1" />
          <line x1="108" y1="140" x2="132" y2="140" stroke={strokeColor} strokeWidth="1" />
          <line x1="110" y1="120" x2="130" y2="120" stroke={strokeColor} strokeWidth="1" />
          <line x1="112" y1="100" x2="128" y2="100" stroke={strokeColor} strokeWidth="1" />
          <line x1="114" y1="80" x2="126" y2="80" stroke={strokeColor} strokeWidth="1" />
          <text x="120" y="195" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">Gopuram</text>
        </g>
        <g>
          <rect x="210" y="120" width="100" height="60" rx="2" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="230" y1="120" x2="230" y2="180" stroke={strokeColor} strokeWidth="2" />
          <line x1="250" y1="120" x2="250" y2="180" stroke={strokeColor} strokeWidth="2" />
          <line x1="270" y1="120" x2="270" y2="180" stroke={strokeColor} strokeWidth="2" />
          <line x1="290" y1="120" x2="290" y2="180" stroke={strokeColor} strokeWidth="2" />
          <text x="260" y="195" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">Pillared Hall</text>
        </g>
        <g>
          <rect x="360" y="90" width="50" height="50" rx="2" fill="none" stroke={accentColor} strokeWidth="2" />
          <polygon points="385,60 405,90 365,90" fill="none" stroke={accentColor} strokeWidth="2" />
          <rect x="375" y="140" width="20" height="40" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="385" y="195" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">Vimana</text>
        </g>
        <g>
          <text x="30" y="50" fill={accentColor} fontSize="10" fontWeight="600">Key Examples:</text>
          <text x="30" y="67" fill={textColor} fontSize="9">• Thanjavur</text>
          <text x="30" y="82" fill={textColor} fontSize="9">• Gangaikondacholapuram</text>
          <text x="30" y="97" fill={textColor} fontSize="9">• Darasuram</text>
        </g>
        <rect x="180" y="35" width="160" height="22" rx="2" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.3" />
        <text x="260" y="49" textAnchor="middle" fill={textColor} fontSize="9">Reached zenith under Chola Dynasty</text>
      </svg>
    </div>
  );
};

const BulbIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className="flex-shrink-0"
    style={{
      animation: isActive ? 'bulbShake 0.5s ease-in-out' : 'none'
    }}
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

const MindMapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2" fill="currentColor" />
    <circle cx="3" cy="3" r="1.5" fill="currentColor" />
    <circle cx="13" cy="3" r="1.5" fill="currentColor" />
    <circle cx="3" cy="13" r="1.5" fill="currentColor" />
    <circle cx="13" cy="13" r="1.5" fill="currentColor" />
    <line x1="8" y1="6" x2="4" y2="4" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="6" x2="12" y2="4" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="10" x2="4" y2="12" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="10" x2="12" y2="12" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const StudyContent = () => {
  const { topicId, subtopicId } = useParams();
  const [searchParams] = useSearchParams();
  const urlPlanId = searchParams.get('plan_id');
  const urlPlanRowId = searchParams.get('plan_row_id');
  const navigate = useNavigate();

  const [sections, setSections] = useState<ContentSection[]>(contentSections);
  const [mode, setMode] = useState<Mode>("reading");
  const [backgroundPreset, setBackgroundPreset] = useState<BackgroundPreset>("light");
  const [showTopBar, setShowTopBar] = useState(false);
  const [headerMode, setHeaderMode] = useState<"hover" | "fixed">("fixed");
  const [openPyqAccordion, setOpenPyqAccordion] = useState<string | null>(null); // Format: "sectionId-paragraphIndex"
  const [openAnswers, setOpenAnswers] = useState<Set<string>>(new Set());
  const [visibleKeywords, setVisibleKeywords] = useState<string[]>([]);

  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  const [isAssessmentFinished, setIsAssessmentFinished] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [keywordNotes, setKeywordNotes] = useState<Record<string, string>>({});
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [focusedNoteKeyword, setFocusedNoteKeyword] = useState<string | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNoteText, setTempNoteText] = useState("");
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [assessmentStartTime, setAssessmentStartTime] = useState<string | null>(null);
  const [viewHistoryAnswers, setViewHistoryAnswers] = useState<(number | null)[] | undefined>(undefined);
  const [viewHistoryTimeTaken, setViewHistoryTimeTaken] = useState<number | undefined>(undefined);
  const [isAssessmentSubmitted, setIsAssessmentSubmitted] = useState(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [showResultsOnly, setShowResultsOnly] = useState(false);
  const [resultsQuestions, setResultsQuestions] = useState<any[] | undefined>(undefined);

  // New state for reading time calculation
  const [activeReadingSessionId, setActiveReadingSessionId] = useState<number | null>(null);
  const [elapsedReadingSeconds, setElapsedReadingSeconds] = useState(0);
  const [isMindMapLoading, setIsMindMapLoading] = useState(false);

  const readingPanelRef = useRef<HTMLDivElement>(null);
  const notesPanelRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const { user, currentContext, currentContextId } = useAuth();

  // Derive the active study context. If current is not a study plan, fallback to first available study plan.
  const studyContext = useMemo(() => {
    if (currentContext?.plan_type === 'OVERALL' || currentContext?.plan_type === 'SUBJECT') {
      return currentContext;
    }
    return user?.dashboard?.contexts?.find(c => c.plan_type === 'OVERALL' || c.plan_type === 'SUBJECT');
  }, [currentContext, user?.dashboard?.contexts]);

  const { data: allNotes = [] } = useQuery({
    queryKey: ['user-notes', user?.id],
    queryFn: () => studyService.getUserNotes(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const [topicAssessment, setTopicAssessment] = useState<any>(null);
  const [topicData, setTopicData] = useState<any>(null);

  const parsedSubtopicId = parseInt(subtopicId || "");

  // Resolve the subscription plan ID first to use in query
  const currentSubscriptionPlanId = urlPlanId ? parseInt(urlPlanId) : studyContext?.plan_id;
  const currentPlanRowId = urlPlanRowId ? parseInt(urlPlanRowId) : undefined;

  // Get topic data response next
  const { data: topicDataResponse, isLoading: isTopicLoading } = useQuery({
    queryKey: ['topic-content', parsedSubtopicId, user?.id, currentSubscriptionPlanId, currentPlanRowId],
    queryFn: () => studyService.getTopicContentBySyllabusId(parsedSubtopicId, user!.id, currentSubscriptionPlanId, currentPlanRowId),
    enabled: !!user?.id && !isNaN(parsedSubtopicId),
    staleTime: 5 * 60 * 1000,
  });

  const isTopicCompleted = topicDataResponse?.task?.status === 'COMPLETED';

  const { data: assessmentHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['assessment-history', user?.id, parsedSubtopicId, currentSubscriptionPlanId, currentPlanRowId],
    queryFn: () => studyService.getAssessmentHistory(user!.id, parsedSubtopicId, currentSubscriptionPlanId, currentPlanRowId),
    enabled: !!user?.id && !isNaN(parsedSubtopicId) && !isTopicLoading,
    staleTime: 5 * 60 * 1000,
  });

  const { data: timingHistory = [] } = useQuery({
    queryKey: ['topic-timings', user?.id, parsedSubtopicId, currentSubscriptionPlanId, currentPlanRowId],
    queryFn: () => studyService.getUserTopicTimings(parsedSubtopicId, currentSubscriptionPlanId, currentPlanRowId),
    enabled: !!user?.id && !isNaN(parsedSubtopicId),
    staleTime: 5 * 60 * 1000,
  });

  const isNoteDirty = (keyword: string, currentContent: string) => {
    if (!subtopicId || isNaN(parseInt(subtopicId))) return false;
    const existing = allNotes.find(
      n => n.topic_id === parseInt(subtopicId) && n.title === keyword
    );
    if (!existing) return currentContent.trim() !== "";
    return existing.content !== currentContent;
  };

  // Initialize assessment status from history
  useEffect(() => {
    if (assessmentHistory?.attempts?.length > 0) {
      setIsAssessmentFinished(true);
    }
  }, [assessmentHistory]);

  useEffect(() => {
    if (!subtopicId || isNaN(parsedSubtopicId)) {
      // Map mock content for safety
      const mappedMock = contentSections.map(s => ({
        ...s,
        type: 'reading',
        content_blocks: s.paragraphs.map((p, i) => ({
          block_id: `${s.id}-b${i}`,
          type: 'paragraph',
          text: p,
          keywords: s.keywords,
          pyqs: []
        }))
      }));
      setSections(mappedMock as any);
      setVisibleKeywords(mappedMock[0].keywords);
      return;
    }

    if (topicDataResponse && topicDataResponse.task) {
      setTopicData(topicDataResponse);
      const learningContent = topicDataResponse.task.learning_content;
      const mappedSections: ContentSection[] = learningContent.sections.map((s: any) => ({
        id: s.section_id,
        title: s.title,
        type: s.type,
        content_blocks: s.content_blocks,
        mindmap_structure: s.mindmap_structure
      }));

      setSections(mappedSections);
      setVisibleKeywords(mappedSections[0]?.content_blocks?.[0]?.keywords || []);

      // Store assessment if needed
      const assessmentSource = topicDataResponse.task?.assessment || topicDataResponse.task?.learning_content?.assessment;

      if (assessmentSource && assessmentSource.questions && assessmentSource.questions.length > 0) {
        const mappedQuestions = assessmentSource.questions.map((q: any, idx: number) => ({
          id: q.mcq_id || q.id || `q-${idx}`,
          mcq_id: q.mcq_id || (typeof q.id === 'number' ? q.id : (String(q.id).match(/\d+/) ? parseInt(String(q.id).match(/\d+/)![0]) : idx + 1)),
          question: q.question,
          subject: topicDataResponse.task.subject || "General Science",
          difficulty: q.difficulty || "Medium",
          options: Array.isArray(q.options) ? q.options : [q.options?.A || "", q.options?.B || "", q.options?.C || "", q.options?.D || ""],
          correct_answer_index: q.correct_answer_index !== undefined ? q.correct_answer_index : q.correctAnswer,
          explanation: q.explanation
        }));
        const finalAssessment = {
          ...assessmentSource,
          questions: mappedQuestions
        };
        setTopicAssessment(finalAssessment);
      } else {
        setTopicAssessment(null);
      }
    }
  }, [topicDataResponse, subtopicId]);

  // Synchronize notes when allNotes or subtopicId changes
  useEffect(() => {
    if (allNotes && subtopicId) {
      const topicNotes = allNotes.filter(n => n.topic_id === parseInt(subtopicId));
      const notesMap: Record<string, string> = {};
      topicNotes.forEach(n => {
        notesMap[n.title] = n.content;
      });
      setKeywordNotes(notesMap);
    }
  }, [allNotes, subtopicId]);

  // Handle topic timing
  useEffect(() => {
    let isActive = true;
    let started = false;

    if (!user?.id || isNaN(parsedSubtopicId) || isLoadingHistory || isTopicLoading) return;
    if (assessmentHistory?.attempts?.length > 0 || isTopicCompleted) return;

    const startTiming = async () => {
      try {
        const timing = await studyService.startTopicTiming(parsedSubtopicId, currentSubscriptionPlanId, currentPlanRowId);
        if (isActive) {
          setActiveReadingSessionId(timing.id);
          started = true;
        }
      } catch (err: any) {
        if (err.response?.status !== 400) {
          console.error("Failed to start topic timing", err);
        }
      }
    };
    startTiming();

    return () => {
      isActive = false;
      if (started && !isNaN(parsedSubtopicId)) {
        studyService.stopTopicTiming(parsedSubtopicId, currentSubscriptionPlanId, currentPlanRowId).catch((e: any) => {
          // Silently ignore 404 (no active session) — not a blocking error
          if (e?.response?.status !== 404) {
            console.error("Failed to stop topic timing on unmount", e);
          }
        });
        queryClient.invalidateQueries({ queryKey: ['topic-timings'] });
      }
    };
  }, [user?.id, parsedSubtopicId, assessmentHistory, isLoadingHistory, isTopicLoading, isTopicCompleted]);

  // When keyword changes, reset editing state
  useEffect(() => {
    if (selectedKeyword) {
      setTempNoteText(keywordNotes[selectedKeyword] || "");
      setIsEditingNote(!keywordNotes[selectedKeyword]);
    }
  }, [selectedKeyword, keywordNotes]);

  // Track real-time elapsed reading time
  useEffect(() => {
    let readingTimer: NodeJS.Timeout;
    if (activeReadingSessionId) {
      // Find the active session start time if available
      const activeTiming = timingHistory.find(t => t.id === activeReadingSessionId);
      if (activeTiming && activeTiming.start_time) {
        // Append Z to enforce UTC parsing if backend gives naive UTC time
        const startTimeStr = activeTiming.start_time.endsWith('Z') ? activeTiming.start_time : `${activeTiming.start_time}Z`;
        const elapsed = Math.max(0, Math.floor((new Date().getTime() - new Date(startTimeStr).getTime()) / 1000));
        setElapsedReadingSeconds(elapsed);
      }

      readingTimer = setInterval(() => {
        setElapsedReadingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedReadingSeconds(0);
    }
    return () => clearInterval(readingTimer);
  }, [activeReadingSessionId, timingHistory]);

  // Scroll Persistence Logic
  useEffect(() => {
    if (!sections.length || !readingPanelRef.current || !user?.id || !subtopicId) return;

    const planIdStr = currentSubscriptionPlanId ? `plan_${currentSubscriptionPlanId}` : "global";
    const rowIdStr = currentPlanRowId ? `row_${currentPlanRowId}` : "norow";
    const offsetKey = `read_offset_${subtopicId}_${planIdStr}_${rowIdStr}_${user.id}`;
    const percentKey = `read_percent_${subtopicId}_${planIdStr}_${rowIdStr}_${user.id}`;

    const savedOffset = localStorage.getItem(offsetKey);
    const savedPercent = localStorage.getItem(percentKey);

    if (savedOffset || savedPercent) {
      // Small delay to ensure content is rendered before scrolling
      setTimeout(() => {
        if (readingPanelRef.current) {
          if (savedOffset) {
            readingPanelRef.current.scrollTop = parseFloat(savedOffset);
          } else if (savedPercent) {
            const percent = parseFloat(savedPercent);
            const maxScroll = readingPanelRef.current.scrollHeight - readingPanelRef.current.clientHeight;
            readingPanelRef.current.scrollTop = (percent / 100) * maxScroll;
          }
        }
      }, 150);
    }
  }, [sections, subtopicId, user?.id]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!user?.id || !subtopicId) return;
    const container = e.currentTarget;
    const planIdStr = currentSubscriptionPlanId ? `plan_${currentSubscriptionPlanId}` : "global";
    const rowIdStr = currentPlanRowId ? `row_${currentPlanRowId}` : "norow";
    const offsetKey = `read_offset_${subtopicId}_${planIdStr}_${rowIdStr}_${user.id}`;
    const percentKey = `read_percent_${subtopicId}_${planIdStr}_${rowIdStr}_${user.id}`;

    const maxScroll = container.scrollHeight - container.clientHeight;
    const percent = maxScroll > 0 ? (container.scrollTop / maxScroll) * 100 : 0;

    localStorage.setItem(offsetKey, container.scrollTop.toString());
    localStorage.setItem(percentKey, percent.toFixed(2));
  };

  useEffect(() => {
    if (isAssessmentStarted && !isAssessmentFinished && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isAssessmentStarted, isAssessmentFinished, timeLeft]);

  // Handle scroll to update visible keywords
  useEffect(() => {
    if (sections.length === 0 || !readingPanelRef.current) return;

    const observerOption = {
      root: readingPanelRef.current,
      rootMargin: '-5% 0% -60% 0%',
      threshold: [0, 0.5]
    };

    const observer = new IntersectionObserver((entries) => {
      // Find the entries that are intersecting and sort by top position
      const intersecting = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (intersecting.length > 0) {
        const targetId = intersecting[0].target.id;

        if (targetId.startsWith('section-')) {
          const sectionId = targetId.replace('section-', '');
          const section = sections.find(s => s.id === sectionId);
          if (section) {
            const allKeywords = Array.from(new Set(section.content_blocks?.flatMap(b => b.keywords) || []));
            if (allKeywords.length > 0) {
              setVisibleKeywords(allKeywords);
            }
          }
        }
      }
    }, observerOption);

    sections.forEach(s => {
      const el = document.getElementById(`section-${s.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, mode]);

  const handleTopicMindMapClick = async () => {
    if (!user?.id || !parsedSubtopicId || isNaN(parsedSubtopicId)) return;
    try {
      setIsMindMapLoading(true);
      const res = await studyService.getTopicMindMap(parsedSubtopicId, { content_type_id: 1, language: 'English' });
      if (res && res.mindmap) {
        navigate(`/study-plan/topic/${topicId}/subtopic/${subtopicId}/mindmap`, {
          state: {
            mindmapData: res.mindmap,
            sectionTitle: topicData?.task?.topic || sections[0]?.title || "Study Topic"
          }
        });
      } else {
        // Fallback without dynamic data
        navigate(`/study-plan/topic/${topicId}/subtopic/${subtopicId}/mindmap`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load topic mind map");
    } finally {
      setIsMindMapLoading(false);
    }
  };
  const handleKeywordClick = (kw: string) => {
    setSelectedKeyword(kw);
    if (keywordNotes[kw] === undefined) {
      setKeywordNotes(prev => ({ ...prev, [kw]: "" }));
    }

    // Find first block that contains this keyword and scroll to it
    for (const section of sections) {
      const blockWithKeyword = section.content_blocks?.find(b => b.keywords.includes(kw));
      if (blockWithKeyword) {
        const el = document.getElementById(`block-${blockWithKeyword.block_id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      }
    }

    // Scroll notes panel to top so the active note is visible first
    if (notesPanelRef.current) {
      notesPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getBackgroundStyle = () => {
    switch (backgroundPreset) {
      case "light": return "bg-[#fdfcfa]";
      case "warm": return "bg-[#fef9f3]";
      case "dark": return "bg-[#1a1a1a]";
      default: return "bg-[#fdfcfa]";
    }
  };

  const getTextColor = () => {
    return backgroundPreset === 'dark' ? 'text-[#e5e5e5]' : 'text-[#1a1a1a]';
  };

  const handlePyqToggle = (sectionId: string, paragraphIndex: number) => {
    const key = `${sectionId}-${paragraphIndex}`;
    setOpenPyqAccordion(openPyqAccordion === key ? null : key);
  };

  const handleAnswerToggle = (pyqId: string) => {
    const newHistory = new Set(openAnswers);
    if (newHistory.has(pyqId)) newHistory.delete(pyqId);
    else newHistory.add(pyqId);
    setOpenAnswers(newHistory);
  };

  const startAssessment = async () => {
    if (!user?.id || !parsedSubtopicId || isNaN(parsedSubtopicId)) return;

    try {
      const response = await studyService.startMCQAttempt({
        syllabus_id: parsedSubtopicId,
        difficulty: "easy",
        plan_id: currentSubscriptionPlanId,
        plan_row_id: currentPlanRowId
      });

      if (response && response.questions) {
        const mappedQuestions = response.questions.map((q: any) => ({
          id: q.mcq_id,
          mcq_id: q.mcq_id,
          question: q.question,
          subject: topicData?.task?.subject || "General Science",
          difficulty: response.difficulty || "easy",
          options: Array.isArray(q.options) ? q.options : [q.options?.A, q.options?.B, q.options?.C, q.options?.D],
          correct_answer_index: q.correct_answer_index,
          explanation: q.explanation,
          is_correct: q.is_correct
        }));

        setTopicAssessment({
          total_questions: response.total_questions,
          questions: mappedQuestions
        });
      }

      setIsAssessmentStarted(true);
      setIsAssessmentFinished(false);
      setTimeLeft(600);
      setAssessmentStartTime(new Date().toISOString());
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error("You have reached your maximum attempts for today.");
      } else {
        toast.error("Failed to start assessment");
      }
      console.error(err);
    }
  };

  const handleViewAttempt = async (attemptId: number) => {
    try {
      const result = await studyService.getMCQResult(parsedSubtopicId, currentSubscriptionPlanId, currentPlanRowId, attemptId);
      if (result) {
        const letterToIdx: Record<string, number> = { "A": 0, "B": 1, "C": 2, "D": 3 };

        // Map questions for display
        const mappedQuestions = result.questions.map((q: any) => ({
          id: q.mcq_id,
          mcq_id: q.mcq_id,
          question: q.question,
          options: [q.options?.A || "", q.options?.B || "", q.options?.C || "", q.options?.D || ""],
          correct_answer_index: q.correct_answer_index,
          explanation: q.reason || q.explanation || "",
          difficulty: q.difficulty || result.difficulty
        }));

        const userAns = result.questions.map((q: any) => letterToIdx[q.selected_option] ?? null);

        setResultsQuestions(mappedQuestions);
        setViewHistoryAnswers(userAns);
        setViewHistoryTimeTaken(result.time_taken_seconds || 0);
        setQuizScore(result.correct_answers);
        setIsAssessmentSubmitted(true);
        setShowResultsOnly(true);
        setIsAssessmentStarted(true);
      }
    } catch (err) {
      toast.error("Failed to load attempt details");
      console.error(err);
    }
  };

  const handleAssessmentComplete = async (results: { answers: (number | null)[], questions: any[] }) => {
    if (!user?.id || !subtopicId || isNaN(parsedSubtopicId) || !assessmentStartTime) return;

    setIsSubmittingAssessment(true);

    try {
      // Map frontend answers to backend format
      const answerMap = ["A", "B", "C", "D"];
      const answers = results.answers.map((ansIndex, idx) => {
        const question = results.questions[idx];
        // Safely extract numeric ID from strings like "q52" or use existing mcq_id
        let mcq_id = Number(question.mcq_id);
        if (isNaN(mcq_id) && question.id) {
          const numericMatch = String(question.id).match(/\d+/);
          mcq_id = numericMatch ? parseInt(numericMatch[0]) : 0;
        }

        return {
          mcq_id: mcq_id || 0,
          selected_option: ansIndex !== null ? answerMap[ansIndex] : "A" // fallback to A if skipped
        };
      }).filter(a => a.mcq_id !== undefined); // Send all even if id is 0 if it's dynamic content

      const nextAttemptNo = (assessmentHistory?.total_attempts || 0) + 1;

      const response = await studyService.submitMCQAttempt({
        syllabus_id: parsedSubtopicId,
        difficulty: results.questions[0]?.difficulty?.toLowerCase() || "easy",
        answers: answers,
        started_at: assessmentStartTime,
        submitted_at: new Date().toISOString(),
        plan_id: currentSubscriptionPlanId,
        plan_row_id: currentPlanRowId
      });

      // Map backend results back to frontend format
      const letterToIdx: Record<string, number> = { "A": 0, "B": 1, "C": 2, "D": 3 };

      const ans = response.results.map((r: any) => letterToIdx[r.selected_option] ?? null);
      const ques = response.results.map((r: any, idx: number) => {
        const originalQ = results.questions[idx] || {};
        return {
          id: r.mcq_id || originalQ.id,
          mcq_id: r.mcq_id || originalQ.mcq_id,
          question: r.question || originalQ.question,
          subject: originalQ.subject || "General Science",
          difficulty: originalQ.difficulty || "Medium",
          options: Array.isArray(r.options) ? r.options : [r.options?.A || "", r.options?.B || "", r.options?.C || "", r.options?.D || ""],
          correct_answer_index: r.correct_answer_index !== undefined ? r.correct_answer_index : originalQ.correct_answer_index,
          explanation: r.explanation || originalQ.explanation,
          is_correct: r.is_correct
        };
      });

      setQuizScore(response.correct_answers);
      setViewHistoryAnswers(ans);
      setResultsQuestions(ques);
      setViewHistoryTimeTaken(response.time_taken_seconds || (600 - timeLeft));

      setIsAssessmentFinished(true);
      setIsAssessmentSubmitted(true);
      setIsSubmittingAssessment(false);

      toast.success("Assessment submitted successfully!");

      // Stop the reading/study session timing since the topic is now fully completed (including MCQ)
      try {
        await studyService.stopTopicTiming(parsedSubtopicId, currentSubscriptionPlanId, currentPlanRowId);
        setActiveReadingSessionId(null);
      } catch (e: any) {
        // 404 means no active session was found (e.g. already stopped or never started) — not a blocking error
        const status = e?.response?.status;
        if (status !== 404) {
          console.error("Failed to stop topic timing properly", e);
        }
        setActiveReadingSessionId(null);
      }

      // Update study plan status to COMPLETED
      // Prefer urlPlanRowId (set by roadmap navigation) — it is always the canonical row.
      // Fall back to topicDataResponse?.task?.plan_row_id only when URL param is absent.
      const planToUpdateId = (urlPlanRowId ? parseInt(urlPlanRowId) : null) || topicDataResponse?.task?.plan_row_id;
      if (planToUpdateId) {
        try {
          await studyService.updateStudyPlan(planToUpdateId, {
            plan_id: currentSubscriptionPlanId || undefined,
            syllabus_id: parsedSubtopicId,
            plan_status: 'COMPLETED',
            is_completed: true
          });
        } catch (e) {
          console.error("Failed to update study plan status", e);
        }
      }

      // Invalidate queries to refresh progress and history
      queryClient.invalidateQueries({ queryKey: ['topic-timings', user.id] });
      queryClient.invalidateQueries({ queryKey: ['topic-timings', user.id, currentSubscriptionPlanId] });
      queryClient.invalidateQueries({ queryKey: ['study-plans', user.id] });
      queryClient.invalidateQueries({ queryKey: ['roadmap', user.id] });
      queryClient.invalidateQueries({ queryKey: ['roadmap', user.id, currentSubscriptionPlanId] });
      queryClient.invalidateQueries({ queryKey: ['topic-content', parsedSubtopicId, user.id] });
      queryClient.invalidateQueries({ queryKey: ['assessment-history', user.id, parsedSubtopicId] });

    } catch (error) {
      setIsSubmittingAssessment(false);
      console.error("Failed to submit assessment:", error);
      toast.error("Failed to save assessment progress.");
    }
  };

  const isInQuizMode = isAssessmentStarted && !isAssessmentFinished;

  const handleDeleteNote = async (keyword: string) => {
    // Remove from local state immediately (optimistic)
    setKeywordNotes(prev => {
      const next = { ...prev };
      delete next[keyword];
      return next;
    });
    if (selectedKeyword === keyword) setSelectedKeyword(null);

    // Delete from backend
    if (subtopicId && !isNaN(parseInt(subtopicId)) && user) {
      const existing = allNotes.find(
        n => n.topic_id === parseInt(subtopicId) && n.title === keyword
      );
      if (existing?.id) {
        try {
          await studyService.deleteNote(existing.id);
          queryClient.invalidateQueries({ queryKey: ['user-notes', user.id] });
        } catch (err) {
          console.error('Failed to delete note', err);
          toast.error('Failed to delete note.');
        }
      }
    }
  };

  const handleNoteContentChange = (keyword: string, content: string) => {
    setKeywordNotes(prev => ({ ...prev, [keyword]: content }));
  };

  const handleSaveNote = async (keyword: string, content: string) => {
    // Update local state immediately
    setKeywordNotes(prev => ({ ...prev, [keyword]: content }));

    if (!subtopicId || isNaN(parseInt(subtopicId)) || !user) return;

    try {
      // Check if a note for this topic + keyword already exists
      const existing = allNotes.find(
        n => n.topic_id === parseInt(subtopicId) && n.title === keyword
      );

      if (existing?.id) {
        // UPDATE existing note
        await studyService.updateNote(existing.id, { content });
      } else {
        // CREATE new note
        await studyService.createNote({
          user_id: user.id,
          topic_id: parseInt(subtopicId),
          title: keyword,
          content,
          status: 'private',
        });
      }

      // Refresh notes cache
      queryClient.invalidateQueries({ queryKey: ['user-notes', user.id] });
      toast.success('Note saved!');
    } catch (err: any) {
      console.error('Failed to save note:', err);
      if (err.response) {
        console.error('Server error details:', err.response.data);
      }
      toast.error(getErrorMessage(err, "Failed to save note"));
    }
  };

  const renderReadingContent = () => {
    return (
      <div className="flex flex-col gap-10 py-12 px-8 md:px-16 max-w-[800px] mx-auto">
        {/* Topic Header & Introduction */}
        <div className="space-y-4 relative">
          <div className="flex items-center gap-4">
            <h1 className={cn(
              "font-['Inter:Medium',sans-serif] font-medium leading-[32px] sm:leading-[36px] text-[24px] sm:text-[28px] tracking-[0.0703px]",
              getTextColor()
            )}>
              {topicData?.task?.topic || sections[0]?.title || "Study Topic"}
            </h1>

            <button
              onClick={handleTopicMindMapClick}
              disabled={isMindMapLoading}
              className={cn(
                "flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm border",
                backgroundPreset === 'dark' ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
                isMindMapLoading && "opacity-50 cursor-not-allowed"
              )}
              title="View Topic Mind Map"
            >
              {isMindMapLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MindMapIcon />}
            </button>
          </div>

          {topicData?.task?.short_description && (
            <p className={cn("mt-2 text-[15px] opacity-60 italic max-w-2xl", getTextColor())}>
              {topicData.task.short_description}
            </p>
          )}
        </div>

        {sections.map((section, idx) => (
          <div key={section.id} id={`section-${section.id}`} className="space-y-8 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className={cn(
                "font-['Inter:Medium',sans-serif] font-semibold leading-[26px] sm:leading-[30px] text-[18px] sm:text-[22px] tracking-[-0.4492px]",
                getTextColor()
              )}>
                {section.title}
              </h2>
            </div>

            <div className={cn("space-y-6 text-[16px] leading-[26px] tracking-[-0.3125px] font-['Inter:Regular',sans-serif]", getTextColor())}>
              {section.content_blocks?.map((block, bIdx) => {
                const pyqKey = `${section.id}-${bIdx}`;
                const hasPyqs = block.pyqs && block.pyqs.length > 0;
                const isExpanded = openPyqAccordion === pyqKey;

                return (
                  <div key={block.block_id} id={`block-${block.block_id}`} className="space-y-4">
                    <div className="relative group">
                      {block.sub_heading && (
                        <h4 className="font-semibold mb-2">{block.sub_heading}</h4>
                      )}

                      {block.type === 'paragraph' && (
                        <p className="text-justify inline">
                          {block.text}
                        </p>
                      )}

                      {block.type === 'image' && block.image && (
                        <div className="my-6">
                          <img
                            src={getMediaUrl(block.image)}
                            alt={block.sub_heading || "Topic Image"}
                            className="rounded-2xl border shadow-lg max-w-full h-auto mx-auto"
                            loading="eager"
                            fetchPriority="high"
                          />
                          {block.text && (
                            <p className="text-sm text-center mt-3 opacity-60">{block.text}</p>
                          )}
                        </div>
                      )}

                      {block.type === 'video' && (
                        <div className="my-6 aspect-video bg-gray-100 rounded-2xl flex items-center justify-center border border-dashed border-gray-300">
                          <div className="text-center">
                            <Play className="w-12 h-12 text-accent/40 mx-auto mb-3" />
                            <p className="text-sm font-medium opacity-50">Video content available in full version</p>
                          </div>
                        </div>
                      )}

                      {hasPyqs && (
                        <button
                          onClick={() => handlePyqToggle(section.id, bIdx)}
                          className="inline-block ml-2 align-middle"
                        >
                          <BulbIcon isActive={isExpanded} />
                        </button>
                      )}
                    </div>

                    {isExpanded && hasPyqs && (
                      <div className={cn(
                        "my-4 rounded-xl border p-4 transition-all duration-300",
                        backgroundPreset === 'dark' ? "bg-[#2a2a2a] border-gray-700" : "bg-gray-50 border-gray-200"
                      )}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[16px]">💡</span>
                          <h4 className={cn("font-['Inter:Medium',sans-serif] text-[14px] font-medium opacity-70", getTextColor())}>Asked in Exams</h4>
                        </div>
                        <div className="space-y-3">
                          {block.pyqs.map((pyq: any, i: number) => (
                            <div key={i} className={cn("p-4 rounded-lg", backgroundPreset === 'dark' ? "bg-[#1a1a1a]" : "bg-white shadow-sm")}>
                              <p className="text-[12px] font-medium mb-1 opacity-50 uppercase tracking-wider">{pyq.exam_name} – {pyq.year}</p>
                              <p className="text-[14px] leading-[20px] mb-3">{pyq.question}</p>
                              <button
                                onClick={() => handleAnswerToggle(`pyq-${pyqKey}-${i}`)}
                                className="text-[13px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
                              >
                                {openAnswers.has(`pyq-${pyqKey}-${i}`) ? "Hide Answer" : "View Answer"}
                              </button>
                              {openAnswers.has(`pyq-${pyqKey}-${i}`) && (
                                <div className="mt-3 pt-3 border-t border-gray-100/10">
                                  <p className="text-[12px] font-medium text-green-500 mb-1">Answer:</p>
                                  <p className="text-[14px]">{pyq.answer}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Infographics Integration based on Section ID */}
              {section.id === 'kingdoms' && <ThreeKingdomsInfographic isDark={backgroundPreset === 'dark'} />}
              {section.id === 'sangam' && <SangamTimelineInfographic isDark={backgroundPreset === 'dark'} />}
              {section.id === 'administration' && <AdministrationHierarchyInfographic isDark={backgroundPreset === 'dark'} />}
              {section.id === 'trade' && <TradeNetworkInfographic isDark={backgroundPreset === 'dark'} />}
              {section.id === 'architecture' && <TempleArchitectureInfographic isDark={backgroundPreset === 'dark'} />}
            </div>
          </div>
        ))
        }
        {/* Refined Assessment Achievement Card */}
        <div className="pt-20 pb-32 border-t border-gray-100/50 max-w-4xl mx-auto px-6">
          <div className={cn(
            "relative p-10 md:p-14 rounded-[32px] text-center overflow-hidden transition-all duration-700",
            backgroundPreset === 'dark' ? 'bg-[#1c1c1e] border border-white/5 shadow-2xl' : 'bg-white border border-slate-100 shadow-xl shadow-slate-100/50'
          )}>

            {/* Background Decorative Accent */}
            <div className={cn(
              "absolute top-0 right-0 w-80 h-80 rounded-full -mr-40 -mt-40 blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000",
              isAssessmentFinished ? "bg-emerald-400" : "bg-blue-400"
            )} />

            <div className="relative z-10 space-y-8">
              {isAssessmentFinished ? (
                <>
                  {/* Dynamic Achievement Hero */}
                  {(() => {
                    const attempts = assessmentHistory?.attempts || [];
                    const latestAttempt = [...attempts].sort((a, b) => (b.attempt_no || 0) - (a.attempt_no || 0))[0];
                    const score = latestAttempt?.score_percentage || 0;

                    let illustration = scoreHigh;
                    if (score < 50) illustration = scoreLow;
                    else if (score < 80) illustration = scoreMedium;

                    return (
                      <div className="relative mx-auto w-48 h-48 flex items-center justify-center animate-in fade-in zoom-in duration-1000">
                        <div className={cn("absolute inset-0 rounded-full scale-90 blur-3xl opacity-30", backgroundPreset === 'dark' ? "bg-emerald-500/20" : "bg-emerald-50")} />
                        <img
                          src={illustration}
                          alt="Achievement"
                          className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                        />
                      </div>
                    );
                  })()}

                  <div className="space-y-2">
                    <h2 className={cn("text-2xl font-bold tracking-tight", getTextColor())}>
                      Evaluation Complete
                    </h2>
                    <p className={cn("text-[15px] opacity-60 max-w-md mx-auto leading-relaxed", getTextColor())}>
                      You've cleared this chapter's assessment. Your dedication to mastery is showing!
                    </p>
                  </div>

                  {/* Performance Metric Cluster */}
                  {(() => {
                    const attempts = assessmentHistory?.attempts || [];
                    const latestAttempt = [...attempts].sort((a, b) => (b.attempt_no || 0) - (a.attempt_no || 0))[0];
                    if (!latestAttempt) return null;

                    return (
                      <div className={cn(
                        "flex items-center justify-center py-6 px-10 rounded-2xl mx-auto max-w-[200px]",
                        backgroundPreset === 'dark' ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-100"
                      )}>
                        <div className="text-center">
                          <p className={cn("text-[10px] font-bold uppercase tracking-[1.5px] mb-1 opacity-50", getTextColor())}>Mastery</p>
                          <p className="text-2xl font-bold text-emerald-500">{latestAttempt.score_percentage}%</p>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-blue-500/10 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Brain className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className={cn("text-2xl font-bold tracking-tight", getTextColor())}>
                      Ready for Review?
                    </h2>
                    <p className={cn("text-[16px] opacity-60 max-w-sm mx-auto leading-relaxed", getTextColor())}>
                      Test your knowledge of the thematic focus with a final comprehensive evaluation.
                    </p>
                  </div>
                </>
              )}

              {/* Functional Action Group */}
              <div className="space-y-4 pt-2">
                {/* Primary Action Row */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {/* Only show assessment trigger if under 3 attempts */}
                  {(assessmentHistory?.total_attempts || 0) < 3 && (
                    isAssessmentFinished ? (
                      <Button
                        onClick={startAssessment}
                        className="w-full sm:w-auto px-10 py-6 text-[14px] rounded-2xl bg-[#1c1c1e] hover:bg-black text-white font-bold transition-all shadow-xl shadow-black/10 group transform hover:-translate-y-0.5 active:scale-95"
                      >
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        Reattempt
                      </Button>
                    ) : (
                      <Button
                        onClick={startAssessment}
                        className="w-full sm:w-auto px-12 py-6 text-[15px] rounded-2xl bg-[#1c1c1e] hover:bg-black text-white font-bold transition-all shadow-xl shadow-black/10 group transform hover:-translate-y-0.5 animate-bounce-subtle"
                      >
                        <span>Take Final Assessment</span>
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    )
                  )}

                  {isAssessmentFinished && (
                    <Button
                      onClick={async () => {
                        if (!viewHistoryAnswers) {
                          if (user?.id && parsedSubtopicId && !isNaN(parsedSubtopicId)) {
                            try {
                              const result = await studyService.getMCQResult(user.id, parsedSubtopicId, currentSubscriptionPlanId, currentPlanRowId);
                              if (result && result.questions) {
                                const letterToIdx = { "A": 0, "B": 1, "C": 2, "D": 3 };
                                const ans = result.questions.map((q: any) => letterToIdx[q.selected_option as keyof typeof letterToIdx] ?? null);
                                const ques = result.questions.map((q: any) => ({
                                  ...q,
                                  id: q.mcq_id,
                                  options: [q.options?.A || "", q.options?.B || "", q.options?.C || "", q.options?.D || ""],
                                  difficulty: q.difficulty || result.difficulty,
                                  explanation: q.reason || q.explanation || ""
                                }));
                                setViewHistoryAnswers(ans);
                                setResultsQuestions(ques);
                                setViewHistoryTimeTaken(result.time_taken_seconds);
                                setQuizScore(result.correct_answers);
                                setIsAssessmentSubmitted(true);
                              }
                            } catch (e) { console.error(e); }
                          }
                        }
                        setShowResultsOnly(true);
                        setIsAssessmentStarted(true);
                      }}
                      className="w-full sm:w-auto px-8 py-6 text-[14px] rounded-2xl bg-emerald-100/50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition-all shadow-sm"
                    >
                      <BarChart2 className="w-4 h-4 mr-2" />
                      Latest Results
                    </Button>
                  )}
                </div>

                {/* Quick Utility Row */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setIsAnalyticsModalOpen(true)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-full border text-[12px] font-bold uppercase tracking-wider transition-all",
                      backgroundPreset === 'dark'
                        ? "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    <HistoryIcon className="w-4 h-4" />
                    Analytics
                  </button>

                </div>

                {isAssessmentFinished && (assessmentHistory?.total_attempts || 0) < 3 && (
                  <p className="text-[12px] text-slate-400 font-medium">
                    {3 - (assessmentHistory?.total_attempts || 0)} attempts remaining
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("fixed inset-0 z-50 overflow-hidden", getBackgroundStyle())}>
      {/* Top Control Bar from StudyInterface */}
      <div
        className="fixed top-0 left-0 right-0 h-16 z-[100]"
        onMouseEnter={() => setShowTopBar(true)}
        onMouseLeave={() => setShowTopBar(false)}
      >
        <div className={cn(
          "absolute inset-0 transition-all duration-300",
          (showTopBar || headerMode === "fixed") ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
          backgroundPreset === 'dark' ? "bg-[#1a1a1a] border-b border-gray-800" : "bg-white border-b border-gray-200 shadow-sm"
        )}>
          <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-8 flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center">
              <button
                onClick={() => navigate('/study-plan')}
                className={cn("flex items-center gap-1.5 font-['Inter:Regular',sans-serif] text-[13px] sm:text-[14px] opacity-70 hover:opacity-100 transition-opacity", getTextColor())}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Back</span>
              </button>
            </div>

            <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 bg-gray-100/10 p-1 rounded-xl">
              {[
                { id: 'reading', icon: Book, label: 'Reading' },
                { id: 'study', icon: PenTool, label: 'Study' },
                { id: 'revision', icon: HistoryIcon, label: 'Revision' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as Mode)}
                  className={cn(
                    "px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2",
                    mode === m.id
                      ? "bg-[#1f2937] text-white shadow-sm"
                      : cn("text-[13px] sm:text-[14px] opacity-40 hover:opacity-100", getTextColor())
                  )}
                  title={`${m.label} Mode`}
                >
                  <m.icon className="w-4 h-4" />
                  <span className="text-[13px] sm:text-[14px] font-medium hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
              <span className={cn("text-[13px] sm:text-[14px] opacity-60 hidden lg:inline", getTextColor())}>Display:</span>
              <div className="flex items-center gap-1 sm:gap-1.5">
                {(['light', 'warm', 'dark'] as BackgroundPreset[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setBackgroundPreset(p)}
                    className={cn(
                      "px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-[12px] font-medium transition-all border",
                      backgroundPreset === p
                        ? "bg-[#1f2937] text-white border-[#1f2937]"
                        : cn("bg-transparent border-gray-200/20", getTextColor())
                    )}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHeaderMode(headerMode === 'hover' ? 'fixed' : 'hover')}
                  className={cn(
                    "p-1.5 rounded-xl transition-all border flex items-center gap-2",
                    headerMode === 'fixed'
                      ? "bg-[#1f2937] text-white border-[#1f2937] shadow-sm ml-2"
                      : cn("bg-transparent border-gray-200/20 ml-2", getTextColor())
                  )}
                  title={headerMode === 'fixed' ? "Unpin Header" : "Pin Header"}
                >
                  {headerMode === 'fixed' ? (
                    <Pin className="w-3.5 h-3.5 text-blue-400 rotate-45 transition-transform" />
                  ) : (
                    <MousePointer2 className="w-3.5 h-3.5 opacity-40" />
                  )}
                  <span className="text-[11px] font-medium uppercase tracking-wider hidden xs:inline">{headerMode}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-full overflow-hidden">
        {mode === 'reading' && (
          <div className="w-full h-full overflow-y-auto bg-[#f5f5f5]">
            <div
              className={cn("h-full overflow-y-auto pt-20", getBackgroundStyle())}
              style={{ maxWidth: '800px', margin: '0 auto' }}
              ref={readingPanelRef}
              onScroll={handleScroll}
            >
              {renderReadingContent()}
            </div>
          </div>
        )}

        {mode === 'study' && (
          <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden">
            {/* Reading Panel */}
            <div
              className={cn(
                "w-full lg:w-[60%] h-[35%] lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-200/10 transition-all duration-300 pt-20 lg:pt-24",
                focusedNoteKeyword ? "h-0 opacity-0 invisible lg:h-full lg:opacity-100 lg:visible" : "h-[35%]",
                getBackgroundStyle()
              )}
              ref={readingPanelRef}
              onScroll={handleScroll}
            >
              {renderReadingContent()}
            </div>

            {/* Right Side Panels (Keywords + Notes) */}
            <div className="w-full lg:w-[40%] flex-1 lg:h-full bg-[#fafaf9] flex flex-col overflow-hidden pb-20 lg:pb-0">
              {/* Keywords Bar */}
              <div className={cn(
                "flex-shrink-0 lg:h-[30%] lg:overflow-y-auto border-b border-gray-200/60 p-4 sm:p-6 bg-white/50 backdrop-blur-sm transition-all duration-300",
                focusedNoteKeyword ? "h-0 p-0 opacity-0 overflow-hidden border-none lg:h-[30%] lg:p-6 lg:opacity-100 lg:overflow-y-auto lg:border-b" : "h-auto"
              )}><div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-['Inter:Medium',sans-serif] text-[11px] sm:text-[13px] text-gray-400 font-medium">Keywords</h3>

                </div>

                <div className="flex flex-wrap gap-2 transition-all duration-300">
                  {visibleKeywords.map(kw => (
                    <button
                      key={kw}
                      onClick={() => handleKeywordClick(kw)}
                      className={cn(
                        "px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[12px] sm:text-[14px] transition-all border font-medium",
                        selectedKeyword === kw
                          ? "bg-[#1f2937] border-[#1f2937] text-white shadow-md font-medium"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                      )}
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes List Section */}
              <div className="flex-1 p-4 sm:p-8 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Inter:Medium',sans-serif] text-[11px] sm:text-[13px] text-gray-400 font-medium">
                    {focusedNoteKeyword ? `Editing: ${focusedNoteKeyword}` : 'Notes'}
                  </h3>
                  {focusedNoteKeyword && (
                    <button
                      onClick={() => (document.activeElement as HTMLElement)?.blur()}
                      className="text-[12px] font-medium text-blue-500 uppercase tracking-wider py-1 px-3 bg-blue-50 rounded-lg"
                    >
                      Done
                    </button>
                  )}
                </div>
                <div
                  ref={notesPanelRef}
                  className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar"
                >
                  {Object.keys(keywordNotes).length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 sm:py-20">
                      <div className="w-12 h-12 rounded-2xl bg-gray-200/50 flex items-center justify-center mb-4">
                        <PenTool className="w-6 h-6" />
                      </div>
                      <p className="font-['Inter:Regular',sans-serif] text-[13px] sm:text-[14px] text-gray-700 italic">
                        Select a keyword to start taking notes
                      </p>
                    </div>
                  ) : (
                    Object.entries(keywordNotes)
                      .sort(([a], [b]) => {
                        if (a === selectedKeyword) return -1;
                        if (b === selectedKeyword) return 1;
                        return 0;
                      })
                      .map(([keyword, content]) => (
                        <div
                          key={keyword}
                          className={cn(
                            "bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
                            selectedKeyword === keyword ? "border-accent ring-1 ring-accent/20" : "border-gray-200"
                          )}
                          onMouseEnter={() => setHoveredNoteId(keyword)}
                          onMouseLeave={() => setHoveredNoteId(null)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-['Inter:Medium',sans-serif] text-[14px] sm:text-[15px] font-medium text-gray-900 leading-tight">{keyword}</h4>
                              <p className="font-['Inter:Regular',sans-serif] text-[10px] text-gray-400 mt-1">
                                Ref: {topicData?.task?.topic || "Study Topic"}
                              </p>
                            </div>
                            {hoveredNoteId === keyword && (
                              <button
                                onClick={() => handleDeleteNote(keyword)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              >
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                                  <path d="M4 6V13C4 13.5523 4.44772 14 5 14H11C11.5523 14 12 13.5523 12 13V6M2 4H14M6 4V2.5C6 2.22386 6.22386 2 6.5 2H9.5C9.77614 2 10 2.22386 10 2.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <textarea
                            value={content}
                            onFocus={() => setFocusedNoteKeyword(keyword)}
                            onBlur={() => {
                              setFocusedNoteKeyword(null);
                              handleSaveNote(keyword, content);
                            }}
                            onChange={(e) => handleNoteContentChange(keyword, e.target.value)}
                            placeholder="Synthesize your understanding..."
                            className={cn(
                              "w-full p-4 bg-white border-2 transition-all duration-300 rounded-2xl resize-none font-['Inter:Regular',sans-serif] text-[14px] leading-relaxed shadow-sm",
                              focusedNoteKeyword === keyword
                                ? "min-h-[400px] border-blue-500/30 ring-4 ring-blue-500/5 text-gray-900"
                                : "min-h-[120px] border-gray-100 text-gray-600 bg-gray-50/30"
                            )}
                          />
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'revision' && (
          <div className="w-full h-full overflow-y-auto bg-[#fdfcfa] px-6 sm:px-10 md:px-24 py-16">
            <div className="max-w-[850px] mx-auto space-y-8 sm:space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-[24px] sm:text-[28px] font-medium text-gray-900 font-['Inter:Medium',sans-serif]">Revision Notes</h2>
                  {topicData?.task?.topic && (
                    <p className="text-sm text-gray-400 mt-1 font-['Inter:Regular',sans-serif]">
                      {topicData.task.subject} — {topicData.task.topic}
                    </p>
                  )}
                </div>
                <span className="text-[13px] text-gray-400">
                  {Object.keys(keywordNotes).length} keyword{Object.keys(keywordNotes).length !== 1 ? 's' : ''} captured
                </span>
              </div>

              {Object.keys(keywordNotes).length > 0 ? (
                <div className="grid gap-6">
                  {Object.entries(keywordNotes).map(([k, n]) => (
                    <div key={k} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
                      {/* Keyword header */}
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div>
                          <span className="inline-block  py-1 rounded-full  text-[#1f2937] text-lg font-medium mb-1">
                            {k}
                          </span>
                          {topicData?.task?.topic && (
                            <p className="text-[11px] text-gray-400 mt-0.5 font-['Inter:Regular',sans-serif]">
                              {topicData.task.topic}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteNote(k)}
                          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Note textarea */}
                      <textarea
                        value={n}
                        onChange={(e) => handleNoteContentChange(k, e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value.trim()) handleSaveNote(k, e.target.value);
                        }}
                        placeholder="Write your notes here..."
                        className="w-full min-h-[130px] p-4 bg-[#fcfcfc] border border-gray-100 rounded-lg resize-none font-['Inter:Regular',sans-serif] text-[15px] leading-[26px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                      />

                      {/* Save button */}
                      {isNoteDirty(k, n) && (
                        <div className="flex justify-end mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                          <button
                            onClick={() => handleSaveNote(k, n)}
                            className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium bg-[#1f2937] text-white rounded-lg hover:bg-black transition-all"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                    <HistoryIcon className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Notes Yet</h3>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    Switch to Study Mode, click a keyword, and write notes. They'll appear here automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>


      <DailyQuizModal
        isOpen={isAssessmentStarted}
        onClose={() => {
          setIsAssessmentStarted(false);
          setShowResultsOnly(false);
          // Don't clear viewHistoryAnswers yet to avoid flickering on close
        }}
        onComplete={handleAssessmentComplete}
        title={topicData?.task?.topic || "Study Assessment"}
        subtitle={`${topicAssessment?.total_questions || topicAssessment?.questions?.length || 0} Questions • 10 Minutes`}
        questions={(showResultsOnly || isAssessmentFinished) && resultsQuestions ? resultsQuestions : (topicAssessment?.questions || [])}
        initialAnswers={(showResultsOnly || isAssessmentFinished) ? viewHistoryAnswers : undefined}
        initialShowEvaluation={showResultsOnly || isAssessmentFinished}
        initialShowDetails={showResultsOnly}
        timeTaken={(showResultsOnly || isAssessmentFinished) ? viewHistoryTimeTaken : undefined}
        isSubmitted={isAssessmentSubmitted}
        isLoading={isSubmittingAssessment}
        score={quizScore}
      />

      {/* Analytics Modal */}
      <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 border-none rounded-[28px] bg-[#F7FAF8] shadow-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="relative p-5 sm:p-7">
            {/* Close Button */}


            {/* Header */}
            <div className="mb-6 mt-1 text-center sm:text-left">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Performance Analytics
              </h2>
              <p className="text-slate-500 text-[13px] mt-0.5">
                {topicData?.task?.topic || "Study Session Overview"}
              </p>
            </div>

            {!assessmentHistory || assessmentHistory.total_attempts === 0 ? (
              <div className="py-16 text-center bg-white/50 backdrop-blur-sm border border-dashed border-slate-200 rounded-[20px]">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart2 className="w-7 h-7 text-slate-200" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">No Data Recorded</h3>
                <p className="text-slate-400 max-w-xs mx-auto text-[11px] leading-relaxed px-4">
                  Complete an assessment to see your performance metrics.
                </p>
              </div>
            ) : (() => {
              const avgScore = Math.round(assessmentHistory.attempts.reduce((acc: any, curr: any) => acc + curr.score_percentage, 0) / assessmentHistory.total_attempts);

              let themeColor = "text-emerald-500";
              let bgColor = "bg-emerald-50";
              let badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
              let masteryImg = scoreHigh;
              let dotColor = "bg-emerald-500";

              if (avgScore < 50) {
                themeColor = "text-orange-500";
                bgColor = "bg-orange-50";
                badgeColor = "bg-orange-50 text-orange-600 border-orange-100";
                masteryImg = scoreLow;
                dotColor = "bg-orange-500";
              } else if (avgScore < 80) {
                themeColor = "text-blue-500";
                bgColor = "bg-blue-50";
                badgeColor = "bg-blue-50 text-blue-600 border-blue-100";
                masteryImg = scoreMedium;
                dotColor = "bg-blue-500";
              }

              return (
                <div className="space-y-6">
                  {/* Stats Summary - Integrated Illustration */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                    {/* Decorative background circle */}
                    <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none", bgColor)} />

                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-4xl tracking-tight mb-1.5 font-bold">
                          <span className={themeColor}>
                            {avgScore}%
                          </span>
                          <span className="text-slate-300 text-xl font-medium ml-1">Avg Accuracy</span>
                        </p>

                        <div className="flex items-center gap-3 text-[13px] font-medium text-slate-600">
                          <div className="flex items-center gap-1">
                            <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
                            {assessmentHistory.total_attempts} Attempts
                          </div>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          <div className="flex items-center gap-1 text-slate-500">
                            Best: <span className="text-slate-900 ml-0.5">{Math.max(...assessmentHistory.attempts.map((a: any) => a.score_percentage))}%</span>
                          </div>
                        </div>

                        <div className="mt-3.5 flex">
                          <div className={cn("px-2.5 py-0.5 rounded-full border flex items-center gap-1.5", badgeColor)}>
                            <div className={cn("w-1 h-1 rounded-full animate-pulse", dotColor)} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{avgScore >= 80 ? 'Mastery' : avgScore >= 50 ? 'Steady Progress' : 'Keep Learning'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Attractive Character Illustration */}
                      <div className="flex-shrink-0 -mr-2">
                        <img
                          src={masteryImg}
                          alt="Achievement"
                          className="w-32 h-32 object-contain animate-in fade-in zoom-in duration-700 delay-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Attempt Log */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between px-1.5">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Detailed Log
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {assessmentHistory.attempts.map((attempt: any) => (
                        <div
                          key={attempt.id || attempt.attempt_id}
                          className="bg-white/70 backdrop-blur-sm border border-slate-100 p-4 rounded-[16px] flex items-center justify-between transition-all duration-300"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                              <span className="text-sm font-bold text-slate-700">#{attempt.attempt_no}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[13px] font-semibold text-slate-900">
                                  {new Date(attempt.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                                <span className={cn(
                                  "text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase border",
                                  attempt.difficulty === 'hard' ? "bg-red-50 text-red-600 border-red-100" : attempt.difficulty === 'medium' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                )}>
                                  {attempt.difficulty}
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-400 font-normal mt-0.5">
                                {attempt.correct_answers}/{attempt.total_questions} Questions
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className={cn(
                              "text-xl font-bold",
                              attempt.score_percentage >= 80 ? "text-emerald-500" : attempt.score_percentage >= 50 ? "text-slate-700" : "text-red-400"
                            )}>{attempt.score_percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes bulbOnOffLoop {
          0%, 40% { transform: scale(1); opacity: 0.8; }
          45%, 95% { transform: scale(1.1) rotate(6deg); opacity: 1; filter: drop-shadow(0 0 12px rgba(251,191,36,0.4)); }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes bulbColorLoop {
          0%, 40% { stroke: #9ca3af; fill: none; }
          45%, 95% { stroke: #fbbf24; fill: rgba(251, 191, 36, 0.2); }
          100% { stroke: #9ca3af; fill: none; }
        }
        @keyframes rayVisibilityLoop {
          0%, 40% { opacity: 0; }
          45%, 95% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes bulbShake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-8deg); }
          80% { transform: rotate(8deg); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default StudyContent;
