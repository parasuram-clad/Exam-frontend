import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { notificationService, Notification } from "@/services/notification.service";
import {
    Bell,
    CheckCircle2,
    Trash2,
    Clock,
    AlertTriangle,
    Trophy,
    FileText,
    MoreVertical,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            toast.dark("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read_status: true } : n)
            );
            toast.success("Notification marked as read");
        } catch (error) {
            toast.error("Failed to update notification");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Notification deleted");
        } catch (error) {
            toast.error("Failed to delete notification");
        }
    };

    const markAllRead = async () => {
        const unread = notifications.filter(n => !n.read_status);
        if (unread.length === 0) return;

        try {
            await Promise.all(unread.map(n => notificationService.markAsRead(n.id)));
            setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error("Action failed partially");
        }
    };

    const getIconDetails = (category: string) => {
        switch (category.toUpperCase()) {
            case 'BILLING': return { Icon: AlertTriangle, bg: 'bg-rose-50', color: 'text-rose-500', border: 'border-rose-200' };
            case 'DAILY_TEST':
            case 'WEEKLY_TEST':
            case 'TEST_SERIES': return { Icon: FileText, bg: 'bg-blue-50', color: 'text-blue-500', border: 'border-blue-200' };
            case 'STREAK':
            case 'ACHIEVEMENT': return { Icon: Trophy, bg: 'bg-amber-50', color: 'text-amber-500', border: 'border-amber-200' };
            default: return { Icon: Bell, bg: 'bg-primary/5', color: 'text-primary', border: 'border-primary/20' };
        }
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.read_status);

    const unreadCount = notifications.filter(n => !n.read_status).length;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Updates & Alerts</h1>
                            {unreadCount > 0 && (
                                <span className="flex items-center justify-center bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    {unreadCount} NEW
                                </span>
                            )}
                        </div>
                        <p className="text-[#64748B] text-sm font-medium">Keep track of your learning journey and system activity.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-100 shadow-sm self-start md:self-auto">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                                filter === 'all' ? "bg-[#0F172A] text-white shadow-md" : "text-[#64748B] hover:bg-gray-50"
                            )}>
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                                filter === 'unread' ? "bg-[#0F172A] text-white shadow-md" : "text-[#64748B] hover:bg-gray-50"
                            )}>
                            Unread
                        </button>
                        <div className="w-[1px] h-4 bg-gray-200 mx-1" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllRead}
                            disabled={unreadCount === 0}
                            className="h-8 text-[11px] font-bold text-primary hover:bg-primary/5"
                        >
                            Mark all as read
                        </Button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4 relative min-h-[400px]">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-100 rounded-full shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-gray-100 rounded w-1/4" />
                                        <div className="h-3 bg-gray-100 rounded w-16" />
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                                </div>
                            </div>
                        ))
                    ) : filteredNotifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100"
                        >
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 text-gray-300">
                                <Bell className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-2">Zero Notifications</h3>
                            <p className="text-[#64748B] text-sm max-w-[280px]">You're all caught up! New alerts will appear here as you progress.</p>
                            <Button variant="outline" className="mt-8 rounded-xl font-bold bg-white" onClick={fetchNotifications}>Check Again</Button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredNotifications.map((n) => {
                                    const { Icon, bg, color, border } = getIconDetails(n.category);
                                    return (
                                        <motion.div
                                            key={n.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={cn(
                                                "group relative bg-white border border-gray-100 rounded-2xl p-5 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5",
                                                !n.read_status && "ring-1 ring-primary/10 shadow-sm"
                                            )}
                                        >
                                            {/* Left Status Bar */}
                                            {!n.read_status && (
                                                <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-r-full" />
                                            )}

                                            <div className="flex gap-4">
                                                {/* Icon Container */}
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 duration-300",
                                                    bg, border
                                                )}>
                                                    <Icon className={cn("w-6 h-6", color)} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-[10px] font-bold uppercase tracking-widest py-0.5 px-2 rounded-md",
                                                                bg, color
                                                            )}>
                                                                {n.category.replace('_', ' ')}
                                                            </span>
                                                            {!n.read_status && (
                                                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-medium text-[#94A3B8] flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDistanceToNow(new Date(n.date_sent), { addSuffix: true })}
                                                            </span>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="p-1 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                                                        <MoreVertical className="w-4 h-4 text-[#64748B]" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-2xl border-none">
                                                                    {!n.read_status && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleMarkAsRead(n.id)}
                                                                            className="rounded-lg gap-2 text-[#0F172A] font-medium cursor-pointer"
                                                                        >
                                                                            <Check className="w-4 h-4 text-emerald-500" />
                                                                            Mark as read
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDelete(n.id)}
                                                                        className="rounded-lg gap-2 text-rose-500 font-medium cursor-pointer"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        Archive Alert
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>

                                                    <h4 className={cn(
                                                        "text-[15px] leading-tight mb-1",
                                                        !n.read_status ? "font-bold text-[#0F172A]" : "font-semibold text-[#475569]"
                                                    )}>
                                                        {n.message.split(': ')[0]}
                                                    </h4>

                                                    <p className={cn(
                                                        "text-[13px] leading-relaxed line-clamp-2",
                                                        !n.read_status ? "text-[#475569] font-medium" : "text-[#64748B]"
                                                    )}>
                                                        {n.message.split(': ').length > 1 ? n.message.split(': ').slice(1).join(': ') : n.message}
                                                    </p>

                                                    {/* Inline Actions (Mobile / Hover) */}
                                                    <div className="mt-4 flex items-center gap-3 md:hidden">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="h-8 rounded-lg text-[10px] font-bold bg-[#0F172A]"
                                                            onClick={() => handleMarkAsRead(n.id)}
                                                            disabled={n.read_status}
                                                        >
                                                            {n.read_status ? 'Read' : 'Mark Read'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 rounded-lg text-[10px] font-bold border-rose-100 text-rose-500 hover:bg-rose-50"
                                                            onClick={() => handleDelete(n.id)}
                                                        >
                                                            Archive
                                                        </Button>
                                                    </div>
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
