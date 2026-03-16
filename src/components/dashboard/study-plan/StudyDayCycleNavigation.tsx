import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, ClipboardList, RotateCcw, BookOpen, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayCycleItem } from "@/components/dashboard/StudyPlanCalendar";

interface StudyDayCycleNavigationProps {
  totalDays: number;
  dynamicDayCycle: DayCycleItem[];
  activeDay: number;
  showLeftArrow: boolean;
  showRightArrow: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  scroll: (direction: 'left' | 'right') => void;
  handleDayClick: (day: DayCycleItem) => void;
}

export const StudyDayCycleNavigation = ({
  totalDays,
  dynamicDayCycle,
  activeDay,
  showLeftArrow,
  showRightArrow,
  scrollContainerRef,
  handleScroll,
  scroll,
  handleDayClick
}: StudyDayCycleNavigationProps) => {
  return (
    <section>
      <h2 className="text-lg font-medium text-foreground mb-4">{totalDays}-Day Cycle</h2>

      <div className="relative group/cycle">
        <AnimatePresence>
          {showLeftArrow && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-3.5 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-sm items-center justify-center text-muted-foreground hover:text-accent-foreground hover:bg-accent hover:scale-105 hover:shadow-md transition-all hidden sm:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRightArrow && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-3.5 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-sm items-center justify-center text-muted-foreground hover:text-accent-foreground hover:bg-accent hover:scale-105 hover:shadow-md transition-all hidden sm:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex items-start gap-0 overflow-x-auto pb-4 pt-1 scrollbar-hide scroll-smooth sm:px-4"
        >
          {dynamicDayCycle.map((item, index) => (
            <div key={index} data-day={item.day} className="flex items-start shrink-0">
              <div className="flex flex-col items-center w-[60px] md:w-[72px] shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDayClick(item)}
                  className={cn(
                    "w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-200 relative cursor-pointer",
                    item.status === "completed" && "bg-primary text-primary-foreground",
                    item.status === "current" && "bg-accent text-accent-foreground shadow-lg ring-2 ring-accent/30",
                    item.status === "locked" && "bg-secondary text-muted-foreground/50 hover:bg-secondary/80",
                    item.status === "assessment" && "bg-card border-2 border-dashed border-border text-muted-foreground",
                    activeDay === item.day && item.status === "locked" && "ring-2 ring-primary/20 bg-secondary/80 text-foreground",
                    activeDay === item.day && item.status !== "locked" && "ring-4 ring-accent/40 scale-105"
                  )}
                >
                  {item.status === "completed" ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                  ) : item.isAssessment ? (
                    <ClipboardList className="w-4 h-4 md:w-5 md:h-5" />
                  ) : item.isRevision ? (
                    <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                  ) : item.status === "current" ? (
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <Lock className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </motion.button>
                <span className={cn(
                  "text-[10px] md:text-[11px] mt-2 font-medium text-center leading-tight",
                  item.status === "locked" ? "text-muted-foreground/40" : "text-muted-foreground",
                  activeDay === item.day && "text-foreground font-medium"
                )}>
                  {item.label}
                </span>
              </div>

              {index < dynamicDayCycle.length - 1 && (
                <div className="w-6 md:w-10 h-11 md:h-14 flex items-center justify-center shrink-0">
                  <div className="w-full h-[2.5px] bg-[linear-gradient(to_right,#9C9C9C_6px,transparent_4px)] bg-[length:10px_100%]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
