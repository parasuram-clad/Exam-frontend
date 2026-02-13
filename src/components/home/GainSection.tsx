import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import boyImg from "@/assets/gain-section/boy.png";
import lapImg from "@/assets/gain-section/lap.png";
import layer1Img from "@/assets/gain-section/layer1.png";
import layer2Img from "@/assets/gain-section/layer2.png";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import curveImg from "@/assets/gain-section/curve.png";
import badgeImg from "@/assets/gain-section/badge.png";


const GainSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const springY = useSpring(y, { stiffness: 100, damping: 30 });

    // Individual element parallax levels
    const ySlow = useTransform(scrollYProgress, [0, 1], [30, -30]);
    const yFast = useTransform(scrollYProgress, [0, 1], [60, -60]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 15]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1.05]);

    return (
        <section
            ref={sectionRef}
            className="py-12 md:py-24 px-4 overflow-hidden"
            style={{ background: "radial-gradient(circle at bottom left, #F2FFE5 0%, #FFFFFF 50%)" }}
        >
            <motion.div
                style={{ y: springY, opacity }}
                className="max-w-7xl mx-auto space-y-4 md:space-y-6"
            >
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 ">

                    {/* 1. Consistency Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="col-span-1 md:col-span-1 lg:col-span-4 bg-[#F5F5F5] rounded-[32px] p-4 sm:p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between h-[180px] sm:h-[220px] lg:h-[250px] group transition-all duration-500 hover:shadow-xl hover:shadow-gray-100 border border-gray-100"
                    >
                        {/* Layered Background Pattern */}
                        <motion.div style={{ y: ySlow }} className="absolute inset-0 z-0 pointer-events-none">
                            <img src={layer1Img} alt="" className="w-full h-full object-cover opacity-30 lg:opacity-100" />
                        </motion.div>

                        <div className="relative z-10">
                            <h4 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 mb-1 lg:mb-2">100%</h4>
                            <p className="text-sm sm:text-xl lg:text-2xl font-medium text-gray-500 leading-tight">
                                Improves <br />
                                <span className="text-[#4FAA60]">Consistency</span>
                            </p>
                        </div>

                        {/* Boy Illustration on the Right */}
                        <motion.div
                            style={{ y: yFast }}
                            className="absolute right-0 bottom-0 pointer-events-none z-10 transition-transform duration-700 group-hover:scale-105"
                        >
                            <img
                                src={boyImg}
                                alt="Consistency Learner"
                                className="h-[80px] sm:h-[120px] lg:h-[150px] w-auto object-contain object-bottom"
                            />
                        </motion.div>
                    </motion.div>

                    {/* 2. Clarity in Preparation (Middle Card) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="col-span-1 md:col-span-1 lg:col-span-3 bg-[#EEF0EB] rounded-[32px] p-4 sm:p-6 flex flex-col items-center justify-end text-center relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-[#4FAA60]/5 border border-gray-100 h-[180px] sm:h-[220px] lg:h-full group"
                    >
                        <div className="relative z-10 flex flex-col items-center w-full">
                            <motion.div
                                style={{ y: ySlow, scale }}
                                className="relative mb-2 sm:mb-4 lg:mb-6 flex items-center justify-center"
                            >
                                {/* Layered boy and laptop for parallax effect */}
                                <img
                                    src={lapImg}
                                    alt="Laptop"
                                    className="h-[80px] sm:h-[110px] lg:h-[150px] w-auto object-contain z-20 relative"
                                />
                                {/* Animated Bulb Emoji decoration */}
                                <motion.div
                                    animate={{ y: [0, -5, 0], opacity: [0.8, 1, 0.8] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 z-30"
                                >
                                    <span className="text-xl sm:text-3xl bg-transparent relative select-none" role="img" aria-label="light bulb">💡</span>
                                </motion.div>
                            </motion.div>
                            <h4 className="text-sm sm:text-xl lg:text-2xl font-medium text-gray-900 leading-tight">
                                Clarity in <br /> Preparation
                            </h4>
                        </div>
                    </motion.div>

                    {/* 3. Text Header & Planning Area */}



                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="col-span-2 md:col-span-2 lg:col-span-5 flex flex-col justify-between gap-6"
                    >
                        <div className="space-y-4">
                            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 leading-[1.1]">
                                What <span className="text-[#4FAA60]">Learners</span> Gain
                            </h3>
                            <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-2xl">
                                By combining structure and regular practice, Exam Copilot helps learners prepare steadily and avoid last-minute pressure.
                            </p>
                        </div>

                        <div className="flex flex-row gap-4 items-stretch h-[180px] sm:h-[200px]">
                            {/* Planning Card */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex-1 bg-[#7B915F] rounded-[28px] p-6 text-white relative overflow-hidden flex flex-col justify-end transition-all duration-300 border h-full"
                            >
                                <div className="relative z-10">
                                    <h4 className="text-4xl sm:text-5xl font-medium mb-1">50%</h4>
                                    <p className="text-sm sm:text-base font-medium opacity-90">Less Planning Effort</p>
                                </div>
                                <motion.img
                                    src={layer1Img}
                                    alt="decor"
                                    className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90 mix-blend-overlay z-0"
                                />
                            </motion.div>

                            {/* Badge Section */}
                            <div className="w-[180px] sm:w-[200px] h-full flex items-center justify-center shrink-0">
                                <motion.div
                                    style={{ rotate }}
                                    className="relative w-full h-full flex items-center justify-center"
                                >


                                    <img
                                        src={badgeImg}
                                        alt="Learner Centric Badge"
                                        className="w-full h-full object-contain"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="col-span-2 md:col-span-1 lg:col-span-4 flex flex-row items-center lg:items-start relative z-10 lg:-mt-[80px] justify-between gap-4 lg:gap-6"
                    >
                        {/* 4. Discipline Circle (Row 2 Start) */}
                        <motion.div style={{ y: yFast }} className="flex items-center justify-center shrink-0">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 relative rounded-full bg-[#869B6F] flex items-center justify-center text-center p-4 sm:p-6 text-white shadow-xl translate-y-2">
                                <div className=" absolute bottom-0 left-0 w-16 h-10 sm:w-24 sm:h-14 lg:w-28 lg:h-16 rounded-full border-[18px] sm:border-[28px] border-[#f8ec6a] flex items-center justify-center text-center p-6 text-white shadow-xl  blur-md opacity-30 cursor-default"></div>
                                <div className="space-y-0.5 sm:space-y-1">
                                    <h5 className="text-2xl sm:text-4xl font-medium">2X</h5>
                                    <p className="text-[8px] sm:text-xs font-medium leading-tight">Better Study Discipline</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* 5. Path Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="flex-1 bg-[#F5F5F5] h-[180px] sm:h-[280px] lg:h-[350px] rounded-[32px] sm:rounded-[48px] p-4 sm:p-8 lg:p-10 border border-gray-100/50 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl hover:shadow-[#4FAA60]/5 transition-all duration-700"
                        >
                            <div className="relative z-20">
                                <h4 className="text-sm sm:text-xl lg:text-2xl font-medium text-gray-900 leading-[1.1] tracking-tight">
                                    Clear <span className="text-[#4FAA60]">Preparation</span> <br />
                                    <span className="text-[#4FAA60]">Direction</span>
                                </h4>
                            </div>

                            {/* Winding Path Image Illustration Layer */}
                            <motion.div
                                style={{ y: ySlow, scale }}
                                className="z-10 absolute -bottom-5 sm:bottom-0 left-[-10px] right-[-20px]"
                            >
                                <img
                                    src={curveImg}
                                    alt="Path illustration"
                                    className="h-[180px] sm:h-[180px] lg:h-[200px] object-contain"
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                    {/* 6. Identifies Weak Areas (Large bottom card) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="col-span-2 md:col-span-1 lg:col-span-8 min-h-[300px] sm:min-h-[280px] bg-[#F5F5F5] rounded-[32px] sm:rounded-[48px] p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-700 relative overflow-hidden group"
                    >
                        <div className="flex-1 space-y-4 sm:space-y-8 relative z-20 text-center lg:text-left w-full">
                            <div className="space-y-2 sm:space-y-4">
                                <h4 className="text-lg sm:text-lg font-medium text-gray-700 tracking-tight">Identifies weak areas</h4>
                                <p className="text-gray-500 text-sm sm:text-md leading-relaxed max-w-sm font-medium mx-auto lg:mx-0">
                                    Understand where to focus and improve with timely insights.
                                </p>
                            </div>
                            <Button className="bg-[#52AC62] hover:bg-[#459653] text-white rounded-2xl p-5 sm:p-4 text-base sm:text-md font-medium shadow-lg shadow-green-900/10 transition-all duration-300 hover:scale-105 active:scale-95">
                                See How It Works
                            </Button>
                        </div>

                        {/* Stats / Accuracy Mock UI - Floating Tags & Gauge */}
                        <motion.div
                            style={{ y: ySlow }}
                            className="flex-1 w-full h-[280px] sm:h-[350px] lg:h-full relative z-10 mt-8 sm:mt-10 lg:mt-0"
                        >
                            {/* Floating Tags - Responsively positioned */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="hidden lg:flex absolute top-0 left-0 md:top-6 md:-left-5 bg-[#EFEAE6] p-2 rounded-2xl shadow-sm border border-black/5 z-30"
                            >
                                <span className="text-[10px] sm:text-xs font-medium text-gray-700">British Land Revenue Systems</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="hidden lg:flex absolute top-0 right-0 md:top-6 md:-right-4 bg-white p-2 rounded-2xl shadow-md border border-black/5 z-20"
                            >
                                <span className="text-[10px] sm:text-xs font-medium text-gray-400">Revise Weak Topics</span>
                            </motion.div>

                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="hidden lg:flex absolute top-20 -left-4 md:top-28 md:-left-20 bg-white p-2 rounded-2xl shadow-lg border border-black/5 z-40"
                            >
                                <span className="text-[10px] sm:text-xs font-medium text-gray-500">Low Accuracy Topics</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                                className="hidden lg:flex absolute top-20 -right-4 md:top-24 md:-right-6 bg-[#808080] p-2 rounded-2xl shadow-lg border border-white/10 z-30"
                            >
                                <span className="text-[10px] sm:text-xs font-medium text-white/90">Start Focused Revision</span>
                            </motion.div>

                            <motion.div
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="hidden lg:flex absolute bottom-16 sm:bottom-12 left-0 md:bottom-4 lg:-left-12 bg-[#2D2D2D] p-2 rounded-2xl shadow-2xl border border-white/5 z-50 min-w-[140px] sm:min-w-[200px] whitespace-nowrap"
                            >
                                <span className="text-[10px] sm:text-xs font-medium text-white/80 tracking-tight block ">State Schemes – Update required</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 6, 0] }}
                                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                                className="hidden lg:flex absolute bottom-16 sm:bottom-12 right-0 md:bottom-2 lg:right-4 bg-white p-2 rounded-2xl shadow-xl border border-black/5 z-40 whitespace-nowrap"
                            >
                                <span className="text-[10px] sm:text-xs font-medium text-gray-800">Needs Immediate Revision</span>
                            </motion.div>

                            {/* Gauge Meter */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 flex flex-col items-center justify-center pt-4 sm:pt-3">
                                <div className="relative w-20 h-10 sm:w-28 sm:h-14 overflow-hidden">
                                    {/* Semi-circle track */}
                                    <svg viewBox="0 0 100 50" className="w-full h-full">
                                        <path
                                            d="M10 50 A 40 40 0 0 1 90 50"
                                            fill="none"
                                            stroke="#DDE3D2"
                                            strokeWidth="12"
                                            strokeLinecap="round"
                                        />
                                        <motion.path
                                            d="M10 50 A 40 40 0 0 1 90 50"
                                            fill="none"
                                            stroke="#C5D4B2"
                                            strokeWidth="12"
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 0.7 }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                        />
                                    </svg>

                                    {/* Needle */}
                                    <motion.div
                                        className="absolute bottom-0 left-1/2 w-4 h-full origin-bottom z-20 mb-1"
                                        style={{ x: "-50%" }}
                                        initial={{ rotate: -90 }}
                                        animate={{ rotate: 45 }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                    >
                                        <svg viewBox="0 0 20 60" className="w-full h-full fill-gray-500/90 overflow-visible ">
                                            {/* Tapered Needle Body */}
                                            <path d="M10 10 L16 52 L4 52 Z" />
                                            {/* Circular Hub centered at the pivot point (bottom edge) */}
                                            <circle cx="10" cy="60" r="8" />
                                            {/* Center aperture */}
                                            <circle cx="10" cy="60" r="3" fill="white" />
                                        </svg>
                                    </motion.div>
                                </div>
                                <p className="text-sm md:text-md font-medium text-gray-700 mt-2">Accuracy: <span className="text-[#52AC62]">70%</span></p>
                            </div>



                        </motion.div>
                    </motion.div>

                </div>
            </motion.div >
        </section >
    );
};

export default GainSection;
