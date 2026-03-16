import React from "react";
import { motion } from "framer-motion";

interface StudyCircularProgressProps {
  progress: number;
  size?: number;
}

export const StudyCircularProgress = ({ progress, size = 48 }: StudyCircularProgressProps) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} strokeWidth="3" fill="transparent" className="stroke-border" />
        <motion.circle
          cx={center} cy={center} r={radius} strokeWidth="3" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          strokeLinecap="round"
          className={progress >= 70 ? "stroke-[#34C759]" : progress > 0 ? "stroke-accent" : "stroke-muted-foreground/30"}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-medium text-foreground leading-none">{progress}%</span>
      </div>
    </div>
  );
};
