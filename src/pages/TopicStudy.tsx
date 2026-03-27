import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Brain, FileText, Lightbulb, Map, Play, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubTopic {
  id: string;
  title: string;
  description: string;
  timeSpent: number;
  totalTime: number;
  status: "completed" | "in_progress" | "not_started";
}

const subTopics: SubTopic[] = [];

const TopicStudy = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [selectedSubTopic, setSelectedSubTopic] = useState<string | null>(null);

  const topicName = topicId
    ? topicId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Tamil Nadu History";

  return (
    <DashboardLayout>
      <div className="mt-2 text-center mb-10">
        <h2 className="text-xl font-medium text-foreground mb-1">{topicName}</h2>
        <p className="text-sm text-muted-foreground">Select a subtopic to begin your study session</p>
      </div>

      {/* Topic Illustration */}
      <div className="flex justify-center mb-8">
        <div className="w-64 h-40 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center border border-accent/30">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-8 h-8 text-accent-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Topic Illustration</p>
          </div>
        </div>
      </div>

      {/* SubTopics List */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {subTopics.map((subTopic) => (
          <div
            key={subTopic.id}
            className={cn(
              "rounded-2xl p-5 border-l-4 transition-all cursor-pointer",
              subTopic.status === "completed"
                ? "bg-success/10 border-success"
                : subTopic.status === "in_progress"
                  ? "bg-primary text-primary-foreground border-accent"
                  : "bg-card border-border hover:border-accent"
            )}
            onClick={() => setSelectedSubTopic(subTopic.id)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className={cn(
                  "font-medium text-lg mb-2",
                  subTopic.status === "in_progress" ? "text-primary-foreground" : "text-foreground"
                )}>
                  {subTopic.title}
                </h3>
                <p className={cn(
                  "text-sm leading-relaxed",
                  subTopic.status === "in_progress" ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {subTopic.description}
                </p>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-xs font-medium",
                      subTopic.status === "in_progress" ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      Time Spent
                    </span>
                    <span className={cn(
                      "text-sm font-medium",
                      subTopic.status === "in_progress" ? "text-primary-foreground" : "text-foreground"
                    )}>
                      {subTopic.timeSpent}m / {subTopic.totalTime}m
                    </span>
                  </div>
                  <Progress
                    value={(subTopic.timeSpent / subTopic.totalTime) * 100}
                    className={cn(
                      "h-2",
                      subTopic.status === "in_progress" && "[&>div]:bg-accent"
                    )}
                  />
                </div>
              </div>

              <Button
                variant={subTopic.status === "in_progress" ? "secondary" : "outline"}
                className={cn(
                  "min-w-[120px]",
                  subTopic.status === "in_progress"
                    ? "bg-card text-foreground hover:bg-card/90"
                    : "border-border"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/study-plan/topic/${topicId}/study/${subTopic.id}`);
                }}
              >
                {subTopic.status === "completed"
                  ? "Review"
                  : subTopic.status === "in_progress"
                    ? "Continue"
                    : "Start Now"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default TopicStudy;
