import { cn } from "@/lib/utils";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  FileText,
  TrendingUp,
  User,
  HelpCircle,
  X,
  GraduationCap,
  MessageSquare,
  Newspaper,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePath?: string;
}


export function Sidebar({ isOpen, onToggle, activePath }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = activePath || location.pathname;

  const navItems: NavItem[] = [
    { icon: Home, label: t('nav.home', 'Home'), href: "/dashboard" },
    { icon: MessageSquare, label: t('nav.askDoubt', 'Ask Your Doubt'), href: "/ask-doubt" },
    { icon: Calendar, label: t('nav.studyPlan', 'Study Plan'), href: "/study-plan" },
    { icon: FileText, label: t('nav.testSeries', 'Test Series'), href: "/test-series" },
    { icon: Newspaper, label: t('nav.currentAffairs', 'Current Affairs'), href: "/current-affairs" },
    { icon: TrendingUp, label: t('nav.progress', 'My Progress'), href: "/progress" },
    { icon: User, label: t('nav.profile', 'Profile'), href: "/profile" },
  ];

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-lg lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <h1 className="font-medium font-goldman text-lg text-foreground tracking-tight">Thani</h1>
              <p className="text-xs text-muted-foreground font-medium font-goldman">ORUVAN</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground hover:bg-muted"
            onClick={onToggle}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {navItems.map((item) => {
            const isActive = currentPath === item.href ||
              (item.href !== "/dashboard" && currentPath.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onToggle}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "text-accent-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Help Center */}
        <div className="p-4">
          <div className="bg-primary rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-foreground">Help center</p>
                <p className="text-xs text-primary-foreground/70">Have a problem?</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full bg-card text-foreground hover:bg-card/90 font-medium"
              size="sm"
            >
              Go to help center
            </Button>
          </div>
        </div>

        {/* Logout */}
        {/* <div className="p-4 pt-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('nav.logout', 'Logout')}</span>
          </button>
        </div> */}

      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="hidden"
      onClick={onClick}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </Button>
  );
}
