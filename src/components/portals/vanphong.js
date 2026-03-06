import React, { useState, useEffect } from "react";
import "../../styles/global.css";

export default function VanPhongPortal({ user }) {
  // --- STATES ---
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(user?.name || "Trần Thị B");

  // --- HIỆU ỨNG ĐỒNG HỒ ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- XỬ LÝ SUBMIT FORM ---
  const handleWorkSubmit = (e) => {
    e.preventDefault();
    alert("Đã lưu báo cáo công việc văn phòng!");
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    alert("Đã lưu chi phí mới!");
  };

  return (
    <div className="portal-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* 1. HEADER NHẬP LIỆU */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#1e293b', margin: 0 }}>💼 Nhập Liệu - Văn Phòng & Kế Toán</h3>
        <div className="employee-select" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Nhân viên:</span>
          <select 
            value={selectedEmployee} 
            onChange={(e) => setSelectedEmployee(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', minWidth: '150px' }}
          >
            <option value={user?.name}>{user?.name}</option>
            <option value="Trần Thị B">Trần Thị B</option>
            <option value="Nguyễn Văn A">Nguyễn Văn A</option>
          </select>
        </div>
      </div>

      {/* 2. THẺ CHẤM CÔNG (MÀU XANH LÁ) */}
      <div className="card checkin-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none' }}>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>⏰ Chấm Công Nhanh</h3>
        <div className="checkin-grid" style={{ display: 'flex', gap: '2rem' }}>
          
          <div className="stat-box" style={{ flex: 1, background: 'rgba(255,255,255,0.15)', padding: '1.5rem', borderRadius: '12px' }}>
            <span style={{ opacity: 0.9, fontSize: '0.9rem' }}>Thời gian hiện tại</span>
            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', fontWeight: 'bold' }}>{currentTime}</h2>
            <button 
              onClick={() => setIsCheckedIn(true)}
              disabled={isCheckedIn}
              style={{ 
                width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: isCheckedIn ? 'not-allowed' : 'pointer',
                background: isCheckedIn ? 'rgba(255,255,255,0.5)' : 'white', color: isCheckedIn ? '#666' : '#059669' 
              }}
            >
              ✓ Check In
            </button>
          </div>

          <div className="stat-box" style={{ flex: 1, background: 'rgba(255,255,255,0.15)', padding: '1.5rem', borderRadius: '12px' }}>
            <span style={{ opacity: 0.9, fontSize: '0.9rem' }}>Trạng thái hôm nay</span>
            <h2 style={{ fontSize: '1.5rem', margin: '1rem 0', fontWeight: 'bold' }}>{isCheckedIn ? "Đã Check-in" : "Chưa check in"}</h2>
            <button 
              onClick={() => setIsCheckedIn(false)}
              disabled={!isCheckedIn}
              style={{ 
                width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: !isCheckedIn ? 'not-allowed' : 'pointer',
                background: !isCheckedIn ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)', color: !isCheckedIn ? 'rgba(255,255,255,0.6)' : '#059669' 
              }}
            >
              ✗ Check Out
            </button>
          </div>

        </div>
      </div>

      {/* 3. FORM QUẢN LÝ CÔNG VIỆC */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>📋 Quản Lý Công Việc Hôm Nay</h3>
        <form onSubmit={handleWorkSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Loại công việc</label>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="">✓ Chọn loại</option>
                <option value="ketoan">Kế toán</option>
                <option value="baogia">Báo giá</option>
                <option value="hopdong">Hợp đồng</option>
                <option value="cskh">Chăm sóc khách hàng</option>
                <option value="baocao">Báo cáo</option>
                <option value="khac">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Số lượng hồ sơ xử lý</label>
              <input type="number" defaultValue="0" min="0" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Số hóa đơn đã xuất</label>
              <input type="number" defaultValue="0" min="0" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Mô tả công việc chi tiết</label>
            <textarea rows="4" placeholder="Liệt kê các công việc đã hoàn thành..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Upload tài liệu liên quan</label>
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', color: '#64748b', backgroundColor: '#f8fafc' }}>
              📁 Click để chọn file
            </div>
          </div>

          <button type="submit" style={{ background: '#7e22ce', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            💾 Lưu Báo Cáo
          </button>
        </form>
      </div>

      {/* 4. FORM NHẬP CHI PHÍ */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>💰 Nhập Chi Phí</h3>
        <form onSubmit={handleExpenseSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Loại chi phí</label>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} defaultValue="khobai">
                <option value="khobai">Kho bãi</option>
                <option value="xangdau">Xăng dầu</option>
                <option value="vanphongpham">Văn phòng phẩm</option>
                <option value="diennuoc">Điện nước</option>
                <option value="suachua">Sửa chữa</option>
                <option value="khac">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Số tiền (VNĐ)</label>
              <input type="number" defaultValue="0" min="0" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Người thanh toán</label>
              <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Ngày thanh toán</label>
              <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Mô tả</label>
            <textarea rows="3" placeholder="Chi tiết chi phí..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>Upload hóa đơn</label>
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', color: '#64748b', backgroundColor: '#f8fafc' }}>
              📁 Click để chọn file
            </div>
          </div>

          <button type="submit" style={{ background: '#6366f1', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            💾 Lưu Chi Phí
          </button>
        </form>
      </div>

      {/* 5. TỔNG KẾT CÔNG VIỆC TUẦN NÀY */}
      <div className="card">
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>📊 Tổng Kết Công Việc Tuần Này</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ borderTop: '4px solid #8b5cf6', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Hồ sơ đã xử lý</p>
            <h2 style={{ fontSize: '2.5rem', margin: 0, color: '#1e293b' }}>127</h2>
          </div>

          <div style={{ borderTop: '4px solid #8b5cf6', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Hợp đồng mới</p>
            <h2 style={{ fontSize: '2.5rem', margin: 0, color: '#1e293b' }}>8</h2>
          </div>

          <div style={{ borderTop: '4px solid #8b5cf6', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Hóa đơn xuất</p>
            <h2 style={{ fontSize: '2.5rem', margin: 0, color: '#1e293b' }}>45</h2>
          </div>

        </div>
      </div>

    </div>
  );
}