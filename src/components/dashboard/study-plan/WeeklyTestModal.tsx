import { Dialog, DialogContent } from "@/components/ui/dialog";
import TestEngine, { Question as TestQuestion } from "@/components/TestEngine";
import { Loader2 } from "lucide-react";

interface WeeklyTestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  questions: TestQuestion[];
  weekNo: number | null;
  testId: number | null;
  testStartTime: number | null;
  isSubmitting: boolean;
  onSubmit: (answersRecord: any) => void;
}

export const WeeklyTestModal = ({
  isOpen,
  onOpenChange,
  questions,
  weekNo,
  testId,
  testStartTime,
  isSubmitting,
  onSubmit
}: WeeklyTestModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (window.confirm("Are you sure you want to exit? Your progress will not be saved.")) {
          onOpenChange(false);
        }
      } else {
        onOpenChange(true);
      }
    }}>
      <DialogContent className="max-w-[100vw] w-screen h-screen p-0 m-0 border-none rounded-none overflow-hidden bg-[#F5F5F7]">
        <div className="w-full h-full">
          <TestEngine
            questions={questions}
            title={`Week ${weekNo} Test`}
            subtitle="Weekly Assessment"
            onComplete={onSubmit}
            onExit={() => {
              if (window.confirm("Are you sure you want to exit? Your progress will not be saved.")) {
                onOpenChange(false);
              }
            }}
            initialTime={120 * 60}
          />
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
