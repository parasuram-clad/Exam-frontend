import { cn } from "@/lib/utils";

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    className?: string;
    borderClass?: string; // e.g. "border-l-[#6366f1]"
}

export function StatCard({ icon, value, label, className, borderClass }: StatCardProps) {
    return (
        <div
            className={cn(
                "bg-card rounded-xl p-4 md:p-5 border border-border shadow-sm hover:shadow-md transition-shadow animate-fade-in flex items-center gap-4 border-l-4",
                borderClass,
                className
            )}
        >
            <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground font-medium">{label}</p>
            </div>
        </div>
    );
}

export function StatCardsGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {children}
        </div>
    );
}
