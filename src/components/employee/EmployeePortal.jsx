import React, { useState } from "react";
import "../../styles/global.css";

// Import 3 portals con
import BocXepPortal from "../portals/bocxep";
import LaiXePortal from "../portals/laixe";
import VanPhongPortal from "../portals/vanphong";

export function EmployeePortal({ user, onLogout }) {
  // Mặc định chọn nhóm theo role của user, nếu không có thì mặc định là 'vanphong'
  const [activeGroup, setActiveGroup] = useState(user?.role || "vanphong");

  // Logic luân chuyển: Gọi đúng portal dựa theo activeGroup
  const renderPortal = () => {
    switch (activeGroup) {
      case "bocxep":
        return <BocXepPortal user={user} />;
      case "laixe":
        return <LaiXePortal user={user} />;
      case "vanphong":
      default:
        return <VanPhongPortal user={user} />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR TẬP TRUNG VÀO CHỌN NHÓM NHÂN VIÊN */}
      <aside className="sidebar">
        <div className="logo-section"><h2>LOGISTICS HUB</h2></div>
        
        <nav className="nav-menu">
          <div className="menu-divider" style={{marginTop: 0}}>CHỌN NHÓM NHẬP LIỆU</div>
          
          <ul className="group-menu" style={{listStyle: 'none'}}>
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

        <div className="sidebar-footer">
          <p className="user-name" style={{color: 'white', fontWeight: 'bold'}}>{user?.name || "Tài khoản Nội Bộ"}</p>
          <button onClick={onLogout} className="btn-primary" style={{marginTop: '10px', width: '100%', background: 'rgba(255,255,255,0.1)'}}>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* KHU VỰC HIỂN THỊ PORTAL CON */}
      <main className="main-content">
        <header className="dashboard-header" style={{background: 'white', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h1 style={{color: '#7e22ce', margin: 0}}>Cổng Nhập Liệu Nội Bộ</h1>
          <div className="branch-selector">
            <span style={{background: '#f1f5f9', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold'}}>
               📍 {user?.branch === 'saigon' ? 'Sài Gòn' : 'Hà Nội'}
            </span>
          </div>
        </header>

        {/* Nơi render các file bocxep.js / laixe.js / vanphong.js */}
        <div className="portal-wrapper">
          {renderPortal()}
        </div>
      </main>
    </div>
  );
}
}