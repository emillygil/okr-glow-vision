import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return json({ error: "Configuração interna indisponível." }, 500);
  }

  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return json({ error: "Não autorizado." }, 401);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let createdUserId: string | null = null;

  try {
    const { data: authData, error: authError } = await userClient.auth.getUser();

    if (authError || !authData.user) {
      return json({ error: "Não autorizado." }, 401);
    }

    const { data: callerRole, error: callerRoleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (callerRoleError || callerRole?.role !== "admin") {
      return json({ error: "Apenas administradores podem criar usuários." }, 403);
    }

    const { email, password, fullName, role, teamId } = await req.json();

    if (!email || !password || !fullName || !role) {
      return json({ error: "Preencha os campos obrigatórios." }, 400);
    }

    if (!["admin", "operator"].includes(role)) {
      return json({ error: "Perfil inválido." }, 400);
    }

    const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (createUserError || !createdUser.user) {
      throw createUserError ?? new Error("Não foi possível criar o usuário.");
    }

    createdUserId = createdUser.user.id;

    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(
        {
          user_id: createdUser.user.id,
          full_name: fullName,
          email,
          team_id: role === "operator" ? teamId ?? null : null,
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      throw profileError;
    }

    const { error: deleteRoleError } = await adminClient.from("user_roles").delete().eq("user_id", createdUser.user.id);

    if (deleteRoleError) {
      throw deleteRoleError;
    }

    const { error: insertRoleError } = await adminClient.from("user_roles").insert({
      user_id: createdUser.user.id,
      role,
    });

    if (insertRoleError) {
      throw insertRoleError;
    }

    return json({ userId: createdUser.user.id });
  } catch (error) {
    if (createdUserId) {
      await adminClient.auth.admin.deleteUser(createdUserId);
    }

    return json(
      {
        error: error instanceof Error ? error.message : "Erro inesperado ao criar usuário.",
      },
      500,
    );
  }
});