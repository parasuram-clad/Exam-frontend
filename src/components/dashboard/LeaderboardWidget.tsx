import { useState } from "react";
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
  weeklyData?: LeaderboardEntry[];
  overallData?: LeaderboardEntry[];
}

const defaultLeaderboardData: LeaderboardEntry[] = [];

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

export function LeaderboardWidget({
  data,
  weeklyData,
  overallData
}: LeaderboardWidgetProps) {
  const [activeTab, setActiveTab] = useState<"weekly" | "overall">("weekly");

  const [showAllModal, setShowAllModal] = useState(false);

  // Decide which data to show in Widget (Top 3 + User)
  const hasTabs = !!weeklyData && !!overallData;
  const currentData = hasTabs
    ? (activeTab === "weekly" ? weeklyData : overallData) || defaultLeaderboardData
    : (data || weeklyData || overallData || defaultLeaderboardData);

  // Process data for Modal (Top 10 + User logic if not showing all)
  const getModalDisplayData = () => {
    if (showAllModal) return currentData;
    
    const top10 = currentData.slice(0, 10);
    const userInTop10 = top10.some(e => e.isYou);
    const userEntry = currentData.find(e => e.isYou);
    
    if (!userInTop10 && userEntry) {
      return [...top10, { ...userEntry, hasGap: true }];
    }
    return top10;
  };

  const modalDisplayData = getModalDisplayData();

  if (currentData.length === 0) {
    return (
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm animate-fade-in w-full flex flex-col items-center justify-center py-10 gap-4">
        {hasTabs && (
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Leaderboard</h3>
            <div className="bg-muted/50 p-0.5 rounded-lg flex gap-0.5">
              <button
                onClick={() => setActiveTab("weekly")}
                className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all", activeTab === "weekly" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")}
              >Weekly</button>
              <button
                onClick={() => setActiveTab("overall")}
                className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all", activeTab === "overall" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")}
              >Overall</button>
            </div>
          </div>
        )}
        <Trophy className="w-12 h-12 text-amber-500/20" />
        <div className="text-center">
          <h3 className="text-base font-semibold text-foreground">No Rankings Yet</h3>
          <p className="text-xs text-muted-foreground mt-1 text-balance">The competition is heating up! Join a test to see rankings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm animate-fade-in w-full">
      {/* Header with Tabs Toggle if available */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-foreground">Leaderboard</h3>
        {hasTabs ? (
          <div className="bg-muted p-0.5 rounded-lg flex gap-0.5">
            <button
              onClick={() => setActiveTab("weekly")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all",
                activeTab === "weekly"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >Weekly</button>
            <button
              onClick={() => setActiveTab("overall")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all",
                activeTab === "overall"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >Overall</button>
          </div>
        ) : (
          <Trophy className="w-4 h-4 text-amber-500" />
        )}
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

        {/* Entries (Top 3) */}
        <div className="col-span-4 space-y-2.5">
          {currentData.slice(0, 3).map((entry) => (
            <Link
              key={`${activeTab}-${entry.rank}-${entry.name}`}
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

          {/* User's rank if not in top 3 */}
          {(() => {
            const userInTop3 = currentData.slice(0, 3).some(e => e.isYou);
            const userEntry = currentData.find(e => e.isYou);

            if (!userInTop3 && userEntry) {
              return (
                <>
                  <div className="flex justify-center py-0.5 opacity-30">
                    <div className="h-1 w-1 rounded-full bg-foreground mx-0.5" />
                    <div className="h-1 w-1 rounded-full bg-foreground mx-0.5" />
                    <div className="h-1 w-1 rounded-full bg-foreground mx-0.5" />
                  </div>
                  <Link
                    to="/profile"
                    className="grid grid-cols-[1.4rem_1fr_2.4rem_3.2rem] items-center rounded-xl p-2 transition-all gap-2 cursor-pointer bg-blue-50/80 border border-blue-100 shadow-sm"
                  >
                    <div className="flex justify-start items-center pl-0.5">
                      <RankMedal rank={userEntry.rank} />
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Avatar className="w-6 h-6 flex-shrink-0">
                        <AvatarImage src={userEntry.avatar} />
                        <AvatarFallback className={cn("text-[0.6rem] font-bold text-white bg-slate-500")}>
                          {userEntry.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[0.68rem] font-semibold text-foreground leading-tight py-0.5">
                          {userEntry.name} (You)
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-[0.65rem] font-bold text-muted-foreground/80 pr-0.5">
                      {userEntry.marks}
                    </div>
                    <div className="text-right text-[0.65rem] font-bold text-foreground">
                      {userEntry.accuracy}
                    </div>
                  </Link>
                </>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* View Full Rankings Trigger */}
      <Dialog onOpenChange={(open) => { if (!open) setShowAllModal(false); }}>
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
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="text-2xl font-semibold text-[#1e293b]">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Rankings</DialogTitle>
                {hasTabs && (
                  <div className="bg-muted p-1 rounded-xl flex gap-1 mr-8">
                    <button
                      onClick={() => { setActiveTab("weekly"); setShowAllModal(false); }}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        activeTab === "weekly"
                          ? "bg-white text-primary shadow-md"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >Weekly</button>
                    <button
                      onClick={() => { setActiveTab("overall"); setShowAllModal(false); }}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        activeTab === "overall"
                          ? "bg-white text-primary shadow-md"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >Overall</button>
                  </div>
                )}
              </div>
            </DialogHeader>

            {/* Illustration - Hidden when scrolled or on small modals if height is concern, but kept for visual style */}
            <div className="flex justify-center mb-6 pt-2">
              <img
                src={boardImg}
                alt="Scores and Ranks Illustration"
                className="w-full max-w-[200px] h-auto object-contain"
              />
            </div>

            {/* Full Leaderboard Table */}
            <div className="space-y-2 px-4">
              {/* Table Header */}
              <div className="grid grid-cols-[60px_1fr_80px_100px] gap-4 px-4 text-sm font-semibold text-[#1e293b]">
                <div className="text-left">Rank</div>
                <div className="text-left">Student</div>
                <div className="text-right">Marks</div>
                <div className="text-right">Accuracy</div>
              </div>

              {/* Rows - Scrollable Area */}
              <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {modalDisplayData.map((entry: any) => (
                  <div key={`${activeTab}-modal-${entry.rank}-${entry.name}`} className="contents">
                    {entry.hasGap && (
                      <div className="flex justify-center py-2 opacity-30">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mx-1" />
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mx-1" />
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mx-1" />
                      </div>
                    )}
                    <div
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
                  </div>
                ))}
              </div>

              {/* Show All Logic */}
              {!showAllModal && currentData.length > 10 ? (
                <div className="flex flex-col items-center mt-4">
                  <Button 
                    variant="ghost" 
                    className="text-primary font-bold hover:bg-primary/5 h-8"
                    onClick={() => setShowAllModal(true)}
                  >
                    Show All Rankings
                  </Button>
                  <ChevronDown className="w-5 h-5 text-slate-300 animate-bounce mt-1" />
                </div>
              ) : (
                <div className="flex justify-center p-2">
                  <ChevronDown className="w-6 h-6 text-slate-300 opacity-20" />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

