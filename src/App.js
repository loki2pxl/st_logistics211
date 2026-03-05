import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// SUPABASE CONFIGURATION - Using Environment Variables
// =============================================================================
// HƯỚNG DẪN:
// 1. Tạo file .env trong thư mục root project (cùng cấp package.json)
// 2. Copy nội dung từ .env.example
// 3. Điền SUPABASE_URL và SUPABASE_ANON_KEY thật vào
// 4. File .env sẽ KHÔNG được upload lên GitHub (đã có trong .gitignore)

// Đọc từ environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Kiểm tra xem đã config chưa
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️ CẢNH BÁO: Chưa cấu hình Supabase!');
  console.error('Hãy tạo file .env và thêm:');
  console.error('REACT_APP_SUPABASE_URL=your-url');
  console.error('REACT_APP_SUPABASE_ANON_KEY=your-key');
}

// Khởi tạo Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================================================================
// LOGIN COMPONENT
// =============================================================================
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Query user from database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password) // Note: In production, use hashed passwords!
        .single();

      if (error || !data) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng!');
        setLoading(false);
        return;
      }

      // Login successful
      onLogin(data);
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.card}>
        <div style={loginStyles.logo}>
          <span style={{ fontSize: '4rem' }}>🚛</span>
          <h1 style={loginStyles.title}>LOGISTICS HUB</h1>
          <p style={loginStyles.subtitle}>Hệ thống quản lý thông minh</p>
        </div>

        <form onSubmit={handleLogin} style={loginStyles.form}>
          {error && (
            <div style={loginStyles.error}>
              ⚠️ {error}
            </div>
          )}

          <div style={loginStyles.formGroup}>
            <label style={loginStyles.label}>Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={loginStyles.input}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div style={loginStyles.formGroup}>
            <label style={loginStyles.label}>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={loginStyles.input}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button 
            type="submit" 
            style={loginStyles.button}
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>

          <div style={loginStyles.hint}>
            <strong>Demo accounts:</strong><br/>
            Admin: admin / admin123<br/>
            Bốc xếp: bocxep1 / 123456<br/>
            Lái xe: laixe1 / 123456<br/>
            Văn phòng: vanphong1 / 123456
          </div>
        </form>
      </div>
    </div>
  );
}

const loginStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
    padding: '2rem',
  },
  card: {
    background: 'white',
    borderRadius: '2rem',
    padding: '3rem',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontFamily: 'Bebas Neue, sans-serif',
    fontSize: '2.5rem',
    marginTop: '1rem',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #1e3c72 0%, #7e22ce 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#0f172a',
  },
  input: {
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 0.3s ease',
  },
  button: {
    padding: '1rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
  },
  error: {
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  hint: {
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '0.75rem',
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: 1.6,
  },
};


