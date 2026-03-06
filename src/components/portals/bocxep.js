// src/components/portals/bocxep.js
import React, { useState, useEffect } from 'react';
import { attendanceService } from  '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';

export default function BocXepPortal({ user, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [workHistory, setWorkHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state cho báo cáo công việc
  const [workReport, setWorkReport] = useState({
    container_count: '',
    total_weight: '',
    cargo_type: '',
    work_area: '',
    notes: '',
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load data khi component mount
  useEffect(() => {
    loadTodayAttendance();
    loadWorkHistory();
  }, []);

  // =============================================================================
  // DATA LOADING
  // =============================================================================
  const loadTodayAttendance = async () => {
    try {
      const data = await attendanceService.getTodayAttendance(user.employee_id);
      setTodayAttendance(data);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const loadWorkHistory = async () => {
    try {
      // Load attendance history (7 days)
      const attendanceData = await attendanceService.getEmployeeHistory(user.employee_id, 7);
      
      // Load work reports (7 days)
      const reportsData = await employeeService.getWorkReports(user.employee_id, 7);

      // Merge data by date
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
      console.error('Error loading work history:', error);
    }
  };

  // =============================================================================
  // CHECK IN/OUT
  // =============================================================================
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

  // =============================================================================
  // WORK REPORT SUBMISSION
  // =============================================================================
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
      
      // Reset form
      setWorkReport({
        container_count: '',
        total_weight: '',
        cargo_type: '',
        work_area: '',
        notes: '',
      });
      
      alert('✅ Đã lưu báo cáo công việc!');
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================
  return (
    <div style={styles.container}>
      <style>{globalStyles}</style>

      {/* Header */}
      <header style={styles.header}>
        <div>
          <div style={styles.headerIcon}>📦</div>
          <h1 style={styles.headerTitle}>Nhập Liệu - Nhóm Bốc Xếp</h1>
        </div>
        <div style={styles.headerRight}>
          <select style={styles.employeeSelect}>
            <option>{user.name}</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* PHẦN 1: CHẤM CÔNG NHANH */}
        <div style={styles.checkInSection}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.titleIcon}>⏰</span>
            Chấm Công Nhanh
          </h2>

          <div style={styles.checkInGrid}>
            {/* Left: Clock */}
            <div style={styles.clockCard}>
              <div style={styles.clockLabel}>Thời gian hiện tại</div>
              <div style={styles.clockTime}>
                {currentTime.toTimeString().slice(0, 8)}
              </div>
              <button 
                style={{...styles.btn, ...styles.btnCheckIn}}
                onClick={handleCheckIn}
                disabled={loading || todayAttendance}
              >
                ✓ Check In
              </button>
            </div>

            {/* Right: Status */}
            <div style={styles.statusCard}>
              <div style={styles.clockLabel}>Trạng thái hôm nay</div>
              {todayAttendance ? (
                <>
                  <div style={styles.statusText}>
                    Đã check in: {todayAttendance.check_in}
                  </div>
                  {todayAttendance.check_out ? (
                    <div style={{...styles.statusText, color: '#10b981'}}>
                      ✅ Đã check out: {todayAttendance.check_out}
                    </div>
                  ) : (
                    <button 
                      style={{...styles.btn, ...styles.btnCheckOut}}
                      onClick={handleCheckOut}
                      disabled={loading}
                    >
                      ✗ Check Out
                    </button>
                  )}
                </>
              ) : (
                <div style={{...styles.statusText, color: '#f59e0b'}}>
                  Chưa check in
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PHẦN 2: BÁO CÁO CÔNG VIỆC HÔM NAY */}
        <div style={styles.reportSection}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.titleIcon}>📝</span>
            Báo Cáo Công Việc Hôm Nay
          </h2>

          <form onSubmit={handleSubmitWorkReport} style={styles.form}>
            <div style={styles.formGrid}>
              {/* Số container */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Số container đã xếp/dỡ</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Nhập số lượng"
                  value={workReport.container_count}
                  onChange={(e) => setWorkReport({...workReport, container_count: e.target.value})}
                  min="0"
                />
              </div>

              {/* Tổng trọng lượng */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Tổng trọng lượng (tấn)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  placeholder="0.0"
                  value={workReport.total_weight}
                  onChange={(e) => setWorkReport({...workReport, total_weight: e.target.value})}
                  min="0"
                />
              </div>

              {/* Loại hàng hóa */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Loại hàng hóa</label>
                <select
                  style={styles.select}
                  value={workReport.cargo_type}
                  onChange={(e) => setWorkReport({...workReport, cargo_type: e.target.value})}
                >
                  <option value="">Chọn loại</option>
                  <option value="Hàng điện tử">Hàng điện tử</option>
                  <option value="Hàng may mặc">Hàng may mặc</option>
                  <option value="Hàng thực phẩm">Hàng thực phẩm</option>
                  <option value="Hàng xây dựng">Hàng xây dựng</option>
                  <option value="Hàng nông sản">Hàng nông sản</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Khu vực làm việc */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Khu vực làm việc</label>
                <select
                  style={styles.select}
                  value={workReport.work_area}
                  onChange={(e) => setWorkReport({...workReport, work_area: e.target.value})}
                >
                  <option value="">Chọn khu vực</option>
                  <option value="Kho A">Kho A</option>
                  <option value="Kho B">Kho B</option>
                  <option value="Kho C">Kho C</option>
                  <option value="Bãi 1">Bãi 1</option>
                  <option value="Bãi 2">Bãi 2</option>
                  <option value="Cảng">Cảng</option>
                </select>
              </div>
            </div>

            {/* Ghi chú */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Ghi chú / Vấn đề phát sinh</label>
              <textarea
                style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
                placeholder="Mô tả công việc, vấn đề gặp phải..."
                value={workReport.notes}
                onChange={(e) => setWorkReport({...workReport, notes: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              style={{...styles.btn, ...styles.btnSubmit}}
              disabled={loading}
            >
              💾 Lưu Báo Cáo
            </button>
          </form>
        </div>

        {/* PHẦN 3: LỊCH SỬ LÀM VIỆC */}
        <div style={styles.historySection}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.titleIcon}>📊</span>
            Lịch Sử Làm Việc (7 Ngày Gần Nhất)
          </h2>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>NGÀY</th>
                  <th style={styles.th}>CHECK IN</th>
                  <th style={styles.th}>CHECK OUT</th>
                  <th style={styles.th}>SỐ CONTAINER</th>
                  <th style={styles.th}>TRỌNG LƯỢNG</th>
                </tr>
              </thead>
              <tbody>
                {workHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={styles.emptyState}>
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  workHistory.map((item, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>{formatDate(item.date)}</td>
                      <td style={styles.td}>{item.check_in}</td>
                      <td style={styles.td}>
                        {item.check_out ? (
                          item.check_out
                        ) : (
                          <span style={styles.pendingBadge}>CHƯA CHECKOUT</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {item.container_count > 0 ? item.container_count : '-'}
                      </td>
                      <td style={styles.td}>
                        {item.total_weight > 0 ? (
                          <strong>{item.total_weight} tấn</strong>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Logout Button */}
      <div style={styles.logoutContainer}>
        <button style={styles.logoutBtn} onClick={onLogout}>
          🚪 Đăng Xuất
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// =============================================================================
// STYLES
// =============================================================================
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
`;

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
  },
  
  header: {
    background: 'white',
    borderRadius: '1.5rem',
    padding: '1.5rem 2rem',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  headerIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  headerTitle: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    gap: '1rem',
  },
  employeeSelect: {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    border: '2px solid #e2e8f0',
    fontSize: '1rem',
    fontWeight: 600,
    background: 'white',
    cursor: 'pointer',
  },

  main: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  checkInSection: {
    background: 'white',
    borderRadius: '1.5rem',
    padding: '2rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  reportSection: {
    background: 'white',
    borderRadius: '1.5rem',
    padding: '2rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  historySection: {
    background: 'white',
    borderRadius: '1.5rem',
    padding: '2rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },

  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  titleIcon: {
    fontSize: '1.75rem',
  },

  checkInGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  clockCard: {
    background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    borderRadius: '1.25rem',
    padding: '2rem',
    textAlign: 'center',
    color: 'white',
  },
  statusCard: {
    background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)',
    borderRadius: '1.25rem',
    padding: '2rem',
    textAlign: 'center',
    color: 'white',
  },
  clockLabel: {
    fontSize: '0.95rem',
    opacity: 0.9,
    marginBottom: '1rem',
    fontWeight: 500,
  },
  clockTime: {
    fontSize: '3rem',
    fontWeight: 800,
    marginBottom: '1.5rem',
    fontFamily: 'monospace',
  },
  statusText: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },

  btn: {
    padding: '1rem 2rem',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, sans-serif',
  },
  btnCheckIn: {
    background: 'white',
    color: '#8b5cf6',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  btnCheckOut: {
    background: 'rgba(255,255,255,0.3)',
    color: 'white',
    border: '2px solid white',
  },
  btnSubmit: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    marginTop: '1rem',
    width: '100%',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },

  form: {
    marginTop: '1.5rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.25rem',
    marginBottom: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '0.5rem',
  },
  input: {
    padding: '0.875rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.3s ease',
  },
  select: {
    padding: '0.875rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontFamily: 'Inter, sans-serif',
    background: 'white',
    cursor: 'pointer',
  },

  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '1rem',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    background: '#f8fafc',
    fontWeight: 700,
    fontSize: '0.875rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.2s ease',
  },
  td: {
    padding: '1rem',
    fontSize: '0.95rem',
    color: '#1e293b',
  },
  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  pendingBadge: {
    padding: '0.375rem 0.875rem',
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    borderRadius: '2rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    textTransform: 'uppercase',
  },

  logoutContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  logoutBtn: {
    padding: '0.875rem 2rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
};