import { motion } from "framer-motion";
import { CreditCard, Check, Zap, Smartphone, FileText, Shield, Bell, Lock, Crown, Star, Info, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MyPlanTabProps {
  user: any;
}

const AVAILABLE_PLANS = [
  {
    name: "Basic",
    price: "Free",
    period: "Forever",
    features: [
      "Access to standard question bank",
      "5 Mock tests per month",
      "Community forum access",
      "Basic performance stats"
    ],
    status: "available",
    accent: "gray"
  },
  {
    name: "Pro Membership",
    price: "₹4,999",
    period: "Yearly",
    features: [
      "Everything in Basic",
      "Unlimited Mock Tests",
      "Personalized AI Study Plan",
      "Expert Doubt Clearing",
      "Detailed Analytics Dashboard"
    ],
    status: "active",
    accent: "blue"
  },
  {
    name: "Elite",
    price: "₹8,999",
    period: "Yearly",
    features: [
      "Everything in Pro",
      "1-on-1 Mentorship Sessions",
      "Printed Study Materials",
      "Exclusive Live Webinars",
      "Priority Support"
    ],
    status: "upgrade",
    accent: "purple"
  }
];

export const MyPlanTab = ({ user }: MyPlanTabProps) => {
  return (
    <div className="space-y-12">
      {/* Current Subscription Header */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Your Subscription</h2>
            <p className="text-muted-foreground text-sm">Manage your membership and view plan details.</p>
          </div>
          <Badge variant="outline" className="border-accent/40 text-accent font-semibold px-3 py-1">
            Pro Active
          </Badge>
        </div>

        <div className="bg-gradient-to-br from-[#1D2C4E] to-[#334F90] rounded-3xl p-8 relative overflow-hidden shadow-xl border-none">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Zap className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Pro Membership</h3>
                    <p className="text-primary-foreground/70 text-sm">Annual billing cycle</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-white/80 text-sm bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <Calendar className="w-4 h-4" />
                    Valid until Dec 31, 2025
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <CreditCard className="w-4 h-4" />
                    Auto-renewal: ON
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-3">
                <div className="text-right">
                  <div className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">Total Recurring</div>
                  <div className="text-3xl font-bold text-white">₹4,999<span className="text-sm font-normal text-white/60">/yr</span></div>
                </div>
                <Button className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl px-8 h-12 font-bold shadow-lg border-none">
                  Manage Subscription
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Plans Comparison */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-foreground tracking-tight">Available Plans</h3>
          <p className="text-muted-foreground">Find the perfect plan that fits your preparation needs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AVAILABLE_PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              whileHover={{ y: -5 }}
              className={cn(
                "relative bg-card rounded-3xl p-6 border-2 flex flex-col h-full transition-all shelf-shadow",
                plan.status === "active" ? "border-accent ring-4 ring-accent/5 shadow-2xl scale-[1.02]" : "border-border/60 hover:border-accent/40"
              )}
            >
              {plan.status === "active" && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  Current Plan
                </div>
              )}
              
              <div className="mb-8">
                <h4 className="text-lg font-bold text-foreground mb-1">{plan.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground font-medium">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 flex-1 mb-10">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                      plan.status === "active" ? "bg-accent/20" : "bg-muted"
                    )}>
                      <Check className={cn("w-2.5 h-2.5", plan.status === "active" ? "text-accent" : "text-muted-foreground")} />
                    </div>
                    <span className="text-sm text-foreground/80 font-medium leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.status === "active" ? "outline" : "default"}
                className={cn(
                  "w-full h-11 rounded-xl font-bold transition-all",
                  plan.status === "active" 
                    ? "bg-muted text-foreground hover:bg-muted/80 cursor-default border-none" 
                    : plan.status === "upgrade" 
                      ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                      : "bg-primary text-primary-foreground"
                )}
                disabled={plan.status === "active"}
              >
                {plan.status === "active" ? "Active" : plan.status === "upgrade" ? "Upgrade Now" : "Downgrade"}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions / Plan Help */}
      <section className="bg-muted/30 border border-border/60 rounded-3xl p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="bg-white/50 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
            <Info className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-foreground mb-2">Need help choosing a plan?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              All plans include priority server access and standard core features. Our <b>AI Study Plan</b> uses advanced algorithms to track your progress and highlight weak areas specifically for the TNTPSC Group IV syllabus.
            </p>
          </div>
          <Button variant="outline" className="md:ml-auto rounded-xl border-accent/20 text-accent hover:bg-accent/10">
            Talk to Expert
          </Button>
        </div>
      </section>
    </div>
  );
};
