import { cn } from "@/lib/utils";

interface StudyPlanCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export function StudyPlanCard({ icon, title, subtitle }: StudyPlanCardProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all cursor-pointer animate-fade-in flex items-center gap-4">
      <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-[15px] truncate text-foreground">{title}</h3>
        <p className="text-xs font-medium text-muted-foreground truncate opacity-80">{subtitle}</p>
      </div>
    </div>
  );
}

export function StudyPlanGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {children}
    </div>
  );
}
