import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  const isDev = process.env.DEV_BYPASS_AUTH === 'true';

  if (isDev) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('DEV_BYPASS_AUTH is true but SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
    }

    // Service role client bypasses RLS entirely — safe for local dev only
    const client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
    );

    const devUser = {
      id: process.env.DEV_USER_ID!,
      email: process.env.DEV_USER_EMAIL ?? 'dev@local.test',
    };
    client.auth.getUser = async () => ({
      data: { user: devUser as any },
      error: null,
    });

    return client;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component — can be ignored if middleware handles session refresh
          }
        },
      },
    },
  );
}
