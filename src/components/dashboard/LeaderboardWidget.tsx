import { Trophy, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import boardImg from "@/assets/board.png";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  initials: string;
  marks: number;
  accuracy: string;
  isYou?: boolean;
  color?: string;
}

interface LeaderboardWidgetProps {
  data?: LeaderboardEntry[];
}

const defaultLeaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Priya Sharma",
    initials: "PS",
    marks: 270,
    accuracy: "95%",
    color: "bg-amber-500"
  },
  {
    rank: 2,
    name: "You (Arun Kumar)",
    initials: "AK",
    marks: 268,
    accuracy: "92%",
    isYou: true,
    color: "bg-slate-500"
  },
  {
    rank: 3,
    name: "Jagan",
    initials: "JA",
    marks: 263,
    accuracy: "92%",
    color: "bg-orange-700"
  },
  {
    rank: 4,
    name: "Sharmila",
    initials: "SH",
    marks: 259,
    accuracy: "89%",
    color: "bg-blue-600"
  },
  {
    rank: 5,
    name: "Thameem Ansari",
    initials: "TA",
    marks: 259,
    accuracy: "89%",
    color: "bg-yellow-500"
  },
  {
    rank: 6,
    name: "Raghuram",
    initials: "RA",
    marks: 259,
    accuracy: "89%",
    color: "bg-green-600"
  },
  {
    rank: 7,
    name: "Manju Shree",
    initials: "MS",
    marks: 259,
    accuracy: "89%",
    color: "bg-purple-600"
  },
  {
    rank: 8,
    name: "Helen Mary",
    initials: "HM",
    marks: 259,
    accuracy: "89%",
    color: "bg-orange-600"
  },
];

const RankMedal = ({ rank, isModal = false }: { rank: number; isModal?: boolean }) => {
  const sizeClass = isModal ? "w-8 h-8" : "w-6 h-6";
  const textClass = isModal ? "text-[12px]" : "text-[10px]";

  if (rank === 1) {
    return (
      <div className={cn("relative flex items-center justify-center", sizeClass)}>
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm">
          <path
            fill="#F59E0B"
            d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"
            transform="scale(0.85) translate(2,2)"
          />
          <circle cx="12" cy="12" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        </svg>
        <span className={cn("absolute font-semibold text-amber-900", textClass)}>1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className={cn("relative flex items-center justify-center", sizeClass)}>
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm">
          <path
            fill="#94a3b8"
            d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"
            transform="scale(0.85) translate(2,2)"
          />
          <circle cx="12" cy="12" r="6" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
        </svg>
        <span className={cn("absolute font-semibold text-slate-700", textClass)}>2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className={cn("relative flex items-center justify-center", sizeClass)}>
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm">
          <path
            fill="#B45309"
            d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"
            transform="scale(0.85) translate(2,2)"
          />
          <circle cx="12" cy="12" r="6" fill="#FED7AA" stroke="#9A3412" strokeWidth="1.5" />
        </svg>
        <span className={cn("absolute font-semibold text-orange-950", textClass)}>3</span>
      </div>
    );
  }
  return (
    <div className={cn("rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground", sizeClass, isModal ? "text-sm" : "text-xs")}>
      {rank}
    </div>
  );
};

export function LeaderboardWidget({ data = defaultLeaderboardData }: LeaderboardWidgetProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm animate-fade-in w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Leaderboard</h3>
        <Trophy className="w-5 h-5 text-amber-500" />
      </div>

      {/* Table grid layout - Optimized for space */}
      <div className="grid grid-cols-[1.4rem_1fr_2.4rem_3.2rem] gap-2">
        {/* Table Headers */}
        <div className="contents text-[0.6rem] font-bold text-muted-foreground/60 uppercase tracking-tight">
          <div className="pb-3 pl-1">#</div>
          <div className="pb-3">Student</div>
          <div className="pb-3 text-right pr-0.5">Marks</div>
          <div className="pb-3 text-right">Acc.</div>
        </div>

        {/* Entries (Grouped in col-span-4 to use flex/grid for rows) */}
        <div className="col-span-4 space-y-2.5">
          {data.slice(0, 5).map((entry) => (
            <Link
              key={entry.rank}
              to="/profile"
              className={cn(
                "grid grid-cols-[1.4rem_1fr_2.4rem_3.2rem] items-center rounded-xl p-2 transition-all gap-2 cursor-pointer ",
                entry.isYou
                  ? "bg-blue-50/80 border border-blue-100 shadow-sm"
                  : "bg-white border border-transparent hover:bg-muted/30"
              )}
            >
              {/* Rank */}
              <div className="flex justify-start items-center pl-0.5">
                <RankMedal rank={entry.rank} />
              </div>

              {/* Student */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback className={cn(
                    "text-[0.6rem] font-bold text-white",
                    entry.color || (entry.rank === 1 ? "bg-amber-500" : "bg-slate-500")
                  )}>
                    {entry.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-[0.68rem] font-semibold text-foreground leading-tight py-0.5" title={entry.name}>
                    {entry.name}
                  </span>
                </div>
              </div>

              {/* Marks */}
              <div className="text-right text-[0.65rem] font-bold text-muted-foreground/80 pr-0.5">
                {entry.marks}
              </div>

              {/* Accuracy */}
              <div className="text-right text-[0.65rem] font-bold text-foreground">
                {entry.accuracy}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* View Full Rankings Trigger */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full mt-6 text-muted-foreground border-border hover:bg-muted hover:text-foreground h-10 font-normal rounded-xl"
          >
            View Full Rankings
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl w-[80vw] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-white p-6  relative">
            <DialogHeader className="mb-0">
              <DialogTitle className="text-2xl font-semibold text-[#1e293b] mb-4">Scores & Ranks</DialogTitle>
            </DialogHeader>

            {/* Illustration */}
            <div className="flex justify-center mb-6 pt-2">
              <img
                src={boardImg}
                alt="Scores and Ranks Illustration"
                className="w-full max-w-[240px] h-auto object-contain"
              />
            </div>

            {/* Full Leaderboard Table */}
            <div className="space-y-4 px-4">
              {/* Table Header */}
              <div className="grid grid-cols-[60px_1fr_80px_100px] gap-4 px-4 text-sm font-semibold text-[#1e293b]">
                <div className="text-left">Rank</div>
                <div className="text-left">Student</div>
                <div className="text-right">Marks</div>
                <div className="text-right">Accuracy</div>
              </div>

              {/* Rows - Scrollable Area */}
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {data.map((entry) => (
                  <div
                    key={entry.rank}
                    className={cn(
                      "grid grid-cols-[60px_1fr_80px_100px] items-center gap-4 p-3 rounded-xl transition-all",
                      entry.isYou
                        ? "bg-[#eff6ff] border border-blue-200"
                        : "bg-[#f8fafc]"
                    )}
                  >
                    <div className="flex justify-start">
                      <RankMedal rank={entry.rank} isModal />
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback className={cn(
                          "text-xs font-semibold text-white",
                          entry.color || "bg-slate-500"
                        )}>
                          {entry.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-[#1e293b] truncate">
                        {entry.name}
                      </span>
                    </div>
                    <div className="text-right text-sm font-medium text-slate-400">
                      {entry.marks}
                    </div>
                    <div className="text-right text-sm font-bold text-[#1e293b]">
                      {entry.accuracy}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Chevron */}
              <div className="flex justify-center pt-2">
                <ChevronDown className="w-6 h-6 text-slate-300 animate-bounce" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

