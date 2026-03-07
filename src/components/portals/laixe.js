// src/components/portals/laixe.js  
// ============================================================================
// LÁI XE PORTAL - Nhập liệu cho nhóm lái xe
// ============================================================================
import React, { useState, useEffect } from "react";
import attendanceService from "../../services/attendanceService";
import shipmentService from "../../services/shipmentService";
import expenseService from "../../services/expenseService";
import storageService from "../../services/storageService";
import "../../styles/global.css";

export default function LaiXePortal({ user, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [tripHistory, setTripHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Form state
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

  const vehicles = [
    { id: 'VN-29A-12345', name: '29A-12345' },
    { id: 'VN-30B-67890', name: '30B-67890' },
    { id: 'VN-51D-22222', name: '51D-22222' },
  ];

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load data
  useEffect(() => {
    loadTodayAttendance();
    loadTripHistory();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      const data = await attendanceService.getTodayAttendance(user.employee_id);
      setTodayAttendance(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadTripHistory = async () => {
    try {
      const shipments = await shipmentService.getDriverShipments(user.employee_id, 7);
      const expenses = await expenseService.getEmployeeExpenses(user.employee_id, 7);

      const merged = (shipments || []).map(shipment => {
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
      alert('✅ Check-out thành công!');
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setUploadedFiles(Array.from(e.target.files));
  };

  const uploadInvoices = async () => {
    if (uploadedFiles.length === 0) return [];
    try {
      const urls = await storageService.uploadMultipleFiles(uploadedFiles, 'invoices');
      return urls;
    } catch (error) {
      console.error('Upload error:', error);
      return [];
    }
  };

  const handleSubmitTripReport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const invoiceUrls = await uploadInvoices();

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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getStatusLabel = (status) => {
    const labels = {
      'shipping': 'ĐANG ĐI',
      'delivered': 'ĐÃ GIAO',
      'pending': 'CHƯA XUẤT PHÁT',
    };
    return labels[status] || status;
  };

  const getStatusStyle = (status) => {
    const styles = {
      'shipping': { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
      'delivered': { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
      'pending': { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="portal-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#1e293b', margin: 0 }}>🚛 Nhập Liệu - Nhóm Lái Xe</h3>
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Nhân viên: <strong>{user?.name}</strong>
        </div>
      </div>

      {/* Chấm công */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', color: 'white', border: 'none' }}>
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
                color: todayAttendance ? 'rgba(255,255,255,0.7)' : '#3b82f6' 
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
                color: (!todayAttendance || todayAttendance?.check_out) ? 'rgba(255,255,255,0.5)' : '#3b82f6' 
              }}
            >
              ✗ Check Out
            </button>
          </div>

        </div>
      </div>

      {/* Báo cáo chuyến đi */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>🚗 Báo Cáo Chuyến Đi</h3>
        <form onSubmit={handleSubmitTripReport}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Biển số xe</label>
              <select
                value={tripReport.vehicle_plate}
                onChange={(e) => setTripReport({...tripReport, vehicle_plate: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="">Chọn xe</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Mã đơn hàng</label>
              <input
                type="text"
                value={tripReport.order_code}
                onChange={(e) => setTripReport({...tripReport, order_code: e.target.value})}
                placeholder="DH-2024-XXX"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Điểm đi</label>
              <input
                type="text"
                value={tripReport.from_location}
                onChange={(e) => setTripReport({...tripReport, from_location: e.target.value})}
                placeholder="Nhập địa điểm"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Điểm đến</label>
              <input
                type="text"
                value={tripReport.to_location}
                onChange={(e) => setTripReport({...tripReport, to_location: e.target.value})}
                placeholder="Nhập địa điểm"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Số km đã chạy</label>
              <input
                type="number"
                value={tripReport.distance_km}
                onChange={(e) => setTripReport({...tripReport, distance_km: e.target.value})}
                min="0"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Lượng xăng đổ (lít)</label>
              <input
                type="number"
                step="0.1"
                value={tripReport.fuel_liters}
                onChange={(e) => setTripReport({...tripReport, fuel_liters: e.target.value})}
                min="0"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Chi phí xăng (VNĐ)</label>
              <input
                type="number"
                value={tripReport.fuel_cost}
                onChange={(e) => setTripReport({...tripReport, fuel_cost: e.target.value})}
                min="0"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Trạng thái giao hàng</label>
              <select
                value={tripReport.delivery_status}
                onChange={(e) => setTripReport({...tripReport, delivery_status: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="shipping">Đang vận chuyển</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="pending">Chưa xuất phát</option>
              </select>
            </div>

          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Upload hóa đơn xăng</label>
            <input
              type="file"
              id="invoice-upload"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              style={{ display: 'none' }}
            />
            <label 
              htmlFor="invoice-upload"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: '2rem', 
                border: '2px dashed #cbd5e1', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                color: '#64748b', 
                backgroundColor: '#f8fafc',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</span>
              <span>Click để chọn file</span>
              <span style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                {uploadedFiles.length > 0 ? `${uploadedFiles.length} file đã chọn` : 'PDF, JPG, PNG'}
              </span>
            </label>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Ghi chú chuyến đi</label>
            <textarea
              value={tripReport.notes}
              onChange={(e) => setTripReport({...tripReport, notes: e.target.value})}
              rows="3"
              placeholder="Tình trạng xe, đường xá..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ background: '#6366f1', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            💾 Lưu Báo Cáo
          </button>
        </form>
      </div>

      {/* Lịch sử */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>📊 Lịch Sử Chuyến Đi</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>NGÀY</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>MÃ ĐƠN</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>TUYẾN ĐƯỜNG</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>SỐ KM</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>CHI PHÍ XĂNG</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {tripHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    Chưa có chuyến đi nào
                  </td>
                </tr>
              ) : (
                tripHistory.map((trip, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>{formatDate(trip.date)}</td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}><strong>{trip.order_code}</strong></td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>
                      {trip.from_location} → {trip.to_location}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>{trip.distance_km} km</td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>
                      {trip.fuel_cost > 0 ? <strong>₫ {trip.fuel_cost.toLocaleString()}</strong> : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        ...getStatusStyle(trip.status),
                        padding: '0.375rem 0.875rem',
                        borderRadius: '2rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-block',
                        textTransform: 'uppercase'
                      }}>
                        {getStatusLabel(trip.status)}
                      </span>
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