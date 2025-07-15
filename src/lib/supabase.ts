import { createClient } from '@supabase/supabase-js'

// Support both naming conventions for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '***' : 'NOT SET');

// Create client with proper error handling
let supabase

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing')
    // Create a dummy client for development/production fallback
    supabase = createClient(
      'https://dummy.supabase.co',
      'dummy-key'
    )
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
} catch (error) {
  console.error('Failed to create Supabase client:', error)
  // Create a dummy client as fallback
  supabase = createClient(
    'https://dummy.supabase.co',
    'dummy-key'
  )
}

export { supabase }

// Server-side client (for server actions)
export const createServerClient = () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables are missing for server client')
      return createClient(
        'https://dummy.supabase.co',
        'dummy-key'
      )
    }
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Failed to create server Supabase client:', error)
    return createClient(
      'https://dummy.supabase.co',
      'dummy-key'
    )
  }
} 