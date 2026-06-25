// src/App.js
// ============================================================================
// MAIN APPLICATION ROUTER - Logistics Hub
// ============================================================================

import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmployeePortal } from './components/employee/EmployeePortal';
import { checkDbConnection, isDatabaseEnabled, setDatabaseMode } from './config/supabase';
import { getSession, saveSession, clearSession, isAdmin } from './services/authService';
import './styles/global.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbLive, setIsDbLive] = useState(false);

  // Initialize DB check and session loader
  const initializeApp = async () => {
    setIsLoading(true);
    try {
      const live = await checkDbConnection();
      setIsDbLive(live && isDatabaseEnabled());
      
      const savedUser = getSession();
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (err) {
      console.error("Initialization error:", err);
    } finally {
      // Small artificial delay to show premium loader
      setTimeout(() => setIsLoading(false), 1200);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  // Centralized login handler
  const handleLogin = (userData) => {
    setUser(userData);
    saveSession(userData);
  };

  // Centralized logout handler
  const handleLogout = () => {
    setUser(null);
    clearSession();
  };

  // Toggle Database Connection Mode dynamically
  const handleToggleDbMode = async (enableLive) => {
    setDatabaseMode(enableLive);
    setIsLoading(true);
    try {
      const live = await checkDbConnection();
      if (enableLive && !live) {
        const isConnected = localStorage.getItem("st_logistics_db_connected");
        const hasData = localStorage.getItem("st_logistics_db_has_data");
        if (isConnected === "false") {
          alert("❌ Lỗi: Không thể kết nối tới Database của Supabase!\n\nHướng dẫn khắc phục:\n1. Kiểm tra xem bạn đã thêm 2 Environment Variables (REACT_APP_SUPABASE_URL & REACT_APP_SUPABASE_ANON_KEY) vào cài đặt của dự án trên Vercel chưa.\n2. Đảm bảo rằng bạn đã chạy các câu lệnh SQL khởi tạo bảng trong file supabase_schema.sql ở phần SQL Editor của Supabase.");
        } else if (hasData === "false") {
          alert("⚠️ Kết nối thành công nhưng Database đang trống!\n\nHướng dẫn khắc phục:\nBạn cần vào SQL Editor trong Supabase và chạy toàn bộ nội dung file supabase_schema.sql để tạo các bảng dữ liệu (như users, shipments) và tạo các tài khoản dùng thử.");
        }
      }
      setIsDbLive(live && enableLive);
      // Clear session when switching modes to prevent cache mismatch
      setUser(null);
      clearSession();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Premium Brand Loader Screen
  if (isLoading) {
    return (
      <div className="loading-screen" style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color: 'white',
        flexDirection: 'column',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>🚛</div>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', letterSpacing: '4px', margin: 0 }}>
            LOGISTICS HUB
          </h1>
          <p style={{ opacity: 0.6, marginTop: '10px', fontSize: '1rem' }}>
            Đang tải hệ thống quản lý thông minh...
          </p>
        </div>
      </div>
    );
  }

  // 2. Authentication View
  if (!user) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        isDbLive={isDbLive} 
        onToggleDbMode={handleToggleDbMode} 
      />
    );
  }

  // 3. User Dashboard Routing
  return isAdmin(user) ? (
    <AdminDashboard 
      user={user} 
      onLogout={handleLogout} 
      isDbLive={isDbLive} 
      onToggleDbMode={handleToggleDbMode}
    />
  ) : (
    <EmployeePortal 
      user={user} 
      onLogout={handleLogout} 
      isDbLive={isDbLive}
      onToggleDbMode={handleToggleDbMode}
    />
  );
}