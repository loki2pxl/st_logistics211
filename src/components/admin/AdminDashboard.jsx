// src/components/admin/AdminDashboard.jsx
// ============================================================================
// MANAGER DASHBOARD - Analytics, Expense Approvals, KPI & Attendance Management
// ============================================================================

import React, { useState, useEffect, useCallback } from "react";
import attendanceService from "../../services/attendanceService";
import shipmentService from "../../services/shipmentService";
import expenseService from "../../services/expenseService";
import employeeService from "../../services/employeeService";
import kpiService from "../../services/kpiService";
import "../../styles/global.css";

export function AdminDashboard({ user, onLogout, isDbLive, onToggleDbMode }) {
  // Navigation Tabs
  const [activeMenu, setActiveMenu] = useState("overview"); // overview, approvals, hr, kpi

  // Database Data States
  const [attendance, setAttendance] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [workReports, setWorkReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Branch Selector
  const [currentBranch, setCurrentBranch] = useState(user.branch || "hanoi");

  // KPI Edit Form States
  const [selectedEmpKpi, setSelectedEmpKpi] = useState(null);
  const [kpiForm, setKpiForm] = useState({
    score: 100,
    base_salary: 8000000,
    bonus: 0,
    deductions: 0,
    notes: ""
  });

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all records
      const [empList, attList, shipList, expList, kpiList, wrList] = await Promise.all([
        employeeService.getEmployees(currentBranch),
        attendanceService.getAttendanceByBranch(currentBranch, new Date().toISOString().split('T')[0]),
        shipmentService.getShipments(currentBranch),
        expenseService.getExpenses(currentBranch),
        kpiService.getKPI(currentBranch),
        employeeService.getWorkReports(null, 30) // fetch loading logs for the month
      ]);

      setEmployees(empList || []);
      setAttendance(attList || []);
      setShipments(shipList || []);
      setExpenses(expList || []);
      setKpis(kpiList || []);
      setWorkReports(wrList || []);
    } catch (err) {
      console.error("Error loading manager analytics data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentBranch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Expense Approval
  const handleApproveExpense = async (expenseId) => {
    try {
      setLoading(true);
      await expenseService.approveExpense(expenseId, user.name);
      alert("✅ Đã phê duyệt khoản chi phí thành công!");
      await loadDashboardData();
    } catch (error) {
      alert("❌ Lỗi phê duyệt: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Open KPI Editor
  const handleEditKpi = (emp) => {
    // Find if KPI already exists for this employee for '2026-06'
    const existing = kpis.find(k => k.employee_id === emp.employee_id && k.month === "2026-06");
    setSelectedEmpKpi(emp);
    
    // Default base salary representation
    const defaultBase = emp.role === 'laixe' ? 12000000 : emp.role === 'bocxep' ? 9000000 : 10000000;
    setKpiForm({
      score: existing ? existing.score : 100,
      base_salary: existing ? existing.base_salary : defaultBase,
      bonus: existing ? existing.bonus : 0,
      deductions: existing ? existing.deductions : 0,
      notes: existing ? existing.notes : "Hoàn thành nhiệm vụ."
    });
  };

  // Submit KPI Upsert
  const handleSaveKpi = async (e) => {
    e.preventDefault();
    if (!selectedEmpKpi) return;
    try {
      setLoading(true);
      await kpiService.upsertKPI({
        employee_id: selectedEmpKpi.employee_id,
        branch: currentBranch,
        month: "2026-06",
        score: parseFloat(kpiForm.score) || 0,
        base_salary: parseFloat(kpiForm.base_salary) || 0,
        bonus: parseFloat(kpiForm.bonus) || 0,
        deductions: parseFloat(kpiForm.deductions) || 0,
        notes: kpiForm.notes
      });
      alert("✅ Đã cập nhật điểm KPI & Lương thành công!");
      setSelectedEmpKpi(null);
      await loadDashboardData();
    } catch (error) {
      alert("❌ Lỗi lưu KPI: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalRevenue = shipments
    .filter(s => s.status === 'delivered')
    .reduce((sum, item) => sum + (item.total_price || item.price || 0), 0);
  
  const totalExpenses = expenses
    .filter(e => e.approved) // Approved expenses only
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  const pendingExpensesCount = expenses.filter(e => !e.approved).length;

  const getRoleLabel = (role) => {
    const rolesMap = {
      laixe: '🚛 Lái Xe',
      bocxep: '📦 Bốc Xếp',
      vanphong: '💼 Văn Phòng',
      admin: '👔 Quản Lý'
    };
    return rolesMap[role] || role;
  };

  if (loading && shipments.length === 0) {
    return (
      <div className="loading-screen" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Đang tải dữ liệu báo cáo chi nhánh...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="logo-section" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ letterSpacing: '2px', fontFamily: 'Bebas Neue, sans-serif', color: 'white', margin: 0 }}>
              LOGISTICS HUB
            </h2>
            <small style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              BÀN ĐIỀU HÀNH QUẢN LÝ
            </small>
          </div>
          
          <nav className="nav-menu">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li 
                className={`nav-item ${activeMenu === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveMenu('overview')}
              >
                📊 Tổng Quan & Phân Tích
              </li>
              <li 
                className={`nav-item ${activeMenu === 'approvals' ? 'active' : ''}`}
                onClick={() => setActiveMenu('approvals')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>💰 Phê Duyệt Chi Phí</span>
                {pendingExpensesCount > 0 && (
                  <span style={{ background: '#ef4444', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {pendingExpensesCount}
                  </span>
                )}
              </li>
              <li 
                className={`nav-item ${activeMenu === 'hr' ? 'active' : ''}`}
                onClick={() => setActiveMenu('hr')}
              >
                👥 Điểm Danh Nhân Sự
              </li>
              <li 
                className={`nav-item ${activeMenu === 'kpi' ? 'active' : ''}`}
                onClick={() => setActiveMenu('kpi')}
              >
                📈 Quản Lý Lương & KPI
              </li>
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', color: 'white', fontSize: '0.9rem' }}>{user.name}</div>
            <small style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginTop: '3px' }}>👔 Ban Giám Đốc</small>
            
            {/* Live indicator */}
            <div style={{ marginTop: '10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '5px', color: isDbLive ? '#86efac' : '#fef08a' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isDbLive ? '#22c55e' : '#eab308' }}></span>
              {isDbLive ? 'Live Database Mode' : 'Demo Mode (Mock)'}
            </div>

            <button 
              onClick={() => onToggleDbMode(!isDbLive)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '0.75rem',
                padding: '6px',
                borderRadius: '6px',
                marginTop: '10px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔄 Đổi sang {isDbLive ? 'Mock Data' : 'Supabase'}
            </button>
          </div>

          <button 
            onClick={onLogout} 
            className="btn-primary" 
            style={{ width: '100%', background: '#ef4444', border: 'none', padding: '12px', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* Header */}
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
              Bàn Làm Việc Giám Đốc 👋
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
              Xem phân tích hiệu suất và quản lý nhân sự tại chi nhánh.
            </p>
          </div>

          {/* BRANCH SELECTOR */}
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
            <button 
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: currentBranch === 'hanoi' ? '#1e293b' : 'transparent',
                color: currentBranch === 'hanoi' ? 'white' : '#475569',
                transition: 'all 0.2s'
              }}
              onClick={() => setCurrentBranch('hanoi')}
            >
              📍 Hà Nội
            </button>
            <button 
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: currentBranch === 'saigon' ? '#1e293b' : 'transparent',
                color: currentBranch === 'saigon' ? 'white' : '#475569',
                transition: 'all 0.2s'
              }}
              onClick={() => setCurrentBranch('saigon')}
            >
              📍 Sài Gòn
            </button>
          </div>
        </header>

        {/* ------------------------------------------------------------------
            MENU TỔNG QUAN & PHÂN TÍCH HIỆU SUẤT
            ------------------------------------------------------------------ */}
        {activeMenu === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Financial Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ borderLeft: '6px solid #10b981' }}>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Tổng Doanh Thu Hóa Đơn
                </span>
                <h2 style={{ fontSize: '2.2rem', color: '#10b981', fontWeight: 'bold', margin: '10px 0' }}>
                  {totalRevenue.toLocaleString()} ₫
                </h2>
                <small style={{ color: '#64748b' }}>Tính trên các đơn hàng đã hoàn thành giao</small>
              </div>

              <div className="card" style={{ borderLeft: '6px solid #ef4444' }}>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Tổng Chi Phí Hoạt Động (Đã Duyệt)
                </span>
                <h2 style={{ fontSize: '2.2rem', color: '#ef4444', fontWeight: 'bold', margin: '10px 0' }}>
                  -{totalExpenses.toLocaleString()} ₫
                </h2>
                <small style={{ color: '#64748b' }}>Chi phí xăng xe, mua sắm vật dụng đã thanh toán</small>
              </div>

              <div className="card" style={{ borderLeft: '6px solid #3b82f6', background: 'linear-gradient(to right, #ffffff, #eff6ff)' }}>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Lợi Nhuận Thuần Chi Nhánh
                </span>
                <h2 style={{ fontSize: '2.2rem', color: '#2563eb', fontWeight: 'bold', margin: '10px 0' }}>
                  {(totalRevenue - totalExpenses).toLocaleString()} ₫
                </h2>
                <small style={{ color: '#64748b' }}>Lợi nhuận gộp sau khi trừ chi phí vận hành</small>
              </div>
            </div>

            {/* PRODUCTIVITY PERFORMANCE ANALYSIS */}
            <div className="card">
              <h3 style={{ color: '#1e1b4b', marginBottom: '20px', fontSize: '1.25rem', fontWeight: 'bold' }}>
                📈 Phân Tích Hiệu Suất Vận Hành Tổ Lái Xe & Bốc Xếp
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
                {/* Drivers summary */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '15px' }}>
                  <h4 style={{ color: '#2563eb', margin: '0 0 10px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    🚛 Thống Kê Tuyến Chạy & Nhiên Liệu Lái Xe
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Mã Chuyến</th>
                        <th style={{ padding: '8px' }}>Lái Xe</th>
                        <th style={{ padding: '8px' }}>Tuyến Chạy</th>
                        <th style={{ padding: '8px' }}>Cự Ly</th>
                        <th style={{ padding: '8px' }}>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Chưa ghi nhận chuyến chạy</td></tr>
                      ) : (
                        shipments.slice(0, 5).map((s, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{s.order_code}</td>
                            <td style={{ padding: '8px' }}>{s.driver_name}</td>
                            <td style={{ padding: '8px' }}>{s.from_location} → {s.to_location}</td>
                            <td style={{ padding: '8px' }}>{s.distance_km} km</td>
                            <td style={{ padding: '8px' }}>
                              <span style={{
                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                                background: s.status === 'delivered' ? '#dcfce7' : '#fef9c3',
                                color: s.status === 'delivered' ? '#166534' : '#854d0e'
                              }}>{s.status === 'delivered' ? 'Đã giao' : 'Đang đi'}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Loaders summary */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '15px' }}>
                  <h4 style={{ color: '#d97706', margin: '0 0 10px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    📦 Sản Lượng Xếp Dỡ Kho Bãi (Loaders)
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Ngày</th>
                        <th style={{ padding: '8px' }}>Nhân Viên Xếp Dỡ</th>
                        <th style={{ padding: '8px' }}>Khu Vực</th>
                        <th style={{ padding: '8px' }}>Số Container</th>
                        <th style={{ padding: '8px' }}>Sản Lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workReports.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Chưa ghi nhận sản lượng xếp dỡ</td></tr>
                      ) : (
                        workReports.slice(0, 5).map((w, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px' }}>{w.date}</td>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{w.employee_name}</td>
                            <td style={{ padding: '8px' }}>{w.work_area || 'Kho chính'}</td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>{w.container_count}</td>
                            <td style={{ padding: '8px', color: '#d97706', fontWeight: 'bold' }}>{w.total_weight} tấn</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------
            MENU PHÊ DUYỆT CHI PHÍ
            ------------------------------------------------------------------ */}
        {activeMenu === 'approvals' && (
          <div className="card">
            <h3 style={{ color: '#1e1b4b', marginBottom: '20px', fontSize: '1.3rem', fontWeight: 'bold' }}>
              💰 Danh Sách Khoản Chi Chờ Phê Duyệt
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Ngày gửi</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Nhân viên</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Loại chi phí</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Số tiền</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Mô tả chi tiết</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Chứng từ / Hóa đơn</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                        Chưa có khoản chi phí nào được báo cáo tại chi nhánh này
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: !exp.approved ? '#fffbeb' : 'transparent' }}>
                        <td style={{ padding: '12px' }}>{exp.date}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{exp.paid_by || 'Nhân viên'}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                            background: exp.type === 'fuel' ? '#eff6ff' : '#f1f5f9',
                            color: exp.type === 'fuel' ? '#2563eb' : '#475569'
                          }}>
                            {exp.type === 'fuel' ? 'Xăng dầu' : exp.type === 'warehouse' ? 'Kho bãi' : 'Văn phòng phẩm'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: exp.approved ? '#10b981' : '#d97706' }}>
                          {exp.amount.toLocaleString()} ₫
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>{exp.description}</td>
                        <td style={{ padding: '12px' }}>
                          {exp.invoice_urls && exp.invoice_urls.length > 0 ? (
                            <a href={exp.invoice_urls[0]} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: '0.85rem' }}>
                              📄 Xem chứng từ
                            </a>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Không đính kèm</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {exp.approved ? (
                            <span style={{ padding: '4px 10px', background: '#dcfce7', color: '#15803d', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              Đã Duyệt
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveExpense(exp.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)'
                              }}
                            >
                              Duyệt Chi
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            MENU ĐIỂM DANH NHÂN SỰ
            ------------------------------------------------------------------ */}
        {activeMenu === 'hr' && (
          <div className="card">
            <h3 style={{ color: '#1e1b4b', marginBottom: '20px', fontSize: '1.3rem', fontWeight: 'bold' }}>
              👥 Nhật Ký Chấm Công Hôm Nay ({new Date().toLocaleDateString('vi-VN')})
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Nhân Viên</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Vai Trò / Tổ Nhóm</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Giờ Vào (Check In)</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Giờ Ra (Check Out)</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Trạng Thái Ca</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                        Chưa có lượt chấm công nào được ghi nhận hôm nay.
                      </td>
                    </tr>
                  ) : (
                    attendance.map((att, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{att.employee_name}</td>
                        <td style={{ padding: '12px' }}>{getRoleLabel(att.group)}</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold', color: '#10b981' }}>
                          🕒 {att.check_in}
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold', color: att.check_out ? '#ef4444' : '#64748b' }}>
                          🕒 {att.check_out || 'Đang làm việc'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                            background: att.check_out ? '#e2e8f0' : '#dcfce7',
                            color: att.check_out ? '#475569' : '#15803d'
                          }}>
                            {att.check_out ? 'Đã hoàn thành ca' : 'Đang trực ca'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            MENU ĐIỂM KPI & LƯƠNG NHÂN VIÊN
            ------------------------------------------------------------------ */}
        {activeMenu === 'kpi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* KPI list */}
            <div className="card">
              <h3 style={{ color: '#1e1b4b', marginBottom: '20px', fontSize: '1.3rem', fontWeight: 'bold' }}>
                📈 Quản Lý Điểm KPI & Tính Lương Nhân Sự
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Mã NV</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Họ Tên</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Vai Trò</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Điểm KPI Tháng 6</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Lương Cơ Bản</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Thưởng / Phạt</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Thực Nhận</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, idx) => {
                      // Find KPI matching employee_id
                      const kpi = kpis.find(k => k.employee_id === emp.employee_id && k.month === "2026-06");
                      const defaultBase = emp.role === 'laixe' ? 12000000 : emp.role === 'bocxep' ? 9000000 : 10000000;
                      
                      const base = kpi ? kpi.base_salary : defaultBase;
                      const bonus = kpi ? kpi.bonus : 0;
                      const ded = kpi ? kpi.deductions : 0;
                      const score = kpi ? kpi.score : 'Chưa nhập';
                      const net = base + bonus - ded;

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px', fontFamily: 'monospace' }}>{emp.employee_id}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{emp.name}</td>
                          <td style={{ padding: '12px' }}>{getRoleLabel(emp.role)}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#4f46e5' }}>
                            {score} {typeof score === 'number' && '%'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{base.toLocaleString()} ₫</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.85rem' }}>
                            <span style={{ color: '#10b981' }}>+{bonus.toLocaleString()}</span> / <span style={{ color: '#ef4444' }}>-{ded.toLocaleString()}</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>
                            {net.toLocaleString()} ₫
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleEditKpi(emp)}
                              style={{
                                padding: '6px 12px',
                                background: '#6366f1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              ✏️ Cập Nhật KPI
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* KPI Editor Modal / Panel */}
            {selectedEmpKpi && (
              <div className="card" style={{ border: '2px solid #6366f1', background: '#f5f3ff' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#4f46e5', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  ✏️ Điều chỉnh KPI & Lương Tháng 6: {selectedEmpKpi.name} ({selectedEmpKpi.employee_id})
                </h4>
                
                <form onSubmit={handleSaveKpi}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                    <div className="form-group">
                      <label>Điểm số KPI (0 - 100)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={kpiForm.score} 
                        onChange={(e) => setKpiForm({...kpiForm, score: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Lương cơ bản (₫)</label>
                      <input 
                        type="number" 
                        value={kpiForm.base_salary} 
                        onChange={(e) => setKpiForm({...kpiForm, base_salary: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Khoản thưởng thêm (₫)</label>
                      <input 
                        type="number" 
                        value={kpiForm.bonus} 
                        onChange={(e) => setKpiForm({...kpiForm, bonus: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Khoản giảm trừ/Phạt (₫)</label>
                      <input 
                        type="number" 
                        value={kpiForm.deductions} 
                        onChange={(e) => setKpiForm({...kpiForm, deductions: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Ghi chú / Đánh giá nhận xét</label>
                    <textarea 
                      rows="2"
                      value={kpiForm.notes}
                      onChange={(e) => setKpiForm({...kpiForm, notes: e.target.value})}
                      placeholder="Mô tả hiệu suất hoàn thành công việc..."
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="submit" 
                      style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      💾 Lưu Điểm KPI
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setSelectedEmpKpi(null)}
                      style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}