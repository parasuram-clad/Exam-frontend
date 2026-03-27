import { DashboardLayout } from "@/components/layout";
import { Trophy, Medal, TrendingUp, Users, Crown, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  initials: string;
  marks: number;
  accuracy: string;
  testsCompleted: number;
  isCurrentUser?: boolean;
}

const leaderboardData: LeaderboardEntry[] = [];

const Leaderboard = () => {
  const currentUserRank = leaderboardData.find(e => e.isCurrentUser);

  return (
    <DashboardLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Medal className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-medium text-foreground">#{currentUserRank?.rank || "-"}</p>
              <p className="text-sm text-muted-foreground">Your Rank</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-medium text-foreground">{currentUserRank?.accuracy || "-"}</p>
              <p className="text-sm text-muted-foreground">Your Accuracy</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-medium text-foreground">{currentUserRank?.marks || "-"}</p>
              <p className="text-sm text-muted-foreground">Total Marks</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-medium text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Total Participants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium - Compact Version */}
      <div className="bg-gradient-to-br from-accent/20  to-accent/10 rounded-2xl p-4 md:p-6 mb-6 border border-accent/20 shadow-lg relative overflow-hidden min-h-[200px] flex flex-col items-center justify-center">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[30%] h-[30%] bg-accent/20 rounded-full blur-[80px] opacity-30" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[80px] opacity-30" />
        </div>

        {leaderboardData.length >= 3 ? (
          <div className="relative z-10 w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium text-slate-900 leading-none mb-1">Top Performers</h2>
                <p className="text-slate-500 text-[11px] md:text-sm font-medium">Best minds this week</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-accent/30 flex items-center gap-1.5 shadow-sm">
                <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                <span className="text-slate-800 font-medium text-[10px] md:text-xs">Current Week</span>
              </div>
            </div>

            <div className="flex justify-center items-end gap-1 md:gap-8 pt-6">
              {/* 2nd Place */}
              <div className="flex flex-col items-center group">
                <div className="relative mb-2 shrink-0">
                  <Avatar className="w-12 h-12 md:w-20 md:h-20 border-2 md:border-4 border-white shadow-md relative">
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-sm md:text-xl font-medium">
                      {leaderboardData[1].initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-1 bg-slate-400 text-white w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center font-medium text-[10px] md:text-xs border-2 border-white shadow-sm">
                    2
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-t-xl w-20 md:w-28 h-14 md:h-20 flex flex-col items-center justify-end pb-2 border-x border-t border-white/80 shadow-sm">
                  <p className="text-[10px] md:text-xs font-medium text-slate-800 text-center px-1 truncate w-full">{leaderboardData[1].name.split(' ')[0]}</p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 font-medium">{leaderboardData[1].marks} pts</p>
                </div>
              </div>

              {/* 1st Place - The Winner */}
              <div className="flex flex-col items-center -mt-8 group z-20">
                <div className="relative mb-3 shrink-0">
                  <div className="absolute -inset-4 bg-accent/30 rounded-full blur-xl opacity-60 animate-pulse" />
                  <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2">
                    <Crown className="w-6 h-6 md:w-8 md:h-8 text-accent fill-accent drop-shadow-md" />
                  </div>
                  <Avatar className="w-16 h-16 md:w-28 md:h-28 border-2 md:border-4 border-white shadow-xl relative scale-110">
                    <AvatarFallback className="bg-accent text-accent-foreground text-lg md:text-2xl font-medium">
                      {leaderboardData[0].initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-1 bg-accent text-accent-foreground w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center font-medium text-xs md:text-base border-2 md:border-4 border-white shadow-lg">
                    1
                  </div>
                </div>
                <div className="bg-white rounded-t-2xl w-24 md:w-36 h-24 md:h-32 flex flex-col items-center justify-end pb-3 border-x border-t border-accent/20 shadow-[0_-10px_30px_-10px_rgba(199,221,102,0.4)]">
                  <p className="text-xs md:text-base font-medium text-slate-900 text-center px-1 truncate w-full mb-1">{leaderboardData[0].name.split(' ')[0]}</p>
                  <div className="bg-accent px-2 md:px-3 py-1 rounded-full">
                    <p className="text-[9px] md:text-[11px] text-accent-foreground font-medium tracking-tight">{leaderboardData[0].marks} PTS</p>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center group">
                <div className="relative mb-2 shrink-0">
                  <Avatar className="w-10 h-10 md:w-16 md:h-16 border-2 md:border-4 border-white shadow-md relative">
                    <AvatarFallback className="bg-amber-50 text-amber-700 text-xs md:text-lg font-medium">
                      {leaderboardData[2].initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-1 bg-amber-600 text-white w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center font-medium text-[8px] md:text-[10px] border-2 border-white shadow-sm">
                    3
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-t-xl w-18 md:w-24 h-10 md:h-16 flex flex-col items-center justify-end pb-2 border-x border-t border-white/80 shadow-sm">
                  <p className="text-[10px] md:text-xs font-medium text-slate-800 text-center px-1 truncate w-full">{leaderboardData[2].name.split(' ')[0]}</p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 font-medium">{leaderboardData[2].marks} pts</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-4 py-8">
            <Trophy className="w-16 h-16 text-accent/30" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-800">No Leaders Yet</h3>
              <p className="text-sm text-slate-500">Compete in tests to see the leaderboard grow!</p>
            </div>
          </div>
        )}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_80px_80px_80px] gap-2 p-4 border-b border-border text-xs font-medium text-muted-foreground">
          <span>Rank</span>
          <span>Student</span>
          <span className="text-right">Tests</span>
          <span className="text-right">Marks</span>
          <span className="text-right">Accuracy</span>
        </div>
        <div className="divide-y divide-border">
          {leaderboardData.map((entry) => (
            <div
              key={entry.rank}
              className={cn(
                "grid grid-cols-[60px_1fr_80px_80px_80px] gap-2 p-4 items-center",
                entry.isCurrentUser && "bg-accent/10"
              )}
            >
              <div className="flex items-center">
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    entry.rank === 1
                      ? "bg-accent text-accent-foreground"
                      : entry.rank === 2
                        ? "bg-muted text-foreground"
                        : entry.rank === 3
                          ? "bg-warning/30 text-foreground"
                          : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {entry.rank}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {entry.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground text-sm">
                  {entry.name}
                  {entry.isCurrentUser && <span className="text-info ml-1 font-medium">(You)</span>}
                </span>
              </div>
              <span className="text-right text-sm text-muted-foreground">{entry.testsCompleted}</span>
              <span className="text-right text-sm font-medium text-foreground">{entry.marks}</span>
              <span className="text-right text-sm font-medium text-success">{entry.accuracy}</span>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full">
            Load More
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
