import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Trophy,
  Flame,
  AlertCircle,
  Target,
  Calendar, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Mock data for the charts
const testWiseData = [
  { name: "Language", score: 76, color: "#10b981" },
  { name: "Aptitude", score: 82, color: "#10b981" },
  { name: "General Studies", score: 66, color: "#10b981" },
];

const subjectWiseData = [
  { name: "History", progress: 80, color: "#6366f1" },
  { name: "Polity", progress: 65, color: "#ec4899" },
  { name: "Geography", progress: 45, color: "#f59e0b" },
  { name: "Economy", progress: 30, color: "#8b5cf6" },
];

const streakData = [
  [null, null, null, null, null, 1, 2],
  [3, 4, 5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14, 15, 16],
  [17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30],
];

const areasToImprove = [
  {
    icon: "🏛️",
    title: "Indian Constitution",
    subtitle: "Supreme Court",
    accuracy: "42% Acc",
    color: "text-red-500"
  },
  {
    icon: "⚖️",
    title: "Profit & Loss",
    subtitle: "Time Saving",
    accuracy: "55% Acc",
    color: "text-orange-500"
  },
  {
    icon: "👑",
    title: "Mughal Empire",
    subtitle: "Key Accuracy",
    accuracy: "38% Acc",
    color: "text-red-500"
  },
];

