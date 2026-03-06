import React, { useState, useEffect, useCallback } from "react";
import * as mockService from "../../data/dataService";
import "../../styles/global.css"; 

export function EmployeePortal({ user, onLogout }) {
  // 1. Component States
  const [attendance, setAttendance] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [activeGroup, setActiveGroup] = useState(user.role || "Nhóm Khác"); // Default to user's role

  // 2. Real-time Clock for the Check-in Card
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Data Loading Logic
  const loadMyData = useCallback(async () => {
    try {
      setLoading(true);
      const allAttendance = await mockService.getAttendance();
      const allExpenses = await mockService.getExpenses();

      // Filter data specifically for this employee
      setAttendance(allAttendance.filter(a => a.employee_id === user.employee_id) || []);
      setExpenses(allExpenses.filter(e => e.employee_id === user.employee_id) || []);
    } catch (err) {
      console.error("Error loading portal data:", err);
    } finally {
      setLoading(false);
    }
  }, [user.employee_id]);

  useEffect(() => {
    loadMyData();
  }, [loadMyData]);

  if (loading) return <div className="loading-screen">Đang tải ứng dụng nhân viên...</div>;

  return (
    <div className="dashboard-container">
      {/* 1. SIDEBAR - Matching the Image perfectly */}
      <aside className="sidebar">
        <div className="logo-section">
          <h2>LOGISTICS HUB</h2>
        </div>
        
        <nav className="nav-menu">
          <ul>
            <li className="nav-item active">📊 Tổng Quan</li>
            <li className="nav-item">⏰ Chấm Công</li>
            <li className="nav-item">🚛 Tracking Khách Hàng</li>
            <li className="nav-item">💰 Quản Lý Chi Phí</li>
            <li className="nav-item">📈 KPI & Lương Thưởng</li>
          </ul>

          <div className="menu-divider">NHẬP DỮ LIỆU</div>
          
          <ul className="group-menu">
            <li className={`nav-item ${activeGroup === 'driver' ? 'active' : ''}`} onClick={() => setActiveGroup('driver')}>
              📦 Bốc Xếp
            </li>
            <li className={`nav-item ${activeGroup === 'warehouse' ? 'active' : ''}`} onClick={() => setActiveGroup('warehouse')}>
              🚛 Lái Xe
            </li>
            <li className={`nav-item ${activeGroup === 'office' ? 'active' : ''}`} onClick={() => setActiveGroup('office')}>
              💼 Văn Phòng
            </li>
            <li className={`nav-item ${activeGroup === 'admin' ? 'active' : ''}`} onClick={() => setActiveGroup('admin')}>
              👥 Nhóm Khác
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p className="user-name">{user.name}</p>
          <button onClick={onLogout} className="logout-link">Đăng xuất</button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Dashboard Nhân Viên</h1>
          <div className="branch-selector">
             {/* Branch display matching the location toggle style */}
            <span className={`branch-btn active`}>
               📍 {user.branch === 'hanoi' ? 'Hà Nội' : 'Sài Gòn'}
            </span>
          </div>
        </header>

        <div className="grid-layout">
          <div className="content-column">
            
            {/* Header for Input Section */}
            <div className="section-header">
              <h3>👥 Nhập Liệu - {activeGroup === 'admin' ? 'Nhóm Khác' : 'Phòng Ban'}</h3>
              <div className="employee-select">
                <span>Nhân viên:</span>
                <strong>{user.name}</strong>
              </div>
            </div>

            {/* ⏰ Quick Check-in Card (Yellow) */}
            <div className="card yellow-card">
              <h3>⏰ Chấm Công Nhanh</h3>
              <div className="checkin-grid">
                <div className="stat-box">
                  <span className="label">Thời gian hiện tại</span>
                  <h2 className="big-time">{currentTime}</h2>
                  <button className="btn-white">✓ Check In</button>
                </div>
                <div className="stat-box">
                  <span className="label">Trạng thái hôm nay</span>
                  <h2 className="status-text">Chưa check in</h2>
                  <button className="btn-disabled" disabled>✗ Check Out</button>
                </div>
              </div>
            </div>

            {/* 📝 Work Reporting Form */}
            <div className="card work-report-card">
              <h3>📝 Báo Cáo Công Việc</h3>
              <form className="report-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Loại công việc</label>
                    <input type="text" placeholder="Nhập loại công việc..." />
                  </div>
                  <div className="form-group">
                    <label>Thời gian thực hiện (giờ)</label>
                    <input type="number" placeholder="0" />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Mô tả công việc chi tiết</label>
                  <textarea rows="4" placeholder="Mô tả chi tiết công việc đã thực hiện..."></textarea>
                </div>

                <div className="upload-area">
                  <label>Upload tài liệu (nếu có)</label>
                  <div className="file-dropzone">
                     <span>📁 Click để chọn file</span>
                  </div>
                </div>

                <button type="button" className="btn-primary">💾 Lưu Báo Cáo</button>
              </form>
            </div>
          </div>

          {/* 3. RIGHT COLUMN - SUMMARY STATS */}
          <div className="stats-column">
            <div className="card">
              <h3>Thống Kê Cá Nhân</h3>
              <div className="stat-item">
                <span>Số lượt chấm công:</span>
                <strong>{attendance.length}</strong>
              </div>
              <div className="stat-item">
                <span>Khoản chi phí đã báo cáo:</span>
                <strong>{expenses.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}