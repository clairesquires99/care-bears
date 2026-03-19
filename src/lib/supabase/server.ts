import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
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

  if (process.env.DEV_BYPASS_AUTH === 'true') {
    const devUser = {
      id: process.env.DEV_USER_ID,
      email: process.env.DEV_USER_EMAIL ?? "dev@local.test",
    };
    client.auth.getUser = async () => ({
      data: { user: devUser as any },
      error: null,
    });
  }

  return client;
}
