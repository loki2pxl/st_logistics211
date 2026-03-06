// src/App.js
// ============================================================================
// MAIN APPLICATION - Refactored & Organized
// ============================================================================

import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmployeePortal } from './components/employee/EmployeePortal';
import { getSession, saveSession, clearSession, isAdmin } from './services/authService';
import './styles/global.css';

export default function App() {

  // ⚡ MOCK USER FOR LOCAL TESTING (DISABLE LOGIN)
  const MOCK_USER = {
    name: "Test Admin",
    role: "admin",
    branch: "hanoi",
    employee_id: 1
  };

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {

    // COMMENT THIS BACK WHEN GOING TO PRODUCTION
    setUser(MOCK_USER);
    setIsLoading(false);

    /*
    const savedUser = getSession();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
    */

  }, []);

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    saveSession(userData);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    clearSession();
  };

  if (isLoading) {
    return (
      <div style={loadingStyles}>
        Đang tải...
      </div>
    );
  }

  // If login enabled again
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return isAdmin(user) ? (
    <AdminDashboard user={user} onLogout={handleLogout} />
  ) : (
    <EmployeePortal user={user} onLogout={handleLogout} />
  );
}

const loadingStyles = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 700,
  fontFamily: 'Outfit, sans-serif',
};