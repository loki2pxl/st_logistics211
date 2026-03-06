// src/components/portals/laixe.js
import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { shipmentService } from '../../services/shipmentService';
import { expenseService } from '../../services/expenseService';
import { storageService } from '../../services/storageService';

export default function LaiXePortal({ user, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [tripHistory, setTripHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Form state cho báo cáo chuyến đi
  const [tripReport, setTripReport] = useState({
    vehicle_plate: '',
    order_code: '',
    from_location: '',
    to_location: '',
    distance_km: '',
    fuel_liters: '',
    fuel_cost: '',
    delivery_status: 'shipping',
    notes: '',
  });

  // Danh sách xe (có thể load từ DB hoặc hardcode)
  const vehicles = [
    { id: 'VN-29A-12345', name: '29A-12345' },
    { id: 'VN-30B-67890', name: '30B-67890' },
    { id: 'VN-31C-11111', name: '31C-11111' },
    { id: 'VN-51D-22222', name: '51D-22222' },
  ];

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
    loadTripHistory();
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

  const loadTripHistory = async () => {
    try {
      // Load shipments assigned to this driver (7 days)
      const shipments = await shipmentService.getDriverShipments(user.employee_id, 7);
      
      // Load fuel expenses by this driver
      const expenses = await expenseService.getEmployeeExpenses(user.employee_id, 7);

      // Merge shipments với expenses theo date
      const merged = (shipments || []).map(shipment => {
        // Tìm chi phí xăng cùng ngày với chuyến đi
        const expense = (expenses || []).find(
          e => e.date === shipment.date && e.order_code === shipment.order_code
        );
        
        return {
          ...shipment,
          fuel_cost: expense?.amount || 0,
          distance_km: shipment.distance_km || 0,
        };
      });

      setTripHistory(merged);
    } catch (error) {
      console.error('Error loading trip history:', error);
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
      alert('✅ Check-out thành công!');
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // FILE UPLOAD
  // =============================================================================
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
  };

  const uploadInvoices = async () => {
    if (uploadedFiles.length === 0) return [];

    const uploadedUrls = [];
    for (const file of uploadedFiles) {
      try {
        const url = await storageService.uploadFile(file, 'fuel-invoices');
        if (url) uploadedUrls.push(url);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    return uploadedUrls;
  };

  // =============================================================================
  // TRIP REPORT SUBMISSION
  // =============================================================================
  const handleSubmitTripReport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload invoices nếu có
      const invoiceUrls = await uploadInvoices();

      // 1. Update/Create shipment
      await shipmentService.createDriverTrip({
        order_code: tripReport.order_code,
        driver_id: user.employee_id,
        driver_name: user.name,
        branch: user.branch,
        vehicle_plate: tripReport.vehicle_plate,
        from_location: tripReport.from_location,
        to_location: tripReport.to_location,
        distance_km: parseFloat(tripReport.distance_km) || 0,
        delivery_status: tripReport.delivery_status,
        notes: tripReport.notes,
      });

      // 2. Create fuel expense nếu có chi phí xăng
      if (tripReport.fuel_cost && parseFloat(tripReport.fuel_cost) > 0) {
        await expenseService.createFuelExpense({
          employee_id: user.employee_id,
          paid_by: user.name,
          branch: user.branch,
          order_code: tripReport.order_code,
          amount: parseFloat(tripReport.fuel_cost),
          fuel_liters: parseFloat(tripReport.fuel_liters) || 0,
          vehicle_plate: tripReport.vehicle_plate,
          description: `Xăng cho chuyến ${tripReport.from_location} → ${tripReport.to_location}`,
          invoice_urls: invoiceUrls,
        });
      }

      await loadTripHistory();
      
      // Reset form
      setTripReport({
        vehicle_plate: '',
        order_code: '',
        from_location: '',
        to_location: '',
        distance_km: '',
        fuel_liters: '',
        fuel_cost: '',
        delivery_status: 'shipping',
        notes: '',
      });
      setUploadedFiles([]);
      
      alert('✅ Đã lưu báo cáo chuyến đi!');
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
          <div style={styles.headerIcon}>🚛</div>
          <h1 style={styles.headerTitle}>Nhập Liệu - Nhóm Lái Xe</h1>
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

        {/* PHẦN 2: BÁO CÁO CHUYẾN ĐI */}
        <div style={styles.reportSection}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.titleIcon}>🚗</span>
            Báo Cáo Chuyến Đi
          </h2>

          <form onSubmit={handleSubmitTripReport} style={styles.form}>
            <div style={styles.formGrid}>
              {/* Biển số xe */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Biển số xe</label>
                <select
                  style={styles.select}
                  value={tripReport.vehicle_plate}
                  onChange={(e) => setTripReport({...tripReport, vehicle_plate: e.target.value})}
                  required
                >
                  <option value="">Chọn xe</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Mã đơn hàng */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Mã đơn hàng</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="DH-2024-XXX"
                  value={tripReport.order_code}
                  onChange={(e) => setTripReport({...tripReport, order_code: e.target.value})}
                  required
                />
              </div>

              {/* Điểm đi */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Điểm đi</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Nhập địa điểm"
                  value={tripReport.from_location}
                  onChange={(e) => setTripReport({...tripReport, from_location: e.target.value})}
                  required
                />
              </div>

              {/* Điểm đến */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Điểm đến</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Nhập địa điểm"
                  value={tripReport.to_location}
                  onChange={(e) => setTripReport({...tripReport, to_location: e.target.value})}
                  required
                />
              </div>

              {/* Số km đã chạy */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Số km đã chạy</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="0"
                  value={tripReport.distance_km}
                  onChange={(e) => setTripReport({...tripReport, distance_km: e.target.value})}
                  min="0"
                  required
                />
              </div>

              {/* Lượng xăng đổ */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Lượng xăng đổ (lít)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  placeholder="0"
                  value={tripReport.fuel_liters}
                  onChange={(e) => setTripReport({...tripReport, fuel_liters: e.target.value})}
                  min="0"
                />
              </div>

              {/* Chi phí xăng */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Chi phí xăng (VNĐ)</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="0"
                  value={tripReport.fuel_cost}
                  onChange={(e) => setTripReport({...tripReport, fuel_cost: e.target.value})}
                  min="0"
                />
              </div>

              {/* Trạng thái giao hàng */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Trạng thái giao hàng</label>
                <select
                  style={styles.select}
                  value={tripReport.delivery_status}
                  onChange={(e) => setTripReport({...tripReport, delivery_status: e.target.value})}
                  required
                >
                  <option value="shipping">Đang vận chuyển</option>
                  <option value="delivered">Đã giao hàng</option>
                  <option value="pending">Chưa xuất phát</option>
                </select>
              </div>
            </div>

            {/* Upload hóa đơn xăng */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Upload hóa đơn xăng</label>
              <div style={styles.fileUploadArea}>
                <input
                  type="file"
                  id="invoice-upload"
                  style={styles.fileInput}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                />
                <label htmlFor="invoice-upload" style={styles.fileUploadLabel}>
                  <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</span>
                  <span>Click để chọn file</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {uploadedFiles.length > 0 
                      ? `${uploadedFiles.length} file đã chọn`
                      : 'PDF, JPG, PNG'}
                  </span>
                </label>
              </div>
            </div>

            {/* Ghi chú chuyến đi */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Ghi chú chuyến đi</label>
              <textarea
                style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
                placeholder="Tình trạng xe, đường xá, thời tiết..."
                value={tripReport.notes}
                onChange={(e) => setTripReport({...tripReport, notes: e.target.value})}
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

        {/* PHẦN 3: LỊCH SỬ CHUYẾN ĐI */}
        <div style={styles.historySection}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.titleIcon}>📊</span>
            Lịch Sử Chuyến Đi
          </h2>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>NGÀY</th>
                  <th style={styles.th}>MÃ ĐƠN</th>
                  <th style={styles.th}>TUYẾN ĐƯỜNG</th>
                  <th style={styles.th}>SỐ KM</th>
                  <th style={styles.th}>CHI PHÍ XĂNG</th>
                  <th style={styles.th}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {tripHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyState}>
                      Chưa có chuyến đi nào
                    </td>
                  </tr>
                ) : (
                  tripHistory.map((trip, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>{formatDate(trip.date)}</td>
                      <td style={styles.td}><strong>{trip.order_code}</strong></td>
                      <td style={styles.td}>
                        {trip.from_location} → {trip.to_location}
                      </td>
                      <td style={styles.td}>{trip.distance_km} km</td>
                      <td style={styles.td}>
                        {trip.fuel_cost > 0 ? (
                          <strong>₫ {trip.fuel_cost.toLocaleString()}</strong>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={getStatusBadge(trip.delivery_status)}>
                          {getStatusLabel(trip.delivery_status)}
                        </span>
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

function getStatusLabel(status) {
  const labels = {
    'shipping': 'ĐANG ĐI',
    'delivered': 'ĐÃ GIAO',
    'pending': 'CHƯA XUẤT PHÁT',
  };
  return labels[status] || status;
}

function getStatusBadge(status) {
  const badges = {
    'shipping': { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
    'delivered': { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
    'pending': { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  };
  
  const style = badges[status] || badges.pending;
  
  return {
    ...style,
    padding: '0.375rem 0.875rem',
    borderRadius: '2rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };
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
    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    borderRadius: '1.25rem',
    padding: '2rem',
    textAlign: 'center',
    color: 'white',
  },
  statusCard: {
    background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)',
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
    color: '#3b82f6',
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

  // File upload
  fileUploadArea: {
    position: 'relative',
  },
  fileInput: {
    display: 'none',
  },
  fileUploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    border: '2px dashed #cbd5e1',
    borderRadius: '0.75rem',
    background: '#f8fafc',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
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
    fontSize: '0.8125rem',
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