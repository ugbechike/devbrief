
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are available
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
        url: supabaseUrl ? '✅' : '❌',
        key: supabaseKey ? '✅' : '❌'
    })
}

const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key'
)

const supabaseAdmin = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export default supabase
export { supabaseAdmin }