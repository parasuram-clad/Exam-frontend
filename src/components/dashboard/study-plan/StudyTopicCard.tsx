import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
};

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
  const roadmapDay = roadmapData?.days?.find((d: any) => d.day === activeDay);
  const isFuture = roadmapDay?.date && roadmapDay.date > todayStr;

  const previousAssessmentDay = Math.floor((activeDay - 1) / 7) * 7;
  let isPrevAssessmentMissing = false;
  if (previousAssessmentDay > 0 && activeDay > previousAssessmentDay) {
    const assessmentRows = userPlans.filter(p => p.day_no === previousAssessmentDay);
    isPrevAssessmentMissing = assessmentRows.length > 0 && !assessmentRows.every(p => p.is_completed === true);
  }

  const isLocked = (isFuture && activeDay > currentProgressDay) || isPrevAssessmentMissing;
  const finalIsUnlocked = !isLocked;

  // Determine tag label
  const tag = topic.status === 'completed'
    ? 'Completed'
    : topic.status === 'in-progress'
      ? 'In Progress'
      : isLocked
        ? 'Locked'
        : null;

  const tagColor = topic.status === 'completed'
    ? 'bg-emerald-100 text-emerald-600'
    : topic.status === 'in-progress'
      ? 'bg-yellow-100 text-yellow-600'
      : 'bg-gray-100 text-gray-500';

  const tagDot = topic.status === 'completed'
    ? 'bg-emerald-500'
    : topic.status === 'in-progress'
      ? 'bg-yellow-500'
      : 'bg-gray-400';

  // Button label
  const buttonLabel = topic.status === 'completed'
    ? 'Review'
    : topic.status === 'in-progress'
      ? 'Continue'
      : isLocked
        ? 'Locked'
        : 'Start Now';

  return (
    <motion.div
      key={topic.id}
      variants={itemVariants}
      whileHover={finalIsUnlocked ? { scale: 1.01 } : {}}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col h-[230px] snap-center relative"
    >
      {/* Locked overlay */}
      {/* {isLocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-2xl z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Lock className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Locked</span>
          </div>
        </div>
      )} */}

      {/* Header */}
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={topic.image}
            alt={topic.title}
            className="w-14 h-14 object-contain flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getSubjectIconFallback(topic.title);
            }}
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {topic.title}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {topic.topicCount} Topic{topic.topicCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {tag && (
          <span className={cn(
            "text-[9px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 flex-shrink-0 mt-1",
            tagColor
          )}>
            <span className={cn("w-1 h-1 rounded-full", tagDot)} />
            {tag}
          </span>
        )}
      </div>

      {/* Progress bar — colored by status like mobile */}
      <div className="mb-3">
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              topic.status === 'completed' ? "bg-emerald-500" :
                topic.status === 'in-progress' ? "bg-primary" :
                  "bg-muted-foreground/20"
            )}
            style={{ width: `${Math.min(100, topic.progress || 0)}%` }}
          />
        </div>
      </div>

      {/* Topics — max 2 + N more, matching mobile */}
      <ul className="space-y-1 mb-2 flex-1 overflow-hidden">
        {topic.topics.slice(0, 2).map((t, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-[12px] text-foreground/80"
          >
            <span className={cn("w-1 h-1 rounded-full flex-shrink-0", t.color || "bg-foreground/40")} />
            <span className="truncate">{t.name}</span>
          </li>
        ))}
        {topic.topics.length > 2 && (
          <li className="text-[11px] font-semibold text-primary pl-3">
            + {topic.topics.length - 2} more
          </li>
        )}
      </ul>

      {/* Action */}
      <Button
        onClick={() => handleViewDetails(topic)}

        // disabled={isLocked}
        className={cn(
          "w-full rounded-xl font-medium h-10 mt-auto text-sm bg-foreground text-background hover:bg-foreground/90"
        )}
      >
        {buttonLabel}
      </Button>
    </motion.div >
  );
};
