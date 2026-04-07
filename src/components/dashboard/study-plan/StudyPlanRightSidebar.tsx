import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, isWithinInterval } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  Target,
  Pencil,
  Save,
  Loader2,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { UserMe } from "@/services/auth.service";
import studyService, { StudyNote } from "@/services/study.service";
import { StudyPlanCalendar } from "@/components/dashboard";
import { DayCycleItem } from "@/components/dashboard/StudyPlanCalendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getMediaUrl } from "@/lib/utils";

// Static data fallbacks
const notesData = [
  { id: 1001, month: "Dec", day: 26, title: "Geography", subtitle: "Disaster management", fullDate: "2025-12-26", content: "Focus on early warning systems and community-based disaster risk reduction strategies. Studied the role of NGOs in disaster response." },
  { id: 1002, month: "Dec", day: 28, title: "Indian Economy", subtitle: "Rural Welfare oriented programmes", fullDate: "2025-12-28", content: "Analyzed the impact of MGNREGA on rural employment and the recent changes in the Pradhan Mantri Awas Yojana guidelines." },
  { id: 1003, month: "Jan", day: 5, title: "History", subtitle: "Mughal Architecture", fullDate: "2026-01-05", content: "Reviewed the architectural highlights of the Taj Mahal and Red Fort. Noted the blend of Persian, Islamic, and Indian styles." },
  { id: 1004, month: "Jan", day: 12, title: "Polity", subtitle: "Fundamental Rights", fullDate: "2026-01-12", content: "Deep dive into Articles 14-18 (Right to Equality) and Articles 19-22 (Right to Freedom). Memorized key judicial interpretations." },
  { id: 1005, month: "Jan", day: 15, title: "Science", subtitle: "Human Anatomy", fullDate: "2026-01-15", content: "Studied the cardiovascular system, heart structure, and the mechanics of blood circulation. Revised the names of major arteries and veins." },
];

interface StudyPlanRightSidebarProps {
  user: UserMe | null;
  avatarUrl: string;
  initials: string;
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
  planDays: DayCycleItem[];
  notes?: StudyNote[];
  areasToImprove?: any[];
  features?: any;
  examDate?: string;
}

