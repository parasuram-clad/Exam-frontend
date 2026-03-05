import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import chatbotService from "@/services/chatbot.service";
import authService, { UserMe } from "@/services/auth.service";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

interface Position {
    x: number;
    y: number;
}

interface ExpansionDirection {
    vertical: 'up' | 'down';
    horizontal: 'left' | 'right';
    transformOrigin: string;
}

export function ChatbotWidget() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<number | undefined>(undefined);
    const [user, setUser] = useState<UserMe | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        const path = location.pathname;
        let welcomeText = "Hi! How can I help you today?";

        if (path === "/") welcomeText = "Welcome back! Need help with your dashboard?";
        if (path.includes("test-series")) welcomeText = "Need help with this test? I'm here to assist!";
        if (path.includes("study-plan")) welcomeText = "Need help organizing your study schedule?";
        if (path.includes("leaderboard")) welcomeText = "Crushing it! Want to know how to reach Rank #1?";

        setMessages([
            {
                id: "1",
                text: welcomeText,
                sender: "bot",
                timestamp: new Date(),
            },
        ]);
        // Reset conversation on page change? Maybe not, but for now we follow old logic
        // setConversationId(undefined); 
    }, [location.pathname]);

    const [inputValue, setInputValue] = useState("");
    const [position, setPosition] = useState<Position | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const [expansionDir, setExpansionDir] = useState<ExpansionDirection>({
        vertical: 'up',
        horizontal: 'right',
        transformOrigin: 'bottom right',
    });
    const [showNudge, setShowNudge] = useState(false);
    const [isHoveringIcon, setIsHoveringIcon] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef<Position>({ x: 0, y: 0 });
    const hasDragged = useRef(false);
    const nudgeTimeoutRef = useRef<any>();
    const nudgeIntervalRef = useRef<any>();

    // Panel dimensions
    const PANEL_WIDTH = window.innerWidth < 640 ? window.innerWidth - 32 : 380;
    const PANEL_HEIGHT = window.innerHeight < 640 ? window.innerHeight - 100 : 500;
    const ICON_SIZE = 56;
    const MARGIN = 16;
    const DRAG_THRESHOLD = 10; // Increased threshold for better click reliability

    // Nudge timing constants
    const NUDGE_SHOW_DURATION = 4000; // Show for 4 seconds
    const NUDGE_INTERVAL = 10000; // Appear every 10 seconds

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Calculate optimal expansion direction based on available space
    const calculateExpansionDirection = (): ExpansionDirection => {
        const buttonRect = buttonRef.current?.getBoundingClientRect();
        if (!buttonRect) {
            return {
                vertical: 'up',
                horizontal: 'left',
                transformOrigin: 'bottom right',
            };
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate available space in each direction from the icon center
        const iconCenterX = buttonRect.left + ICON_SIZE / 2;
        const iconCenterY = buttonRect.top + ICON_SIZE / 2;

        const spaceRight = viewportWidth - iconCenterX - MARGIN;
        const spaceLeft = iconCenterX - MARGIN;
        const spaceDown = viewportHeight - iconCenterY - MARGIN;
        const spaceUp = iconCenterY - MARGIN;

        // Determine horizontal direction (prefer right if equal)
        const horizontal: 'left' | 'right' = spaceRight >= PANEL_WIDTH
            ? 'right'
            : spaceLeft >= PANEL_WIDTH
                ? 'left'
                : spaceRight >= spaceLeft
                    ? 'right'
                    : 'left';

        // Determine vertical direction (prefer up if equal for better UX)
        const vertical: 'up' | 'down' = spaceUp >= PANEL_HEIGHT
            ? 'up'
            : spaceDown >= PANEL_HEIGHT
                ? 'down'
                : spaceUp >= spaceDown
                    ? 'up'
                    : 'down';

        // Set transform origin based on expansion direction
        const transformOrigin = `${vertical === 'up' ? 'bottom' : 'top'} ${horizontal === 'left' ? 'right' : 'left'}`;

        return { vertical, horizontal, transformOrigin };
    };

    // Calculate panel position based on icon position and expansion direction
    const calculatePanelPosition = (): React.CSSProperties => {
        if (!isOpen) return {};

        const buttonRect = buttonRef.current?.getBoundingClientRect();
        if (!buttonRect) return {};

        const iconCenterX = buttonRect.left + ICON_SIZE / 2;
        const iconCenterY = buttonRect.top + ICON_SIZE / 2;

        let left: number;
        let top: number;

        // Calculate horizontal position
        if (expansionDir.horizontal === 'right') {
            // Expand to the right - align panel left edge with icon center
            left = iconCenterX;
        } else {
            // Expand to the left - align panel right edge with icon center
            left = iconCenterX - PANEL_WIDTH;
        }

        // Calculate vertical position
        if (expansionDir.vertical === 'up') {
            // Expand upward - align panel bottom edge with icon center
            top = iconCenterY - PANEL_HEIGHT;
        } else {
            // Expand downward - align panel top edge with icon center
            top = iconCenterY;
        }

        // Constrain to viewport
        left = Math.max(MARGIN, Math.min(left, window.innerWidth - PANEL_WIDTH - MARGIN));
        top = Math.max(MARGIN, Math.min(top, window.innerHeight - PANEL_HEIGHT - MARGIN));

        return {
            left: `${left}px`,
            top: `${top}px`,
        };
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue;
        const newMessage: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages([...messages, newMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await chatbotService.askChatbot({
                user_id: user?.id,
                syllabus_id: 1, // Default syllabus ID, should be dynamic if possible
                question: userText,
                conversation_id: conversationId,
            });

            if (response.conversation_id) {
                setConversationId(response.conversation_id);
            }

            const botResponse: Message = {
                id: response.id.toString(),
                text: response.answer || "I'm sorry, I couldn't process that.",
                sender: "bot",
                timestamp: new Date(response.created_at),
            };
            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Drag handlers
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        // Use buttonRef for offset calculation to ensure consistent anchor point
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: clientX - rect.left,
                y: clientY - rect.top,
            });
        }
        dragStartPos.current = { x: clientX, y: clientY };
        hasDragged.current = false;
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const newX = clientX - dragOffset.x;
        const newY = clientY - dragOffset.y;

        // Free 2D dragging - constrain to viewport but allow full movement
        const maxX = window.innerWidth - ICON_SIZE;
        const maxY = window.innerHeight - ICON_SIZE;

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
        });

        // Check if the drag has moved beyond the threshold
        if (Math.abs(clientX - dragStartPos.current.x) > DRAG_THRESHOLD || Math.abs(clientY - dragStartPos.current.y) > DRAG_THRESHOLD) {
            hasDragged.current = true;
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            const moveHandler = (e: MouseEvent | TouchEvent) => {
                e.preventDefault();
                handleDragMove(e);
            };

            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('touchmove', moveHandler, { passive: false });
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchend', handleDragEnd);

            return () => {
                window.removeEventListener('mousemove', moveHandler);
                window.removeEventListener('touchmove', moveHandler);
                window.removeEventListener('mouseup', handleDragEnd);
                window.removeEventListener('touchend', handleDragEnd);
            };
        }
    }, [isDragging, dragOffset]);

    // Nudge logic
    useEffect(() => {
        if (isOpen || isHoveringIcon) {
            setShowNudge(false);
            if (nudgeTimeoutRef.current) clearTimeout(nudgeTimeoutRef.current);
            if (nudgeIntervalRef.current) clearInterval(nudgeIntervalRef.current);
            return;
        }

        const startNudgeCycle = () => {
            setShowNudge(true);
            nudgeTimeoutRef.current = setTimeout(() => {
                setShowNudge(false);
            }, NUDGE_SHOW_DURATION);
        };

        const initialDelay = setTimeout(() => {
            startNudgeCycle();
            nudgeIntervalRef.current = setInterval(() => {
                startNudgeCycle();
            }, NUDGE_INTERVAL);
        }, 3000);

        return () => {
            clearTimeout(initialDelay);
            if (nudgeTimeoutRef.current) clearTimeout(nudgeTimeoutRef.current);
            if (nudgeIntervalRef.current) clearInterval(nudgeIntervalRef.current);
        };
    }, [isOpen, isHoveringIcon]);

    const isTypingIndicator = isLoading;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={dragRef}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{
                            position: 'fixed',
                            ...calculatePanelPosition(),
                            width: `${PANEL_WIDTH}px`,
                            height: `${PANEL_HEIGHT}px`,
                            zIndex: 100,
                            cursor: isDragging ? 'grabbing' : 'grab',
                            transformOrigin: expansionDir.transformOrigin,
                        }}
                        className="chatbot-panel"
                    >
                        {/* Liquid Glass Container */}
                        <div
                            className="relative size-full rounded-3xl overflow-hidden"
                            onMouseDown={handleDragStart}
                            onTouchStart={handleDragStart}
                        >
                            <div className="absolute inset-0 bg-white/30 dark:bg-black/30 rounded-3xl" />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent dark:from-white/20 dark:via-white/10 dark:to-transparent rounded-3xl" />
                            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent dark:from-white/30 dark:to-transparent rounded-t-3xl" />
                            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/40 dark:bg-white/20 rounded-full blur-3xl" />
                            <div className="absolute inset-0 rounded-3xl border-2 border-white/70 dark:border-white/40 pointer-events-none" />
                            <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.3)] pointer-events-none" />
                            <div className="absolute inset-0 liquid-reflection rounded-3xl pointer-events-none" />
                            <div className="absolute inset-0 rounded-3xl shadow-2xl shadow-black/20 dark:shadow-black/60" />

                            <div className="relative size-full flex flex-col backdrop-blur-sm bg-white/20 dark:bg-black/20 rounded-3xl">
                                {/* Header */}
                                <div
                                    className="flex items-center justify-between p-4 border-b border-white/30 dark:border-white/10 bg-white/40 dark:bg-black/40 rounded-t-3xl"
                                    style={{ cursor: 'grab' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 dark:from-white/20 dark:to-white/10 flex items-center justify-center border border-white/30 dark:border-white/20">
                                            <MessageCircle className="size-5 text-primary dark:text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-foreground">Exam Assistant</h3>
                                            <p className="text-xs text-foreground/60">Online</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                        }}
                                        className="size-8 rounded-full hover:bg-white/30 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                    >
                                        <X className="size-4 text-foreground/80" />
                                    </button>
                                </div>

                                {/* Messages area */}
                                <div
                                    className="flex-1 overflow-y-auto p-4 space-y-4 liquid-scrollbar relative"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                >
                                    <div className="relative z-10">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex mb-3 ${message.sender === "user" ? "justify-end" : "justify-start"
                                                    }`}
                                            >
                                                <div className="relative max-w-[75%]">
                                                    {message.sender === "user" ? (
                                                        <div className="relative rounded-2xl overflow-hidden bg-primary text-primary-foreground">
                                                            <div className="relative px-4 py-2.5">
                                                                <p className="text-sm font-medium">
                                                                    {message.text}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="relative rounded-2xl overflow-hidden bg-card border border-border">
                                                            <div className="relative px-4 py-2.5">
                                                                <p className="text-sm text-foreground">
                                                                    {message.text}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isTypingIndicator && (
                                            <div className="flex justify-start mb-3">
                                                <div className="relative rounded-2xl overflow-hidden bg-card border border-border">
                                                    <div className="relative px-4 py-2.5 flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" />
                                                        <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                        <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input area */}
                                <div
                                    className="p-4 border-t border-white/30 dark:border-white/10 bg-white/40 dark:bg-black/40 rounded-b-3xl"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                >
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-2.5 rounded-full bg-background/80 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground shadow-sm"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!inputValue.trim()}
                                            className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 shadow-lg shadow-primary/20"
                                        >
                                            <Send className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating button */}
            <motion.div
                ref={buttonRef}
                style={{
                    position: 'fixed',
                    ...(position === null
                        ? { right: '1.5rem', bottom: '1.5rem' }
                        : { left: `${position.x}px`, top: `${position.y}px` }),
                    width: `${ICON_SIZE}px`,
                    height: `${ICON_SIZE}px`,
                    zIndex: 100,
                    cursor: isDragging ? 'grabbing' : 'grab',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setIsHoveringIcon(true)}
                onMouseLeave={() => setIsHoveringIcon(false)}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onClick={(e) => {
                    // Prevent normal click if we were dragging
                    if (hasDragged.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }

                    if (!isOpen) {
                        const direction = calculateExpansionDirection();
                        setExpansionDir(direction);
                        setIsOpen(true);
                    } else {
                        setIsOpen(false);
                    }
                }}
                className="chatbot-button group touch-none"
            >
                {/* Liquid Glass Button Container */}
                <div className="relative size-full rounded-full overflow-visible">
                    {/* Base glass layer - subtle in idle state */}
                    <div className="absolute inset-0 bg-white/25 dark:bg-black/25 group-hover:bg-white/40 dark:group-hover:bg-black/40 rounded-full transition-colors duration-300" />

                    {/* Gradient refraction - enhanced on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent dark:from-white/20 dark:via-white/10 dark:to-transparent group-hover:from-white/60 group-hover:via-white/30 dark:group-hover:from-white/30 dark:group-hover:via-white/15 rounded-full transition-all duration-300" />

                    {/* Specular highlight - more pronounced on hover */}
                    <div className="absolute top-1 left-2 right-6 h-6 bg-gradient-to-b from-white/50 to-transparent dark:from-white/30 dark:to-transparent group-hover:from-white/80 dark:group-hover:from-white/50 rounded-full blur-sm transition-all duration-300" />

                    {/* Rim light - bright edge, enhanced on hover */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/50 dark:border-white/30 group-hover:border-white/80 dark:group-hover:border-white/50 transition-colors duration-300" />
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)] group-hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.3)] transition-shadow duration-300" />

                    {/* Liquid reflection animation */}
                    <div className="absolute inset-0 liquid-reflection-button rounded-full" />

                    {/* Outer glow - subtle by default */}
                    <div className="absolute inset-0 rounded-full shadow-md shadow-black/5 dark:shadow-black/30 group-hover:shadow-lg group-hover:shadow-black/10 dark:group-hover:shadow-black/40 transition-shadow duration-300" />

                    {/* Icon container */}
                    <div className="relative size-full flex items-center justify-center">
                        <MessageCircle className="size-6 text-primary dark:text-white group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                    </div>
                </div>
            </motion.div>

            {/* Nudge message */}
            <AnimatePresence>
                {showNudge && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            position: 'fixed',
                            ...(position === null
                                ? { right: '5.5rem', bottom: '2rem' }
                                : {
                                    left: position.x > window.innerWidth / 2 ? 'auto' : `${position.x + ICON_SIZE + 12}px`,
                                    right: position.x > window.innerWidth / 2 ? `${window.innerWidth - position.x + 12}px` : 'auto',
                                    bottom: `${window.innerHeight - position.y - ICON_SIZE / 2 + 8}px`,
                                }),
                            zIndex: 100,
                            pointerEvents: 'none',
                        }}
                    >
                        <div className="relative px-4 py-2 rounded-xl bg-card border border-border shadow-xl">
                            <p className="text-sm font-medium text-foreground whitespace-nowrap">
                                Need answers? I'm here!
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        .liquid-reflection {
          background: linear-gradient(
            135deg,
            transparent 0%,
            transparent 30%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 70%,
            transparent 100%
          );
          background-size: 300% 300%;
          animation: liquid-sweep 4s ease-in-out infinite;
        }

        @keyframes liquid-sweep {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }

        .liquid-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .liquid-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .liquid-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(155, 155, 155, 0.5);
          border-radius: 4px;
        }
      `}</style>
        </>
    );
}
