// Supabase configuration
const SUPABASE_URL = 'https://qnvzfvmyktkjoylttsuv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudnpmdm10eWtqam95bHR0c3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjM4NDYsImV4cCI6MjA5MTM5OTg0Nn0.0Vys7XqpXm8gr5-6b1TyAL7G0KDxgSXfyptOVXaNgZk';

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
