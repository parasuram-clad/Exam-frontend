import { Clock, FileText, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TestSeriesCardProps {
  icon: React.ReactNode;
  title: string;
  progress: number;
  duration: string;
  questions: number;
  marks: number;
  color: "indigo" | "blue" | "emerald" | "red";
  onClick?: () => void;
}

const colorStyles = {
  indigo: {
    iconBg: "bg-indigo-500",
  },
  blue: {
    iconBg: "bg-blue-500",
  },
  emerald: {
    iconBg: "bg-emerald-500",
  },
  red: {
    iconBg: "bg-red-600",
  },
};

export function TestSeriesCard({
  icon,
  title,
  progress,
  duration,
  questions,
  marks,
  color,
  onClick,
}: TestSeriesCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all animate-fade-in flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-0.5",
          styles.iconBg
        )}>
          {icon}
        </div>
        <h3 className="font-semibold text-sm leading-snug text-foreground min-h-[3rem] line-clamp-3">
          {title}
        </h3>
      </div>

      {/* Progress */}
      <div className="mb-4 space-y-2">
        <Progress value={progress} className="h-2 bg-muted" indicatorClassName="bg-slate-900 dark:bg-slate-50" />
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          Completed: {progress}%
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-4 mt-auto">
        <span className="flex items-center gap-0.5">
          <Clock className="w-3 h-3" /> {duration}
        </span>
        <span className="flex items-center gap-0.5">
          <FileText className="w-3 h-3" /> {questions} Qs
        </span>
        <span className="flex items-center gap-0.5">
          <Trophy className="w-3 h-3 text-amber-500" /> {marks} Marks
        </span>
      </div>

      {/* Action */}
      <Button
        onClick={onClick}
        className="w-full bg-[#1F2937] text-white hover:bg-[#111827] rounded-xl font-medium h-9 text-xs"
      >
        Continue
      </Button>
    </div>
  );
}

export function TestSeriesGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
