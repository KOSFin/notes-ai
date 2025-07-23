import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mhnxfpxeflisbrfiwujy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obnhmcHhlZmxpc2JyZml3dWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNjY5MjcsImV4cCI6MjA2Nzg0MjkyN30.WByqGYmGzfGKzjPNN235zWb5aT8F8UhVXBUsjQkrqXE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)