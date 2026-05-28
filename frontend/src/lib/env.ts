const REQUIRED_ENV_KEYS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const;

export type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

export function getRequiredEnv(key: RequiredEnvKey): string {
  const value = import.meta.env[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}. Copy frontend/.env.example to frontend/.env.local.`,
    );
  }
  return value;
}

export function validateSupabaseEnv(): void {
  for (const key of REQUIRED_ENV_KEYS) {
    getRequiredEnv(key);
  }
}
