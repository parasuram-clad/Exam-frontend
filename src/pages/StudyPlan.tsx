import { useState, useRef, useEffect } from "react";
import authService, { UserMe } from "@/services/auth.service";
import studyService, { StudyPlanResponse } from "@/services/study.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout";
import { StudyPlanCalendar } from "@/components/dashboard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, Lock, BookOpen, ClipboardList, ArrowLeft, ChevronLeft, ChevronRight, Search, Bell, Calendar, Pencil, Save, SlidersHorizontal, ChevronDown, Lightbulb, Book, Target, Globe, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { SubjectPlanView } from "@/components/dashboard/SubjectPlanView";
import { differenceInDays, startOfDay, format, startOfMonth, subMonths, isWithinInterval, subDays } from "date-fns";
import pic from "@/assets/pic.png";

// Import local assets
import studyPlan1 from "@/assets/study-plan1.png";
import studyPlan2 from "@/assets/study-plan2.png";
import studyPlan3 from "@/assets/study-plan3.png";
import studyPlan4 from "@/assets/study-plan4.png";
import historyIcon from "@/assets/dashboard/history-icon.png";
import economyIcon from "@/assets/dashboard/economy-icon.png";

// Import modal assets
import modalTopLeft from "@/assets/study-plan/top-left-mid.png";
import modalTopRight from "@/assets/study-plan/top-right-mid.png";
import modalBottomLeft from "@/assets/study-plan/bottom-left.png";
import modalBottomRight from "@/assets/study-plan/bottom-right.png";

const EXAM_SUB_DIVISIONS: Record<string, string[]> = {
  "TNPSC": ["Group I", "Group II", "Group IIA", "Group IV"],
  "TNTET": ["TET Paper I", "TET Paper II", "PG TET"],
  "TNUSRB": ["SI/SO", "PC/Fireman"]
};


// --- Helper for Fallback Images ---
const getSubjectIconFallback = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes("history") || s.includes("kural")) return studyPlan1;
  if (s.includes("geography") || s.includes("admin")) return studyPlan2;
  if (s.includes("science") || s.includes("polity")) return studyPlan3;
  return studyPlan4;
};

// --- Types ---
interface DayCycleItem {
  day: number;
  status: "completed" | "current" | "locked" | "assessment";
  label: string;
}

interface Subtopic {
  id: string;
  name: string;
  description: string;
  timeSpent: number;
  totalTime: number;
  status: "continue" | "start" | "completed";
}

interface StudyTopicCard {
  id: string;
  image: string;
  title: string;
  topicCount: number;
  progress: number;
  topics: { name: string; color: string }[];
  subtopics: Subtopic[];
}

// --- Static Data ---
const dayCycle: DayCycleItem[] = [
  { day: 1, status: "completed", label: "Day 1" },
  { day: 2, status: "completed", label: "Day 2" },
  { day: 3, status: "current", label: "Day 3" },
  { day: 4, status: "locked", label: "Day 4" },
  { day: 5, status: "locked", label: "Day 5" },
  { day: 6, status: "locked", label: "Day 6" },
  { day: 7, status: "locked", label: "Assessment" },
  { day: 8, status: "locked", label: "Locked" },
  { day: 9, status: "locked", label: "Locked" },
  { day: 10, status: "locked", label: "Locked" },
];

const dayCycleRotation: Record<number, StudyTopicCard[]> = {
  1: [
    {
      id: "tamil-nadu-history-1", image: studyPlan1, title: "Tamil Nadu History", topicCount: 2, progress: 100,
      topics: [{ name: "Ancient Tamil Kingdoms", color: "bg-[#7C79EC]" }, { name: "Sangam Literature", color: "bg-[#7C79EC]" }],
      subtopics: [
        { id: "ancient-kingdoms", name: "Ancient Tamil Kingdoms", description: "Study the early Tamil kingdoms.", timeSpent: 45, totalTime: 45, status: "completed" },
        { id: "sangam-literature", name: "Sangam Literature", description: "Explore Sangam period literature.", timeSpent: 40, totalTime: 40, status: "completed" },
      ],
    },
    {
      id: "indian-economy-1", image: studyPlan4, title: "Indian Economy", topicCount: 2, progress: 100,
      topics: [{ name: "Economic Planning", color: "bg-[#34C759]" }, { name: "Five Year Plans", color: "bg-[#34C759]" }],
      subtopics: [
        { id: "economic-planning", name: "Economic Planning", description: "Framework and objectives of economic planning.", timeSpent: 50, totalTime: 50, status: "completed" },
        { id: "five-year-plans", name: "Five Year Plans", description: "Evolution of India's Five Year Plans.", timeSpent: 35, totalTime: 35, status: "completed" },
      ],
    },
  ],
  2: [
    {
      id: "tamil-nadu-geography-2", image: studyPlan2, title: "Tamil Nadu Geography", topicCount: 2, progress: 100,
      topics: [{ name: "Rivers and Water Bodies", color: "bg-[#34C759]" }, { name: "Mountain Ranges", color: "bg-[#34C759]" }],
      subtopics: [
        { id: "rivers-water", name: "Rivers and Water Bodies", description: "Study Tamil Nadu's rivers.", timeSpent: 40, totalTime: 40, status: "completed" },
        { id: "mountains", name: "Mountain Ranges", description: "Explore Western and Eastern Ghats.", timeSpent: 35, totalTime: 35, status: "completed" },
      ],
    },
    {
      id: "general-science-2", image: studyPlan3, title: "General Science", topicCount: 2, progress: 100,
      topics: [{ name: "Physics Basics", color: "bg-[#FF3B30]" }, { name: "Chemistry Fundamentals", color: "bg-[#FF3B30]" }],
      subtopics: [
        { id: "physics-basics", name: "Physics Basics", description: "Fundamental concepts in physics.", timeSpent: 45, totalTime: 45, status: "completed" },
        { id: "chemistry-fundamentals", name: "Chemistry Fundamentals", description: "Basic chemistry concepts.", timeSpent: 40, totalTime: 40, status: "completed" },
      ],
    },
  ],
  3: [
    {
      id: "tamil-nadu-history-3", image: studyPlan1, title: "History & Culture", topicCount: 2, progress: 40,
      topics: [{ name: "Indus Valley Civilization", color: "bg-[#FF3B30]" }, { name: "Guptas, Delhi Sultans", color: "bg-[#FF3B30]" }],
      subtopics: [
        { id: "sangam-period", name: "Indus Valley Civilization", description: "Learn about early civilization.", timeSpent: 20, totalTime: 45, status: "continue" },
        { id: "medieval-kingdoms", name: "Guptas, Delhi Sultans", description: "Study major dynasties.", timeSpent: 0, totalTime: 35, status: "start" },
      ],
    },
    {
      id: "indian-polity-3", image: studyPlan3, title: "Indian Polity", topicCount: 2, progress: 0,
      topics: [{ name: "Constitutional Framework", color: "bg-[#FF3B30]" }, { name: "Fundamental Rights", color: "bg-[#FF3B30]" }],
      subtopics: [
        { id: "constitutional-framework", name: "Constitutional Framework", description: "Examine the basic structure of the Constitution.", timeSpent: 0, totalTime: 50, status: "start" },
        { id: "fundamental-rights", name: "Fundamental Rights", description: "Study the fundamental rights.", timeSpent: 0, totalTime: 40, status: "start" },
      ],
    },
  ],
  4: [
    {
      id: "aptitude-4", image: studyPlan4, title: "Aptitude & Mental Ability", topicCount: 2, progress: 0,
      topics: [{ name: "Simplification", color: "bg-[#7C79EC]" }, { name: "Percentage", color: "bg-[#7C79EC]" }],
      subtopics: [
        { id: "apt-1", name: "Simplification", description: "Mastering mental math and BODMAS.", timeSpent: 0, totalTime: 60, status: "start" },
        { id: "apt-2", name: "Percentage", description: "Core concepts of ratios and percentages.", timeSpent: 0, totalTime: 60, status: "start" },
      ],
    },
    {
      id: "general-science-4", image: studyPlan3, title: "General Science", topicCount: 1, progress: 0,
      topics: [{ name: "Biology: Botany", color: "bg-[#34C759]" }],
      subtopics: [
        { id: "sci-1", name: "Plant Life", description: "Study of flora and botanical classifications.", timeSpent: 0, totalTime: 45, status: "start" },
      ],
    },
  ],
  5: [
    {
      id: "indian-national-movement-5", image: studyPlan1, title: "Indian National Movement", topicCount: 2, progress: 0,
      topics: [{ name: "Early Uprisings", color: "bg-[#FF3B30]" }, { name: "1857 Revolt", color: "bg-[#FF3B30]" }],
      subtopics: [
        { id: "inm-1", name: "Early Uprisings", description: "Resistance against British rule.", timeSpent: 0, totalTime: 50, status: "start" },
        { id: "inm-2", name: "1857 Revolt", description: "The first war of independence.", timeSpent: 0, totalTime: 40, status: "start" },
      ],
    },
    {
      id: "indian-polity-5", image: studyPlan3, title: "Indian Polity", topicCount: 1, progress: 0,
      topics: [{ name: "Directive Principles", color: "bg-[#7C79EC]" }],
      subtopics: [
        { id: "pol-1", name: "DPSP", description: "Understanding active state directives.", timeSpent: 0, totalTime: 45, status: "start" },
      ],
    },
  ],
  6: [
    {
      id: "development-admin-6", image: studyPlan2, title: "TN Development Admin", topicCount: 2, progress: 0,
      topics: [{ name: "Social Welfare Schemes", color: "bg-[#34C759]" }, { name: "E-Governance", color: "bg-[#34C759]" }],
      subtopics: [
        { id: "adm-1", name: "Social Welfare", description: "Schemes for various sectors in TN.", timeSpent: 0, totalTime: 60, status: "start" },
        { id: "adm-2", name: "E-Governance", description: "Digital initiatives in Tamil Nadu.", timeSpent: 0, totalTime: 45, status: "start" },
      ],
    },
    {
      id: "current-events-6", image: studyPlan4, title: "Current Events", topicCount: 1, progress: 0,
      topics: [{ name: "National & State News", color: "bg-[#FF3B30]" }],
      subtopics: [
        { id: "cur-1", name: "Weekly Roundup", description: "Review of key headlines.", timeSpent: 0, totalTime: 90, status: "start" },
      ],
    },
  ],
  0: [
    {
      id: "assessment-7", image: studyPlan4, title: "Assessment & Revision", topicCount: 2, progress: 0,
      topics: [{ name: "Weekly Test", color: "bg-[#7C79EC]" }, { name: "Syllabus Review", color: "bg-[#7C79EC]" }],
      subtopics: [
        { id: "test-1", name: "Mock Test 1", description: "Simulated exam for previous 6 days topics.", timeSpent: 0, totalTime: 180, status: "start" },
        { id: "rev-1", name: "Doubt Clearing", description: "Address difficult topics from the week.", timeSpent: 0, totalTime: 60, status: "start" },
      ],
    },
  ],
};

