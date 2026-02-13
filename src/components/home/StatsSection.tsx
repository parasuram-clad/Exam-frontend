import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useSpring, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const AnimatedNumber = ({ value, suffix, initialValue = 0, step = 1 }: { value: number; suffix: string; initialValue?: number; step?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [displayValue, setDisplayValue] = useState(initialValue);

    // Slower spring for distinct "flip" feel
    const spring = useSpring(initialValue, { mass: 1, stiffness: 30, damping: 25 });

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);

    useEffect(() => {
        const unsubscribe = spring.on("change", (latest) => {
            const stepped = Math.round(latest / step) * step;
            if (stepped !== displayValue) {
                setDisplayValue(stepped);
            }
        });
        return unsubscribe;
    }, [spring, step, displayValue]);

    return (
        <div ref={ref} className="flex items-end gap-1 overflow-hidden h-12 sm:h-14 lg:h-16 bg-white">
            <div className="relative w-full flex flex-col justify-end h-full">
                <AnimatePresence initial={false}>
                    <motion.span
                        key={displayValue}
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                        transition={{ duration: 0.25, type: "spring", stiffness: 200, damping: 25 }}
                        className="absolute bottom-0 left-0 w-full text-4xl sm:text-5xl lg:text-5xl font-medium text-gray-900 tracking-tight tabular-nums leading-none block"
                    >
                        {displayValue.toLocaleString()}
                    </motion.span>
                </AnimatePresence>
                {/* Invisible spacer to maintain width */}
                <span className="invisible text-4xl sm:text-5xl lg:text-5xl font-medium tracking-tight tabular-nums leading-none opacity-0 pointer-events-none select-none">
                    {value.toLocaleString()}
                </span>
            </div>
            <span className="text-4xl sm:text-5xl lg:text-5xl font-medium text-gray-900 tracking-tight leading-none mb-1">{suffix}</span>
        </div>
    );
};

const StatsSection = () => {
    const statsConfig = [
        {
            value: 3000,
            initialValue: 1500,
            step: 100,
            label: "LEARNERS",
            description: "Preparing with Exam Copilot",
            suffix: "+"
        },
        {
            value: 500,
            initialValue: 200,
            step: 10,
            label: "ACTIVE USERS",
            description: "Learning consistently every day",
            suffix: "+"
        },
        {
            value: 10000,
            initialValue: 5000,
            step: 200,
            label: "PRACTICE SESSIONS",
            description: "Focused practice across subjects",
            suffix: "+"
        },
        {
            value: 50000,
            initialValue: 25000,
            step: 500,
            label: "QUESTIONS DONE",
            description: "Strengthening concepts through repetition",
            suffix: "+"
        },
    ];

    return (
        <section className="py-16 md:py-24 lg:py-32 px-6 md:px-12 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    {/* Left Content */}
                    <div className="space-y-6 lg:max-w-lg">
                        <h2 className="text-4xl md:text-5xl font-medium text-gray-900 leading-[1.1] tracking-tight">
                            Preparation Backed<br className="hidden sm:block" />by <span className="text-[#4FAA60]">Real Progress</span>
                        </h2>
                        <p className="text-gray-600 pt-4 md:pt-8 lg:pt-12 pb-4 text-lg md:text-xl leading-relaxed">
                            Learners across Tamil Nadu prepare with Exam Copilot through structured plans and regular practice.
                        </p>
                        <Link to="/signup">
                            <Button className="bg-[#1a1a2e] hover:bg-[#2a2a3e] text-white rounded-full px-8 py-7 gap-2 text-md transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto">
                                Begin Your Journey <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    {/* Right Stats Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-12 md:gap-y-16 lg:gap-24 mt-12 lg:mt-0 lg:justify-start">
                        {statsConfig.map((stat, index) => (
                            <div
                                key={index}
                                className="space-y-2 md:space-y-4 flex flex-col items-center text-center lg:items-start lg:text-left"
                            >
                                <AnimatedNumber
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    initialValue={stat.initialValue}
                                    step={stat.step}
                                />
                                <div className="inline-block text-[10px] md:text-xs lg:text-sm font-medium tracking-widest bg-gray-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-gray-700 uppercase">
                                    {stat.label}
                                </div>
                                <p className="text-[11px] md:text-sm lg:text-base text-gray-600 leading-relaxed max-w-[140px] md:max-w-[180px]">
                                    {stat.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
