// src/components/auth/LoginPage.jsx
// ============================================================================
// LOGIN PAGE COMPONENT
// ============================================================================
import React, { useState } from 'react';
import { login } from "../../data/dataService.js"; // Ensure path is correct
import { loginStyles } from './LoginPage.styles';

export const LoginPage = ({ onLogin }) => {
  // Standardized to 'email' to match dataService
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Passes email and password to the dataService
      const userData = await login(email, password);
      onLogin(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.card}>
        <div style={loginStyles.logo}>
          <span style={{ fontSize: '4rem' }}>🚛</span>
          <h1 style={loginStyles.title}>LOGISTICS HUB</h1>
          <p style={loginStyles.subtitle}>Hệ thống quản lý thông minh</p>
        </div>

        <form onSubmit={handleLogin} style={loginStyles.form}>
          {error && <div style={loginStyles.error}>⚠️ {error}</div>}

          <div style={loginStyles.formGroup}>
            <label style={loginStyles.label}>Email / Tên đăng nhập</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={loginStyles.input}
              placeholder="user@example.com"
              required
            />
          </div>

          <div style={loginStyles.formGroup}>
            <label style={loginStyles.label}>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={loginStyles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" style={loginStyles.button} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>

          <div style={loginStyles.hint}>
            <strong>Tài khoản dùng thử:</strong><br/>
            Admin: admin@st.com / admin123<br/>
            Lái xe: laixe1@st.com / 123456
          </div>
        </form>
      </div>
    </div>
  );
};