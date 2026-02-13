import { useState } from "react";
import { Button } from "@/components/ui/button";
import dailyQuizIcon from "@/assets/daily-quize-icon.png";
import { DailyQuizModal } from "./DailyQuizModal";

interface DailyQuizBannerProps {
  onComplete?: () => void;
  isCompleted?: boolean;
}

export function DailyQuizBanner({ onComplete, isCompleted }: DailyQuizBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-[#D2EDDD] to-[#F1F7D8] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-[#C7DD66]/30 animate-fade-in relative overflow-hidden">
        {/* Decorative pattern for completed state */}
        {isCompleted && (
          <div className="absolute top-0 right-0 w-32 h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-emerald-600 rotate-12">
              <path d="M50 0 L100 100 L0 100 Z" />
            </svg>
          </div>
        )}

        <div className="flex items-center gap-5 w-full md:w-auto text-left relative z-10">
          <div className="flex-shrink-0">
            <img
              src={dailyQuizIcon}
              alt="Daily Quiz"
              className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-sm"
            />
          </div>
          <div>
            <h3 className="font-medium text-slate-800 text-lg md:text-xl mb-1">Daily Quiz Challenge</h3>
            <p className="text-sm font-medium text-slate-600 max-w-md">
              {isCompleted ? "You've successfully maintained your streak for today!" : "Complete today's quiz to maintain your streak!"}
            </p>
          </div>
        </div>

        {isCompleted ? (
          <div className="bg-emerald-500 text-white px-8 h-11 rounded-xl flex items-center justify-center font-bold shadow-md z-10">
            Completed! ✅
          </div>
        ) : (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-slate-900 border-none hover:bg-white/90 hover:scale-[1.02] shadow-sm font-bold px-8 h-11 rounded-xl transition-all w-full md:w-auto z-10"
          >
            Start Quiz
          </Button>
        )}
      </div>

      <DailyQuizModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={onComplete}
      />
    </>
  );
}

