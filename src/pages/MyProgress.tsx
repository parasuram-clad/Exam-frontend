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
  Calendar, Star, ChevronLeft, ChevronRight
} from "lucide-react";
import CardImg1 from "@/assets/my-progress/card-imag-1.png";
import CardImg2 from "@/assets/my-progress/card-imag-2.png";
import CardImg3 from "@/assets/my-progress/card-imag-3.png";
import CardImg4 from "@/assets/my-progress/card-imag-4.png";
import CardImgTop from "@/assets/my-progress/card-imag-top.png";
import CardImgBottom from "@/assets/my-progress/card-imag-bottom.png";
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
  CartesianGrid,
  LabelList,
} from "recharts";

// Mock data for the charts
const testWiseData = [
  { name: "Language", score: 76, color: "#70d44b" },
  { name: "Aptitude", score: 82, color: "#70d44b" },
  { name: "General Studies", score: 65, color: "#70d44b" },
];

const subjectWiseData = [
  { name: "History", progress: 80, color: "#6366f1" },
  { name: "Polity", progress: 65, color: "#ec4899" },
  { name: "Geography", progress: 45, color: "#f59e0b" },
  { name: "Economy", progress: 30, color: "#10b981" },
  { name: "Aptitude", progress: 90, color: "#8b5cf6" },
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
  const [viewDate, setViewDate] = useState(new Date());
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const today = new Date();

  useState(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Fill empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Fill current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Chunk into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const calendarWeeks = getCalendarDays();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const displayYear = viewDate.getFullYear();

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
            <Card className="p-4 sm:p-6 lg:p-8 h-full bg-gradient-to-br from-green-50 via-green-50/50 to-white border-green-100/50 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-8">
                Overall Performance
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12">
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
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Animated Progress Circle */}
                      <motion.circle
                        cx="88"
                        cy="88"
                        r="80"
                        stroke="#1a1a2e"
                        strokeWidth="10"
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
                      <span className="text-5xl font-semibold text-gray-900">
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
            <Card className="p-4 sm:p-6 h-full bg-white shadow-sm border-gray-100">
              <h3 className="text-xl font-semibold text-[#1a2b4b] mb-4">
                Progress Summary
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left side: 2x2 Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  {/* Syllabus Completed */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-[#FFFFFF] to-[#F8FBFF]  py-4 px-2   rounded-2xl border border-[#E8F1FF] flex items-center gap-4"
                  >
                    <img
                      src={CardImg1}
                      alt="Syllabus"
                      className="w-12 h-12 object-contain shrink-0"
                    />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">45%</p>
                      <p className="text-[10px] text-gray-600 font-medium">Syllabus Completed</p>
                    </div>
                  </motion.div>

                  {/* Average Accuracy */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-[#FFFFFF] to-[#FFF9F9] py-4 px-2   rounded-2xl border border-[#FFECEC] flex items-center gap-4"
                  >
                    <img
                      src={CardImg2}
                      alt="Accuracy"
                      className="w-12 h-12 object-contain shrink-0"
                    />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">75%</p>
                      <p className="text-[10px] text-gray-600 font-medium">Average Accuracy</p>
                    </div>
                  </motion.div>

                  {/* Tests Completed */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-[#FFFFFF] to-[#FDF8FF] py-4 px-2  rounded-2xl border border-[#FAEDFF] flex items-center gap-4"
                  >
                    <img
                      src={CardImg3}
                      alt="Tests"
                      className="w-12 h-12 object-contain shrink-0"
                    />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">12/50</p>
                      <p className="text-[10px] text-gray-600 font-medium">Tests Completed</p>
                    </div>
                  </motion.div>

                  {/* Current Streak */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-[#FFFFFF] to-[#FFFFF6]  py-4 px-2   rounded-2xl border border-[#FFF9E5] flex items-center gap-4"
                  >
                    <img
                      src={CardImg4}
                      alt="Streak"
                      className="w-12 h-12 object-contain shrink-0"
                    />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">3 Days</p>
                      <p className="text-[10px] text-gray-600 font-medium">Current Streak</p>
                    </div>
                  </motion.div>
                </div>

                {/* Right side: Tall Card for Best & Lowest Score */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FFF9] py-4 px-6 rounded-2xl border border-[#E9FCE9] flex flex-col sm:flex-row lg:flex-col items-center sm:justify-around lg:justify-center"
                >
                  {/* Best Score section */}
                  <div className="flex items-center gap-4 py-4">
                    <img
                      src={CardImgTop}
                      alt="Best Score"
                      className="w-12 h-12 object-contain shrink-0"
                    />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">96%</p>
                      <p className="text-[10px] text-gray-600 font-medium">Best Score</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-0 border-t-2 border-dashed border-[#E9FCE9] my-3 sm:hidden lg:block" />
                  <div className="w-0 h-16 border-l-2 border-dashed border-[#E9FCE9] mx-6 hidden sm:block lg:hidden" />

                  {/* Lowest Score section */}
                  <div className="flex items-center gap-4 py-4">
                    <img
                      src={CardImgBottom}
                      alt="Lowest Score"
                      className="w-12 h-12 object-contain shrink-0"
                    />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">52%</p>
                      <p className="text-[10px] text-gray-600 font-medium">Lowest Score</p>
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
            <Card className="p-4 sm:p-6 lg:p-8 h-full bg-white shadow-sm border-gray-100">
              <h3 className="text-xl font-semibold text-[#1a2b4b] mb-12">
                Subject Wise Progress
              </h3>

              {/* Rainbow Arc Visualization */}
              <div className="relative h-64 mb-12">
                <svg
                  viewBox="0 0 200 120"
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {subjectWiseData.map((subject, index) => {
                    const radius = 90 - index * 12;
                    const centerX = 100;
                    const centerY = 110;
                    const circumference = Math.PI * radius;
                    const progress = subject.progress / 100;
                    const strokeDashoffset = circumference - progress * circumference;

                    return (
                      <g key={subject.name}>
                        {/* Background Path (Light Gray) */}
                        <path
                          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
                          fill="none"
                          stroke="#f3f4f6"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        {/* Progress Path */}
                        <motion.path
                          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
                          fill="none"
                          stroke={subject.color}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1.5, delay: index * 0.1 }}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Legend - Responsive Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 lg:gap-x-12 gap-y-3 sm:gap-y-4 max-w-sm mx-auto">
                {subjectWiseData.map((subject) => (
                  <div key={subject.name} className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="text-sm font-medium text-[#4b5563]">
                      {subject.name}
                    </span>
                    <span className="text-sm font-semibold text-[#1a2b4b] ml-auto">
                      {subject.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Test Wise Progress */}
          <motion.div variants={itemVariants}>
            <Card className="p-4 sm:p-6 lg:p-8 h-full bg-white shadow-sm border-gray-100">
              <h3 className="text-xl font-semibold text-[#1a2b4b] mb-8 lg:mb-12">
                Test Wise Progress
              </h3>

              <div className="h-64 sm:h-80 lg:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={testWiseData}
                    margin={{ top: 30, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: screenWidth < 640 ? 10 : 13 }}
                      dy={10}
                      interval={0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white border border-gray-100 rounded-lg p-2 shadow-lg">
                              <p className="text-xs font-semibold text-gray-500">
                                {payload[0].payload.name}
                              </p>
                              <p className="text-sm font-semibold text-[#1a2b4b]">
                                {payload[0].value}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="score"
                      radius={[12, 12, 0, 0]}
                      barSize={screenWidth < 640 ? 40 : 80}
                    >
                      {testWiseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="score"
                        position="top"
                        formatter={(val: number) => `${val}%`}
                        fill="#1a2b4b"
                        fontSize={14}
                        fontWeight={600}
                        offset={12}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row - Streak Consistency & Areas to Improve */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Streak Consistency */}
          <motion.div variants={itemVariants}>
            <Card className="p-4 sm:p-6 lg:p-8 h-full bg-white shadow-sm border-gray-100">
              <h3 className="text-xl font-semibold text-[#1a2b4b] mb-12">
                Streak Consistency
              </h3>

              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6 px-2">
                  <h4 className="text-lg font-semibold text-[#1a2b4b]">
                    {monthName} {displayYear}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div
                        key={i}
                        className="text-sm font-semibold text-gray-400"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {calendarWeeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-2">
                      {week.map((day, dayIndex) => {
                        const isCurrentMonthView = viewDate.getMonth() === today.getMonth() &&
                          viewDate.getFullYear() === today.getFullYear();
                        const isCompleted = day === 5 || day === 9; // Mock data
                        const isToday = day === today.getDate() && isCurrentMonthView;
                        const isFuture = day && (
                          new Date(viewDate.getFullYear(), viewDate.getMonth(), day) > today
                        );

                        return (
                          <div
                            key={dayIndex}
                            className="aspect-square flex items-center justify-center relative"
                          >
                            {!day ? null : (
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                                  isToday && "bg-[#70d44b] text-white shadow-lg shadow-green-100",
                                  isCompleted && "bg-[#a1a1aa] text-white",
                                  !isToday && !isCompleted && "text-[#1a2b4b]",
                                  isFuture && "text-[#d1d5db]"
                                )}
                              >
                                {day}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1a2b4b]" />
                    <span className="text-sm font-medium text-gray-500">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#70d44b]" />
                    <span className="text-sm font-medium text-gray-500">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#d1d5db]" />
                    <span className="text-sm font-medium text-gray-500">Skipped</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-4 sm:p-6 lg:p-8 lg:h-full bg-white shadow-sm border-gray-100 flex flex-col">
              <h3 className="text-xl font-semibold text-[#1a2b4b] mb-8 lg:mb-12">
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
                        <p className="text-sm font-semibold text-[#1a2b4b]">
                          {area.title}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">{area.subtitle}</p>
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

              <button className="w-full mt-8 py-4 bg-[#f8faff] text-[#4f46e5] font-semibold rounded-2xl border border-[#e8efff] hover:bg-[#f0f4ff] hover:border-[#ced9ff] transition-all duration-300 shadow-sm text-sm">
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
