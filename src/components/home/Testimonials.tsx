
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Changed from "motion/react" to "framer-motion"
import tamilNaduMap from "@/assets/home/tamil-nadu-map.png";
import pic from "@/assets/pic.png";
import { Quote } from "lucide-react";

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([
        {
            id: 1,
            name: "Varsha",
            role: "Group I Aspirant",
            text: "The structured study plan helped me stay consistent without feeling overwhelmed. Knowing what to study each day made preparation much easier.",
            avatar: pic,
        },
        {
            id: 2,
            name: "Karthik. R",
            role: "Group II Aspirant",
            text: "Daily quizzes and practice tests helped me identify my weak areas early. It saved a lot of time during revision.",
            avatar: pic,
        },
        {
            id: 3,
            name: "Arun Kumar",
            role: "Group IV Aspirant",
            text: "Regular practice and progress tracking kept me motivated throughout my preparation. The test series is top-notch.",
            avatar: pic,
        },
        {
            id: 4,
            name: "Divya S",
            role: "Group II Aspirant",
            text: "Thani Oruvan's analytics are a game changer. slightly weak in history, but the focused tests helped me improve significantly.",
            avatar: pic,
        },
    ]);

    // Auto-scroll logic: Rotate array every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTestimonials((prev) => {
                const newItems = [...prev];
                const first = newItems.shift(); // Remove first
                if (first) newItems.push(first); // Add to end
                return newItems;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Positions for avatars on the map
    const avatarPositions = [
        { top: "20%", left: "60%" },
        { top: "40%", left: "40%" },
        { top: "60%", left: "30%" },
        { top: "55%", left: "70%" },
        { top: "80%", left: "55%" },
        { top: "85%", left: "75%" },
        { top: "90%", left: "40%" },
    ];

    return (
        <section id="testimonials" className="py-24 px-4 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Side: Map with Avatars */}
                    <div className="relative flex justify-center items-center">
                        <div className="relative w-full max-w-[500px]">
                            <img
                                src={tamilNaduMap}
                                alt="Tamil Nadu Map"
                                className="w-full h-auto object-contain opacity-80"
                            />

                        </div>
                    </div>

                    {/* Right Side: Testimonials Carousel */}
                    <div>
                        <h3 className="text-3xl sm:text-4xl font-medium text-gray-900 mb-12">
                            Voices from <span className="text-[#4FAA60]">Our Learners</span>
                        </h3>

                        <div className="relative w-full flex flex-col items-center gap-6">
                            <AnimatePresence mode="popLayout">
                                {testimonials.slice(0, 3).map((testimonial, index) => {
                                    // Center card is active (index 1)
                                    const isActive = index === 1;

                                    return (
                                        <motion.div
                                            key={testimonial.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{
                                                opacity: isActive ? 1 : 0.8,
                                                scale: isActive ? 1 : 0.9,
                                                // On desktop we shift right to left (50 to 0), on mobile we use a smaller shift
                                                x: isActive ? 0 : (typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 40),
                                                borderColor: isActive ? "rgba(79, 170, 96, 0.5)" : "#f3f4f6",
                                                backgroundColor: isActive ? "#F0FDF4" : "#ffffff",
                                                boxShadow: isActive ? "0 10px 25px -5px rgba(0, 0, 0, 0.1)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                                                zIndex: isActive ? 10 : 1,
                                            }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            transition={{ type: "spring", stiffness: 200, damping: 22 }}
                                            className="w-full p-4 sm:p-5 rounded-[22px] border-r-4 border-b-4 border flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative overflow-hidden"
                                        >
                                            {/* Avatar Section */}
                                            <div className="flex-shrink-0 relative z-10">
                                                <img
                                                    src={testimonial.avatar}
                                                    alt={testimonial.name}
                                                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-4 ${isActive ? 'border-white' : 'border-gray-50'} shadow-sm`}
                                                />
                                            </div>

                                            {/* Content Section */}
                                            <div className="text-center sm:text-left flex-1 relative z-10 w-full">
                                                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-2 sm:mb-3">
                                                    <div>
                                                        <h4 className={`text-lg sm:text-xl font-medium leading-tight ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                                            {testimonial.name}
                                                        </h4>
                                                        {testimonial.role && (
                                                            <p className={`text-xs sm:text-sm mt-0.5 ${isActive ? 'text-[#4FAA60]' : 'text-gray-400'}`}>
                                                                {testimonial.role}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="hidden sm:block">
                                                        <Quote className={`w-6 h-6 sm:w-8 sm:h-8 ${isActive ? 'text-[#4FAA60]' : 'text-gray-300'} fill-current opacity-30`} />
                                                    </div>
                                                </div>
                                                <p className={`text-sm sm:text-base leading-relaxed line-clamp-3 sm:line-clamp-2 ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                                                    {testimonial.text}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
