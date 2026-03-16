import { motion } from "framer-motion";
import { BookOpen, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StudyCircularProgress } from "./StudyCircularProgress";
import { StudyTopicCardData as StudyTopicCardType, getSubjectIconFallback } from "./constants";
import { format } from "date-fns";

interface StudyTopicCardProps {
  topic: StudyTopicCardType;
  index: number;
  activeDay: number;
  currentProgressDay: number;
  roadmapData: any;
  userPlans: any[];
  user: any;
  handleViewDetails: (topic: StudyTopicCardType) => void;
  prefetchTopic: (queryClient: any, id: number | string, userId: number) => void;
  queryClient: any;
}

export const StudyTopicCard = ({
  topic,
  index,
  activeDay,
  currentProgressDay,
  roadmapData,
  userPlans,
  user,
  handleViewDetails,
  prefetchTopic,
  queryClient
}: StudyTopicCardProps) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const roadmapDay = roadmapData?.plan?.find((p: any) => p.day === activeDay);
  const isFuture = roadmapDay?.date && roadmapDay.date > todayStr;

  const previousAssessmentDay = Math.floor((activeDay - 1) / 7) * 7;
  let isPrevAssessmentMissing = false;
  if (previousAssessmentDay > 0 && activeDay > previousAssessmentDay) {
    const assessmentRows = userPlans.filter(p => p.day_no === previousAssessmentDay);
    isPrevAssessmentMissing = assessmentRows.length > 0 && !assessmentRows.every(p => p.plan_status === 'COMPLETED');
  }

  const finalIsUnlocked = !((isFuture && activeDay > currentProgressDay) || isPrevAssessmentMissing);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 120, damping: 18 }}
      className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden"
    >
      <div className="p-5 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
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
          <StudyCircularProgress progress={topic.progress} />
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
        <Button
          onClick={() => handleViewDetails(topic)}
          onMouseEnter={() => {
            if (finalIsUnlocked && user?.id) {
              topic.subtopics.forEach(st => prefetchTopic(queryClient, st.id, user.id));
            }
          }}
          className={cn(
            "w-full h-11 rounded-xl text-sm font-medium transition-all",
            "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
        >
          View Details
        </Button>
      </div>
    </motion.div>
  );
};