const dayWiseStudyPlans: Record<number, StudyTopicCard[]> = dayCycleRotation;

const notesData = [
  { month: "Dec", day: 26, title: "Geography", subtitle: "Disaster management", fullDate: "2025-12-26", content: "Focus on early warning systems and community-based disaster risk reduction strategies. Studied the role of NGOs in disaster response." },
  { month: "Dec", day: 28, title: "Indian Economy", subtitle: "Rural Welfare oriented programmes", fullDate: "2025-12-28", content: "Analyzed the impact of MGNREGA on rural employment and the recent changes in the Pradhan Mantri Awas Yojana guidelines." },
  { month: "Jan", day: 5, title: "History", subtitle: "Mughal Architecture", fullDate: "2026-01-05", content: "Reviewed the architectural highlights of the Taj Mahal and Red Fort. Noted the blend of Persian, Islamic, and Indian styles." },
  { month: "Jan", day: 12, title: "Polity", subtitle: "Fundamental Rights", fullDate: "2026-01-12", content: "Deep dive into Articles 14-18 (Right to Equality) and Articles 19-22 (Right to Freedom). Memorized key judicial interpretations." },
  { month: "Jan", day: 15, title: "Science", subtitle: "Human Anatomy", fullDate: "2026-01-15", content: "Studied the cardiovascular system, heart structure, and the mechanics of blood circulation. Revised the names of major arteries and veins." },
];

const areasToImprove = [
  { id: 1, title: "Indian Constitution", subtitle: "Repeated Mistakes", accuracy: 42, icon: historyIcon },
  { id: 2, title: "Profit & Loss", subtitle: "Time Taking", accuracy: 55, icon: economyIcon },
  { id: 3, title: "Mughal Empire", subtitle: "Low Accuracy", accuracy: 38, icon: historyIcon },
];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
};

// --- Circular Progress ---
const CircularProgress = ({ progress, size = 48 }: { progress: number; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} strokeWidth="3" fill="transparent" className="stroke-border" />
        <motion.circle
          cx={center} cy={center} r={radius} strokeWidth="3" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          strokeLinecap="round"
          className={progress >= 70 ? "stroke-[#34C759]" : progress > 0 ? "stroke-accent" : "stroke-muted-foreground/30"}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-medium text-foreground leading-none">{progress}%</span>
      </div>
    </div>
  );
};

