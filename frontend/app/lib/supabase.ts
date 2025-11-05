import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wbbuuyblsiqvorirydie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiYnV1eWJsc2lxdm9yaXJ5ZGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTQ0NTcsImV4cCI6MjA3NjYzMDQ1N30.oBXylVRZOSIje51PQoPHk-KY9XPUuYJeJjAZ7XfwCp0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
