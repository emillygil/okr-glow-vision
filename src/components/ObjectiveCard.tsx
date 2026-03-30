import { Objective, objectiveIcons } from "@/data/okrData";
import { KRCard } from "./KRCard";

interface ObjectiveCardProps {
  objective: Objective;
}

export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const icon = objectiveIcons[(objective.id - 1) % objectiveIcons.length];
  const totalProgress =
    objective.keyResults.length > 0
      ? Math.round(
          objective.keyResults.reduce((sum, kr) => sum + kr.progress, 0) /
            objective.keyResults.length
        )
      : 0;

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-bold text-foreground text-sm leading-tight">
              OBJ {objective.id}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
              {objective.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {objective.keyResults.length} KRs
          </span>
          <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1">
            <div className="h-2 w-2 rounded-full" style={{
              backgroundColor: totalProgress >= 75 ? '#00A0AF' : totalProgress >= 25 ? '#E3E24F' : '#9ca3af'
            }} />
            <span className="text-xs font-bold text-foreground">{totalProgress}%</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {objective.keyResults.map((kr) => (
          <KRCard key={kr.id} kr={kr} />
        ))}
      </div>
    </div>
  );
}
