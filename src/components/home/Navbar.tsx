import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, CreditCard, BookOpen, LogIn } from "lucide-react";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const atTop = currentScrollY <= 50;
            setIsAtTop(atTop);

            if (!atTop) {
                // If scrolling down, show pill (isScrolled true)
                // If scrolling up, show full (isScrolled false)
                if (currentScrollY > lastScrollY) {
                    setIsScrolled(true);
                } else {
                    setIsScrolled(false);
                }
            } else {
                // If near top, always show full and transparent (handled by isAtTop)
                setIsScrolled(false);
            }

            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    const navLinks = [
        { name: "Home", href: "/", icon: Home },
        { name: "Pricing", href: "#pricing", icon: CreditCard },
        { name: "Resources", href: "#features", icon: BookOpen },
    ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <motion.nav
                    layout
                    initial={false}
                    animate={{
                        backgroundColor: isAtTop ? "rgba(255, 255, 255, 0)" : "rgba(255, 255, 255, 0.98)",
                        backdropFilter: isAtTop ? "blur(0px)" : "blur(16px)",
                        borderRadius: isScrolled ? (windowWidth < 640 ? "0px" : "100px") : "0px",
                        paddingLeft: isScrolled ? "20px" : "40px",
                        paddingRight: isScrolled ? "20px" : "40px",
                        height: isScrolled ? "54px" : "80px",
                        marginTop: isScrolled ? (windowWidth < 640 ? "0px" : "20px") : "0px",
                        boxShadow: isAtTop ? "none" : "0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1)",
                        border: isAtTop ? "1px solid rgba(255, 255, 255, 0)" : "1px solid rgba(0, 0, 0, 0.04)",
                        scale: isScrolled ? 0.98 : 1,
                        opacity: 1
                    }}
                    transition={{
                        layout: {
                            type: "spring",
                            stiffness: 180,
                            damping: 24,
                            mass: 0.8
                        },
                        default: {
                            duration: 0.4,
                            ease: [0.23, 1, 0.32, 1]
                        }
                    }}
                    style={{
                        width: isScrolled ? (windowWidth < 640 ? "100%" : "auto") : "100%",
                        minWidth: isScrolled ? (windowWidth < 640 ? "100%" : "320px") : "100%",
                        maxWidth: isScrolled ? (windowWidth < 640 ? "100%" : "1200px") : "1280px",
                    }}
                    className={`relative flex items-center justify-between pointer-events-auto gap-4 sm:gap-12 ${isScrolled && windowWidth < 640 ? 'mx-0' : 'mx-4'}`}
                >
                    {/* Logo Section */}
                    <motion.div layout className="flex items-center">
                        <Link to="/" className="text-xl sm:text-2xl font-medium font-goldman text-[#1a1c1e] whitespace-nowrap">
                            Thani Oruvan
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation - Smoothly expands between logo and button */}
                    <AnimatePresence mode="wait">
                        {!isScrolled && windowWidth >= 768 && (
                            <motion.div
                                key="desktop-nav"
                                initial={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    filter: "blur(0px)",
                                    transition: {
                                        delay: 0.4, // Wait for background to expand
                                        duration: 0.5,
                                        ease: "circOut"
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -10,
                                    filter: "blur(5px)",
                                    transition: {
                                        duration: 0.2,
                                        ease: "circIn"
                                    }
                                }}
                                className="hidden md:flex items-center gap-8 lg:gap-10"
                            >
                                {navLinks.map((link, idx) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            transition: { delay: 0.5 + idx * 0.05 }
                                        }}
                                    >
                                        <Link
                                            to={link.href}
                                            className="text-[#1a1c1e] text-[15px] font-medium transition-colors hover:text-[#4FAA60]"
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Right Side Actions */}
                    <motion.div layout className="flex items-center gap-3">
                        <Link to="/login" className="hidden sm:block">
                            <Button className={`bg-[#52a662] hover:bg-[#439652] text-white font-medium rounded-full transition-all active:scale-95 whitespace-nowrap ${isScrolled ? 'px-5 py-2 h-10 text-sm' : 'px-8 py-3 h-auto text-[15px]'}`}>
                                Sign In
                            </Button>
                        </Link>

                        {/* Hamburger Button - Hidden on Desktop/Tablet */}
                        <Button
                            variant="ghost"
                            className="md:hidden p-2 text-gray-900 transition-colors hover:bg-gray-100 rounded-full"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                    </motion.div>
                </motion.nav>
            </header >

            {/* Sidebar Overlay and Drawer */}
            <AnimatePresence>
                {
                    isMenuOpen && (
                        <>
                            {/* Background Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMenuOpen(false)}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
                            />

                            {/* Side Drawer */}
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[101] flex flex-col p-6"
                            >
                                {/* Drawer Header */}
                                <div className="flex items-center justify-between mb-10">
                                    <span className="text-xl font-medium font-goldman text-[#1a1c1e]">Navigation</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full hover:bg-gray-100"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <X className="w-6 h-6 text-gray-500" />
                                    </Button>
                                </div>

                                {/* Nav Links */}
                                <div className="flex flex-col gap-2">
                                    {navLinks.map((link, idx) => (
                                        <motion.div
                                            key={link.name}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + idx * 0.05 }}
                                        >
                                            <Link
                                                to={link.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-4 p-4 rounded-2xl text-gray-700 hover:text-[#4FAA60] hover:bg-gray-50 transition-all font-medium"
                                            >
                                                <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-[#4FAA60]/10 transition-colors">
                                                    <link.icon className="w-5 h-5" />
                                                </div>
                                                <span className="text-lg">{link.name}</span>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Bottom CTA */}
                                <div className="mt-auto pt-6 border-t border-gray-100">
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full bg-[#4FAA60] hover:bg-[#439652] text-white rounded-lg h-auto text-lg flex items-center justify-center gap-3 font-medium">
                                            <LogIn className="w-5 h-5" />
                                            Sign In
                                        </Button>
                                    </Link>
                                    <p className="text-center text-gray-400 text-sm mt-4 font-medium">© 2026 Thani Oruvan</p>
                                </div>
                            </motion.div>
                        </>
                    )
                }
            </AnimatePresence >
        </>
    );
};

export default Navbar;
