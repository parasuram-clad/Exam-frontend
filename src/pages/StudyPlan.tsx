import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout";
import {
  StreakWidget,
  LeaderboardWidget,
  ScheduleWidget,
} from "@/components/dashboard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, Lock, BookOpen, ClipboardList, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Import local assets
import studyPlan1 from "@/assets/study-plan1.png";
import studyPlan2 from "@/assets/study-plan2.png";
import studyPlan3 from "@/assets/study-plan3.png";
import studyPlan4 from "@/assets/study-plan4.png";

interface DayCycleItem {
  day: number;
  status: "completed" | "current" | "locked" | "assessment";
  label: string;
}

const dayCycle: DayCycleItem[] = [
  { day: 1, status: "completed", label: "Day 1" },
  { day: 2, status: "completed", label: "Day 2" },
  { day: 3, status: "current", label: "Day 3" },
  { day: 4, status: "locked", label: "Day 4" },
  { day: 5, status: "locked", label: "Day 5" },
  { day: 6, status: "locked", label: "Day 6" },
  { day: 7, status: "assessment", label: "Week 1 Assessment" },
  { day: 8, status: "locked", label: "Day 8" },
  { day: 9, status: "locked", label: "Day 9" },
  { day: 10, status: "locked", label: "Day 10" },
  { day: 11, status: "locked", label: "Day 11" },
  { day: 12, status: "locked", label: "Day 12" },
  { day: 13, status: "locked", label: "Day 13" },
  { day: 14, status: "assessment", label: "Week 2 Assessment" },
];

