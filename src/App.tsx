import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import Login from "@/pages/Login";
import Setup from "@/pages/Setup";
import Dashboard from "@/pages/Dashboard";
import Update from "@/pages/Update";
import Periods from "@/pages/admin/Periods";
import Teams from "@/pages/admin/Teams";
import ObjectivesAdmin from "@/pages/admin/Objectives";
import UsersAdmin from "@/pages/admin/Users";
import NotFound from "@/pages/NotFound";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function AppRoutes() {
  const { session, role, loading } = useAuth();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.rpc("admin_exists").then(({ data }) => {
      setAdminExists(data ?? false);
    });
  }, [session]);

  if (loading || adminExists === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  // No admin yet → show setup
  if (!adminExists && !session) {
    return (
      <Routes>
        <Route path="*" element={<Setup />} />
      </Routes>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // No role assigned yet (waiting for admin to assign)
  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foreground font-semibold">Aguardando atribuição de acesso</p>
          <p className="text-sm text-muted-foreground mt-1">Peça ao administrador para definir seu perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/atualizar" element={<Update />} />
        {role === "admin" && (
          <>
            <Route path="/admin/periodos" element={<Periods />} />
            <Route path="/admin/equipes" element={<Teams />} />
            <Route path="/admin/objetivos" element={<ObjectivesAdmin />} />
            <Route path="/admin/usuarios" element={<UsersAdmin />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
