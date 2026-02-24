// src/shared/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://uxkybljoxtxnsnsrblfu.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4a3libGpveHR4bnNuc3JibGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTIxNDQsImV4cCI6MjA4NTQyODE0NH0.6PxDCYIMzmUwqxZlRzfSBC1v_1cgutSupUIzaD2E5EE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)