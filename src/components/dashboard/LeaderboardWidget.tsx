import { Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  initials: string;
  marks: number;
  accuracy: string;
  isCurrentUser?: boolean;
}

const leaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Priya Sharma",
    initials: "PS",
    marks: 250,
    accuracy: "95%",
  },
  {
    rank: 2,
    name: "You (Arun)",
    initials: "AK",
    marks: 220,
    accuracy: "92%",
    isCurrentUser: true,
  },
];

const RankMedal = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Star/Burst Shape for Gold */}
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm">
          <path
            fill="#F59E0B" // Amber-500
            d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"
            transform="scale(0.85) translate(2,2)"
          />
          <circle cx="12" cy="12" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        </svg>
        <span className="absolute text-[10px] font-bold text-amber-900">1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Star/Burst Shape for Silver */}
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm">
          <path
            fill="#94a3b8" // Slate-400
            d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"
            transform="scale(0.85) translate(2,2)"
          />
          <circle cx="12" cy="12" r="6" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
        </svg>
        <span className="absolute text-[10px] font-bold text-slate-700">2</span>
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
      {rank}
    </div>
  );
};

export function LeaderboardWidget() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm animate-fade-in w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Leaderboard</h3>
        <Trophy className="w-5 h-5 text-amber-500" />
      </div>

      {/* Table grid layout - Optimized for space */}
      <div className="grid grid-cols-[2rem_1fr_3rem_3.5rem] gap-2">
        {/* Table Headers */}
        <div className="contents text-xs font-semibold text-foreground">
          <div className="pb-3 pl-2">Rank</div>
          <div className="pb-3 pl-1">Student</div>
          <div className="pb-3 text-right">Marks</div>
          <div className="pb-3 text-right">Accuracy</div>
        </div>

        {/* Entries (Grouped in col-span-4 to use flex/grid for rows) */}
        <div className="col-span-4 space-y-3">
          {leaderboardData.map((entry) => (
            <Link
              key={entry.rank}
              to="/profile"
              className={cn(
                "grid grid-cols-[2rem_1fr_3rem_3.5rem] items-center rounded-xl p-2 transition-all gap-2 cursor-pointer hover:shadow-sm hover:scale-[1.01]",
                entry.isCurrentUser
                  ? "bg-[#eff6ff] border border-blue-200 hover:bg-blue-50"
                  : "bg-white border border-transparent hover:bg-muted/50"
              )}
            >
              {/* Rank */}
              <div className="flex justify-center justify-self-start pl-1">
                <RankMedal rank={entry.rank} />
              </div>

              {/* Student */}
              <div className="flex items-center gap-2 min-w-0 pl-1">
                <Avatar className={cn(
                  "w-6 h-6",
                  entry.rank === 1 ? "bg-amber-100/50" : "bg-slate-100/50"
                )}>
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback className={cn(
                    "text-[10px] font-semibold",
                    entry.rank === 1 ? "bg-amber-500 text-white" : "bg-slate-500 text-white"
                  )}>
                    {entry.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-foreground truncate" title={entry.name}>
                  {entry.name}
                </span>
              </div>

              {/* Marks */}
              <div className="text-right text-xs font-medium text-muted-foreground">
                {entry.marks}
              </div>

              {/* Accuracy */}
              <div className="text-right text-xs font-bold text-foreground">
                {entry.accuracy}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* View Full Rankings */}
      <Button
        variant="outline"
        className="w-full mt-6 text-muted-foreground border-border hover:bg-muted hover:text-foreground h-10 font-normal rounded-xl"
      >
        View Full Rankings
      </Button>
    </div>
  );
}
