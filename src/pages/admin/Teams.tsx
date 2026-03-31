import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export default function Teams() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("teams").insert({ name });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setNewName("");
      toast.success("Equipe criada!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteTeam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Equipe excluída!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Gerenciar Equipes</h2>
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Nome da equipe"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-64"
        />
        <Button
          onClick={() => newName.trim() && createTeam.mutate(newName.trim())}
          disabled={!newName.trim() || createTeam.isPending}
        >
          <Plus className="h-4 w-4 mr-1" /> Criar
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {teams.map((t) => (
            <div key={t.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <span className="font-medium text-foreground">{t.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteTeam.mutate(t.id)}
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
