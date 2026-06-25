// src/components/employee/EmployeePortal.jsx
// ============================================================================
// EMPLOYEE PORTAL - Dynamic Welcome Tab, Daily Inputs & Performance History
// ============================================================================

import React, { useState, useEffect, useCallback } from "react";
import attendanceService from "../../services/attendanceService";
import kpiService from "../../services/kpiService";
import "../../styles/global.css";

// Sub-portals for data entry based on role
import BocXepPortal from "../portals/bocxep";
import LaiXePortal from "../portals/laixe";
import VanPhongPortal from "../portals/vanphong";

export function EmployeePortal({ user, onLogout, isDbLive, onToggleDbMode }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("welcome"); // welcome, input, history

  // Announcements
  const [announcements] = useState([
    { 
      id: 1, 
      title: "Thông báo nghỉ lễ sắp tới", 
      content: "Hệ thống vận tải và điều phối hoạt động bình thường qua lễ. Nhân viên trực ca được nhân hệ số lương theo quy định.", 
      date: "2026-06-25", 
      type: "warning",
      author: "Phòng Nhân Sự" 
    },
    { 
      id: 2, 
      title: "Vượt chỉ tiêu xếp dỡ kho bãi tháng 6", 
      content: "Nhóm bốc xếp Hà Nội xuất sắc hoàn thành vượt 15% chỉ tiêu sản lượng hàng hóa thông quan. Thưởng nóng toàn nhóm.", 
      date: "2026-06-22", 
      type: "success",
      author: "Ban Giám Đốc" 
    },
    { 
      id: 3, 
      title: "Nâng cấp ứng dụng Logistics Hub", 
      content: "Ứng dụng đã hỗ trợ đồng bộ dữ liệu ngoại tuyến và tự động chuyển đổi sang chế độ Demo Local nếu máy chủ Supabase bảo trì.", 
      date: "2026-06-20", 
      type: "info",
      author: "Đội ngũ IT" 
    },
  ]);

  // Personal KPI state
  const [personalKPI, setPersonalKPI] = useState({
    score: 95,
    base_salary: 10000000,
    bonus: 1000000,
    deductions: 0,
    notes: "Đang tải KPI tháng..."
  });

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Attendance & KPI
  const loadAttendanceAndKPI = useCallback(async () => {
    if (!user?.employee_id) return;
    try {
      setLoading(true);
      // Load today's check-in status
      const att = await attendanceService.getTodayAttendance(user.employee_id);
      setTodayAttendance(att);

      // Load KPI record for current month (e.g. '2026-06')
      const currentMonth = "2026-06";
      const kpi = await kpiService.getKPIByEmployeeMonth(user.employee_id, currentMonth);
      if (kpi) {
        setPersonalKPI(kpi);
      } else {
        // Fallback default mock representation based on role
        const defaultBase = user.role === 'laixe' ? 12000000 : user.role === 'bocxep' ? 9000000 : 10000000;
        setPersonalKPI({
          score: 90.00,
          base_salary: defaultBase,
          bonus: 500000,
          deductions: 0,
          notes: "KPI dự kiến chưa phê duyệt."
        });
      }
    } catch (error) {
      console.error('Error loading employee portal statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAttendanceAndKPI();
  }, [loadAttendanceAndKPI]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await attendanceService.checkIn(user.employee_id, user.name, user.role, user.branch);
      await loadAttendanceAndKPI();
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
      await loadAttendanceAndKPI();
      alert('✅ Check-out thành công!');
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAnnouncementBorderColor = (type) => {
    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
    };
    return colors[type] || '#cbd5e1';
  };

  const getRoleBadge = (role) => {
    const rolesMap = {
      laixe: { label: '🚛 Lái Xe Vận Tải', color: '#2563eb', bg: '#eff6ff' },
      bocxep: { label: '📦 Xếp Dỡ Kho Bãi', color: '#d97706', bg: '#fffbeb' },
      vanphong: { label: '💼 Văn Phòng Điều Phối', color: '#7e22ce', bg: '#f5f3ff' },
      admin: { label: '👔 Quản Lý Hệ Thống', color: '#0f172a', bg: '#f1f5f9' }
    };
    return rolesMap[role] || { label: role, color: '#475569', bg: '#f1f5f9' };
  };

  const currentRole = getRoleBadge(user?.role);

  // Render the correct daily functional data input portal
  const renderFunctionalPortal = () => {
    const props = { user, onLogout, embedded: true };
    switch (user?.role) {
      case 'laixe':
        return <LaiXePortal {...props} />;
      case 'bocxep':
        return <BocXepPortal {...props} />;
      case 'vanphong':
        return <VanPhongPortal {...props} />;
      default:
        return (
          <div style={{ padding: '50px', textAlign: 'center' }} className="card">
            <h3>Quyền truy cập không hợp lệ</h3>
            <p>Tài khoản của bạn không được phân quyền nhập liệu hàng ngày.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="logo-section" style={{ marginBottom: '2rem' }}>
            <h2 style={{ letterSpacing: '2px', fontFamily: 'Bebas Neue, sans-serif', color: 'white', margin: 0 }}>
              LOGISTICS HUB
            </h2>
            <small style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              CỔNG THÔNG TIN NHÂN VIÊN
            </small>
          </div>
          
          <nav className="nav-menu">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li 
                className={`nav-item ${activeTab === 'welcome' ? 'active' : ''}`}
                onClick={() => setActiveTab('welcome')}
              >
                🏠 Trang Chủ & Chấm Công
              </li>
              <li 
                className={`nav-item ${activeTab === 'input' ? 'active' : ''}`}
                onClick={() => setActiveTab('input')}
              >
                📝 Nhập Liệu Hàng Ngày
              </li>
              <li 
                className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                📊 Lương Thưởng & KPI
              </li>
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div>
          <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', color: 'white', fontSize: '0.9rem', marginBottom: '3px' }}>
              {user?.name}
            </div>
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              background: currentRole.bg,
              color: currentRole.color,
              marginBottom: '8px'
            }}>
              {currentRole.label}
            </span>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
              Mã NV: <strong>{user?.employee_id}</strong>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '3px' }}>
              Chi nhánh: <strong>{user?.branch === 'saigon' ? 'Sài Gòn' : 'Hà Nội'}</strong>
            </div>

            {/* Connection mode display */}
            <div style={{ marginTop: '10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '5px', color: isDbLive ? '#86efac' : '#fef08a' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isDbLive ? '#22c55e' : '#eab308' }}></span>
              {isDbLive ? 'Live Database Mode' : 'Demo Offline Mode'}
            </div>
          </div>

          <button 
            onClick={onLogout} 
            className="btn-primary" 
            style={{ 
              width: '100%', 
              background: '#ef4444', 
              border: 'none', 
              padding: '12px', 
              borderRadius: '8px', 
              color: 'white', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)' 
            }}
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
          padding: '20px 30px', 
          borderRadius: '12px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
        }}>
          <div>
            <h1 style={{ color: '#1e1b4b', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
              Xin chào, {user?.name}! 👋
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
              {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 
              padding: '8px 20px', 
              borderRadius: '20px', 
              fontWeight: 'bold', 
              fontSize: '0.9rem', 
              color: 'white',
              boxShadow: '0 3px 8px rgba(30, 60, 114, 0.2)'
            }}>
              📍 {user?.branch === 'saigon' ? 'Sài Gòn' : 'Hà Nội'}
            </span>
          </div>
        </header>

        {/* TAB 1: WELCOME & QUICK CHECK-IN */}
        {activeTab === 'welcome' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Check-in Card */}
            <div className="card" style={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
              color: 'white',
              border: 'none',
              padding: '2rem',
              boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: 'bold' }}>⏰ Chấm Công Nhân Viên</h3>
                  <div style={{ fontSize: '3.5rem', fontWeight: 'bold', fontFamily: 'monospace', margin: '10px 0', letterSpacing: '2px' }}>
                    {currentTime.toLocaleTimeString('vi-VN')}
                  </div>
                  <p style={{ margin: '10px 0 0 0', opacity: 0.95, fontSize: '1.05rem', fontWeight: '500' }}>
                    {todayAttendance ? (
                      todayAttendance.check_out ? (
                        `✅ Đã hoàn thành ca làm việc hôm nay: ${todayAttendance.check_in} - ${todayAttendance.check_out}`
                      ) : (
                        `🟢 Đang trong ca làm việc (Check-in lúc: ${todayAttendance.check_in})`
                      )
                    ) : (
                      '⚪ Chưa ghi nhận check-in ngày hôm nay.'
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                  <button 
                    onClick={handleCheckIn}
                    disabled={loading || todayAttendance}
                    style={{
                      padding: '16px 36px',
                      background: todayAttendance ? 'rgba(255,255,255,0.3)' : 'white',
                      color: todayAttendance ? 'rgba(255,255,255,0.7)' : '#4f46e5',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      cursor: todayAttendance ? 'not-allowed' : 'pointer',
                      boxShadow: todayAttendance ? 'none' : '0 4px 12px rgba(0,0,0,0.15)',
                      minWidth: '180px',
                      transition: 'all 0.2s'
                    }}
                  >
                    ✓ Check In
                  </button>
                  <button 
                    onClick={handleCheckOut}
                    disabled={loading || !todayAttendance || todayAttendance?.check_out}
                    style={{
                      padding: '16px 36px',
                      background: (!todayAttendance || todayAttendance?.check_out) ? 'rgba(255,255,255,0.15)' : 'white',
                      color: (!todayAttendance || todayAttendance?.check_out) ? 'rgba(255,255,255,0.5)' : '#d97706',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      cursor: (!todayAttendance || todayAttendance?.check_out) ? 'not-allowed' : 'pointer',
                      minWidth: '180px',
                      transition: 'all 0.2s'
                    }}
                  >
                    ✗ Check Out
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Summary Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ borderLeft: `6px solid ${currentRole.color}` }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Cấp Bậc & Chức Năng</h4>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', marginTop: '10px' }}>
                  {currentRole.label}
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Phân quyền chức năng nhập liệu: <strong>{activeTab === 'input' ? 'Đang mở' : 'Khớp vai trò'}</strong>
                </p>
              </div>

              <div className="card" style={{ borderLeft: '6px solid #10b981' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Hiệu Suất KPI Tháng 6</h4>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981', marginTop: '5px' }}>
                  {personalKPI.score}%
                </div>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Trạng thái: <strong>{personalKPI.score >= 90 ? 'Tốt' : 'Trung bình'}</strong>
                </p>
              </div>
            </div>

            {/* Announcements Card */}
            <div className="card">
              <h3 style={{ color: '#1e1b4b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', fontWeight: 'bold' }}>
                📢 Thông Báo Từ Công Ty
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {announcements.map(ann => (
                  <div 
                    key={ann.id}
                    style={{
                      borderLeft: `4px solid ${getAnnouncementBorderColor(ann.type)}`,
                      background: '#f8fafc',
                      padding: '16px 20px',
                      borderRadius: '8px',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: 'bold' }}>{ann.title}</h4>
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{ann.date}</span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {ann.content}
                    </p>
                    <small style={{ color: '#94a3b8', fontStyle: 'italic' }}>Gửi bởi: {ann.author}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FUNCTIONAL DAILY DATA INPUT */}
        {activeTab === 'input' && (
          <div>
            <div style={{ marginBottom: '20px', padding: '15px 20px', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #2563eb', color: '#1e40af' }}>
              💡 <strong>Lưu ý:</strong> Vui lòng thực hiện chấm công Check-in trước khi nhập liệu thông số hoạt động hàng ngày.
            </div>
            {renderFunctionalPortal()}
          </div>
        )}

        {/* TAB 3: PERSONAL HISTORY & KPI DETAILS */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 style={{ color: '#1e1b4b', marginBottom: '20px', fontSize: '1.3rem', fontWeight: 'bold' }}>
                📊 Chi Tiết Lương & Hiệu Suất KPI Tháng Này
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>ĐIỂM ĐÁNH GIÁ KPI</span>
                  <h1 style={{ fontSize: '3rem', margin: '10px 0', color: '#4f46e5', fontWeight: 'bold' }}>{personalKPI.score}</h1>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Thang điểm 100</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>LƯƠNG CƠ BẢN</span>
                  <h1 style={{ fontSize: '2rem', margin: '18px 0', color: '#1e293b', fontWeight: 'bold' }}>
                    {personalKPI.base_salary.toLocaleString()} ₫
                  </h1>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Đồng bộ theo hợp đồng</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>LƯƠNG THỰC NHẬN (TẠM TÍNH)</span>
                  <h1 style={{ fontSize: '2rem', margin: '18px 0', color: '#10b981', fontWeight: 'bold' }}>
                    {(personalKPI.base_salary + personalKPI.bonus - personalKPI.deductions).toLocaleString()} ₫
                  </h1>
                  <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>
                    Thưởng: +{personalKPI.bonus.toLocaleString()} ₫
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>📝 Nhận xét đánh giá từ quản lý:</h4>
                <p style={{ margin: 0, color: '#475569', fontStyle: 'italic', background: '#fffbeb', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  "{personalKPI.notes}"
                </p>
              </div>
            </div>

            {/* Embed historical list inside employee portal to make it clean */}
            <div className="card">
              <h3 style={{ color: '#1e1b4b', marginBottom: '15px', fontSize: '1.3rem', fontWeight: 'bold' }}>
                📅 Xem nhanh lịch sử gửi dữ liệu hàng ngày
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 20px 0' }}>
                Để xem chi tiết và thêm báo cáo mới, vui lòng di chuyển sang tab <strong>"Nhập Liệu Hàng Ngày"</strong>.
              </p>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => setActiveTab('input')}
                  style={{
                    padding: '12px 24px',
                    background: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  📝 Đi đến trang Nhập Liệu
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
