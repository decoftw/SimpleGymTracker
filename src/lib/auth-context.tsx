'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLocalDev?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if Supabase is properly configured
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;
  if (url.includes('your_supabase') || key.includes('your_supabase')) return false;
  if (!url.startsWith('http')) return false;

  return true;
}

// Mock user for local development
const MOCK_LOCAL_USER: User = {
  id: 'local-dev-user',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'dev@localhost',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { name: 'Local Dev User' },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLocalDevMode = !isSupabaseConfigured();

  const supabase = useMemo(() => {
    if (isLocalDevMode) {
      return null;
    }
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, [isLocalDevMode]);

  useEffect(() => {
    if (isLocalDevMode) {
      // In local dev mode, auto-authenticate with mock user
      setUser(MOCK_LOCAL_USER);
      setSession(null);
      setIsLoading(false);
      console.log('Local development mode: Using mock authentication');
      return;
    }

    // Check if user is logged in
    const getSession = async () => {
      try {
        const sessionPromise = supabase!.auth.getSession();
        // Set a 3-second timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session fetch timeout')), 3000)
        );

        const {
          data: { session },
        } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
        // Continue even if session fetch fails
      }
    };

    getSession();

    // Subscribe to auth changes
    try {
      const {
        data: { subscription },
      } = supabase!.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      });

      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      return undefined;
    }
  }, [supabase, isLocalDevMode]);

  const login = async (email: string, password: string) => {
    if (isLocalDevMode) {
      // In local dev mode, just set the mock user
      setUser(MOCK_LOCAL_USER);
      return;
    }
    const { error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signup = async (email: string, password: string) => {
    if (isLocalDevMode) {
      // In local dev mode, just set the mock user
      setUser(MOCK_LOCAL_USER);
      return;
    }
    const { error, data } = await supabase!.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // Create user profile
    if (data.user) {
      const { error: profileError } = await (supabase!.from('user_profiles') as any).insert({
        id: data.user.id,
        email: data.user.email!,
      });
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't throw, as signup succeeded
      }
    }
  };

  const logout = async () => {
    if (isLocalDevMode) {
      // In local dev mode, just clear the user
      setUser(null);
      return;
    }
    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        login,
        signup,
        logout,
        isLocalDev: isLocalDevMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
