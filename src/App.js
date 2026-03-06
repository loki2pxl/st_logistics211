// src/App.js
// ============================================================================
// MAIN APPLICATION - Logistics Hub Central Router
// ============================================================================

import React, { useState, useEffect } from 'react';

// Components - Matching your folder structure
import { LoginPage } from './components/auth/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmployeePortal } from './components/employee/EmployeePortal';

// Services & Data
import * as mockService from './data/dataService'; // Handles both .js and .ts
import { saveSession, clearSession, isAdmin, getSession } from './services/authService';

import './styles/global.css';

// ⚡ THE MASTER TOGGLE
// Set to 'true' to use your mockData.js and bypass login for testing
const USE_MOCK_DATA = true;

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = () => {
      setIsLoading(true);
      
      if (USE_MOCK_DATA) {
        // Automatically bypass login for fast dev testing
        const devUser = {
          name: "Nguyễn Văn Admin",
          role: "admin",
          branch: "hanoi",
          employee_id: "EMP001" // String ID format matches your dashboards
        };
        setUser(devUser);
      } else {
        // Real session check logic for production
        const saved = getSession(); 
        if(saved) setUser(saved);
      }
      
      // Artificial delay to show the branding loader
      setTimeout(() => setIsLoading(false), 1000);
    };

    initializeApp();
  }, []);

  // Centralized login handler
  const handleLogin = async (email, password) => {
    try {
      let userData;
      if (USE_MOCK_DATA) {
        userData = await mockService.login(email, password);
      } else {
        throw new Error("Vui lòng kết nối cơ sở dữ liệu Supabase.");
      }
      
      setUser(userData);
      saveSession(userData);
    } catch (err) {
      throw err; 
    }
  };

  const handleLogout = () => {
    setUser(null);
    clearSession();
  };

  // 1. Brand Loading Screen
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader-content text-center">
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', letterSpacing: '4px' }}>
            LOGISTICS HUB
          </h1>
          <p style={{ opacity: 0.8, marginTop: '10px' }}>Đang khởi động hệ thống quản lý...</p>
        </div>
      </div>
    );
  }

  // 2. Authentication Route
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 3. Dashboard Routing
  // Checks user.role to decide which dashboard to render
  return isAdmin(user) ? (
    <AdminDashboard user={user} onLogout={handleLogout} />
  ) : (
    <EmployeePortal user={user} onLogout={handleLogout} />
  );
}