# 🚀 HƯỚNG DẪN SETUP & DEPLOY ỨNG DỤNG LOGISTICS

## 📋 MỤC LỤC
1. [Setup Database (Supabase)](#1-setup-database-supabase)
2. [Setup Project](#2-setup-project)
3. [Deploy lên Vercel](#3-deploy-lên-vercel)
4. [Sử dụng ứng dụng](#4-sử-dụng-ứng-dụng)

---

## 1. SETUP DATABASE (SUPABASE)

### Bước 1: Tạo tài khoản Supabase (MIỄN PHÍ)
1. Truy cập https://supabase.com
2. Click "Start your project"
3. Đăng ký bằng GitHub hoặc email
4. Tạo organization mới (tên tùy ý)

### Bước 2: Tạo project
1. Click "New Project"
2. Điền thông tin:
   - **Name**: logistics-management
   - **Database Password**: Tạo mật khẩu mạnh (lưu lại)
   - **Region**: Singapore (gần VN nhất)
3. Click "Create new project" (chờ 2-3 phút)

### Bước 3: Lấy API Keys
1. Vào **Settings** (icon bánh răng bên trái)
2. Click **API**
3. Copy 2 giá trị này:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (key dài)

### Bước 4: Tạo tables trong database
1. Click **SQL Editor** (bên trái)
2. Click "+ New Query"
3. Paste đoạn SQL sau và RUN:

```sql
-- Bảng nhân viên
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  "group" TEXT NOT NULL CHECK ("group" IN ('boc-xep', 'lai-xe', 'van-phong', 'khac')),
  branch TEXT NOT NULL CHECK (branch IN ('hanoi', 'saigon')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng chấm công
CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id),
  employee_name TEXT NOT NULL,
  "group" TEXT NOT NULL,
  branch TEXT NOT NULL,
  date DATE NOT NULL,
  check_in TIME NOT NULL,
  check_out TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng đơn hàng
CREATE TABLE shipments (
  id BIGSERIAL PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  customer TEXT NOT NULL,
  branch TEXT NOT NULL,
  date DATE NOT NULL,
  work_days INTEGER NOT NULL,
  price BIGINT NOT NULL,
  vehicle TEXT NOT NULL CHECK (vehicle IN ('train', 'truck', 'both')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'shipping', 'delivered')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'unpaid')),
  invoice_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng chi phí
CREATE TABLE expenses (
  id BIGSERIAL PRIMARY KEY,
  branch TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('warehouse', 'fuel')),
  amount BIGINT NOT NULL,
  paid_by TEXT NOT NULL,
  description TEXT,
  invoice_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng KPI
CREATE TABLE kpi (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id),
  branch TEXT NOT NULL,
  month TEXT NOT NULL,
  base_salary BIGINT NOT NULL,
  work_days INTEGER NOT NULL,
  kpi INTEGER NOT NULL CHECK (kpi >= 0 AND kpi <= 100),
  bonus BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month)
);

-- Thêm dữ liệu mẫu
INSERT INTO employees (name, "group", branch) VALUES
  ('Nguyễn Văn A', 'boc-xep', 'hanoi'),
  ('Trần Thị B', 'van-phong', 'hanoi'),
  ('Lê Văn C', 'lai-xe', 'hanoi'),
  ('Phạm Văn D', 'boc-xep', 'saigon'),
  ('Hoàng Thị E', 'van-phong', 'saigon');

INSERT INTO attendance (employee_id, employee_name, "group", branch, date, check_in, check_out) VALUES
  (1, 'Nguyễn Văn A', 'boc-xep', 'hanoi', CURRENT_DATE, '08:15', '17:30'),
  (2, 'Trần Thị B', 'van-phong', 'hanoi', CURRENT_DATE, '08:00', '17:00'),
  (3, 'Lê Văn C', 'lai-xe', 'hanoi', CURRENT_DATE, '06:30', '18:45');

INSERT INTO shipments (order_code, customer, branch, date, work_days, price, vehicle, status, payment_status) VALUES
  ('DH-2024-001', 'Công ty TNHH ABC', 'hanoi', '2024-03-01', 3, 45000000, 'both', 'delivered', 'paid'),
  ('DH-2024-002', 'XNK Việt Nam', 'hanoi', '2024-03-02', 5, 78500000, 'truck', 'shipping', 'unpaid'),
  ('DH-2024-003', 'Tập đoàn XYZ', 'saigon', '2024-03-03', 2, 32000000, 'train', 'pending', 'unpaid');

INSERT INTO expenses (branch, date, type, amount, paid_by, description) VALUES
  ('hanoi', '2024-03-03', 'fuel', 2450000, 'Lê Văn C', 'Đổ xăng xe tải VN-29A'),
  ('hanoi', '2024-03-02', 'warehouse', 35000000, 'Nguyễn Thị D', 'Thuê kho tháng 3'),
  ('saigon', '2024-03-01', 'fuel', 1850000, 'Phạm Văn E', 'Đổ xăng xe tải VN-31B');

INSERT INTO kpi (employee_id, branch, month, base_salary, work_days, kpi, bonus) VALUES
  (1, 'hanoi', '2024-03', 8000000, 26, 100, 2000000),
  (2, 'hanoi', '2024-03', 12000000, 25, 85, 2550000),
  (3, 'hanoi', '2024-03', 10000000, 26, 100, 2500000);
```

### Bước 5: Setup Storage (để lưu file)
1. Click **Storage** (bên trái)
2. Click "Create a new bucket"
3. Name: `invoices`
4. Public bucket: **BẬT** (toggle ON)
5. Click "Create bucket"

---

## 2. SETUP PROJECT

### Bước 1: Cài đặt Node.js
- Download: https://nodejs.org (chọn bản LTS)
- Cài đặt và verify: `node --version`

### Bước 2: Tạo project React
Mở terminal/cmd và chạy:

```bash
# Tạo project mới
npx create-react-app logistics-app
cd logistics-app

# Cài đặt dependencies
npm install @supabase/supabase-js
```

### Bước 3: Cấu hình Supabase
1. Mở file `src/App.js`
2. Xóa toàn bộ nội dung
3. Copy toàn bộ code từ file `logistics-app.jsx` 
4. Thay đổi 2 dòng này (dòng 13-14):

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co'; // Thay bằng Project URL của bạn
const SUPABASE_ANON_KEY = 'eyJhbGc...'; // Thay bằng anon key của bạn
```

### Bước 4: Test local
```bash
npm start
```
Truy cập http://localhost:3000 để test!

---

## 3. DEPLOY LÊN VERCEL (MIỄN PHÍ)

### Cách 1: Deploy nhanh (không cần Git)

1. **Cài Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel
```

3. Làm theo hướng dẫn:
   - Login bằng email/GitHub
   - Confirm project name
   - Chờ deploy (2-3 phút)
   - Nhận link: `https://your-app.vercel.app`

### Cách 2: Deploy qua GitHub (Khuyên dùng)

1. **Tạo repository trên GitHub**:
   - Vào https://github.com/new
   - Tạo repo mới (public)

2. **Push code lên GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

3. **Deploy trên Vercel**:
   - Vào https://vercel.com
   - Click "Add New Project"
   - Import GitHub repository
   - Click "Deploy"
   - Đợi 2-3 phút → Nhận link production!

4. **Setup tên miền riêng** (Tùy chọn):
   - Vào Settings > Domains
   - Thêm domain của bạn
   - Cấu hình DNS theo hướng dẫn

---

## 4. SỬ DỤNG ỨNG DỤNG

### Tính năng chính:

✅ **Chấm công**:
- Thêm/xóa chấm công
- Tự động tính giờ làm việc
- Lọc theo nhóm, ngày

✅ **Tracking đơn hàng**:
- Quản lý đơn hàng
- Upload hóa đơn
- Theo dõi trạng thái vận chuyển & thanh toán

✅ **Quản lý chi phí**:
- Ghi nhận chi phí kho bãi & xăng dầu
- Upload hóa đơn
- Thống kê tự động

✅ **KPI & Lương**:
- Tính lương dựa trên KPI
- Quản lý thưởng tháng
- Báo cáo chi tiết

✅ **AI Insights**:
- Click nút "🤖 AI Insights" để nhận phân tích từ Claude AI

### Quản lý 2 chi nhánh:
- Click nút "📍 Hà Nội" hoặc "📍 Sài Gòn"
- Dữ liệu tự động lọc theo chi nhánh

---

## 🔧 TROUBLESHOOTING

### Lỗi "Invalid API key"
→ Kiểm tra lại SUPABASE_URL và SUPABASE_ANON_KEY

### Lỗi "relation does not exist"
→ Chưa chạy SQL script. Vào SQL Editor và chạy lại

### Lỗi upload file
→ Kiểm tra bucket "invoices" đã tạo và set public chưa

### Lỗi deploy Vercel
→ Chạy `npm run build` local trước để check lỗi

---

## 📊 GIỚI HẠN FREE TIER

**Supabase Free**:
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- ✅ Đủ cho công ty nhỏ!

**Vercel Free**:
- 100GB bandwidth/tháng
- Unlimited deployments
- ✅ Hoàn toàn đủ dùng!

---

## 🚀 NÂNG CẤP SAU NÀY

Khi cần scale lớn hơn:

1. **Supabase Pro** ($25/tháng):
   - 8GB database
   - 100GB storage
   - Daily backups

2. **Vercel Pro** ($20/tháng):
   - 1TB bandwidth
   - Advanced analytics
   - Custom domains unlimited

3. **Tên miền riêng**:
   - Mua tại: https://www.pa.vn (VN)
   - Hoặc: https://namecheap.com (quốc tế)
   - Giá: ~200,000đ/năm

---

## 📞 HỖ TRỢ

Nếu gặp khó khăn:
1. Check console browser (F12) để xem lỗi
2. Check Supabase logs: Settings > Logs
3. Check Vercel deployment logs

**Chúc bạn thành công! 🎉**
