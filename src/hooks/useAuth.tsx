import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "operator" | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole;
  teamId: string | null;
  hasProfile: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  teamId: null,
  hasProfile: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserMeta = async (userId: string, retries = 6): Promise<{
    role: AppRole;
    teamId: string | null;
    hasProfile: boolean;
  }> => {
    const [{ data: roleData }, { data: profileData }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("team_id").eq("user_id", userId).maybeSingle(),
    ]);

    const resolvedRole = (roleData?.role as AppRole) ?? null;
    const resolvedHasProfile = Boolean(profileData);

    if ((!resolvedRole || !resolvedHasProfile) && retries > 0) {
      await new Promise((r) => setTimeout(r, 500));
      return fetchUserMeta(userId, retries - 1);
    }

    return {
      role: resolvedRole,
      teamId: profileData?.team_id ?? null,
      hasProfile: resolvedHasProfile,
    };
  };

  const syncAuthState = async (nextSession: Session | null) => {
    setLoading(true);
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (!nextSession?.user) {
      setRole(null);
      setTeamId(null);
      setHasProfile(false);
      setLoading(false);
      return;
    }

    const userMeta = await fetchUserMeta(nextSession.user.id);
    setRole(userMeta.role);
    setTeamId(userMeta.teamId);
    setHasProfile(userMeta.hasProfile);
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        await syncAuthState(nextSession);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      void syncAuthState(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
    setTeamId(null);
    setHasProfile(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, teamId, hasProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
