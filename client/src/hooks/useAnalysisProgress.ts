import { useEffect, useState } from "react";

const STAGES = [
  { label: "Uploading resume", threshold: 15 },
  { label: "Extracting text", threshold: 35 },
  { label: "Running AI analysis", threshold: 65 },
  { label: "Generating suggestions", threshold: 85 },
  { label: "Finalizing report", threshold: 95 },
];

export function useAnalysisProgress(isActive: boolean) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(STAGES[0].label);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setStage(STAGES[0].label);
      return;
    }

    setProgress(5);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const increment = prev < 30 ? 4 : prev < 60 ? 2.5 : prev < 85 ? 1.2 : 0.4;
        return Math.min(prev + increment, 92);
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    const current = [...STAGES].reverse().find((s) => progress >= s.threshold);
    if (current) setStage(current.label);
  }, [progress]);

  const complete = () => setProgress(100);

  return { progress, stage, complete, stages: STAGES };
}
