import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import TestEngine, { Question as TestQuestion } from "@/components/TestEngine";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeeklyTestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  questions: TestQuestion[];
  weekNo: number | null;
  monthNo: number | null;
  testType: "WEEKLY" | "MONTHLY" | null;
  testId: number | null;
  testStartTime: number | null;
  isSubmitting: boolean;
  onSubmit: (answersRecord: any) => void;
  blocker?: any;
}

export const WeeklyTestModal = ({
  isOpen,
  onOpenChange,
  questions,
  weekNo,
  monthNo,
  testType,
  testId,
  testStartTime,
  isSubmitting,
  onSubmit,
  blocker
}: WeeklyTestModalProps) => {
  const isMonthly = testType === "MONTHLY";
  const displayNo = isMonthly ? monthNo : weekNo;
  const title = isMonthly ? `Month ${displayNo} Test` : `Week ${displayNo} Test`;
  const subtitle = isMonthly ? "Monthly Assessment" : "Weekly Assessment";
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    if (blocker?.state === "blocked") {
      setShowExitDialog(true);
    }
  }, [blocker?.state]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setShowExitDialog(true);
      } else {
        onOpenChange(true);
      }
    }}>
      <DialogContent className="max-w-[100vw] w-screen h-screen p-0 m-0 border-none rounded-none overflow-hidden bg-[#F5F5F7]">
        <div className="w-full h-full">
          <TestEngine
            questions={questions}
            title={title}
            subtitle={subtitle}
            onComplete={onSubmit}
            onExit={() => setShowExitDialog(true)}
            initialTime={120 * 60}
          />

          {/* Exit Confirmation Dialog */}
          <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <DialogContent className="sm:max-w-md rounded-3xl p-6 sm:p-8 border-none shadow-2xl">
              <DialogTitle className="sr-only">Exit Test Confirmation</DialogTitle>
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Exit Test?</h3>
                  <p className="text-muted-foreground mt-2">
                    Are you sure you want to exit? Your progress will not be saved and you will lose any unsaved answers.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowExitDialog(false);
                      blocker?.reset?.();
                    }}
                    className="flex-1 h-12 rounded-xl text-sm font-semibold border-2"
                  >
                    Continue Test
                  </Button>
                  <Button
                    onClick={() => {
                      setShowExitDialog(false);
                      if (blocker?.state === "blocked") {
                        blocker.proceed();
                      }
                      onOpenChange(false);
                    }}
                    className="flex-1 h-12 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    Exit Anyway
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium text-foreground">Submitting your test...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
