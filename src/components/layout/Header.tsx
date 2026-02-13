import { Bell, ArrowLeft, FileText, Calendar, Trophy, LogOut, User as UserIcon } from "lucide-react";
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

interface HeaderProps {
  userName: string;
  userTitle: string;
  avatarUrl?: string;
  onMenuToggle: () => void;
}

const notifications: any[] = [];

export function Header({ userName, userTitle, avatarUrl, onMenuToggle }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

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
    <header className=" bg-background border-b border-border/40">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        {/* Left side - Mobile menu + Greeting / Back Button */}
        <div className="flex items-center gap-4">
          <MobileMenuButton onClick={onMenuToggle} />
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
              <h1 className="text-lg sm:text-xl font-medium text-foreground">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full h-10 w-10 transition-all duration-200">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-background ring-2 ring-background animate-pulse" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 overflow-hidden rounded-xl border border-border/50 shadow-xl bg-background/95 backdrop-blur-sm" align="end" sideOffset={8}>
              <div className="flex flex-col max-h-[100vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{t('header.notifications')}</h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">3</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:bg-transparent hover:text-primary transition-colors">
                    {t('header.markAllRead')}
                  </Button>
                </div>

                {/* List */}
                <div className="overflow-y-auto max-h-[400px]">
                  {notifications.length > 0 ? (
                    notifications.map((n) => {
                      const Icon = n.type === 'test' ? FileText : n.type === 'schedule' ? Calendar : Trophy;
                      const iconColor = n.type === 'test' ? 'text-blue-500 bg-blue-500/10' : n.type === 'schedule' ? 'text-orange-500 bg-orange-500/10' : 'text-yellow-500 bg-yellow-500/10';

                      return (
                        <div key={n.id} className={cn(
                          "flex gap-4 p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                          n.unread ? "bg-primary/5" : "bg-transparent"
                        )}>
                          <div className={cn("mt-1 w-9 h-9 rounded-full flex items-center justify-center shrink-0", iconColor)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn("text-sm font-medium leading-none", n.unread ? "text-foreground" : "text-muted-foreground")}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">{n.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {n.description}
                            </p>
                          </div>
                          {n.unread && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">All caught up! No new notifications.</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t items-center flex justify-center border-border/50 bg-muted/30">
                  <Button variant="outline" size="sm" className=" text-xs h-8 border-border/50 hover:bg-background hover:text-primary transition-colors">
                    {t('header.viewAllNotifications')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Language Toggle */}
          <LanguageToggle />

          {/* User Profile Menu */}
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "flex items-center gap-3 pl-3 border-l border-border ml-1 cursor-pointer hover:opacity-80 transition-opacity",
                  currentPath === "/dashboard" ? "xl:hidden" : ""
                )}
              >
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-foreground leading-none">{userName}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium opacity-70">{userTitle}</p>
                </div>
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-border shadow-sm ring-2 ring-transparent hover:ring-primary/10 transition-all">
                  <AvatarImage src={avatarUrl || pic} alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0 overflow-hidden rounded-xl border border-border/50 shadow-xl bg-background/95 backdrop-blur-sm" align="end" sideOffset={8}>
              <div className="flex flex-col">
                {/* User Info Header */}
                <div className="px-3 py-2.5 border-b border-border/50 bg-gradient-to-br from-muted/50 to-muted/30">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9 border border-background shadow-sm">
                      <AvatarImage src={avatarUrl || pic} alt={userName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                        {userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground leading-tight truncate">{userName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{userTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-1.5">
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-all duration-200 group"
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <UserIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="flex-1 text-left">{t('header.viewProfile')}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full mt-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200 group"
                  >
                    <div className="w-7 h-7 rounded-md bg-red-500/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <span className="flex-1 text-left">{t('header.logout')}</span>
                  </button>
                </div>

                {/* Footer */}
                <div className="px-3 py-1.5 border-t border-border/50 bg-muted/20">
                  <p className="text-[9px] text-muted-foreground text-center leading-tight">
                    {t('header.loggedInSince')} {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}

