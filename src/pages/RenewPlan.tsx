import { DashboardLayout } from "@/components/layout";
import { motion } from "framer-motion";
import {
  History,
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Info,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const RenewPlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Simulated current plan data
  const planName = "Pro Membership";
  const expiryDate = "Dec 31, 2025";
  const price = 4999;
  const gst = Math.round(price * 0.18);
  const total = price + gst;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-6 py-10 md:py-14 space-y-16 no-scrollbar">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-accent transition-all duration-300 mb-2 group text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft className="w-5 h-5 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Profile
        </button>

        {/* Header */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <Badge variant="outline" className="px-4 py-1 border-accent/40 text-accent font-bold rounded-full mb-3 text-[11px] uppercase tracking-[0.1em] bg-accent/5">
            Plan Renewal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight">
            Keep your momentum <br />
            <span className="text-accent italic">Renew Today</span>
          </h1>
          <p className="text-base text-muted-foreground/80 max-w-lg mx-auto leading-relaxed">
            Your current {planName} plan expires on <span className="text-foreground font-semibold">{expiryDate}</span>. Renew now to bridge the gap and stay ahead of the competition.
          </p>
        </div>

        {/* Current Info & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#1D2C4E] rounded-[32px] p-8 shadow-2xl relative overflow-hidden text-white group cursor-default border-none"
          >
            {/* Dynamic background particles/glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-accent/30 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[40px] -ml-12 -mb-12" />

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                  <Zap className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{planName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-[#10B981] hover:bg-[#10B981] text-[10px] font-black h-5 px-2 tracking-wider border-none text-white">ACTIVE</Badge>
                    <span className="text-white/50 text-[10px] uppercase font-extrabold tracking-[0.1em] leading-none">ANNUAL PLAN</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2.5 text-white/70 font-medium tracking-wide leading-none">
                    <Calendar className="w-4 h-4 text-accent/80" />
                    Expires On
                  </div>
                  <span className="font-bold underline decoration-accent/60 decoration-2 underline-offset-4">{expiryDate}</span>
                </div>
                <div className="flex justify-between items-center text-sm opacity-60 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2.5 font-medium tracking-wide leading-none">
                    <History className="w-4 h-4" />
                    Active Since
                  </div>
                  <span className="font-bold tracking-wide leading-none">Jan 01, 2025</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-[32px] p-8 shadow-xl border border-border/50 flex flex-col justify-between group cursor-default"
          >
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-[#111827] tracking-tight">Renewal Summary</h3>
              <div className="space-y-3.5">
                <div className="flex justify-between text-sm text-muted-foreground font-semibold tracking-wide">
                  <span>Base Price</span>
                  <span className="text-foreground">₹{price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground font-semibold tracking-wide">
                  <span>GST (18%)</span>
                  <span className="text-foreground">₹{gst.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent my-4" />
                <div className="flex justify-between items-baseline">
                  <span className="font-extrabold text-[#111827] text-lg">Total Amount</span>
                  <span className="text-3xl font-black text-accent tracking-tighter">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate(`/payment?plan=pro&type=renewal`)}
              className="w-full h-14 mt-6 rounded-2xl font-bold text-base bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/15 group-hover:scale-[1.01] transition-all border-none"
            >
              Extend Subscription
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>

        {/* Benefits Section */}
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-[#111827] tracking-tight">Maintain your Edge</h3>
            <p className="text-muted-foreground/80 text-sm leading-relaxed max-w-sm mx-auto font-medium">
              Stay connected to our latest content and don't lose your personalized study data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Personal Data", desc: "Keep all your mock test results and AI progress tracking safe.", icon: <ShieldCheck className="w-5 h-5" />, color: "bg-blue-50 text-blue-600 border-blue-100" },
              { title: "Priority Updates", desc: "Gain early access to TNPSC current affairs and new test series.", icon: <Zap className="w-5 h-5" />, color: "bg-accent/5 text-accent border-accent/10" },
              { title: "Expert Sessions", desc: "Continue participating in exclusive live webinars every weekend.", icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-600 border-emerald-100" }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card/50 backdrop-blur-sm p-8 rounded-[32px] border border-border/60 hover:border-accent/30 hover:bg-white transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border mb-6 group-hover:scale-110 transition-transform shadow-sm", benefit.color)}>
                  {benefit.icon}
                </div>
                <h4 className="font-bold text-lg mb-2 text-[#111827] tracking-tight">{benefit.title}</h4>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Support CTA Block */}
        <div className="bg-[#0F172A] rounded-[48px] p-10 md:p-16 relative overflow-hidden text-white text-center shadow-2xl border-none">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none opacity-40" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] -ml-48 -mb-48 pointer-events-none opacity-30" />

          <div className="relative z-10 space-y-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-[22px] bg-white/5 flex items-center justify-center border border-white/10 shadow-lg backdrop-blur-sm group hover:border-accent/50 transition-colors duration-500">
                <Info className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-extrabold tracking-tight">Need help with your plan?</h3>
              <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed font-medium">
                Our support team is available 24/7 to help you with renewals, upgrades, or any billing queries you might have.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="default"
                className="rounded-2xl px-12 h-14 bg-white text-[#0F172A] hover:bg-slate-100 transition-all font-bold tracking-wide shadow-xl min-w-[240px]"
              >
                Contact Billing Support
              </Button>

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RenewPlan;
