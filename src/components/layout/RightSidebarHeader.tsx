import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Bell, FileText, Trophy, Settings, User, LogOut, Medal, AlertTriangle, Check } from "lucide-react";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import authService from "@/services/auth.service";
import { toast } from "sonner";
import pic from "@/assets/pic.png";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export function RightSidebarHeader({ user, userName, avatarUrl, initials, className, hideLanguage }: RightSidebarHeaderProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ── Real-time polling: unread count every 30s ──────────────────────────
    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications-unread-count'],
        queryFn: () => notificationService.getUnreadCount(),
        refetchInterval: 30 * 1000,  // poll every 30 seconds
        staleTime: 20 * 1000,
        retry: false,
    });

    // ── Full notifications list: fetched on popover open ──────────────────
    const { data: notifications = [], isLoading: notifLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getNotifications(),
        staleTime: 60 * 1000,
        retry: false,
        select: (data) => data.slice(0, 6), // top 6 in popover
    });

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
        // Optimistic update
        queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
            old.map(n => n.id === id ? { ...n, read_status: true } : n)
        );
        queryClient.setQueryData<number>(['notifications-unread-count'], (old = 0) =>
            Math.max(0, old - 1)
        );
        try {
            await notificationService.markAsRead(id);
        } catch {
            // rollback on error
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
    };

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;
        // Optimistic update
        queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
            old.map(n => ({ ...n, read_status: true }))
        );
        queryClient.setQueryData<number>(['notifications-unread-count'], 0);
        try {
            await notificationService.markAllAsRead();
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
    };

    return (
        <div className={cn("flex items-center justify-between mb-4", className)}>
            <div className="flex items-center gap-2">
                {!hideLanguage && <LanguageToggle />}
            </div>
            <div className="flex items-center gap-4">
                {/* ── Bell Icon with Live Badge ── */}
                <Popover onOpenChange={(open) => {
                    if (open) {
                        // Refresh list when popover opens
                        queryClient.invalidateQueries({ queryKey: ['notifications'] });
                    }
                }}>
                    <PopoverTrigger asChild>
                        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-all hover:bg-muted/50 rounded-full h-10 w-10 active:scale-95">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white ring-2 ring-white animate-pulse" />
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 overflow-hidden rounded-2xl border-none shadow-2xl mr-4 mt-2" align="end">
                        <div className="flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#F8FAFC]">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-medium text-[#0F172A]">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-medium border border-rose-100">
                                            {unreadCount} New
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAllRead();
                                    }}
                                    disabled={unreadCount === 0}
                                    className="text-[11px] font-medium text-primary hover:text-primary/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            </div>

                            {/* List */}
                            <div className="max-h-[360px] overflow-y-auto">
                                {notifLoading ? (
                                    // Skeleton preloader
                                    <div className="flex flex-col divide-y divide-gray-50">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="flex gap-3 p-4">
                                                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-3 w-2/3" />
                                                    <Skeleton className="h-2.5 w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <Bell className="w-6 h-6 mx-auto mb-2 text-muted-foreground/30" />
                                        <p className="text-xs text-muted-foreground">No new notifications</p>
                                    </div>
                                ) : (
                                    notifications.map((n) => {
                                        const { Icon, bg, color } = getIconDetails(n.category);
                                        return (
                                            <div
                                                key={n.id}
                                                className={cn(
                                                    "flex gap-3 px-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer relative",
                                                    !n.read_status && "bg-rose-50/30"
                                                )}
                                                onClick={() => handleMarkAsRead(n.id)}
                                            >
                                                {/* Unread accent stripe */}
                                                {!n.read_status && (
                                                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-rose-500 rounded-r-full" />
                                                )}
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-transparent", bg)}>
                                                    <Icon className={cn("w-5 h-5", color)} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <p className={cn("text-[11px] font-medium leading-none truncate", !n.read_status ? "text-[#0F172A]" : "text-[#64748B]")}>
                                                            {n.category.replace(/_/g, ' ')}
                                                        </p>
                                                        <span className="text-[9px] text-[#94A3B8] shrink-0 font-medium tracking-tight">
                                                            {formatDistanceToNow(new Date(n.date_sent), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className={cn("text-[11px] line-clamp-2 leading-relaxed", !n.read_status ? "text-[#334155] font-medium" : "text-[#64748B]")}>
                                                        {n.message}
                                                    </p>
                                                </div>
                                                {!n.read_status && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white shrink-0" />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 bg-gray-50/50 border-t border-gray-100">
                                <button
                                    onClick={() => navigate('/notifications')}
                                    className="w-full py-2 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors rounded-xl bg-white border border-gray-100 shadow-sm"
                                >
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* ── Avatar / Profile ── */}
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
                            <div className="absolute inset-0 bg-gradient-to-b from-[#F0FFF4] to-white h-24" />
                            <div className="relative px-4 pt-4 pb-4 text-center">
                                <div className="relative mx-auto w-16 h-16 mb-2">
                                    <Avatar className="w-full h-full border-4 border-white shadow-md">
                                        <AvatarImage src={avatarUrl || pic} alt={userName} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#FFFDE7] border border-[#FFF9C4] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap">
                                        <div className="w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
                                            <Medal className="w-2 h-2 text-white" />
                                        </div>
                                        <span className="text-[9px] font-medium text-amber-600 uppercase tracking-wider">Premium</span>
                                    </div>
                                </div>

                                <h3 className="text-base font-medium text-[#0F172A] leading-tight mb-0.5">{userName}</h3>
                                <p className="text-[#64748B] text-[11px] mb-3">{user?.phone || user?.username}</p>

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
                                    className="w-full h-9 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-medium transition-all shadow-md active:scale-[0.98]"
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
