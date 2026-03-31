import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { NavLink } from "./NavLink";
import { BarChart3, Settings, Users, Calendar, Target, LogOut, FileEdit } from "lucide-react";
import { Button } from "./ui/button";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { role, signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-lg font-extrabold tracking-tight">OKRs</h1>
                <p className="text-primary-foreground/70 text-xs">JA Rio de Janeiro</p>
              </div>
              <nav className="hidden sm:flex items-center gap-1">
                <NavLink to="/" icon={<BarChart3 className="h-4 w-4" />}>Dashboard</NavLink>
                <NavLink to="/atualizar" icon={<FileEdit className="h-4 w-4" />}>Atualizar</NavLink>
                {role === "admin" && (
                  <>
                    <NavLink to="/admin/periodos" icon={<Calendar className="h-4 w-4" />}>Períodos</NavLink>
                    <NavLink to="/admin/equipes" icon={<Users className="h-4 w-4" />}>Equipes</NavLink>
                    <NavLink to="/admin/objetivos" icon={<Target className="h-4 w-4" />}>Objetivos</NavLink>
                    <NavLink to="/admin/usuarios" icon={<Settings className="h-4 w-4" />}>Usuários</NavLink>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-primary-foreground/70 hidden sm:inline">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Mobile nav */}
          <nav className="flex sm:hidden items-center gap-1 mt-2 overflow-x-auto pb-1">
            <NavLink to="/" icon={<BarChart3 className="h-3 w-3" />}>Dashboard</NavLink>
            <NavLink to="/atualizar" icon={<FileEdit className="h-3 w-3" />}>Atualizar</NavLink>
            {role === "admin" && (
              <>
                <NavLink to="/admin/periodos" icon={<Calendar className="h-3 w-3" />}>Períodos</NavLink>
                <NavLink to="/admin/equipes" icon={<Users className="h-3 w-3" />}>Equipes</NavLink>
                <NavLink to="/admin/objetivos" icon={<Target className="h-3 w-3" />}>Objetivos</NavLink>
                <NavLink to="/admin/usuarios" icon={<Settings className="h-3 w-3" />}>Usuários</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
