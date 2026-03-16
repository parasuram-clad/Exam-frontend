import { motion } from "framer-motion";

interface StudyBannerCountdownProps {
  daysLeft: number;
  user: any;
  overallProgress: number;
  currentProgressDay: number;
}

export const StudyBannerCountdown = ({
  daysLeft,
  user,
  overallProgress,
  currentProgressDay
}: StudyBannerCountdownProps) => {
  const suffix = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl px-5 py-6 sm:px-6 sm:py-7 md:px-8 md:py-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#1D2C4E] rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#334F90]/50 rounded-2xl" />

      {/* Animated Glow Blobs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none"
      />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10">
          <span className="text-xl sm:text-2xl md:text-3xl font-medium text-accent">{daysLeft}</span>
          <span className="text-primary-foreground text-sm sm:text-base md:text-xl font-medium">
            Days Left for {user?.exam_type || "TNPSC"} {user?.sub_division || "Group IV"}
          </span>
        </div>

        <div className="relative px-2">
          {/* Day indicator */}
          <motion.div
            className="absolute -top-7 pointer-events-none"
            initial={{ left: "0%" }}
            animate={{ left: `${overallProgress}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
          >
            <div className="flex items-center gap-1.5 -translate-x-[4px] md:-translate-x-[5px]">
              <span className="text-accent text-[10px] sm:text-xs md:text-sm font-medium whitespace-nowrap">
                ▼ {currentProgressDay}{suffix(currentProgressDay)} Day
              </span>
            </div>
          </motion.div>

          <div className="relative">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </div>

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-accent rounded-full shadow-[0_0_12px_rgba(202,238,54,0.8)] z-10"
              initial={{ left: "0%" }}
              animate={{ left: `${overallProgress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            />

            <div className="absolute -top-8 -right-0 flex flex-col items-center">
              <motion.svg
                width="14"
                height="34"
                viewBox="0 0 14 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 sm:h-10 w-auto"
              >
                <path d="M12.7967 0.00299072L12.5938 33.925" stroke="white" stroke-miterlimit="10" />
                <motion.path
                  d="M0 1.62801L0.406283 8.12809C0.406283 8.12809 1.21872 9.34682 4.06247 7.92494C4.06247 7.92494 5.28119 6.50308 7.10936 7.7218C7.10936 7.7218 9.34367 6.09677 13 7.3155L12.7969 0.00299072C12.7969 0.00299072 7.31251 0.00299298 7.71865 1.42487C7.71865 1.42487 5.07804 2.03431 3.65616 1.42487L0 1.62801"
                  fill="#C7DD66"
                  style={{ originX: "100%", originY: "0%" }}
                />
              </motion.svg>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <span className="text-primary-foreground/60 text-xs font-medium">Overall Progress</span>
          <span className="text-accent text-xs font-medium">{overallProgress}%</span>
        </div>
      </div>
    </motion.div>
  );
};
