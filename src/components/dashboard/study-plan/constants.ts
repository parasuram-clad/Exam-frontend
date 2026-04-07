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
  testType?: "WEEKLY" | "MONTHLY";
  weeklyTestId?: number;
  weekNo?: number;
  monthNo?: number;
  planRowId?: number;
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
  status?: 'completed' | 'in-progress' | 'start';
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

export const dayCycleRotation: Record<number, StudyTopicCardData[]> = {};
export const areasToImproveStatic: any[] = [];
export const dayCycleStatic: any[] = [];
