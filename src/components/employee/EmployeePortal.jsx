// src/components/employee/EmployeePortal.jsx
// ============================================================================
// EMPLOYEE PORTAL - DASHBOARD TỔNG QUAN CHO TẤT CẢ NHÂN VIÊN
// Đây là trang TỔNG QUAN chung, KHÔNG phải nơi nhập liệu
// ============================================================================
import React, { useState, useEffect } from "react";
import attendanceService from "../../services/attendanceService";
import "../../styles/global.css";

export function EmployeePortal({ user, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data for announcements (có thể thay bằng API sau)
  const [announcements] = useState([
    { 
      id: 1, 
      title: "Thông báo nghỉ lễ 30/4 - 1/5", 
      content: "Công ty nghỉ lễ Giải phóng miền Nam và Quốc tế Lao động. Nhân viên được nghỉ 4 ngày liên tục.", 
      date: "2024-04-25", 
      type: "info",
      author: "Ban Giám Đốc" 
    },
    { 
      id: 2, 
      title: "Chúc mừng hoàn thành KPI tháng 4", 
      content: "Toàn công ty đã vượt chỉ tiêu doanh thu tháng 4 đạt 125%. Cảm ơn sự nỗ lực của tất cả mọi người!", 
      date: "2024-04-20", 
      type: "success",
      author: "Phòng Kế Hoạch" 
    },
    { 
      id: 3, 
      title: "Nhắc nhở về An toàn lao động", 
      content: "Tất cả nhân viên bắt buộc đeo thiết bị bảo hộ khi làm việc tại kho bãi và trong quá trình vận chuyển.", 
      date: "2024-04-15", 
      type: "warning",
      author: "Phòng Hành Chính" 
    },
  ]);

  // Mock KPI data
  const [kpiData] = useState({
    thisMonth: 85,
    lastMonth: 80,
    target: 90,
    workDays: 22,
    totalDays: 26,
    tasksCompleted: 45,
    tasksTotal: 60,
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load attendance data
  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      const data = await attendanceService.getTodayAttendance(user.employee_id);
      setTodayAttendance(data);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await attendanceService.checkIn(user.employee_id, user.name, user.role, user.branch);
      await loadTodayAttendance();
      alert('✅ Check-in thành công!');
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;
    setLoading(true);
    try {
      await attendanceService.checkOut(todayAttendance.id);
      await loadTodayAttendance();
      alert('✅ Check-out thành công!');
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAnnouncementStyle = (type) => {
    const styles = {
      info: { borderLeft: '4px solid #3b82f6', background: '#eff6ff' },
      success: { borderLeft: '4px solid #10b981', background: '#f0fdf4' },
      warning: { borderLeft: '4px solid #f59e0b', background: '#fffbeb' },
    };
    return styles[type] || styles.info;
  };

  const getRoleDisplayName = (role) => {
    const names = {
      'bocxep': '📦 Bốc Xếp',
      'laixe': '🚛 Lái Xe',
      'vanphong': '💼 Văn Phòng',
      'admin': '👔 Quản Lý',
    };
    return names[role] || role;
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-section">
          <h2 style={{ letterSpacing: '2px', fontFamily: 'Bebas Neue, sans-serif' }}>
            LOGISTICS HUB
          </h2>
        </div>
        
        <nav className="nav-menu">
          <div className="menu-divider">MENU CHÍNH</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li className="nav-item active">🏠 Trang Chủ</li>
            <li className="nav-item">📊 KPI của tôi</li>
            <li className="nav-item">📅 Lịch làm việc</li>
            <li className="nav-item">📝 Nhập liệu</li>
            <li className="nav-item">💰 Lương thưởng</li>
            <li className="nav-item">📄 Tài liệu</li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile" style={{ marginBottom: '15px' }}>
            <p className="user-name" style={{ color: 'white', fontWeight: 'bold', margin: 0, fontSize: '1rem' }}>
              {user?.name || "Nhân viên"}
            </p>
            <small style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginTop: '5px' }}>
              {getRoleDisplayName(user?.role)}
            </small>
            <small style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginTop: '3px' }}>
              ID: {user?.employee_id}
            </small>
          </div>
          <button 
            onClick={onLogout} 
            className="btn-primary" 
            style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* Welcome Header */}
        <header style={{ 
          background: 'white', 
          padding: '25px 30px', 
          borderRadius: '12px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
        }}>
          <div>
            <h1 style={{ color: '#7e22ce', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              Xin chào, {user?.name}! 👋
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.95rem', color: '#64748b' }}>
              {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div>
            <span style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              padding: '12px 28px', 
              borderRadius: '25px', 
              fontWeight: 'bold', 
              fontSize: '1rem', 
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              display: 'inline-block'
            }}>
              📍 {user?.branch === 'saigon' ? 'Sài Gòn' : 'Hà Nội'}
            </span>
          </div>
        </header>

        {/* Quick Check-in Card */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          marginBottom: '25px',
          border: 'none',
          padding: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>⏰ Chấm Công Nhanh</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', fontFamily: 'monospace', margin: '15px 0' }}>
                {currentTime.toLocaleTimeString('vi-VN')}
              </div>
              <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: '1.05rem' }}>
                {todayAttendance ? (
                  todayAttendance.check_out ? (
                    `✅ Đã hoàn thành ca làm việc: ${todayAttendance.check_in} - ${todayAttendance.check_out}`
                  ) : (
                    `🟢 Đang làm việc từ ${todayAttendance.check_in}`
                  )
                ) : (
                  '⚪ Chưa check-in hôm nay'
                )}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
              <button 
                onClick={handleCheckIn}
                disabled={loading || todayAttendance}
                style={{
                  padding: '18px 40px',
                  background: todayAttendance ? 'rgba(255,255,255,0.3)' : 'white',
                  color: todayAttendance ? 'rgba(255,255,255,0.7)' : '#667eea',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '1.15rem',
                  cursor: todayAttendance ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '180px'
                }}
              >
                ✓ Check In
              </button>
              <button 
                onClick={handleCheckOut}
                disabled={loading || !todayAttendance || todayAttendance?.check_out}
                style={{
                  padding: '18px 40px',
                  background: (!todayAttendance || todayAttendance?.check_out) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                  color: (!todayAttendance || todayAttendance?.check_out) ? 'rgba(255,255,255,0.5)' : '#667eea',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '1.15rem',
                  cursor: (!todayAttendance || todayAttendance?.check_out) ? 'not-allowed' : 'pointer',
                  minWidth: '180px'
                }}
              >
                ✗ Check Out
              </button>
            </div>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '25px' }}>
          
          <div className="card" style={{ borderTop: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                  KPI Tháng Này
                </p>
                <h2 style={{ fontSize: '3rem', margin: '0', color: '#1e293b', fontWeight: 'bold' }}>
                  {kpiData.thisMonth}%
                </h2>
              </div>
              <span style={{ fontSize: '2.5rem' }}>📈</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: 'bold' }}>
                ↗ +{kpiData.thisMonth - kpiData.lastMonth}%
              </span>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                so với tháng trước
              </span>
            </div>
          </div>

          <div className="card" style={{ borderTop: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                  Ngày Công
                </p>
                <h2 style={{ fontSize: '3rem', margin: '0', color: '#1e293b', fontWeight: 'bold' }}>
                  {kpiData.workDays}/{kpiData.totalDays}
                </h2>
              </div>
              <span style={{ fontSize: '2.5rem' }}>📅</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              Còn {kpiData.totalDays - kpiData.workDays} ngày trong tháng
            </p>
          </div>

          <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                  Nhiệm Vụ
                </p>
                <h2 style={{ fontSize: '3rem', margin: '0', color: '#1e293b', fontWeight: 'bold' }}>
                  {kpiData.tasksCompleted}/{kpiData.tasksTotal}
                </h2>
              </div>
              <span style={{ fontSize: '2.5rem' }}>✓</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${(kpiData.tasksCompleted / kpiData.tasksTotal) * 100}%`, 
                height: '100%', 
                background: '#f59e0b',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

        </div>

        {/* Announcements */}
        <div className="card">
          <h3 style={{ color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: 'bold' }}>
            📢 Thông Báo Nội Bộ
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {announcements.map(announcement => (
              <div 
                key={announcement.id}
                style={{
                  ...getAnnouncementStyle(announcement.type),
                  padding: '20px 25px',
                  borderRadius: '10px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {announcement.title}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(announcement.date).toLocaleDateString('vi-VN')}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                      {announcement.author}
                    </span>
                  </div>
                </div>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {announcement.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: '25px' }}>
          <h3 style={{ color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: 'bold' }}>
            ⚡ Hành Động Nhanh
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            
            <button style={{
              padding: '25px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <span style={{ fontSize: '2.5rem' }}>📝</span>
              Nhập Liệu Ngay
            </button>

            <button style={{
              padding: '25px 20px',
              background: '#f1f5f9',
              color: '#1e293b',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.background = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.background = '#f1f5f9';
            }}>
              <span style={{ fontSize: '2.5rem' }}>📊</span>
              Xem KPI Chi Tiết
            </button>

            <button style={{
              padding: '25px 20px',
              background: '#f1f5f9',
              color: '#1e293b',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.background = '#f0fdf4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.background = '#f1f5f9';
            }}>
              <span style={{ fontSize: '2.5rem' }}>💰</span>
              Lương & Thưởng
            </button>

          </div>
        </div>

      </main>
    </div>
  );
}
