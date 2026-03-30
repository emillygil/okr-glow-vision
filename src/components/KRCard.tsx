import { Progress } from "@/components/ui/progress";
import { KeyResult } from "@/data/okrData";

interface KRCardProps {
  kr: KeyResult;
}

const getProgressColor = (progress: number) => {
  if (progress >= 75) return "bg-brand-teal";
  if (progress >= 25) return "bg-brand-lime";
  return "bg-muted-foreground/30";
};

const getProgressLabel = (progress: number) => {
  if (progress >= 75) return "text-brand-teal";
  if (progress >= 25) return "text-accent-foreground";
  return "text-muted-foreground";
};

export function KRCard({ kr }: KRCardProps) {
  return (
    <div className="group flex items-start gap-4 rounded-lg border border-border/60 bg-card p-4 transition-all hover:shadow-md hover:border-secondary/40">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-secondary tracking-wide">{kr.id}</span>
          <span className="text-xs text-muted-foreground">• {kr.frequency}</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{kr.description}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(kr.progress)}`}
                style={{ width: `${Math.max(kr.progress, 2)}%` }}
              />
            </div>
          </div>
          <span className={`text-sm font-bold min-w-[40px] text-right ${getProgressLabel(kr.progress)}`}>
            {kr.progress}%
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-muted-foreground">Meta</p>
        <p className="text-sm font-semibold text-foreground">{kr.target}</p>
        <p className="text-xs text-muted-foreground mt-1">Atual</p>
        <p className="text-sm font-semibold text-secondary">{kr.current || "0"}</p>
      </div>
    </div>
  );
}
