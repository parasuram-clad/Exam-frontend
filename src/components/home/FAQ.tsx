import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Minus, Plus } from "lucide-react";

const FAQ = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        {
            question: "What exams does Exam Copilot support?",
            answer: "Exam Copilot currently supports TNPSC Group exams with comprehensive study materials and test series aligned to the official syllabus.",
        },
        {
            question: "Is Thani Oruvan suitable for beginners?",
            answer: "Yes! Our platform is designed to guide beginners from scratch with structured plans while offering advanced analytics for experienced aspirants.",
        },
        {
            question: "How are study plans structured?",
            answer: "Our AI-powered study plan creates a personalized day-by-day schedule based on your target exam date, covering all topics systematically.",
        },
        {
            question: "What is included in the Test Series?",
            answer: "The Test Series includes subject-wise tests, full-length mock exams, and detailed analytics to track your performance.",
        },
        {
            question: "Are daily quizzes available?",
            answer: "Yes, daily quizzes are available to all users to help maintain consistent practice and assess your daily progress.",
        },
    ];

    return (
        <section className="py-16 sm:py-24 px-4 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    {/* Left Side */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-10 sm:space-y-12">
                        <div className="max-w-xl">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 leading-[1.2] lg:leading-[1.15] mb-6 sm:mb-8">
                                Frequently asked<br className="hidden sm:block" /> Questions
                            </h2>
                            <p className="text-gray-600 font-medium text-sm sm:text-base leading-relaxed">
                                Get answers to common questions about Thani Oruvan and our TNPSC preparation approach.
                            </p>
                        </div>

                        <div className="bg-[#f2f9f5] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 border border-[#4FAA60]/10">
                            <h4 className="text-xl sm:text-2xl font-medium text-gray-900 mb-3 sm:mb-4">
                                Still have questions?
                            </h4>
                            <p className="text-[#4b5563] mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed font-medium">
                                Can't find the answers to your question? Send us an email and we'll get back to you as soon as possible.
                            </p>
                            <Button className="bg-[#56a864] hover:bg-[#45964f] text-white rounded-full p-4 text-md font-medium shadow-none">
                                Send Email
                            </Button>
                        </div>
                    </div>

                    {/* Right Side - FAQ List */}
                    <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl border transition-all duration-300 ${openFaq === index
                                    ? 'bg-white border-[#4FAA60]/20 shadow-xl shadow-[#4FAA60]/5'
                                    : 'bg-[#f8f9fa] border-transparent hover:bg-gray-100'
                                    }`}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between p-5 sm:p-6 md:p-7 text-left transition-colors group"
                                >
                                    <span className={`text-base sm:text-lg font-medium pr-6 sm:pr-8 transition-colors ${openFaq === index ? 'text-[#4FAA60]' : 'text-gray-900'
                                        }`}>
                                        {faq.question}
                                    </span>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 transition-all duration-300 ${openFaq === index ? 'bg-[#4FAA60] border-[#4FAA60] -rotate-90' : 'bg-white group-hover:border-gray-300'
                                        }`}>
                                        <ArrowRight
                                            className={`w-4 h-4 transition-colors ${openFaq === index ? 'text-white' : 'text-gray-600'
                                                }`}
                                        />
                                    </div>
                                </button>
                                <div
                                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${openFaq === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                        }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="px-5 sm:px-7 pb-5 sm:pb-7 text-sm sm:text-[15px] text-gray-500 font-medium leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
