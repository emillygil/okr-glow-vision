import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, RefreshCw, ArrowLeft, Trash2, Pencil, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type UnitType = Database["public"]["Enums"]["unit_type"];

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const FREQUENCIES = ["mensal", "trimestral", "semestral", "anual"];

export default function Update() {
  const queryClient = useQueryClient();
  const { user, role, teamId } = useAuth();

  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [selectedObjectiveId, setSelectedObjectiveId] = useState("");
  const [mode, setMode] = useState<"choose" | "create" | "update">("choose");

  // New KR form
  const [krTitle, setKrTitle] = useState("");
  const [krTarget, setKrTarget] = useState("");
  const [krUnit, setKrUnit] = useState<UnitType>("absolute");
  const [krTeamId, setKrTeamId] = useState(teamId ?? "");
  const [krMeasurement, setKrMeasurement] = useState("");
  const [krDataSource, setKrDataSource] = useState("");
  const [krFrequency, setKrFrequency] = useState("mensal");
  const [krBaseValue, setKrBaseValue] = useState("");
  const [createForAll, setCreateForAll] = useState(false);

  // Update KR form
  const [updateKrId, setUpdateKrId] = useState("");
  const [updateValue, setUpdateValue] = useState("");
  const [updateMonth, setUpdateMonth] = useState("");

  // Edit KR
  const [editKrId, setEditKrId] = useState<string | null>(null);
  const [editKrTitle, setEditKrTitle] = useState("");
  const [editKrTarget, setEditKrTarget] = useState("");
  const [editKrMeasurement, setEditKrMeasurement] = useState("");
  const [editKrDataSource, setEditKrDataSource] = useState("");
  const [editKrFrequency, setEditKrFrequency] = useState("mensal");
  const [editKrBaseValue, setEditKrBaseValue] = useState("");

  // History
  const [historyKrId, setHistoryKrId] = useState<string | null>(null);
  const [historyKrTitle, setHistoryKrTitle] = useState("");
  const [editHistoryId, setEditHistoryId] = useState<string | null>(null);
  const [editHistoryValue, setEditHistoryValue] = useState("");
  const [editHistoryMonth, setEditHistoryMonth] = useState("");

  const { data: periods = [] } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("periods").select("*").order("year", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

  const { data: objectives = [] } = useQuery({
    queryKey: ["update-objectives", selectedPeriodId, role, teamId],
    queryFn: async () => {
      if (!selectedPeriodId) return [];
      let q = supabase.from("objectives").select("*, teams(name)").eq("period_id", selectedPeriodId).order("created_at");
      // Operators only see tactical objectives for their team
      if (role === "operator" && teamId) {
        q = q.eq("type", "tatico").eq("team_id", teamId);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPeriodId,
  });

  const selectedObjective = objectives.find((o) => o.id === selectedObjectiveId);

  const { data: keyResults = [] } = useQuery({
    queryKey: ["key-results", selectedObjectiveId],
    queryFn: async () => {
      if (!selectedObjectiveId) return [];
      const { data, error } = await supabase
        .from("key_results")
        .select("*, teams(name)")
        .eq("objective_id", selectedObjectiveId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedObjectiveId,
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

  const { data: userProfile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const canEdit = selectedPeriod?.is_open ?? false;

  const canEditKR = (kr: any) => {
    if (!canEdit) return false;
    if (role === "admin") return true;
    return role === "operator" && kr.team_id === teamId;
  };

  // Determine if selected objective is strategic (admin creating strategic KRs)
  const isStrategicObj = selectedObjective?.type === "estrategico";

  const createKR = useMutation({
    mutationFn: async () => {
      const effectiveTeamId = isStrategicObj ? null : (role === "admin" ? krTeamId : teamId);
      
      const krData = {
        objective_id: selectedObjectiveId,
        title: krTitle,
        target_value: parseFloat(krTarget),
        unit_type: krUnit,
        team_id: effectiveTeamId,
        created_by: user?.id,
        measurement_method: krMeasurement || null,
        data_source: krDataSource || null,
        update_frequency: krFrequency,
        base_value: krBaseValue ? parseFloat(krBaseValue) : 0,
      };

      const { data: newKr, error } = await supabase.from("key_results").insert(krData).select().single();
      if (error) throw error;

      // If admin is on strategic obj and "create for all areas" is checked
      if (isStrategicObj && createForAll && role === "admin") {
        // Find all tactical objectives that are children of this strategic objective
        const { data: tacticalObjs } = await supabase
          .from("objectives")
          .select("id, team_id")
          .eq("parent_objective_id", selectedObjectiveId);

        if (tacticalObjs && tacticalObjs.length > 0) {
          const inserts = tacticalObjs.map((to) => ({
            objective_id: to.id,
            title: krTitle,
            target_value: parseFloat(krTarget),
            unit_type: krUnit,
            team_id: to.team_id,
            created_by: user?.id,
            measurement_method: krMeasurement || null,
            data_source: krDataSource || null,
            update_frequency: krFrequency,
            base_value: krBaseValue ? parseFloat(krBaseValue) : 0,
            parent_kr_id: newKr.id,
          }));
          const { error: insertError } = await supabase.from("key_results").insert(inserts);
          if (insertError) throw insertError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["key-results"] });
      setKrTitle("");
      setKrTarget("");
      setKrMeasurement("");
      setKrDataSource("");
      setKrFrequency("mensal");
      setKrBaseValue("");
      setCreateForAll(false);
      toast.success(createForAll ? "KR criado para todas as áreas!" : "Resultado-chave criado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateKR = useMutation({
    mutationFn: async () => {
      const kr = keyResults.find((k) => k.id === updateKrId);
      if (!kr) throw new Error("KR não encontrado");

      const inputVal = parseFloat(updateValue);
      const isPercentage = kr.unit_type === "percentage";
      const newCurrentValue = isPercentage ? inputVal : kr.current_value + inputVal;
      const description = isPercentage
        ? `Novo alcance definido em ${inputVal}%`
        : `Adicionado ${inputVal} à meta`;

      await supabase.from("kr_history").insert({
        key_result_id: updateKrId,
        previous_value: kr.current_value,
        new_value: newCurrentValue,
        description,
        created_by: user?.id,
        month: updateMonth || null,
      });

      const { error } = await supabase
        .from("key_results")
        .update({ current_value: newCurrentValue })
        .eq("id", updateKrId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["key-results"] });
      queryClient.invalidateQueries({ queryKey: ["kr-history"] });
      setUpdateKrId("");
      setUpdateValue("");
      setUpdateMonth("");
      toast.success("Valor atualizado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editKRMutation = useMutation({
    mutationFn: async () => {
      if (!editKrId) return;
      const { error } = await supabase.from("key_results").update({
        title: editKrTitle,
        target_value: parseFloat(editKrTarget),
        measurement_method: editKrMeasurement || null,
        data_source: editKrDataSource || null,
        update_frequency: editKrFrequency,
        base_value: editKrBaseValue ? parseFloat(editKrBaseValue) : 0,
      }).eq("id", editKrId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["key-results"] });
      setEditKrId(null);
      toast.success("KR atualizado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteKR = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("key_results").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["key-results"] });
      toast.success("KR excluído!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteHistory = useMutation({
    mutationFn: async (entry: any) => {
      // Revert the KR value
      const kr = keyResults.find((k) => k.id === entry.key_result_id);
      if (kr) {
        const isPercentage = kr.unit_type === "percentage";
        const revertedValue = isPercentage ? entry.previous_value : kr.current_value - (entry.new_value - entry.previous_value);
        await supabase.from("key_results").update({ current_value: revertedValue }).eq("id", entry.key_result_id);
      }
      const { error } = await supabase.from("kr_history").delete().eq("id", entry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["key-results"] });
      queryClient.invalidateQueries({ queryKey: ["kr-history"] });
      toast.success("Entrada removida e valor revertido!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateHistory = useMutation({
    mutationFn: async () => {
      if (!editHistoryId) return;
      const entry = history.find((h: any) => h.id === editHistoryId);
      if (!entry) return;
      const kr = keyResults.find((k) => k.id === (entry as any).key_result_id);
      if (!kr) return;

      const newVal = parseFloat(editHistoryValue);
      const isPercentage = kr.unit_type === "percentage";
      const oldDiff = (entry as any).new_value - (entry as any).previous_value;
      const newNewValue = isPercentage ? newVal : (entry as any).previous_value + newVal;

      await supabase.from("kr_history").update({
        new_value: newNewValue,
        month: editHistoryMonth || null,
        description: isPercentage ? `Novo alcance definido em ${newVal}%` : `Adicionado ${newVal} à meta`,
      }).eq("id", editHistoryId);

      // Recalculate KR current value
      if (!isPercentage) {
        const newCurrent = kr.current_value - oldDiff + (newNewValue - (entry as any).previous_value);
        await supabase.from("key_results").update({ current_value: newCurrent }).eq("id", kr.id);
      } else {
        await supabase.from("key_results").update({ current_value: newNewValue }).eq("id", kr.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["key-results"] });
      queryClient.invalidateQueries({ queryKey: ["kr-history"] });
      setEditHistoryId(null);
      toast.success("Histórico atualizado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const exportHistory = async () => {
    // Get all KRs for current objective with history
    const { data: allKrs } = await supabase
      .from("key_results")
      .select("*, teams(name)")
      .eq("objective_id", selectedObjectiveId);

    if (!allKrs || allKrs.length === 0) return;

    const krIds = allKrs.map((kr) => kr.id);
    const { data: allHistory } = await supabase
      .from("kr_history")
      .select("*")
      .in("key_result_id", krIds)
      .order("created_at", { ascending: false });

    if (!allHistory || allHistory.length === 0) {
      toast.error("Nenhum histórico para exportar");
      return;
    }

    const headers = ["Objetivo", "Resultado-chave", "Meta", "Data", "Valor adicionado", "Como é mensurado", "Fonte da informação", "Frequência de atualização", "Valor base"];
    const rows = allHistory.map((h: any) => {
      const kr = allKrs.find((k) => k.id === h.key_result_id);
      const diff = (h.new_value - h.previous_value);
      const dateStr = formatBrazilianDate(h.created_at);
      return [
        selectedObjective?.title ?? "",
        kr?.title ?? "",
        kr?.target_value ?? "",
        dateStr,
        kr?.unit_type === "percentage" ? `${h.new_value}%` : diff,
        (kr as any)?.measurement_method ?? "",
        (kr as any)?.data_source ?? "",
        (kr as any)?.update_frequency ?? "",
        (kr as any)?.base_value ?? 0,
      ];
    });

    const csv = [headers, ...rows].map((r) => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historico_${selectedObjective?.title?.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatBrazilianDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const selectedKr = keyResults.find((k) => k.id === updateKrId);

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Atualizar Dados</h2>

      {/* Period & Objective selectors */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={selectedPeriodId} onValueChange={(v) => { setSelectedPeriodId(v); setSelectedObjectiveId(""); setMode("choose"); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Ano" /></SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.year} {p.is_open ? "🟢" : "🔴"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedObjectiveId} onValueChange={(v) => { setSelectedObjectiveId(v); setMode("choose"); }} disabled={!selectedPeriodId}>
          <SelectTrigger className="w-72"><SelectValue placeholder="Objetivo" /></SelectTrigger>
          <SelectContent>
            {objectives.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.type === "estrategico" ? "🎯 " : "📋 "}{o.title}
                {(o as any).teams?.name ? ` (${(o as any).teams.name})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!canEdit && selectedPeriodId && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm mb-4">
          Este período está fechado. Não é possível criar, editar ou excluir dados.
        </div>
      )}

      {/* Mode selection: Create or Update buttons */}
      {selectedObjectiveId && canEdit && mode === "choose" && (
        <div className="flex gap-3 mb-6">
          <Button onClick={() => setMode("update")} variant="outline" className="flex-1 h-20 flex-col gap-1">
            <RefreshCw className="h-5 w-5" />
            <span className="text-sm font-medium">Atualizar Resultado-Chave</span>
          </Button>
          <Button onClick={() => setMode("create")} variant="outline" className="flex-1 h-20 flex-col gap-1">
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Criar Resultado-Chave</span>
          </Button>
        </div>
      )}

      {/* Back button */}
      {selectedObjectiveId && canEdit && mode !== "choose" && (
        <Button variant="ghost" size="sm" onClick={() => setMode("choose")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      )}

      {/* Create KR form */}
      {selectedObjectiveId && canEdit && mode === "create" && (
        <div className="glass-card rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-3">Novo Resultado-Chave</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label>Título</Label>
              <Input value={krTitle} onChange={(e) => setKrTitle(e.target.value)} placeholder="Descrição do resultado-chave" />
            </div>
            <div className="space-y-1">
              <Label>Meta</Label>
              <Input type="number" value={krTarget} onChange={(e) => setKrTarget(e.target.value)} placeholder="Valor alvo" />
            </div>
            <div className="space-y-1">
              <Label>Tipo de medida</Label>
              <Select value={krUnit} onValueChange={(v) => setKrUnit(v as UnitType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="absolute">Número absoluto</SelectItem>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Como é mensurado</Label>
              <Input value={krMeasurement} onChange={(e) => setKrMeasurement(e.target.value)} placeholder="Ex: Contagem de experiências realizadas" />
            </div>
            <div className="space-y-1">
              <Label>Fonte da informação</Label>
              <Input value={krDataSource} onChange={(e) => setKrDataSource(e.target.value)} placeholder="Ex: Sistema interno" />
            </div>
            <div className="space-y-1">
              <Label>Frequência de atualização</Label>
              <Select value={krFrequency} onValueChange={setKrFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Valor base</Label>
              <Input type="number" value={krBaseValue} onChange={(e) => setKrBaseValue(e.target.value)} placeholder="0" />
            </div>
            {role === "admin" && !isStrategicObj && (
              <div className="space-y-1">
                <Label>Equipe</Label>
                <Select value={krTeamId} onValueChange={setKrTeamId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {role === "admin" && isStrategicObj && (
              <div className="flex items-center gap-2 sm:col-span-2 pt-2">
                <Switch checked={createForAll} onCheckedChange={setCreateForAll} />
                <Label className="cursor-pointer">Criar para todas as áreas (como tático)</Label>
              </div>
            )}
          </div>
          <Button
            className="mt-4"
            onClick={() => createKR.mutate()}
            disabled={!krTitle.trim() || !krTarget || createKR.isPending}
          >
            <Plus className="h-4 w-4 mr-1" /> Criar KR
          </Button>
        </div>
      )}

      {/* Update existing KR */}
      {selectedObjectiveId && canEdit && mode === "update" && keyResults.length > 0 && (
        <div className="glass-card rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-3">Atualizar Resultado-Chave</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Resultado-Chave</Label>
              <Select value={updateKrId} onValueChange={setUpdateKrId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {keyResults.filter((kr) => canEditKR(kr)).map((kr) => (
                    <SelectItem key={kr.id} value={kr.id}>{kr.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{selectedKr?.unit_type === "percentage" ? "Novo percentual alcançado (%)" : "Valor a adicionar"}</Label>
              <Input type="number" value={updateValue} onChange={(e) => setUpdateValue(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Mês de referência</Label>
              <Select value={updateMonth} onValueChange={setUpdateMonth}>
                <SelectTrigger><SelectValue placeholder="Selecione o mês" /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() => updateKR.mutate()}
            disabled={!updateKrId || !updateValue || !updateMonth || updateKR.isPending}
          >
            Atualizar valor
          </Button>
        </div>
      )}

      {/* List KRs with export */}
      {selectedObjectiveId && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm">Resultados-chave</h3>
            <Button variant="outline" size="sm" onClick={exportHistory}>
              <Download className="h-4 w-4 mr-1" /> Exportar histórico
            </Button>
          </div>
          <div className="space-y-2">
            {keyResults.map((kr) => (
              <div key={kr.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => { setHistoryKrId(kr.id); setHistoryKrTitle(kr.title); }}
                  >
                    <p className="font-medium text-foreground text-sm">{kr.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{(kr as any).teams?.name ?? "Global"}</span>
                      <span className="text-xs font-medium">
                        {kr.current_value}{kr.unit_type === "percentage" ? "%" : ""} / {kr.target_value}{kr.unit_type === "percentage" ? "%" : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">({kr.unit_type === "percentage" ? "Percentual" : "Absoluto"})</span>
                      {(kr as any).measurement_method && (
                        <span className="text-xs text-muted-foreground">· {(kr as any).measurement_method}</span>
                      )}
                    </div>
                  </div>
                  {canEditKR(kr) && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditKrId(kr.id);
                        setEditKrTitle(kr.title);
                        setEditKrTarget(String(kr.target_value));
                        setEditKrMeasurement((kr as any).measurement_method ?? "");
                        setEditKrDataSource((kr as any).data_source ?? "");
                        setEditKrFrequency((kr as any).update_frequency ?? "mensal");
                        setEditKrBaseValue(String((kr as any).base_value ?? 0));
                      }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteKR.mutate(kr.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {/* Progress bar */}
                <div className="mt-2">
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-secondary transition-all"
                      style={{ width: `${Math.min((kr.current_value / kr.target_value) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit KR Dialog */}
      <Dialog open={!!editKrId} onOpenChange={() => setEditKrId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Resultado-Chave</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Título</Label>
              <Input value={editKrTitle} onChange={(e) => setEditKrTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Meta</Label>
              <Input type="number" value={editKrTarget} onChange={(e) => setEditKrTarget(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Como é mensurado</Label>
              <Input value={editKrMeasurement} onChange={(e) => setEditKrMeasurement(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Fonte da informação</Label>
              <Input value={editKrDataSource} onChange={(e) => setEditKrDataSource(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Frequência de atualização</Label>
              <Select value={editKrFrequency} onValueChange={setEditKrFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Valor base</Label>
              <Input type="number" value={editKrBaseValue} onChange={(e) => setEditKrBaseValue(e.target.value)} />
            </div>
            <Button onClick={() => editKRMutation.mutate()} disabled={!editKrTitle.trim() || editKRMutation.isPending}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatBrazilianDate(h.created_at)}
                      {h.month && ` · Ref: ${h.month}`}
                    </p>
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => {
                          setEditHistoryId(h.id);
                          const kr = keyResults.find((k) => k.id === h.key_result_id);
                          const diff = h.new_value - h.previous_value;
                          setEditHistoryValue(String(kr?.unit_type === "percentage" ? h.new_value : diff));
                          setEditHistoryMonth(h.month ?? "");
                        }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => deleteHistory.mutate(h)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">{h.description}</p>
                  <p className="text-xs text-muted-foreground">{h.previous_value} → {h.new_value}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit History Entry Dialog */}
      <Dialog open={!!editHistoryId} onOpenChange={() => setEditHistoryId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar entrada</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Valor</Label>
              <Input type="number" value={editHistoryValue} onChange={(e) => setEditHistoryValue(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Mês de referência</Label>
              <Select value={editHistoryMonth} onValueChange={setEditHistoryMonth}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => updateHistory.mutate()} disabled={!editHistoryValue || updateHistory.isPending}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
