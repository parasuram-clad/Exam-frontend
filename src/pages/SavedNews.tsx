import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    Search,
    SlidersHorizontal,
    Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import authService, { UserMe } from "@/services/auth.service";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import pic from "@/assets/pic.png";

interface SavedNewsItem {
    id: string;
    title: string;
    category: string;
    date: string; // Format: "Dec 26"
    fullDate: string; // For sorting/filtering
}

const mockSavedNews: SavedNewsItem[] = [
    { id: "1", title: "Indian Constitution", category: "Indian Polity", date: "Dec 26", fullDate: "2025-12-26" },
    { id: "2", title: "Indian National Movement", category: "Modern History", date: "Dec 20", fullDate: "2025-12-20" },
    { id: "3", title: "Indian Rivers", category: "Geography", date: "Dec 14", fullDate: "2025-12-14" },
    { id: "4", title: "Indian Economy – Budget", category: "Indian Economy", date: "Dec 12", fullDate: "2025-12-12" },
];

const SavedNews = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserMe | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const isDesktop = useMediaQuery("(min-width: 1280px)");

    useEffect(() => {
        const fetchUser = async () => {
            const u = await authService.getCurrentUser();
            setUser(u);
        };
        fetchUser();
    }, []);

    const userName = user?.full_name || user?.username || "Aspirant";
    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const avatarUrl = user?.photo_url
        ? user.photo_url.startsWith("http")
            ? user.photo_url
            : `${baseUrl}${user.photo_url}`
        : pic;

    const filteredNews = mockSavedNews.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout
            hideHeader={isDesktop}
            rightSidebar={() => (
                <div className="hidden xl:flex flex-col gap-6">
                    {/* Header row from user's image style */}
                    <div className="flex items-center justify-between">
                        <LanguageToggle />
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                                <Bell className="w-5 h-5" />
                            </button>
                            <div className="relative cursor-pointer" onClick={() => navigate("/profile")}>
                                <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                    <AvatarImage src={avatarUrl} alt={userName} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-[10px] text-white">⭐</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Add more sidebar widgets here if needed, like the original sidebars */}
                </div>
            )}
        >
            <div className="max-w-[450px] mx-auto pt-6 px-4 font-['Inter',sans-serif]">

                {/* Mobile-only header matches the top layout in image */}
                {!isDesktop && (
                    <div className="flex items-center justify-between mb-8 px-1">
                        <LanguageToggle />
                        <div className="flex items-center gap-4">
                            <Bell className="w-6 h-6 text-slate-400" />
                            <div className="relative cursor-pointer" onClick={() => navigate("/profile")}>
                                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                                    <AvatarImage src={avatarUrl} alt={userName} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-[8px] text-white">⭐</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-800" />
                    </button>
                    <h1 className="text-[22px] font-bold text-[#1E293B]">My Study Notes</h1>
                </div>

                {/* Search & Filter Section */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search notes by topic"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-full py-3.5 pl-12 pr-6 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <SlidersHorizontal className="w-5 h-5 text-slate-800" />
                    </button>
                </div>

                {/* List Section */}
                <div className="space-y-6">
                    {filteredNews.map((item, idx) => {
                        const [month, day] = item.date.split(" ");
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => navigate(`/current-affairs/${item.id}`)}
                                className="flex items-center gap-5 group cursor-pointer"
                            >
                                {/* Date Block */}
                                <div className="w-[68px] h-[68px] bg-[#F0F7FF] rounded-[18px] flex flex-col items-center justify-center shrink-0">
                                    <span className="text-[12px] font-medium text-slate-400 uppercase tracking-wide">{month}</span>
                                    <span className="text-[18px] font-bold text-[#1E293B] -mt-0.5">{day}</span>
                                </div>

                                {/* Content Block */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[17px] font-semibold text-[#1E293B] group-hover:text-primary transition-colors truncate">
                                        {item.title}
                                    </h3>
                                    <p className="text-[14px] text-[#94A3B8] font-medium mt-1">
                                        {item.category}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SavedNews;
