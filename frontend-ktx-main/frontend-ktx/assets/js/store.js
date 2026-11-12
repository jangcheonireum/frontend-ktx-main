/* =========================================================
   store.js – Lớp dữ liệu giả lập (mock) cho giao diện.
   Toàn bộ trang chỉ gọi KTX.api.*  -> khi có backend Java
   (Spring Boot REST), chỉ cần đổi USE_MOCK = false và các hàm
   sẽ gọi fetch() tới /api/<resource>. Không phải sửa trang.
   ========================================================= */
window.KTX = window.KTX || {};

(function (K) {
  const USE_MOCK = true;           // đổi thành false khi nối backend Java
  const API_BASE = "/api";          // ví dụ: http://localhost:8080/api
  const DB_KEY = "ktx.db.v3";

  // ---- storage an toàn (private mode / bị chặn vẫn chạy) ----
  const mem = {};
  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { delete mem[k]; } }
  };
  K.ls = ls;

  // ---- sinh dữ liệu mẫu có tính lặp lại ----
  let seedN = 7;
  const rnd = () => { seedN = (seedN * 9301 + 49297) % 233280; return seedN / 233280; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const ho = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô"];
  const demNam = ["Văn", "Minh", "Đức", "Quốc", "Anh", "Công", "Hữu"];
  const demNu = ["Thị", "Thu", "Ngọc", "Thanh", "Khánh", "Mai"];
  const tenNam = ["Dũng", "Dương", "Hùng", "Long", "Nam", "Phúc", "Quân", "Sơn", "Tuấn", "Việt", "Khoa", "Giáp"];
  const tenNu = ["Huyền", "Linh", "Trang", "Hà", "Ngân", "Vy", "Yến", "Thảo", "Lan", "Hương", "Dương", "My"];
  const khoa = ["Công nghệ thông tin", "Kinh tế", "Sư phạm Toán", "Ngoại ngữ", "Xây dựng", "Luật", "Nông Lâm Ngư"];
  const que = ["Nghệ An", "Hà Tĩnh", "Thanh Hóa", "Quảng Bình", "Ninh Bình", "Hà Nội", "Quảng Trị"];

  function seed() {
    seedN = 7;
    const vaiTro = [
      { vaiTroId: 1, tenVaiTro: "Admin", moTa: "Toàn quyền hệ thống" },
      { vaiTroId: 2, tenVaiTro: "Quản lý", moTa: "Ban quản lý ký túc xá" },
      { vaiTroId: 3, tenVaiTro: "Sinh viên", moTa: "Sinh viên nội trú" },
      { vaiTroId: 4, tenVaiTro: "Bảo vệ", moTa: "Trực cổng, giám sát an ninh" }
    ];
    const toaNha = [
      { toaNhaId: "A1", tenToa: "Tòa A1", soTang: 5, loaiKhu: "Nam", truongNha: "Nguyễn Văn Hải" },
      { toaNhaId: "A2", tenToa: "Tòa A2", soTang: 5, loaiKhu: "Nam", truongNha: "Trần Quốc Bảo" },
      { toaNhaId: "B1", tenToa: "Tòa B1", soTang: 6, loaiKhu: "Nữ", truongNha: "Lê Thị Hồng" },
      { toaNhaId: "B2", tenToa: "Tòa B2", soTang: 4, loaiKhu: "Nữ", truongNha: "Phạm Thu Hà" },
      { toaNhaId: "C1", tenToa: "Tòa C1 (dịch vụ)", soTang: 3, loaiKhu: "Nam", truongNha: "Võ Minh Tâm" }
    ];
    const loaiPhong = [
      { loaiPhongId: 1, tenLoai: "Phòng 8 người tiêu chuẩn", soNguoiToiDa: 8, giaChuan: 250000, tienIch: ["Quạt trần", "Nhà vệ sinh chung", "Wifi"] },
      { loaiPhongId: 2, tenLoai: "Phòng 6 người tiêu chuẩn", soNguoiToiDa: 6, giaChuan: 320000, tienIch: ["Quạt trần", "Nhà vệ sinh khép kín", "Wifi"] },
      { loaiPhongId: 3, tenLoai: "Phòng 4 người tiêu chuẩn", soNguoiToiDa: 4, giaChuan: 450000, tienIch: ["Nhà vệ sinh khép kín", "Wifi", "Bình nóng lạnh"] },
      { loaiPhongId: 4, tenLoai: "Phòng 4 người điều hòa", soNguoiToiDa: 4, giaChuan: 650000, tienIch: ["Điều hòa", "Nhà vệ sinh khép kín", "Wifi", "Bình nóng lạnh"] },
      { loaiPhongId: 5, tenLoai: "Phòng 2 người dịch vụ", soNguoiToiDa: 2, giaChuan: 1200000, tienIch: ["Điều hòa", "Tủ lạnh", "Bình nóng lạnh", "Ban công", "Wifi"] }
    ];
    const phong = [];
    const typeByBld = { A1: [1, 2, 3], A2: [2, 3, 4], B1: [1, 2, 3, 4], B2: [3, 4], C1: [5, 4] };
    toaNha.forEach(t => {
      const perFloor = t.toaNhaId === "C1" ? 5 : 6;
      for (let f = 1; f <= t.soTang; f++) {
        for (let r = 1; r <= perFloor; r++) {
          const typeId = pick(typeByBld[t.toaNhaId]);
          const lp = loaiPhong.find(x => x.loaiPhongId === typeId);
          const id = `${t.toaNhaId}-${f}${String(r).padStart(2, "0")}`;
          let trangThai = "Còn trống";
          let n = Math.floor(rnd() * (lp.soNguoiToiDa + 2));
          if (n > lp.soNguoiToiDa) n = lp.soNguoiToiDa;
          if (rnd() < 0.07) { trangThai = "Đang bảo trì"; n = 0; }
          else if (n >= lp.soNguoiToiDa) trangThai = "Đã đầy";
          phong.push({ phongId: id, tenPhong: `Phòng ${f}${String(r).padStart(2, "0")}`, toaNhaId: t.toaNhaId, loaiPhongId: lp.loaiPhongId, tang: f, soNguoiHienTai: n, trangThai });
        }
      }
    });

    const sinhVien = [];
    const occupied = phong.filter(p => p.soNguoiHienTai > 0);
    for (let i = 0; i < 64; i++) {
      const p = occupied[i % occupied.length];
      const nu = toaNha.find(t => t.toaNhaId === p.toaNhaId).loaiKhu === "Nữ";
      const name = `${pick(ho)} ${nu ? pick(demNu) : pick(demNam)} ${nu ? pick(tenNu) : pick(tenNam)}`;
      const mssv = String(23574801 + i);
      const st = i < 52 ? "Đang lưu trú" : (i < 58 ? "Chờ duyệt" : "Đã rời KTX");
      sinhVien.push({
        mssv, hoTen: i === 0 ? "Lê Anh Dũng" : name, gioiTinh: nu ? "Nữ" : "Nam",
        ngaySinh: `200${4 + (i % 2)}-${String(1 + (i % 12)).padStart(2, "0")}-${String(3 + (i % 25)).padStart(2, "0")}`,
        sdt: "09" + String(10000000 + Math.floor(rnd() * 89999999)), email: `${mssv}@vinhuni.edu.vn`,
        khoa: pick(khoa), lop: `65K${1 + (i % 4)}`, queQuan: pick(que),
        phongDangOid: st === "Chờ duyệt" ? null : p.phongId, trangThai: st, faceId: rnd() > .35
      });
    }
    sinhVien[0].gioiTinh = "Nam"; sinhVien[0].phongDangOid = phong.find(p => p.toaNhaId === "A1" && p.soNguoiHienTai > 0).phongId;

    const taiKhoan = [
      { taiKhoanId: 1, tenDangNhap: "admin", matKhau: "Admin@123", vaiTroId: 1, hoTen: "Quản trị viên", trangThai: true, lastLogin: "2026-10-31T21:12:00" },
      { taiKhoanId: 2, tenDangNhap: "quanly", matKhau: "Quanly@123", vaiTroId: 2, hoTen: "Nguyễn Văn Hải", trangThai: true, lastLogin: "2026-10-31T08:02:00" },
      { taiKhoanId: 3, tenDangNhap: "baove01", matKhau: "Baove@123", vaiTroId: 4, hoTen: "Trần Văn Bình", trangThai: true, lastLogin: "2026-10-30T22:40:00" },
      { taiKhoanId: 4, tenDangNhap: "23574801", matKhau: "Sv@12345", vaiTroId: 3, hoTen: "Lê Anh Dũng", mssv: "23574801", trangThai: true, lastLogin: "2026-10-29T19:15:00" },
      { taiKhoanId: 5, tenDangNhap: "23574802", matKhau: "Sv@12345", vaiTroId: 3, hoTen: sinhVien[1].hoTen, mssv: "23574802", trangThai: true, lastLogin: null },
      { taiKhoanId: 6, tenDangNhap: "23574899", matKhau: "Sv@12345", vaiTroId: 3, hoTen: "Tài khoản bị khóa", trangThai: false, lastLogin: null }
    ];

    const hopDong = sinhVien.filter(s => s.phongDangOid).slice(0, 40).map((s, i) => {
      const start = `2026-0${8 + (i % 2)}-${String(1 + (i % 20)).padStart(2, "0")}`;
      const p = phong.find(x => x.phongId === s.phongDangOid);
      const lp = loaiPhong.find(x => x.loaiPhongId === p.loaiPhongId);
      const st = i % 9 === 0 ? "Sắp hết hạn" : (i % 13 === 0 ? "Hết hạn" : "Hiệu lực");
      return { hopDongId: "HD" + String(2026001 + i), mssv: s.mssv, phongId: s.phongDangOid, ngayBatDau: start, ngayKetThuc: st === "Hết hạn" ? "2026-10-15" : (st === "Sắp hết hạn" ? "2026-11-20" : "2027-06-30"), tienCoc: 500000, giaThue: lp.giaChuan, trangThai: st };
    });

    const dienNuoc = phong.filter(p => p.soNguoiHienTai > 0).slice(0, 36).map((p, i) => {
      const dienCu = 1200 + Math.floor(rnd() * 800), nuocCu = 300 + Math.floor(rnd() * 200);
      return { id: i + 1, phongId: p.phongId, thang: 10, nam: 2026, dienCu, dienMoi: dienCu + 60 + Math.floor(rnd() * 140), nuocCu, nuocMoi: nuocCu + 8 + Math.floor(rnd() * 20), trangThai: i % 4 === 0 ? "Chưa lập" : (i % 5 === 0 ? "Chờ xác nhận" : "Đã tính hóa đơn"), ngayGhi: `2026-10-${String(25 + (i % 5)).padStart(2, "0")}` };
    });
    const hoaDon = dienNuoc.filter(d => d.trangThai === "Đã tính hóa đơn").map((d, i) => {
      const p = phong.find(x => x.phongId === d.phongId), lp = loaiPhong.find(x => x.loaiPhongId === p.loaiPhongId);
      const tienDien = (d.dienMoi - d.dienCu) * 3500, tienNuoc = (d.nuocMoi - d.nuocCu) * 15000;
      return { hoaDonId: "HDN" + String(10261 + i), phongId: d.phongId, thang: "10/2026", tienPhong: lp.giaChuan * p.soNguoiHienTai, tienDien, tienNuoc, dichVu: 50000 * p.soNguoiHienTai, hanThanhToan: "2026-11-10", trangThai: i % 5 === 0 ? "Quá hạn" : (i % 3 === 0 ? "Chưa thanh toán" : "Đã thanh toán") };
    });

    const vatTuTen = ["Giường tầng", "Tủ cá nhân", "Bàn học", "Quạt trần", "Điều hòa", "Bình nóng lạnh", "Bóng đèn"];
    const vatTu = [];
    phong.slice(0, 40).forEach((p, i) => { vatTuTen.slice(0, 4 + (i % 3)).forEach((t, j) => vatTu.push({ id: vatTu.length + 1, phongId: p.phongId, tenVatTu: t, soLuong: t === "Giường tầng" ? 2 + (i % 3) : 1 + (j % 2), tinhTrang: rnd() < .12 ? "Hỏng" : (rnd() < .1 ? "Cần bảo trì" : "Tốt") })); });

    const thongBao = [
      { id: 1, tieuDe: "Thông báo thu tiền điện nước tháng 10/2026", noiDung: "Sinh viên hoàn thành thanh toán trước ngày 10/11/2026.", doiTuong: "Tất cả sinh viên", loai: "Tài chính", ngayGui: "2026-10-30T10:30:00" },
      { id: 2, tieuDe: "Bảo trì hệ thống điện tòa B1", noiDung: "Cắt điện từ 8h00 đến 11h00 ngày 02/11/2026.", doiTuong: "Tòa B1", loai: "Bảo trì", ngayGui: "2026-10-28T15:00:00" },
      { id: 3, tieuDe: "Đăng ký khuôn mặt cho hệ thống ra/vào", noiDung: "Sinh viên chưa đăng ký khuôn mặt vui lòng đến văn phòng BQL.", doiTuong: "Tất cả sinh viên", loai: "Quan trọng", ngayGui: "2026-10-25T09:00:00" },
      { id: 4, tieuDe: "Giải bóng đá KTX mở rộng 2026", noiDung: "Mỗi tòa đăng ký tối đa 2 đội.", doiTuong: "Tất cả sinh viên", loai: "Sự kiện", ngayGui: "2026-10-20T19:00:00" }
    ];
    const loaiSuCo = ["Điện", "Nước", "Wifi", "Thiết bị", "Vệ sinh"];
    const noiDungSuCo = { "Điện": "Ổ điện chập chờn, có mùi khét", "Nước": "Vòi nước nhà vệ sinh rò rỉ", "Wifi": "Wifi yếu, mất mạng buổi tối", "Thiết bị": "Quạt trần kêu to, quay chậm", "Vệ sinh": "Hành lang tầng chưa được dọn" };
    const phanAnh = Array.from({ length: 14 }, (_, i) => {
      const s = sinhVien[i * 3 % 50], l = loaiSuCo[i % 5];
      return { id: i + 1, mssv: s.mssv, phongId: s.phongDangOid, loai: l, noiDung: noiDungSuCo[l], ngayGui: `2026-10-${String(31 - i).padStart(2, "0")}T0${8 + (i % 2)}:15:00`, trangThai: i < 4 ? "Chờ tiếp nhận" : (i < 8 ? "Đang xử lý" : "Đã hoàn thành") };
    });
    const nhatKy = Array.from({ length: 18 }, (_, i) => {
      const s = sinhVien[i * 2];
      const stranger = i === 3 || i === 11;
      return { id: i + 1, thoiGian: `2026-11-01T${String(16 - Math.floor(i / 3)).padStart(2, "0")}:${String(55 - i * 3).padStart(2, "0")}:00`, camera: "CAM-0" + (1 + (i % 4)), mssv: stranger ? null : s.mssv, hoTen: stranger ? "Người lạ" : s.hoTen, phongId: stranger ? null : s.phongDangOid, huong: i % 2 ? "Ra" : "Vào", doTinCay: stranger ? 0 : 0.86 + rnd() * 0.13 };
    });
    const khach = Array.from({ length: 9 }, (_, i) => ({ id: i + 1, hoTen: `${pick(ho)} ${pick(demNam)} ${pick(tenNam)}`, cccd: "0400" + String(10000000 + Math.floor(rnd() * 89999999)), quanHe: pick(["Bố", "Mẹ", "Anh trai", "Bạn học", "Chị gái"]), mssv: sinhVien[i * 4].mssv, phongId: sinhVien[i * 4].phongDangOid, gioVao: `2026-11-01T${String(8 + i).padStart(2, "0")}:10:00`, gioRa: i < 6 ? `2026-11-01T${String(9 + i).padStart(2, "0")}:30:00` : null }));
    const canhBao = [
      { id: 1, loai: "Người lạ", moTa: "Phát hiện khuôn mặt không có trong hệ thống tại cổng chính", camera: "CAM-01", thoiGian: "2026-11-01T16:41:00", mucDo: "Cao", trangThai: "Chưa xử lý" },
      { id: 2, loai: "Lảng vảng", moTa: "Một người đứng khu vực cửa tòa B1 quá 5 phút", camera: "CAM-03", thoiGian: "2026-11-01T15:20:00", mucDo: "Trung bình", trangThai: "Chưa xử lý" },
      { id: 3, loai: "Ra/vào ngoài giờ", moTa: "Sinh viên 23574815 vào KTX lúc 23:47", camera: "CAM-02", thoiGian: "2026-10-31T23:47:00", mucDo: "Thấp", trangThai: "Đã xử lý" },
      { id: 4, loai: "Người lạ", moTa: "Khuôn mặt lạ xuất hiện tại cửa sau tòa A2", camera: "CAM-04", thoiGian: "2026-10-31T21:05:00", mucDo: "Cao", trangThai: "Đã xử lý" }
    ];
    return { vaiTro, taiKhoan, toaNha, loaiPhong, phong, sinhVien, hopDong, dienNuoc, hoaDon, vatTu, thongBao, phanAnh, nhatKy, khach, canhBao };
  }

  let db;
  function load() {
    if (db) return db;
    const raw = ls.get(DB_KEY);
    try { db = raw ? JSON.parse(raw) : null; } catch (e) { db = null; }
    if (!db) { db = seed(); save(); }
    return db;
  }
  function save() { ls.set(DB_KEY, JSON.stringify(db)); }

  const KEYS = { toaNha: "toaNhaId", loaiPhong: "loaiPhongId", phong: "phongId", sinhVien: "mssv", taiKhoan: "taiKhoanId", hopDong: "hopDongId", hoaDon: "hoaDonId" };
  const keyOf = (res) => KEYS[res] || "id";
  // Ánh xạ REST gợi ý cho backend Java (Spring Boot):
  //   GET    /api/toa-nha            POST /api/toa-nha
  //   PUT    /api/toa-nha/{id}       DELETE /api/toa-nha/{id}
  //   (tương tự: /api/loai-phong, /api/phong, /api/sinh-vien ...)
  const PATH = { toaNha: "toa-nha", loaiPhong: "loai-phong", phong: "phong", sinhVien: "sinh-vien", taiKhoan: "tai-khoan", hopDong: "hop-dong", hoaDon: "hoa-don", dienNuoc: "dien-nuoc", vatTu: "vat-tu", thongBao: "thong-bao", phanAnh: "phan-anh", nhatKy: "nhat-ky", khach: "khach", canhBao: "canh-bao", vaiTro: "vai-tro" };

  async function http(method, url, body) {
    const res = await fetch(API_BASE + url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) { let m = "Lỗi " + res.status; try { m = (await res.json()).message || m; } catch (e) { } throw new Error(m); }
    return res.status === 204 ? null : res.json();
  }
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const delay = (v) => new Promise(r => setTimeout(() => r(v), 120));

  K.api = {
    list(res) { return USE_MOCK ? delay(clone(load()[res] || [])) : http("GET", "/" + PATH[res]); },
    get(res, id) { return USE_MOCK ? delay(clone((load()[res] || []).find(x => String(x[keyOf(res)]) === String(id)) || null)) : http("GET", `/${PATH[res]}/${id}`); },
    create(res, obj) {
      if (!USE_MOCK) return http("POST", "/" + PATH[res], obj);
      const arr = load()[res], k = keyOf(res);
      if (obj[k] == null || obj[k] === "") obj[k] = arr.reduce((m, x) => Math.max(m, Number(x[k]) || 0), 0) + 1;
      if (arr.some(x => String(x[k]) === String(obj[k]))) return Promise.reject(new Error(`Mã ${obj[k]} đã tồn tại.`));
      arr.push(obj); save(); return delay(clone(obj));
    },
    update(res, id, obj) {
      if (!USE_MOCK) return http("PUT", `/${PATH[res]}/${id}`, obj);
      const arr = load()[res], k = keyOf(res), i = arr.findIndex(x => String(x[k]) === String(id));
      if (i < 0) return Promise.reject(new Error("Không tìm thấy bản ghi."));
      arr[i] = { ...arr[i], ...obj }; save(); return delay(clone(arr[i]));
    },
    remove(res, id) {
      if (!USE_MOCK) return http("DELETE", `/${PATH[res]}/${id}`);
      const arr = load()[res], k = keyOf(res), i = arr.findIndex(x => String(x[k]) === String(id));
      if (i >= 0) arr.splice(i, 1); save(); return delay(true);
    },
    // POST /api/auth/login  {tenDangNhap, matKhau} -> {taiKhoanId, hoTen, vaiTro}
    login(user, pass) {
      if (!USE_MOCK) return http("POST", "/auth/login", { tenDangNhap: user, matKhau: pass });
      const d = load(), tk = d.taiKhoan.find(t => t.tenDangNhap.toLowerCase() === String(user).trim().toLowerCase());
      if (!tk || tk.matKhau !== pass) return new Promise((_, rej) => setTimeout(() => rej(new Error("Tên đăng nhập hoặc mật khẩu không đúng.")), 350));
      if (!tk.trangThai) return Promise.reject(new Error("Tài khoản đã bị khóa. Liên hệ Ban quản lý KTX để mở khóa."));
      tk.lastLogin = new Date().toISOString(); save();
      const vt = d.vaiTro.find(v => v.vaiTroId === tk.vaiTroId);
      return delay({ taiKhoanId: tk.taiKhoanId, tenDangNhap: tk.tenDangNhap, hoTen: tk.hoTen, vaiTro: vt.tenVaiTro, mssv: tk.mssv || null });
    },
    // POST /api/auth/doi-mat-khau {matKhauCu, matKhauMoi}
    changePassword(taiKhoanId, oldPw, newPw) {
      if (!USE_MOCK) return http("POST", "/auth/doi-mat-khau", { matKhauCu: oldPw, matKhauMoi: newPw });
      const tk = load().taiKhoan.find(t => t.taiKhoanId === taiKhoanId);
      if (!tk) return Promise.reject(new Error("Phiên đăng nhập không hợp lệ."));
      if (tk.matKhau !== oldPw) return Promise.reject(new Error("Mật khẩu hiện tại không đúng."));
      tk.matKhau = newPw; save(); return delay(true);
    },
    resetDemo() { ls.del(DB_KEY); db = null; load(); }
  };
  if (USE_MOCK) load();
})(window.KTX);
