import { DashboardLayout } from "@/components/layout";
import { motion } from "framer-motion";
import {
  CreditCard,
  ChevronLeft,
  ShieldCheck,
  Lock,
  Info,
  Smartphone,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const PLANS_DATA = {
  basic: { name: "Basic", price: 0, period: "Forever" },
  pro: { name: "Pro Membership", price: 4999, period: "Yearly" },
  elite: { name: "Elite", price: 8999, period: "Yearly" }
};

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = (searchParams.get("plan") as keyof typeof PLANS_DATA) || "pro";
  const plan = PLANS_DATA[planId];

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payment Successful! Your plan has been upgraded.");
      navigate("/dashboard");
    }, 2000);
  };

  const gst = Math.round(plan.price * 0.18);
  const total = plan.price + gst;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-accent transition-all duration-300 mb-8 group text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft className="w-5 h-5 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Plans
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
              <p className="text-muted-foreground text-xs font-medium">Choose your payment method and secure your preparation.</p>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "card", label: "Card", icon: <CreditCard className="w-4 h-4" /> },
                { id: "upi", label: "UPI", icon: <Smartphone className="w-4 h-4" /> },
                { id: "netbanking", label: "Bank", icon: <ShieldCheck className="w-4 h-4" /> }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id
                      ? "border-accent bg-accent/5 text-accent shadow-sm"
                      : "border-border/40 hover:border-accent/20"
                    }`}
                >
                  <div className="mb-1.5">{method.icon}</div>
                  <span className="text-[10px] font-bold tracking-widest uppercase">{method.label}</span>
                </button>
              ))}
            </div>

            {/* Form Section */}
            <motion.div
              layout
              className="bg-card rounded-[24px] p-6 border border-border/40 shadow-sm space-y-5"
            >
              {paymentMethod === "card" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="card-number" className="text-xs font-bold uppercase tracking-wider opacity-70">Card Number</Label>
                    <div className="relative">
                      <Input id="card-number" placeholder="0000 0000 0000 0000" className="h-11 rounded-xl pl-11 text-sm border-border/60 focus:ring-accent/20" />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-xs font-bold uppercase tracking-wider opacity-70">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM / YY" className="h-11 rounded-xl text-sm border-border/60 focus:ring-accent/20" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-xs font-bold uppercase tracking-wider opacity-70">CVV</Label>
                      <div className="relative">
                        <Input id="cvv" placeholder="•••" className="h-11 rounded-xl text-sm border-border/60 focus:ring-accent/20" />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardname" className="text-xs font-bold uppercase tracking-wider opacity-70">Name on Card</Label>
                    <Input id="cardname" placeholder="Full Name" className="h-11 rounded-xl text-sm border-border/60 focus:ring-accent/20" />
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-5 bg-muted/40 rounded-xl border border-dashed border-border/60 text-center space-y-3">
                    <div className="w-12 h-12 bg-white rounded-xl mx-auto flex items-center justify-center border shadow-sm">
                      <Smartphone className="w-6 h-6 text-accent" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">Pay via VPA (UPI ID)</p>
                      <p className="text-[10px] text-muted-foreground">Example: name@okbank</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upi-id" className="text-xs font-bold uppercase tracking-wider opacity-70">Enter UPI ID</Label>
                    <Input id="upi-id" placeholder="yourname@upi" className="h-11 rounded-xl text-sm border-border/60 focus:ring-accent/20" />
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="text-center py-6 space-y-3 animate-in fade-in duration-300">
                  <ShieldCheck className="w-10 h-10 text-accent mx-auto" />
                  <p className="text-muted-foreground text-xs font-medium">You will be redirected to your bank's secure portal.</p>
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-12 rounded-xl font-bold bg-accent text-accent-foreground hover:opacity-90 shadow-md text-base border-none"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
                    />
                    Processing...
                  </div>
                ) : (
                  `Pay ₹${total.toLocaleString()}`
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                SSL secured by Razorpay
              </div>
            </motion.div>
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            <div className="bg-[#1D2C4E] text-white rounded-[24px] p-6 space-y-5 shadow-lg relative overflow-hidden border-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/15 rounded-full blur-2xl -mr-12 -mt-12" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/15">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{plan.name}</h3>
                    <Badge variant="outline" className="border-white/20 text-white/60 text-[9px] font-bold mt-1 px-2 py-0">
                      ANNUAL PLAN
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/60">Base Price</span>
                    <span>₹{plan.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/60">GST (18%)</span>
                    <span>₹{gst.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-white/10 my-3" />
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm">Total Amount</span>
                    <span className="text-xl font-black text-accent tracking-tighter">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-3.5 space-y-2.5">
                  {[
                    "Everything in previous tier",
                    "Unlimited Mock Tests",
                    "AI Analysis Access"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-white/80 font-medium tracking-wide">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-4 border border-border/40">
              <div className="flex gap-3">
                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Security Note</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                    Subscription starts immediately. Cancel auto-renewal anytime in settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payment;
