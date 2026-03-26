import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import CardImg1 from "@/assets/my-progress/card-imag-1.png";
import CardImg2 from "@/assets/my-progress/card-imag-2.png";
import CardImg3 from "@/assets/my-progress/card-imag-3.png";
import CardImg4 from "@/assets/my-progress/card-imag-4.png";
import CardImgTop from "@/assets/my-progress/card-imag-top.png";
import CardImgBottom from "@/assets/my-progress/card-imag-bottom.png";
import { cn, getMediaUrl } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  LabelList,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import authService, { UserMe } from "@/services/auth.service";
import studyService from "@/services/study.service";
import { useAuth } from "@/context/AuthContext";

// Color palette for subject arcs
const SUBJECT_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#3b82f6",
  "#f97316",
];

const BAR_COLOR = "#70d44b";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const WrappedTick = (props: any) => {
  const { x, y, payload } = props;
  const text = payload.value;
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word: string) => {
    if ((currentLine + word).length > 15) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  });
  lines.push(currentLine.trim());

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={12 + i * 14}
          textAnchor="middle"
          fill="#6b7280"
          className="text-[11px] font-medium"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const MyProgress = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => studyService.getDashboardData(user!.id),
    enabled: !!user?.id,
  });

  // ── Extract Sections ──────────────────────────────────────────────────────
  const overallPerf = dashboardData?.overall_performance;
  const progressSummary = overallPerf?.progress_summary;
  const subjectProgress = dashboardData?.subject_progress;
  const testWiseProgress = dashboardData?.test_wise_progress;

  // Map subject_progress to chart data
  const subjectWiseData = (subjectProgress?.subjects || []).map(
    (s: any, i: number) => ({
      name: s.subject || s.subject_name || s.name || `Subject ${i + 1}`,
      progress: Math.round(s.progress ?? s.completion_percentage ?? 0),
      color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
    })
  );

  // Map test_wise_progress to bar chart data
  const testWiseData = (testWiseProgress?.parts || []).map((p: any) => ({
    name: p.part || p.part_name || p.name || "Part",
    score: Math.round(p.progress ?? p.average_score ?? p.score ?? 0),
    color: BAR_COLOR,
  }));

  const [isExpanded, setIsExpanded] = useState(false);
  const [isStrongExpanded, setIsStrongExpanded] = useState(false);

  // Calendar helpers
  const handlePrevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return weeks;
  };

  const calendarWeeks = getCalendarDays();
  const monthName = viewDate.toLocaleString("default", { month: "long" });
  const displayYear = viewDate.getFullYear();

  // Build a set of "completed" day-of-month from streak monthly_calendar
  const streakCalendar = dashboardData?.streak?.monthly_calendar || [];
  const completedDays = new Set<number>();
  streakCalendar.forEach((entry: any) => {
    if (entry.status === "completed") completedDays.add(entry.day);
  });

  // Areas to improve — use backend data directly
  const areasToImprove = (dashboardData?.areas_to_improve?.areas || []).map((area: any) => ({
    title: area.subject,
    subtitle: area.topic,
    accuracy: `${Math.round(area.accuracy)}% Acc`,
    color: area.badge_color === "red" ? "text-red-500" : "text-orange-500",
    image: area.subject_image, // ✅ NEW
  }));

  // Limit to 4 if not expanded
  const displayedAreas = isExpanded ? areasToImprove : areasToImprove.slice(0, 4);

  // Strong areas
  const strongAreas = (dashboardData?.strong_areas?.areas || []).map((area: any) => ({
    title: area.subject,
    subtitle: area.topic,
    accuracy: `${Math.round(area.accuracy)}% Acc`,
    color: "text-green-500",
    image: area.subject_image, // ✅ NEW
  }));

  const displayedStrongAreas = isStrongExpanded ? strongAreas : strongAreas.slice(0, 4);

  // Overall percentage
  const overallPct = Math.round(overallPerf?.overall_percentage ?? 0);
  const changeFromLastWeek = overallPerf?.change_from_last_week ?? 0;
  const message = overallPerf?.message || "";

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-80">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-80 gap-3 text-destructive">
          <AlertCircle className="w-6 h-6" />
          <p className="font-medium">Failed to load progress data. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

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
                {/* Circular Progress */}
                <div className="flex-shrink-0">
                  <div className="relative w-44 h-44">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="80"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                        fill="transparent"
                      />
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
                          strokeDashoffset:
                            2 * Math.PI * 80 * (1 - overallPct / 100),
                        }}
                        transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-semibold text-gray-900">
                        {overallPct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trend Line */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="relative w-full h-32">
                    <svg
                      viewBox="0 0 300 120"
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <motion.path
                        d="M 20 90 Q 60 70, 80 75 T 140 60 T 200 45 T 260 30"
                        fill="none"
                        stroke={changeFromLastWeek >= 0 ? "#10b981" : "#ef4444"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                      />
                      <motion.circle
                        cx="20"
                        cy="90"
                        r="5"
                        fill="#1a1a2e"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                      />
                      <motion.g
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2 }}
                      >
                        <line x1="260" y1="30" x2="260" y2="10" stroke="#1a1a2e" strokeWidth="2" />
                        <path d="M 260 10 L 280 15 L 260 20 Z" fill="#1a1a2e" />
                      </motion.g>
                    </svg>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-base font-semibold text-gray-900">
                      {changeFromLastWeek >= 0 ? "+" : ""}{changeFromLastWeek}% from last week
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {message || (changeFromLastWeek >= 0 ? "Doing Great! Keep Going" : "Keep pushing, you can do it!")}
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
                {/* 2x2 Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  {/* Syllabus Completed */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-[#FFFFFF] to-[#F8FBFF] py-4 px-2 rounded-2xl border border-[#E8F1FF] flex items-center gap-4"
                  >
                    <img src={CardImg1} alt="Syllabus" className="w-12 h-12 object-contain shrink-0" />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">
                        {progressSummary?.syllabus_completed ?? 0}%
                      </p>
                      <p className="text-[10px] text-gray-600 font-medium">Syllabus Completed</p>
                    </div>
                  </motion.div>

                  {/* Average Accuracy */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-[#FFFFFF] to-[#FFF9F9] py-4 px-2 rounded-2xl border border-[#FFECEC] flex items-center gap-4"
                  >
                    <img src={CardImg2} alt="Accuracy" className="w-12 h-12 object-contain shrink-0" />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">
                        {progressSummary?.average_accuracy ?? 0}%
                      </p>
                      <p className="text-[10px] text-gray-600 font-medium">Average Accuracy</p>
                    </div>
                  </motion.div>

                  {/* Tests Completed */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-[#FFFFFF] to-[#FDF8FF] py-4 px-2 rounded-2xl border border-[#FAEDFF] flex items-center gap-4"
                  >
                    <img src={CardImg3} alt="Tests" className="w-12 h-12 object-contain shrink-0" />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">
                        {progressSummary?.tests_completed ?? 0}
                      </p>
                      <p className="text-[10px] text-gray-600 font-medium">Tests Completed</p>
                    </div>
                  </motion.div>

                  {/* Current Streak */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-[#FFFFFF] to-[#FFFFF6] py-4 px-2 rounded-2xl border border-[#FFF9E5] flex items-center gap-4"
                  >
                    <img src={CardImg4} alt="Streak" className="w-12 h-12 object-contain shrink-0" />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">
                        {progressSummary?.current_streak ?? 0} Days
                      </p>
                      <p className="text-[10px] text-gray-600 font-medium">Current Streak</p>
                    </div>
                  </motion.div>
                </div>

                {/* Best & Lowest Score */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FFF9] py-4 px-6 rounded-2xl border border-[#E9FCE9] flex flex-col sm:flex-row lg:flex-col items-center sm:justify-around lg:justify-center"
                >
                  <div className="flex items-center gap-4 py-4">
                    <img src={CardImgTop} alt="Best Score" className="w-12 h-12 object-contain shrink-0" />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">
                        {progressSummary?.best_score ?? 0}%
                      </p>
                      <p className="text-[10px] text-gray-600 font-medium">Best Score</p>
                    </div>
                  </div>
                  <div className="w-full h-0 border-t-2 border-dashed border-[#E9FCE9] my-3 sm:hidden lg:block" />
                  <div className="w-0 h-16 border-l-2 border-dashed border-[#E9FCE9] mx-6 hidden sm:block lg:hidden" />
                  <div className="flex items-center gap-4 py-4">
                    <img src={CardImgBottom} alt="Lowest Score" className="w-12 h-12 object-contain shrink-0" />
                    <div>
                      <p className="text-xl font-semibold text-gray-900 leading-none mb-2">
                        {progressSummary?.lowest_score ?? 0}%
                      </p>
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

              {subjectWiseData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
                  <p className="text-sm font-medium">No subject data available yet.</p>
                  <p className="text-xs">Complete some study topics to see your progress here.</p>
                </div>
              ) : (
                <>
                  {/* Rainbow Arc */}
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
                        const progressRatio = subject.progress / 100;
                        const strokeDashoffset = circumference - progressRatio * circumference;

                        return (
                          <g key={subject.name}>
                            <path
                              d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
                              fill="none"
                              stroke="#f3f4f6"
                              strokeWidth="6"
                              strokeLinecap="round"
                            />
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

                  {/* Legend */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 max-w-2xl mx-auto">
                    {subjectWiseData.map((subject) => (
                      <div key={subject.name} className="flex items-start gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                          style={{ backgroundColor: subject.color }}
                        />
                        <div className="flex-1 flex justify-between items-start gap-2">
                          <span className="text-[13px] font-medium text-[#4b5563] leading-tight">
                            {subject.name}
                          </span>
                          <span className="text-[13px] font-semibold text-[#1a2b4b] shrink-0">
                            {subject.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </motion.div>

          {/* Test Wise Progress */}
          <motion.div variants={itemVariants}>
            <Card className="p-4 sm:p-6 lg:p-8 h-full bg-white shadow-sm border-gray-100 flex flex-col">
              <h3 className="text-xl font-semibold text-[#1a2b4b] mb-8 lg:mb-12">
                Unit Wise Progress
              </h3>

              {testWiseData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
                  <p className="text-sm font-medium">No test data available yet.</p>
                  <p className="text-xs">Complete some tests to see your scores here.</p>
                </div>
              ) : (
                <div className="flex-1 min-h-[300px] sm:min-h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={testWiseData}
                      margin={{ top: 30, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={<WrappedTick />}
                        interval={0}
                        height={80}
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
                      <Bar dataKey="score" radius={[12, 12, 0, 0]} barSize={80}>
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
              )}
            </Card>
          </motion.div>
        </div>

        {/* Performance Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Streak Consistency Calendar */}


          {/* Strong Areas */}
          <motion.div variants={itemVariants}>
            <Card className="p-4 sm:p-6 lg:p-8 h-full bg-white shadow-sm border-gray-100 flex flex-col">
              <h3 className="text-xl font-semibold text-[#1a2b4b] mb-8 lg:mb-12">
                Strong Areas
              </h3>

              {strongAreas.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-2">
                  <p className="text-sm font-medium">Keep learning to build strong areas!</p>
                  <p className="text-xs">Your top-performing topics will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  {displayedStrongAreas.map((area: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm">
                          {area.image ? (
                            <img src={getMediaUrl(area.image)} alt={area.title} className="w-8 h-8 " />
                          ) : (
                            <span className="text-2xl font-semibold text-[#1a2b4b]">
                              {area.title.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1a2b4b]">{area.title}</p>
                          <p className="text-xs text-gray-500 font-medium">{area.subtitle}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="font-semibold border-green-200 bg-green-50 text-green-600"
                      >
                        {area.accuracy}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}

              {strongAreas.length > 4 && (
                <button
                  onClick={() => setIsStrongExpanded(!isStrongExpanded)}
                  className="w-full mt-8 py-4 bg-[#f8faff] text-[#4f46e5] font-semibold rounded-2xl border border-[#e8efff] hover:bg-[#f0f4ff] hover:border-[#ced9ff] transition-all duration-300 shadow-sm text-sm"
                >
                  {isStrongExpanded ? "Collapse View" : "View All"}
                </button>
              )}
            </Card>
          </motion.div>

          {/* Areas to Improve */}
          <motion.div variants={itemVariants}>
            <Card className="p-4 sm:p-6 lg:p-8 h-full bg-white shadow-sm border-gray-100 flex flex-col">
              <h3 className="text-xl font-semibold text-[#1a2b4b] mb-8 lg:mb-12">
                Areas to Improve
              </h3>

              {areasToImprove.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-2">
                  <p className="text-sm font-medium">No weak areas found!</p>
                  <p className="text-xs">Great job staying on top of everything.</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  {displayedAreas.map((area, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm">
                          {area.image ? (
                            <img src={getMediaUrl(area.image)} alt={area.title} className="w-8 h-8 " />
                          ) : (
                            <span className="text-2xl font-semibold text-[#1a2b4b]">
                              {area.title.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1a2b4b]">{area.title}</p>
                          <p className="text-xs text-gray-500 font-medium">{area.subtitle}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-semibold",
                          area.color === "text-red-500" && "border-red-200 bg-red-50 text-red-600",
                          area.color === "text-orange-500" && "border-orange-200 bg-orange-50 text-orange-600"
                        )}
                      >
                        {area.accuracy}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}

              {areasToImprove.length > 4 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full mt-8 py-4 bg-[#f8faff] text-[#4f46e5] font-semibold rounded-2xl border border-[#e8efff] hover:bg-[#f0f4ff] hover:border-[#ced9ff] transition-all duration-300 shadow-sm text-sm"
                >
                  {isExpanded ? "Collapse View" : "View All"}
                </button>
              )}
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default MyProgress;
