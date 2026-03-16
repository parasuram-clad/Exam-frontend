import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  Download,
  Search,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal,
  BookOpen,
  Share2,
  Calendar,
  Clock,
  AlertCircle,
  Bell,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QuizCalendar, DailyQuizModal } from "@/components/dashboard";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMediaQuery } from "@/hooks/use-media-query";
import authService, { UserMe } from "@/services/auth.service";
import currentAffairsService, { Article as ApiArticle } from "@/services/currentAffairs.service";
import pic from "@/assets/pic.png";
import { BASE_URL } from "@/config/env";

import polityIcon from "@/assets/current-affairs/polity-icon.png";
import internationalIcon from "@/assets/current-affairs/international-icon.png";
import tamilnaduIcon from "@/assets/current-affairs/tamilnadu-icon.png";
import economyIcon from "@/assets/current-affairs/economy-icon.png";
import dailyQuizIcon from "@/assets/daily-quize-icon.png";

// We now use ApiArticle imported from the service instead, but defining locally just in case for old props.
interface Article extends ApiArticle { }

const categories = [
  { id: "all", label: "All" },
  { id: "polity", label: "Polity" },
  { id: "economy", label: "Economy" },
  { id: "science", label: "Science & Tech" },
  { id: "tamil-nadu", label: "Tamil Nadu" },
  { id: "international", label: "International" },
  { id: "awards", label: "Awards" },
];

const categoryIcons: Record<string, string> = {
  polity: polityIcon,
  economy: economyIcon,
  "tamil-nadu": tamilnaduIcon,
  international: internationalIcon,
  science: internationalIcon,
  awards: dailyQuizIcon,
};

const categoryColors: Record<string, string> = {
  polity: "text-purple-600 bg-purple-50 border-purple-100",
  economy: "text-amber-600 bg-amber-50 border-amber-100",
  "tamil-nadu": "text-emerald-600 bg-emerald-50 border-emerald-100",
  international: "text-blue-600 bg-blue-50 border-blue-100",
  science: "text-indigo-600 bg-indigo-50 border-indigo-100",
  awards: "text-rose-600 bg-rose-50 border-rose-100",
};

const categoryDotColors: Record<string, string> = {
  polity: "bg-purple-500",
  economy: "bg-amber-500",
  "tamil-nadu": "bg-emerald-500",
  international: "bg-blue-500",
  science: "bg-indigo-500",
  awards: "bg-rose-500",
};

