import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iyrkiwwcrawqxojyqnau.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cmtpd3djcmF3cXhvanlxbmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5ODQzNjcsImV4cCI6MjA0MTU2MDM2N30.wu5npRTQsBvyYZs339ga03omdiRi3OaioxibOKdXyCs'
export const supabase = createClient(supabaseUrl, supabaseKey)