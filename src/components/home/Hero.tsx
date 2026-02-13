import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import pic from "@/assets/pic.png";

const Hero = () => {
    return (
        <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center pt-24 sm:pt-32 pb-12 overflow-hidden bg-white">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                {/* Image-like dot pattern at the bottom */}
                <div
                    className="absolute inset-x-0 bottom-0 h-full opacity-[0.4]"
                    style={{
                        backgroundImage: `radial-gradient(#4FAA60 1.5px, transparent 1.5px)`,
                        backgroundSize: '36px 36px',
                        maskImage: 'radial-gradient(circle at 50% 120%, black 20%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(circle at 50% 120%, black 20%, transparent 70%)'
                    }}
                />
                {/* Surface Gradient from mockup */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(232, 246, 219, 0.58) 100%)'
                    }}
                />
                {/* Soft glow - Responsive sizing */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-[#4FAA60]/5 rounded-full blur-[60px] sm:blur-[100px] lg:blur-[140px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                {/* Trust badge */}
                <div className="inline-flex items-center gap-3 px-4 py-2 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex -space-x-4 flex-row items-center">
                        <img src={pic} alt="User" className="relative z-[3] w-10 h-10 rounded-full border-2 border-white ring-1 ring-gray-100 object-cover" />
                        <img src={pic} alt="User" className="relative z-[2] w-10 h-10 rounded-full border-2 border-white ring-1 ring-gray-100 object-cover" />
                        <img src={pic} alt="User" className="relative z-[1] w-10 h-10 rounded-full border-2 border-white ring-1 ring-gray-100 object-cover" />
                        {/* <p className="relative z-0 flex items-center justify-center text-[10px] sm:text-xs font-medium text-[#4FAA60] ">
                            100+
                        </p> */}
                    </div>
                    <span className=" text-[12px] sm:text-sm font-medium">Trusted by +10000 Future Officers</span>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-[#1a1c1e] mb-4 sm:mb-6 lg:mb-8 leading-[1.15] sm:leading-[1.2] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    Structured Preparation for<br className="hidden sm:block" />
                    <span className="text-[#4FAA60]"> Tamil Nadu</span> Competitive Exam
                </h1>

                <p className="text-sm sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 lg:mb-12 max-w-[280px] sx:max-w-sm sm:max-w-xl lg:max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-medium">
                    Personalized learning, adaptive assessments, and exam-aligned practice for <span className="text-[#4FAA60]">TNPSC</span>
                </p>

                <div className="flex flex-row items-center justify-center gap-2 sm:gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <Link to="/signup">
                        <Button className="bg-[#1e1e2d] hover:bg-[#2d2d3d] text-white rounded-full px-4 py-5 sm:px-8 sm:py-7 text-xs sm:text-lg group transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-200/50 font-medium whitespace-nowrap">
                            Begin Today
                            <div className="ml-1.5 sm:ml-3 bg-white rounded-full p-1 sm:p-1.5 transition-transform group-hover:translate-x-1">
                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#1e1e2d]" />
                            </div>
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="bg-transparent border border-gray-400 text-gray-800 rounded-full px-5 py-5 sm:px-10 sm:py-7 text-xs sm:text-lg hover:bg-gray-50 transition-all active:scale-95 font-medium whitespace-nowrap"
                    >
                        Discover More
                    </Button>
                </div>
            </div>
        </section >
    );
};

export default Hero;
