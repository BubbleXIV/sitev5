// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Regular client for public operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)

// Admin client for admin operations (server-side only)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to get the appropriate client
export const getSupabaseClient = (isAdmin = false) => {
  return isAdmin ? supabaseAdmin : supabase
}