const mockArticles: Article[] = [
  {
    id: "0",
    title: "India Hosts International Solar Alliance Summit 2026",
    summary:
      "India hosted the 9th International Solar Alliance (ISA) Summit in New Delhi, focusing on green energy transitions and solar technology sharing for developing nations.",
    category: "international",
    date: "Feb 20, 2026",
    date_raw: "2026-02-20",
    readTime: "5 min",
    important: true,
    bookmarked: false,
    tags: ["Solar Energy", "Climate Action", "ISA"],
    full_content: {
      introduction: "The **9th International Solar Alliance (ISA) Summit** commenced today in **New Delhi**, with representatives from over **120 member countries**. The summit focuses on the **'Solar for All'** initiative, aiming to mobilize **$1 trillion** in investments by **2030** to expand solar access in Africa and Southeast Asia.",
      sections: [
        {
          title: "Key Agenda Points:",
          content: "The primary focus of this year's summit is the establishment of a **Global Solar Repository** and the launch of the **SolarX Startup Challenge 2026** to encourage innovation in storage technology."
        },
        {
          title: "Quick Summary:",
          content: "",
          is_list: true,
          list_items: [
            "9th ISA Summit hosted in New Delhi",
            "Focus on green energy transitions",
            "Target: Mobilize $1 trillion in solar investments by 2030",
            "Member countries involved: 120+",
            "Launch of SolarX Startup Challenge 2026",
            "Policy focus on energy security for global south"
          ]
        },
        {
          title: "Exam Highlights",
          content: "",
          is_list: true,
          is_key_value: true,
          list_items: [
            "**ISA Headquarters:** Gurugram, India",
            "**Current Target:** 1000 GW solar capacity by 2030",
            "**Relevant Subject:** International Relations / Environment",
            "**Founding Members:** India and France"
          ]
        }
      ],
      possible_question: {
        question: "Where is the headquarters of the International Solar Alliance (ISA) located?",
        answer: "Ans: Gurugram, India"
      }
    }
  },
  {
    id: "1",
    title: "Tamil Nadu Launches New Skill Development Scheme",
    summary:
      "The Tamil Nadu Government has introduced a new skill development scheme aimed at improving employability among rural youth through industry-based training programs.",
    category: "tamil-nadu",
    date: "Feb 19, 2026",
    date_raw: "2026-02-19",
    readTime: "3 min",
    important: true,
    bookmarked: false,
    tags: ["Tamil Nadu", "Skill Development"],
    full_content: {
      introduction: "The Tamil Nadu Government has launched a **new skill development scheme** aimed at improving **employability** among rural and semi-urban youth. The scheme focuses on providing industry-oriented training in sectors such as **IT, manufacturing, healthcare, and construction**. Eligible candidates aged **18 to 35 years** will receive certified training through government-approved centers, along with placement assistance after completion.",
      sections: [
        {
          title: "In-Depth Explanation:",
          content: "The program will be monitored by the **State Skill Development Authority** and is expected to benefit nearly **two lakh** youth in its first phase. The funding for the scheme will be shared by both the **State and Central Governments**."
        },
        {
          title: "Quick Summary:",
          content: "",
          is_list: true,
          list_items: [
            "Launched by the Tamil Nadu Government",
            "Aims to boost youth employability",
            "Training in IT, manufacturing, healthcare, and construction",
            "Target age group: 18-35 years",
            "Certified training through approved centers",
            "Placement support after completion",
            "Implemented by State Skill Development Authority",
            "Phase 1: 2 lakh beneficiaries",
            "Funded by State and Central Governments"
          ]
        },
        {
          title: "Exam Highlights",
          content: "",
          is_list: true,
          is_key_value: true,
          list_items: [
            "**Objective:** Skill development & job readiness",
            "**Implementing Authority:** State Skill Development Authority",
            "**Target Group:** Rural & semi-urban youth",
            "**Funding Pattern:** State + Central support",
            "**Relevant Subject:** Indian Economy / Welfare Schemes"
          ]
        }
      ],
      possible_question: {
        question: "Which authority implements the new Tamil Nadu Skill Development Scheme?",
        answer: "Ans: State Skill Development Authority"
      }
    }
  },
  {
    id: "3",
    title: "Tamil Nadu Water Management Policy 2026",
    summary:
      "Tamil Nadu approved a new policy focusing on Cauvery conservation, irrigation reforms, and groundwater sustainability. The policy aims to ensure long-term water security for the state.",
    category: "tamil-nadu",
    date: "Feb 17, 2026",
    date_raw: "2026-02-17",
    readTime: "3 min",
    important: false,
    bookmarked: true,
    tags: ["Tamil Nadu", "Water"],
    full_content: {
      introduction: "The **Tamil Nadu Water Management Policy 2026** is a landmark initiative designed to address the state's growing water challenges. It focuses on **integrated water resource management**, specifically targeting the **Cauvery basin conservation** and sustainable groundwater practices.",
      sections: [
        {
          title: "Key Initiatives:",
          content: "The policy includes the rejuvenation of ancient water bodies, implementation of advanced drip irrigation for farmers, and strict regulations on groundwater extraction in over-exploited zones."
        }
      ],
      possible_question: {
        question: "What is the primary focus of the TN Water Management Policy 2026?",
        answer: "Ans: Cauvery conservation and groundwater sustainability."
      }
    }
  },
  {
    id: "4",
    title: "National Semiconductor Mission Phase II",
    summary:
      "The Indian government has approved Phase II of the National Semiconductor Mission to establish a robust domestic ecosystem for electronics manufacturing.",
    category: "science",
    date: "Dec 26, 2026",
    date_raw: "2026-12-26",
    readTime: "5 min",
    important: true,
    bookmarked: true,
    tags: ["India", "Semiconductor", "Technology"],
    full_content: {
      introduction: "The Union Cabinet has cleared **Phase II of the National Semiconductor Mission (ISM)**. This stage aims at scaling up fabrication units (fabs) and fostering a competitive **semiconductor design ecosystem** in India with a dedicated incentive pool.",
      sections: [
        {
          title: "Strategic Impact:",
          content: "By reducing dependency on imports, Phase II will bolster India's position in the global supply chain, supporting industries from automotive to high-end computing."
        }
      ],
      possible_question: {
        question: "What is the aim of Phase II of the National Semiconductor Mission?",
        answer: "Ans: Scaling up fabrication units and semiconductor design ecosystem."
      }
    }
  },
  {
    id: "2",
    title: "RBI Expands Digital Rupee Pilot",
    summary:
      "RBI expanded the digital rupee pilot to promote secure retail transactions and strengthen digital payment systems across more cities.",
    category: "economy",
    date: "Dec 24, 2026",
    date_raw: "2026-12-24",
    readTime: "4 min",
    important: false,
    bookmarked: true,
    tags: ["RBI", "Digital Currency", "Finance"],
    full_content: {
      introduction: "The **Reserve Bank of India (RBI)** has announced the next expansion phase of its **Central Bank Digital Currency (CBDC)** - Retail (Digital Rupee). This expansion brings more banks and cities into the ecosystem to test cross-border compatibility and offline usage.",
      sections: [
        {
          title: "Technological Features:",
          content: "The Digital Rupee uses blockchain-inspired technology to ensure instant settlement and high security, mimicking the features of physical cash but in digital form."
        }
      ],
      possible_question: {
        question: "What technology does the Digital Rupee pilot use?",
        answer: "Ans: Blockchain-inspired ledger technology."
      }
    }
  }
];


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 18 },
  },
};

