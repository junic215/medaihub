// Supabase configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let supabase = null;

if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && typeof supabase !== 'undefined') {
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Fallback for demo if Supabase is not configured
const isSupabaseConfigured = () => supabase !== null;

window.medai = {
    supabase,
    isConfigured: isSupabaseConfigured
};
