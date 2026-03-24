import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Globe, Target, BookOpen, ChevronDown, Calendar, Zap, ChevronLeft, ChevronRight } from "lucide-react";

// Asset imports (passed as props or imported here if possible)
import modalTopLeft from "@/assets/study-plan/top-left-mid.png";
import modalTopRight from "@/assets/study-plan/top-right-mid.png";
import modalBottomLeft from "@/assets/study-plan/bottom-left.png";
import modalBottomRight from "@/assets/study-plan/bottom-right.png";

const EXAM_SUB_DIVISIONS: Record<string, string[]> = {
  "TNPSC": ["Group I", "Group II", "Group IIA", "Group IV"],
  "TNTET": ["TET Paper I", "TET Paper II", "PG TET"],
  "TNUSRB": ["SI/SO", "PC/Fireman"]
};

interface StudySetupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isGenerating: boolean;
  setupData: {
    name: string;
    medium: string;
    examType: string;
    subDivision: string[];
    learnerType: string;
    studyGoal: string;
    targetYear: string;
  };
  setSetupData: React.Dispatch<React.SetStateAction<any>>;
  onGenerate: () => void;
}

export const StudySetupModal = ({
  isOpen,
  onOpenChange,
  isGenerating,
  setupData,
  setSetupData,
  onGenerate
}: StudySetupModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="w-[92vw] max-w-xl p-0 overflow-hidden border-none bg-white rounded-[24px] shadow-2xl max-h-[95vh] overflow-y-auto"
      >
        <div className="relative p-5 sm:p-8 md:p-10 bg-[radial-gradient(circle_at_top,#FAFFE9_0%,transparent_50%),linear-gradient(to_br,#F8FAFF_0%,white_50%,#F0F7FF_100%)] min-h-[500px] flex flex-col justify-center overflow-hidden">
          <div className="absolute top-[-90%] left-0 w-full h-full rounded-full bg-gradient-to-br from-[#DDEFD9] via-white to-[#DDEFD9] min-h-[500px] flex flex-col blur-2xl justify-center"></div>
          
          <div className="absolute top-20 left-0 w-20 h-20 pointer-events-none">
            <img src={modalTopLeft} alt="" className="w-full h-full object-contain opacity-20" />
          </div>
          <div className="absolute top-24 right-0 w-24 h-24 pointer-events-none">
            <img src={modalTopRight} alt="" className="w-full h-full object-contain opacity-20" />
          </div>
          <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none">
            <img src={modalBottomLeft} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute bottom-0 right-0 w-32 pointer-events-none">
            <img src={modalBottomRight} alt="" className="w-full h-full object-contain" />
          </div>

          <div className="relative z-10 text-center mb-7">
            <h2 className="text-xl sm:text-2xl font-medium text-[#1E293B] mb-1.5 leading-tight">Set Up Your Exam Plan</h2>
            <p className="text-[#64748B] text-sm sm:text-[15px]">Help us personalize your preparation</p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Full Name</Label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={setupData.name}
                onChange={(e) => setSetupData((prev: any) => ({ ...prev, name: e.target.value }))}
                className="h-11 px-4 rounded-xl bg-muted/30 border border-[#E2E8F0] focus:ring-primary/20 hover:border-primary/30 transition-all text-[#64748B] text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Study Medium</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <Globe className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                </div>
                <Select onValueChange={(val) => setSetupData((prev: any) => ({ ...prev, medium: val }))}>
                  <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                    <SelectValue placeholder="Select Medium" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 shadow-xl p-2">
                    <SelectItem value="english" className="rounded-lg focus:bg-accent/10">English Medium</SelectItem>
                    <SelectItem value="tamil" className="rounded-lg focus:bg-accent/10">Tamil Medium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Exam Type</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <Target className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                </div>
                <Select
                  value={setupData.examType}
                  onValueChange={(value) => {
                    setSetupData({
                      ...setupData,
                      examType: value,
                      subDivision: []
                    });
                  }}
                >
                  <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                    <SelectValue placeholder="Select Exam Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 p-2">
                    <SelectItem value="TNPSC" className="rounded-lg focus:bg-accent/10">TNPSC</SelectItem>
                    <SelectItem value="TNTET" className="rounded-lg focus:bg-accent/10">TNTET</SelectItem>
                    <SelectItem value="TNUSRB" className="rounded-lg focus:bg-accent/10">TNUSRB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Choose Your Exam</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <BookOpen className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={!setupData.examType}>
                    <button className="w-full bg-muted/30 border-none h-12 pl-12 pr-10 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none text-left flex items-center justify-between overflow-hidden">
                      <span className="truncate">
                        {setupData.subDivision.length > 0
                          ? setupData.subDivision.join(", ")
                          : (setupData.examType ? "Select Exam" : "Select Exam Type First")}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-2xl border-border/50 shadow-xl max-h-60 overflow-y-auto p-2">
                    {setupData.examType && EXAM_SUB_DIVISIONS[setupData.examType]?.map((sub) => (
                      <DropdownMenuItem
                        key={sub}
                        className="w-[220px] rounded-lg flex items-center gap-3 py-2.5 px-3 focus:bg-accent/10 cursor-pointer"
                        onSelect={(e) => {
                          e.preventDefault();
                          setSetupData((prev: any) => {
                            const isChecked = prev.subDivision.includes(sub);
                            const newSub = isChecked
                              ? prev.subDivision.filter((s: string) => s !== sub)
                              : [...prev.subDivision, sub];
                            return { ...prev, subDivision: newSub };
                          });
                        }}
                      >
                        <Checkbox
                          checked={setupData.subDivision.includes(sub)}
                          onCheckedChange={(checked) => {
                            setSetupData((prev: any) => {
                              const newSub = checked
                                ? [...prev.subDivision, sub]
                                : prev.subDivision.filter((s: string) => s !== sub);
                              return { ...prev, subDivision: newSub };
                            });
                          }}
                          className="h-5 w-5 rounded-[4px] border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="font-medium text-sm text-foreground/80">{sub}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Target Exam Year</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <Calendar className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                </div>
                <Select
                  value={setupData.targetYear}
                  onValueChange={(val) => setSetupData((prev: any) => ({ ...prev, targetYear: val }))}
                >
                  <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 shadow-xl p-2">
                    {[0, 1, 2].map((offset) => {
                      const year = (new Date().getFullYear() + offset).toString();
                      return (
                        <SelectItem key={year} value={year} className="rounded-lg focus:bg-accent/10">
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Learner Type</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <Zap className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                </div>
                <Select
                  value={setupData.learnerType}
                  onValueChange={(value) => setSetupData({ ...setupData, learnerType: value })}
                >
                  <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                    <SelectValue placeholder="Select Learner Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 p-2">
                    <SelectItem value="Student" className="rounded-lg focus:bg-accent/10">Student</SelectItem>
                    <SelectItem value="Working Professional" className="rounded-lg focus:bg-accent/10">Working Professional</SelectItem>
                    <SelectItem value="Fresher" className="rounded-lg focus:bg-accent/10">Fresher</SelectItem>
                    <SelectItem value="Experienced" className="rounded-lg focus:bg-accent/10">Experienced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Daily Study Goal</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <Target className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                </div>
                <Select
                  value={setupData.studyGoal}
                  onValueChange={(value) => setSetupData({ ...setupData, studyGoal: value })}
                >
                  <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                    <SelectValue placeholder="Select Goal" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 p-2">
                    <SelectItem value="4 Hours" className="rounded-lg focus:bg-accent/10">4 Hours</SelectItem>
                    <SelectItem value="6 Hours" className="rounded-lg focus:bg-accent/10">6 Hours</SelectItem>
                    <SelectItem value="8 Hours" className="rounded-lg focus:bg-accent/10">8 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-center pb-2">
            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              className="h-11 px-8 rounded-full bg-[#1E293B] hover:bg-[#0F172A] text-white text-sm font-medium shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Generating...
                </span>
              ) : "Create My Smart Plan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
