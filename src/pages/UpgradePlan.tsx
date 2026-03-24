import { DashboardLayout } from "@/components/layout";
import { motion } from "framer-motion";
import { 
  Check, 
  Zap, 
  Crown, 
  Star, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Users2,
  Trophy,
  Rocket,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const PLANS = [
  {
    name: "Basic",
    id: "basic",
    price: "Free",
    period: "Forever",
    description: "Perfect for beginners exploring the syllabus and standard practice.",
    features: [
      "Access to standard question bank",
      "5 Mock tests per month",
      "Community forum access",
      "Basic performance stats",
      "Limited current affairs"
    ],
    accent: "bg-slate-200",
    textAccent: "text-slate-600",
    icon: <Zap className="w-5 h-5" />,
    popular: false
  },
  {
    name: "Pro Membership",
    id: "pro",
    price: "₹4,999",
    period: "Yearly",
    description: "Most popular choice for dedicated aspirants seeking consistent progress.",
    features: [
      "Everything in Basic",
      "Unlimited Mock Tests",
      "Personalized AI Study Plan",
      "Expert Doubt Clearing",
      "Detailed Analytics Dashboard",
      "Daily Current Affairs",
      "Topic-wise mindmaps"
    ],
    accent: "bg-accent/10",
    textAccent: "text-accent",
    icon: <Crown className="w-5 h-5" />,
    popular: true
  },
  {
    name: "Elite",
    id: "elite",
    price: "₹8,999",
    period: "Yearly",
    description: "The ultimate preparation package with personal mentorship and strategy.",
    features: [
      "Everything in Pro",
      "1-on-1 Mentorship Sessions",
      "Printed Study Materials",
      "Exclusive Live Webinars",
      "Priority Support",
      "Interview Guidance",
      "Dedicated Strategy Plan"
    ],
    accent: "bg-purple-100",
    textAccent: "text-purple-600",
    icon: <Star className="w-5 h-5" />,
    popular: false
  }
];

const UpgradePlan = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    navigate(`/payment?plan=${planId}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 no-scrollbar">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-accent transition-all duration-300 mb-8 group text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft className="w-5 h-5 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Profile
        </button>

        {/* Header Section */}
        <div className="text-center space-y-3 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="px-3 py-0.5 border-accent/30 text-accent font-semibold rounded-full mb-2 text-[10px] uppercase tracking-wider">
              Premium Preparation
            </Badge>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight"
          >
            Accelerate your success with <br />
            <span className="text-accent italic">Copilot Premium</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto"
          >
            Choose the membership that matches your ambition. Unlock powerful tools, personalized insights, and expert guidance.
          </motion.p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-16">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={cn(
                "relative group flex flex-col h-full bg-card p-0.5 rounded-[32px] shadow-xl transition-all duration-300 border border-border/40",
                plan.popular ? "ring-2 ring-accent" : "hover:border-accent/30"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md z-20">
                  Recommended
                </div>
              )}

              <div className="flex-1 bg-card rounded-[30px] p-6 space-y-6 flex flex-col">
                <div className="space-y-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm", plan.accent, plan.textAccent)}>
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-muted-foreground text-xs line-clamp-2 min-h-[32px]">
                    {plan.description}
                  </p>
                </div>

                <div className="py-2 border-y border-border/40">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground font-medium text-xs">/{plan.period}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Includes</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 group/item">
                        <div className={cn("mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors", plan.popular ? "bg-accent/10" : "bg-slate-100")}>
                          <Check className={cn("w-2.5 h-2.5", plan.popular ? "text-accent" : "text-slate-500")} />
                        </div>
                        <span className="text-xs text-foreground/85 font-medium group-hover/item:text-foreground transition-colors leading-tight">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  onClick={() => handleSelectPlan(plan.id)}
                  className={cn(
                    "w-full h-11 rounded-xl font-bold text-sm transition-all duration-300 border-none shadow-sm",
                    plan.popular 
                      ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  )}
                >
                  {plan.id === 'basic' ? "Continue Free" : "Get Membership"}
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why Choose Copilot Section */}
        <div className="mt-8 bg-[#0F172A] rounded-[32px] p-8 md:p-14 relative overflow-hidden text-white shadow-xl border-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none opacity-40" />
          
          <div className="relative z-10">
            <div className="text-center space-y-3 mb-14 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Why Upgrade to Copilot Pro?</h2>
              <p className="text-slate-400 text-sm">
                We combine psychological-backed study methods with modern AI to bridge the gap between practice and success.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/40 transition-colors duration-500">
                  <BrainCircuit className="w-6 h-6 text-accent" />
                </div>
                <h4 className="text-lg font-bold">AI Analytics</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Deep learning algorithms track your weak spots across subjects and suggest targeted practice.
                </p>
              </div>

              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/40 transition-colors duration-500">
                  <Rocket className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-lg font-bold">Priority Prep</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Get immediate access to new current affairs updates and exam-specific schedules before others.
                </p>
              </div>

              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/40 transition-colors duration-500">
                  <Users2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold">Mentor Support</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Direct connection with subject matter experts who have cleared the exams multiple times.
                </p>
              </div>

              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/40 transition-colors duration-500">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-lg font-bold">Result Oriented</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  92% of our Pro members reported a significant increase in their mock scores within 30 days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Footer */}
        <div className="mt-16 text-center space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 pb-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold text-[10px] tracking-widest uppercase">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase italic">
              Razorpay Secured
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-bold text-[10px] tracking-widest uppercase">Verified Results</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UpgradePlan;
