import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Target, BookOpen, Calendar, Zap, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Asset imports
import modalTopLeft from "@/assets/study-plan/top-left-mid.png";
import modalTopRight from "@/assets/study-plan/top-right-mid.png";
import modalBottomLeft from "@/assets/study-plan/bottom-left.png";
import modalBottomRight from "@/assets/study-plan/bottom-right.png";

interface GeneratePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => Promise<void>;
  initialData?: any;
}

const EXAM_SUB_DIVISIONS: Record<string, string[]> = {
  "TNPSC": ["Group I", "Group II", "Group IIA", "Group IV"],
  "TNTET": ["TET Paper I", "TET Paper II", "PG TET"],
  "TNUSRB": ["SI/SO", "PC/Fireman"]
};

export const GeneratePlanModal: React.FC<GeneratePlanModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  initialData = {},
}) => {
  const [formData, setFormData] = useState({
    exam_type: initialData.exam_type || "TNPSC",
    sub_division: initialData.sub_division || "Group IV",
    year: initialData.target_exam_year ? Number(initialData.target_exam_year) : 2026,
    language: initialData.preferred_language === "ta" ? "Tamil" : (initialData.preferred_language || "English"),
    learner_type: initialData.learner_type || "Student",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onGenerate(formData);
      onClose();
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[92vw] max-w-xl p-0 overflow-hidden border-none bg-white rounded-[24px] shadow-2xl max-h-[95vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative p-6 sm:p-10 bg-[radial-gradient(circle_at_top,#FAFFE9_0%,transparent_50%),linear-gradient(to_br,#F8FAFF_0%,white_50%,#F0F7FF_100%)] min-h-[500px] flex flex-col justify-center overflow-hidden">
          <div className="absolute top-[-90%] left-0 w-full h-full rounded-full bg-gradient-to-br from-[#DDEFD9] via-white to-[#DDEFD9] min-h-[500px] flex flex-col blur-2xl justify-center"></div>
          
          <div className="absolute top-20 left-0 w-20 h-20 pointer-events-none opacity-20">
            <img src={modalTopLeft} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute top-24 right-0 w-24 h-24 pointer-events-none opacity-20">
            <img src={modalTopRight} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none">
            <img src={modalBottomLeft} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute bottom-0 right-0 w-32 pointer-events-none">
            <img src={modalBottomRight} alt="" className="w-full h-full object-contain" />
          </div>

          <div className="relative z-10 text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-medium text-[#1E293B] mb-1.5 leading-tight">Configure Your Test Series</h2>
            <p className="text-[#64748B] text-sm sm:text-[15px]">We'll personalize your preparation path</p>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Exam Type</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Target className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    value={formData.exam_type}
                    onValueChange={(v) => setFormData({ ...formData, exam_type: v, sub_division: EXAM_SUB_DIVISIONS[v]?.[0] || "" })}
                  >
                    <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 p-2 bg-white">
                      {Object.keys(EXAM_SUB_DIVISIONS).map((type) => (
                        <SelectItem key={type} value={type} className="rounded-lg focus:bg-accent/10">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Target Year</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Calendar className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    value={formData.year.toString()}
                    onValueChange={(v) => setFormData({ ...formData, year: parseInt(v) })}
                  >
                    <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 p-2 bg-white">
                      {[2025, 2026, 2027].map((y) => (
                        <SelectItem key={y} value={y.toString()} className="rounded-lg focus:bg-accent/10">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Choose Your Exam</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <BookOpen className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    value={formData.sub_division}
                    onValueChange={(v) => setFormData({ ...formData, sub_division: v })}
                  >
                    <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                      <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 p-2 bg-white">
                      {EXAM_SUB_DIVISIONS[formData.exam_type]?.map((sub) => (
                        <SelectItem key={sub} value={sub} className="rounded-lg focus:bg-accent/10">
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Preferred Language</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <Globe className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                  </div>
                  <Select
                    value={formData.language}
                    onValueChange={(v) => setFormData({ ...formData, language: v })}
                  >
                    <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 p-2 bg-white">
                      <SelectItem value="English" className="rounded-lg focus:bg-accent/10">English Medium</SelectItem>
                      <SelectItem value="Tamil" className="rounded-lg focus:bg-accent/10">Tamil Medium</SelectItem>
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
                    value={formData.learner_type}
                    onValueChange={(v) => setFormData({ ...formData, learner_type: v })}
                  >
                    <SelectTrigger className="w-full bg-muted/30 border-none h-12 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-accent/20 font-medium transition-all hover:bg-muted/50 focus:bg-background text-foreground/80 shadow-none">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 p-2 bg-white">
                      <SelectItem value="Student" className="rounded-lg focus:bg-accent/10">Student</SelectItem>
                      <SelectItem value="Employee" className="rounded-lg focus:bg-accent/10">Working Professional</SelectItem>
                      <SelectItem value="Full Timer" className="rounded-lg focus:bg-accent/10">Full-time Aspirant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4 pb-2">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-10 rounded-full bg-[#1E293B] hover:bg-[#0F172A] text-white text-sm font-medium shadow-lg transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400 group-hover:animate-pulse" />
                    Generate My Test Series
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
