import { useNavigate, useLocation } from "react-router-dom";
import {
    Home,
    Calendar,
    FileText,
    TrendingUp,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Calendar, label: "Study", href: "/study-plan" },
    { icon: Sparkles, label: "Ask Doubt", href: "/ask-doubt" },
    { icon: FileText, label: "Tests", href: "/test-series" },
    { icon: TrendingUp, label: "Progress", href: "/progress" },
];

export function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pointer-events-none">
            {/* Interactive container */}
            <nav className="pointer-events-auto bg-background/80 backdrop-blur-md border-t border-border/50 pb-safe shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const isActive =
                            currentPath === item.href ||
                            (item.href !== "/dashboard" && currentPath.startsWith(item.href));

                        return (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.href)}
                                className="relative flex-1 h-full flex flex-col items-center justify-center gap-1 group select-none"
                            >
                                {/* Active Light Effect Behind */}
                                {/* {isActive && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute w-12 h-12 bg-accent/10 rounded-full blur-sm -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    />
                                )} */}

                                {/* Top Active Line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-line"
                                        className="absolute top-0 w-8 h-[3px] bg-accent rounded-b-full "
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    />
                                )}

                                <div className={cn(
                                    "flex flex-col items-center gap-1 transition-all duration-300 transform",
                                    isActive ? "text-accent -translate-y-1" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    <motion.div
                                        animate={{
                                            scale: isActive ? 1.1 : 1,
                                        }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <item.icon
                                            className={cn(
                                                "w-5 h-5 transition-all duration-300",
                                                isActive && "drop-shadow-sm"
                                            )}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                    </motion.div>

                                    <span className={cn(
                                        "text-[10px] font-medium transition-all duration-300",
                                        isActive ? "font-semibold" : "opacity-80"
                                    )}>
                                        {item.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
