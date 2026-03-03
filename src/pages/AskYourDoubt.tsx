import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowUp, Bot, MessageSquare, Clock, Plus, Eraser, Sparkles, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import chatbotService from "@/services/chatbot.service";
import authService, { UserMe } from "@/services/auth.service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  conversation_id?: number;
  title: string;
  date: string;
  messages: Message[];
}

const QUICK_QUESTIONS = [
  "Explain in simple Tamil",
  "Give previous year question",
  "5 practice questions",
  "Short summary",
  "Important points only",
  "Easy trick to remember",
];

const now = () =>
  new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const defaultMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Vanakkam! I am your AI Tutor. Start a new topic or ask a doubt.",
    timestamp: "03:51 PM",
  },
];

/* ── animation variants ── */
const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const msgVariants = {
  hidden: (role: "user" | "assistant") => ({
    opacity: 0,
    x: role === "user" ? 24 : -24,
    scale: 0.97,
  }),
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 340, damping: 28 },
  },
};

const chipVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.3, ease: "easeOut" as const },
  }),
};

const sessionVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.28, ease: "easeOut" as const },
  }),
};

/* ── Typing indicator ── */
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ type: "spring", stiffness: 340, damping: 28 }}
    className="flex items-start gap-2 sm:gap-4"
  >
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#bef264] flex items-center justify-center flex-shrink-0">
      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e1b4b]" />
    </div>
    <div className=" flex items-center gap-1.5 h-10">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#1e1b4b]/40"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  </motion.div>
);

/* ── Typewriter Text Component ── */
const TypewriterText = ({ text }: { text: string }) => {
  const words = text.split(" ");
  return (
    <div className="flex flex-wrap">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(0px)", y: 2 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.3,
            delay: i * 0.05,
            ease: "easeOut"
          }}
          className="mr-1 mt-0.5"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

