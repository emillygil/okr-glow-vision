import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Target } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type OkrType = Database["public"]["Enums"]["okr_type"];

export default function ObjectivesAdmin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<OkrType>("estrategico");
  const [periodId, setPeriodId] = useState("");

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
      let q = supabase.from("objectives").select("*, periods(year), key_results(id)").order("created_at");
      if (periodId) q = q.eq("period_id", periodId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const createObj = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("objectives").insert({
        title,
        type,
        period_id: periodId,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      setTitle("");
      toast.success("Objetivo criado!");
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

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Gerenciar Objetivos</h2>

      <div className="glass-card rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-3">Novo Objetivo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1 sm:col-span-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Descrição do objetivo" />
          </div>
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as OkrType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="estrategico">Estratégico</SelectItem>
                <SelectItem value="tatico">Tático</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Período</Label>
            <Select value={periodId} onValueChange={setPeriodId}>
              <SelectTrigger><SelectValue placeholder="Selecione o ano" /></SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
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

      <div className="mb-4">
        <Select value={periodId} onValueChange={setPeriodId}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filtrar por ano" /></SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {objectives.map((o) => (
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
                    <span className="text-xs text-muted-foreground">
                      {(o as any).periods?.year} · {(o as any).key_results?.length ?? 0} KRs
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteObj.mutate(o.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
