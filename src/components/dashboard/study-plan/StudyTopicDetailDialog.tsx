import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { prefetchTopic } from "@/services/prefetch";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import studyService from "@/services/study.service";

interface Subtopic {
  id: string;
  name: string;
  description: string;
  timeSpent: number;
  totalTime: number;
  status: "continue" | "start" | "completed";
  isTest?: boolean;
  planRowId?: number;
  testType?: 'WEEKLY' | 'MONTHLY';
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

interface StudyTopicDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTopic: StudyTopicCard | null;
  topicTimings: any[];
  user: any;
  onSubtopicClick: (topicId: string, subtopicId: string) => void;
  getSubjectIconFallback: (subject: string) => string;
  isFetching?: boolean;
}

export const StudyTopicDetailDialog = ({
  isOpen,
  onOpenChange,
  selectedTopic,
  topicTimings,
  user,
  onSubtopicClick,
  getSubjectIconFallback,
  isFetching = false
}: StudyTopicDetailDialogProps) => {
  const queryClient = useQueryClient();
  const { currentContext } = useAuth();
  const [now, setNow] = useState(new Date());

  // Derive the active study context.
  const studyContext = useMemo(() => {
    if (currentContext?.plan_type === 'OVERALL' || currentContext?.plan_type === 'SUBJECT') {
      return currentContext;
    }
    return user?.dashboard?.contexts?.find((c: any) => c.plan_type === 'OVERALL' || c.plan_type === 'SUBJECT');
  }, [currentContext, user?.dashboard?.contexts]);

  // Fetch timings specifically for this topic/plan/row if available for maximum precision
  const { data: localTimings = [], isLoading: isTimingsLoading } = useQuery({
    queryKey: ['topic-timings', user?.id, selectedTopic?.id, studyContext?.plan_id, selectedTopic?.subtopics?.[0]?.planRowId],
    queryFn: () => studyService.getUserTopicTimings(
      selectedTopic ? parseInt(selectedTopic.subtopics[0].id) : undefined,
      studyContext?.plan_id,
      selectedTopic?.subtopics[0].planRowId
    ),
    enabled: !!user?.id && !!selectedTopic && isOpen,
    staleTime: 30000, // Refresh more often in dialog
  });

  // Combine prop timings with local precise timings (local preferred)
  const combinedTimings = localTimings.length > 0 ? localTimings : topicTimings;

  // Update "now" every 30 seconds to provide real-time timing updates
  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => setNow(new Date()), 30000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-hidden p-0 bg-background rounded-2xl sm:rounded-3xl flex flex-col">
        <DialogTitle className="sr-only">Topic Details - {selectedTopic?.title || 'Details'}</DialogTitle>
        <DialogDescription className="sr-only">Detailed breakdown of subtopics and progress for {selectedTopic?.title || 'this topic'}.</DialogDescription>
        {selectedTopic && (
          <div className="p-5 sm:p-8 overflow-y-auto flex-1">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h2 className="text-xl font-medium text-foreground">{selectedTopic.title}</h2>
            </div>

            <div className="flex justify-center mb-8">
              <img
                src={selectedTopic.image}
                alt={selectedTopic.title}
                className="w-32 h-32 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getSubjectIconFallback(selectedTopic.title);
                }}
              />
            </div>

            <div className="space-y-4">
              {selectedTopic.subtopics.map((subtopic) => {
                const matchingTimings = (combinedTimings || []).filter(t => {
                  const syllabusMatch = t.syllabus_id.toString() === subtopic.id;
                  if (!syllabusMatch) return false;
                  
                  if (subtopic.planRowId) {
                    return t.plan_row_id?.toString() === subtopic.planRowId.toString();
                  } else {
                    // Match plan_id if we are in a plan context
                    if (studyContext?.plan_id) {
                      return t.plan_id?.toString() === studyContext.plan_id.toString();
                    }
                    // Global fallback
                    return !t.plan_id && !t.plan_row_id;
                  }
                });

                // Calculate total completed time for this subtopic
                const completedTimeSum = matchingTimings
                  .filter(t => t.end_time)
                  .reduce((sum, t) => sum + Number(t.total_estimate || 0), 0);

                const activeTiming = matchingTimings.find(t => !t.end_time);
                let liveTimeSpent = completedTimeSum;

                if (activeTiming && activeTiming.id && subtopic.status !== "completed" && activeTiming.start_time) {
                  const startTimeStr = activeTiming.start_time.endsWith('Z') ? activeTiming.start_time : `${activeTiming.start_time}Z`;
                  const ongoingMinutes = (now.getTime() - new Date(startTimeStr).getTime()) / (1000 * 60);
                  liveTimeSpent += Math.max(0, ongoingMinutes);
                } else {
                  // Fallback to the pre-calculated timeSpent if no active session is found (or handle cases where mapping.ts already did the work)
                  liveTimeSpent = subtopic.timeSpent;
                }

                const isTest = subtopic.isTest;
                const isMonthly = isTest && subtopic.testType === 'MONTHLY';
                const isWeekly = isTest && subtopic.testType !== 'MONTHLY';

                return (
                  <div key={subtopic.id} className={cn(
                    "rounded-3xl p-6 transition-all duration-500 relative overflow-hidden group",
                    isMonthly
                      ? "bg-[#FEF2F2] border border-[#FEE2E2] shadow-xl shadow-red-100/50"
                      : isWeekly
                        ? "bg-[#F7FEE7] border border-[#ECFCCB] shadow-xl shadow-lime-100/50"
                        : "bg-primary"
                  )}>
                    {isTest && (
                      <div className={cn(
                        "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none transition-all duration-700",
                        isMonthly ? "bg-red-500/10 group-hover:bg-red-500/20" : "bg-lime-500/20 group-hover:bg-lime-500/30"
                      )} />
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isTest && (
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm",
                              isMonthly ? "bg-[#EF4444] text-white shadow-red-200/50" : "bg-[#3B5AA4] text-white shadow-indigo-200/50"
                            )}>
                              {subtopic.testType === 'MONTHLY' ? 'Monthly Test' : 'Weekly Test'}
                            </span>
                          )}
                          <h3 className={cn(
                            "text-lg font-bold tracking-tight",
                            isMonthly ? "text-red-950" : isWeekly ? "text-slate-900" : "text-primary-foreground"
                          )}>{subtopic.name} </h3>
                        </div>
                        <p className={cn(
                          "text-sm mb-2",
                          isMonthly ? "text-red-900/70" : isWeekly ? "text-slate-700" : "text-primary-foreground/70"
                        )}>{subtopic.description}</p>
                        
                        <div className={cn(
                          "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider",
                          isMonthly ? "text-red-600/70" : isWeekly ? "text-lime-700/70" : "text-primary-foreground/60"
                        )}>
                          <span>{isTest ? "Evaluation Period:" : "Time Tracked:"}</span>
                          <span className={cn(
                            "font-bold",
                            isMonthly ? "text-red-700" : isWeekly ? "text-lime-700" : "text-primary-foreground"
                          )}>
                            {isTest 
                              ? `${subtopic.totalTime} Minutes`
                              : `${liveTimeSpent % 1 === 0 ? liveTimeSpent : liveTimeSpent.toFixed(1)}m / ${subtopic.totalTime}m`
                            }
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => onSubtopicClick(selectedTopic.id, subtopic.id)}
                        disabled={isFetching}
                        onMouseEnter={() => {
                          if (user?.id) prefetchTopic(queryClient, subtopic.id, user.id);
                        }}
                        className={cn(
                          "px-8 rounded-xl font-bold transition-all duration-300 shadow-lg relative z-10 h-11",
                          isMonthly 
                            ? "bg-gradient-to-b from-[#EF4444] to-[#991B1B] hover:opacity-90 text-white shadow-red-200" 
                            : isWeekly
                              ? "bg-gradient-to-b from-[#3B5AA4] to-[#183066] hover:opacity-90 text-white shadow-lime-200"
                              : "bg-card hover:bg-card/90 text-foreground"
                        )}
                      >
                        {isFetching ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Please Wait...
                          </span>
                        ) : subtopic.status === "continue" ? "Continue" : subtopic.status === "completed" ? "View Analytics" : "Start Now"}
                      </Button>
                    </div>
                    {!isTest && (
                      <div>
                        <div className="h-2 bg-primary-foreground/10 rounded-full overflow-hidden">
                          {(() => {
                            const timeProgress = subtopic.totalTime > 0 ? (liveTimeSpent / subtopic.totalTime) * 100 : 0;
                            let readingProgress = 0;

                            if (user?.id) {
                              const planIdStr = studyContext?.plan_id ? `plan_${studyContext.plan_id}` : "global";
                              const rowIdStr = subtopic.planRowId ? `row_${subtopic.planRowId}` : "norow";
                              const percentKey = `read_percent_${subtopic.id}_${planIdStr}_${rowIdStr}_${user.id}`;
                              const savedPercent = localStorage.getItem(percentKey);
                              if (savedPercent) {
                                readingProgress = parseFloat(savedPercent);
                              }
                            }

                            let finalProgress = 0;
                            if (subtopic.status === "completed") {
                              finalProgress = 100;
                            } else {
                              // Max of time or reading, capped at 90% for non-completed
                              finalProgress = Math.min(90, Math.max(timeProgress, readingProgress));
                            }

                            return (
                              <div
                                className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${finalProgress}%` }}
                              />
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
