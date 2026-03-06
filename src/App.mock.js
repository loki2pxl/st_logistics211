import React, { useState } from 'react';
import { LoginPage } from "./components/auth/LoginPage";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { EmployeePortal } from "./components/employee/EmployeePortal";

export default function AppMock() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // ✅ THIS is where that return logic belongs
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div>
      {user.role === 'admin' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <EmployeePortal user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}