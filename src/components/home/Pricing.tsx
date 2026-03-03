import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingProps {
    onGetStarted: () => void;
}

const Pricing = ({ onGetStarted }: PricingProps) => {
    const plans = [
        {
            price: "₹2,199",
            name: "Study Plan",
            description: "For learners who want structured daily guidance",
            features: [
                "Complete TNPSC syllabus coverage",
                "Structured daily study plans",
                "Daily targets & streak tracking",
                "Guided daily learning flow",
            ],
            buttonText: "Begin Preparation",
            popular: false,
            dark: false,
        },
        {
            price: "₹2,999",
            name: "Combo Plan",
            description: "For complete preparation & practice",
            features: [
                "All Study Plan features",
                "Full Test Series access",
                "Daily quizzes & assessments",
                "Performance insights & weak-area analysis",
            ],
            buttonText: "Get started",
            popular: true,
            dark: true,
        },
        {
            price: "₹2,199",
            name: "Test Series",
            description: "For focused practice and self-evaluation",
            features: [
                "Subject-wise test series",
                "25 test sets per subject",
                "Exam-pattern-based questions",
                "Dynamic current affairs integration",
            ],
            buttonText: "Explore Tests",
            popular: false,
            dark: false,
        },
    ];

    return (
        <section id="pricing" className="py-16 sm:py-24 px-4 bg-[#f8faf8] overflow-hidden">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-20">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 tracking-tight leading-tight">
                        Plans for <span className="text-[#4FAA60]">Your Preparation</span>
                    </h2>
                    <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">
                        Choose the right path for your success in competitive exams
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 transition-all duration-500 flex flex-col hover:translate-y-[-8px] ${index === 2 && "md:col-span-2 lg:col-span-1 md:max-w-[calc(50%-12px)] md:mx-auto lg:max-w-none"
                                } ${plan.dark
                                    ? 'bg-[#1a1b2e] text-white shadow-2xl overflow-hidden'
                                    : 'bg-white border border-gray-100 shadow-xl shadow-gray-200/50'
                                }`}
                        >
                            {/* Glow effect for dark card */}
                            {plan.dark && (
                                <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-72 h-72 border-[60px] border-opacity-20 border-[#94CA5A]/30 blur-lg rounded-full pointer-events-none" />
                            )}

                            <div className="flex items-center justify-between mb-6 sm:mb-8">
                                <span className={`text-3xl sm:text-4xl font-medium tracking-tight ${plan.dark ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.price}
                                </span>
                                {plan.popular && (
                                    <span className="px-3 sm:px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium rounded-full uppercase tracking-wider">
                                        Most Popular
                                    </span>
                                )}
                            </div>

                            <div className="mb-8 sm:mb-10">
                                <h4 className={`text-xl sm:text-2xl font-medium mb-2 sm:mb-3 ${plan.dark ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.name}
                                </h4>
                                <p className={`text-sm sm:text-[15px] leading-relaxed ${plan.dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-4 sm:space-y-6 mb-8 sm:mb-12 flex-grow">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start gap-3 sm:gap-4">
                                        <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mt-0.5 ${plan.dark ? 'bg-white text-[#1a1b2e]' : 'bg-gray-900 text-white'}`}>
                                            <Check className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />
                                        </div>
                                        <span className={`text-sm sm:text-[15px] ${plan.dark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto">
                                <Button
                                    onClick={onGetStarted}
                                    className="w-full h-12 sm:h-14 rounded-full bg-[#4FAA60] hover:bg-[#45964f] text-white text-base sm:text-lg font-medium shadow-lg shadow-[#4FAA60]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#4FAA60]/30 active:scale-[0.98]"
                                >
                                    {plan.buttonText}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
