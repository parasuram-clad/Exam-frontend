import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import studyImg from "@/assets/designed/study.png";
import quizImg from "@/assets/designed/daily quiz.png";
import testImg from "@/assets/designed/test.png";
import streakImg from "@/assets/designed/streak.png";
import readingImg from "@/assets/designed/reading-mode.png";

const features = [
    {
        title: "Personalized Study Plans",
        description: "Complete syllabus coverage for TNPSC exams with well-structured study plans designed to guide you topic by topic, day by day.",
        buttonText: "Begin Preparation",
        image: studyImg,
        color: "#4FAA60"
    },
    {
        title: "Daily Quiz Practice",
        description: "Practice daily quizzes with mixed questions to reinforce concepts, improve accuracy, and build exam confidence consistently.",
        buttonText: "Take Daily Quiz",
        image: quizImg,
        color: "#4FAA60"
    },
    {
        title: "Comprehensive Test Series",
        description: "Practice all subjects through dedicated test series, with 25 test sets per subject, aligned to the exam pattern and syllabus.",
        buttonText: "Explore Tests",
        image: testImg,
        color: "#4FAA60"
    },
    {
        title: "Daily Targets & Streaks",
        description: "Stay consistent with daily targets and track your learning streaks to build discipline and maintain preparation momentum.",
        buttonText: "Track Progress",
        image: streakImg,
        color: "#4FAA60"
    },
    {
        title: "Bilingual Learning",
        description: "Learn and practice comfortably by choosing your preferred language — English or Tamil — throughout the preparation journey.",
        buttonText: "Choose Language",
        image: readingImg,
        color: "#4FAA60"
    }
];

const Features = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Balanced spring for smooth, premium momentum
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 150,
        damping: 30,
        restDelta: 0.0001
    });

    const handleDotClick = (index: number) => {
        if (!containerRef.current) return;

        const totalHeight = containerRef.current.offsetHeight;
        const sectionTop = containerRef.current.offsetTop;
        const scrollRange = totalHeight - window.innerHeight;

        // Target the midpoint for middle features (0.5), start for first (0), end for last (1)
        let targetProgress = (index + 0.5) / features.length;
        if (index === 0) targetProgress = 0;
        if (index === features.length - 1) targetProgress = 1;

        const targetScroll = sectionTop + targetProgress * scrollRange;

        window.scrollTo({
            top: targetScroll,
            behavior: "smooth"
        });
    };

    return (
        <section ref={containerRef} className="relative h-[600vh] bg-white">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center px-4 pt-20 md:pt-28">
                <div className="max-w-7xl w-full mx-auto pb-12">
                    {/* Header stays visible */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-center mb-6 md:mb-12 lg:mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 px-4">
                            Designed for <span className="text-[#4FAA60]">Smart Exam</span> Preparation
                        </h2>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-24 items-center min-h-[60vh] lg:min-h-[50vh]">
                        {/* Left Content Area (Animated based on scroll) */}
                        <div className="relative h-[280px] sm:h-[320px] md:h-[350px] flex items-center order-2 lg:order-1">
                            {features.map((feature, index) => {
                                const start = index / features.length;
                                const end = (index + 1) / features.length;
                                const isFirst = index === 0;
                                const isLast = index === features.length - 1;

                                // Smooth transition window (0.05 for elegant fade)
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const opacity = useTransform(smoothProgress,
                                    [isFirst ? 0 : start, start + 0.05, end - 0.05, isLast ? 1 : end],
                                    [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0]
                                );

                                // Graceful vertical movement
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const y = useTransform(smoothProgress,
                                    [isFirst ? 0 : start, start + 0.05, end - 0.05, isLast ? 1 : end],
                                    [isFirst ? 0 : 60, 0, 0, isLast ? 0 : -60]
                                );

                                return (
                                    <motion.div
                                        key={index}
                                        style={{ opacity, y }}
                                        className="absolute inset-0 flex flex-col justify-center space-y-3 sm:space-y-4 md:space-y-6 lg:text-left text-center"
                                    >
                                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 leading-tight">
                                            {feature.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0 px-4 sm:px-0">
                                            {feature.description}
                                        </p>
                                        <div className="pt-1 sm:pt-2 px-4 sm:px-0">
                                            <Button
                                                onClick={() => handleDotClick(index)}
                                                className="bg-[#1a1a2e] hover:bg-[#2a2a3e] text-white rounded-full px-6 py-5 sm:px-8 sm:py-7 gap-2 text-sm sm:text-md transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
                                            >
                                                {feature.buttonText} <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Right Image Area (Animated based on scroll) */}
                        <div className="relative h-[220px] sm:h-[280px] md:h-[400px] lg:h-[500px] w-full max-w-[450px] sm:max-w-[500px] lg:max-w-[650px] mx-auto lg:mx-0 order-1 lg:order-2">
                            <div className="bg-[#F9FAFB] w-full h-full flex items-center justify-center border border-gray-100 overflow-hidden rounded-[30px] sm:rounded-[40px] shadow-sm">
                                {features.map((feature, index) => {
                                    const start = index / features.length;
                                    const end = (index + 1) / features.length;
                                    const isFirst = index === 0;
                                    const isLast = index === features.length - 1;

                                    // Smooth opacity transition
                                    // eslint-disable-next-line react-hooks/rules-of-hooks
                                    const opacity = useTransform(smoothProgress,
                                        [isFirst ? 0 : start, start + 0.05, end - 0.05, isLast ? 1 : end],
                                        [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0]
                                    );

                                    // Graceful vertical movement for images
                                    // eslint-disable-next-line react-hooks/rules-of-hooks
                                    const y = useTransform(smoothProgress,
                                        [isFirst ? 0 : start, start + 0.05, end - 0.05, isLast ? 1 : end],
                                        [isFirst ? 0 : 60, 0, 0, isLast ? 0 : -60]
                                    );

                                    return (
                                        <motion.div
                                            key={index}
                                            style={{ opacity, y }}
                                            className="absolute inset-0 flex items-center justify-center p-3 sm:p-2"
                                        >
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <div className="p-1 sm:p-2 md:p-6 lg:p-10 rounded-2xl w-full h-full flex items-center justify-center">
                                                    <img
                                                        src={feature.image}
                                                        alt={feature.title}
                                                        className="w-full h-auto max-h-full shadow-2xl object-contain rounded-xl sm:rounded-2xl"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Dots - Right Side */}
                    <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 z-50">
                        {features.map((feature, index) => {
                            const start = index / features.length;
                            const end = (index + 1) / features.length;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleDotClick(index)}
                                    className="relative w-3 h-3 flex items-center justify-center group"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors" />
                                    <motion.div
                                        style={{
                                            scale: useTransform(smoothProgress, [start, start + 0.05, end - 0.05, end], [0.8, 1.5, 1.5, 0.8]),
                                            backgroundColor: feature.color,
                                            opacity: useTransform(smoothProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0])
                                        }}
                                        className="absolute inset-0 rounded-full"
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
