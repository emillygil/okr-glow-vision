import { useState, useMemo } from "react";
import { okrData, tacticalTeams, OKRType } from "@/data/okrData";
import { ObjectiveCard } from "@/components/ObjectiveCard";
import { Target, BarChart3, Users, Filter } from "lucide-react";

type FilterType = "todos" | "estrategico" | "tatico";

export default function Dashboard() {
  const [filterType, setFilterType] = useState<FilterType>("todos");
  const [selectedTeam, setSelectedTeam] = useState<string>("Todas");

  const filteredGroups = useMemo(() => {
    return okrData.filter((group) => {
      if (filterType === "estrategico" && group.type !== "estrategico") return false;
      if (filterType === "tatico" && group.type !== "tatico") return false;
      if (selectedTeam !== "Todas" && group.team !== selectedTeam) return false;
      return true;
    });
  }, [filterType, selectedTeam]);

  const totalKRs = useMemo(
    () =>
      filteredGroups.reduce(
        (sum, g) => sum + g.objectives.reduce((s, o) => s + o.keyResults.length, 0),
        0
      ),
    [filteredGroups]
  );

  const avgProgress = useMemo(() => {
    let total = 0;
    let count = 0;
    filteredGroups.forEach((g) =>
      g.objectives.forEach((o) =>
        o.keyResults.forEach((kr) => {
          total += kr.progress;
          count++;
        })
      )
    );
    return count > 0 ? Math.round(total / count) : 0;
  }, [filteredGroups]);

  const completedKRs = useMemo(
    () =>
      filteredGroups.reduce(
        (sum, g) =>
          sum +
          g.objectives.reduce(
            (s, o) => s + o.keyResults.filter((kr) => kr.progress >= 100).length,
            0
          ),
        0
      ),
    [filteredGroups]
  );

  const typeButtons: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: "todos", label: "Todos", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "estrategico", label: "Estratégicos", icon: <Target className="h-4 w-4" /> },
    { key: "tatico", label: "Táticos", icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                OKRs 2026
              </h1>
              <p className="text-primary-foreground/70 text-sm mt-1">
                JA Rio de Janeiro — Acompanhamento de Resultados
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1 bg-primary-foreground/10 rounded-lg p-1">
              {typeButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => {
                    setFilterType(btn.key);
                    if (btn.key === "estrategico") setSelectedTeam("Todas");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    filterType === btn.key
                      ? "bg-primary-foreground text-primary shadow-sm"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  }`}
                >
                  {btn.icon}
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile type filter */}
        <div className="flex sm:hidden items-center gap-1 bg-muted rounded-lg p-1 mb-4">
          {typeButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => {
                setFilterType(btn.key);
                if (btn.key === "estrategico") setSelectedTeam("Todas");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                filterType === btn.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>

        {/* Team filter (only when not purely strategic) */}
        {filterType !== "estrategico" && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <button
              onClick={() => setSelectedTeam("Todas")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedTeam === "Todas"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Todas as equipes
            </button>
            {tacticalTeams.map((team) => (
              <button
                key={team}
                onClick={() => {
                  setSelectedTeam(team);
                  if (filterType === "estrategico") setFilterType("tatico");
                }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedTeam === team
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total de KRs", value: totalKRs, accent: false },
            { label: "Progresso Médio", value: `${avgProgress}%`, accent: true },
            { label: "KRs Concluídos", value: completedKRs, accent: false },
            { label: "Equipes", value: filteredGroups.length, accent: false },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-xl p-4 text-center"
            >
              <p className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </p>
              <p
                className={`text-2xl font-extrabold mt-1 ${
                  stat.accent ? "text-secondary" : "text-foreground"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* OKR Groups */}
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <section key={`${group.type}-${group.team}`}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`h-8 w-1 rounded-full ${
                    group.type === "estrategico" ? "bg-primary" : "bg-secondary"
                  }`}
                />
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {group.team}
                  </h2>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      group.type === "estrategico"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    {group.type === "estrategico" ? "Estratégico" : "Tático"}
                  </span>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {group.objectives
                  .filter((o) => o.keyResults.length > 0)
                  .map((obj) => (
                    <ObjectiveCard key={`${group.team}-${obj.id}`} objective={obj} />
                  ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 pb-8 text-center">
          <p className="text-xs text-muted-foreground">
            JA Rio de Janeiro © 2026 — Dashboard de OKRs
          </p>
        </footer>
      </div>
    </div>
  );
}
