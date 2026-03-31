import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type UnitType = Database["public"]["Enums"]["unit_type"];

export default function Update() {
  const queryClient = useQueryClient();
  const { user, role, teamId } = useAuth();

  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [selectedObjectiveId, setSelectedObjectiveId] = useState("");

  // New KR form
  const [krTitle, setKrTitle] = useState("");
  const [krTarget, setKrTarget] = useState("");
  const [krUnit, setKrUnit] = useState<UnitType>("absolute");
  const [krTeamId, setKrTeamId] = useState(teamId ?? "");

  // Update KR form
  const [updateKrId, setUpdateKrId] = useState("");
  const [updateValue, setUpdateValue] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");

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
    queryKey: ["objectives", selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return [];
      const { data, error } = await supabase
        .from("objectives")
        .select("*")
        .eq("period_id", selectedPeriodId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPeriodId,
  });

  const { data: keyResults = [] } = useQuery({
    queryKey: ["key-results", selectedObjectiveId],
    queryFn: async () => {
      if (!selectedObjectiveId) return [];
      let q = supabase
        .from("key_results")
        .select("*, teams(name)")
        .eq("objective_id", selectedObjectiveId)
        .order("created_at");
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedObjectiveId,
  });

  const canEdit = selectedPeriod?.is_open ?? false;

  const createKR = useMutation({
    mutationFn: async () => {
      const effectiveTeamId = role === "admin" ? krTeamId : teamId;
      const { error } = await supabase.from("key_results").insert({
        objective_id: selectedObjectiveId,
        title: krTitle,
        target_value: parseFloat(krTarget),
        unit_type: krUnit,
        team_id: effectiveTeamId,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["key-results"] });
      setKrTitle("");
      setKrTarget("");
      toast.success("Resultado-chave criado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateKR = useMutation({
    mutationFn: async () => {
      const kr = keyResults.find((k) => k.id === updateKrId);
      if (!kr) throw new Error("KR não encontrado");

      const newVal = parseFloat(updateValue);

      // Insert history
      await supabase.from("kr_history").insert({
        key_result_id: updateKrId,
        previous_value: kr.current_value,
        new_value: newVal,
        description: updateDescription || null,
        created_by: user?.id,
      });

      // Update current value
      const { error } = await supabase
        .from("key_results")
        .update({ current_value: newVal })
        .eq("id", updateKrId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["key-results"] });
      setUpdateKrId("");
      setUpdateValue("");
      setUpdateDescription("");
      toast.success("Valor atualizado!");
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

  const canEditKR = (kr: any) => {
    if (!canEdit) return false;
    if (role === "admin") return true;
    return role === "operator" && kr.team_id === teamId;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Atualizar Dados</h2>

      {/* Period & Objective selectors */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={selectedPeriodId} onValueChange={(v) => { setSelectedPeriodId(v); setSelectedObjectiveId(""); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Ano" /></SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.year} {p.is_open ? "🟢" : "🔴"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedObjectiveId} onValueChange={setSelectedObjectiveId} disabled={!selectedPeriodId}>
          <SelectTrigger className="w-72"><SelectValue placeholder="Objetivo" /></SelectTrigger>
          <SelectContent>
            {objectives.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!canEdit && selectedPeriodId && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm mb-4">
          Este período está fechado. Não é possível criar, editar ou excluir dados.
        </div>
      )}

      {selectedObjectiveId && canEdit && (
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
            {role === "admin" && (
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
      {selectedObjectiveId && canEdit && keyResults.length > 0 && (
        <div className="glass-card rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-3">Atualizar Resultado-Chave</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <Label>Novo valor</Label>
              <Input type="number" value={updateValue} onChange={(e) => setUpdateValue(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Descrição da movimentação</Label>
              <Textarea
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
                placeholder="Ex: Foram inseridas 10 experiências na meta X"
              />
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() => updateKR.mutate()}
            disabled={!updateKrId || !updateValue || updateKR.isPending}
          >
            Atualizar valor
          </Button>
        </div>
      )}

      {/* List KRs */}
      {selectedObjectiveId && (
        <div className="space-y-2">
          {keyResults.map((kr) => (
            <div key={kr.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">{kr.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {(kr as any).teams?.name ?? "Sem equipe"}
                  </span>
                  <span className="text-xs font-medium">
                    {kr.current_value}{kr.unit_type === "percentage" ? "%" : ""} / {kr.target_value}{kr.unit_type === "percentage" ? "%" : ""}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({kr.unit_type === "percentage" ? "Percentual" : "Absoluto"})
                  </span>
                </div>
              </div>
              {canEditKR(kr) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteKR.mutate(kr.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
