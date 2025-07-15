import { createClient } from '@supabase/supabase-js'

// Support both naming conventions for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '***' : 'NOT SET');

// Only throw error in development, in production we'll handle it gracefully
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Supabase environment variables are not properly configured. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_URL and SUPABASE_ANON_KEY.')
  } else {
    console.error('Supabase environment variables are missing in production')
  }
}

// Create client with fallback values for production
export const supabase = createClient(
  supabaseUrl || 'https://fallback.supabase.co',
  supabaseAnonKey || 'fallback-key'
)

// Server-side client (for server actions)
export const createServerClient = () => {
  return createClient(
    supabaseUrl || 'https://fallback.supabase.co',
    supabaseAnonKey || 'fallback-key'
  )
} 