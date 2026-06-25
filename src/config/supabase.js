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

// Khởi tạo Supabase client an toàn (tránh crash khi chưa cấu hình Environment Variables)
const isValidUrl = (url) => {
  try {
    return url && url.startsWith('http');
  } catch (e) {
    return false;
  }
};

const isValidConfig = !!(SUPABASE_URL && SUPABASE_ANON_KEY && isValidUrl(SUPABASE_URL) && !SUPABASE_ANON_KEY.includes('your-') && !SUPABASE_ANON_KEY.startsWith('sb_secret_'));

export const supabase = isValidConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Kiểm tra kết nối tới Database thực tế
export const checkDbConnection = async () => {
  if (!supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('your-') || SUPABASE_ANON_KEY.startsWith('sb_secret_')) {
    localStorage.setItem("st_logistics_db_connected", "false");
    localStorage.setItem("st_logistics_db_has_data", "false");
    return false;
  }
  try {
    // Thử truy vấn một bảng bất kỳ (ví dụ 'users') để xác minh kết nối và kiểm tra dữ liệu
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.warn("⚠️ Kết nối database thất bại:", error.message);
      localStorage.setItem("st_logistics_db_connected", "false");
      localStorage.setItem("st_logistics_db_has_data", "false");
      return false;
    }
    
    localStorage.setItem("st_logistics_db_connected", "true");
    
    // Check if the database has any seeded users (i.e. not empty)
    if (data && data.length > 0) {
      localStorage.setItem("st_logistics_db_has_data", "true");
    } else {
      console.warn("⚠️ Database đã kết nối nhưng chưa có dữ liệu (chưa seed). Mặc định chạy Demo.");
      localStorage.setItem("st_logistics_db_has_data", "false");
    }
    
    return true;
  } catch (err) {
    console.warn("⚠️ Lỗi kết nối database:", err.message || err);
    localStorage.setItem("st_logistics_db_connected", "false");
    localStorage.setItem("st_logistics_db_has_data", "false");
    return false;
  }
};

// Hàm kiểm tra xem có sử dụng Live Database hay không
export const isDatabaseEnabled = () => {
  if (!supabase) return false;
  const choice = localStorage.getItem("st_logistics_use_live_db");
  if (choice === "false") return false;
  
  const isConnected = localStorage.getItem("st_logistics_db_connected");
  const hasData = localStorage.getItem("st_logistics_db_has_data");
  
  // Nếu database offline hoặc chưa cấu hình đúng, bắt buộc chạy Mock
  if (isConnected === "false") return false;
  
  // Nếu người dùng chọn thủ công "Bật Supabase", ưu tiên cấu hình của người dùng
  if (choice === "true") return true;
  
  // Mặc định: bật nếu có đầy đủ cấu hình URL & Key hợp lệ VÀ đã seed dữ liệu
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY && 
            !SUPABASE_ANON_KEY.includes('your-') && 
            !SUPABASE_ANON_KEY.startsWith('sb_secret_') && 
            isConnected === "true" && 
            hasData === "true");
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


