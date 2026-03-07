// src/components/portals/vanphong.js
// ============================================================================
// VĂN PHÒNG PORTAL - Nhập liệu cho nhóm văn phòng & kế toán
// ============================================================================
import React, { useState, useEffect } from "react";
import attendanceService from "../../services/attendanceService";
import expenseService from "../../services/expenseService";
import storageService from "../../services/storageService";
import "../../styles/global.css";

export default function VanPhongPortal({ user, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [expenseHistory, setExpenseHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Work report state
  const [workReport, setWorkReport] = useState({
    work_type: '',
    documents_processed: '',
    invoices_issued: '',
    description: '',
  });

  // Expense state
  const [expenseData, setExpenseData] = useState({
    type: 'warehouse',
    amount: '',
    paid_by: user?.name || '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load data
  useEffect(() => {
    loadTodayAttendance();
    loadExpenseHistory();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      const data = await attendanceService.getTodayAttendance(user.employee_id);
      setTodayAttendance(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadExpenseHistory = async () => {
    try {
      const data = await expenseService.getExpensesByEmployee(user.employee_id);
      setExpenseHistory(data.slice(0, 10) || []); // Last 10 expenses
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

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    // For now just alert, can extend to save work reports
    alert('✅ Đã lưu báo cáo công việc văn phòng!');
    setWorkReport({
      work_type: '',
      documents_processed: '',
      invoices_issued: '',
      description: '',
    });
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

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const invoiceUrls = await uploadInvoices();

      await expenseService.createExpense({
        employee_id: user.employee_id,
        paid_by: expenseData.paid_by,
        paid_by_employee_id: user.employee_id,
        branch: user.branch,
        date: expenseData.date,
        type: expenseData.type,
        amount: parseFloat(expenseData.amount),
        description: expenseData.description,
        invoice_urls: invoiceUrls,
      });

      await loadExpenseHistory();
      setExpenseData({
        type: 'warehouse',
        amount: '',
        paid_by: user?.name || '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      setUploadedFiles([]);
      alert('✅ Đã lưu chi phí mới!');
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getExpenseTypeLabel = (type) => {
    const labels = {
      'warehouse': 'Kho bãi',
      'fuel': 'Xăng dầu',
      'office': 'Văn phòng phẩm',
      'utilities': 'Điện nước',
      'maintenance': 'Sửa chữa',
      'other': 'Khác',
    };
    return labels[type] || type;
  };

  return (
    <div className="portal-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#1e293b', margin: 0 }}>💼 Nhập Liệu - Văn Phòng & Kế Toán</h3>
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Nhân viên: <strong>{user?.name}</strong>
        </div>
      </div>

      {/* Chấm công */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none' }}>
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
                color: todayAttendance ? 'rgba(255,255,255,0.7)' : '#059669' 
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
                color: (!todayAttendance || todayAttendance?.check_out) ? 'rgba(255,255,255,0.5)' : '#059669' 
              }}
            >
              ✗ Check Out
            </button>
          </div>

        </div>
      </div>

      {/* Quản lý công việc */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>📋 Quản Lý Công Việc Hôm Nay</h3>
        <form onSubmit={handleWorkSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                Loại công việc
              </label>
              <select
                value={workReport.work_type}
                onChange={(e) => setWorkReport({...workReport, work_type: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="">Chọn loại</option>
                <option value="accounting">Kế toán</option>
                <option value="quotation">Báo giá</option>
                <option value="contract">Hợp đồng</option>
                <option value="customer-service">Chăm sóc khách hàng</option>
                <option value="report">Báo cáo</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                Số lượng hồ sơ xử lý
              </label>
              <input
                type="number"
                value={workReport.documents_processed}
                onChange={(e) => setWorkReport({...workReport, documents_processed: e.target.value})}
                min="0"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                Số hóa đơn đã xuất
              </label>
              <input
                type="number"
                value={workReport.invoices_issued}
                onChange={(e) => setWorkReport({...workReport, invoices_issued: e.target.value})}
                min="0"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
              Mô tả công việc chi tiết
            </label>
            <textarea
              value={workReport.description}
              onChange={(e) => setWorkReport({...workReport, description: e.target.value})}
              rows="4"
              placeholder="Liệt kê các công việc đã hoàn thành..."
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

      {/* Nhập chi phí */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>💰 Nhập Chi Phí</h3>
        <form onSubmit={handleExpenseSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                Loại chi phí
              </label>
              <select
                value={expenseData.type}
                onChange={(e) => setExpenseData({...expenseData, type: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="warehouse">Kho bãi</option>
                <option value="fuel">Xăng dầu</option>
                <option value="office">Văn phòng phẩm</option>
                <option value="utilities">Điện nước</option>
                <option value="maintenance">Sửa chữa</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                Số tiền (VNĐ)
              </label>
              <input
                type="number"
                value={expenseData.amount}
                onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                min="0"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                Người thanh toán
              </label>
              <input
                type="text"
                value={expenseData.paid_by}
                onChange={(e) => setExpenseData({...expenseData, paid_by: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                Ngày thanh toán
              </label>
              <input
                type="date"
                value={expenseData.date}
                onChange={(e) => setExpenseData({...expenseData, date: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
              Mô tả
            </label>
            <textarea
              value={expenseData.description}
              onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
              rows="3"
              placeholder="Chi tiết chi phí..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
              Upload hóa đơn
            </label>
            <input
              type="file"
              id="expense-invoice-upload"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              style={{ display: 'none' }}
            />
            <label 
              htmlFor="expense-invoice-upload"
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

          <button 
            type="submit"
            disabled={loading}
            style={{ background: '#6366f1', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            💾 Lưu Chi Phí
          </button>
        </form>
      </div>

      {/* Lịch sử chi phí */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>📊 Lịch Sử Chi Phí Gần Đây</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>NGÀY</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>LOẠI</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>SỐ TIỀN</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>NGƯỜI THANH TOÁN</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>MÔ TẢ</th>
              </tr>
            </thead>
            <tbody>
              {expenseHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    Chưa có chi phí nào
                  </td>
                </tr>
              ) : (
                expenseHistory.map((expense, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>{formatDate(expense.date)}</td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>{getExpenseTypeLabel(expense.type)}</td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>
                      <strong>{formatCurrency(expense.amount)}</strong>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#1e293b' }}>{expense.paid_by}</td>
                    <td style={{ padding: '12px', fontSize: '0.95rem', color: '#64748b' }}>
                      {expense.description || '-'}
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