export const StudyPlanRightSidebar = ({
  user,
  onDateClick,
  selectedDate,
  planDays,
  notes = [],
  areasToImprove = [],
  features,
  examDate
}: StudyPlanRightSidebarProps) => {
  const [noteSearch, setNoteSearch] = useState("");
  const [localNotes, setLocalNotes] = useState<any[]>([]);
  const [selectedDetailNote, setSelectedDetailNote] = useState<any | null>(null);
  const [showAllNotesView, setShowAllNotesView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterView, setFilterView] = useState<"options" | "months">("options");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [editBuffer, setEditBuffer] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (notes && notes.length > 0) {
      const formatted = notes.map(n => {
        const date = new Date(n.created_at || new Date());
        return {
          id: n.id,
          month: format(date, "MMM"),
          day: parseInt(format(date, "dd")),
          title: n.title,
          subtitle: "Topic Note",
          fullDate: format(date, "yyyy-MM-dd"),
          content: n.content
        };
      });
      formatted.sort((a, b) => new Date(b.fullDate).getTime() - new Date(a.fullDate).getTime());
      setLocalNotes(formatted);
    } else if (notes && notes.length === 0) {
      setLocalNotes([]);
    } else {
      setLocalNotes(notesData);
    }
  }, [notes]);

  const handleEditClick = () => {
    setEditBuffer(selectedDetailNote);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editBuffer || !selectedDetailNote) return;
    setIsSaving(true);

    try {
      if (editBuffer.id) {
        await studyService.updateNote(editBuffer.id, {
          title: editBuffer.title,
          content: editBuffer.content
        });
        toast.success("Note synchronized successfully");
      } else {
        const updatedNotes = localNotes.map(n =>
          n.fullDate === selectedDetailNote.fullDate && n.title === selectedDetailNote.title
            ? editBuffer
            : n
        );
        setLocalNotes(updatedNotes);
        toast.success("Mock note updated");
      }

      await queryClient.invalidateQueries({ queryKey: ['user-notes', user?.id] });
      setSelectedDetailNote(editBuffer);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Sync error: Failed to save changes to cloud");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {showAllNotesView ? (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAllNotesView(false)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-medium text-foreground">My Study Notes</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                placeholder="Search keywords"
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="pl-9 h-10 rounded-lg bg-secondary/50 border-border text-sm"
              />
            </div>
            <DropdownMenu onOpenChange={(open) => !open && setFilterView("options")}>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "p-2 rounded-xl border border-border/50 transition-colors outline-none",
                  activeFilter !== "all" ? "bg-primary/10 text-primary border-primary/20" : "hover:bg-secondary text-foreground/70"
                )}>
                  <div className="flex flex-col gap-[3px] items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px] p-1 rounded-2xl border-none shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] bg-white overflow-hidden">
                <AnimatePresence mode="wait">
                  {filterView === "options" ? (
                    <motion.div
                      key="options"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="py-1"
                    >
                      <DropdownMenuItem
                        onClick={() => setActiveFilter("all")}
                        className={cn(
                          "px-4 py-2 text-xs font-medium border-b border-slate-50 rounded-none cursor-pointer focus:bg-slate-50",
                          activeFilter === "all" ? "text-primary bg-slate-50" : "text-[#1E293B]"
                        )}
                      >
                        All Notes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setActiveFilter("last-week")}
                        className={cn(
                          "px-4 py-2 text-xs font-medium border-b border-slate-50 rounded-none cursor-pointer focus:bg-slate-50",
                          activeFilter === "last-week" ? "text-primary bg-slate-50" : "text-[#1E293B]"
                        )}
                      >
                        Last week
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setActiveFilter("this-month")}
                        className={cn(
                          "px-4 py-2 text-xs font-medium border-b border-slate-50 rounded-none cursor-pointer focus:bg-slate-50",
                          activeFilter === "this-month" ? "text-primary bg-slate-50" : "text-[#1E293B]"
                        )}
                      >
                        This month
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setFilterView("months");
                        }}
                        className="px-4 py-2 text-xs font-medium text-[#1E293B] hover:bg-slate-50 flex justify-between items-center rounded-none cursor-pointer focus:bg-slate-50"
                      >
                        Previous months
                        <CalendarIcon className="w-4 h-4 text-[#94A3B8]" />
                      </DropdownMenuItem>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="months"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4"
                    >
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedYear(y => y - 1); }} className="hover:text-primary transition-colors">
                          <ChevronLeft className="w-5 h-5 text-[#94A3B8]" />
                        </button>
                        <span className="text-xs font-medium text-[#1E293B]">{selectedYear}</span>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedYear(y => y + 1); }} className="hover:text-primary transition-colors">
                          <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, idx) => {
                          const isDisabled = (selectedYear === 2026 && idx > 1) || (selectedYear > 2026);
                          const filterKey = `${month}-${selectedYear}`;
                          return (
                            <button
                              key={month}
                              disabled={isDisabled}
                              onClick={() => {
                                setActiveFilter(filterKey);
                              }}
                              className={cn(
                                "text-xs font-medium py-1 px-2 rounded-lg transition-colors text-center",
                                isDisabled ? "text-[#CBD5E1] cursor-not-allowed" :
                                  activeFilter === filterKey ? "text-primary bg-primary/10" : "text-[#1E293B] hover:text-primary cursor-pointer"
                              )}
                            >
                              {month}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {activeFilter !== "all" && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
                Showing: {activeFilter.replace("-", " ")}
              </span>
              <button
                onClick={() => setActiveFilter("all")}
                className="text-[10px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-1"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="space-y-4">
            {(() => {
              const filtered = localNotes.filter(n => {
                const matchesSearch = n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
                  n.subtitle.toLowerCase().includes(noteSearch.toLowerCase());

                if (!matchesSearch) return false;
                if (activeFilter === "all") return true;

                const noteDate = new Date(n.fullDate);
                const today = new Date();

                if (activeFilter === "last-week") {
                  const sevenDaysAgo = subDays(today, 7);
                  return isWithinInterval(noteDate, { start: sevenDaysAgo, end: today });
                }

                if (activeFilter === "this-month") {
                  return format(noteDate, "MMM-yyyy") === format(today, "MMM-yyyy");
                }

                return format(noteDate, "MMM-yyyy") === activeFilter;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-10">
                    <p className="text-sm text-muted-foreground">No notes found for this period.</p>
                    <button
                      onClick={() => setActiveFilter("all")}
                      className="text-xs text-primary mt-2 font-medium hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                );
              }

              return filtered.map((note, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 group cursor-pointer"
                  onClick={() => { setSelectedDetailNote(note); setIsEditing(false); }}
                >
                  <div className="rounded-xl py-2 px-3 text-center min-w-[55px] bg-[#F1F8FF] group-hover:bg-[#E1F0FF] transition-colors">
                    <span className="text-[10px] font-medium text-muted-foreground block uppercase">{note.month}</span>
                    <span className="text-lg font-medium text-foreground leading-none">{note.day}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {note.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{note.subtitle}</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </motion.div >
      ) : (
        <>
          <StudyPlanCalendar
            onDateClick={onDateClick}
            selectedDate={selectedDate}
            planDays={planDays}
            examDate={examDate}
          />

          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg text-foreground">Recent Notes</h3>
              {localNotes.length > 3 && (
                <button
                  onClick={() => setShowAllNotesView(true)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-primary"
                  title="View All"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(() => {
                const filtered = localNotes.filter(n =>
                  n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
                  n.subtitle.toLowerCase().includes(noteSearch.toLowerCase())
                );

                if (filtered.length === 0) {
                  return <p className="text-xs text-muted-foreground text-center py-4">No notes found.</p>;
                }

                return filtered.slice(0, 3).map((note, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => { setSelectedDetailNote(note); setIsEditing(false); }}>
                    <div className="rounded-xl py-1 px-3 text-center min-w-[25px] bg-[#EFF6FF]">
                      <span className="text-[8px] font-medium text-muted-foreground block uppercase">{note.month}</span>
                      <span className="text-sm font-medium text-foreground leading-none">{note.day}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[12px] text-foreground truncate">{note.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{note.subtitle}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {features?.areas_to_improve && (
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg text-foreground">Areas to Improve</h3>
                <button
                  onClick={() => navigate("/progress")}
                  className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-primary"
                  title="View Detailed Progress"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {(!areasToImprove || areasToImprove.length === 0) ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Great job! No weak areas found.</p>
                ) : (
                  areasToImprove.slice(0, 3).map((item: any) => (
                    <div
                      key={item.syllabus_id}
                      className="flex items-center justify-between group cursor-pointer"
                      onClick={() => navigate("/progress")}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary/30 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                          {item.subject_image ? (
                            <img src={getMediaUrl(item.subject_image)} alt={item.subject} className="w-6 h-6" />
                          ) : (
                            <Target className="w-5 h-5 text-primary/70" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-[11px] sm:text-[12px] text-foreground leading-tight group-hover:text-primary transition-colors">
                            {item.subject}
                          </h4>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1 font-medium">{item.topic}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-1 rounded-xl border flex items-center justify-center shrink-0",
                          item.accuracy < 40 ? "bg-red-500/5 border-red-500/10" : 
                          item.accuracy < 70 ? "bg-orange-500/5 border-orange-500/10" : 
                          "bg-green-500/5 border-green-500/10"
                        )}>
                          <span className={cn(
                            "text-[9px] font-medium whitespace-nowrap",
                            item.accuracy < 40 ? "text-red-500" : 
                            item.accuracy < 70 ? "text-orange-600" : 
                            "text-green-600"
                          )}>
                            {Math.round(item.accuracy)}% Acc
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Note Detail Modal */}
      <Dialog open={!!selectedDetailNote} onOpenChange={(open) => !open && setSelectedDetailNote(null)}>
        <DialogContent className="w-[95vw] sm:max-w-lg p-0 bg-background rounded-2xl sm:rounded-3xl overflow-hidden border-border transition-all duration-300 flex flex-col max-h-[90vh]">
          {selectedDetailNote && (
            <div className="flex flex-col">
              <div className="p-4 pr-14 bg-[#EFF6FF] border-b border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl py-2 px-4 text-center bg-white shadow-sm ring-1 ring-primary/5">
                    <span className="text-xs font-medium text-primary block uppercase tracking-wider">{selectedDetailNote.month}</span>
                    <span className="text-2xl font-medium text-foreground leading-none">{selectedDetailNote.day}</span>
                  </div>
                  <div>
                    {isEditing ? (
                      <Input
                        value={editBuffer?.title}
                        onChange={(e) => setEditBuffer(prev => prev ? { ...prev, title: e.target.value } : null)}
                        className="h-8 text-md font-medium bg-white/50 border-primary/20"
                      />
                    ) : (
                      <h2 className="text-md font-medium text-foreground leading-tight">{selectedDetailNote.title}</h2>
                    )}
                    {isEditing ? (
                      <Input
                        value={editBuffer?.subtitle}
                        onChange={(e) => setEditBuffer(prev => prev ? { ...prev, subtitle: e.target.value } : null)}
                        className="h-7 text-xs mt-1 bg-white/50 border-primary/20"
                      />
                    ) : (
                      <p className="text-xs text-primary font-medium mt-1">{selectedDetailNote.subtitle}</p>
                    )}
                  </div>
                </div>

                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary transition-colors shrink-0"
                    onClick={handleEditClick}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="icon"
                    disabled={isSaving}
                    className="h-10 w-10 rounded-xl bg-[#1E293B] hover:bg-[#1E293B]/90 text-white shadow-md transition-all shrink-0"
                    onClick={handleSaveEdit}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>

              <div className="p-5 sm:p-8 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-widest">Study Reflection</span>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editBuffer?.content}
                      onChange={(e) => setEditBuffer(prev => prev ? { ...prev, content: e.target.value } : null)}
                      className="w-full min-h-[150px] p-4 rounded-2xl bg-secondary/50 border border-primary/10 text-[15px] outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                      placeholder="Type your notes here..."
                    />
                  ) : (
                    <p className="text-foreground/80 leading-relaxed text-[15px] whitespace-pre-wrap">
                      {selectedDetailNote.content}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{selectedDetailNote.fullDate}</span>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 hover:bg-primary/5 font-medium rounded-xl"
                      onClick={() => setSelectedDetailNote(null)}
                    >
                      Close
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-secondary font-medium rounded-xl"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
