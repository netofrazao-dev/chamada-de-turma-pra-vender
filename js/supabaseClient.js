import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


// Preencha essas constantes com os valores do seu projeto Supabase
const SUPABASE_URL = "https://dwubwlesfqxwcdvsijmw.supabase.co"; // sem a barra final, de preferência
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dWJ3bGVzZnF4d2NkdnNpam13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjQ3MTMsImV4cCI6MjA4OTAwMDcxM30.Ae30TETg7gra5nwAVnBG3Bey3v3_EQ1fptgO3Ig4MSw";


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);