import studyPlan1 from "@/assets/study-plan1.png";
import studyPlan2 from "@/assets/study-plan2.png";
import studyPlan3 from "@/assets/study-plan3.png";
import studyPlan4 from "@/assets/study-plan4.png";
import historyIcon from "@/assets/dashboard/history-icon.png";
import economyIcon from "@/assets/dashboard/economy-icon.png";

export interface Subtopic {
  id: string;
  name: string;
  description: string;
  timeSpent: number;
  totalTime: number;
  status: "continue" | "start" | "completed";
  isTest?: boolean;
  weeklyTestId?: number;
  weekNo?: number;
}

export interface StudyTopicCardData {
  id: string;
  image: string;
  title: string;
  topicCount: number;
  progress: number;
  topics: { name: string; color: string }[];
  subtopics: Subtopic[];
  type?: 'TEST' | 'REVISION' | 'TOPIC';
}

export const EXAM_SUB_DIVISIONS: Record<string, string[]> = {
  "TNPSC": ["Group I", "Group II", "Group IIA", "Group IV"],
  "TNTET": ["TET Paper I", "TET Paper II", "PG TET"],
  "TNUSRB": ["SI/SO", "PC/Fireman"]
};

export const getSubjectIconFallback = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes("history") || s.includes("kural")) return studyPlan1;
  if (s.includes("geography") || s.includes("admin")) return studyPlan2;
  if (s.includes("science") || s.includes("polity")) return studyPlan3;
  return studyPlan4;
};

export const dayCycleRotation: Record<number, StudyTopicCardData[]> = {
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

export const areasToImproveStatic = [
  { id: 1, title: "Indian Constitution", subtitle: "Repeated Mistakes", accuracy: 42, icon: historyIcon },
  { id: 2, title: "Profit & Loss", subtitle: "Time Taking", accuracy: 55, icon: economyIcon },
  { id: 3, title: "Mughal Empire", subtitle: "Low Accuracy", accuracy: 38, icon: historyIcon },
];

export const dayCycleStatic = [
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
