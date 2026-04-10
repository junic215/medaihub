// Supabase configuration
const SUPABASE_URL = 'https://qnvzfvmyktkjoylttsuv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudnpmdm10eWtqam95bHR0c3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjM4NDYsImV4cCI6MjA5MTM5OTg0Nn0.0Vys7XqpXm8gr5-6b1TyAL7G0KDxgSXfyptOVXaNgZk';

let _supabaseClient = null;

try {
    if (typeof supabase !== 'undefined' && SUPABASE_URL.startsWith('http')) {
        _supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.error('Supabase initialization error:', e);
}

window.medai = {
    client: _supabaseClient,
    isConfigured: () => _supabaseClient !== null
};
