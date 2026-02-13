import { DashboardLayout } from "@/components/layout";
import {
  StatCard,
  StatCardsGrid,
  TestSeriesCard,
  DailyQuizBanner,
  StudyPlanCard,
  StudyPlanGrid,
  StreakWidget,
  LeaderboardWidget,
  ScheduleWidget,
  ProfileWidget,
} from "@/components/dashboard";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import authService, { UserMe } from "@/services/auth.service";

import mcqImg from "@/assets/dashboard/mcq-card.png";
import accuracyImg from "@/assets/dashboard/accuracy-card.png";
import topicsImg from "@/assets/dashboard/topics-crad.png";
import timeImg from "@/assets/dashboard/time-spent-crad.png";
import organicChemistryImg from "@/assets/organic-chemistry.png";
import physicsImg from "@/assets/physics.png";
import pic from "@/assets/pic.png"

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
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const Index = () => {
  const navigate = useNavigate();
  const [isDailyQuizCompleted, setIsDailyQuizCompleted] = useState(false);
  const [user, setUser] = useState<UserMe | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await authService.getCurrentUser();
        setUser(u);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  const userName = user?.full_name || user?.username || "Aspirant";
  const userTitle = user?.qualification || "TNPSC Aspirant";
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Handle relative avatar URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const avatarUrl = user?.photo_url
    ? (user.photo_url.startsWith('http') ? user.photo_url : `${baseUrl}${user.photo_url}`)
    : pic;

  return (
    <DashboardLayout
      rightSidebar={
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <ProfileWidget
            name={userName}
            title={userTitle}
            avatarUrl={avatarUrl}
            initials={initials}
          />
          <StreakWidget streakDays={3} />
          <LeaderboardWidget />
          <ScheduleWidget />
        </motion.div>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        {/* Today's Activities */}
        <motion.section variants={itemVariants} className="mb-6 xl:mb-8">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Today's Activities</h2>
          <StatCardsGrid>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<img src={mcqImg} alt="MCQs" className="w-full h-full object-contain" />}
                value="45"
                label="MCQs Practiced"
                borderClass="border-l-indigo-500/50"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<img src={accuracyImg} alt="Accuracy" className="w-full h-full object-contain" />}
                value="78%"
                label="Accuracy Rate"
                borderClass="border-l-rose-500/50"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<img src={topicsImg} alt="Topics" className="w-full h-full object-contain" />}
                value="12"
                label="Topics Covered"
                borderClass="border-l-amber-500/50"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<img src={timeImg} alt="Time" className="w-full h-full object-contain" />}
                value="3.5h"
                label="Time Spent"
                borderClass="border-l-emerald-500/50"
              />
            </motion.div>
          </StatCardsGrid>
        </motion.section>

        {/* Test Series Overview */}
        <motion.section variants={itemVariants} className="mb-6 xl:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Test Series Overview</h2>
            <button
              onClick={() => navigate("/test-series")}
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-bold transition-colors"
            >
              See all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <TestSeriesCard
                icon={<FileText className="w-5 h-5" />}
                title="TNPSC – History Model Test"
                progress={75}
                duration="2 Hrs"
                questions={200}
                marks={300}
                color="indigo"
                onClick={() => navigate("/test-series/history/test/1")}
              />
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <TestSeriesCard
                icon={<FileText className="w-5 h-5" />}
                title="TNPSC – Polity Sectional Test"
                progress={45}
                duration="2 Hrs"
                questions={200}
                marks={300}
                color="blue"
                onClick={() => navigate("/test-series/polity/test/3")}
              />
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <TestSeriesCard
                icon={<FileText className="w-5 h-5" />}
                title="TNPSC – Economy Mock Test"
                progress={60}
                duration="2 Hrs"
                questions={200}
                marks={300}
                color="emerald"
                onClick={() => navigate("/test-series/economy/test/3")}
              />
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <TestSeriesCard
                icon={<FileText className="w-5 h-5" />}
                title="TNPSC – Aptitude & Logical reasoning"
                progress={40}
                duration="2 Hrs"
                questions={200}
                marks={300}
                color="red"
                onClick={() => navigate("/test-series/science-tech/test/1")}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Daily Quiz Challenge */}
        <motion.section
          variants={itemVariants}
          className="mb-6 xl:mb-8"
          animate={isDailyQuizCompleted ? { scale: [1, 1.02, 1], transition: { duration: 0.5 } } : {}}
        >
          <DailyQuizBanner
            isCompleted={isDailyQuizCompleted}
            onComplete={() => setIsDailyQuizCompleted(true)}
          />
        </motion.section>

        {/* Study Plan Overview */}
        <motion.section variants={itemVariants} className="mb-6 xl:mb-8">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Study Plan Overview</h2>
          <StudyPlanGrid>
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <StudyPlanCard
                icon={<img src={organicChemistryImg} alt="Organic Chemistry" className="w-7 h-7 object-contain" />}
                title="Organic Chemistry"
                subtitle="5 chapters remaining"
              />
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <StudyPlanCard
                icon={<img src={physicsImg} alt="Modern Physics" className="w-7 h-7 object-contain" />}
                title="Modern Physics"
                subtitle="Complete by Dec 31"
              />
            </motion.div>
          </StudyPlanGrid>
        </motion.section>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
