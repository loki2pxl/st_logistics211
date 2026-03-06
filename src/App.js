import React, { useState, useEffect } from 'react';

// Components - Matching your folder structure
import { LoginPage } from './components/auth/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmployeePortal } from './components/employee/EmployeePortal';

// Services & Data
import * as mockService from './data/dataService.js'; // TypeScript file (.ts)
import { saveSession, clearSession, isAdmin } from './services/authService';

import './styles/global.css';

// ⚡ THE MASTER TOGGLE
// Set to 'true' to use your mockData.js and dataService.ts
// Set to 'false' to use the real services in your /services folder
const USE_MOCK_DATA = true;

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = () => {
      setIsLoading(true);
      
      if (USE_MOCK_DATA) {
        // Automatically bypass login for fast dev testing
        // You can comment this out to test the LoginPage
        const devUser = {
          name: "Admin User",
          role: "admin",
          branch: "hanoi",
          employee_id: 1
        };
        setUser(devUser);
      } else {
        // Real session check logic
        // const saved = getSession(); if(saved) setUser(saved);
      }
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // Centralized login handler
  const handleLogin = async (email, password) => {
    try {
      let userData;
      
      if (USE_MOCK_DATA) {
        // Uses your dataService.ts + mockData.js
        userData = await mockService.login(email, password);
      } else {
        // This would call your real authService.js
        throw new Error("Real database not connected yet.");
      }
      
      setUser(userData);
      saveSession(userData);
    } catch (err) {
      // Passes the error message to the UI
      throw err; 
    }
  };

  const handleLogout = () => {
    setUser(null);
    clearSession();
  };

  if (isLoading) {
    return (
      <div className="loading-container" style={loadingStyles}>
        <h2>ST LOGISTICS</h2>
        <p>Initializing {USE_MOCK_DATA ? 'Mock' : 'Live'} System...</p>
      </div>
    );
  }

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
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
  color: 'white',
  fontFamily: 'Outfit, sans-serif',
};