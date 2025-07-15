import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Support both naming conventions for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '***' : 'NOT SET');

// Create client with proper error handling and typing
let supabase: SupabaseClient

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are missing')
    console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    // In production, we should throw an error instead of creating a dummy client
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Supabase environment variables are not configured')
    }
    
    // Create a dummy client for development only
    supabase = createClient(
      'https://dummy.supabase.co',
      'dummy-key'
    )
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  }
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error)
  
  // In production, we should throw an error
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Failed to initialize Supabase client')
  }
  
  // Create a dummy client as fallback for development only
  supabase = createClient(
    'https://dummy.supabase.co',
    'dummy-key'
  )
}

export { supabase }

// Server-side client (for server actions)
export const createServerClient = (): SupabaseClient => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase environment variables are missing for server client')
      throw new Error('Supabase environment variables are not configured for server client')
    }
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (error) {
    console.error('❌ Failed to create server Supabase client:', error)
    throw new Error('Failed to initialize server Supabase client')
  }
} 