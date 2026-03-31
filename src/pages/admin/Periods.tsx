import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Unlock, Trash2, Plus } from "lucide-react";

export default function Periods() {
  const queryClient = useQueryClient();
  const [newYear, setNewYear] = useState("");

  const { data: periods = [], isLoading } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("periods").select("*").order("year", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createPeriod = useMutation({
    mutationFn: async (year: number) => {
      const { error } = await supabase.from("periods").insert({ year });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      setNewYear("");
      toast.success("Período criado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePeriod = useMutation({
    mutationFn: async ({ id, is_open }: { id: string; is_open: boolean }) => {
      const { error } = await supabase.from("periods").update({ is_open }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      toast.success("Período atualizado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deletePeriod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("periods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
      toast.success("Período excluído!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Gerenciar Períodos</h2>
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Ano (ex: 2026)"
          type="number"
          value={newYear}
          onChange={(e) => setNewYear(e.target.value)}
          className="w-40"
        />
        <Button
          onClick={() => newYear && createPeriod.mutate(parseInt(newYear))}
          disabled={!newYear || createPeriod.isPending}
        >
          <Plus className="h-4 w-4 mr-1" /> Criar
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {periods.map((p) => (
            <div key={p.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground">{p.year}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    p.is_open
                      ? "bg-secondary/10 text-secondary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {p.is_open ? "Aberto" : "Fechado"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePeriod.mutate({ id: p.id, is_open: !p.is_open })}
                >
                  {p.is_open ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  {p.is_open ? "Fechar" : "Abrir"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deletePeriod.mutate(p.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
