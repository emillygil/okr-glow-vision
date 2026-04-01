import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Target, Pencil } from "lucide-react";

export default function ObjectivesAdmin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [filterType, setFilterType] = useState<"todos" | "estrategico" | "tatico">("todos");

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const { data: periods = [] } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("periods").select("*").order("year", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: objectives = [], isLoading } = useQuery({
    queryKey: ["objectives", periodId],
    queryFn: async () => {
      let q = supabase.from("objectives").select("*, periods(year), key_results(id), teams(name)").order("created_at");
      if (periodId) q = q.eq("period_id", periodId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const filteredObjectives = objectives.filter((o) => {
    if (filterType === "estrategico") return o.type === "estrategico";
    if (filterType === "tatico") return o.type === "tatico";
    return true;
  });

  // Admin always creates strategic objectives (tactical are auto-created by trigger)
  const createObj = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("objectives").insert({
        title,
        type: "estrategico" as const,
        period_id: periodId,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      setTitle("");
      toast.success("Objetivo estratégico criado! Cópias táticas foram geradas para todas as áreas.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateObj = useMutation({
    mutationFn: async () => {
      if (!editId) return;
      const { error } = await supabase.from("objectives").update({ title: editTitle }).eq("id", editId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      setEditId(null);
      setEditTitle("");
      toast.success("Objetivo atualizado! Cópias táticas também foram atualizadas.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteObj = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("objectives").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      toast.success("Objetivo excluído!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const selectedPeriod = periods.find((p) => p.id === periodId);
  const canEdit = selectedPeriod?.is_open ?? true;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Gerenciar Objetivos</h2>

      {canEdit && (
        <div className="glass-card rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-1">Novo Objetivo Estratégico</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Objetivos táticos serão criados automaticamente para todas as áreas cadastradas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label>Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Assegurar a saúde financeira" />
            </div>
            <div className="space-y-1">
              <Label>Período</Label>
              <Select value={periodId} onValueChange={setPeriodId}>
                <SelectTrigger><SelectValue placeholder="Selecione o ano" /></SelectTrigger>
                <SelectContent>
                  {periods.filter((p) => p.is_open).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() => createObj.mutate()}
            disabled={!title.trim() || !periodId || createObj.isPending}
          >
            <Plus className="h-4 w-4 mr-1" /> Criar Objetivo
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={periodId} onValueChange={setPeriodId}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filtrar por ano" /></SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.year} {p.is_open ? "🟢" : "🔴"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(["todos", "estrategico", "tatico"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterType === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "todos" ? "Todos" : t === "estrategico" ? "Estratégicos" : "Táticos"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {filteredObjectives.map((o) => (
            <div key={o.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">{o.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      o.type === "estrategico" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                    }`}>
                      {o.type === "estrategico" ? "Estratégico" : "Tático"}
                    </span>
                    {(o as any).teams?.name && (
                      <span className="text-xs text-muted-foreground">{(o as any).teams.name}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {(o as any).periods?.year} · {(o as any).key_results?.length ?? 0} KRs
                    </span>
                  </div>
                </div>
              </div>
              {o.type === "estrategico" && canEdit && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditId(o.id); setEditTitle(o.title); }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteObj.mutate(o.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Objetivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Título</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <Button onClick={() => updateObj.mutate()} disabled={!editTitle.trim() || updateObj.isPending}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
