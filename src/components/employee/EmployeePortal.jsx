import React, { useState } from "react";
import "../../styles/global.css";

// Import các Portal thành phần
import BocXepPortal from "../portals/bocxep";
import LaiXePortal from "../portals/laixe";
import VanPhongPortal from "../portals/vanphong";

export function EmployeePortal({ user, onLogout }) {
  // Logic: Mặc định hiển thị nhóm dựa trên role của user, nếu không có thì mặc định 'vanphong'
  const [activeGroup, setActiveGroup] = useState(user?.role || "vanphong");

  // Hàm render portal tương ứng với nhóm được chọn
  const renderPortal = () => {
    switch (activeGroup) {
      case "bocxep":
        return <BocXepPortal user={user} onLogout={onLogout} />;
      case "laixe":
        return <LaiXePortal user={user} onLogout={onLogout} />;
      case "vanphong":
      default:
        return <VanPhongPortal user={user} onLogout={onLogout} />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR: Điều hướng giữa các nhóm nhân viên */}
      <aside className="sidebar">
        <div className="logo-section">
          <h2 style={{ letterSpacing: '2px' }}>LOGISTICS HUB</h2>
        </div>
        
        <nav className="nav-menu">
          <div className="menu-divider" style={{ marginTop: 0 }}>CHỌN NHÓM NHẬP LIỆU</div>
          
          <ul className="group-menu" style={{ listStyle: 'none', padding: 0 }}>
            <li 
              className={`nav-item ${activeGroup === 'bocxep' ? 'active' : ''}`} 
              onClick={() => setActiveGroup('bocxep')}
            >📦 Đội Bốc Xếp</li>
            <li 
              className={`nav-item ${activeGroup === 'laixe' ? 'active' : ''}`} 
              onClick={() => setActiveGroup('laixe')}
            >🚛 Đội Lái Xe</li>
            <li 
              className={`nav-item ${activeGroup === 'vanphong' ? 'active' : ''}`} 
              onClick={() => setActiveGroup('vanphong')}
            >💼 Khối Văn Phòng</li>
          </ul>
        </nav>

        {/* IDENTITY: Hiển thị danh tính nhân viên đang trực tuyến */}
        <div className="sidebar-footer">
          <div className="user-profile" style={{ marginBottom: '15px' }}>
            <p className="user-name" style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>
              {user?.name || "Nhân viên Nội Bộ"}
            </p>
            <small style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              ID: {user?.employee_id || "N/A"}
            </small>
          </div>
          <button onClick={onLogout} className="btn-primary" style={{ width: '100%', background: 'rgba(255,255,255,0.1)' }}>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* KHU VỰC HIỂN THỊ NỘI DUNG NHẬP LIỆU */}
      <main className="main-content">
        <header className="dashboard-header" style={{ background: 'white', padding: '15px 25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div>
            <h1 style={{ color: '#7e22ce', margin: 0, fontSize: '1.4rem' }}>Cổng Nhập Liệu Hệ Thống</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Chào mừng trở lại, {user?.name}</p>
          </div>
          <div className="branch-tag">
            <span style={{ background: '#f1f5f9', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', color: '#1e293b' }}>
               📍 Chi nhánh: {user?.branch === 'saigon' ? 'Sài Gòn' : 'Hà Nội'}
            </span>
          </div>
        </header>

        <div className="portal-wrapper">
          {renderPortal()}
        </div>
      </main>
    </div>
  );
}