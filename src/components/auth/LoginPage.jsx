// src/components/auth/LoginPage.jsx
// ============================================================================
// LOGIN PAGE COMPONENT - Restructured with Role Categorization & DB Toggles
// ============================================================================

import React, { useState } from 'react';
import { login } from '../../services/authService';
import { loginStyles } from './LoginPage.styles';

export const LoginPage = ({ onLogin, isDbLive, onToggleDbMode }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRoleTab, setSelectedRoleTab] = useState('admin');

  // Test accounts mapped by functions and company levels
  const testAccounts = {
    admin: {
      label: '👔 Ban Giám Đốc (Quản Lý Cấp Cao)',
      email: 'admin@st.com',
      password: 'admin123',
      desc: 'Toàn quyền điều hành, duyệt chi phí, theo dõi KPI & hiệu suất vận hành.'
    },
    laixe: {
      label: '🚛 Tổ Lái Xe (Vận Tải Cấp Trung)',
      email: 'laixe1@st.com',
      password: '123456',
      desc: 'Nhập thông tin chuyến đi (km, tuyến đường), giá cước, phụ phí và đổ dầu.'
    },
    bocxep: {
      label: '📦 Tổ Bốc Xếp (Kho Bãi Thực Thi)',
      email: 'bocxep1@st.com',
      password: '123456',
      desc: 'Nhập số lượng container, trọng lượng hàng hóa xếp dỡ và khu vực kho.'
    },
    vanphong: {
      label: '💼 Tổ Văn Phòng (Điều Phối & Kế Toán)',
      email: 'vanphong1@st.com',
      password: '123456',
      desc: 'Xuất hóa đơn, xử lý hồ sơ hành chính, nhập chi phí văn phòng tổng hợp.'
    },
    giaonhan: {
      label: '🤝 Tổ Giao Nhận (Quản Lý & Điều Phối Tuyến)',
      email: 'giaonhan1@st.com',
      password: '123456',
      desc: 'Điều phối hàng đường sắt trung chuyển tới khách, lưu thông số tàu, toa, bao hàng.'
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(usernameOrEmail, password);
      onLogin(userData);
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill and instantly log in (no manual login button click required)
  const handleSelectTestAccount = async (roleKey) => {
    setSelectedRoleTab(roleKey);
    setUsernameOrEmail(testAccounts[roleKey].email);
    setPassword(testAccounts[roleKey].password);
    
    setError('');
    setLoading(true);
    try {
      const userData = await login(testAccounts[roleKey].email, testAccounts[roleKey].password);
      onLogin(userData);
    } catch (err) {
      setError(err.message || 'Đăng nhập dùng thử thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.card}>
        {/* LOGO */}
        <div style={loginStyles.logo}>
          <span style={{ fontSize: '4.5rem' }}>🚚</span>
          <h1 style={{ ...loginStyles.title, margin: '10px 0 0 0' }}>LOGISTICS HUB</h1>
          <p style={{ ...loginStyles.subtitle, margin: '5px 0 15px 0', fontSize: '0.95rem' }}>Hệ thống quản lý thông minh</p>
          
          {/* DATABASE CONNECTION STATUS BADGE */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <span style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              background: isDbLive ? '#dcfce7' : '#fef9c3',
              color: isDbLive ? '#15803d' : '#854d0e',
              border: isDbLive ? '1px solid #bbf7d0' : '1px solid #fef08a',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isDbLive ? '#22c55e' : '#eab308',
                display: 'inline-block'
              }}></span>
              {isDbLive ? 'DATABASE ONLINE (SUPABASE)' : 'CHẾ ĐỘ DEMO (MOCK DATA)'}
            </span>

            <button 
              onClick={() => onToggleDbMode(!isDbLive)}
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#475569',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.8)'}
            >
              🔄 Đổi Chế Độ
            </button>
          </div>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} style={loginStyles.form}>
          {error && <div style={loginStyles.error}>⚠️ {error}</div>}

          <div style={loginStyles.formGroup}>
            <label style={loginStyles.label}>Tên đăng nhập hoặc Email</label>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              style={loginStyles.input}
              placeholder="Nhập tên đăng nhập hoặc email..."
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
            {loading ? 'Đang xác thực tài khoản...' : 'Đăng Nhập'}
          </button>
        </form>

        {/* ROLE-BASED QUICK LOGIN ASSISTANT */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚡ Chọn tài khoản dùng thử nhanh:
          </p>
          
          {/* Tabs header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {Object.keys(testAccounts).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectTestAccount(key)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selectedRoleTab === key ? '#2563eb' : '#e2e8f0',
                  background: selectedRoleTab === key ? '#eff6ff' : 'white',
                  color: selectedRoleTab === key ? '#2563eb' : '#475569',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                {key === 'admin' ? '👔 Quản Lý' : key === 'laixe' ? '🚛 Lái Xe' : key === 'bocxep' ? '📦 Bốc Xếp' : key === 'vanphong' ? '💼 Văn Phòng' : '🤝 Giao Nhận'}
              </button>
            ))}
          </div>

          {/* Tab Description box */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '0.8rem',
            color: '#475569',
            lineHeight: '1.5'
          }}>
            <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>
              {testAccounts[selectedRoleTab].label}
            </div>
            <div style={{ marginBottom: '8px', fontStyle: 'italic', color: '#64748b' }}>
              {testAccounts[selectedRoleTab].desc}
            </div>
            <div style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '6px 8px', borderRadius: '4px', display: 'inline-block', fontFamily: 'monospace' }}>
              Tài khoản: <strong>{testAccounts[selectedRoleTab].email}</strong> / Mật khẩu: <strong>{testAccounts[selectedRoleTab].password}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};