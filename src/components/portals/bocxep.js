// src/components/portals/bocxep.js
// ============================================================================
// BỐC XẾP PORTAL - Nhập liệu cho nhóm bốc xếp
// ============================================================================
import React, { useState, useEffect } from "react";
import attendanceService from "../../services/attendanceService";
import employeeService from "../../services/employeeService";
import "../../styles/global.css";

export default function BocXepPortal({ user, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [workHistory, setWorkHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [workReport, setWorkReport] = useState({
    container_count: '',
    total_weight: '',
    cargo_type: '',
    work_area: '',
    notes: '',
  });

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load data
  useEffect(() => {
    loadTodayAttendance();
    loadWorkHistory();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      const data = await attendanceService.getTodayAttendance(user.employee_id);
      setTodayAttendance(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadWorkHistory = async () => {
    try {
      const attendanceData = await attendanceService.getEmployeeHistory(user.employee_id, 7);
      const reportsData = await employeeService.getWorkReports(user.employee_id, 7);

      const merged = (attendanceData || []).map(att => {
        const report = (reportsData || []).find(r => r.date === att.date);
        return {
          ...att,
          container_count: report?.container_count || 0,
          total_weight: report?.total_weight || 0,
        };
      });

      setWorkHistory(merged);
    } catch (error) {
      console.error('Error:', error);
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
      await loadWorkHistory();
      alert('✅ Check-out thành công!');
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWorkReport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await employeeService.submitWorkReport({
        employee_id: user.employee_id,
        employee_name: user.name,
        branch: user.branch,
        ...workReport,
      });

      await loadWorkHistory();
      setWorkReport({
        container_count: '',
        total_weight: '',
        cargo_type: '',
        work_area: '',
        notes: '',
      });
      alert('✅ Đã lưu báo cáo!');
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);
    const totalMins = (outH * 60 + outM) - (inH * 60 + inM);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="portal-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#1e293b', margin: 0 }}>📦 Nhập Liệu - Nhóm Bốc Xếp</h3>
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Nhân viên: <strong>{user?.name}</strong>
        </div>
      </div>

      {/* Chấm công */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', color: 'white', border: 'none' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>⏰ Chấm Công Nhanh</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '1.5rem', borderRadius: '12px' }}>
            <span style={{ opacity: 0.9, fontSize: '0.9rem' }}>Thời gian hiện tại</span>
            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {currentTime.toLocaleTimeString('vi-VN')}
            </h2>
            <button 
              onClick={handleCheckIn}
              disabled={loading || todayAttendance}
              style={{ 
                width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', 
                cursor: todayAttendance ? 'not-allowed' : 'pointer',
                background: todayAttendance ? 'rgba(255,255,255,0.3)' : 'white', 
                color: todayAttendance ? 'rgba(255,255,255,0.7)' : '#8b5cf6' 
              }}
            >
              ✓ Check In
            </button>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '1.5rem', borderRadius: '12px' }}>
            <span style={{ opacity: 0.9, fontSize: '0.9rem' }}>Trạng thái hôm nay</span>
            <h2 style={{ fontSize: '1.5rem', margin: '1rem 0', fontWeight: 'bold' }}>
              {todayAttendance ? (
                todayAttendance.check_out ? 'Đã hoàn thành' : `Đã check-in: ${todayAttendance.check_in}`
              ) : 'Chưa check in'}
            </h2>
            <button 
              onClick={handleCheckOut}
              disabled={loading || !todayAttendance || todayAttendance?.check_out}
              style={{ 
                width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', 
                cursor: (!todayAttendance || todayAttendance?.check_out) ? 'not-allowed' : 'pointer',
                background: (!todayAttendance || todayAttendance?.check_out) ? 'rgba(255,255,255,0.2)' : 'white', 
                color: (!todayAttendance || todayAttendance?.check_out) ? 'rgba(255,255,255,0.5)' : '#8b5cf6' 
              }}
            >
              ✗ Check Out
            </button>
          </div>

        </div>
      </div>

      {/* Báo cáo công việc */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>📝 Báo Cáo Công Việc Hôm Nay</h3>
        <form onSubmit={handleSubmitWorkReport}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                Số container đã xếp/dỡ
              </label>
              <input
                type="number"
                value={workReport.container_count}
                onChange={(e) => setWorkReport({...workReport, container_count: e.target.value})}
                min="0"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                Tổng trọng lượng (tấn)
              </label>
              <input
                type="number"
                step="0.1"
                value={workReport.total_weight}
                onChange={(e) => setWorkReport({...workReport, total_weight: e.target.value})}
                min="0"
                placeholder="0.0"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                Loại hàng hóa
              </label>
              <select
                value={workReport.cargo_type}
                onChange={(e) => setWorkReport({...workReport, cargo_type: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="">Chọn loại</option>
                <option value="Hàng điện tử">Hàng điện tử</option>
                <option value="Hàng may mặc">Hàng may mặc</option>
                <option value="Hàng thực phẩm">Hàng thực phẩm</option>
                <option value="Hàng xây dựng">Hàng xây dựng</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                Khu vực làm việc
              </label>
              <select
                value={workReport.work_area}
                onChange={(e) => setWorkReport({...workReport, work_area: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="">Chọn khu vực</option>
                <option value="Kho A">Kho A</option>
                <option value="Kho B">Kho B</option>
                <option value="Kho C">Kho C</option>
                <option value="Bãi 1">Bãi 1</option>
                <option value="Cảng">Cảng</option>
              </select>
            </div>

          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
              Ghi chú / Vấn đề phát sinh
            </label>
            <textarea
              value={workReport.notes}
              onChange={(e) => setWorkReport({...workReport, notes: e.target.value})}
              rows="3"
              placeholder="Mô tả công việc..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ background: '#7e22ce', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            💾 Lưu Báo Cáo
          </button>
        </form>
      </div>

      {/* Lịch sử */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>📊 Lịch Sử Làm Việc (7 Ngày Gần Nhất)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>NGÀY</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>CHECK IN</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>CHECK OUT</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>TỔNG GIỜ</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>CONTAINER</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>TRỌNG LƯỢNG</th>
              </tr>
            </thead>
            <tbody>
              {workHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                workHistory.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>{formatDate(item.date)}</td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>{item.check_in}</td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>{item.check_out || '-'}</td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>{calculateHours(item.check_in, item.check_out)}</td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>{item.container_count > 0 ? item.container_count : '-'}</td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>
                      {item.total_weight > 0 ? <strong>{item.total_weight} tấn</strong> : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}