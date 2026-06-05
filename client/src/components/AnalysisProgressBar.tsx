import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface AnalysisProgressBarProps {
  progress: number;
  stage: string;
}

export function AnalysisProgressBar({ progress, stage }: AnalysisProgressBarProps) {
  return (
    <div className="w-full rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-foreground">Analyzing your resume</span>
        </div>
        <span className="text-sm font-semibold tabular-nums text-primary">
          {Math.round(progress)}%
        </span>
      </div>

      <Progress value={progress} className="h-2.5" />

      <p className="text-xs text-muted-foreground animate-pulse">{stage}...</p>
    </div>
  );
}
