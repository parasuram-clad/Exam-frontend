import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden">
            {/* Premium Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative flex flex-col items-center">
                {/* Logo Pulse Animation */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: [0.9, 1.05, 1],
                        opacity: 1
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="relative w-28 h-28 mb-8"
                >
                    {/* Concentric rings */}
                    <div className="absolute inset-0 rounded-full border border-accent/20 animate-[ping_3s_linear_infinite]" />
                    <div className="absolute inset-[-10px] rounded-full border border-accent/10 animate-[ping_4s_linear_infinite]" style={{ animationDelay: '0.5s' }} />

                    <div className="relative w-full h-full flex items-center justify-center rounded-3xl bg-accent text-accent-foreground shadow-2xl shadow-accent/40 rotate-12">
                        <span className="text-4xl font-bold tracking-tighter -rotate-12">EC</span>
                    </div>
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-center"
                >
                    <h1 className="text-3xl font-medium tracking-tight text-foreground mb-3">
                        Exam Copilot
                    </h1>
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-48 h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-accent"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{ width: "50%" }}
                            />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground/80 tracking-wide uppercase">
                            Crafting your personalized journey...
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Credit */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-12 flex flex-col items-center gap-2"
            >
                <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-border" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                        Secure AI Platform
                    </span>
                    <div className="h-px w-8 bg-border" />
                </div>
            </motion.div>
        </div>
    );
};

export default SplashScreen;
