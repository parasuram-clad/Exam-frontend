import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { RightSidebarWidgets } from "@/components/dashboard";
import authService, { UserMe } from "@/services/auth.service";
import { MobileBottomNav } from "./MobileBottomNav";
import { RightSidebarHeader } from "./RightSidebarHeader";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/env";

import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardLayoutProps {
    children: React.ReactNode;
    rightSidebar?: React.ReactNode | ((props: { mobileView?: 'streak' | 'leaderboard' | 'all' }) => React.ReactNode);
    hideHeader?: boolean;
    activePath?: string;
}

export function DashboardLayout({ children, rightSidebar, hideHeader = false, activePath }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileRightSidebarOpen, setMobileRightSidebarOpen] = useState(false);
    const [mobileRightSidebarView, setMobileRightSidebarView] = useState<'streak' | 'leaderboard' | 'all'>('all');
    const { user } = useAuth();

    const userName = user?.full_name || user?.username || "Aspirant";
    const userTitle = user?.qualification || "TNPSC Aspirant";

    // Handle relative avatar URL
    const avatarUrl = user?.photo_url
        ? (user.photo_url.startsWith('http') ? user.photo_url : `${BASE_URL}${user.photo_url}`)
        : undefined;

    const initials = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

    const handleStreakClick = () => {
        setMobileRightSidebarView('streak');
        setMobileRightSidebarOpen(true);
    };

    const handleLeaderboardClick = () => {
        setMobileRightSidebarView('leaderboard');
        setMobileRightSidebarOpen(true);
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden ">
            {/* Sidebar - Direct child for flex layout */}
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} activePath={activePath} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex min-w-0 overflow-hidden">

                {/* Center Column (Header + Main Content) */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 lg:pb-0">
                    {!hideHeader && (
                        <Header
                            user={user}
                            userName={userName}
                            userTitle={userTitle}
                            avatarUrl={avatarUrl}
                            onMenuToggle={() => setSidebarOpen(true)}
                            onStreakClick={handleStreakClick}
                            onLeaderboardClick={handleLeaderboardClick}
                        />
                    )}

                    <main className="flex-1 overflow-y-auto p-4 lg:p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        <div className="w-full pb-20 lg:pb-0">
                            {children}
                        </div>
                    </main>
                </div>

                {/* Right Sidebar - Desktop Fixed */}
                {rightSidebar && (
                    <aside className="hidden xl:block w-80 md:w-72 lg:w-80 xl:w-80 2xl:w-96 border-l border-border bg-card h-full overflow-y-auto p-3 xl:p-4 space-y-4 xl:space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

                        <RightSidebarHeader
                            user={user}
                            userName={userName}
                            avatarUrl={avatarUrl}
                            initials={initials}
                        />
                        {typeof rightSidebar === 'function'
                            ? rightSidebar({ mobileView: 'all' })
                            : rightSidebar}
                    </aside>
                )}

                {/* Right Sidebar - Mobile Sheet (Always available if mobileRightSidebarOpen is true) */}
                <Sheet open={mobileRightSidebarOpen} onOpenChange={(open) => {
                    setMobileRightSidebarOpen(open);
                    if (!open) {
                        setTimeout(() => setMobileRightSidebarView('all'), 300);
                    }
                }}>
                    <SheetContent side="right" className="w-[100%] sm:w-[400px] overflow-y-auto p-6">
                        {/* Inject the view prop into the RightSidebarWidgets if possible, otherwise render default widgets */}
                        {rightSidebar ? (
                            typeof rightSidebar === 'function'
                                ? rightSidebar({ mobileView: mobileRightSidebarView })
                                : React.isValidElement(rightSidebar)
                                    ? React.cloneElement(rightSidebar as React.ReactElement<any>, { initialView: mobileRightSidebarView })
                                    : rightSidebar
                        ) : (
                            <div className="space-y-6">
                                {/* If no explicit right sidebar, create a minimal wrapper for widgets */}
                                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                                    <h2 className="text-lg font-semibold">
                                        {mobileRightSidebarView === 'streak' ? 'Your Streak' :
                                            mobileRightSidebarView === 'leaderboard' ? 'Leaderboard' : 'Home'}
                                    </h2>
                                </div>
                                <RightSidebarWidgets initialView={mobileRightSidebarView} />
                            </div>
                        )}
                    </SheetContent>
                </Sheet>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav activePath={activePath} />

        </div>
    );
}
