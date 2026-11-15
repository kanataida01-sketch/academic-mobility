import { createClient } from "@supabase/supabase-js";

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Если ссылка скопировалась вместе с /rest/v1, убираем этот хвост
if (supabaseUrl.includes("/rest/v1")) {
  supabaseUrl = supabaseUrl.replace("/rest/v1", "");
}
// Убираем лишние слэши на конце, если они есть
supabaseUrl = supabaseUrl.trim().replace(/\/+$/, "");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Ошибка: Ключи Supabase не найдены в файле .env!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);