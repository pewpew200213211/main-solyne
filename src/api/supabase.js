import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sjoifbcymwkxktyvelid.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqb2lmYmN5bXdreGt0eXZlbGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTk3MDMsImV4cCI6MjA5MDg3NTcwM30.ieEwR--geQ0WL9yVZA4q5Zg9zrtXC6cd2JCYif29Tvg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