const MyProgress = () => {
  const [currentMonth, setCurrentMonth] = useState("June 2025");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-8"
      >
        {/* Top Row - Overall Performance & Progress Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Performance */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 h-full bg-gradient-to-br from-green-50 via-green-50/50 to-white border-green-100/50 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-8">
                Overall Performance
              </h3>
              <div className="flex items-center justify-between gap-12">
                {/* Left Side - Circular Progress */}
                <div className="flex-shrink-0">
                  <div className="relative w-44 h-44">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Background Circle */}
                      <circle
                        cx="88"
                        cy="88"
                        r="80"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                        fill="transparent"
                      />
                      {/* Animated Progress Circle */}
                      <motion.circle
                        cx="88"
                        cy="88"
                        r="80"
                        stroke="#1a1a2e"
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 80}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                        animate={{
                          strokeDashoffset: 2 * Math.PI * 80 * (1 - 0.85),
                        }}
                        transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        85%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Trend Line with Flag */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  {/* Wavy Trend Line with Flag */}
                  <div className="relative w-full h-32">
                    <svg
                      viewBox="0 0 300 120"
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Wavy Path */}
                      <motion.path
                        d="M 20 90 Q 60 70, 80 75 T 140 60 T 200 45 T 260 30"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                      />
                      {/* Start Dot */}
                      <motion.circle
                        cx="20"
                        cy="90"
                        r="5"
                        fill="#1a1a2e"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                      />
                      {/* Flag at End */}
                      <motion.g
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2 }}
                      >
                        {/* Flag Pole */}
                        <line
                          x1="260"
                          y1="30"
                          x2="260"
                          y2="10"
                          stroke="#1a1a2e"
                          strokeWidth="2"
                        />
                        {/* Flag */}
                        <path
                          d="M 260 10 L 280 15 L 260 20 Z"
                          fill="#1a1a2e"
                        />
                      </motion.g>
                    </svg>
                  </div>

                  {/* Text Below */}
                  <div className="text-center space-y-2">
                    <p className="text-base font-semibold text-gray-900">
                      +8% from last week
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      Doing Great! Keep Going
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Progress Summary */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 h-full">
              <h3 className="text-base font-bold text-gray-900 mb-8">
                Progress Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Syllabus Completed */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {/* Certificate Icon */}
                      <div className="w-12 h-12 relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-lg transform rotate-3" />
                        <div className="absolute inset-0 bg-blue-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-6 h-0.5 bg-blue-500 mx-auto mb-0.5 rounded" />
                            <div className="w-4 h-0.5 bg-blue-400 mx-auto mb-0.5 rounded" />
                            <div className="w-3 h-3 bg-yellow-400 rounded-full mx-auto mt-0.5 border border-yellow-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 leading-none mb-1">45%</p>
                      <p className="text-xs text-gray-600 font-medium ">Syllabus Completed</p>
                    </div>
                  </div>
                </motion.div>

                {/* Average Accuracy */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-2xl border border-yellow-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0">
                      {/* Trophy Icon */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-2 bg-amber-700 rounded-sm" />
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-9 h-7 bg-yellow-400 rounded-t-full border-2 border-yellow-600 flex items-center justify-center">
                        <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                      <div className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 leading-none mb-1">75%</p>
                      <p className="text-xs text-gray-600 font-medium ">Average Accuracy</p>
                    </div>
                  </div>
                </motion.div>

                {/* Best Score */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border border-green-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0">
                      {/* Podium Icon */}
                      <div className="absolute bottom-0 left-0 w-3 h-6 bg-yellow-400 rounded-t" />
                      <div className="absolute bottom-0 left-4.5 w-3 h-9 bg-red-400 rounded-t" />
                      <div className="absolute bottom-0 right-0 w-3 h-4 bg-green-400 rounded-t" />
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                        <Trophy className="w-4 h-4 text-blue-500 fill-blue-200" />
                      </div>
                      <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-blue-300 rounded-full" />
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-300 rounded-full" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 leading-none mb-1">96%</p>
                      <p className="text-xs text-gray-600 font-medium ">Best Score</p>
                    </div>
                  </div>
                </motion.div>

                {/* Tests Completed */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0">
                      {/* Clipboard Icon */}
                      <div className="absolute inset-0 bg-gray-700 rounded-lg" />
                      <div className="absolute inset-1 bg-white rounded" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-gray-600 rounded-b" />
                      <div className="absolute top-4 left-3 right-3 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-green-500 fill-green-100" />
                          <div className="flex-1 h-1 bg-gray-200 rounded" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-green-500 fill-green-100" />
                          <div className="flex-1 h-1 bg-gray-200 rounded" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                          <div className="flex-1 h-1 bg-gray-200 rounded" />
                        </div>
                      </div>
                      <div className="absolute top-2 -right-1 w-2 h-2 bg-purple-400 rounded-full" />
                      <div className="absolute bottom-2 -left-1 w-2 h-2 bg-purple-400 rounded-full" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 leading-none mb-1">12/50</p>
                      <p className="text-xs text-gray-600 font-medium ">Tests Completed</p>
                    </div>
                  </div>
                </motion.div>

                {/* Current Streak */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      {/* Flame Icon */}
                      <div className="relative">
                        <Flame className="w-9 h-9 text-orange-500 fill-orange-500" />
                        <Flame className="w-6 h-6 text-yellow-400 fill-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-300 rounded-full" />
                      <div className="absolute bottom-2 left-0 w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                      <div className="absolute top-2 left-1 w-1.5 h-1.5 bg-orange-300 rounded-full" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 leading-none mb-1">3 Days</p>
                      <p className="text-xs text-gray-600 font-medium ">Current Streak</p>
                    </div>
                  </div>
                </motion.div>

                {/* Lowest Score */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      {/* Alert Trophy Icon */}
                      <div className="relative">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-2 bg-gray-700 rounded-sm" />
                      </div>
                      <div className="absolute top-0 right-2 w-2 h-2 bg-yellow-300 rounded-full" />
                      <div className="absolute bottom-4 left-1 w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                      <div className="absolute top-3 left-2 w-1.5 h-1.5 bg-blue-300 rounded-full" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 leading-none mb-1">52%</p>
                      <p className="text-xs text-gray-600 font-medium ">Lowest Score</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Middle Row - Subject Wise & Test Wise Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Wise Progress */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 h-full">
              <h3 className="text-sm font-semibold text-gray-700 mb-6">
                Subject Wise Progress
              </h3>

              {/* Rainbow Arc Visualization */}
              <div className="relative h-40 mb-8">
                <svg
                  viewBox="0 0 200 100"
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {subjectWiseData.map((subject, index) => {
                    const radius = 80 - index * 12;
                    const circumference = Math.PI * radius;
                    const progress = subject.progress / 100;
                    const strokeDashoffset =
                      circumference - progress * circumference;

                    return (
                      <motion.path
                        key={subject.name}
                        d={`M 20 90 A ${radius} ${radius} 0 0 1 180 90`}
                        fill="none"
                        stroke={subject.color}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, delay: index * 0.1 }}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-3">
                {subjectWiseData.map((subject) => (
                  <div key={subject.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {subject.name}
                    </span>
                    <span className="text-xs font-bold text-gray-900 ml-auto">
                      {subject.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Test Wise Progress */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 h-full">
              <h3 className="text-sm font-semibold text-gray-700 mb-6">
                Test Wise Progress
              </h3>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={testWiseData} margin={{ top: 20 }}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg">
                              <p className="text-xs font-semibold">
                                {payload[0].payload.name}
                              </p>
                              <p className="text-sm font-bold text-green-600">
                                {payload[0].value}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={60}>
                      {testWiseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 mt-4">
                {testWiseData.map((test) => (
                  <div key={test.name} className="text-center">
                    <p className="text-xs text-gray-600">{test.name}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {test.score}%
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row - Streak Consistency & Areas to Improve */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Streak Consistency */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-700">
                  Streak Consistency
                </h3>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {currentMonth}
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2 text-center mb-3">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div
                      key={i}
                      className="text-xs font-semibold text-gray-500"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {streakData.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-2">
                    {week.map((day, dayIndex) => {
                      const isCompleted = day && [1, 6, 7, 10];
                      const isPartial = day && [4];
                      const isSkipped = day && [8];
                      const isToday = day === 11;

                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            "aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                            !day && "bg-transparent",
                            day &&
                            !isCompleted &&
                            !isPartial &&
                            !isSkipped &&
                            "bg-gray-100 text-gray-400",
                            isCompleted && "bg-green-500 text-white",
                            isPartial && "bg-orange-300 text-white",
                            isSkipped && "bg-gray-300 text-gray-600",
                            isToday && "ring-2 ring-blue-500"
                          )}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-6 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-gray-600">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-orange-300" />
                  <span className="text-gray-600">Partial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gray-300" />
                  <span className="text-gray-600">Skipped</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Areas to Improve */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 h-full">
              <h3 className="text-sm font-semibold text-gray-700 mb-6">
                Areas to Improve
              </h3>

              <div className="space-y-4">
                {areasToImprove.map((area, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm">
                        {area.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {area.title}
                        </p>
                        <p className="text-xs text-gray-600">{area.subtitle}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-semibold",
                        area.color === "text-red-500" &&
                        "border-red-200 bg-red-50 text-red-600",
                        area.color === "text-orange-500" &&
                        "border-orange-200 bg-orange-50 text-orange-600"
                      )}
                    >
                      {area.accuracy}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors text-sm">
                Work on Weak Areas
              </button>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default MyProgress;
