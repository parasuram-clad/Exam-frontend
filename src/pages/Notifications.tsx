import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { notificationService, Notification } from "@/services/notification.service";
import {
    Bell,
    Trash2,
    Clock,
    AlertTriangle,
    Trophy,
    FileText,
    MoreVertical,
    Check,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Notifications() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    // ── Fetch Notifications ───────────────────────────────────────────
    const { data: notifications = [], isLoading, isRefetching } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getNotifications(),
        refetchInterval: 30 * 1000, // Poll every 30 seconds
        staleTime: 20 * 1000,
    });

    const unreadCount = notifications.filter(n => !n.read_status).length;

    // ── Mutations ─────────────────────────────────────────────────────

    // Mark as Read
    const markAsReadMutation = useMutation({
        mutationFn: (id: number) => notificationService.markAsRead(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });
            await queryClient.cancelQueries({ queryKey: ['notifications-unread-count'] });

            const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);
            const previousUnreadCount = queryClient.getQueryData<number>(['notifications-unread-count']);

            queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
                old.map(n => n.id === id ? { ...n, read_status: true } : n)
            );
            queryClient.setQueryData<number>(['notifications-unread-count'], (old = 0) =>
                Math.max(0, old - 1)
            );

            return { previousNotifications, previousUnreadCount };
        },
        onError: (err, id, context) => {
            if (context) {
                queryClient.setQueryData(['notifications'], context.previousNotifications);
                queryClient.setQueryData(['notifications-unread-count'], context.previousUnreadCount);
            }
            toast.error("Failed to mark as read");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
        onSuccess: () => {
            toast.success("Marked as read");
        }
    });

    // Mark All as Read
    const markAllReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });
            await queryClient.cancelQueries({ queryKey: ['notifications-unread-count'] });

            const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);
            const previousUnreadCount = queryClient.getQueryData<number>(['notifications-unread-count']);

            queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
                old.map(n => ({ ...n, read_status: true }))
            );
            queryClient.setQueryData<number>(['notifications-unread-count'], 0);

            return { previousNotifications, previousUnreadCount };
        },
        onError: (err, _, context) => {
            if (context) {
                queryClient.setQueryData(['notifications'], context.previousNotifications);
                queryClient.setQueryData(['notifications-unread-count'], context.previousUnreadCount);
            }
            toast.error("Failed to mark all as read");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
        onSuccess: () => {
            toast.success("All caught up!");
        }
    });

    // Delete (Archive)
    const deleteMutation = useMutation({
        mutationFn: (id: number) => notificationService.deleteNotification(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });

            const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);
            const wasUnread = previousNotifications?.find(n => n.id === id)?.read_status === false;

            queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
                old.filter(n => n.id !== id)
            );

            if (wasUnread) {
                queryClient.setQueryData<number>(['notifications-unread-count'], (old = 0) =>
                    Math.max(0, old - 1)
                );
            }

            return { previousNotifications };
        },
        onError: (err, id, context) => {
            if (context) {
                queryClient.setQueryData(['notifications'], context.previousNotifications);
            }
            toast.error("Failed to archive notification");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
        onSuccess: () => {
            toast.success("Archived successfully");
        }
    });

    const getIconDetails = (category: string) => {
        switch (category.toUpperCase()) {
            case 'BILLING': return { Icon: AlertTriangle, bg: 'bg-rose-50', color: 'text-rose-500', border: 'border-rose-100' };
            case 'DAILY_TEST':
            case 'WEEKLY_TEST':
            case 'TEST_SERIES': return { Icon: FileText, bg: 'bg-accent/5', color: 'text-accent', border: 'border-accent/10' };
            case 'STREAK':
            case 'ACHIEVEMENT': return { Icon: Trophy, bg: 'bg-amber-50', color: 'text-amber-500', border: 'border-amber-100' };
            default: return { Icon: Bell, bg: 'bg-primary/5', color: 'text-primary', border: 'border-primary/10' };
        }
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.read_status);

    const formatNotificationDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
            
            if (diffInSeconds < 60) return '0m ago';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
            
            const { format } = require('date-fns');
            return format(date, 'MMM dd, hh:mm a');
        } catch (e) {
            return 'Recently';
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">

                {/* Header Controls */}
                <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border/50">
                            <button
                                onClick={() => setFilter('all')}
                                className={cn(
                                    "px-5 py-1.5 text-[11px] font-medium rounded-sm transition-all",
                                    filter === 'all' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}>
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={cn(
                                    "px-5 py-1.5 text-[11px] font-medium rounded-sm transition-all",
                                    filter === 'unread' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}>
                                Unread
                            </button>
                        </div>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-medium text-primary bg-accent/10 px-2 py-0.5 rounded-full">
                                {unreadCount} New
                            </span>
                        )}
                        {isRefetching && (
                            <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground/40" />
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAllReadMutation.mutate()}
                            disabled={unreadCount === 0 || markAllReadMutation.isPending}
                            className="h-9 text-[11px] font-medium text-primary hover:bg-transparent rounded-xl px-4"
                        >
                            {markAllReadMutation.isPending ? "Updating..." : "Mark all as read"}
                        </Button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4 relative min-h-[400px]">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="bg-card border border-border/40 rounded-2xl p-5 flex gap-4">
                                <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-1/4 rounded" />
                                        <Skeleton className="h-3 w-16 rounded" />
                                    </div>
                                    <Skeleton className="h-3 w-3/4 rounded" />
                                </div>
                            </div>
                        ))
                    ) : filteredNotifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-[2.5rem] bg-muted/10 border-2 border-dashed border-border/40"
                        >
                            <div className="w-20 h-20 bg-card rounded-3xl shadow-xl flex items-center justify-center mb-6 text-muted-foreground/30 border border-border/20">
                                <Bell className="w-8 h-8 opacity-40" />
                            </div>
                            <h3 className="text-xl font-medium text-foreground mb-2 tracking-tight">Zero Notifications</h3>
                            <p className="text-muted-foreground text-sm max-w-[280px] font-medium">You&apos;re all caught up! New alerts will appear here as you progress.</p>
                            <Button
                                variant="outline"
                                className="mt-8 rounded-xl font-medium px-8 border-primary/20 hover:bg-primary/5 text-primary"
                                onClick={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
                            >
                                Sync Now
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-3">
                            <AnimatePresence mode="popLayout">
                                {filteredNotifications.map((n) => {
                                    const { Icon, bg, color, border } = getIconDetails(n.category);
                                    return (
                                        <motion.div
                                            key={n.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={cn(
                                                "group relative bg-card border border-border/40 rounded-[1.25rem] p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5",
                                                !n.read_status ? "shadow-sm border-primary/10" : "opacity-80 grayscale-[0.2]"
                                            )}
                                        >
                                            {/* Accent for unread */}
                                            {!n.read_status && (
                                                <div className="absolute left-0 top-6 bottom-6 w-1 bg-accent rounded-r-full shadow-[0_0_10px_rgba(var(--accent),0.3)]" />
                                            )}

                                            <div className="flex gap-5">
                                                {/* Branded Icon Container */}
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-300 group-hover:bg-card group-hover:-translate-y-1",
                                                    bg, border
                                                )}>
                                                    <Icon className={cn("w-5 h-5", color)} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex-1 min-w-0 flex items-center gap-3">
                                                            <h4 className={cn(
                                                                "text-[15px] leading-tight font-semibold tracking-tight truncate",
                                                                !n.read_status ? "text-[#0F172A]" : "text-[#64748B]"
                                                            )}>
                                                                {n.title || n.category.replace(/_/g, ' ')}
                                                            </h4>
                                                            {!n.read_status && (
                                                                <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 ml-4 shrink-0">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="p-1.5 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-2xl border-border/40">
                                                                    {!n.read_status && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => markAsReadMutation.mutate(n.id)}
                                                                            disabled={markAsReadMutation.isPending}
                                                                            className="rounded-lg gap-2.5 text-foreground font-medium cursor-pointer hover:bg-transparent"
                                                                        >
                                                                            <Check className="w-4 h-4 text-emerald-500" />
                                                                            Mark as read
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem
                                                                        onClick={() => deleteMutation.mutate(n.id)}
                                                                        disabled={deleteMutation.isPending}
                                                                        className="rounded-lg gap-2.5 text-rose-500 font-medium cursor-pointer hover:bg-transparent"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        Archive alert
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>

                                                    <p className={cn(
                                                        "text-[13px] leading-relaxed line-clamp-2 font-medium mb-1.5",
                                                        !n.read_status ? "text-muted-foreground" : "text-muted-foreground/70"
                                                    )}>
                                                        {n.message}
                                                    </p>

                                                    <span className="text-[10px] font-medium text-[#94A3B8]/80 flex items-center gap-1.5">
                                                        {formatNotificationDate(n.date_sent)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </DashboardLayout>
    );
}
