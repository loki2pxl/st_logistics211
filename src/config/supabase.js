// src/config/supabase.js
// ============================================================================
// SUPABASE CONFIGURATION
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Đọc từ environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Kiểm tra xem đã config chưa
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️ CẢNH BÁO: Chưa cấu hình Supabase!');
  console.error('Hãy tạo file .env và thêm:');
  console.error('REACT_APP_SUPABASE_URL=your-url');
  console.error('REACT_APP_SUPABASE_ANON_KEY=your-key');
}

// Khởi tạo Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export config values nếu cần
export const config = {
  supabaseUrl: SUPABASE_URL,
  isDevelopment: process.env.NODE_ENV === 'development',
  appName: process.env.REACT_APP_NAME || 'Logistics Management System',
  appVersion: process.env.REACT_APP_VERSION || '2.0.0',
};
