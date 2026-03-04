import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Bell, Calendar, FileText, Trophy, Settings, User, LogOut, Medal, AlertTriangle } from "lucide-react";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import authService from "@/services/auth.service";
import { toast } from "sonner";
import pic from "@/assets/pic.png";

import { useState, useEffect } from "react";
import { notificationService, Notification } from "@/services/notification.service";
import { formatDistanceToNow } from "date-fns";

interface RightSidebarHeaderProps {
    user: any;
    userName: string;
    avatarUrl?: string;
    initials: string;
    className?: string;
    hideLanguage?: boolean;
}

export function RightSidebarHeader({ user, userName, avatarUrl, initials, className, hideLanguage }: RightSidebarHeaderProps) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data.slice(0, 5)); // Only show top 5 in popover
            setUnreadCount(data.filter(n => !n.read_status).length);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Setup polling or just leave it for now
    }, []);

    const handleLogout = async () => {
        try {
            await authService.logout();
            toast.success("Logged out successfully");
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
            toast.error("Logout failed");
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    const getIconDetails = (category: string) => {
        switch (category.toUpperCase()) {
            case 'BILLING': return { Icon: AlertTriangle, bg: 'bg-rose-50', color: 'text-rose-500' };
            case 'DAILY_TEST':
            case 'WEEKLY_TEST':
            case 'TEST_SERIES': return { Icon: FileText, bg: 'bg-blue-50', color: 'text-blue-500' };
            case 'STREAK':
            case 'ACHIEVEMENT': return { Icon: Trophy, bg: 'bg-emerald-50', color: 'text-emerald-500' };
            default: return { Icon: Bell, bg: 'bg-indigo-50', color: 'text-indigo-500' };
        }
    };

    return (
        <div className={cn("flex items-center justify-between mb-4", className)}>
            <div className="flex items-center gap-2">
                {!hideLanguage && <LanguageToggle />}
            </div>
            <div className="flex items-center gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-all hover:bg-muted/50 rounded-full h-10 w-10 active:scale-95">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white ring-2 ring-white animate-pulse" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 overflow-hidden rounded-xl border-none shadow-2xl mr-4 mt-2" align="end">
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-[#F8FAFC]">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-[#0F172A]">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{unreadCount} New</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => notifications.forEach(n => !n.read_status && handleMarkAsRead(n.id))}
                                    className="text-[11px] font-semibold text-primary hover:opacity-80 transition-opacity"
                                >
                                    Mark all as read
                                </button>
                            </div>

                            <div className="max-h-[350px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-muted-foreground">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map((n) => {
                                        const { Icon, bg, color } = getIconDetails(n.category);

                                        return (
                                            <div key={n.id} className={cn(
                                                "flex gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer relative",
                                                !n.read_status && "bg-primary/[0.02]"
                                            )} onClick={() => handleMarkAsRead(n.id)}>
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", bg)}>
                                                    <Icon className={cn("w-5 h-5", color)} />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={cn("text-xs font-semibold leading-none", !n.read_status ? "text-[#0F172A]" : "text-[#64748B]")}>
                                                            {n.category.replace('_', ' ')}
                                                        </p>
                                                        <span className="text-[9px] text-[#94A3B8] shrink-0">
                                                            {formatDistanceToNow(new Date(n.date_sent), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                </div>
                                                {!n.read_status && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="p-3 bg-gray-50/50 border-t border-gray-50">
                                <button
                                    onClick={() => navigate('/notifications')}
                                    className="w-full py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors rounded-lg bg-white border border-gray-100 shadow-sm"
                                >
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <div className="relative cursor-pointer hover:opacity-90 transition-opacity">
                            <Avatar className="h-12 w-12 ring-2 ring-primary/10 shadow-sm">
                                <AvatarImage src={avatarUrl || pic} alt={userName} />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                <Medal className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-0 overflow-hidden rounded-xl border-none shadow-2xl mr-4 mt-2" align="end">
                        <div className="relative">
                            {/* Header Background minimized height */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#F0FFF4] to-white h-24" />

                            <div className="relative px-4 pt-4 pb-4 text-center">
                                <div className="relative mx-auto w-16 h-16 mb-2">
                                    <Avatar className="w-full h-full border-4 border-white shadow-md">
                                        <AvatarImage src={avatarUrl || pic} alt={userName} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#FFFDE7] border border-[#FFF9C4] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap">
                                        <div className="w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
                                            <Medal className="w-2 h-2 text-white" />
                                        </div>
                                        <span className="text-[9px] font-semibold text-amber-600 uppercase tracking-wider">Premium</span>
                                    </div>
                                </div>

                                <h3 className="text-base font-semibold text-[#0F172A] leading-tight mb-0.5">{userName}</h3>
                                <p className="text-[#64748B] text-[11px] mb-3">{user?.phone || user?.username || "+91 80456 74391"}</p>

                                <div className="space-y-0 text-left mb-3 px-0.5">
                                    <button
                                        onClick={() => navigate('/settings')}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors group"
                                    >
                                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                                        <span className="text-[13px] font-medium">Settings</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors group"
                                    >
                                        <User className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                                        <span className="text-[13px] font-medium">View Profile</span>
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors group"
                                    >
                                        <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500" />
                                        <span className="text-[13px] font-medium">Logout</span>
                                    </button>
                                </div>

                                <Button
                                    variant="default"
                                    className="w-full h-9 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold transition-all shadow-md active:scale-[0.98]"
                                >
                                    Upgrade
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
