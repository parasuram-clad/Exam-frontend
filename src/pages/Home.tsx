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

const Home = () => {
  return (
    <div className="min-h-screen bg-[#f8faf8] font-montserrat">
      <Navbar />
      <Hero />
      <VideoSection />
      <TrustedBy />
      <Features />
      <GainSection />
      <StatsSection />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;
