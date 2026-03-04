# 🚛 Logistics Management Dashboard

Hệ thống quản lý logistics toàn diện cho công ty vận tải nhỏ tại Việt Nam.

## ✨ Tính Năng

- ✅ **Quản lý 2 chi nhánh**: Hà Nội & Sài Gòn
- ✅ **Chấm công nhân viên**: Check in/out, tính giờ tự động
- ✅ **Tracking đơn hàng**: Theo dõi vận chuyển, upload hóa đơn
- ✅ **Quản lý chi phí**: Kho bãi, xăng dầu với chứng từ
- ✅ **KPI & Lương thưởng**: Tính lương dựa trên hiệu suất
- ✅ **AI Insights**: Phân tích dữ liệu bằng Claude AI
- ✅ **Realtime**: Cập nhật dữ liệu tức thì
- ✅ **Responsive**: Hoạt động tốt trên mobile & desktop

## 🚀 Quick Start

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình Supabase
Mở `src/App.js` và thay đổi:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Chạy ứng dụng
```bash
npm start
```

### 4. Deploy lên Vercel
```bash
npm install -g vercel
vercel
```

## 📖 Hướng Dẫn Chi Tiết

Xem file **SETUP-GUIDE.md** để biết hướng dẫn setup đầy đủ từng bước.

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Backend**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Hosting**: Vercel
- **AI**: Anthropic Claude API

## 💰 Chi Phí

- **Hoàn toàn MIỄN PHÍ** cho công ty nhỏ
- Supabase Free: 500MB DB + 1GB storage
- Vercel Free: 100GB bandwidth/tháng

## 📊 Database Schema

```sql
- employees (nhân viên)
- attendance (chấm công)
- shipments (đơn hàng)
- expenses (chi phí)
- kpi (đánh giá hiệu suất)
```

## 🔐 Security

- Row Level Security (RLS) enabled
- API keys stored securely
- File uploads sanitized
- HTTPS enforced

## 📱 Screenshots

[Demo link sẽ được cập nhật sau khi deploy]

## 🤝 Support

Mọi thắc mắc xin liên hệ hoặc tạo issue trên GitHub.

## 📝 License

MIT License - Tự do sử dụng cho mục đích thương mại

---

**Made with ❤️ for Vietnamese logistics companies**
