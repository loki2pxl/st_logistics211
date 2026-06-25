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

// Kiểm tra kết nối tới Database thực tế
export const checkDbConnection = async () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('your-') || SUPABASE_ANON_KEY.startsWith('sb_secret_')) {
    return false;
  }
  try {
    // Thử truy vấn một bảng bất kỳ (ví dụ 'users') để xác minh kết nối
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.warn("⚠️ Kết nối database thất bại:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("⚠️ Lỗi kết nối database:", err.message || err);
    return false;
  }
};

// Hàm kiểm tra xem có sử dụng Live Database hay không
export const isDatabaseEnabled = () => {
  const choice = localStorage.getItem("st_logistics_use_live_db");
  if (choice === "false") return false;
  if (choice === "true") return true;
  
  // Mặc định: bật nếu có đầy đủ cấu hình URL & Key hợp lệ
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('your-') && !SUPABASE_ANON_KEY.startsWith('sb_secret_'));
};

// Thay đổi cấu hình sử dụng DB
export const setDatabaseMode = (enabled) => {
  localStorage.setItem("st_logistics_use_live_db", enabled ? "true" : "false");
};

// Export config values nếu cần
export const config = {
  supabaseUrl: SUPABASE_URL,
  isDevelopment: process.env.NODE_ENV === 'development',
  appName: process.env.REACT_APP_NAME || 'Logistics Management System',
  appVersion: process.env.REACT_APP_VERSION || '2.0.0',
};


