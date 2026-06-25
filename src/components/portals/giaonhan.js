// src/components/portals/giaonhan.js
// ============================================================================
// GIAO NHẬN PORTAL - Điều phối và giám sát tuyến liên vận Đường sắt - Đường bộ
// ============================================================================

import React, { useState, useEffect } from "react";
import attendanceService from "../../services/attendanceService";
import coordinationService from "../../services/coordinationService";
import employeeService from "../../services/employeeService";
import "../../styles/global.css";

export default function GiaoNhanPortal({ user, onLogout, embedded }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [coordinationHistory, setCoordinationHistory] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [coordReport, setCoordReport] = useState({
    order_code: '',
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    product_type: '',
    package_count: '',
    container_no: '',
    wagon_no: '',
    train_no: '',
    driver_id: '',
    cargo_weight: '',
    fees_due: '',
  });

  // Standard product type suggestions
  const productSuggestions = ["Khăn mặt", "Cần câu cá", "Xe đạp", "Thiết bị điện tử", "Hàng tiêu dùng", "Hàng may mặc", "Khác"];

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Load attendance
      const att = await attendanceService.getTodayAttendance(user.employee_id);
      setTodayAttendance(att);

      // Load co-workers (specifically drivers)
      const empList = await employeeService.getEmployees(user.branch);
      const driverList = empList.filter(emp => emp.role === 'laixe' || emp.role === 'lai-xe');
      setDrivers(driverList);

      // Load coordination history
      const history = await coordinationService.getCoordinatorLogs(user.employee_id, 7);
      setCoordinationHistory(history || []);
    } catch (e) {
      console.error("Error loading caretaker coordination logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await attendanceService.checkIn(user.employee_id, user.name, user.role, user.branch);
      await loadInitialData();
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
      await loadInitialData();
      alert('✅ Check-out thành công!');
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCoord = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find selected driver's details
      const selectedDriver = drivers.find(d => d.employee_id === coordReport.driver_id);

      await coordinationService.submitCoordination({
        ...coordReport,
        driver_name: selectedDriver ? selectedDriver.name : '',
        vehicle_plate: selectedDriver ? 'VN-29A-12345' : '', // Mock or lookup from profile
        coordinator_id: user.employee_id,
        coordinator_name: user.name,
      });

      // Reload history and reset form
      const history = await coordinationService.getCoordinatorLogs(user.employee_id, 7);
      setCoordinationHistory(history || []);
      
      setCoordReport({
        order_code: '',
        customer_name: '',
        customer_phone: '',
        delivery_address: '',
        product_type: '',
        package_count: '',
        container_no: '',
        wagon_no: '',
        train_no: '',
        driver_id: '',
        cargo_weight: '',
        fees_due: '',
      });
      alert('✅ Đã tạo lệnh vận chuyển điều phối thành công!');
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (coordId, newStatus) => {
    try {
      setLoading(true);
      await coordinationService.updateStatus(coordId, newStatus);
      const history = await coordinationService.getCoordinatorLogs(user.employee_id, 7);
      setCoordinationHistory(history || []);
      alert('✅ Đã cập nhật trạng thái vận chuyển!');
    } catch (e) {
      alert('❌ Lỗi: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="portal-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Header */}
      {!embedded && (
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#1e293b', margin: 0 }}>🤝 Điều Phối & Giao Nhận Liên Vận</h3>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Nhân viên: <strong>{user?.name}</strong>
          </div>
        </div>
      )}

      {/* Check in system (only if not embedded) */}
      {!embedded && (
        <div className="card" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', color: 'white', border: 'none' }}>
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
                  color: todayAttendance ? 'rgba(255,255,255,0.7)' : '#0f766e' 
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
                  color: (!todayAttendance || todayAttendance?.check_out) ? 'rgba(255,255,255,0.5)' : '#0f766e' 
                }}
              >
                ✗ Check Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lập vận đơn liên vận */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          📑 Lập Vận Đơn Trung Chuyển (Tàu Hỏa → Ô Tô Giao Nhận)
        </h3>
        <form onSubmit={handleSubmitCoord}>
          
          <h4 style={{ color: '#0d9488', marginBottom: '1rem' }}>1. Thông Tin Hàng Hóa Đường Sắt</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            <div className="form-group">
              <label>Mã Đơn Vận Chuyển</label>
              <input 
                type="text" 
                placeholder="VD: DH-2026-009"
                value={coordReport.order_code}
                onChange={(e) => setCoordReport({...coordReport, order_code: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Mã Container (Nếu có)</label>
              <input 
                type="text" 
                placeholder="VD: CONT-NS99"
                value={coordReport.container_no}
                onChange={(e) => setCoordReport({...coordReport, container_no: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Số Hiệu Toa Hàng</label>
              <input 
                type="text" 
                placeholder="VD: TOA-12"
                value={coordReport.wagon_no}
                onChange={(e) => setCoordReport({...coordReport, wagon_no: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Số Hiệu Chuyến Tàu</label>
              <input 
                type="text" 
                placeholder="VD: TÀU-HN9"
                value={coordReport.train_no}
                onChange={(e) => setCoordReport({...coordReport, train_no: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Loại Hàng Hóa</label>
              <select
                value={coordReport.product_type}
                onChange={(e) => setCoordReport({...coordReport, product_type: e.target.value})}
                required
              >
                <option value="">Chọn loại</option>
                {productSuggestions.map((prod, idx) => (
                  <option key={idx} value={prod.toLowerCase()}>{prod}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Số Bao Hàng</label>
              <input 
                type="number" 
                placeholder="Số bao..."
                value={coordReport.package_count}
                onChange={(e) => setCoordReport({...coordReport, package_count: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Trọng Lượng (Tấn)</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={coordReport.cargo_weight}
                onChange={(e) => setCoordReport({...coordReport, cargo_weight: e.target.value})}
                required
              />
            </div>
          </div>

          <h4 style={{ color: '#0d9488', marginBottom: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
            2. Địa Chỉ Nhận Hàng & Lái Xe Trung Chuyển
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            <div className="form-group">
              <label>Tên Khách Hàng</label>
              <input 
                type="text" 
                placeholder="VD: Điện máy Hải Nam"
                value={coordReport.customer_name}
                onChange={(e) => setCoordReport({...coordReport, customer_name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Số Điện Thoại Khách</label>
              <input 
                type="text" 
                placeholder="VD: 0912345678"
                value={coordReport.customer_phone}
                onChange={(e) => setCoordReport({...coordReport, customer_phone: e.target.value})}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Địa Chỉ Giao Hàng Chi Tiết</label>
              <input 
                type="text" 
                placeholder="Số nhà, tên đường, quận, thành phố..."
                value={coordReport.delivery_address}
                onChange={(e) => setCoordReport({...coordReport, delivery_address: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Phân Phối Lái Xe Vận Chuyển</label>
              <select
                value={coordReport.driver_id}
                onChange={(e) => setCoordReport({...coordReport, driver_id: e.target.value})}
                required
              >
                <option value="">Chọn lái xe nhận chuyến</option>
                {drivers.map(d => (
                  <option key={d.employee_id} value={d.employee_id}>{d.name} ({d.employee_id})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Phí Phải Thu Hộ / Cước Nợ (VNĐ)</label>
              <input 
                type="number" 
                placeholder="Số tiền cần thu hộ COD..."
                value={coordReport.fees_due}
                onChange={(e) => setCoordReport({...coordReport, fees_due: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ background: '#0d9488', color: 'white', padding: '12px 28px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            💾 Lưu Vận Đơn & Chỉ Định Lái Xe
          </button>
        </form>
      </div>

      {/* Lịch sử điều phối */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>📊 Nhật Ký Điều Phối Tuyến Của Tôi</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px' }}>Ngày</th>
                <th style={{ padding: '12px' }}>Mã Vận Đơn</th>
                <th style={{ padding: '12px' }}>Khách Hàng</th>
                <th style={{ padding: '12px' }}>Sản Phẩm</th>
                <th style={{ padding: '12px' }}>Số Tàu/Toa</th>
                <th style={{ padding: '12px' }}>Số Bao</th>
                <th style={{ padding: '12px' }}>Lái Xe</th>
                <th style={{ padding: '12px' }}>Phí COD</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {coordinationHistory.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    Chưa có nhật ký điều phối nào
                  </td>
                </tr>
              ) : (
                coordinationHistory.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{formatDate(c.date)}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.order_code}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                      <strong>{c.customer_name}</strong><br/>
                      <small style={{ color: '#64748b' }}>{c.customer_phone}</small>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', textTransform: 'capitalize' }}>{c.product_type}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: '#475569' }}>
                      {c.train_no || '-'}<br/>
                      <small style={{ color: '#94a3b8' }}>{c.wagon_no || '-'}</small>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{c.package_count} bao</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                      {c.driver_name ? (
                        <>
                          <strong>{c.driver_name}</strong><br/>
                          <small style={{ color: '#64748b' }}>{c.vehicle_plate}</small>
                        </>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Chưa chỉ định</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#0d9488' }}>
                      {c.fees_due > 0 ? `${c.fees_due.toLocaleString()} ₫` : '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {c.status === 'delivered' ? (
                        <span style={{ padding: '4px 10px', background: '#dcfce7', color: '#15803d', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          Đã Giao
                        </span>
                      ) : c.status === 'shipping' ? (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'delivered')}
                          style={{
                            padding: '4px 8px', background: '#eab308', color: 'white', border: 'none', borderRadius: '4px',
                            fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem'
                          }}
                        >
                          Đang Giao (Xong?)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'shipping')}
                          style={{
                            padding: '4px 8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px',
                            fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem'
                          }}
                        >
                          Chờ Chạy (Xuất?)
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

    </div>
  );
}
