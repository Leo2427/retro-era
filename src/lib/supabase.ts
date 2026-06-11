import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// 客户端用（受 RLS 限制）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端用（绕过 RLS，仅在后端 API 中使用）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export const STORAGE_BUCKETS = {
  GAME_COVERS: "game-covers",
  AVATARS: "avatars",
} as const
