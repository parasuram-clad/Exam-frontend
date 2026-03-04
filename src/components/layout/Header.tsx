import { Bell, ArrowLeft, FileText, Calendar, Trophy, LogOut, User as UserIcon, Settings, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileMenuButton } from "./Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import pic from "@/assets/pic.png";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';
import authService from "@/services/auth.service";
import { toast } from "sonner";

import { RightSidebarHeader } from "./RightSidebarHeader";

interface HeaderProps {
  user: any;
  userName: string;
  userTitle: string;
  avatarUrl?: string;
  onMenuToggle: () => void;
  onStreakClick?: () => void;
  onLeaderboardClick?: () => void;
}

export function Header({ user, userName, userTitle, avatarUrl, onMenuToggle, onStreakClick, onLeaderboardClick }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentPath = location.pathname;
  const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const getPageDetails = () => {
    if (currentPath === "/dashboard") {
      return {
        title: `${t('header.hello')} ${userName.split(" ")[0]} 👋`,
        subtitle: t('header.greeting'),
        showBackButton: false,
      };
    }

    if (currentPath.startsWith("/study-plan")) {
      if (currentPath.includes("/topic/")) {
        return {
          title: "Topic Details",
          subtitle: "Explore subtopics and study material",
          showBackButton: true,
          backButtonText: "Back to Study Plan",
          backButtonPath: "/study-plan",
        };
      }
      return {
        title: t('pages.studyPlan.title'),
        subtitle: t('pages.studyPlan.subtitle'),
        showBackButton: false,
      };
    }

    if (currentPath.startsWith("/test-series")) {
      if (currentPath.split("/").length > 2) {
        return {
          title: "Test Sets",
          subtitle: "Choose a test to start practicing",
          showBackButton: false,
          backButtonText: "Back to Test Series",
          backButtonPath: "/test-series",
        };
      }
      return {
        title: t('pages.testSeries.title'),
        subtitle: t('pages.testSeries.subtitle'),
        showBackButton: false,
      };
    }

    if (currentPath.startsWith("/progress")) {
      return {
        title: t('pages.progress.title'),
        subtitle: t('pages.progress.subtitle'),
        showBackButton: false,
      };
    }

    if (currentPath.startsWith("/leaderboard")) {
      return {
        title: t('pages.leaderboard.title'),
        subtitle: t('pages.leaderboard.subtitle'),
        showBackButton: false,
      };
    }

    if (currentPath.startsWith("/schedule")) {
      return {
        title: t('pages.schedule.title'),
        subtitle: t('pages.schedule.subtitle'),
        showBackButton: false,
      };
    }

    if (currentPath.startsWith("/profile")) {
      return {
        title: t('pages.profile.title'),
        subtitle: t('pages.profile.subtitle'),
        showBackButton: false,
      };
    }
    if (currentPath.startsWith("/ask-doubt")) {
      return {
        title: t('pages.askDoubt.title', 'Ask Your Doubt'),
        subtitle: t('pages.askDoubt.subtitle', 'AI Tutor for TNPSC Group 4 Preparation'),
        showBackButton: false,
      };
    }
    if (currentPath.startsWith("/current-affairs")) {
      return {
        title: t('pages.currentAffairs.title', 'Current Affairs'),
        subtitle: t('pages.currentAffairs.subtitle', 'Stay updated with daily news for TNPSC preparation'),
        showBackButton: false,
      };
    }
    if (currentPath.startsWith("/notifications")) {
      return {
        title: t('pages.notifications.title', 'Updates & Alerts'),
        subtitle: t('pages.notifications.subtitle', 'Keep track of your learning journey'),
        showBackButton: false,
      };
    }
    return {
      title: "Thani Oruvan",
      subtitle: "Your personal learning assistant",
      showBackButton: currentPath !== "/dashboard",
      backButtonText: "Back to Dashboard",
      backButtonPath: "/dashboard",
    };
  };

  const { title, subtitle, showBackButton, backButtonText, backButtonPath } = getPageDetails();

  return (
    <header className="bg-background border-b border-border/40 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">

        {/* Left Side: Brand/Greeting for Mobile, Breadcrumbs/Back for Desktop */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <MobileMenuButton onClick={onMenuToggle} />
          </div>

          {/* Mobile Brand/Logo Area */}
          <div className="lg:hidden flex items-center gap-2">
            <span className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Thani Oruvan
            </span>
          </div>

          {/* Desktop/Tablet: Existing Back Button or Title Logic */}
          <div className="hidden lg:flex flex-col">
            {showBackButton && backButtonPath ? (
              <div className="flex flex-col">
                <button
                  onClick={() => navigate(backButtonPath)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-0.5 group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span className="text-xs font-medium uppercase tracking-wider">{backButtonText}</span>
                </button>
                <h1 className="text-lg sm:text-xl font-medium text-foreground">
                  {title}
                </h1>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-medium text-foreground">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {subtitle}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Mobile Badges & Desktop Actions */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* Mobile: Streak & Leaderboard Badges */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Streak Badge */}
            <div
              onClick={onStreakClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50/80 border border-orange-100 rounded-full cursor-pointer active:scale-95 transition-transform"
            >
              <span className="text-base">🔥</span>
              <span className="text-xs font-medium text-orange-600">3</span>
            </div>

            {/* Leaderboard Badge */}
            <div
              onClick={onLeaderboardClick || (() => navigate('/leaderboard'))}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50/80 border border-blue-100 rounded-full cursor-pointer active:scale-95 transition-transform"
            >
              <Trophy className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">12th</span>
            </div>

            {/* Profile Avatar (Small) - Direct Navigation */}
            <div
              onClick={() => navigate("/profile")}
              className="cursor-pointer ml-1 active:scale-95 transition-transform"
            >
              <Avatar className="h-8 w-8 border-2 border-white shadow-sm ring-1 ring-black/5">
                <AvatarImage src={avatarUrl || pic} />
                <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Desktop Actions (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center">
            <RightSidebarHeader
              user={user}
              userName={userName}
              avatarUrl={avatarUrl}
              initials={initials}
              className={cn(
                "mb-0 gap-4",
                currentPath === "/dashboard" ? "xl:hidden" : "flex"
              )}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

