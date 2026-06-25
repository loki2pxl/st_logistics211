# Hướng Dẫn Thu Thập Dữ Liệu Nhân Sự & Vận Tải
*(Employee & Vehicle Data Collection Guide for ST Logistics)*

Để đưa hệ thống vào vận hành chính thức, Quý công ty vui lòng điền thông tin nhân viên và phương tiện vận chuyển vào file mẫu **[employee_import_template.csv](file:///Users/trangtnguyen/ST_logistics/employee_import_template.csv)** theo các chuẩn định dạng dưới đây.

---

## 1. Các Cột Thông Tin Cần Điền

| Tên Cột trong File CSV | Ý Nghĩa | Bắt Buộc | Quy Tắc Định Dạng |
| :--- | :--- | :--- | :--- |
| **Mã Nhân Viên** | Mã số định danh của nhân viên | Có | Định dạng: `EMP001`, `EMP002`... Không chứa dấu cách. |
| **Họ Tên** | Họ tên đầy đủ của nhân viên | Có | Nhập chữ tiếng Việt có dấu bình thường. |
| **Vai Trò** | Vai trò/Chức năng trong công ty | Có | Phải chọn chính xác 1 trong 5 khóa bên dưới (Xem Mục 2). |
| **Chi Nhánh** | Địa điểm làm việc | Có | Điền `hanoi` (Hà Nội) hoặc `saigon` (Sài Gòn). |
| **Tên Đăng Nhập** | Tên đăng nhập vào ứng dụng | Có | Viết thường, không dấu, không dấu cách (Ví dụ: `nguyenvana`). |
| **Email Đăng Nhập** | Email để đăng nhập | Có | Định dạng email hợp lệ (Ví dụ: `tuan.nv@stlogistics.com`). |
| **Mật Khẩu Ban Đầu** | Mật khẩu đăng nhập đầu tiên | Có | Tối thiểu 6 ký tự (Ví dụ: `123456`). |
| **Biển Số Xe** | Biển số xe tải lái xe sử dụng | Chỉ Lái Xe | Định dạng: `29C-123.45` hoặc `51D-999.99` (Bỏ trống đối với vai trò khác). |
| **Số Điện Thoại** | Số điện thoại liên hệ | Có | Nhập định dạng số (Ví dụ: `0912345678`). |

---

## 2. Quy Định Giá Trị Vai Trò (Cột Vai Trò)
Để hệ thống phân quyền chính xác các màn hình nhập liệu hàng ngày, cột **Vai Trò** chỉ được nhập các giá trị tiếng Anh viết thường sau:

* **`laixe`**: Nhân viên lái xe (được mở form nhập chuyến đi, cự ly, giá cước, tiền dầu, phí cầu đường).
* **`bocxep`**: Nhân viên bốc xếp tại kho bãi (được mở form báo cáo container, sản lượng bốc dỡ hàng tấn).
* **`giaonhan`**: Điều phối/Caretaker đường sắt (được mở form nhập thông tin toa tàu, toa hàng, khối lượng và phân xe tải giao).
* **`vanphong`**: Kế toán/Hành chính (được mở form gửi báo cáo chi phí tổng hợp).
* **`admin`**: Giám đốc/Quản lý cấp cao (xem tổng quan toàn bộ chi nhánh, phê duyệt chi phí, kpi và tính lương).

---

## 3. Cách Sử Dụng File
1. Mở file **[employee_import_template.csv](file:///Users/trangtnguyen/ST_logistics/employee_import_template.csv)** bằng **Microsoft Excel**, **WPS Office** hoặc **Google Sheets**.
2. Điền thông tin toàn bộ đội ngũ nhân sự của công ty vào các hàng tiếp theo, xóa các dòng ví dụ của hệ thống nếu cần.
3. Khi lưu file, chọn định dạng lưu là **CSV UTF-8 (Comma delimited) (.csv)** để tránh lỗi phông chữ tiếng Việt.
4. Gửi lại file đã hoàn thành cho quản trị viên hệ thống để thực hiện import trực tiếp vào cơ sở dữ liệu Supabase.
