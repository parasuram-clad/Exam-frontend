import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ChatbotWidget } from "../ChatbotWidget";
import authService, { UserMe } from "@/services/auth.service";

interface DashboardLayoutProps {
    children: React.ReactNode;
    rightSidebar?: React.ReactNode;
    hideHeader?: boolean;
}

export function DashboardLayout({ children, rightSidebar, hideHeader = false }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<UserMe | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const u = await authService.getCurrentUser();
                setUser(u);
            } catch (err) {
                console.error("Failed to fetch user", err);
            }
        };
        fetchUser();
    }, []);

    const userName = user?.full_name || user?.username || "Aspirant";
    const userTitle = user?.qualification || "TNPSC Aspirant";

    // Handle relative avatar URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const avatarUrl = user?.photo_url
        ? (user.photo_url.startsWith('http') ? user.photo_url : `${baseUrl}${user.photo_url}`)
        : undefined;

    return (
        <div className="flex h-screen bg-background overflow-hidden ">
            {/* Left Sidebar */}
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex min-w-0 overflow-hidden">

                {/* Center Column (Header + Main Content) */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden ">
                    {!hideHeader && (
                        <Header
                            userName={userName}
                            userTitle={userTitle}
                            avatarUrl={avatarUrl}
                            onMenuToggle={() => setSidebarOpen(true)}
                        />
                    )}

                    <main className="flex-1 overflow-y-auto p-4 lg:p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        <div className="w-full">
                            {children}
                        </div>
                    </main>
                </div>

                {/* Right Sidebar - Desktop Fixed */}
                {rightSidebar && (
                    <aside className="hidden xl:block w-80 border-l border-border bg-card h-full overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        {rightSidebar}
                    </aside>
                )}
            </div>

        </div>
    );
}