interface Subtopic {
  id: string;
  name: string;
  description: string;
  timeSpent: number; // in minutes
  totalTime: number; // in minutes
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

// Day-wise study plan mapping
const dayWiseStudyPlans: Record<number, StudyTopicCard[]> = {
  1: [
    {
      id: "tamil-nadu-history",
      image: studyPlan1,
      title: "Tamil Nadu History",
      topicCount: 2,
      progress: 100,
      topics: [
        { name: "Ancient Tamil Kingdoms", color: "bg-[#7C79EC]" },
        { name: "Sangam Literature", color: "bg-[#7C79EC]" }
      ],
      subtopics: [
        {
          id: "ancient-kingdoms",
          name: "Ancient Tamil Kingdoms",
          description: "Study the early Tamil kingdoms, their political structure, and cultural contributions to South Indian civilization.",
          timeSpent: 45,
          totalTime: 45,
          status: "completed"
        },
        {
          id: "sangam-literature",
          name: "Sangam Literature",
          description: "Explore the rich literary tradition of the Sangam period and its historical significance.",
          timeSpent: 40,
          totalTime: 40,
          status: "completed"
        }
      ],
    },
    {
      id: "indian-economy",
      image: studyPlan4,
      title: "Indian Economy",
      topicCount: 2,
      progress: 100,
      topics: [
        { name: "Economic Planning", color: "bg-[#34C759]" },
        { name: "Five Year Plans", color: "bg-[#34C759]" }
      ],
      subtopics: [
        {
          id: "economic-planning",
          name: "Economic Planning",
          description: "Understand the framework and objectives of economic planning in India since independence.",
          timeSpent: 50,
          totalTime: 50,
          status: "completed"
        },
        {
          id: "five-year-plans",
          name: "Five Year Plans",
          description: "Review the evolution and key features of India's Five Year Plans and their impact on development.",
          timeSpent: 35,
          totalTime: 35,
          status: "completed"
        }
      ],
    },
  ],
  2: [
    {
      id: "tamil-nadu-geography",
      image: studyPlan2,
      title: "Tamil Nadu Geography",
      topicCount: 2,
      progress: 100,
      topics: [
        { name: "Rivers and Water Bodies", color: "bg-[#34C759]" },
        { name: "Mountain Ranges", color: "bg-[#34C759]" }
      ],
      subtopics: [
        {
          id: "rivers-water",
          name: "Rivers and Water Bodies",
          description: "Study the major rivers, lakes, and coastal features of Tamil Nadu and their economic importance.",
          timeSpent: 40,
          totalTime: 40,
          status: "completed"
        },
        {
          id: "mountains",
          name: "Mountain Ranges",
          description: "Explore the Western Ghats, Eastern Ghats, and other hill ranges in Tamil Nadu.",
          timeSpent: 35,
          totalTime: 35,
          status: "completed"
        }
      ],
    },
    {
      id: "general-science",
      image: studyPlan3,
      title: "General Science",
      topicCount: 2,
      progress: 100,
      topics: [
        { name: "Physics Basics", color: "bg-[#FF3B30]" },
        { name: "Chemistry Fundamentals", color: "bg-[#FF3B30]" }
      ],
      subtopics: [
        {
          id: "physics-basics",
          name: "Physics Basics",
          description: "Review fundamental concepts in physics including motion, energy, and force.",
          timeSpent: 45,
          totalTime: 45,
          status: "completed"
        },
        {
          id: "chemistry-fundamentals",
          name: "Chemistry Fundamentals",
          description: "Study basic chemistry concepts including atomic structure and chemical reactions.",
          timeSpent: 40,
          totalTime: 40,
          status: "completed"
        }
      ],
    },
  ],
  3: [
    {
      id: "tamil-nadu-history",
      image: studyPlan1,
      title: "Tamil Nadu History",
      topicCount: 2,
      progress: 40,
      topics: [
        { name: "Sangam Period", color: "bg-[#7C79EC]" },
        { name: "Medieval Kingdoms", color: "bg-[#7C79EC]" }
      ],
      subtopics: [
        {
          id: "sangam-period",
          name: "Sangam Period",
          description: "Learn about early Tamil society, culture, and political structure through Sangam literature and historical sources, with focus on key events and contributions.",
          timeSpent: 20,
          totalTime: 45,
          status: "continue"
        },
        {
          id: "medieval-kingdoms",
          name: "Medieval Kingdoms",
          description: "Study the rise of major Tamil dynasties, their administration, economy, and cultural contributions, with emphasis on Cholas, Pandyas, and Pallavas.",
          timeSpent: 0,
          totalTime: 35,
          status: "start"
        }
      ],
    },
    {
      id: "tamil-nadu-geography",
      image: studyPlan2,
      title: "Tamil Nadu Geography",
      topicCount: 2,
      progress: 75,
      topics: [
        { name: "Physical Features", color: "bg-[#34C759]" },
        { name: "Climate & Rainfall", color: "bg-[#34C759]" }
      ],
      subtopics: [
        {
          id: "physical-features",
          name: "Physical Features",
          description: "Explore the physical geography of Tamil Nadu including rivers, mountains, plateaus, and coastal features that shape the region.",
          timeSpent: 35,
          totalTime: 40,
          status: "continue"
        },
        {
          id: "climate-rainfall",
          name: "Climate & Rainfall",
          description: "Understand the climatic patterns, monsoon systems, and rainfall distribution across different regions of Tamil Nadu.",
          timeSpent: 25,
          totalTime: 30,
          status: "continue"
        }
      ],
    },
    {
      id: "indian-polity",
      image: studyPlan3,
      title: "Indian Polity",
      topicCount: 2,
      progress: 0,
      topics: [
        { name: "Constitutional Framework", color: "bg-[#FF3B30]" },
        { name: "Fundamental Rights", color: "bg-[#FF3B30]" }
      ],
      subtopics: [
        {
          id: "constitutional-framework",
          name: "Constitutional Framework",
          description: "Examine the basic structure and key features of the Indian Constitution, including its making and fundamental principles.",
          timeSpent: 0,
          totalTime: 50,
          status: "start"
        },
        {
          id: "fundamental-rights",
          name: "Fundamental Rights",
          description: "Study the fundamental rights guaranteed by the Constitution, their significance, and the constitutional provisions protecting them.",
          timeSpent: 0,
          totalTime: 40,
          status: "start"
        }
      ],
    },
  ],
  4: [
    {
      id: "indian-polity",
      image: studyPlan3,
      title: "Indian Polity",
      topicCount: 2,
      progress: 0,
      topics: [
        { name: "Union Government", color: "bg-[#FF3B30]" },
        { name: "State Government", color: "bg-[#FF3B30]" }
      ],
      subtopics: [
        {
          id: "union-government",
          name: "Union Government",
          description: "Study the structure and functions of the Union Government including Parliament, President, and Council of Ministers.",
          timeSpent: 0,
          totalTime: 55,
          status: "start"
        },
        {
          id: "state-government",
          name: "State Government",
          description: "Learn about the state government structure, powers, and relationship with the Union Government.",
          timeSpent: 0,
          totalTime: 45,
          status: "start"
        }
      ],
    },
    {
      id: "current-affairs",
      image: studyPlan4,
      title: "Current Affairs",
      topicCount: 2,
      progress: 0,
      topics: [
        { name: "National Events", color: "bg-[#7C79EC]" },
        { name: "International Relations", color: "bg-[#7C79EC]" }
      ],
      subtopics: [
        {
          id: "national-events",
          name: "National Events",
          description: "Review recent national developments, government policies, and important events in India.",
          timeSpent: 0,
          totalTime: 40,
          status: "start"
        },
        {
          id: "international-relations",
          name: "International Relations",
          description: "Study India's foreign policy, bilateral relations, and participation in international organizations.",
          timeSpent: 0,
          totalTime: 35,
          status: "start"
        }
      ],
    },
  ],
  5: [
    {
      id: "tamil-culture",
      image: studyPlan1,
      title: "Tamil Culture & Heritage",
      topicCount: 2,
      progress: 0,
      topics: [
        { name: "Art Forms", color: "bg-[#7C79EC]" },
        { name: "Festivals", color: "bg-[#7C79EC]" }
      ],
      subtopics: [
        {
          id: "art-forms",
          name: "Classical Art Forms",
          description: "Study the history and significance of Bharatanatyam and other classical arts.",
          timeSpent: 0,
          totalTime: 40,
          status: "start"
        },
        {
          id: "festivals",
          name: "Traditional Festivals",
          description: "Understand the cultural roots of harvest and seasonal festivals in Tamil Nadu.",
          timeSpent: 0,
          totalTime: 30,
          status: "start"
        }
      ],
    },
  ],
  6: [
    {
      id: "ethics",
      image: studyPlan4,
      title: "Ethics & Aptitude",
      topicCount: 2,
      progress: 0,
      topics: [
        { name: "Human values", color: "bg-[#34C759]" },
        { name: "Public Service", color: "bg-[#34C759]" }
      ],
      subtopics: [
        {
          id: "human-values",
          name: "Human Values",
          description: "Lessons from the lives and teachings of great leaders and reformers.",
          timeSpent: 0,
          totalTime: 50,
          status: "start"
        },
        {
          id: "public-service",
          name: "Public Service Values",
          description: "Essential values for civil services and foundational ethics.",
          timeSpent: 0,
          totalTime: 40,
          status: "start"
        }
      ],
    },
  ],
  7: [
    {
      id: "assessment-day",
      image: studyPlan1,
      title: "Week 1 Assessment",
      topicCount: 1,
      progress: 0,
      topics: [
        { name: "Weekly Assessment Test", color: "bg-[#FF9500]" }
      ],
      subtopics: [
        {
          id: "week-test",
          name: "Week 1 Assessment Test",
          description: "Comprehensive test covering all topics studied in this 7-day cycle. This will evaluate your understanding and retention of the week's material.",
          timeSpent: 0,
          totalTime: 90,
          status: "start"
        }
      ],
    },
  ],
  8: [
    {
      id: "indian-history",
      image: studyPlan1,
      title: "Indian National Movement",
      topicCount: 2,
      progress: 0,
      topics: [
        { name: "Early Uprisings", color: "bg-[#7C79EC]" },
        { name: "1857 Revolt", color: "bg-[#7C79EC]" }
      ],
      subtopics: [
        {
          id: "early-uprisings",
          name: "Early Uprisings",
          description: "Study the local uprisings against British rule before 1857.",
          timeSpent: 0,
          totalTime: 45,
          status: "start"
        },
        {
          id: "revolt-1857",
          name: "1857 Revolt",
          description: "Causes, course, and impact of the Great Revolt of 1857.",
          timeSpent: 0,
          totalTime: 60,
          status: "start"
        }
      ],
    },
  ],
  9: [
    {
      id: "geography-india",
      image: studyPlan2,
      title: "Physical Geography of India",
      topicCount: 2,
      progress: 0,
      topics: [
        { name: "Himalayas", color: "bg-[#34C759]" },
        { name: "Indo-Gangetic Plains", color: "bg-[#34C759]" }
      ],
      subtopics: [
        {
          id: "himalayas",
          name: "The Himalayas",
          description: "Formation and division of the Himalayan mountain range.",
          timeSpent: 0,
          totalTime: 50,
          status: "start"
        },
        {
          id: "gangetic-plains",
          name: "Indo-Gangetic Plains",
          description: "Geological features and importance of the great plains.",
          timeSpent: 0,
          totalTime: 45,
          status: "start"
        }
      ],
    },
  ],
  10: [
    {
      id: "science-tech",
      image: studyPlan3,
      title: "Science & Technology",
      topicCount: 2,
      progress: 0,
      topics: [
        { name: "Space Research", color: "bg-[#FF3B30]" },
        { name: "Defense Tech", color: "bg-[#FF3B30]" }
      ],
      subtopics: [
        {
          id: "space-research",
          name: "Indian Space Program",
          description: "Overview of ISRO's milestones and upcoming missions.",
          timeSpent: 0,
          totalTime: 60,
          status: "start"
        },
        {
          id: "defense-tech",
          name: "Defense Technology",
          description: "Study of India's missile systems and self-reliance in defense.",
          timeSpent: 0,
          totalTime: 45,
          status: "start"
        }
      ],
    },
  ],
  11: [
    {
      id: "environment",
      image: studyPlan2,
      title: "Environment & Ecology",
      topicCount: 2,
      progress: 0,
      topics: [
        { name: "Biodiversity", color: "bg-[#34C759]" },
        { name: "Climate Change", color: "bg-[#34C759]" }
      ],
      subtopics: [
        {
          id: "biodiversity",
          name: "Biodiversity Conservation",
          description: "National parks, wildlife sanctuaries, and endangered species.",
          timeSpent: 0,
          totalTime: 55,
          status: "start"
        },
        {
          id: "climate-change",
          name: "Climate Change Impact",
          description: "Global warming, pollution, and mitigation strategies.",
          timeSpent: 0,
          totalTime: 50,
          status: "start"
        }
      ],
    },
  ],
  12: [
    {
      id: "history-part-2",
      image: studyPlan1,
      title: "Indian National Movement II",
      topicCount: 2,
      progress: 0,
      topics: [
        { name: "Gandhian Era", color: "bg-[#7C79EC]" },
        { name: "Independence", color: "bg-[#7C79EC]" }
      ],
      subtopics: [
        {
          id: "gandhian-era",
          name: "The Gandhian Phase",
          description: "Major movements led by Mahatma Gandhi from 1915 to 1947.",
          timeSpent: 0,
          totalTime: 70,
          status: "start"
        },
        {
          id: "independence-act",
          name: "Indian Independence Act",
          description: "Constitutional developments leading to partition and freedom.",
          timeSpent: 0,
          totalTime: 45,
          status: "start"
        }
      ],
    },
  ],
  13: [
    {
      id: "current-affairs-ii",
      image: studyPlan4,
      title: "Monthly Current Affairs",
      topicCount: 2,
      progress: 0,
      topics: [
        { name: "Economic News", color: "bg-[#34C759]" },
        { name: "Awards & Persons", color: "bg-[#34C759]" }
      ],
      subtopics: [
        {
          id: "economic-news",
          name: "Economic Developments",
          description: "RBI policies, budget highlights, and economic indicators.",
          timeSpent: 0,
          totalTime: 50,
          status: "start"
        },
        {
          id: "awards",
          name: "Awards and Recognition",
          description: "International and national awards in literature, science, and arts.",
          timeSpent: 0,
          totalTime: 35,
          status: "start"
        }
      ],
    },
  ],
  14: [
    {
      id: "assessment-day-2",
      image: studyPlan3,
      title: "Week 2 Assessment",
      topicCount: 1,
      progress: 0,
      topics: [
        { name: "Full Syllabus Mock", color: "bg-[#FF9500]" }
      ],
      subtopics: [
        {
          id: "week-2-test",
          name: "Week 2 Assessment Test",
          description: "Comprehensive test covering all topics studied in the first 14 days. This will evaluate your progress across weeks 1 and 2.",
          timeSpent: 0,
          totalTime: 120,
          status: "start"
        }
      ],
    },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const CircularProgress = ({ progress, color = "stroke-primary" }: { progress: number; color?: string }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          fill="transparent"
          className="text-muted/10"
        />
        <motion.circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <span className="absolute text-[10px]">{progress}%</span>
    </div>
  );
};

const StudyPlan = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<StudyTopicCard | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(3); // Default to current day (Day 3)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Get study topics for the active day
  const currentStudyTopics = dayWiseStudyPlans[activeDay] || [];

  const handleDayClick = (day: DayCycleItem) => {
    if (day.status !== "locked") {
      setActiveDay(day.day);
    }
  };

  const handleViewDetails = (topic: StudyTopicCard) => {
    setSelectedTopic(topic);
    setIsDialogOpen(true);
  };

  const handleSubtopicClick = (topicId: string, subtopicId: string) => {
    setIsDialogOpen(false);
    navigate(`/study-plan/topic/${topicId}/subtopic/${subtopicId}`);
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Progress Overview Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[24px] p-4 border border-[#F2F2F7] shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-6 md:gap-4 mb-4">
            <div className="space-y-1.5 min-w-[120px]">
              <p className="text-[13px] text-[#8E8E93] font-medium">Day</p>
              <p className="text-[22px] font-bold text-[#1C1C1E]">3 of 180</p>
            </div>
            <div className="space-y-1.5 min-w-[120px]">
              <p className="text-[13px] text-[#8E8E93] font-medium">Current Week</p>
              <p className="text-[22px] font-bold text-[#1C1C1E]">Day 3 of 7</p>
            </div>
            <div className="space-y-1.5 min-w-[120px]">
              <p className="text-[13px] text-[#8E8E93] font-medium">Subjects Today</p>
              <p className="text-[22px] font-bold text-[#1C1C1E]">3</p>
            </div>
            <div className="space-y-1.5 min-w-[120px]">
              <p className="text-[13px] text-[#8E8E93] font-medium">Assessment</p>
              <p className="text-[22px] font-bold text-[#1C1C1E]">Day 7</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[13px] text-[#8E8E93] font-semibold">Overall Progress</span>
              <span className="text-[14px] text-[#1C1C1E]">30%</span>
            </div>
            <div className="h-[7px] w-full bg-[#E5E5EA] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#1D1E2C] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '30%' }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* 14-Day Cycle Schedule */}
        <motion.section variants={itemVariants} className="relative group">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-[18px] md:text-xl font-bold text-slate-800">Study Schedule</h2>
            <div className="hidden md:flex gap-1">
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tighter font-bold">Scroll for More</span>
            </div>
          </div>

          <div className="relative px-2">
            {/* Desktop Navigation Arrows - Centered vertially with icons */}
            <div className="hidden sm:block absolute left-0 top-9 -translate-y-1/2 -ml-3 z-30">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-all duration-300"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
              </button>
            </div>

            <div className="hidden sm:block absolute right-0 top-9 -translate-y-1/2 -mr-3 z-30">
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-all duration-300"
                aria-label="Scroll Right"
              >
                <ChevronRight className="h-8 w-8" strokeWidth={2.5} />
              </button>
            </div>

            <div
              ref={scrollContainerRef}
              className="flex items-start gap-0 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth px-4 md:px-10"
            >
              {dayCycle.map((item, index) => (
                <div key={index} className="flex items-start shrink-0">
                  <div className="flex flex-col items-center w-14 shrink-0">
                    <motion.div
                      whileHover={item.status !== "locked" ? { scale: 1.1, y: -2 } : {}}
                      whileTap={item.status !== "locked" ? { scale: 0.95 } : {}}
                      onClick={() => item.status !== "locked" && handleDayClick(item)}
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm relative z-10 cursor-pointer ",
                        item.status === "completed" && "bg-[#1D1E2C] text-white",
                        item.status === "current" && "bg-accent text-accent-foreground shadow-md ring-2 ring-accent/20",
                        item.status === "locked" && "bg-[#F2F2F7] text-slate-300 cursor-not-allowed",
                        item.status === "assessment" && "bg-white border-2 border-slate-200 text-slate-400 font-bold",
                        activeDay === item.day && item.status !== "locked" && "ring-4 ring-accent/30 scale-105 shadow-xl border-accent"
                      )}
                    >
                      {item.status === "completed" && <Check className="w-6 h-6" strokeWidth={3} />}
                      {item.status === "current" && <BookOpen className="w-6 h-6" />}
                      {item.status === "locked" && <Lock className="w-5 h-5" />}
                      {item.status === "assessment" && <ClipboardList className="w-6 h-6" />}
                    </motion.div>
                    <div className="w-[100px] mt-3 flex justify-center">
                      <span className={cn(
                        "text-[10px] md:text-[11px] uppercase tracking-wider font-semibold text-center leading-tight",
                        item.status === "locked" ? "text-slate-300" : "text-slate-600",
                        activeDay === item.day && "text-blue-600 font-bold"
                      )}>
                        {item.label}
                      </span>
                    </div>
                  </div>

                  {index < dayCycle.length - 1 && (
                    <div className="w-12 md:w-16 h-14 flex items-center justify-center shrink-0 -mx-[1px]">
                      <div className="w-full h-[2px] border-t-2 border-dashed border-slate-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Today's Study Plan */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-[18px] font-bold text-[#1C1C1E]">
                {activeDay === 3 ? "Today's Study Plan" : `Day ${activeDay} Study Plan`}
              </h2>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                {dayCycle.find(d => d.day === activeDay)?.status === "completed" ? "✓ Completed" :
                  dayCycle.find(d => d.day === activeDay)?.status === "current" ? "Active" :
                    dayCycle.find(d => d.day === activeDay)?.status === "assessment" ? "Assessment" : "Upcoming"}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              {currentStudyTopics.length} {currentStudyTopics.length === 1 ? 'Subject' : 'Subjects'}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentStudyTopics.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                  <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-600 mb-1">No Schedule Today</h3>
                  <p className="text-sm text-slate-400 max-w-[200px]">
                    Rest or catch up on previous Day {activeDay} topics.
                  </p>
                </div>
              ) : (
                currentStudyTopics.map((topic, index) => (
                  <motion.div
                    key={index}
                    // variants={itemVariants}
                    // whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    onClick={() => handleViewDetails(topic)}
                    className="bg-white rounded-lg overflow-hidden border border-[#F2F2F7] shadow-sm flex flex-col hover:shadow-2xl hover:border-blue-100 transition-all duration-300 cursor-pointer"
                  >
                    <div className="p-6 flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex gap-4">
                          <div className="w-[52px] h-[52px] bg-[#F2F2F7] rounded-[14px] flex items-center justify-center overflow-hidden">
                            <img src={topic.image} alt={topic.title} className="w-[32px] h-[32px] object-contain opacity-80" />
                          </div>
                          <div>
                            <h3 className="text-[#1C1C1E] text-[15px] leading-tight mb-1">{topic.title}</h3>
                            <p className="text-[12px] text-[#8E8E93]">{topic.topicCount} Topics</p>
                          </div>
                        </div>
                        <CircularProgress
                          progress={topic.progress}
                          color={topic.progress > 50 ? "text-[#34C759]" : topic.progress > 0 ? "text-accent" : "text-[#FF453A]"}
                        />
                      </div>

                      {/* Topics List */}
                      <ul className="space-y-1 mb-1">
                        {topic.topics.map((t, i) => (
                          <li key={i} className="flex items-center gap-3 text-[12px] text-[#3A3A3C] font-semibold">
                            <div className={cn("w-[6px] h-[6px] rounded-full shrink-0", t.color)} />
                            {t.name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action */}
                    <div className="px-6 pb-6">
                      <Button
                        className="w-full h-[48px] bg-[#11131B] hover:bg-[#1D1F29] text-white rounded-[16px] text-[14px] shadow-sm transition-all active:scale-[0.98]"
                        onClick={() => handleViewDetails(topic)}
                      >
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </motion.section>
      </motion.div>

      {/* Study Topic Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto scroll-thin p-0 bg-[#F5F5F7] rounded-[32px] sm:rounded-[40px]">
          {selectedTopic && (
            <div className="p-5 sm:p-8">
              {/* Header with Back Button */}
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#1C1C1E]" />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C1C1E] line-clamp-1">{selectedTopic.title}</h2>
              </div>

              {/* Topic Illustration */}
              <div className="flex justify-center mb-12">
                <div className="w-full max-w-md h-48 flex items-center justify-center">
                  <img
                    src={selectedTopic.image}
                    alt={selectedTopic.title}
                    className="w-full h-full object-contain opacity-30"
                  />
                </div>
              </div>

              {/* Subtopics */}
              <div className="space-y-6">
                {selectedTopic.subtopics.map((subtopic, index) => (
                  <div
                    key={subtopic.id}
                    className="bg-[#2C3142] rounded-[24px] overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Subtopic Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-white text-lg font-bold mb-2">
                            {subtopic.name}
                          </h3>
                          <p className="text-white/70 text-sm leading-relaxed">
                            {subtopic.description}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleSubtopicClick(selectedTopic.id, subtopic.id)}
                          className="bg-white hover:bg-white/90 text-[#2C3142] px-6 rounded-xl font-semibold shrink-0"
                        >
                          {subtopic.status === "continue" ? "Continue" : "Start Now"}
                        </Button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between text-white/90 text-sm mb-2">
                          <span className="font-semibold">Time Spent</span>
                          <span className="font-bold">
                            {subtopic.timeSpent}m / {subtopic.totalTime}m
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{
                              width: `${(subtopic.timeSpent / subtopic.totalTime) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default StudyPlan;
