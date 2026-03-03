import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import authService from "@/services/auth.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const navigate = useNavigate();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const validateMobile = (num: string) => {
        return /^\d{10}$/.test(num.replace(/\D/g, ''));
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateMobile(mobile)) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }

        setIsLoading(true);
        try {
            const fullMobile = `+91${mobile}`;
            await authService.sendOTP(fullMobile);
            setStep(2);
            setTimer(30);
            toast.success("OTP sent successfully to your mobile");
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error("Please enter the full 6-digit OTP");
            return;
        }

        setIsLoading(true);
        try {
            const fullMobile = `+91${mobile}`;
            await authService.verifyOTP(fullMobile, otp);
            toast.success("Logged in successfully!");
            onClose();
            navigate("/dashboard?welcome=true");
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Invalid OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;
        setIsLoading(true);
        try {
            const fullMobile = `+91${mobile}`;
            await authService.sendOTP(fullMobile);
            setTimer(30);
            toast.success("OTP resent successfully");
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Failed to resend OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                <DialogTitle className="sr-only">Login</DialogTitle>

                <div className="relative bg-gradient-to-b from-[#F0FFF4] to-white p-6 sm:p-10 pt-12">
                    <div className="absolute bottom-0 left-0 w-full h-32 opacity-10 pointer-events-none bg-[radial-gradient(#4FAA60_1px,transparent_1px)] [background-size:20px_20px]" />



                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="mobile"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8 text-center relative z-10"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-[#0F172A]">Login with Mobile</h2>
                                    <p className="text-gray-500 text-lg">Let's get you started</p>
                                </div>

                                <form onSubmit={handleSendOtp} className="space-y-8 text-left max-w-sm mx-auto">
                                    <div className="space-y-3">
                                        <Label htmlFor="mobile" className="text-base font-medium text-gray-700">Mobile Number</Label>
                                        <div className="relative mt-1.5 flex transition-all duration-200 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#4FAA60] focus-within:ring-2 focus-within:ring-[#4FAA60]/20">
                                            <div className="flex items-center justify-center px-4 bg-gray-50 border-r border-gray-200 text-gray-500 font-medium whitespace-nowrap">
                                                +91
                                            </div>
                                            <div className="relative flex-1">
                                                <Input
                                                    id="mobile"
                                                    type="tel"
                                                    placeholder={t('login.mobilePlaceholder')}
                                                    value={mobile}
                                                    onChange={(e) => setMobile(e.target.value)}
                                                    className="h-12 border-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none pl-4 pr-10"
                                                    required
                                                    maxLength={10}
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <p className="text-sm text-[#94A3B8]">We'll send you a 6-digit verification code.</p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading || mobile.length < 10}
                                        className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-md font-semibold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isLoading ? "Sending..." : "Send OTP"}
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8 text-center relative z-10"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-[#0F172A]">OTP Verification</h2>
                                    <p className="text-gray-500 text-lg">Just one small step to go</p>
                                </div>

                                <div className="space-y-6 max-w-sm mx-auto">
                                    <p className="text-[#64748B] text-base leading-relaxed">
                                        We've sent a 6-digit code to <br />
                                        <span className="font-semibold text-[#0F172A]">+91 {mobile.slice(0, 5)} {mobile.slice(5)}</span>
                                    </p>

                                    <div className="flex justify-center py-2">
                                        <InputOTP
                                            maxLength={6}
                                            value={otp}
                                            onChange={(value) => setOtp(value)}
                                            pattern={REGEXP_ONLY_DIGITS}
                                            autoFocus
                                        >
                                            <InputOTPGroup className="gap-2 sm:gap-3">
                                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                                    <InputOTPSlot
                                                        key={index}
                                                        index={index}
                                                        className="w-12 h-12 sm:w-12 sm:h-14 text-xl sm:text-2xl font-semibold border-[#E2E8F0] rounded-xl focus:border-[#4FAA60] focus:ring-4 focus:ring-[#4FAA60]/10"
                                                    />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[#64748B] text-sm font-medium">Enter the code and you're good to go.</p>

                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={timer > 0 || isLoading}
                                            className="text-sm font-semibold text-[#94A3B8] hover:text-[#4FAA60] transition-colors disabled:opacity-75 disabled:hover:text-[#94A3B8]"
                                        >
                                            {timer > 0 ? `Didn't get it? Resend in ${formatTime(timer)}` : "Didn't get it? Resend OTP"}
                                        </button>
                                    </div>

                                    <form onSubmit={handleVerifyOtp} className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={isLoading || otp.length < 6}
                                            className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-md font-semibold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isLoading ? "Verifying..." : "Verify OTP"}
                                        </Button>
                                    </form>

                                    <button
                                        onClick={() => {
                                            setStep(1);
                                            setOtp("");
                                        }}
                                        className="text-[#64748B] text-sm font-semibold hover:text-[#0F172A] transition-colors underline underline-offset-4"
                                    >
                                        Change Mobile Number
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LoginModal;
