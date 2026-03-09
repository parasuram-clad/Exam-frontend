import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Target, Award, TrendingUp, CheckCircle2 } from "lucide-react";
import authService from "@/services/auth.service";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchAllUserData } from "@/services/prefetch";
import { getErrorMessage } from "@/lib/utils";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      setShowOtp(true);
      toast.success("OTP sent successfully to your mobile");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to send OTP. Please try again."));
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

      // Start preloading data in the background
      prefetchAllUserData(queryClient);

      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Invalid OTP. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: BookOpen, text: "10,000+ Study Materials" },
    { icon: Target, text: "Practice Mock Tests" },
    { icon: Award, text: "Track Your Progress" },
    { icon: TrendingUp, text: "Personalized Learning Path" },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf8] flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#4FAA60] via-[#3d9550] to-[#2d7a3d] items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute top-40 right-20 w-20 h-20 border-2 border-white rounded-full" />
          <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-white rounded-full" />
          <div className="absolute bottom-40 right-10 w-16 h-16 border-2 border-white rounded-full" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-32 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-40 left-24 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-75" />
        <div className="absolute bottom-32 right-24 w-5 h-5 bg-white/20 rounded-full animate-pulse delay-150" />

        <div className="text-center max-w-lg relative z-10">
          {/* Main Illustration */}
          <div className="relative mb-10">
            <div className="w-72 h-72 mx-auto bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
              <div className="text-center p-8">
                <div className="text-8xl mb-4">📚</div>
                <div className="flex justify-center gap-3 mt-4">
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-white/70 rounded-full animate-bounce delay-100" />
                  <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
            {/* Decorative badges */}
            <div className="absolute -top-4 -right-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
              <span className="text-white text-sm font-medium">TNPSC Ready</span>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
              <span className="text-white text-sm font-medium">1000+ Students</span>
            </div>
          </div>

          <h3 className="text-3xl font-bold text-white mb-4">
            {t('login.illustration.title')}
          </h3>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            {t('login.illustration.description')}
          </p>

          {/* Feature Pills */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20"
              >
                <feature.icon className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="text-2xl font-medium font-goldman text-[#1a1c1e] mb-2 block">
            Thani Oruvan
          </Link>
          <p className="text-gray-500 mb-6">{t('login.subtitle')}</p>

          <AnimatePresence mode="wait">
            {!showOtp ? (
              <motion.form
                key="mobile-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div>
                  <Label htmlFor="mobile" className="text-gray-700 font-medium">
                    {t('login.mobileLabel')}
                  </Label>
                  <div className="relative mt-1.5 flex transition-all duration-200 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#4FAA60] focus-within:ring-2 focus-within:ring-[#4FAA60]/20">
                    <div className="flex items-center justify-center px-4 bg-gray-50 border-r border-gray-200 text-gray-500 font-medium">
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
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#4FAA60] hover:bg-[#45964f] text-white font-medium rounded-lg transition-all active:scale-95"
                >
                  {isLoading ? t('login.sendingOtp') : t('login.sendOtp')}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div className="text-center space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-gray-700 font-semibold text-base">
                      {t('login.enterOtp')}
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowOtp(false)}
                      className="text-xs text-[#4FAA60] hover:underline font-medium px-2 py-1 rounded hover:bg-[#4FAA60]/5"
                    >
                      {t('login.changeNumber')}
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                      pattern={REGEXP_ONLY_DIGITS}
                    >
                      <InputOTPGroup className="gap-2 sm:gap-4">
                        <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold border-2 rounded-xl focus:border-[#4FAA60] focus:ring-[#4FAA60]" />
                        <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold border-2 rounded-xl focus:border-[#4FAA60] focus:ring-[#4FAA60]" />
                        <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold border-2 rounded-xl focus:border-[#4FAA60] focus:ring-[#4FAA60]" />
                        <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold border-2 rounded-xl focus:border-[#4FAA60] focus:ring-[#4FAA60]" />
                        <InputOTPSlot index={4} className="w-12 h-14 text-xl font-bold border-2 rounded-xl focus:border-[#4FAA60] focus:ring-[#4FAA60]" />
                        <InputOTPSlot index={5} className="w-12 h-14 text-xl font-bold border-2 rounded-xl focus:border-[#4FAA60] focus:ring-[#4FAA60]" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Enter the code we sent to +91 {mobile}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full h-12 bg-[#4FAA60] hover:bg-[#45964f] text-white font-medium rounded-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? t('login.verifying') : t('login.verifyLogin')}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default Login;
