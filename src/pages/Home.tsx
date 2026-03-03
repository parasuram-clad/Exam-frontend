import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "@/services/auth.service";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import VideoSection from "@/components/home/VideoSection";
import TrustedBy from "@/components/home/TrustedBy";
import Features from "@/components/home/Features";
import GainSection from "@/components/home/GainSection";
import StatsSection from "@/components/home/StatsSection";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/home/Footer";
import LoginModal from "@/components/auth/LoginModal";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f8faf8] font-montserrat">
      <Navbar onLoginClick={() => setIsLoginModalOpen(true)} />
      <Hero onGetStarted={() => setIsLoginModalOpen(true)} />
      <VideoSection />
      <TrustedBy />
      <Features />
      <GainSection />
      <StatsSection />
      <Testimonials />
      <Pricing onGetStarted={() => setIsLoginModalOpen(true)} />
      <FAQ />
      <Footer />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default Home;
