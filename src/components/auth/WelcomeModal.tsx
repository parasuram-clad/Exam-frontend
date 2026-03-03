import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import loginImg from "@/assets/login-img.png";

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Pre-computed confetti — no Math.random() to avoid flicker
const CONFETTI = [
    { color: "#4FAA60", left: "8%", w: 8, h: 10, delay: 0, dur: 3.2 },
    { color: "#FFD700", left: "20%", w: 10, h: 7, delay: 0.4, dur: 3.8 },
    { color: "#FF4B4B", left: "32%", w: 7, h: 9, delay: 0.8, dur: 3.5 },
    { color: "#4D96FF", left: "44%", w: 9, h: 7, delay: 0.2, dur: 4.0 },
    { color: "#A78BFA", left: "56%", w: 8, h: 11, delay: 1.0, dur: 3.3 },
    { color: "#FFD700", left: "66%", w: 11, h: 8, delay: 0.6, dur: 3.7 },
    { color: "#4FAA60", left: "76%", w: 7, h: 9, delay: 0.3, dur: 4.1 },
    { color: "#FF4B4B", left: "86%", w: 9, h: 7, delay: 0.9, dur: 3.4 },
    { color: "#4D96FF", left: "14%", w: 8, h: 10, delay: 0.5, dur: 3.6 },
    { color: "#A78BFA", left: "50%", w: 10, h: 8, delay: 1.2, dur: 3.9 },
];

const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl  p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                <DialogTitle className="sr-only">Welcome Success</DialogTitle>

                {/* Full modal wrapper — image is background of the entire card */}
                <div className="relative bg-gradient-to-b from-[#EEF9F1] to-white min-h-[440px] flex flex-col overflow-hidden">

                    {/* ── Centered background image (watermark style) ── */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <img
                            src={loginImg}
                            alt=""
                            aria-hidden="true"
                            className="w-4/5 object-contain opacity-[0.12]"
                        />
                    </div>

                    {/* ── Confetti falling from top ── */}
                    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                        {CONFETTI.map((c, i) => (
                            <motion.div
                                key={i}
                                className="absolute"
                                style={{ width: c.w, height: c.h, backgroundColor: c.color, left: c.left, top: -14 }}
                                animate={{ y: [0, 460], opacity: [0, 1, 1, 0], rotate: [0, 360] }}
                                transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: "linear" }}
                            />
                        ))}
                    </div>

                    {/* ── Content (on top of background image) ── */}
                    <motion.div
                        className="relative z-20 flex flex-col items-center justify-end flex-1 px-8 py-12 text-center space-y-8"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <div className="space-y-3">
                            <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] tracking-tight leading-snug">
                                Welcome, Future Officer!
                            </h2>
                            <div className="space-y-1 text-[#64748B] text-base sm:text-lg font-medium">
                                <p>Your journey begins today.</p>
                                <p>Stay consistent and keep moving forward.</p>
                            </div>
                        </div>

                        <div className="w-full pt-4">
                            <Button
                                onClick={onClose}
                                className="w-3/5 h-12 bg-[#1a2b4b] hover:bg-[#0F172A] text-white rounded-xl text-base font-semibold transition-all shadow-md active:scale-[0.98]"
                            >
                                Continue
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WelcomeModal;
