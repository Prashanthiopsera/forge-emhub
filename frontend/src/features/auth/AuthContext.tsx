import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { getRoleFromSession } from '@/features/auth/jwt';
import type { AuthContextValue } from '@/features/auth/types';
import { getSupabase } from '@/lib/supabase';

const AuthContext = createContext<AuthContextValue | null>(null);

function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(typeof err === 'string' ? err : 'Authentication failed');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const finishLoading = () => {
      if (!cancelled) setLoading(false);
    };

    let supabase;
    try {
      supabase = getSupabase();
    } catch (err) {
      console.error('[auth] Supabase client not configured', err);
      finishLoading();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      console.warn(
        '[auth] Session check timed out. Is Docker running? Try: npm run supabase:status',
      );
      finishLoading();
    }, 8_000);

    void supabase.auth
      .getSession()
      .then(({ data: { session: initial } }) => {
        if (!cancelled) setSession(initial);
      })
      .catch((err) => {
        console.error('[auth] getSession failed', err);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        finishLoading();
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!cancelled) setSession(nextSession);
      finishLoading();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    return { error: error ? toError(error) : null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    return { error: error ? toError(error) : null };
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    setSession(null);
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? toError(error) : null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await getSupabase().auth.updateUser({ password });
    return { error: error ? toError(error) : null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      role: getRoleFromSession(session),
      loading,
      signIn,
      signUp,
      signOut,
      resetPasswordForEmail,
      updatePassword,
    }),
    [session, loading, signIn, signUp, signOut, resetPasswordForEmail, updatePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
