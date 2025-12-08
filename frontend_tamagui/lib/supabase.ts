// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// 🧩 Remplace ces valeurs par celles de ton projet Supabase
const SUPABASE_URL = 'https://fhobhygsfpkeeskrjzrl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZob2JoeWdzZnBrZWVza3JqenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxOTk0OTAsImV4cCI6MjA4MDc3NTQ5MH0._e4CB7ByhmfWqQHAkyMyg9le7Gr3COLmPakS7ZVrndk';

// 🔗 Création du client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Type optionnel pour TypeScript (structure de la base)
export type Database = any;

/**
 * 📽️ Récupère toutes les vidéos d’un utilisateur depuis la table "videos".
 * Triées de la plus récente à la plus ancienne.
 */
export async function fetchUserVideos(userId: string) {
  const { data, error } = await supabase
    .from("videos")
    .select("id, original_url, translated_url, target_lang, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération des vidéos :", error.message);
    throw new Error("Impossible de charger les vidéos de l'utilisateur");
  }

  return data || [];
}
