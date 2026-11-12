# Frontend – Hệ thống Quản lý KTX tích hợp nhận diện (Nhóm 7)

Giao diện thiết kế lại cho **Sprint 1** và toàn bộ trang **Quản lý KTX**. Thuần HTML + CSS + JavaScript + Bootstrap 5,
chạy offline (font, icon, Bootstrap, Chart.js đã nằm trong `assets/vendor`), không phụ thuộc backend.

## Chạy thử

Mở bằng một web server tĩnh bất kỳ (không mở trực tiếp bằng file://):

- VS Code: cài *Live Server* → chuột phải `login.html` → *Open with Live Server*
- Hoặc: `python -m http.server 8080` trong thư mục này → mở http://localhost:8080

| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Ban quản lý (Admin) | `admin` | `Admin@123` |
| Quản lý | `quanly` | `Quanly@123` |
| Bảo vệ (chỉ thấy mục An ninh) | `baove01` | `Baove@123` |
| Sinh viên | `23574801` | `Sv@12345` |
| Tài khoản bị khóa | `23574899` | `Sv@12345` |

Dữ liệu mẫu lưu trong localStorage của trình duyệt. Muốn reset: mở Console gõ `KTX.api.resetDemo()` rồi tải lại trang.

## Sprint 1 – đối chiếu task

| Task | Nội dung | File |
|---|---|---|
| TS1-03 | Layout chung Ban quản lý + Sinh viên (sidebar theo vai trò, topbar, menu mobile) | `assets/js/app.js`, `assets/css/app.css` |
| TS1-05 | Đăng nhập (chọn vai trò, hiện/ẩn mật khẩu, Caps Lock, ghi nhớ, quên mật khẩu, báo lỗi sai/khóa) | `login.html` |
| TS1-05 | Đổi mật khẩu (kiểm tra mật khẩu cũ, độ mạnh, 4 điều kiện, nhập lại) | `admin/doi-mat-khau.html`, `sinhvien/doi-mat-khau.html` |
| US01 | Phân quyền phía giao diện: chặn trang khi chưa đăng nhập, sai vai trò; menu ẩn theo vai trò; trang Tài khoản & phân quyền | `app.js`, `admin/tai-khoan.html` |
| TS1-07 | Tòa nhà: thẻ/bảng, tìm, lọc khu, thêm/sửa/xóa (chặn xóa khi còn phòng, chặn giảm số tầng khi có phòng ở tầng cao) | `admin/toa-nha.html` |
| TS1-07 | Loại phòng: sức chứa, giá chuẩn, tiện ích dạng tag, chặn xóa khi đang dùng | `admin/loai-phong.html` |
| TS1-08 | Phòng: danh sách + **sơ đồ theo tầng**, lọc tòa/loại/trạng thái, mã phòng tự sinh `A1-307`, chi tiết phòng, xuất CSV, chặn xóa/bảo trì khi còn người | `admin/phong.html` |

Các trang của sprint sau (Sinh viên, Hợp đồng, Hóa đơn, Điện nước, Thông báo, Phản ánh, Camera, Khách, Cảnh báo, Dashboard)
đã có giao diện hoàn chỉnh với dữ liệu mẫu; nhãn `S2…S6` / `MR` trên menu cho biết sprint hoàn thiện nghiệp vụ.

## Cấu trúc

```
frontend/
├─ login.html, index.html
├─ admin/*.html            # mỗi trang chỉ là khung, nội dung do assets/js/pages/<tên>.js vẽ
├─ sinhvien/*.html
└─ assets/
   ├─ css/app.css          # design system: màu xanh dương + tím, font Be Vietnam Pro
   ├─ js/store.js          # LỚP DỮ LIỆU: mock hiện tại, đổi sang gọi API Java tại đây
   ├─ js/app.js            # layout, phân quyền giao diện, toast, confirm, bảng lọc/sắp xếp/phân trang
   ├─ js/pages/*.js        # code từng trang
   └─ vendor/              # bootstrap, bootstrap-icons, font, chart.js (offline)
```

## Nối với backend Java (Spring Boot)

1. Copy cả thư mục vào `src/main/resources/static/` → Spring Boot phục vụ sẵn tại `/login.html`, `/admin/phong.html`…
2. Trong `assets/js/store.js` đổi `USE_MOCK = false` (và `API_BASE` nếu backend chạy cổng khác). Mọi trang tự gọi API, không phải sửa trang.
3. Backend cần cung cấp các endpoint (JSON, tên trường giữ nguyên như bảng CSDL dạng camelCase: `toaNhaId`, `tenToa`, `soTang`, `loaiKhu`, `truongNha`, `loaiPhongId`, `tenLoai`, `soNguoiToiDa`, `giaChuan`, `tienIch` (mảng chuỗi), `phongId`, `tenPhong`, `tang`, `soNguoiHienTai`, `trangThai`):
   - `POST /api/auth/login` body `{tenDangNhap, matKhau}` → `{taiKhoanId, tenDangNhap, hoTen, vaiTro, mssv}`; sai → HTTP 401 `{message}`; bị khóa → HTTP 403 `{message}`
   - `POST /api/auth/doi-mat-khau` body `{matKhauCu, matKhauMoi}`; sai mật khẩu cũ → 400 `{message}`
   - `GET/POST /api/toa-nha`, `PUT/DELETE /api/toa-nha/{id}` – tương tự cho `/api/loai-phong`, `/api/phong`, `/api/tai-khoan`, `/api/sinh-vien`…
   - Lỗi nghiệp vụ trả `{ "message": "..." }` để giao diện hiện đúng câu báo lỗi.
4. Phân quyền ở giao diện chỉ để ẩn/hiện; backend **bắt buộc** kiểm tra lại quyền (Spring Security, session/JWT) và băm mật khẩu (BCrypt).

Nếu nhóm dùng Thymeleaf thay vì REST: giữ nguyên `app.css` và cấu trúc HTML trong các file `pages/*.js` làm mẫu markup cho template.