// --- Right Sidebar ---
const StudyPlanRightSidebar = ({
  user,
  avatarUrl,
  initials,
  onDateClick,
  selectedDate,
  currentProgressDay,
  totalDays,
  mobileView = 'all'
}: {
  user: UserMe | null,
  avatarUrl: string,
  initials: string,
  onDateClick?: (date: Date) => void,
  selectedDate?: Date,
  currentProgressDay: number,
  totalDays: number,
  mobileView?: 'streak' | 'leaderboard' | 'all'
}) => {
  const [noteSearch, setNoteSearch] = useState("");
  const [localNotes, setLocalNotes] = useState(notesData);
  const [selectedDetailNote, setSelectedDetailNote] = useState<typeof notesData[0] | null>(null);
  const [showAllNotesView, setShowAllNotesView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterView, setFilterView] = useState<"options" | "months">("options");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [editBuffer, setEditBuffer] = useState<typeof notesData[0] | null>(null);
  const navigate = useNavigate();

  const handleEditClick = () => {
    setEditBuffer(selectedDetailNote);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editBuffer || !selectedDetailNote) return;

    const updatedNotes = localNotes.map(n =>
      n.fullDate === selectedDetailNote.fullDate && n.title === selectedDetailNote.title
        ? editBuffer
        : n
    );

    setLocalNotes(updatedNotes);
    setSelectedDetailNote(editBuffer);
    setIsEditing(false);
    toast.success("Note updated successfully");
  };

  return (
    <div className="space-y-6">


      {showAllNotesView ? (
        /* Full Notes View in Sidebar */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAllNotesView(false)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-medium text-foreground">My Study Notes</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                placeholder="Search keywords"
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="pl-9 h-10 rounded-lg bg-secondary/50 border-border text-sm"
              />
            </div>
            <DropdownMenu onOpenChange={(open) => !open && setFilterView("options")}>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "p-2 rounded-xl border border-border/50 transition-colors outline-none",
                  activeFilter !== "all" ? "bg-primary/10 text-primary border-primary/20" : "hover:bg-secondary text-foreground/70"
                )}>
                  <div className="flex flex-col gap-[3px] items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px] p-1 rounded-2xl border-none shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] bg-white overflow-hidden">
                <AnimatePresence mode="wait">
                  {filterView === "options" ? (
                    <motion.div
                      key="options"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="py-1"
                    >
                      <DropdownMenuItem
                        onClick={() => setActiveFilter("all")}
                        className={cn(
                          "px-4 py-2 text-xs font-medium border-b border-slate-50 rounded-none cursor-pointer focus:bg-slate-50",
                          activeFilter === "all" ? "text-primary bg-slate-50" : "text-[#1E293B]"
                        )}
                      >
                        All Notes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setActiveFilter("last-week")}
                        className={cn(
                          "px-4 py-2 text-xs font-medium border-b border-slate-50 rounded-none cursor-pointer focus:bg-slate-50",
                          activeFilter === "last-week" ? "text-primary bg-slate-50" : "text-[#1E293B]"
                        )}
                      >
                        Last week
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setActiveFilter("this-month")}
                        className={cn(
                          "px-4 py-2 text-xs font-medium border-b border-slate-50 rounded-none cursor-pointer focus:bg-slate-50",
                          activeFilter === "this-month" ? "text-primary bg-slate-50" : "text-[#1E293B]"
                        )}
                      >
                        This month
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setFilterView("months");
                        }}
                        className="px-4 py-2 text-xs font-medium text-[#1E293B] hover:bg-slate-50 flex justify-between items-center rounded-none cursor-pointer focus:bg-slate-50"
                      >
                        Previous months
                        <Calendar className="w-4 h-4 text-[#94A3B8]" />
                      </DropdownMenuItem>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="months"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4"
                    >
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedYear(y => y - 1); }} className="hover:text-primary transition-colors">
                          <ChevronLeft className="w-5 h-5 text-[#94A3B8]" />
                        </button>
                        <span className="text-xs font-medium text-[#1E293B]">{selectedYear}</span>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedYear(y => y + 1); }} className="hover:text-primary transition-colors">
                          <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, idx) => {
                          const isDisabled = (selectedYear === 2026 && idx > 1) || (selectedYear > 2026);
                          const filterKey = `${month}-${selectedYear}`;
                          return (
                            <button
                              key={month}
                              disabled={isDisabled}
                              onClick={() => {
                                setActiveFilter(filterKey);
                              }}
                              className={cn(
                                "text-xs font-medium py-1 px-2 rounded-lg transition-colors text-center",
                                isDisabled ? "text-[#CBD5E1] cursor-not-allowed" :
                                  activeFilter === filterKey ? "text-primary bg-primary/10" : "text-[#1E293B] hover:text-primary cursor-pointer"
                              )}
                            >
                              {month}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {activeFilter !== "all" && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
                Showing: {activeFilter.replace("-", " ")}
              </span>
              <button
                onClick={() => setActiveFilter("all")}
                className="text-[10px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-1"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="space-y-4">
            {(() => {
              const filtered = localNotes.filter(n => {
                const matchesSearch = n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
                  n.subtitle.toLowerCase().includes(noteSearch.toLowerCase());

                if (!matchesSearch) return false;
                if (activeFilter === "all") return true;

                const noteDate = new Date(n.fullDate);
                const today = new Date();

                if (activeFilter === "last-week") {
                  const sevenDaysAgo = subDays(today, 7);
                  return isWithinInterval(noteDate, { start: sevenDaysAgo, end: today });
                }

                if (activeFilter === "this-month") {
                  return format(noteDate, "MMM-yyyy") === format(today, "MMM-yyyy");
                }

                // Format: Jan-2026
                return format(noteDate, "MMM-yyyy") === activeFilter;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-10">
                    <p className="text-sm text-muted-foreground">No notes found for this period.</p>
                    <button
                      onClick={() => setActiveFilter("all")}
                      className="text-xs text-primary mt-2 font-medium hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                );
              }

              return filtered.map((note, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 group cursor-pointer"
                  onClick={() => { setSelectedDetailNote(note); setIsEditing(false); }}
                >
                  <div className="rounded-xl py-2 px-3 text-center min-w-[55px] bg-[#F1F8FF] group-hover:bg-[#E1F0FF] transition-colors">
                    <span className="text-[10px] font-medium text-muted-foreground block uppercase">{note.month}</span>
                    <span className="text-lg font-medium text-foreground leading-none">{note.day}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {note.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{note.subtitle}</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </motion.div >
      ) : (
        /* Normal Sidebar View */
        <>

          <StudyPlanCalendar
            onDateClick={onDateClick}
            selectedDate={selectedDate}
            currentProgressDay={currentProgressDay}
            totalDays={totalDays}
          />

          {/* Notes Section */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg text-foreground">Recent Notes</h3>
              {localNotes.length > 3 && (
                <button
                  onClick={() => setShowAllNotesView(true)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-primary"
                  title="View All"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>



            <div className="space-y-3">
              {(() => {
                const filtered = localNotes.filter(n =>
                  n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
                  n.subtitle.toLowerCase().includes(noteSearch.toLowerCase())
                );

                if (filtered.length === 0) {
                  return <p className="text-xs text-muted-foreground text-center py-4">No notes found.</p>;
                }

                return filtered.slice(0, 3).map((note, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => { setSelectedDetailNote(note); setIsEditing(false); }}>
                    <div className="rounded-xl py-1 px-3 text-center min-w-[25px] bg-[#EFF6FF]">
                      <span className="text-[8px] font-medium text-muted-foreground block uppercase">{note.month}</span>
                      <span className="text-sm font-medium text-foreground leading-none">{note.day}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[12px] text-foreground truncate">{note.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{note.subtitle}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Areas to Improve Section */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium text-lg text-foreground">Areas to Improve</h3>
              <button
                onClick={() => navigate("/progress")}
                className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-primary"
                title="View Detailed Progress"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 sm:space-y-6">
              {areasToImprove.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between group cursor-pointer"
                  onClick={() => navigate("/progress")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary/30 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                      <img src={item.icon} alt={item.title} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[11px] sm:text-[12px] text-foreground leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1 font-medium">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className=" p-1 rounded-xl bg-destructive/5 border border-destructive/10 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-medium text-destructive whitespace-nowrap">
                        {item.accuracy}% Acc
                      </span>
                    </div>
                    {/* <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" /> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Note Detail Modal */}
      <Dialog open={!!selectedDetailNote} onOpenChange={(open) => !open && setSelectedDetailNote(null)}>
        <DialogContent className="w-[95vw] sm:max-w-lg p-0 bg-background rounded-2xl sm:rounded-3xl overflow-hidden border-border transition-all duration-300 flex flex-col max-h-[90vh]">
          {selectedDetailNote && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="p-4 pr-14 bg-[#EFF6FF] border-b border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl py-2 px-4 text-center bg-white shadow-sm ring-1 ring-primary/5">
                    <span className="text-xs font-medium text-primary block uppercase tracking-wider">{selectedDetailNote.month}</span>
                    <span className="text-2xl font-medium text-foreground leading-none">{selectedDetailNote.day}</span>
                  </div>
                  <div>

                    {isEditing ? (
                      <Input
                        value={editBuffer?.title}
                        onChange={(e) => setEditBuffer(prev => prev ? { ...prev, title: e.target.value } : null)}
                        className="h-8 text-md font-medium bg-white/50 border-primary/20"
                      />
                    ) : (
                      <h2 className="text-md font-medium text-foreground leading-tight">{selectedDetailNote.title}</h2>
                    )}
                    {isEditing ? (
                      <Input
                        value={editBuffer?.subtitle}
                        onChange={(e) => setEditBuffer(prev => prev ? { ...prev, subtitle: e.target.value } : null)}
                        className="h-7 text-xs mt-1 bg-white/50 border-primary/20"
                      />
                    ) : (
                      <p className="text-xs text-primary font-medium mt-1">{selectedDetailNote.subtitle}</p>
                    )}
                  </div>
                </div>

                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary transition-colors shrink-0"
                    onClick={handleEditClick}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-[#1E293B] hover:bg-[#1E293B]/90 text-white shadow-md transition-all shrink-0"
                    onClick={handleSaveEdit}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Content */}
              <div className="p-5 sm:p-8 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-widest">Study Reflection</span>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editBuffer?.content}
                      onChange={(e) => setEditBuffer(prev => prev ? { ...prev, content: e.target.value } : null)}
                      className="w-full min-h-[150px] p-4 rounded-2xl bg-secondary/50 border border-primary/10 text-[15px] outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                      placeholder="Type your notes here..."
                    />
                  ) : (
                    <p className="text-foreground/80 leading-relaxed text-[15px] whitespace-pre-wrap">
                      {selectedDetailNote.content}
                    </p>
                  )}
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">{selectedDetailNote.fullDate}</span>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 hover:bg-primary/5 font-medium rounded-xl"
                      onClick={() => setSelectedDetailNote(null)}
                    >
                      Close
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-secondary font-medium rounded-xl"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
};

// --- Main Component ---
const StudyPlan = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  // React Query for data fetching
  const { data: user } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => authService.getCurrentUser(),
    staleTime: Infinity,
  });

  const { data: userPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['study-plans', user?.id],
    queryFn: async () => {
      try {
        return await studyService.getUserStudyPlans(user!.id);
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: roadmapData, isLoading: roadmapLoading } = useQuery({
    queryKey: ['roadmap', user?.id],
    queryFn: () => studyService.getUserRoadmap(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loading = plansLoading || roadmapLoading;

  const [dynamicDayWisePlans, setDynamicDayWisePlans] = useState<Record<number, StudyTopicCard[]>>({});
  const [selectedTopic, setSelectedTopic] = useState<StudyTopicCard | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [setupData, setSetupData] = useState({
    name: "",
    medium: "",
    examType: "TNPSC",
    subDivision: ["Group IV"] as string[],
    learnerType: "Student",
    studyGoal: "4 Hours",
    targetYear: "2026"
  });
  const [viewMode, setViewMode] = useState<'overall' | 'subject'>('overall');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize dynamic plans when data changes
  useEffect(() => {
    if (roadmapData?.plan && userPlans) {
      setDynamicDayWisePlans(mapRoadmapToFrontend(roadmapData.plan, userPlans));
      const currentDay = calculateCurrentProgressDay(userPlans);
      setActiveDay(currentDay);
    }
  }, [roadmapData, userPlans]);

  // Modal open logic: check after loading is done
  useEffect(() => {
    if (loading || isGenerating) return;

    // Check if user has no study plan rows at all
    const hasNoPlan = !userPlans || userPlans.length === 0;

    // Check if key profile fields are missing
    const isProfileEmpty =
      !user?.full_name?.trim() ||
      !user?.exam_type?.trim() ||
      !user?.sub_division?.trim() ||
      !user?.target_exam_year ||
      !user?.learner_type?.trim();

    if (isProfileEmpty || hasNoPlan) {
      setIsSetupModalOpen(true);
    } else {
      setIsSetupModalOpen(false);
    }
  }, [loading, isGenerating, user, userPlans]);

  // Pre-fill setup modal with user details
  useEffect(() => {
    if (user) {
      setSetupData(prev => ({
        ...prev,
        name: user.full_name || "",
        medium: user.preferred_language === 'ta' ? 'tamil' : 'english',
        examType: (user.exam_type as any) || "TNPSC",
        subDivision: user.sub_division ? user.sub_division.split(", ") : ["Group IV"],
        targetYear: user.target_exam_year?.toString() || "2026",
        learnerType: user.learner_type || "Student"
      }));
    }
  }, [user]);

  const mapRoadmapToFrontend = (roadmapPlan: any[], backendPlans: StudyPlanResponse[]): Record<number, StudyTopicCard[]> => {
    // Create a status map for quick lookup
    const statusMap: Record<number, string> = {};
    backendPlans.forEach(p => {
      // Use day_no + syllabus_id to be unique if there are duplicates (though syllabus_id should be unique in a day)
      if (p.syllabus_id) statusMap[p.syllabus_id] = p.plan_status;
    });

    const result: Record<number, StudyTopicCard[]> = {};
    roadmapPlan.forEach(dayPlan => {
      result[dayPlan.day] = dayPlan.items.map((item: any, idx: number) => {
        if (item.type === 'TOPIC') {
          const completedCount = item.topic.filter((t: any) => statusMap[t.id] === 'COMPLETED').length;
          const progress = Math.round((completedCount / (item.topic.length || 1)) * 100);

          return {
            id: `${item.subject.toLowerCase().replace(/\s+/g, '-')}-${dayPlan.day}-${idx}`,
            image: item.image_url || getSubjectIconFallback(item.subject),
            title: item.subject,
            topicCount: item.topic.length,
            progress,
            topics: item.topic.map((t: any) => ({ name: t.name, color: 'bg-[#7C79EC]' })),
            subtopics: item.topic.map((t: any) => ({
              id: t.id.toString(),
              name: t.name,
              description: t.description,
              timeSpent: statusMap[t.id] === 'COMPLETED' ? t.minutes : 0,
              totalTime: t.minutes,
              status: (statusMap[t.id] === 'COMPLETED' ? 'completed' : statusMap[t.id] === 'IN_PROGRESS' ? 'continue' : 'start') as any,
            })),
          };
        } else {
          // Handle TEST/REVISION
          const status = statusMap[dayPlan.day] || 'start'; // This is simplified for tests
          return {
            id: `${item.type.toLowerCase()}-${dayPlan.day}-${idx}`,
            image: item.type === 'TEST' ? studyPlan4 : studyPlan2,
            title: item.title || (item.type === 'TEST' ? 'Weekly Test' : 'Revision'),
            topicCount: 1,
            progress: status === 'COMPLETED' ? 100 : 0,
            topics: [{ name: item.description || 'Assessment', color: item.type === 'TEST' ? 'bg-[#FF3B30]' : 'bg-[#34C759]' }],
            subtopics: [{
              id: `sub-${item.type.toLowerCase()}-${dayPlan.day}-${idx}`,
              name: item.title || item.type,
              description: item.description || 'Scheduled activity',
              timeSpent: status === 'COMPLETED' ? item.minutes : 0,
              totalTime: item.minutes,
              status: (status === 'COMPLETED' ? 'completed' : status === 'IN_PROGRESS' ? 'continue' : 'start') as any,
            }],
          };
        }
      });
    });
    return result;
  };

  const mapBackendPlanToFrontend = (backendPlans: StudyPlanResponse[]): Record<number, StudyTopicCard[]> => {
    const groupedByDay: Record<number, StudyPlanResponse[]> = {};
    backendPlans.forEach(plan => {
      if (!groupedByDay[plan.day_no]) groupedByDay[plan.day_no] = [];
      groupedByDay[plan.day_no].push(plan);
    });

    const result: Record<number, StudyTopicCard[]> = {};
    Object.entries(groupedByDay).forEach(([day, plans]) => {
      const dayNo = parseInt(day);
      const groupedBySubject: Record<string, StudyPlanResponse[]> = {};
      plans.forEach(plan => {
        if (!groupedBySubject[plan.subject]) groupedBySubject[plan.subject] = [];
        groupedBySubject[plan.subject].push(plan);
      });

      result[dayNo] = Object.entries(groupedBySubject).map(([subject, items]) => {
        const completedCount = items.filter(i => i.plan_status === 'COMPLETED').length;
        const progress = Math.round((completedCount / (items.length || 1)) * 100);
        return {
          id: `${subject.toLowerCase().replace(/\s+/g, '-')}-${dayNo}`,
          image: getSubjectIconFallback(subject),
          title: subject,
          topicCount: items.length,
          progress,
          topics: Array.from(new Set(items.map(i => i.chapter))).map(ch => ({ name: ch, color: 'bg-[#7C79EC]' })),
          subtopics: items.map(i => ({
            id: i.id.toString(), name: i.topic, description: `Chapter: ${i.chapter}`,
            timeSpent: i.plan_status === 'COMPLETED' ? i.minutes : 0, totalTime: i.minutes,
            status: i.plan_status === 'COMPLETED' ? 'completed' as const : i.plan_status === 'IN_PROGRESS' ? 'continue' as const : 'start' as const,
          })),
        };
      });
    });
    return result;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
    }
  };

  // Find the current progress day (first day that isn't completed)
  const calculateCurrentProgressDay = (plans: StudyPlanResponse[]) => {
    if (plans.length > 0) {
      const sortedDays = Array.from(new Set(plans.map(p => p.day_no))).sort((a, b) => a - b);
      const firstIncomplete = sortedDays.find(day => {
        const dayPlans = plans.filter(p => p.day_no === day);
        return !dayPlans.every(p => p.plan_status === 'COMPLETED');
      });
      return firstIncomplete || sortedDays[0] || 1;
    }
    return 1;
  };

  const getCurrentProgressDay = () => {
    if (userPlans.length > 0) {
      return calculateCurrentProgressDay(userPlans);
    }
    // Static fallback: check for 'current' status in dayCycle, default to 3
    const currentFromStatic = dayCycle.find(d => d.status === 'current');
    return currentFromStatic ? currentFromStatic.day : 3;
  };

  const totalDays = roadmapData?.total_days || (roadmapData?.plan && roadmapData.plan.length > 0 ? Math.max(...roadmapData.plan.map((p: any) => p.day)) : 120);
  const currentProgressDay = getCurrentProgressDay();
  const daysLeft = Math.max(0, totalDays - currentProgressDay + 1);

  // Generate dynamic day cycle data
  const dynamicDayCycle: DayCycleItem[] = Array.from({ length: totalDays }, (_, i) => {
    const dayNo = i + 1;
    let status: DayCycleItem['status'] = 'locked';

    if (dayNo < currentProgressDay) {
      status = 'completed';
    } else if (dayNo === currentProgressDay) {
      status = 'current';
    } else if (dayNo % 7 === 0) {
      status = 'assessment';
    }

    return {
      day: dayNo,
      status,
      label: dayNo % 7 === 0 ? "Assessment" : `Day ${dayNo}`
    };
  });

  const availableSubjects = Array.from(new Set(
    userPlans.length > 0
      ? userPlans.map(p => p.subject)
      : Object.values(dayWiseStudyPlans).flatMap(days => days.map((t: any) => t.title))
  )).sort();

  const currentStudyTopics = (userPlans.length > 0
    ? (dynamicDayWisePlans[activeDay] || [])
    : (dayWiseStudyPlans[activeDay] || dayWiseStudyPlans[activeDay % 7] || []))
    .filter(t => !selectedSubject || t.title === selectedSubject);

  const handleDayClick = (day: DayCycleItem) => {
    setActiveDay(day.day);
  };

  const handleViewDetails = (topic: StudyTopicCard) => {
    setSelectedTopic(topic);
    setIsDialogOpen(true);
  };

  const handleSubtopicClick = async (topicId: string, subtopicId: string) => {
    // If it's a subtopic from backend, we might want to update status to IN_PROGRESS
    const subIdNum = parseInt(subtopicId);
    if (!isNaN(subIdNum)) {
      const plan = userPlans.find(p => p.id === subIdNum || p.syllabus_id === subIdNum);
      if (plan && plan.plan_status === 'start') {
        try {
          await studyService.updateStudyPlan(plan.id, { plan_status: 'IN_PROGRESS' });
          queryClient.invalidateQueries({ queryKey: ['study-plans', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['roadmap', user?.id] });
        } catch (err) {
          console.error("Failed to update plan status", err);
        }
      }
    }
    setIsDialogOpen(false);
    navigate(`/study-plan/topic/${topicId}/subtopic/${subtopicId}`);
  };

  const handleGeneratePlan = async () => {
    if (!user) {
      toast.error("Please log in to generate a study plan.");
      return;
    }

    // Validate required fields
    if (!setupData.name.trim() || !setupData.medium || setupData.subDivision.length === 0) {
      toast.error("Please fill in all required fields (Name, Medium, and Exam).");
      return;
    }

    try {
      setIsGenerating(true);
      setIsSetupModalOpen(false);

      // Parse daily study hours from "4 Hours" => 4
      const dailyHours = parseInt(setupData.studyGoal.replace(/[^0-9]/g, '')) || 4;
      const preferredLang = setupData.medium === 'tamil' ? 'ta' : 'en';

      // 1. Update User Profile with name and exam details
      await authService.updateProfile(user!.id, {
        full_name: setupData.name,
        exam_type: setupData.examType,
        sub_division: setupData.subDivision.join(", "),
        target_exam_year: parseInt(setupData.targetYear),
        learner_type: setupData.learnerType,
        preferred_language: preferredLang,
      });

      // 2. Generate study plan
      await studyService.generateStudyPlan({
        user_id: user!.id,
        exam_type: setupData.examType || user!.exam_type || "TNPSC",
        sub_division:
          setupData.subDivision.length > 0
            ? setupData.subDivision.join(", ")
            : user!.sub_division || "Group IV",
        year: parseInt(setupData.targetYear || user!.target_exam_year?.toString() || "2026"),
        learner_type: setupData.learnerType || user!.learner_type || "Student",
        daily_study_hours: dailyHours,
        language: setupData.medium === 'tamil' ? 'Tamil' : 'English',
      });

      // 3. Invalidate queries to trigger re-fetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user-me'] }),
        queryClient.invalidateQueries({ queryKey: ['study-plans', user!.id] }),
        queryClient.invalidateQueries({ queryKey: ['roadmap', user!.id] }),
      ]);

      setActiveDay(1);
      toast.success("Study plan generated successfully!");
    } catch (err) {
      console.error("Failed to generate study plan", err);
      toast.error("Failed to generate study plan. Please try again.");
      setIsSetupModalOpen(true); // re-open modal on failure
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-scroll logic: scroll to active day
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-day="${activeDay}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeDay]);

  // Calculate overall progress: use task-based if we have real plans, otherwise use day-based progress
  const overallProgress = userPlans.length > 0
    ? Math.round((userPlans.filter(p => p.plan_status === 'COMPLETED').length / (userPlans.length || 1)) * 100)
    : Math.round(((currentProgressDay - 1) / totalDays) * 100);

  const userName = user?.full_name || user?.username || "Aspirant";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const avatarUrl = user?.photo_url
    ? user.photo_url.startsWith("http")
      ? user.photo_url
      : `${baseUrl}${user.photo_url}`
    : pic;

  // --- Day Cycle Navigation Logic ---
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  // Update arrows when activeDay changes (due to auto-scroll)
  useEffect(() => {
    const timer = setTimeout(handleScroll, 500);
    return () => clearTimeout(timer);
  }, [activeDay]);

  // Helper to map calendar date to Study Day #
  const handleCalendarDateClick = (date: Date) => {
    const today = startOfDay(new Date());
    const clickedDate = startOfDay(date);
    const diff = differenceInDays(clickedDate, today);

    // activeDay is relative to our currentProgressDay (actual study day)
    // If we click today, show currentProgressDay, etc.
    const targetDay = currentProgressDay + diff;

    if (targetDay >= 1 && targetDay <= totalDays) {
      setActiveDay(targetDay);
    } else {
      toast.info("No study plan defined for this date.");
    }
  };

  if (loading || isGenerating) {
    return (
      <DashboardLayout
        hideHeader={isDesktop}
        rightSidebar={() => (
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full rounded-2xl" />
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <Skeleton className="h-[200px] w-full rounded-2xl" />
          </div>
        )}
      >
        <div className="space-y-8 pb-10 pt-4 lg:pt-6">
          <div className="px-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Banner Skeleton */}
          <Skeleton className="h-[200px] w-full rounded-2xl" />

          {/* Cycle Skeleton */}
          <section className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-14 rounded-2xl shrink-0" />
              ))}
            </div>
          </section>

          {/* Topics Skeleton */}
          <section className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[236px] w-full rounded-2xl" />
              ))}
            </div>
          </section>

          {isGenerating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center ">
              <div className="flex flex-col items-center gap-4 bg-card rounded-2xl p-8 shadow-xl border border-border max-w-sm w-full mx-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="text-center">
                  <h3 className="text-base font-medium text-foreground">Generating Your Plan</h3>
                  <p className="text-sm text-muted-foreground mt-1">Our AI is building a personalized study plan for you...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      hideHeader={isDesktop}
      rightSidebar={() => (
        <StudyPlanRightSidebar
          user={user}
          avatarUrl={avatarUrl}
          initials={initials}
          onDateClick={handleCalendarDateClick}
          selectedDate={(() => {
            const today = startOfDay(new Date());
            const daysOffset = activeDay - currentProgressDay;
            const date = new Date(today);
            date.setDate(today.getDate() + daysOffset);
            return date;
          })()}
          currentProgressDay={currentProgressDay}
          totalDays={totalDays}
        />
      )}
    >
      <div className="px-1 mb-2 sm:mb-0">
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-end  gap-1">
          <div>
            <div className="flex items-center gap-2">
              {selectedTopic || selectedSubject ? (
                <button
                  onClick={() => {
                    if (selectedTopic) setSelectedTopic(null);
                    else setSelectedSubject(null);
                  }}
                  className="p-1 hover:bg-muted rounded-full transition-colors mr-1"
                >
                  <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              ) : null}
              <h1 className="text-xl sm:text-2xl font-medium text-foreground">
                {selectedSubject ? selectedSubject : "Study Plan"}
              </h1>
            </div>
            <p className="text-[12px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              {selectedSubject ? "Daily Schedule" : `${user?.exam_type || "TNPSC"} – ${user?.sub_division || "Group IV"} | ${user?.target_exam_year || "2026"}`}
            </p>
          </div>

          <div className="flex bg-muted/30 p-1 rounded-xl sm:ml-auto">
            <button
              onClick={() => { setViewMode('overall'); setSelectedSubject(null); }}
              className={cn(
                "px-4 py-2 text-xs font-medium rounded-lg transition-all",
                viewMode === 'overall' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Overall Plan
            </button>
            <button
              onClick={() => setViewMode('subject')}
              className={cn(
                "px-4 py-2 text-xs font-medium rounded-lg transition-all",
                viewMode === 'subject' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Subject Wise
            </button>
          </div>

        </motion.div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-10 pt-4 lg:pt-6" >
        {/* Countdown Banner */}
        <motion.div
          variants={itemVariants}
          className="relative rounded-2xl px-5 py-6 sm:px-6 sm:py-7 md:px-8 md:py-8 overflow-hidden"
        >
          {/* Background styling for the banner with Lighting Animation */}
          <div className="absolute inset-0 bg-[#1D2C4E] rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#334F90]/50 rounded-2xl" />

          {/* Animated Glow Blobs */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute -bottom-32 -right-32 w-80 h-80 bg-primary/30 rounded-full blur-[100px] pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 rounded-full blur-[120px] pointer-events-none"
          />
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10">
              <span className="text-xl sm:text-2xl md:text-3xl font-medium text-accent">{daysLeft}</span>
              <span className="text-primary-foreground text-sm sm:text-base md:text-xl font-medium">Days Left for {user?.exam_type || "TNPSC"} {user?.sub_division || "Group IV"}</span>
            </div>

            {/* Progress Container */}
            <div className="relative px-2">
              {/* Day indicator - Always synced with the tip of the progress bar */}
              {(() => {
                const suffix = (d: number) => {
                  if (d > 3 && d < 21) return 'th';
                  switch (d % 10) {
                    case 1: return "st";
                    case 2: return "nd";
                    case 3: return "rd";
                    default: return "th";
                  }
                };

                return (
                  <motion.div
                    className="absolute -top-7 pointer-events-none"
                    initial={{ left: "0%" }}
                    animate={{ left: `${overallProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                  >
                    {/* Shift slightly left so the arrow (▼) tip is centered over the progress point */}
                    <div className="flex items-center gap-1.5 -translate-x-[4px] md:-translate-x-[5px]">
                      <span className="text-accent text-[10px] sm:text-xs md:text-sm font-medium whitespace-nowrap">
                        ▼ {currentProgressDay}{suffix(currentProgressDay)} Day
                      </span>
                    </div>
                  </motion.div>
                );
              })()}

              {/* Progress bar and Marker */}
              <div className="relative">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  />
                </div>

                {/* Status Marker - Synced with progress bar tip, centered horizontally */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-accent rounded-full shadow-[0_0_12px_rgba(202,238,54,0.8)] z-10"
                  initial={{ left: "0%" }}
                  animate={{ left: `${overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                />

                {/* Finish Line Flag */}
                <div className="absolute -top-8 -right-0 flex flex-col items-center">
                  <motion.svg
                    width="14"
                    height="34"
                    viewBox="0 0 14 34"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 sm:h-10 w-auto"
                  >
                    <path d="M12.7967 0.00299072L12.5938 33.925" stroke="white" stroke-miterlimit="10" />
                    <motion.path
                      d="M0 1.62801L0.406283 8.12809C0.406283 8.12809 1.21872 9.34682 4.06247 7.92494C4.06247 7.92494 5.28119 6.50308 7.10936 7.7218C7.10936 7.7218 9.34367 6.09677 13 7.3155L12.7969 0.00299072C12.7969 0.00299072 7.31251 0.00299298 7.71865 1.42487C7.71865 1.42487 5.07804 2.03431 3.65616 1.42487L0 1.62801"
                      fill="#C7DD66"
                      style={{ originX: "100%", originY: "0%" }}
                    />
                  </motion.svg>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <span className="text-primary-foreground/60 text-xs font-medium">Overall Progress</span>
              <span className="text-accent text-xs font-medium">{overallProgress}%</span>
            </div>
          </div>
        </motion.div>

        {viewMode === 'subject' && !selectedSubject ? (
          <motion.section variants={itemVariants}>
            <h2 className="text-lg font-medium text-foreground mb-5">Select a Subject</h2>
            <SubjectPlanView
              subjects={availableSubjects}
              onSelectSubject={setSelectedSubject}
              userPlans={userPlans}
              dayWiseStudyPlans={dayWiseStudyPlans}
            />
          </motion.section>
        ) : (
          <>
            <motion.section variants={itemVariants}>
              <h2 className="text-lg font-medium text-foreground mb-4">{totalDays}-Day Cycle</h2>

              <div className="relative group/cycle">
                {/* Navigation arrows with conditional visibility */}
                <AnimatePresence>
                  {showLeftArrow && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => scroll('left')}
                      className="absolute left-0 top-3.5 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-sm items-center justify-center text-muted-foreground hover:text-accent-foreground hover:bg-accent hover:scale-105 hover:shadow-md transition-all hidden sm:flex"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showRightArrow && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => scroll('right')}
                      className="absolute right-0 top-3.5 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-sm items-center justify-center text-muted-foreground hover:text-accent-foreground hover:bg-accent hover:scale-105 hover:shadow-md transition-all hidden sm:flex"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex items-start gap-0 overflow-x-auto pb-4 pt-1 scrollbar-hide scroll-smooth sm:px-4"
                >
                  {dynamicDayCycle.map((item, index) => (
                    <div key={index} data-day={item.day} className="flex items-start shrink-0">
                      <div className="flex flex-col items-center w-[60px] md:w-[72px] shrink-0">
                        <motion.button
                          whileHover={item.status !== "locked" ? { scale: 0.95, y: -2 } : {}}
                          whileTap={item.status !== "locked" ? { scale: 0.95 } : {}}
                          onClick={() => handleDayClick(item)}
                          className={cn(
                            "w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-200 relative cursor-pointer",
                            item.status === "completed" && "bg-primary text-primary-foreground",
                            item.status === "current" && "bg-accent text-accent-foreground shadow-lg ring-2 ring-accent/30",
                            item.status === "locked" && "bg-secondary text-muted-foreground/50 hover:bg-secondary/80",
                            item.status === "assessment" && "bg-card border-2 border-dashed border-border text-muted-foreground",
                            activeDay === item.day && item.status === "locked" && "ring-2 ring-primary/20 bg-secondary/80 text-foreground",
                            activeDay === item.day && item.status !== "locked" && "ring-4 ring-accent/40 scale-105"
                          )}
                        >
                          {item.status === "completed" && <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />}
                          {item.status === "current" && <BookOpen className="w-5 h-5 md:w-6 md:h-6" />}
                          {item.status === "locked" && <Lock className="w-4 h-4 md:w-5 md:h-5" />}
                          {item.status === "assessment" && <ClipboardList className="w-4 h-4 md:w-5 md:h-5" />}
                        </motion.button>
                        <span className={cn(
                          "text-[10px] md:text-[11px] mt-2 font-medium text-center leading-tight",
                          item.status === "locked" ? "text-muted-foreground/40" : "text-muted-foreground",
                          activeDay === item.day && "text-foreground font-medium"
                        )}>
                          {item.label}
                        </span>
                      </div>

                      {index < dynamicDayCycle.length - 1 && (
                        <div className="w-6 md:w-10 h-11 md:h-14 flex items-center justify-center shrink-0">
                          <div className="w-full h-[2.5px] bg-[linear-gradient(to_right,#9C9C9C_6px,transparent_4px)] bg-[length:10px_100%]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Today's Study Plan */}
            <motion.section variants={itemVariants}>
              <h2 className="text-lg font-medium text-foreground mb-5">
                {selectedSubject ? `${selectedSubject} - Day ${activeDay}` : "Today's Study Plan"}
              </h2>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDay}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {currentStudyTopics.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-card rounded-2xl border border-dashed border-border">
                      <div className="p-4 bg-secondary rounded-full mb-3">
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-medium text-foreground mb-1">No Schedule Today</h3>
                      <p className="text-sm text-muted-foreground">Rest or catch up on previous topics.</p>
                    </div>
                  ) : (
                    currentStudyTopics.map((topic, index) => (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, type: "spring" as const, stiffness: 120, damping: 18 }}
                        className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden"
                      >
                        <div className="p-5 flex-1">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12  flex items-center justify-center overflow-hidden">
                                <img
                                  src={topic.image}
                                  alt={topic.title}
                                  className="w-8 h-8 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = getSubjectIconFallback(topic.title);
                                  }}
                                />
                              </div>
                              <div>
                                <h3 className="text-[14px] font-medium text-foreground leading-tight">{topic.title}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{topic.topicCount} Topics</p>
                              </div>
                            </div>
                            <CircularProgress progress={topic.progress} />
                          </div>

                          {/* Topics List */}
                          <ul className="space-y-2 mb-4">
                            {topic.topics.map((t, i) => (
                              <li key={i} className="flex items-center gap-2.5 text-xs text-foreground/80">
                                <div className={cn("w-[6px] h-[6px] rounded-full shrink-0", t.color)} />
                                {t.name}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="px-5 pb-5 mt-auto">
                          {(() => {
                            // Sequential Unlock Logic:
                            // 1. Previous days must be complete (handled by isUnlocked base)
                            // 2. Previous topics in the SAME day list must have 100% progress
                            const isPreviousTopicComplete = index === 0 || currentStudyTopics[index - 1].progress === 100;
                            const isCurrentDayFullyComplete = currentStudyTopics.every(t => t.progress === 100);

                            // Base unlock if a previous day is fully done
                            const isDayUnlocked = activeDay < currentProgressDay || (activeDay === currentProgressDay) || (activeDay === currentProgressDay + 1 && isCurrentDayFullyComplete);

                            // Sequential unlock within the day
                            const isTopicUnlocked = (activeDay < currentProgressDay) || (activeDay === currentProgressDay && isPreviousTopicComplete);

                            const finalIsUnlocked = isTopicUnlocked;

                            return (
                              <Button
                                disabled={!finalIsUnlocked}
                                onClick={() => handleViewDetails(topic)}
                                className={cn(
                                  "w-full h-11 rounded-xl text-sm font-medium transition-all",
                                  !finalIsUnlocked
                                    ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-80"
                                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                                )}
                              >
                                {!finalIsUnlocked ? (
                                  <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    <span>Locked</span>
                                  </div>
                                ) : "View Details"}
                              </Button>
                            );
                          })()}
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.section>
          </>
        )}
      </motion.div>

      {/* Study Topic Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-hidden p-0 bg-background rounded-2xl sm:rounded-3xl flex flex-col">
          {selectedTopic && (
            <div className="p-5 sm:p-8 overflow-y-auto flex-1">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setIsDialogOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors shrink-0">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <h2 className="text-xl font-medium text-foreground">{selectedTopic.title}</h2>
              </div>

              <div className="flex justify-center mb-8">
                <img
                  src={selectedTopic.image}
                  alt={selectedTopic.title}
                  className="w-32 h-32 object-contain opacity-30"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getSubjectIconFallback(selectedTopic.title);
                  }}
                />
              </div>

              <div className="space-y-4">
                {selectedTopic.subtopics.map((subtopic) => (
                  <div key={subtopic.id} className="bg-primary rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-primary-foreground text-lg font-medium mb-1">{subtopic.name}</h3>
                        <p className="text-primary-foreground/70 text-sm">{subtopic.description}</p>
                      </div>
                      <Button
                        onClick={() => handleSubtopicClick(selectedTopic.id, subtopic.id)}
                        className="bg-card hover:bg-card/90 text-foreground px-6 rounded-xl font-medium shrink-0"
                      >
                        {subtopic.status === "continue" ? "Continue" : subtopic.status === "completed" ? "Review" : "Start Now"}
                      </Button>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-primary-foreground/80 text-sm mb-2">
                        <span>Time Spent</span>
                        <span className="font-medium text-primary-foreground">{subtopic.timeSpent}m / {subtopic.totalTime}m</span>
                      </div>
                      <div className="h-2 bg-primary-foreground/10 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(subtopic.timeSpent / subtopic.totalTime) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Set Up Your Exam Plan Modal */}
      <Dialog open={isSetupModalOpen} onOpenChange={setIsSetupModalOpen}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="w-[92vw] max-w-xl p-0 overflow-hidden border-none bg-white rounded-[24px] shadow-2xl max-h-[95vh] overflow-y-auto"
        >
          <div className="relative p-5 sm:p-8 md:p-10 bg-[radial-gradient(circle_at_top,#FAFFE9_0%,transparent_50%),linear-gradient(to_br,#F8FAFF_0%,white_50%,#F0F7FF_100%)] min-h-[500px] flex flex-col justify-center overflow-hidden">
            <div className="absolute top-[-90%] left-0 w-full h-full rounded-full bg-gradient-to-br from-[#DDEFD9] via-white to-[#DDEFD9] min-h-[500px] flex flex-col blur-2xl justify-center"></div>
            {/* Decorative Illustrations */}
            <div className="absolute top-20 left-0 w-20 h-20  pointer-events-none">
              <img src={modalTopLeft} alt="" className="w-full h-full object-contain opacity-20" />
            </div>
            <div className="absolute top-24 right-0 w-24 h-24 pointer-events-none">
              <img src={modalTopRight} alt="" className="w-full h-full object-contain opacity-20" />
            </div>
            <div className="absolute bottom-0 left-0 w-32 h-32  pointer-events-none">
              <img src={modalBottomLeft} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="absolute bottom-0 right-0 w-32  pointer-events-none">
              <img src={modalBottomRight} alt="" className="w-full h-full object-contain" />
            </div>

            <div className="relative z-10 text-center mb-7">
              <h2 className="text-xl sm:text-2xl font-medium text-[#1E293B] mb-1.5 leading-tight">Set Up Your Exam Plan</h2>
              <p className="text-[#64748B] text-sm sm:text-[15px]">Help us personalize your preparation</p>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Full Name</Label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={setupData.name}
                  onChange={(e) => setSetupData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-11 px-4 rounded-xl bg-muted/30 border border-[#E2E8F0] focus:ring-primary/20 hover:border-primary/30 transition-all text-[#64748B] text-sm"
                />
              </div>

              {/* Study Medium */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Study Medium</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Globe className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select onValueChange={(val) => setSetupData(prev => ({ ...prev, medium: val }))}>
                    <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                      <SelectValue placeholder="Select Medium" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 shadow-xl p-2">
                      <SelectItem value="english" className="rounded-lg focus:bg-accent/10">English Medium</SelectItem>
                      <SelectItem value="tamil" className="rounded-lg focus:bg-accent/10">Tamil Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Exam Type */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Exam Type</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Target className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    value={setupData.examType}
                    onValueChange={(value) => {
                      setSetupData({
                        ...setupData,
                        examType: value,
                        subDivision: []
                      });
                    }}
                  >
                    <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                      <SelectValue placeholder="Select Exam Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 p-2">
                      <SelectItem value="TNPSC" className="rounded-lg focus:bg-accent/10">TNPSC</SelectItem>
                      <SelectItem value="TNTET" className="rounded-lg focus:bg-accent/10">TNTET</SelectItem>
                      <SelectItem value="TNUSRB" className="rounded-lg focus:bg-accent/10">TNUSRB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Choose Your Exam - Multi Select with Checkboxes */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Choose Your Exam</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <BookOpen className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!setupData.examType}>
                      <button className="w-full bg-muted/30 border-none h-12 pl-12 pr-10 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none text-left flex items-center justify-between overflow-hidden">
                        <span className="truncate">
                          {setupData.subDivision.length > 0
                            ? setupData.subDivision.join(", ")
                            : (setupData.examType ? "Select Exam" : "Select Exam Type First")}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-2xl border-border/50 shadow-xl max-h-60 overflow-y-auto p-2">
                      {setupData.examType && EXAM_SUB_DIVISIONS[setupData.examType]?.map((sub) => (
                        <DropdownMenuItem
                          key={sub}
                          className="w-[220px] rounded-lg flex items-center gap-3 py-2.5 px-3 focus:bg-accent/10 cursor-pointer"
                          onSelect={(e) => {
                            e.preventDefault();
                            setSetupData(prev => {
                              const isChecked = prev.subDivision.includes(sub);
                              const newSub = isChecked
                                ? prev.subDivision.filter(s => s !== sub)
                                : [...prev.subDivision, sub];
                              return { ...prev, subDivision: newSub };
                            });
                          }}
                        >
                          <Checkbox
                            checked={setupData.subDivision.includes(sub)}
                            onCheckedChange={(checked) => {
                              setSetupData(prev => {
                                const newSub = checked
                                  ? [...prev.subDivision, sub]
                                  : prev.subDivision.filter(s => s !== sub);
                                return { ...prev, subDivision: newSub };
                              });
                            }}
                            className="h-5 w-5 rounded-[4px] border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className="font-medium text-sm text-foreground/80">{sub}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Target Year */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Target Exam Year</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Calendar className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    value={setupData.targetYear}
                    onValueChange={(val) => setSetupData(prev => ({ ...prev, targetYear: val }))}
                  >
                    <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 shadow-xl p-2">
                      <SelectItem value="2026" className="rounded-lg focus:bg-accent/10">2026</SelectItem>
                      <SelectItem value="2027" className="rounded-lg focus:bg-accent/10">2027</SelectItem>
                      <SelectItem value="2028" className="rounded-lg focus:bg-accent/10">2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Learner Type */}
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Learner Type</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Zap className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    value={setupData.learnerType}
                    onValueChange={(value) => setSetupData({ ...setupData, learnerType: value })}
                  >
                    <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                      <SelectValue placeholder="Select Learner Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 p-2">
                      <SelectItem value="Student" className="rounded-lg focus:bg-accent/10">Student</SelectItem>
                      <SelectItem value="Working Professional" className="rounded-lg focus:bg-accent/10">Working Professional</SelectItem>
                      <SelectItem value="Fresher" className="rounded-lg focus:bg-accent/10">Fresher</SelectItem>
                      <SelectItem value="Experienced" className="rounded-lg focus:bg-accent/10">Experienced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Daily Study Goal</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Target className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    value={setupData.studyGoal}
                    onValueChange={(value) => setSetupData({ ...setupData, studyGoal: value })}
                  >
                    <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                      <SelectValue placeholder="Select Goal" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 p-2">
                      <SelectItem value="4 Hours" className="rounded-lg focus:bg-accent/10">4 Hours</SelectItem>
                      <SelectItem value="6 Hours" className="rounded-lg focus:bg-accent/10">6 Hours</SelectItem>
                      <SelectItem value="8 Hours" className="rounded-lg focus:bg-accent/10">8 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex justify-center pb-2">
              <Button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="h-11 px-8 rounded-full bg-[#1E293B] hover:bg-[#0F172A] text-white text-sm font-medium shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Generating...
                  </span>
                ) : "Create My Smart Plan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudyPlan;
