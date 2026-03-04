import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import StudyPlan from "./pages/StudyPlan";
import TestSeries from "./pages/TestSeries";
import TestDetails from "./pages/TestDetails";
import TestAttempt from "./pages/TestAttempt";
import TestAnalytics from "./pages/TestAnalytics";
import TopicStudy from "./pages/TopicStudy";
import StudyContent from "./pages/StudyContent";
import MyProgress from "./pages/MyProgress";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Schedule from "./pages/Schedule";
import MindMapView from "./pages/MindMapView";
import AskYourDoubt from "./pages/AskYourDoubt";
import CurrentAffairs from "./pages/CurrentAffairs";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import { ChatbotWidget } from "./components/ChatbotWidget";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import InitialDataLoader from "./components/layout/InitialDataLoader";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <InitialDataLoader>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/ask-doubt" element={<ProtectedRoute><AskYourDoubt /></ProtectedRoute>} />
            <Route path="/current-affairs" element={<ProtectedRoute><CurrentAffairs /></ProtectedRoute>} />
            <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
            <Route path="/study-plan/topic/:topicId" element={<ProtectedRoute><TopicStudy /></ProtectedRoute>} />
            <Route path="/study-plan/topic/:topicId/subtopic/:subtopicId" element={<ProtectedRoute><StudyContent /></ProtectedRoute>} />
            <Route path="/test-series" element={<ProtectedRoute><TestSeries /></ProtectedRoute>} />
            <Route path="/test-series/:subject" element={<ProtectedRoute><TestDetails /></ProtectedRoute>} />
            <Route path="/test-series/:subject/test/:testId" element={<ProtectedRoute><TestAttempt /></ProtectedRoute>} />
            <Route path="/test-series/:subject/test/:testId/analytics" element={<ProtectedRoute><TestAnalytics /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><MyProgress /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/study-plan/topic/:topicId/subtopic/:subtopicId/mindmap" element={<ProtectedRoute><MindMapView /></ProtectedRoute>} />
            <Route path="/study-plan/topic/:topicId/subtopic/:subtopicId/section/:sectionId/mindmap" element={<ProtectedRoute><MindMapView /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <ChatbotWidget />
        </BrowserRouter>
      </TooltipProvider>
    </InitialDataLoader>
  </QueryClientProvider>
);

export default App;
