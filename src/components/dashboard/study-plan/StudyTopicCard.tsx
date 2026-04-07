import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StudyTopicCardData as StudyTopicCardType, getSubjectIconFallback } from "./constants";
import { format } from "date-fns";
import { Lock } from "lucide-react";

interface StudyTopicCardProps {
  topic: StudyTopicCardType;
  index: number;
  activeDay: number;
  currentProgressDay: number;
  roadmapData: any; // expects a plan object with days array
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
    const prevDay = roadmapData?.days?.find((d: any) => d.day === previousAssessmentDay);
    const assessmentItems = prevDay?.items?.filter((item: any) => item.type === 'TEST') || [];
    isPrevAssessmentMissing = assessmentItems.length > 0 && !assessmentItems.every((item: any) => item.is_completed === true);
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
      {/* Locked Overlay Design */}
      {isLocked && (
        <div className="absolute inset-0 z-20 overflow-hidden rounded-2xl">
          {/* Glass-morphic background with stronger blur on edges */}
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] transition-all duration-500" />
          
          {/* Center Content Container */}
          <div className="relative h-full w-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
            {/* Lock Icon with Animated Background */}
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-muted/80 rounded-full blur-xl scale-150 animate-pulse" />
              <div className="relative w-12 h-12 bg-background/80 border border-border shadow-md rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Locked Text & Reason */}
            <div className="space-y-1">
              <p className="text-[14px] font-bold text-foreground/90 tracking-tight">Day Locked</p>
              <p className="text-[10px] text-muted-foreground font-medium leading-tight max-w-[140px]">
                {isPrevAssessmentMissing 
                  ? "Finish your weekly assessment to unlock this day" 
                  : `This day will unlock when you reach Day ${activeDay}`}
              </p>
            </div>
          </div>
        </div>
      )}

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
