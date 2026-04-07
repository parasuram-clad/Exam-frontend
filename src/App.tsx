import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import StudyPlan from "./pages/StudyPlan";
import TestSeries from "./pages/TestSeries";
import TestDetails from "./pages/TestDetails";
import TestAttempt from "./pages/TestAttempt";
import TestAnalytics from "./pages/TestAnalytics";
import SubjectRoadmap from "./pages/SubjectRoadmap";
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
import UpgradePlan from "./pages/UpgradePlan";
import Payment from "./pages/Payment";
import RenewPlan from "./pages/RenewPlan";
import NotFound from "./pages/NotFound";
import { ChatbotWidget } from "./components/ChatbotWidget";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import InitialDataLoader from "./components/layout/InitialDataLoader";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import NotificationHandler from "./components/NotificationHandler";

const queryClient = new QueryClient();

const RootLayout = () => {
  return (
    <>
      <Outlet />
      <ChatbotWidget />
      <ScrollRestoration />
    </>
  );
};

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/dashboard", element: <ProtectedRoute><Index /></ProtectedRoute> },
      { path: "/ask-doubt", element: <ProtectedRoute><AskYourDoubt /></ProtectedRoute> },
      { path: "/current-affairs", element: <ProtectedRoute><CurrentAffairs /></ProtectedRoute> },
      { path: "/study-plan", element: <ProtectedRoute><StudyPlan /></ProtectedRoute> },
      { path: "/study-plan/topic/:topicId", element: <ProtectedRoute><TopicStudy /></ProtectedRoute> },
      { path: "/study-plan/topic/:topicId/subtopic/:subtopicId", element: <ProtectedRoute><StudyContent /></ProtectedRoute> },
      { path: "/test-series", element: <ProtectedRoute><TestSeries /></ProtectedRoute> },
      { path: "/test-series/:subject", element: <ProtectedRoute><TestDetails /></ProtectedRoute> },
      { path: "/test-series/:subject/test/:testId", element: <ProtectedRoute><TestAttempt /></ProtectedRoute> },
      { path: "/test-series/subject/:subjectId/roadmap", element: <ProtectedRoute><SubjectRoadmap /></ProtectedRoute> },
      { path: "/test-series/:subject/test/:testId/analytics", element: <ProtectedRoute><TestAnalytics /></ProtectedRoute> },
      { path: "/progress", element: <ProtectedRoute><MyProgress /></ProtectedRoute> },
      { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "/leaderboard", element: <ProtectedRoute><Leaderboard /></ProtectedRoute> },
      { path: "/schedule", element: <ProtectedRoute><Schedule /></ProtectedRoute> },
      { path: "/notifications", element: <ProtectedRoute><Notifications /></ProtectedRoute> },
      { path: "/study-plan/topic/:topicId/subtopic/:subtopicId/mindmap", element: <ProtectedRoute><MindMapView /></ProtectedRoute> },
      { path: "/study-plan/topic/:topicId/subtopic/:subtopicId/section/:sectionId/mindmap", element: <ProtectedRoute><MindMapView /></ProtectedRoute> },
      { path: "/upgrade-plan", element: <ProtectedRoute><UpgradePlan /></ProtectedRoute> },
      { path: "/renew-plan", element: <ProtectedRoute><RenewPlan /></ProtectedRoute> },
      { path: "/payment", element: <ProtectedRoute><Payment /></ProtectedRoute> },
      { path: "*", element: <NotFound /> },
    ]
  }
]);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InitialDataLoader>
          <TooltipProvider>
            <NotificationHandler />
            <Sonner />
            <RouterProvider router={router} />
          </TooltipProvider>
        </InitialDataLoader>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
