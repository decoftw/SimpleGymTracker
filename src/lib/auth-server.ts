import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function getCurrentUserId() {
  // Check if Supabase is configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your_supabase') || key.includes('your_supabase') || !url.startsWith('http')) {
    // Local dev mode
    return 'local-dev-user';
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      throw new Error('No session');
    }
    return session.user.id;
  } catch (error) {
    throw new Error('Unauthorized');
  }
}