import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function UsersAdmin() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "operator">("operator");
  const [teamId, setTeamId] = useState<string>("");

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*, user_roles(role), teams(name)")
        .order("full_name");
      if (error) throw error;
      return profiles;
    },
  });

  const createUser = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email,
          password,
          fullName,
          role,
          teamId: role === "operator" ? teamId || null : null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setEmail("");
      setFullName("");
      setPassword("");
      setTeamId("");
      toast.success("Usuário cadastrado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">Gerenciar Usuários</h2>

      <div className="glass-card rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-3">Cadastrar novo usuário</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Nome completo</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Senha</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
          </div>
          <div className="space-y-1">
            <Label>Tipo de acesso</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "operator")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="operator">Operador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Equipe</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="mt-4"
          onClick={() => createUser.mutate()}
          disabled={!email || !fullName || !password || createUser.isPending}
        >
          <Plus className="h-4 w-4 mr-1" /> Cadastrar
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{u.full_name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {(u as any).teams?.name ?? "Sem equipe"}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    (u as any).user_roles?.[0]?.role === "admin"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/10 text-secondary"
                  }`}
                >
                  {(u as any).user_roles?.[0]?.role === "admin" ? "Admin" : "Operador"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
