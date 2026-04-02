import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, Check, X } from "lucide-react";

export default function Teams() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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

  const updateTeam = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("teams").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setEditId(null);
      toast.success("Equipe atualizada!");
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
              {editId === t.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-64"
                  />
                  <Button size="sm" onClick={() => editName.trim() && updateTeam.mutate({ id: t.id, name: editName.trim() })} disabled={!editName.trim()}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-foreground">{t.name}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditId(t.id); setEditName(t.name); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTeam.mutate(t.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
