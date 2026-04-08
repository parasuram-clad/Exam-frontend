import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { prefetchTopic } from "@/services/prefetch";
import { useQueryClient } from "@tanstack/react-query";

interface Subtopic {
  id: string;
  name: string;
  description: string;
  timeSpent: number;
  totalTime: number;
  status: "continue" | "start" | "completed";
  isTest?: boolean;
  planRowId?: number;
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
  const [now, setNow] = useState(new Date());

  // Update "now" every 30 seconds to provide real-time timing updates
  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => setNow(new Date()), 30000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-hidden p-0 bg-background rounded-2xl sm:rounded-3xl flex flex-col">
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
                const matchingTimings = topicTimings.filter(t => t.syllabus_id.toString() === subtopic.id);
                const activeTiming = matchingTimings.find(t => !t.end_time);

                let liveTimeSpent = subtopic.timeSpent;

                // subtopic.timeSpent already includes snapshot of ongoingTime from mapping.ts 
                // but if there's an active timing for a non-completed topic, ensure we show it or update it.
                // Calculate live timing for active session
                if (activeTiming && activeTiming.id && subtopic.status !== "completed" && activeTiming.start_time) {
                   const startTimeStr = activeTiming.start_time.endsWith('Z') ? activeTiming.start_time : `${activeTiming.start_time}Z`;
                   const ongoingMinutes = Math.floor((now.getTime() - new Date(startTimeStr).getTime()) / (1000 * 60));
                   // The subtopic.timeSpent might have past sessions, but for the active one we use the live diff
                   // If we already have timeSpent (summed from backend), we just ensure we show at least the ongoing part
                   liveTimeSpent = Math.max(subtopic.timeSpent, ongoingMinutes);
                }

                return (
                  <div key={subtopic.id} className="bg-primary rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-primary-foreground text-lg font-medium mb-1">{subtopic.name}</h3>
                        <p className="text-primary-foreground/70 text-sm">{subtopic.description}</p>
                      </div>
                      <Button
                        onClick={() => onSubtopicClick(selectedTopic.id, subtopic.id)}
                        disabled={isFetching}
                        onMouseEnter={() => {
                          if (user?.id) prefetchTopic(queryClient, subtopic.id, user.id);
                        }}
                        className="bg-card hover:bg-card/90 text-foreground px-6 rounded-xl font-medium shrink-0 disabled:opacity-70"
                      >
                        {isFetching ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Please Wait...
                          </span>
                        ) : subtopic.status === "continue" ? "Continue" : subtopic.status === "completed" ? "View Analytics" : "Start Now"}
                      </Button>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-primary-foreground/80 text-sm mb-2">
                        <span>Time Spent</span>
                        <span className="font-medium text-primary-foreground">{liveTimeSpent}m / {subtopic.totalTime}m</span>
                      </div>
                      <div className="h-2 bg-primary-foreground/10 rounded-full overflow-hidden">
                        {(() => {
                          const timeProgress = subtopic.totalTime > 0 ? (liveTimeSpent / subtopic.totalTime) * 100 : 0;
                          let readingProgress = 0;
                          
                          if (user?.id) {
                            const savedPercent = localStorage.getItem(`read_percent_${subtopic.id}_${user.id}`);
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