const AskYourDoubt = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: "1", title: "Vanakkam", date: "TODAY", messages: defaultMessages },
  ]);
  const [activeSessionId, setActiveSessionId] = useState("1");
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndSessions = async () => {
      try {
        setLoading(true);
        const u = await authService.getCurrentUser();
        setUser(u);
        if (u) {
          const remoteSessions = await chatbotService.getConversations(u.id);
          if (remoteSessions.length > 0) {
            const formattedSessions: ChatSession[] = remoteSessions.map(s => ({
              id: s.conversation_id.toString(),
              conversation_id: s.conversation_id,
              title: s.title,
              date: new Date(s.created_at).toLocaleDateString() === new Date().toLocaleDateString() ? "TODAY" : new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase(),
              messages: [] // Will fetch on click
            }));
            setSessions(formattedSessions);
            // Optionally select the most recent one
            setActiveSessionId(formattedSessions[0].id);
            await loadHistory(formattedSessions[0].id, formattedSessions[0].conversation_id!);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndSessions();
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setShowSidebar(true);
    }
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || { id: "0", title: "New Chat", messages: defaultMessages };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isTyping]);

  const loadHistory = async (sessionId: string, conversationId: number) => {
    try {
      setIsTyping(true);
      const history = await chatbotService.getHistory(conversationId);
      const formattedMessages: Message[] = history.flatMap(item => {
        const msgs: Message[] = [];
        msgs.push({
          id: `q-${item.id}`,
          role: "user" as const,
          content: item.question,
          timestamp: new Date(item.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        });
        if (item.answer) {
          msgs.push({
            id: `a-${item.id}`,
            role: "assistant" as const,
            content: item.answer,
            timestamp: new Date(item.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          });
        }
        return msgs;
      });

      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, messages: formattedMessages } : s
      ));
    } catch (error) {
      console.error("Failed to load history:", error);
      // Fallback for UI if error occurs
    } finally {
      setIsTyping(false);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    setActiveSessionId(sessionId);

    // Only load if messages are empty (meaning it's a "summary" session from getConversations)
    if (session.conversation_id && session.messages.length === 0) {
      loadHistory(sessionId, session.conversation_id);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
            ...s,
            messages: [...s.messages, userMsg],
            title:
              s.title === "New Chat" || (s.title === "Vanakkam" && s.messages.length <= 1)
                ? input.trim().slice(0, 30)
                : s.title,
          }
          : s
      )
    );
    setInput("");
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
    }

    // Show typing indicator then get real AI response
    setIsTyping(true);

    const callApi = async () => {
      try {
        const response = await chatbotService.askChatbot({
          user_id: user?.id,
          syllabus_id: 1, // Default TNPSC Group 4 syllabus
          question: userMsg.content,
          conversation_id: activeSession.conversation_id,
        });

        const aiMsg: Message = {
          id: response.id.toString(),
          role: "assistant",
          content: response.answer || "I'm sorry, I couldn't process that.",
          timestamp: new Date(response.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                ...s,
                conversation_id: response.conversation_id,
                messages: [...s.messages, aiMsg]
              }
              : s
          )
        );
      } catch (error) {
        console.error("Chatbot API error:", error);
        const errorMsg: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I'm having trouble connecting to the server. Please try again later.",
          timestamp: now(),
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s
          )
        );
      } finally {
        setIsTyping(false);
      }
    };

    callApi();
  };

  const newChat = () => {
    const id = Date.now().toString();
    const session: ChatSession = {
      id,
      title: "New Chat",
      date: "TODAY",
      messages: [
        {
          id: "welcome-" + id,
          role: "assistant",
          content: "Vanakkam! I am your AI Tutor. Start a new topic or ask a doubt.",
          timestamp: now(),
        },
      ],
    };
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(id);
    setInput("");
    setTimeout(() => {
      textAreaRef.current?.focus();
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
      }
    }, 0);
  };

  const clearChat = () => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: defaultMessages } : s
      )
    );
  };

  const handleQuickQuestion = (q: string) => {
    setInput(q);
    textAreaRef.current?.focus();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col lg:flex-row h-[calc(100vh)] md:h-[calc(100vh-5rem)] overflow-hidden bg-[#f8fafc]">
          <div className="flex-1 flex flex-col min-w-0 px-2 sm:px-4 lg:px-6">
            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white rounded-xl border border-[#f1f5f9] shadow-sm overflow-hidden mb-2 sm:mb-6 mt-4">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-[#f1f5f9] flex items-center justify-between shrink-0">
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
              <div className="flex-1 p-3 sm:p-6 lg:p-10 space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={cn("flex items-start gap-4", i % 2 === 0 ? "flex-row-reverse" : "")}>
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <Skeleton className={cn("h-20 w-[70%] rounded-2xl", i % 2 === 0 ? "bg-[#1e1b4b]/5" : "bg-[#bef264]/10")} />
                  </div>
                ))}
              </div>
              <div className="px-4 py-4 shrink-0">
                <Skeleton className="h-14 w-full rounded-[32px]" />
              </div>
            </div>
          </div>
          <div className="hidden lg:flex w-80 lg:w-96 border-l border-[#f1f5f9] bg-white flex-col p-6 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-9 w-24 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col lg:flex-row h-[calc(100vh)] md:h-[calc(100vh-5rem)] overflow-hidden"
      >
        {/* ── Main Chat Area ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] px-2 sm:px-4 lg:px-6">
          <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white rounded-xl border border-[#f1f5f9] shadow-sm overflow-hidden mb-2 sm:mb-6">

            {/* Inner Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-white shrink-0">
              <div className="w-auto lg:hidden">
                <motion.div whileTap={{ scale: 0.88 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="text-muted-foreground mr-1 sm:mr-2 h-8 w-8 p-0"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
              <span className="text-sm font-medium text-[#1e1b4b] mx-auto truncate px-2 sm:px-4">
                {activeSession.title === "New Chat" ? "Vanakkam" : activeSession.title}
              </span>
              <div className="w-auto text-right">
                <motion.div whileTap={{ scale: 0.88 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent p-0 h-auto flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
                  >
                    <Eraser className="w-4 h-4" />
                    <span className="text-[10px] sm:text-xs font-medium">Clear Chat</span>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 bg-white scrollbar-hide">
              <AnimatePresence initial={false}>
                {activeSession.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    custom={msg.role}
                    variants={msgVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      "flex items-start gap-2 sm:gap-4",
                      msg.role === "user" ? "flex-row-reverse" : ""
                    )}
                  >
                    {/* Avatar */}
                    {msg.role === "assistant" ? (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#bef264] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e1b4b]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1e1b4b] flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] sm:text-[10px] font-medium text-white">ME</span>
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={cn(
                        " p-3 max-w-[85%] sm:max-w-[80%] relative ",
                        msg.role === "user"
                          ? "bg-[#1e1b4b] text-white rounded-lg shadow-sm"
                          : ""
                      )}
                    >
                      <div className="text-sm sm:text-[15px] leading-relaxed">
                        {msg.role === "assistant" ? (
                          <TypewriterText text={msg.content} />
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-[9px] sm:text-[10px] opacity-40 mt-1",
                          msg.role === "user" ? "text-right" : "text-left"
                        )}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && <TypingIndicator key="typing" />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            <div className="px-4 py-2  shrink-0">
              <div className="relative max-w-4xl mx-auto">
                <motion.div
                  className="relative flex items-center bg-[#f0f2f5] rounded-[32px] overflow-hidden shadow-sm border border-[#e2e8f0] focus-within:ring-2 focus-within:ring-[#1e1b4b22]"
                  transition={{ duration: 0.2 }}
                >
                  <textarea
                    ref={textAreaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      adjustHeight();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    rows={1}
                    placeholder="Ask your TNPSC Group 4 doubt..."
                    className="w-full bg-transparent border-none py-3 sm:py-5 pl-4 sm:pl-6 pr-12 sm:pr-16 text-sm sm:text-[15px] text-[#1e1b4b] placeholder:text-[#1e1b4b]/40 focus:outline-none focus:ring-0 resize-none max-h-[150px] sm:max-h-[200px] scrollbar-thin leading-relaxed overflow-y-auto"
                  />
                  <div className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2">
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      whileHover={{ scale: 1.07 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Button
                        size="icon"
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className="rounded-full w-8 h-8 sm:w-10 sm:h-10 bg-[#1e1b4b] hover:bg-[#1e1b4bb3] hover:text-[#e2e8f0] text-[#e2e8f0] border-none transition-all disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Input Area */}

        </div>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[40] lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Right Sidebar – Smart Assist ── */}
        <aside
          className={cn(
            "w-[85vw] sm:w-80 lg:w-96 border-l border-[#f1f5f9] bg-white flex-shrink-0 flex flex-col overflow-y-auto scrollbar-hide shadow-2xl lg:shadow-none",
            "fixed right-0 top-0 h-full rounded-xl z-[50] lg:static lg:z-auto transition-transform duration-300 ease-in-out",
            showSidebar
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0 lg:w-0 lg:border-0 lg:overflow-hidden"
          )}
        >
          <div className="p-6 min-w-[320px] sm:min-w-0 space-y-8">

            {/* Smart Assist Header */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-warning" />
                <h2 className="text-xl font-medium text-[#1e1b4b]">Smart Assist</h2>
              </div>
              <div className="h-[1px] bg-[#f1f5f9] w-full" />
            </motion.div>

            {/* Quick Questions */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-4 h-4 text-[#94a3b8]" />
                <span className="text-[11px] font-medium text-[#94a3b8] tracking-widest uppercase">
                  QUICK QUESTIONS
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q, i) => (
                  <motion.button
                    key={q}
                    custom={i}
                    variants={chipVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.03, backgroundColor: "#e2e8f0" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleQuickQuestion(q)}
                    className="px-4 py-2.5 text-[13px] bg-[#f0f2f5] text-[#1e1b4b] rounded-xl transition-colors text-left leading-tight"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </section>

            <div className="h-[1px] bg-[#f1f5f9] w-full" />

            {/* Previous Chats */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-[#94a3b8]" />
                <span className="text-[11px] font-medium text-[#94a3b8] tracking-widest uppercase">
                  PREVIOUS CHATS
                </span>
              </div>

              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={newChat}
                  className="w-full mb-4 bg-[#1e1b4b] text-white hover:bg-[#1e1b4b]/90 rounded-2xl h-12 gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" /> New Chat
                </Button>
              </motion.div>

              <div className="space-y-1">
                <AnimatePresence>
                  {sessions.map((s, i) => (
                    <motion.button
                      key={s.id}
                      custom={i}
                      variants={sessionVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -10 }}
                      whileHover={{ x: 2 }}
                      onClick={() => handleSessionSelect(s.id)}
                      className={cn(
                        "w-full text-left px-5 py-4 rounded-2xl transition-all border border-transparent",
                        s.id === activeSessionId
                          ? "bg-[#f0f2f5] border-[#e2e8f0] shadow-sm"
                          : "hover:bg-gray-50 text-[#94a3b8]"
                      )}
                    >
                      <p className={cn(
                        "text-[15px] font-medium truncate",
                        s.id === activeSessionId ? "text-[#1e1b4b]" : "text-gray-500"
                      )}>
                        {s.title}
                      </p>
                      <p className="text-[10px] mt-1 uppercase tracking-wider opacity-60 font-medium">
                        {s.date}
                      </p>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            <div className="h-[1px] bg-[#f1f5f9] w-full" />

            {/* Recently Asked */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[#94a3b8]" />
                <span className="text-[11px] font-semibold text-[#94a3b8] tracking-widest uppercase">
                  RECENTLY ASKED
                </span>
              </div>
              <div className="space-y-3 pl-1">
                {sessions.slice(0, 3).map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.28 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-1 h-1 rounded-full bg-[#cbd5e1]" />
                    <span className="text-sm text-gray-500 truncate font-medium">{s.title}</span>
                  </motion.div>
                ))}
              </div>
            </section>

          </div>
        </aside>
      </motion.div>
    </DashboardLayout >
  );
};

export default AskYourDoubt;
