import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
    return (
        <footer className="bg-[#1a1b2e] text-white pt-20 pb-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12 mb-16">
                    {/* Brand & Newsletter Section */}
                    <div className="sm:col-span-2 lg:col-span-5 space-y-6 sm:space-y-8">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-medium font-goldman mb-4">Thani Oruvan</h2>
                            <p className="text-gray-400 text-sm sm:text-base max-w-sm mb-6 font-medium">
                                Focused preparation platform for TNPSC exams.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#4FAA60] hover:border-[#4FAA60] transition-all duration-300">
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#4FAA60] hover:border-[#4FAA60] transition-all duration-300">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#4FAA60] hover:border-[#4FAA60] transition-all duration-300">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm sm:text-base font-medium text-white">Stay updated with our latest features</h3>
                            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4FAA60]/50 font-medium"
                                />
                                <Button className="bg-[#4FAA60] hover:bg-[#45964f] text-white rounded-full px-8 py-3 h-auto text-sm font-medium transition-all active:scale-95">
                                    Subscribe
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2">
                        <h3 className="text-base font-medium mb-6 text-white uppercase tracking-wider text-[13px]">Quick Links</h3>
                        <ul className="space-y-4 text-sm text-gray-400 font-medium">
                            <li><a href="#" className="hover:text-[#4FAA60] transition-colors">Home</a></li>
                            <li><a href="#" className="hover:text-[#4FAA60] transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-[#4FAA60] transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-[#4FAA60] transition-colors">Testimonials</a></li>
                            <li><a href="#" className="hover:text-[#4FAA60] transition-colors">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Preparation */}
                    <div className="lg:col-span-2">
                        <h3 className="text-base font-medium mb-6 text-white uppercase tracking-wider text-[13px]">Preparation</h3>
                        <ul className="space-y-4 text-sm text-gray-400 font-medium">
                            <li><a href="#" className="hover:text-[#4FAA60] transition-colors">Study Plan</a></li>
                            <li><a href="#" className="hover:text-[#4FAA60] transition-colors">Daily Quiz</a></li>
                            <li><a href="#" className="hover:text-[#4FAA60] transition-colors">Test Series</a></li>
                            <li><a href="#" className="hover:text-[#4FAA60] transition-colors">Current Affairs</a></li>
                            <li><a href="#" className="hover:text-[#4FAA60] transition-colors">Performance Insights</a></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div className="lg:col-span-3">
                        <h3 className="text-base font-medium mb-6 text-white uppercase tracking-wider text-[13px]">Contact us</h3>
                        <ul className="space-y-4 text-sm text-gray-400 font-medium">
                            <li className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover:bg-[#4FAA60]/20 transition-colors">
                                    <Mail className="w-4 h-4 text-[#4FAA60]" />
                                </div>
                                <a href="mailto:support@examcopilot.in" className="hover:text-[#4FAA60] transition-colors">support@examcopilot.in</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover:bg-[#4FAA60]/20 transition-colors">
                                    <Phone className="w-4 h-4 text-[#4FAA60]" />
                                </div>
                                <span className="hover:text-white transition-colors">+91 XXXXX XXXXX</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 transition-all">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium text-center md:text-left">
                        © 2026 Thani Oruvan. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-gray-500 font-medium">
                        <a href="#" className="hover:text-[#4FAA60] transition-colors">Help Center</a>
                        <a href="#" className="hover:text-[#4FAA60] transition-colors">Terms & Conditions</a>
                        <a href="#" className="hover:text-[#4FAA60] transition-colors">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