const formatArticleDate = (date: Date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

// Right sidebar content
const CurrentAffairsRightSidebar = ({
  user,
  avatarUrl,
  initials,
  selectedDate,
  onSelectDate,
  isArticleSelected,
  onSelectArticle,
  articles,
}: {
  user: UserMe | null;
  avatarUrl: string;
  initials: string;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  isArticleSelected: boolean;
  onSelectArticle: (article: Article) => void;
  articles: Article[];
}) => {
  const navigate = useNavigate();
  const [savedNewsSearch, setSavedNewsSearch] = useState("");
  const [showAllSavedNews, setShowAllSavedNews] = useState(false);
  const [filterView, setFilterView] = useState<"options" | "months">("options");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Sync state when article selection changes
  useEffect(() => {
    if (isArticleSelected) {
      setShowAllSavedNews(false);
    }
  }, [isArticleSelected]);

  // articles prop now contains ONLY bookmarked articles fetched from the dedicated endpoint
  const filteredSavedNews = articles.filter(item => {
    // Search filter
    const matchesSearch = item.title.toLowerCase().includes(savedNewsSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(savedNewsSearch.toLowerCase());

    if (!matchesSearch) return false;

    // Date filter
    const articleDate = new Date(item.date);
    const today = new Date();

    if (activeFilter === "all") return true;

    if (activeFilter === "last-week") {
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      return articleDate >= lastWeek;
    }

    if (activeFilter === "this-month") {
      return articleDate.getMonth() === today.getMonth() &&
        articleDate.getFullYear() === today.getFullYear();
    }

    // Specific month/year filter: "Jan-2026"
    if (activeFilter.includes("-")) {
      const [monthStr, yearStr] = activeFilter.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const targetMonth = months.indexOf(monthStr);
      const targetYear = parseInt(yearStr);

      return articleDate.getMonth() === targetMonth &&
        articleDate.getFullYear() === targetYear;
    }

    return true;
  });

  const isFullView = isArticleSelected || showAllSavedNews;

  return (
    <div className="space-y-5">


      <AnimatePresence mode="wait">
        {!isFullView && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <QuizCalendar selectedDate={selectedDate} onSelectDate={onSelectDate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved News */}
      <motion.div layout className="bg-card rounded-xl border border-border/50 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AnimatePresence mode="popLayout">
              {showAllSavedNews && (
                <motion.button
                  key="back-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setShowAllSavedNews(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  title="Back"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
            <h3 className="text-base font-semibold text-foreground">Saved News</h3>
          </div>
          <AnimatePresence mode="popLayout">
            {!isFullView && (
              <motion.button
                key="view-all"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => setShowAllSavedNews(true)}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                View all <ChevronRight className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isFullView && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  placeholder="Search saved news..."
                  value={savedNewsSearch}
                  onChange={(e) => setSavedNewsSearch(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-secondary/50 border-border text-xs"
                />
              </div>
              <DropdownMenu onOpenChange={(open) => !open && setFilterView("options")}>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    "p-2.5 rounded-xl border border-border/50 transition-colors outline-none",
                    activeFilter !== "all" ? "bg-primary/10 text-primary border-primary/20" : "hover:bg-secondary text-foreground/70"
                  )}>
                    <SlidersHorizontal className="w-4 h-4" />
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
                          All Saved News                        </DropdownMenuItem>
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
                        <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, idx) => {
                            const now = new Date();
                            const isDisabled = (selectedYear > now.getFullYear()) || (selectedYear === now.getFullYear() && idx > now.getMonth());
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
            </motion.div>
          )}
        </AnimatePresence>

        {activeFilter !== "all" && (
          <div className="flex items-center justify-between px-1 mb-4">
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

        <motion.div layout className="space-y-3">
          {filteredSavedNews.length > 0 ? (
            filteredSavedNews.map((item, i) => (
              <motion.div
                layout
                key={item.id}
                whileHover={{ y: -2, boxShadow: "0 4px 12px -2px rgba(0,0,0,0.05)" }}
                onClick={() => onSelectArticle(item)}
                className="bg-white rounded-md border border-[#F1F5F9] p-4 shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xs font-semibold text-[#1E293B] leading-snug line-clamp-2 pr-4">
                    {item.title}
                  </h4>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-medium text-[#94A3B8]">
                    {item.date}
                  </span>
                  <span
                    className={cn(
                      "text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5",
                      categoryColors[item.category] || "text-slate-600 bg-slate-50 border-slate-100"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", categoryDotColors[item.category] || "bg-slate-400")} />
                    {categories.find(c => c.id === item.category)?.label || item.category}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p layout className="text-xs text-muted-foreground text-center py-4">No saved news found.</motion.p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

const CurrentAffairs = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);

  const isDesktop = useMediaQuery("(min-width: 1280px)");

  const handleDateChange = (date: Date) => {
    setLoading(true);
    setArticles([]);
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  const loadArticles = async (date: Date) => {
    try {
      setLoading(true);
      // Use YYYY-MM-DD format in local time to avoid timezone shifts
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const loadedArticles = await currentAffairsService.getArticles(dateStr);
      setArticles(loadedArticles);
    } catch (err) {
      console.error("Failed to load articles", err);
      if (date.toDateString() === new Date().toDateString()) {
        setArticles(mockArticles);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const saved = await currentAffairsService.getBookmarks();
      setBookmarkedArticles(saved);
    } catch (err) {
      console.error("Failed to load bookmarks", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const u = await authService.getCurrentUser();
        if (u) setUser(u);
      } catch (err) {
        console.error("Failed to load user", err);
      }
      loadBookmarks();
    };
    initData();
  }, []);

  useEffect(() => {
    loadArticles(selectedDate);
  }, [selectedDate]);

  const handleStartQuiz = async () => {
    try {
      setIsQuizLoading(true);
      setIsQuizOpen(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const mcqs = await currentAffairsService.getMCQs(dateStr);

      if (mcqs && mcqs.length > 0) {
        const formattedQuestions = mcqs.map((m: any) => ({
          id: m.id,
          question: m.question_text,
          options: [m.option_a, m.option_b, m.option_c, m.option_d],
          correctAnswer: ["A", "B", "C", "D"].indexOf(m.correct_option),
          explanation: m.explanation,
          subject: "Current Affairs",
          difficulty: "Medium"
        }));
        setQuizQuestions(formattedQuestions);
      } else {
        toast.info("No quiz available for the selected date.");
        setQuizQuestions([]);
      }
    } catch (err) {
      console.error("Failed to load quiz", err);
      toast.error("Error loading quiz questions");
    } finally {
      setIsQuizLoading(false);
    }
  };

  const userName = user?.full_name || user?.username || "Aspirant";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const avatarUrl = user?.photo_url
    ? (user.photo_url.startsWith('http') ? user.photo_url : `${BASE_URL}${user.photo_url}`)
    : pic;

  const filtered = articles.filter((a) => {
    const matchCategory =
      activeCategory === "all" || a.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );
    // Date filter - Backend already filters by date if dateStr is passed,
    // but we filter again here to be safe and handle mock/search data.
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedSelected = `${year}-${month}-${day}`;

    // a.date is now provided as the raw YYYY-MM-DD string from backend if used in comparison
    const matchDate = a.date_raw ? a.date_raw === formattedSelected : true;

    return matchCategory && matchSearch && matchDate;
  });

  const toggleBookmark = async (id: string) => {
    // Optimistic UI update
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, bookmarked: !a.bookmarked } : a))
    );
    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle(prev => prev ? { ...prev, bookmarked: !prev.bookmarked } : prev);
    }

    try {
      const isBookmarked = await currentAffairsService.toggleBookmark(id);
      loadBookmarks(); // Refresh the bookmarks list
      if (isBookmarked) {
        toast.success("News saved to bookmarks");
      } else {
        toast.success("News removed from bookmarks");
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
      // Revert optimism if failed
      toast.error("Failed to update bookmark status");
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, bookmarked: !a.bookmarked } : a))
      );
      if (selectedArticle && selectedArticle.id === id) {
        setSelectedArticle(prev => prev ? { ...prev, bookmarked: !prev.bookmarked } : prev);
      }
    }
  };

  return (
    <DashboardLayout
      hideHeader={isDesktop}
      rightSidebar={
        <CurrentAffairsRightSidebar
          user={user}
          avatarUrl={avatarUrl}
          initials={initials}
          selectedDate={selectedDate}
          onSelectDate={handleDateChange}
          isArticleSelected={!!selectedArticle}
          onSelectArticle={setSelectedArticle}
          articles={bookmarkedArticles}
        />
      }
    >
      <div className=" mx-auto px-4 md:px-0 space-y-5">
        {/* Page Header - Always Visible */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1e293b]">
              Current Affairs
            </h1>
            <p className="text-[12px] sm:text-sm text-[#64748B] mt-0.5 font-medium">
              TNPSC – Group II | {selectedDate.getFullYear()} • {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </div>
          {/* Search */}
          {!selectedArticle && (
            <div className="relative w-full md:w-80 lg:w-96 order-last md:order-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search news, topics...."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-[#F1F5F9] bg-white pl-11 pr-4 py-2.5 text-sm text-[#1e293b] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary/10 shadow-sm transition-all"
              />
            </div>
          )}
        </motion.div>

        {/* Daily Quiz Banner - Always Visible */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-r from-[#D2EDDD] to-[#F1F7D8] rounded-2xl p-4 sm:p-5 border border-[#FEF9C3] flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-sm flex-shrink-0">
            <img
              src={dailyQuizIcon}
              alt="Daily Quiz"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h3 className="font-semibold text-[#1e293b] text-base sm:text-[17px]">
              Daily Quiz Challenge
            </h3>
            <p className="text-[13px] text-[#64748B] mt-0.5 font-medium">
              Complete today's quiz ({formatArticleDate(selectedDate)}) to maintain your streak!
            </p>
          </div>
          <Button
            onClick={handleStartQuiz}
            className="w-full sm:w-auto rounded-xl font-semibold px-6 flex-shrink-0 bg-white text-[#1e293b] hover:bg-slate-50 shadow-sm transition-all border border-[#F1F5F9] text-sm h-11"
          >
            Start Quiz
          </Button>
        </motion.div>

        <div className="flex-1 w-full order-2 lg:order-1 lg:max-w-none">
          <AnimatePresence mode="wait">
            {selectedArticle ? (
              <motion.div
                key="article-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-6"
              >


                {/* Content Area */}
                <div className="bg-white rounded-3xl p-5 md:p-10 border border-[#F1F5F9] space-y-8 shadow-sm">
                  <div className="flex items-center justify-between px-1">
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="flex items-center gap-1.5 text-[#64748B] hover:text-primary transition-colors text-sm font-semibold"
                    >
                      <ChevronLeft className="w-4 h-4" />

                    </button>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleBookmark(selectedArticle.id)}
                        className="text-[#64748B] hover:text-primary transition-colors"
                      >
                        {selectedArticle.bookmarked ? (
                          <BookmarkCheck className="w-5 h-5 text-primary" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                      <button className="text-[#64748B] hover:text-primary transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-2xl md:text-3xl font-semibold text-[#1e293b] leading-tight">
                      {selectedArticle.title}
                    </h1>
                    <p className="text-base md:text-lg text-[#475569] leading-relaxed">
                      {selectedArticle.summary}
                    </p>
                    <div className="flex items-center gap-2 pt-1 pb-2">
                      <span
                        className={cn(
                          "text-[11px] uppercase tracking-wider font-semibold px-4 py-2 rounded-full",
                          categoryColors[selectedArticle.category] || "text-emerald-600 bg-emerald-50 border-emerald-100"
                        )}
                      >
                        • {categories.find(c => c.id === selectedArticle.category)?.label || "Tamil Nadu"}
                      </span>
                    </div>
                  </div>

                  {selectedArticle.full_content && (
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <h2 className="text-base font-semibold text-[#1e293b]">
                          In-Depth Explanation:
                        </h2>
                        <p className="text-sm sm:text-base text-[#334155] leading-[1.8]">
                          {/* Simple helper for bolding text based on ** markers */}
                          {selectedArticle.full_content.introduction.split(/(\*\*.*?\*\*)/).map((part, i) =>
                            part.startsWith('**') && part.endsWith('**') ?
                              <strong key={i}>{part.slice(2, -2)}</strong> : part
                          )}
                        </p>
                      </div>

                      {selectedArticle.full_content.sections.map((section, idx) => (
                        <div key={idx} className="space-y-4 pt-2">
                          <h2 className="text-base font-semibold text-[#1e293b]">
                            {section.title}
                          </h2>
                          {section.is_list ? (
                            <ul className="space-y-2 pl-1">
                              {section.list_items?.map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm sm:text-base text-[#334155] leading-relaxed">
                                  <span className="text-[#94A3B8] text-lg leading-none mt-0.5">•</span>
                                  <span>
                                    {item.split(/(\*\*.*?\*\*)/).map((part, k) =>
                                      part.startsWith('**') && part.endsWith('**') ?
                                        <strong key={k}>{part.slice(2, -2)}</strong> : part
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm sm:text-base text-[#334155] leading-[1.8]">
                              {section.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                                part.startsWith('**') && part.endsWith('**') ?
                                  <strong key={i}>{part.slice(2, -2)}</strong> : part
                              )}
                            </p>
                          )}
                        </div>
                      ))}

                      {/* Possible Question Box */}
                      <div className="bg-[#F0F9FF] rounded-2xl p-5 sm:p-7 border border-[#E0F2FE] space-y-4 mt-12">
                        <div className="flex items-center gap-2.5 text-[#0284C7]">
                          <div className="p-1.5 bg-white rounded-lg border border-[#E0F2FE]">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <span className="text-[15px] font-semibold">Possible Question</span>
                        </div>
                        <div className="space-y-2.5">
                          <p className="text-[15px] sm:text-base font-semibold text-[#1e293b] leading-snug">
                            {selectedArticle.full_content.possible_question.question}
                          </p>
                          <p className="text-[14px] sm:text-[15px] font-medium text-[#64748B]">
                            {selectedArticle.full_content.possible_question.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="article-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                {/* Content Card */}
                <div className="bg-white rounded-3xl border border-[#F1F5F9] p-5 sm:p-7 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">
                  {/* Category Tabs + Sort */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between gap-4 border-b border-[#F1F5F9] -mx-5 px-5 sm:-mx-7 sm:px-7 mb-6"
                  >
                    {/* Tabs - Hidden on mobile, visible on sm+ */}
                    <div className="hidden sm:flex gap-6 overflow-x-auto pb-0 scrollbar-none">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={cn(
                            "relative py-3.5 text-sm font-semibold transition-colors whitespace-nowrap px-1",
                            activeCategory === cat.id
                              ? "text-primary"
                              : "text-[#64748B] hover:text-[#1e293b]"
                          )}
                        >
                          {cat.label}
                          {activeCategory === cat.id && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent rounded-t-full"
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Calendar Filter - Mobile Only */}
                    <div className="flex sm:hidden items-center justify-between w-full py-2">
                      <h2 className="text-base font-semibold text-[#1e293b]">
                        {selectedDate.toDateString() === new Date().toDateString() ? "Today's Updates" : formatArticleDate(selectedDate)}
                      </h2>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <button className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-all bg-[#F8FAFC] border border-[#F1F5F9] px-3.5 py-1.5 rounded-lg whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Calendar</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-auto p-0 border-none shadow-xl rounded-3xl overflow-hidden">
                          <div className="bg-white p-2">
                            <QuizCalendar
                              selectedDate={selectedDate}
                              onSelectDate={handleDateChange}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Desktop Sort Button */}
                    <button className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-all bg-[#F8FAFC] border border-[#F1F5F9] px-3.5 py-1.5 rounded-lg mb-1 whitespace-nowrap">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Sort by</span>
                    </button>
                  </motion.div>

                  {/* Today's Updates Header */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="mb-4"
                  >
                    <h2 className="text-base sm:text-lg font-semibold text-[#1e293b] hidden sm:block">
                      {selectedDate.toDateString() === new Date().toDateString() ? "Today's Updates" : `${formatArticleDate(selectedDate)} Updates`}
                    </h2>
                  </motion.div>

                  {/* Articles List */}
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm font-medium text-[#64748B]">Fetching latest updates...</p>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      <AnimatePresence mode="popLayout">
                        {filtered.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 text-[#94A3B8]"
                          >
                            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-semibold">No articles found</p>
                            <p className="text-sm mt-1">
                              Try a different category or search term
                            </p>
                          </motion.div>
                        ) : (
                          filtered.map((article) => (
                            <motion.div
                              key={article.id}

                              layout
                              onClick={() => setSelectedArticle(article)}
                              className="flex items-start gap-4 sm:gap-5 py-4 px-3 -mx-3 cursor-pointer group hover:bg-slate-50 transition-all rounded-2xl border border-transparent hover:border-slate-100"
                            >
                              {/* Category Icon - Clean rounded square */}
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:bg-white transition-colors">
                                <img
                                  src={categoryIcons[article.category] || internationalIcon}
                                  alt={article.category}
                                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <h3 className="font-semibold text-[#1e293b] group-hover:text-primary transition-colors text-base sm:text-[17px] leading-tight mb-1.5">
                                    {article.title}
                                  </h3>
                                  <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-primary transition-all duration-300 mt-1 flex-shrink-0" />
                                </div>
                                <p className="text-[13px] sm:text-[14px] text-[#64748B] line-clamp-2 leading-relaxed mb-3">
                                  {article.summary}
                                </p>

                                <div className="flex items-center gap-3 flex-wrap">
                                  {/* Category Tag */}
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "text-[8px] sm:text-[11px] font-semibold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border flex items-center gap-1.5 transition-colors",
                                        categoryColors[article.category] || "text-[#64748B] bg-slate-50 border-slate-100"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          categoryDotColors[article.category] || "bg-[#94A3B8]"
                                        )}
                                      />
                                      {categories.find((c) => c.id === article.category)?.label || article.category}
                                    </span>
                                    {article.important && (
                                      <span className="text-[8px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full border border-blue-100 bg-blue-50 text-blue-600 flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        High Impact
                                      </span>
                                    )}
                                    {/* Bookmark Action */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBookmark(article.id);
                                      }}
                                      className="p-1 rounded-md hover:bg-white border border-transparent hover:border-slate-100 transition-colors"
                                    >
                                      {article.bookmarked ? (
                                        <BookmarkCheck className="w-4 h-4 text-primary" />
                                      ) : (
                                        <Bookmark className="w-4 h-4 text-[#94A3B8]" />
                                      )}
                                    </button>
                                  </div>


                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <DailyQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        title={`Daily Quiz - ${formatArticleDate(selectedDate)}`}
        subtitle="Test your knowledge on today's current affairs"
        questions={quizQuestions}
        isLoading={isQuizLoading}
      />
    </DashboardLayout>
  );
};

export default CurrentAffairs;
