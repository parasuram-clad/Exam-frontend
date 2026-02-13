import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in">
        <div className="relative mb-8">
          <h1 className="text-9xl font-black text-slate-200/50">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background p-4 rounded-2xl shadow-xl">
              <span className="text-4xl">🔍</span>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Oops! Page not found</h2>
        <p className="mb-8 text-muted-foreground max-w-sm mx-auto leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="/">
            <Button className="px-8 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold">
              Back to Dashboard
            </Button>
          </a>
          <Button variant="outline" onClick={() => window.history.back()} className="px-8 h-12 rounded-xl border-slate-200">
            Go Back
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;