// =============================================================================
// EMPLOYEE PORTAL (for non-admin users)
// =============================================================================
function EmployeePortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('checkin');
  const [myData, setMyData] = useState({
    attendance: [],
    expenses: [],
    shipments: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMyData();
  }, []);

  const loadMyData = async () => {
    setLoading(true);
    try {
      // Load attendance for this employee
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', user.employee_id)
        .order('date', { ascending: false })
        .limit(10);

      // Load expenses created by this user (for drivers & warehouse)
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('paid_by', user.name)
        .order('date', { ascending: false })
        .limit(10);

      // Load shipments (for drivers)
      const { data: shipmentsData } = await supabase
        .from('shipments')
        .select('*')
        .eq('branch', user.branch)
        .order('created_at', { ascending: false })
        .limit(10);

      setMyData({
        attendance: attendanceData || [],
        expenses: expensesData || [],
        shipments: shipmentsData || [],
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check in/out
  const handleCheckIn = async () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDate = now.toISOString().split('T')[0];

    const { error } = await supabase.from('attendance').insert([{
      employee_id: user.employee_id,
      employee_name: user.name,
      group: user.role,
      branch: user.branch,
      date: currentDate,
      check_in: currentTime,
    }]);

    if (!error) {
      alert('✅ Check-in thành công lúc ' + currentTime);
      loadMyData();
    } else {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const handleCheckOut = async (attendanceId) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const { error } = await supabase
      .from('attendance')
      .update({ check_out: currentTime })
      .eq('id', attendanceId);

    if (!error) {
      alert('✅ Check-out thành công lúc ' + currentTime);
      loadMyData();
    } else {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  // Add expense (for drivers & warehouse staff)
  const handleAddExpense = async (formData) => {
    const { error } = await supabase.from('expenses').insert([{
      ...formData,
      branch: user.branch,
      paid_by: user.name,
    }]);

    if (!error) {
      alert('✅ Đã ghi nhận chi phí!');
      loadMyData();
    } else {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  // Update shipment status (for drivers)
  const handleUpdateShipment = async (shipmentId, newStatus) => {
    const { error } = await supabase
      .from('shipments')
      .update({ status: newStatus })
      .eq('id', shipmentId);

    if (!error) {
      alert('✅ Đã cập nhật trạng thái!');
      loadMyData();
    } else {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Bebas+Neue&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
          min-height: 100vh;
        }
      `}</style>

      {/* Header */}
      <header style={employeeStyles.header}>
        <div>
          <h1 style={employeeStyles.title}>👋 Xin chào, {user.name}!</h1>
          <p style={employeeStyles.subtitle}>
            {getRoleLabel(user.role)} - Chi nhánh {user.branch === 'hanoi' ? 'Hà Nội' : 'Sài Gòn'}
          </p>
        </div>
        <button onClick={onLogout} style={employeeStyles.logoutBtn}>
          🚪 Đăng xuất
        </button>
      </header>

      {/* Quick Stats */}
      <div style={employeeStyles.statsGrid}>
        <div style={employeeStyles.statCard}>
          <div style={{ fontSize: '2rem' }}>📅</div>
          <div style={employeeStyles.statValue}>{myData.attendance.length}</div>
          <div style={employeeStyles.statLabel}>Ngày chấm công</div>
        </div>
        {(user.role === 'lai-xe' || user.role === 'boc-xep') && (
          <div style={employeeStyles.statCard}>
            <div style={{ fontSize: '2rem' }}>💰</div>
            <div style={employeeStyles.statValue}>{myData.expenses.length}</div>
            <div style={employeeStyles.statLabel}>Chi phí đã ghi</div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div style={employeeStyles.tabs}>
        <button
          style={{
            ...employeeStyles.tab,
            ...(activeTab === 'checkin' ? employeeStyles.tabActive : {})
          }}
          onClick={() => setActiveTab('checkin')}
        >
          ⏰ Chấm Công
        </button>
        
        {(user.role === 'lai-xe' || user.role === 'boc-xep') && (
          <button
            style={{
              ...employeeStyles.tab,
              ...(activeTab === 'expense' ? employeeStyles.tabActive : {})
            }}
            onClick={() => setActiveTab('expense')}
          >
            💰 Ghi Chi Phí
          </button>
        )}
        
        {user.role === 'lai-xe' && (
          <button
            style={{
              ...employeeStyles.tab,
              ...(activeTab === 'shipment' ? employeeStyles.tabActive : {})
            }}
            onClick={() => setActiveTab('shipment')}
          >
            🚚 Cập Nhật Đơn Hàng
          </button>
        )}
      </div>

      {/* Content Area */}
      <div style={employeeStyles.content}>
        {/* Check-in Tab */}
        {activeTab === 'checkin' && (
          <CheckInTab
            attendance={myData.attendance}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        )}

        {/* Expense Tab */}
        {activeTab === 'expense' && (user.role === 'lai-xe' || user.role === 'boc-xep') && (
          <ExpenseTab
            expenses={myData.expenses}
            onAddExpense={handleAddExpense}
            userRole={user.role}
          />
        )}

        {/* Shipment Tab (Drivers only) */}
        {activeTab === 'shipment' && user.role === 'lai-xe' && (
          <ShipmentTab
            shipments={myData.shipments}
            onUpdateStatus={handleUpdateShipment}
          />
        )}
      </div>
    </div>
  );
}

// Check-in Component
function CheckInTab({ attendance, onCheckIn, onCheckOut }) {
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.find(a => a.date === today);

  return (
    <div style={employeeStyles.section}>
      <h2 style={employeeStyles.sectionTitle}>Chấm Công Hôm Nay</h2>
      
      <div style={employeeStyles.checkInCard}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏰</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{ fontSize: '1rem', color: '#64748b', marginBottom: '2rem' }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </div>

        {!todayAttendance ? (
          <button onClick={onCheckIn} style={employeeStyles.checkInBtn}>
            ✅ Check In Ngay
          </button>
        ) : !todayAttendance.check_out ? (
          <div>
            <div style={{ marginBottom: '1rem', color: '#10b981', fontWeight: 600 }}>
              ✅ Đã check-in lúc {todayAttendance.check_in}
            </div>
            <button 
              onClick={() => onCheckOut(todayAttendance.id)} 
              style={employeeStyles.checkOutBtn}
            >
              🏁 Check Out
            </button>
          </div>
        ) : (
          <div style={{ color: '#3b82f6', fontWeight: 600 }}>
            ✅ Hoàn thành: {todayAttendance.check_in} - {todayAttendance.check_out}
          </div>
        )}
      </div>

      {/* History */}
      <h3 style={{ ...employeeStyles.sectionTitle, marginTop: '2rem' }}>Lịch Sử Chấm Công</h3>
      <div style={employeeStyles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ngày</th>
              <th style={styles.th}>Check In</th>
              <th style={styles.th}>Check Out</th>
              <th style={styles.th}>Tổng Giờ</th>
            </tr>
          </thead>
          <tbody>
            {attendance.slice(0, 7).map(item => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>{formatDate(item.date)}</td>
                <td style={styles.td}>{item.check_in}</td>
                <td style={styles.td}>{item.check_out || '-'}</td>
                <td style={styles.td}>{calculateHours(item.check_in, item.check_out)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Expense Tab Component
function ExpenseTab({ expenses, onAddExpense, userRole }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: userRole === 'lai-xe' ? 'fuel' : 'warehouse',
    amount: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddExpense(form);
    setForm({
      date: new Date().toISOString().split('T')[0],
      type: userRole === 'lai-xe' ? 'fuel' : 'warehouse',
      amount: '',
      description: '',
    });
    setShowForm(false);
  };

  return (
    <div style={employeeStyles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={employeeStyles.sectionTitle}>Ghi Nhận Chi Phí</h2>
        <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>
          {showForm ? '❌ Hủy' : '➕ Thêm Chi Phí'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={employeeStyles.form}>
          <div style={styles.formGrid}>
            <FormField label="Ngày">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={styles.input}
                required
              />
            </FormField>

            <FormField label="Loại chi phí">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={styles.input}
                required
              >
                {userRole === 'lai-xe' && <option value="fuel">Xăng dầu</option>}
                {userRole === 'boc-xep' && <option value="warehouse">Kho bãi</option>}
              </select>
            </FormField>

            <FormField label="Số tiền (VNĐ)">
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                style={styles.input}
                min="0"
                required
              />
            </FormField>

            <FormField label="Mô tả">
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={styles.input}
                placeholder="VD: Đổ xăng xe VN-29A"
                required
              />
            </FormField>
          </div>
          <button type="submit" style={{ ...styles.btnPrimary, marginTop: '1rem' }}>
            💾 Lưu Chi Phí
          </button>
        </form>
      )}

      {/* History */}
      <h3 style={{ ...employeeStyles.sectionTitle, marginTop: '2rem' }}>Chi Phí Đã Ghi</h3>
      <div style={employeeStyles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ngày</th>
              <th style={styles.th}>Loại</th>
              <th style={styles.th}>Mô Tả</th>
              <th style={styles.th}>Số Tiền</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(item => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>{formatDate(item.date)}</td>
                <td style={styles.td}>
                  <span style={item.type === 'fuel' ? styles.badgeInfo : styles.badgeWarning}>
                    {item.type === 'fuel' ? 'Xăng dầu' : 'Kho bãi'}
                  </span>
                </td>
                <td style={styles.td}>{item.description}</td>
                <td style={styles.td}><strong>₫{parseInt(item.amount).toLocaleString()}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Shipment Tab (Drivers only)
function ShipmentTab({ shipments, onUpdateStatus }) {
  return (
    <div style={employeeStyles.section}>
      <h2 style={employeeStyles.sectionTitle}>Đơn Hàng Cần Vận Chuyển</h2>
      
      <div style={employeeStyles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Mã Đơn</th>
              <th style={styles.th}>Khách Hàng</th>
              <th style={styles.th}>Ngày</th>
              <th style={styles.th}>Trạng Thái</th>
              <th style={styles.th}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(item => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}><strong>{item.order_code}</strong></td>
                <td style={styles.td}>{item.customer}</td>
                <td style={styles.td}>{formatDate(item.date)}</td>
                <td style={styles.td}>
                  <span style={getStatusBadge(item.status)}>
                    {getStatusLabel(item.status)}
                  </span>
                </td>
                <td style={styles.td}>
                  {item.status === 'pending' && (
                    <button 
                      onClick={() => onUpdateStatus(item.id, 'shipping')}
                      style={employeeStyles.actionBtn}
                    >
                      🚚 Bắt đầu vận chuyển
                    </button>
                  )}
                  {item.status === 'shipping' && (
                    <button 
                      onClick={() => onUpdateStatus(item.id, 'delivered')}
                      style={employeeStyles.actionBtn}
                    >
                      ✅ Đã giao hàng
                    </button>
                  )}
                  {item.status === 'delivered' && (
                    <span style={{ color: '#10b981', fontWeight: 600 }}>✅ Hoàn thành</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const employeeStyles = {
  header: {
    background: 'white',
    padding: '2rem',
    borderRadius: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    margin: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#0f172a',
    fontFamily: 'Bebas Neue, sans-serif',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  logoutBtn: {
    padding: '0.875rem 1.75rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    margin: '0 2rem 2rem',
  },
  statCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '1.5rem',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#0f172a',
    fontFamily: 'Bebas Neue, sans-serif',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tabs: {
    display: 'flex',
    gap: '1rem',
    margin: '0 2rem 2rem',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '1rem 2rem',
    background: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    borderColor: 'transparent',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
  },
  content: {
    margin: '0 2rem 2rem',
  },
  section: {
    background: 'white',
    padding: '2rem',
    borderRadius: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '1.5rem',
  },
  checkInCard: {
    textAlign: 'center',
    padding: '3rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
    borderRadius: '1.5rem',
    marginBottom: '2rem',
  },
  checkInBtn: {
    padding: '1.25rem 3rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1.25rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
  },
  checkOutBtn: {
    padding: '1.25rem 3rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '1rem',
    border: '1px solid #e2e8f0',
  },
  form: {
    background: '#f8fafc',
    padding: '2rem',
    borderRadius: '1rem',
    marginBottom: '2rem',
  },
  actionBtn: {
    padding: '0.625rem 1.25rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'Outfit, sans-serif',
  },
};

function getRoleLabel(role) {
  const labels = {
    'boc-xep': 'Nhân viên bốc xếp',
    'lai-xe': 'Lái xe',
    'van-phong': 'Nhân viên văn phòng',
    'khac': 'Nhân viên khác',
  };
  return labels[role] || role;
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Chờ xử lý',
    shipping: 'Đang vận chuyển',
    delivered: 'Đã giao',
  };
  return labels[status] || status;
}

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================
export default function LogisticsApp() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('logistics_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('logistics_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('logistics_user');
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 700,
      }}>
        Đang tải...
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Admin gets full dashboard, employees get portal
  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  } else {
    return <EmployeePortal user={user} onLogout={handleLogout} />;
  }
}

// =============================================================================
// ADMIN DASHBOARD (Original Dashboard)
// =============================================================================
function AdminDashboard({ user, onLogout }) {
  const [currentBranch, setCurrentBranch] = useState(user.branch || 'hanoi');
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);

  // State cho các module
  const [attendance, setAttendance] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [kpiData, setKpiData] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modal state
  const [modals, setModals] = useState({
    attendance: false,
    shipment: false,
    expense: false,
    kpi: false,
  });

  // Form state
  const [formData, setFormData] = useState({});

  // =============================================================================
  // DATA FETCHING
  // =============================================================================
  useEffect(() => {
    loadAllData();
  }, [currentBranch]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAttendance(),
        loadShipments(),
        loadExpenses(),
        loadKPI(),
        loadEmployees(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('branch', currentBranch)
      .order('date', { ascending: false });
    
    if (!error && data) setAttendance(data);
  };

  const loadShipments = async () => {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('branch', currentBranch)
      .order('created_at', { ascending: false });
    
    if (!error && data) setShipments(data);
  };

  const loadExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('branch', currentBranch)
      .order('date', { ascending: false });
    
    if (!error && data) setExpenses(data);
  };

  const loadKPI = async () => {
    const { data, error } = await supabase
      .from('kpi')
      .select('*, employees(*)')
      .eq('branch', currentBranch)
      .order('month', { ascending: false });
    
    if (!error && data) setKpiData(data);
  };

  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('branch', currentBranch);
    
    if (!error && data) setEmployees(data);
  };

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================
  const addAttendance = async (data) => {
    const { error } = await supabase.from('attendance').insert([
      { ...data, branch: currentBranch }
    ]);
    
    if (!error) {
      await loadAttendance();
      closeModal('attendance');
      alert('✅ Đã thêm chấm công thành công!');
    } else {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const addShipment = async (data) => {
    const { error } = await supabase.from('shipments').insert([
      { ...data, branch: currentBranch }
    ]);
    
    if (!error) {
      await loadShipments();
      closeModal('shipment');
      alert('✅ Đã thêm đơn hàng thành công!');
    } else {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const addExpense = async (data) => {
    const { error } = await supabase.from('expenses').insert([
      { ...data, branch: currentBranch }
    ]);
    
    if (!error) {
      await loadExpenses();
      closeModal('expense');
      alert('✅ Đã thêm chi phí thành công!');
    } else {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const updateKPI = async (data) => {
    const { error } = await supabase.from('kpi').upsert([
      { ...data, branch: currentBranch }
    ]);
    
    if (!error) {
      await loadKPI();
      closeModal('kpi');
      alert('✅ Đã cập nhật KPI thành công!');
    } else {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const deleteRecord = async (table, id) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    
    const { error } = await supabase.from(table).delete().eq('id', id);
    
    if (!error) {
      await loadAllData();
      alert('✅ Đã xóa thành công!');
    } else {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  // =============================================================================
  // FILE UPLOAD TO SUPABASE STORAGE
  // =============================================================================
  const uploadFile = async (file, bucket = 'invoices') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${currentBranch}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // =============================================================================
  // MODAL HELPERS
  // =============================================================================
  const openModal = (modal) => {
    setModals({ ...modals, [modal]: true });
    setFormData({});
  };

  const closeModal = (modal) => {
    setModals({ ...modals, [modal]: false });
    setFormData({});
  };

  // =============================================================================
  // AI-POWERED INSIGHTS (Using Anthropic API)
  // =============================================================================
  const getAIInsights = async () => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Phân tích dữ liệu logistics sau và đưa ra insights:
            - Số nhân viên: ${employees.length}
            - Số đơn hàng: ${shipments.length}
            - Tổng chi phí: ${expenses.reduce((sum, e) => sum + (e.amount || 0), 0)}
            
            Hãy đưa ra 3-5 insights ngắn gọn bằng tiếng Việt.`
          }],
        })
      });

      const data = await response.json();
      const insights = data.content[0].text;
      alert('🤖 AI Insights:\n\n' + insights);
    } catch (error) {
      console.error('AI Error:', error);
      alert('Không thể tạo insights lúc này');
    }
  };

  // =============================================================================
  // STATISTICS CALCULATIONS
  // =============================================================================
  const stats = {
    totalEmployees: employees.length,
    totalShipments: shipments.length,
    activeShipments: shipments.filter(s => s.status === 'shipping').length,
    totalExpenses: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    monthlyRevenue: shipments.reduce((sum, s) => sum + (s.price || 0), 0),
  };

  // =============================================================================
  // RENDER
  // =============================================================================
  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Bebas+Neue&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
          min-height: 100vh;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .fade-in { animation: fadeIn 0.5s ease; }
        .slide-in { animation: slideIn 0.3s ease; }
      `}</style>

      {/* Sidebar */}
      <aside style={styles.sidebar} className="slide-in">
        <div style={styles.logo}>
          <span style={{ fontSize: '2.5rem' }}>🚛</span>
          <div>LOGISTICS</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 400, letterSpacing: '2px' }}>COMMAND</div>
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'overview', icon: '📊', label: 'Tổng Quan' },
            { id: 'attendance', icon: '⏰', label: 'Chấm Công' },
            { id: 'tracking', icon: '🚚', label: 'Tracking' },
            { id: 'expenses', icon: '💰', label: 'Chi Phí' },
            { id: 'kpi', icon: '📈', label: 'KPI & Lương' },
          ].map(item => (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(activeSection === item.id ? styles.navItemActive : {})
              }}
              onClick={() => setActiveSection(item.id)}
            >
              <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.aiButton}>
          <button onClick={getAIInsights} style={styles.aiBtn}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Insights</div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Header */}
        <header style={styles.header} className="fade-in">
          <div>
            <h1 style={styles.headerTitle}>Dashboard Quản Lý</h1>
            <p style={styles.headerSubtitle}>Xin chào, {user.name} 👋</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={styles.branchSelector}>
              {[
                { id: 'hanoi', label: '📍 Hà Nội' },
                { id: 'saigon', label: '📍 Sài Gòn' }
              ].map(branch => (
                <button
                  key={branch.id}
                  style={{
                    ...styles.branchBtn,
                    ...(currentBranch === branch.id ? styles.branchBtnActive : {})
                  }}
                  onClick={() => setCurrentBranch(branch.id)}
                >
                  {branch.label}
                </button>
              ))}
            </div>
            <button onClick={onLogout} style={employeeStyles.logoutBtn}>
              🚪 Đăng xuất
            </button>
          </div>
        </header>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="fade-in">
            <div style={styles.statsGrid}>
              <StatCard
                label="Nhân Viên"
                value={stats.totalEmployees}
                change="+3"
                trend="up"
                icon="👥"
              />
              <StatCard
                label="Đơn Hàng Tháng Này"
                value={stats.totalShipments}
                change="+12%"
                trend="up"
                icon="📦"
              />
              <StatCard
                label="Đang Vận Chuyển"
                value={stats.activeShipments}
                change="Realtime"
                icon="🚛"
              />
              <StatCard
                label="Chi Phí Tháng Này"
                value={`₫${(stats.totalExpenses / 1000000).toFixed(1)}M`}
                change="+8%"
                trend="down"
                icon="💰"
              />
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Hoạt Động Gần Đây</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {attendance.slice(0, 3).map((item, i) => (
                  <Activity
                    key={i}
                    text={`${item.employee_name} đã check-in lúc ${item.check_in}`}
                    time={formatRelativeTime(item.date)}
                    color="#3b82f6"
                  />
                ))}
                {shipments.slice(0, 2).map((item, i) => (
                  <Activity
                    key={i}
                    text={`Đơn hàng ${item.order_code} - ${item.status}`}
                    time={formatRelativeTime(item.created_at)}
                    color="#10b981"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Attendance Section */}
        {activeSection === 'attendance' && (
          <div className="fade-in">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Quản Lý Chấm Công</h2>
              <button style={styles.btnPrimary} onClick={() => openModal('attendance')}>
                ➕ Thêm Chấm Công
              </button>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nhân Viên</th>
                    <th style={styles.th}>Nhóm</th>
                    <th style={styles.th}>Check In</th>
                    <th style={styles.th}>Check Out</th>
                    <th style={styles.th}>Tổng Giờ</th>
                    <th style={styles.th}>Ngày</th>
                    <th style={styles.th}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr><td colSpan="7" style={styles.emptyState}>Chưa có dữ liệu chấm công</td></tr>
                  ) : (
                    attendance.map(item => (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.td}><strong>{item.employee_name}</strong></td>
                        <td style={styles.td}>
                          <span style={getGroupStyle(item.group)}>{item.group}</span>
                        </td>
                        <td style={styles.td}>{item.check_in}</td>
                        <td style={styles.td}>{item.check_out || '-'}</td>
                        <td style={styles.td}>{calculateHours(item.check_in, item.check_out)}</td>
                        <td style={styles.td}>{formatDate(item.date)}</td>
                        <td style={styles.td}>
                          <button 
                            style={styles.btnDelete}
                            onClick={() => deleteRecord('attendance', item.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tracking Section */}
        {activeSection === 'tracking' && (
          <div className="fade-in">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Tracking Đơn Hàng</h2>
              <button style={styles.btnPrimary} onClick={() => openModal('shipment')}>
                ➕ Thêm Đơn Hàng
              </button>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Mã Đơn</th>
                    <th style={styles.th}>Khách Hàng</th>
                    <th style={styles.th}>Ngày Nhập</th>
                    <th style={styles.th}>Số Công</th>
                    <th style={styles.th}>Giá Trị</th>
                    <th style={styles.th}>Phương Tiện</th>
                    <th style={styles.th}>Trạng Thái</th>
                    <th style={styles.th}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.length === 0 ? (
                    <tr><td colSpan="8" style={styles.emptyState}>Chưa có đơn hàng</td></tr>
                  ) : (
                    shipments.map(item => (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.td}><strong>{item.order_code}</strong></td>
                        <td style={styles.td}>{item.customer}</td>
                        <td style={styles.td}>{formatDate(item.date)}</td>
                        <td style={styles.td}>{item.work_days} công</td>
                        <td style={styles.td}>₫{item.price?.toLocaleString()}</td>
                        <td style={styles.td}>{item.vehicle}</td>
                        <td style={styles.td}>
                          <span style={getStatusBadge(item.status)}>{item.status}</span>
                        </td>
                        <td style={styles.td}>
                          <button 
                            style={styles.btnDelete}
                            onClick={() => deleteRecord('shipments', item.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expenses Section */}
        {activeSection === 'expenses' && (
          <div className="fade-in">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Quản Lý Chi Phí</h2>
              <button style={styles.btnPrimary} onClick={() => openModal('expense')}>
                ➕ Thêm Chi Phí
              </button>
            </div>

            <div style={styles.statsGrid}>
              <StatCard
                label="Tổng Chi Phí"
                value={`₫${(stats.totalExpenses / 1000000).toFixed(1)}M`}
                icon="💰"
              />
              <StatCard
                label="Kho Bãi"
                value={`₫${(expenses.filter(e => e.type === 'warehouse').reduce((s, e) => s + e.amount, 0) / 1000000).toFixed(1)}M`}
                icon="🏭"
              />
              <StatCard
                label="Xăng Dầu"
                value={`₫${(expenses.filter(e => e.type === 'fuel').reduce((s, e) => s + e.amount, 0) / 1000000).toFixed(1)}M`}
                icon="⛽"
              />
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Ngày</th>
                    <th style={styles.th}>Loại</th>
                    <th style={styles.th}>Mô Tả</th>
                    <th style={styles.th}>Số Tiền</th>
                    <th style={styles.th}>Người TT</th>
                    <th style={styles.th}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr><td colSpan="6" style={styles.emptyState}>Chưa có chi phí</td></tr>
                  ) : (
                    expenses.map(item => (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.td}>{formatDate(item.date)}</td>
                        <td style={styles.td}>
                          <span style={item.type === 'warehouse' ? styles.badgeWarning : styles.badgeInfo}>
                            {item.type === 'warehouse' ? 'Kho bãi' : 'Xăng dầu'}
                          </span>
                        </td>
                        <td style={styles.td}>{item.description}</td>
                        <td style={styles.td}><strong>₫{item.amount?.toLocaleString()}</strong></td>
                        <td style={styles.td}>{item.paid_by}</td>
                        <td style={styles.td}>
                          <button 
                            style={styles.btnDelete}
                            onClick={() => deleteRecord('expenses', item.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KPI Section */}
        {activeSection === 'kpi' && (
          <div className="fade-in">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>KPI & Lương Thưởng</h2>
              <button style={styles.btnPrimary} onClick={() => openModal('kpi')}>
                ⚙️ Cập Nhật KPI
              </button>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nhân Viên</th>
                    <th style={styles.th}>Nhóm</th>
                    <th style={styles.th}>Lương CB</th>
                    <th style={styles.th}>Số Công</th>
                    <th style={styles.th}>KPI (%)</th>
                    <th style={styles.th}>Thưởng</th>
                    <th style={styles.th}>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiData.length === 0 ? (
                    <tr><td colSpan="7" style={styles.emptyState}>Chưa có dữ liệu KPI</td></tr>
                  ) : (
                    kpiData.map(item => (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.td}><strong>{item.employees?.name}</strong></td>
                        <td style={styles.td}>
                          <span style={getGroupStyle(item.employees?.group)}>
                            {item.employees?.group}
                          </span>
                        </td>
                        <td style={styles.td}>₫{item.base_salary?.toLocaleString()}</td>
                        <td style={styles.td}>{item.work_days}/26</td>
                        <td style={styles.td}>
                          <span style={item.kpi >= 90 ? styles.badgeSuccess : styles.badgeWarning}>
                            {item.kpi}%
                          </span>
                        </td>
                        <td style={styles.td}>₫{item.bonus?.toLocaleString()}</td>
                        <td style={styles.td}>
                          <strong>₫{((item.base_salary || 0) + (item.bonus || 0)).toLocaleString()}</strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <AttendanceModal
        isOpen={modals.attendance}
        onClose={() => closeModal('attendance')}
        onSubmit={addAttendance}
        employees={employees}
      />
      
      <ShipmentModal
        isOpen={modals.shipment}
        onClose={() => closeModal('shipment')}
        onSubmit={addShipment}
        uploadFile={uploadFile}
      />
      
      <ExpenseModal
        isOpen={modals.expense}
        onClose={() => closeModal('expense')}
        onSubmit={addExpense}
        uploadFile={uploadFile}
      />
      
      <KPIModal
        isOpen={modals.kpi}
        onClose={() => closeModal('kpi')}
        onSubmit={updateKPI}
        employees={employees}
      />
    </div>
  );
}

// =============================================================================
// COMPONENTS
// =============================================================================
function StatCard({ label, value, change, trend, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
      {change && (
        <div style={{
          ...styles.statChange,
          color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#64748b'
        }}>
          {trend === 'up' && '↑'} {trend === 'down' && '↓'} {change}
        </div>
      )}
    </div>
  );
}

function Activity({ text, time, color }) {
  return (
    <div style={{
      padding: '1rem',
      background: '#f8fafc',
      borderRadius: '0.75rem',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontWeight: 600 }}>{text}</div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
        {time}
      </div>
    </div>
  );
}

// =============================================================================
// MODAL COMPONENTS
// =============================================================================
function AttendanceModal({ isOpen, onClose, onSubmit, employees }) {
  const [form, setForm] = useState({
    employee_id: '',
    employee_name: '',
    group: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const employee = employees.find(e => e.id === parseInt(form.employee_id));
    onSubmit({
      ...form,
      employee_name: employee?.name,
      group: employee?.group,
    });
    setForm({
      employee_id: '',
      employee_name: '',
      group: '',
      date: new Date().toISOString().split('T')[0],
      check_in: '',
      check_out: '',
    });
  };

  if (!isOpen) return null;

  return (
    <Modal title="Thêm Chấm Công" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGrid}>
          <FormField label="Nhân viên">
            <select
              style={styles.input}
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              required
            >
              <option value="">Chọn nhân viên</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Ngày">
            <input
              type="date"
              style={styles.input}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Giờ Check In">
            <input
              type="time"
              style={styles.input}
              value={form.check_in}
              onChange={(e) => setForm({ ...form, check_in: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Giờ Check Out">
            <input
              type="time"
              style={styles.input}
              value={form.check_out}
              onChange={(e) => setForm({ ...form, check_out: e.target.value })}
            />
          </FormField>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" style={{ ...styles.btnPrimary, flex: 1 }}>Lưu</button>
          <button type="button" onClick={onClose} style={{ ...styles.btnSecondary, flex: 1 }}>Hủy</button>
        </div>
      </form>
    </Modal>
  );
}

function ShipmentModal({ isOpen, onClose, onSubmit, uploadFile }) {
  const [form, setForm] = useState({
    order_code: '',
    customer: '',
    date: new Date().toISOString().split('T')[0],
    work_days: 1,
    price: 0,
    vehicle: 'truck',
    status: 'pending',
    payment_status: 'unpaid',
  });
  const [files, setFiles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Upload files if any
    let invoiceUrls = [];
    if (files.length > 0) {
      for (const file of files) {
        const url = await uploadFile(file);
        if (url) invoiceUrls.push(url);
      }
    }

    onSubmit({ ...form, invoice_urls: invoiceUrls });
    setForm({
      order_code: '',
      customer: '',
      date: new Date().toISOString().split('T')[0],
      work_days: 1,
      price: 0,
      vehicle: 'truck',
      status: 'pending',
      payment_status: 'unpaid',
    });
    setFiles([]);
  };

  if (!isOpen) return null;

  return (
    <Modal title="Thêm Đơn Hàng" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGrid}>
          <FormField label="Mã đơn hàng">
            <input
              type="text"
              style={styles.input}
              value={form.order_code}
              onChange={(e) => setForm({ ...form, order_code: e.target.value })}
              placeholder="DH-2024-XXX"
              required
            />
          </FormField>

          <FormField label="Khách hàng">
            <input
              type="text"
              style={styles.input}
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Ngày nhập">
            <input
              type="date"
              style={styles.input}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Số công">
            <input
              type="number"
              style={styles.input}
              value={form.work_days}
              onChange={(e) => setForm({ ...form, work_days: parseInt(e.target.value) })}
              min="1"
              required
            />
          </FormField>

          <FormField label="Giá trị (VNĐ)">
            <input
              type="number"
              style={styles.input}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) })}
              min="0"
              required
            />
          </FormField>

          <FormField label="Phương tiện">
            <select
              style={styles.input}
              value={form.vehicle}
              onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              required
            >
              <option value="train">🚂 Tàu hỏa</option>
              <option value="truck">🚛 Xe tải</option>
              <option value="both">🚂🚛 Cả hai</option>
            </select>
          </FormField>

          <FormField label="Trạng thái">
            <select
              style={styles.input}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              required
            >
              <option value="pending">Chờ xử lý</option>
              <option value="shipping">Đang vận chuyển</option>
              <option value="delivered">Đã giao</option>
            </select>
          </FormField>

          <FormField label="Thanh toán">
            <select
              style={styles.input}
              value={form.payment_status}
              onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
              required
            >
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </FormField>
        </div>

        <FormField label="Upload hóa đơn">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.png"
            onChange={(e) => setFiles(Array.from(e.target.files))}
            style={styles.input}
          />
          {files.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
              {files.length} file đã chọn
            </div>
          )}
        </FormField>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" style={{ ...styles.btnPrimary, flex: 1 }}>Lưu</button>
          <button type="button" onClick={onClose} style={{ ...styles.btnSecondary, flex: 1 }}>Hủy</button>
        </div>
      </form>
    </Modal>
  );
}

function ExpenseModal({ isOpen, onClose, onSubmit, uploadFile }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'fuel',
    amount: 0,
    paid_by: '',
    description: '',
  });
  const [files, setFiles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let invoiceUrls = [];
    if (files.length > 0) {
      for (const file of files) {
        const url = await uploadFile(file);
        if (url) invoiceUrls.push(url);
      }
    }

    onSubmit({ ...form, invoice_urls: invoiceUrls });
    setForm({
      date: new Date().toISOString().split('T')[0],
      type: 'fuel',
      amount: 0,
      paid_by: '',
      description: '',
    });
    setFiles([]);
  };

  if (!isOpen) return null;

  return (
    <Modal title="Thêm Chi Phí" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGrid}>
          <FormField label="Ngày">
            <input
              type="date"
              style={styles.input}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Loại chi phí">
            <select
              style={styles.input}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
            >
              <option value="fuel">Xăng dầu</option>
              <option value="warehouse">Kho bãi</option>
            </select>
          </FormField>

          <FormField label="Số tiền (VNĐ)">
            <input
              type="number"
              style={styles.input}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) })}
              min="0"
              required
            />
          </FormField>

          <FormField label="Người thanh toán">
            <input
              type="text"
              style={styles.input}
              value={form.paid_by}
              onChange={(e) => setForm({ ...form, paid_by: e.target.value })}
              required
            />
          </FormField>
        </div>

        <FormField label="Mô tả">
          <textarea
            style={{ ...styles.input, minHeight: '80px' }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Nhập mô tả chi tiết..."
          />
        </FormField>

        <FormField label="Upload hóa đơn">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.png"
            onChange={(e) => setFiles(Array.from(e.target.files))}
            style={styles.input}
          />
        </FormField>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" style={{ ...styles.btnPrimary, flex: 1 }}>Lưu</button>
          <button type="button" onClick={onClose} style={{ ...styles.btnSecondary, flex: 1 }}>Hủy</button>
        </div>
      </form>
    </Modal>
  );
}

function KPIModal({ isOpen, onClose, onSubmit, employees }) {
  const [form, setForm] = useState({
    employee_id: '',
    month: new Date().toISOString().slice(0, 7),
    base_salary: 0,
    work_days: 0,
    kpi: 100,
    bonus: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({
      employee_id: '',
      month: new Date().toISOString().slice(0, 7),
      base_salary: 0,
      work_days: 0,
      kpi: 100,
      bonus: 0,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal title="Cập Nhật KPI" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGrid}>
          <FormField label="Nhân viên">
            <select
              style={styles.input}
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              required
            >
              <option value="">Chọn nhân viên</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Tháng">
            <input
              type="month"
              style={styles.input}
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Lương cơ bản">
            <input
              type="number"
              style={styles.input}
              value={form.base_salary}
              onChange={(e) => setForm({ ...form, base_salary: parseInt(e.target.value) })}
              min="0"
              required
            />
          </FormField>

          <FormField label="Số công">
            <input
              type="number"
              style={styles.input}
              value={form.work_days}
              onChange={(e) => setForm({ ...form, work_days: parseInt(e.target.value) })}
              min="0"
              max="31"
              required
            />
          </FormField>

          <FormField label="KPI (%)">
            <input
              type="number"
              style={styles.input}
              value={form.kpi}
              onChange={(e) => setForm({ ...form, kpi: parseInt(e.target.value) })}
              min="0"
              max="100"
              required
            />
          </FormField>

          <FormField label="Thưởng KPI">
            <input
              type="number"
              style={styles.input}
              value={form.bonus}
              onChange={(e) => setForm({ ...form, bonus: parseInt(e.target.value) })}
              min="0"
              required
            />
          </FormField>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" style={{ ...styles.btnPrimary, flex: 1 }}>Lưu</button>
          <button type="button" onClick={onClose} style={{ ...styles.btnSecondary, flex: 1 }}>Hủy</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
}

function formatRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}

function calculateHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '-';
  
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  
  const totalMins = (outH * 60 + outM) - (inH * 60 + inM);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  
  return `${hours}h ${mins}m`;
}

function getGroupStyle(group) {
  const colors = {
    'boc-xep': '#8b5cf6',
    'lai-xe': '#3b82f6',
    'van-phong': '#10b981',
    'khac': '#f59e0b',
  };
  return {
    color: colors[group] || '#64748b',
    fontWeight: 600,
  };
}

function getStatusBadge(status) {
  const styles = {
    pending: { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
    shipping: { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
    delivered: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
  };
  
  return {
    ...styles[status],
    padding: '0.375rem 0.875rem',
    borderRadius: '2rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    display: 'inline-block',
  };
}

// =============================================================================
// STYLES
// =============================================================================
const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
  },
  
  sidebar: {
    width: '280px',
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(20px)',
    color: 'white',
    padding: '2rem 0',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  },
  
  logo: {
    fontFamily: 'Bebas Neue, sans-serif',
    fontSize: '1.8rem',
    fontWeight: 900,
    padding: '0 2rem 2rem',
    textAlign: 'center',
    letterSpacing: '3px',
    lineHeight: 1.2,
  },
  
  nav: {
    padding: '0 1rem',
  },
  
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    fontWeight: 600,
    borderRadius: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '0.5rem',
    textAlign: 'left',
    fontFamily: 'Outfit, sans-serif',
  },
  
  navItemActive: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
    transform: 'translateX(4px)',
  },
  
  aiButton: {
    padding: '1rem 2rem',
    marginTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  
  aiBtn: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: 'none',
    borderRadius: '0.75rem',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Outfit, sans-serif',
    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
  },
  
  main: {
    marginLeft: '280px',
    flex: 1,
    padding: '2rem',
    minHeight: '100vh',
  },
  
  header: {
    background: 'white',
    padding: '2rem',
    borderRadius: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: '2.25rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: 'Bebas Neue, sans-serif',
    letterSpacing: '1px',
  },
  
  headerSubtitle: {
    fontSize: '0.95rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  
  branchSelector: {
    display: 'flex',
    gap: '0.75rem',
  },
  
  branchBtn: {
    padding: '0.875rem 1.75rem',
    border: '2px solid #e2e8f0',
    background: 'white',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    fontFamily: 'Outfit, sans-serif',
  },
  
  branchBtnActive: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    borderColor: 'transparent',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  
  statCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: '2px solid transparent',
  },
  
  statLabel: {
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#64748b',
    marginBottom: '0.5rem',
  },
  
  statValue: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '0.5rem',
    fontFamily: 'Bebas Neue, sans-serif',
  },
  
  statChange: {
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  
  card: {
    background: 'white',
    padding: '2rem',
    borderRadius: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  },
  
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    color: '#0f172a',
  },
  
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'white',
    fontFamily: 'Bebas Neue, sans-serif',
    letterSpacing: '1px',
  },
  
  btnPrimary: {
    padding: '0.875rem 2rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
    fontFamily: 'Outfit, sans-serif',
  },
  
  btnSecondary: {
    padding: '0.875rem 2rem',
    background: '#f1f5f9',
    color: '#0f172a',
    border: 'none',
    borderRadius: '0.75rem',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Outfit, sans-serif',
  },
  
  btnDelete: {
    padding: '0.5rem 1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1.25rem',
    transition: 'all 0.3s ease',
  },
  
  tableWrapper: {
    background: 'white',
    borderRadius: '1.5rem',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  
  th: {
    padding: '1.25rem',
    textAlign: 'left',
    background: '#f8fafc',
    fontWeight: 700,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#475569',
  },
  
  tr: {
    transition: 'all 0.2s ease',
  },
  
  td: {
    padding: '1.25rem',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.95rem',
  },
  
  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '1rem',
    fontStyle: 'italic',
  },
  
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
  },
  
  modalContent: {
    background: 'white',
    borderRadius: '1.5rem',
    padding: '2.5rem',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid #f1f5f9',
  },
  
  modalTitle: {
    fontSize: '1.75rem',
    fontWeight: 800,
    fontFamily: 'Bebas Neue, sans-serif',
    letterSpacing: '1px',
  },
  
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#94a3b8',
    transition: 'all 0.3s ease',
    padding: 0,
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.25rem',
  },
  
  label: {
    marginBottom: '0.5rem',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#0f172a',
  },
  
  input: {
    padding: '0.875rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    fontFamily: 'Outfit, sans-serif',
    outline: 'none',
  },
  
  badgeSuccess: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    padding: '0.375rem 0.875rem',
    borderRadius: '2rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    display: 'inline-block',
  },
  
  badgeWarning: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    padding: '0.375rem 0.875rem',
    borderRadius: '2rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    display: 'inline-block',
  },
  
  badgeInfo: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
    padding: '0.375rem 0.875rem',
    borderRadius: '2rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    display: 'inline-block',
  },
};