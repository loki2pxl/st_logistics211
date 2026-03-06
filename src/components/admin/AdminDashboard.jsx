import React, { useState, useEffect, useCallback } from "react";
import * as mockService from "../../data/dataService";
import "../../styles/global.css";

export function AdminDashboard({ user, onLogout }) {
  // 1. Data States
  const [attendance, setAttendance] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Branch Toggle State (Initialized from user profile)
  const [currentBranch, setCurrentBranch] = useState(user.branch || "hanoi");

  // 3. Fetch Data using mockService
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [attData, shipData, expData, empData] = await Promise.all([
        mockService.getAttendance(),
        mockService.getShipments(),
        mockService.getExpenses(),
        mockService.getEmployees()
      ]);

      // Filter everything by the selected branch (hanoi or saigon)
      setAttendance(attData.filter(a => a.branch === currentBranch) || []);
      setShipments(shipData.filter(s => s.branch === currentBranch) || []);
      setExpenses(expData.filter(e => e.branch === currentBranch) || []);
      setEmployees(empData.filter(emp => emp.branch === currentBranch) || []);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentBranch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 4. Calculate Statistics for Vietnamese Reports
  const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalBillValue = shipments.reduce((sum, item) => sum + (item.total_price || 0), 0);

  if (loading) return <div className="loading-screen">Đang tải dữ liệu hệ thống...</div>;

  return (
    <div className="dashboard-container">
      {/* SIDEBAR SECTION */}
      <aside className="sidebar">
        <div className="logo-section">
          <h2>LOGISTICS HUB</h2>
        </div>
        <nav className="nav-menu">
          <ul>
            <li className="nav-item active">📊 Tổng Quan</li>
            <li className="nav-item">⏰ Chấm Công HR</li>
            <li className="nav-item">🚛 Tracking Đơn Hàng</li>
            <li className="nav-item">💰 Quản Lý Chi Phí</li>
            <li className="nav-item">📈 KPI & Lương</li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p>{user.name} (Admin)</p>
          <button onClick={onLogout} className="logout-btn">Đăng xuất</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Dashboard Quản Lý</h1>
          
          {/* LOCATION TOGGLE */}
          <div className="branch-selector">
            <button 
              className={`branch-btn ${currentBranch === 'hanoi' ? 'active' : ''}`}
              onClick={() => setCurrentBranch('hanoi')}
            >
              📍 Hà Nội
            </button>
            <button 
              className={`branch-btn ${currentBranch === 'saigon' ? 'active' : ''}`}
              onClick={() => setCurrentBranch('saigon')}
            >
              📍 Sài Gòn
            </button>
          </div>
        </header>

        {/* STATISTICS GRID */}
        <div className="grid-layout">
          
          {/* HR REPORT CARD */}
          <div className="card">
            <div className="card-header">
              <h3>👥 Báo Cáo Nhân Sự (HR)</h3>
            </div>
            <div className="stat-row">
              <div className="stat-box">
                <span>Tổng nhân viên</span>
                <h2>{employees.length}</h2>
              </div>
              <div className="stat-box">
                <span>Lượt chấm công</span>
                <h2>{attendance.length}</h2>
              </div>
            </div>
          </div>

          {/* TOTAL BILLS / SHIPMENTS CARD */}
          <div className="card yellow-card">
            <div className="card-header">
              <h3>📦 Tổng Đơn Hàng (Total Bill)</h3>
            </div>
            <div className="stat-row">
              <div className="stat-box">
                <span>Số lượng đơn</span>
                <h2>{shipments.length}</h2>
              </div>
              <div className="stat-box">
                <span>Tổng doanh thu</span>
                <h2>{totalBillValue.toLocaleString()} VNĐ</h2>
              </div>
            </div>
          </div>

          {/* EXPENSES REPORT CARD */}
          <div className="card">
            <div className="card-header">
              <h3>💸 Quản Lý Chi Phí (Expenses)</h3>
            </div>
            <div className="stat-row">
              <div className="stat-box">
                <span>Số khoản chi</span>
                <h2>{expenses.length}</h2>
              </div>
              <div className="stat-box">
                <span>Tổng tiền chi</span>
                <h2 style={{color: 'var(--danger)'}}>-{totalExpenses.toLocaleString()} VNĐ</h2>
              </div>
            </div>
          </div>

        </div>

        {/* DATA TABLE PREVIEW (Optional but useful for Admins) */}
        <section className="data-preview" style={{marginTop: '2rem'}}>
          <div className="card">
            <h3>Danh sách nhân viên tại {currentBranch === 'hanoi' ? 'Hà Nội' : 'Sài Gòn'}</h3>
            <table className="admin-table" style={{width: '100%', marginTop: '1rem', color: '#333'}}>
              <thead>
                <tr style={{textAlign: 'left', borderBottom: '1px solid #eee'}}>
                  <th>ID</th>
                  <th>Họ Tên</th>
                  <th>Vai Trò</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} style={{borderBottom: '1px solid #f9f9f9', padding: '10px 0'}}>
                    <td>{emp.employee_id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.role}</td>
                    <td style={{color: 'var(--success)'}}>Đang làm việc</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}