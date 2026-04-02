import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Target, BarChart3, Users, Filter, History } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [filterType, setFilterType] = useState<"todos" | "estrategico" | "tatico">("todos");
  const [selectedTeam, setSelectedTeam] = useState<string>("Todas");
  const [historyKrId, setHistoryKrId] = useState<string | null>(null);
  const [historyKrTitle, setHistoryKrTitle] = useState("");

  const { data: periods = [] } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("periods").select("*").order("year", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const effectivePeriodId = selectedPeriodId || periods[0]?.id || "";

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: objectives = [] } = useQuery({
    queryKey: ["dashboard-objectives", effectivePeriodId],
    queryFn: async () => {
      if (!effectivePeriodId) return [];
      const { data, error } = await supabase
        .from("objectives")
        .select("*, key_results(*, teams(name)), teams(name)")
        .eq("period_id", effectivePeriodId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!effectivePeriodId,
  });

  const { data: history = [] } = useQuery({
    queryKey: ["kr-history", historyKrId],
    queryFn: async () => {
      if (!historyKrId) return [];
      const { data, error } = await supabase
        .from("kr_history")
        .select("*")
        .eq("key_result_id", historyKrId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!historyKrId,
  });

  const filteredObjectives = useMemo(() => {
    return objectives.filter((o) => {
      if (filterType === "estrategico" && o.type !== "estrategico") return false;
      if (filterType === "tatico" && o.type !== "tatico") return false;
      return true;
    }).map((o) => ({
      ...o,
      key_results: (o.key_results || []).filter((kr: any) =>
        selectedTeam === "Todas" || (kr.teams?.name === selectedTeam)
      ),
    })).filter((o) => filterType === "estrategico" ? true : o.key_results.length > 0);
  }, [objectives, filterType, selectedTeam]);

  const allKRs = filteredObjectives.flatMap((o) => o.key_results);
  const totalKRs = allKRs.length;
  const avgProgress = totalKRs > 0
    ? Math.round(allKRs.reduce((sum, kr: any) => {
        const progress = kr.target_value > 0 ? (kr.current_value / kr.target_value) * 100 : 0;
        return sum + Math.min(progress, 100);
      }, 0) / totalKRs)
    : 0;
  const completedKRs = allKRs.filter((kr: any) => kr.current_value >= kr.target_value).length;

  const typeButtons = [
    { key: "todos" as const, label: "Todos", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "estrategico" as const, label: "Estratégicos", icon: <Target className="h-4 w-4" /> },
    { key: "tatico" as const, label: "Táticos", icon: <Users className="h-4 w-4" /> },
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "hsl(var(--secondary))";
    if (progress >= 25) return "hsl(var(--accent))";
    return "hsl(var(--muted-foreground))";
  };

  const formatBrazilianDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={effectivePeriodId} onValueChange={setSelectedPeriodId}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Ano" /></SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.year} {p.is_open ? "🟢" : "🔴"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {typeButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => { setFilterType(btn.key); if (btn.key === "estrategico") setSelectedTeam("Todas"); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterType === btn.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {btn.icon}{btn.label}
            </button>
          ))}
        </div>

        {filterType !== "estrategico" && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <button
              onClick={() => setSelectedTeam("Todas")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                selectedTeam === "Todas" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >Todas</button>
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelectedTeam(t.name); if (filterType !== "tatico") setFilterType("tatico"); }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                  selectedTeam === t.name ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >{t.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total de KRs", value: totalKRs, accent: false },
          { label: "Progresso Médio", value: `${avgProgress}%`, accent: true },
          { label: "KRs Concluídos", value: completedKRs, accent: false },
          { label: "Objetivos", value: filteredObjectives.length, accent: false },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${stat.accent ? "text-secondary" : "text-foreground"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Objectives + KRs */}
      <div className="space-y-6">
        {filteredObjectives.map((obj) => {
          const objKRs = obj.key_results as any[];
          const objProgress = objKRs.length > 0
            ? Math.round(objKRs.reduce((s, kr) => s + Math.min((kr.current_value / kr.target_value) * 100, 100), 0) / objKRs.length)
            : 0;

          return (
            <div key={obj.id} className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{obj.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        obj.type === "estrategico" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                      }`}>
                        {obj.type === "estrategico" ? "Estratégico" : "Tático"}
                      </span>
                      {(obj as any).teams?.name && (
                        <span className="text-xs text-muted-foreground">{(obj as any).teams.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getProgressColor(objProgress) }} />
                  <span className="text-xs font-bold text-foreground">{objProgress}%</span>
                </div>
              </div>

              <div className="space-y-2">
                {objKRs.map((kr: any) => {
                  const progress = kr.target_value > 0 ? Math.min((kr.current_value / kr.target_value) * 100, 100) : 0;
                  return (
                    <div
                      key={kr.id}
                      className="bg-muted/50 rounded-lg p-3 cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => { setHistoryKrId(kr.id); setHistoryKrTitle(kr.title); }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-foreground">{kr.title}</p>
                          <History className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">{kr.teams?.name ?? "Global"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: getProgressColor(progress) }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground min-w-[80px] text-right">
                          {kr.current_value}{kr.unit_type === "percentage" ? "%" : ""} / {kr.target_value}{kr.unit_type === "percentage" ? "%" : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {objKRs.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">Nenhum resultado-chave cadastrado.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredObjectives.length === 0 && effectivePeriodId && (
        <p className="text-center text-muted-foreground py-12">Nenhum resultado encontrado para os filtros selecionados.</p>
      )}

      {/* History Dialog */}
      <Dialog open={!!historyKrId} onOpenChange={() => setHistoryKrId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Histórico: {historyKrTitle}</DialogTitle>
          </DialogHeader>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {history.map((h: any) => (
                <div key={h.id} className="border-l-2 border-secondary pl-3 py-1">
                  <p className="text-xs text-muted-foreground">
                    {formatBrazilianDate(h.created_at)}
                    {h.month && ` · Ref: ${h.month}`}
                  </p>
                  {h.updated_by_name && (
                    <p className="text-xs text-muted-foreground">por {h.updated_by_name}</p>
                  )}
                  <p className="text-sm font-medium text-foreground">{h.description}</p>
                  <p className="text-xs text-muted-foreground">{h.previous_value} → {h.new_value}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <footer className="mt-12 pb-8 text-center">
        <p className="text-xs text-muted-foreground">JA Rio de Janeiro © {new Date().getFullYear()} — Dashboard de OKRs</p>
      </footer>
    </div>
  );
}
