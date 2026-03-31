import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, Settings, Users, Calendar, Target, LogOut, FileEdit } from "lucide-react";
import { Button } from "./ui/button";

function AppNavLink({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
        isActive
          ? "bg-primary-foreground/20 text-primary-foreground"
          : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { role, signOut, user } = useAuth();

  const navItems = [
    { to: "/", icon: <BarChart3 className="h-4 w-4" />, label: "Dashboard" },
    { to: "/atualizar", icon: <FileEdit className="h-4 w-4" />, label: "Atualizar" },
    ...(role === "admin"
      ? [
          { to: "/admin/periodos", icon: <Calendar className="h-4 w-4" />, label: "Períodos" },
          { to: "/admin/equipes", icon: <Users className="h-4 w-4" />, label: "Equipes" },
          { to: "/admin/objetivos", icon: <Target className="h-4 w-4" />, label: "Objetivos" },
          { to: "/admin/usuarios", icon: <Settings className="h-4 w-4" />, label: "Usuários" },
        ]
      : []),
  ];

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
                {navItems.map((item) => (
                  <AppNavLink key={item.to} to={item.to} icon={item.icon}>{item.label}</AppNavLink>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-primary-foreground/70 hidden sm:inline">{user?.email}</span>
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
          <nav className="flex sm:hidden items-center gap-1 mt-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <AppNavLink key={item.to} to={item.to} icon={item.icon}>{item.label}</AppNavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
