import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StudyTopicCardData as StudyTopicCardType, getSubjectIconFallback } from "./constants";
import { format } from "date-fns";
import { Lock, ClipboardCheck, Trophy, Sparkles } from "lucide-react";

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
  const isTest = topic.type === 'TEST';
  const testType = topic.subtopics[0]?.testType;
  const isMonthly = isTest && testType === 'MONTHLY';
  const isWeekly = isTest && testType !== 'MONTHLY';
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
      className={cn(
        "rounded-[24px] p-5 border transition-all duration-500 flex flex-col h-[240px] snap-center relative overflow-hidden group",
        isMonthly
          ? "bg-[#FEF2F2] border-[#FEE2E2] shadow-xl shadow-red-100/50"
          : isWeekly
            ? "bg-[#F7FEE7] border-[#ECFCCB] shadow-xl shadow-lime-100/50"
            : "bg-card border-border shadow-sm hover:shadow-md"
      )}
    >
      {/* Background Decorative Accent for Test */}
      {isTest && (
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none transition-all duration-700",
          isMonthly ? "bg-red-500/10 group-hover:bg-red-500/20" : "bg-lime-500/20 group-hover:bg-lime-500/30"
        )} />
      )}
      {/* Locked Overlay Design */}
      {/* {isLocked && (
        <div className="absolute inset-0 z-20 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] transition-all duration-500" />
          
          <div className="relative h-full w-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-muted/80 rounded-full blur-xl scale-150 animate-pulse" />
              <div className="relative w-12 h-12 bg-background/80 border border-border shadow-md rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

      <div className="space-y-1">
        <p className="text-[14px] font-bold text-foreground/90 tracking-tight">Day Locked</p>
        <p className="text-[10px] text-muted-foreground font-medium leading-tight max-w-[140px]">
          {isPrevAssessmentMissing
            ? "Finish your weekly assessment to unlock this day"
            : `This day will unlock when you reach Day ${activeDay}`}
        </p>
      </div>
    </div>
        </div >
      )} */}

      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2 relative z-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-sm",
            isMonthly ? "bg-[#EF4444] text-white" : isWeekly ? "bg-[#3B5AA4] text-white" : "bg-muted/50"
          )}>
            {isTest ? (
              topic.status === 'completed' ? <Trophy className="w-6 h-6" /> : <ClipboardCheck className="w-6 h-6" />
            ) : (
              <img
                src={topic.image}
                alt={topic.title}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getSubjectIconFallback(topic.title);
                }}
              />
            )}
          </div>
          <div className="min-w-0">
            <h3 className={cn(
              "font-bold text-sm tracking-tight truncate",
              isMonthly ? "text-red-950" : isWeekly ? "text-slate-900" : "text-foreground"
            )}>
              {topic.title}
            </h3>
            <p className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              isMonthly ? "text-red-600/70" : isWeekly ? "text-lime-700/70" : "text-muted-foreground"
            )}>
              {isTest ? (topic.status === 'completed' ? 'Evaluation Finished' : 'Required Assessment') : `${topic.topicCount} Topic${topic.topicCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        {tag && (
          <span className={cn(
            "text-[9px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 shadow-sm",
            tagColor
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", tagDot)} />
            {tag}
          </span>
        )}
      </div>

      {/* Progress bar — colored by status like mobile */}
      {!isTest && (
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
      )}

      {isTest && topic.status !== 'completed' && (
        <div className="mb-4 relative z-10 px-1">
          <div className={cn(
            "flex items-center gap-2 text-[11px] font-bold py-2 px-3 rounded-lg border border-dashed",
            isMonthly ? "text-red-700 bg-red-100/50 border-red-200" : "text-indigo-700 bg-indigo-50 border-indigo-200"
          )}>
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>CRITICAL ASSESSMENT</span>
          </div>
        </div>
      )}

      {isTest && topic.status === 'completed' && (
        <div className="mb-4 relative z-10 px-1">
          <div className={cn(
            "text-[11px] font-bold py-2 px-3 rounded-lg border border-dashed flex items-center gap-2",
            isMonthly ? "text-red-800 bg-red-100/30 border-red-200/50" : "text-emerald-700 bg-emerald-50 border-emerald-200"
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              isMonthly ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            )} />
            <span>Mastery Achieved</span>
          </div>
        </div>
      )}

      {/* Content — topics list or test details */}
      <div className="flex-1 overflow-hidden mb-4 relative z-10">
        <ul className="space-y-2">
          {topic.topics.slice(0, 2).map((t, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-[12px] group/item"
            >
              <div className={cn(
                "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 group-hover/item:scale-125",
                t.color || (isMonthly ? "bg-red-400" : isWeekly ? "bg-lime-500" : "bg-primary/40")
              )} />
              <span className={cn(
                "truncate font-medium",
                isMonthly ? "text-red-900 group-hover/item:text-red-950" : isWeekly ? "text-slate-700 group-hover/item:text-slate-950" : "text-foreground/80"
              )}>
                {t.name}
              </span>
            </li>
          ))}
          {topic.topics.length > 2 && (
            <li className={cn(
              "text-[10px] font-bold pl-4.5 tracking-wide",
              isMonthly ? "text-red-600" : isWeekly ? "text-lime-700" : "text-primary/70"
            )}>
              + {topic.topics.length - 2} ADDITIONAL FOCUS
            </li>
          )}
        </ul>
      </div>

      {/* Action */}
      <Button
        onClick={() => handleViewDetails(topic)}
        className={cn(
          "w-full rounded-[14px] font-bold h-11 relative z-10 transition-all duration-300",
          isMonthly
            ? "bg-gradient-to-b from-[#EF4444] to-[#991B1B] hover:opacity-90 text-white shadow-lg shadow-red-200"
            : isWeekly
              ? "bg-gradient-to-b from-[#3B5AA4] to-[#183066] hover:opacity-90 text-white shadow-lg shadow-lime-200"
              : "bg-gradient-to-b from-[#3B5AA4] to-[#183066] hover:opacity-90 text-white shadow-lg "

        )}
      >
        <span className="flex items-center justify-center gap-2">
          {buttonLabel}
          {topic.status !== 'completed' && <Sparkles className="w-3.5 h-3.5" />}
        </span>
      </Button>
    </motion.div >
  );
};
