// Trang chủ sinh viên – khung layout Sinh viên (TS1-03). Số liệu chi tiết bổ sung ở Sprint 2–5.
(async function (K) {
  const page = document.getElementById("page");
  const s = K.session.get() || {};
  const [svs, phongs, lps, tns, tbs, hds] = await Promise.all(["sinhVien", "phong", "loaiPhong", "toaNha", "thongBao", "hoaDon"].map(r => K.api.list(r)));
  const sv = svs.find(x => x.mssv === s.mssv) || {};
  const p = phongs.find(x => x.phongId === sv.phongDangOid);
  const lp = p && lps.find(x => x.loaiPhongId === p.loaiPhongId);
  const tn = p && tns.find(x => x.toaNhaId === p.toaNhaId);
  const hd = p && hds.find(x => x.phongId === p.phongId);
  const hour = new Date().getHours();
  const greet = hour < 11 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  page.innerHTML = `
  <div class="hello mb-4">
    <div class="avatar lg">${K.initials(s.hoTen)}</div>
    <div><h1>${greet}, ${K.esc((s.hoTen || "").split(" ").pop())}</h1><p>${K.esc(sv.khoa || "")} · Lớp ${K.esc(sv.lop || "—")} · MSSV ${K.esc(s.mssv || "")}</p></div>
    <div class="room-badge">${p ? `<small>Phòng đang ở</small><b>${p.phongId}</b><small>${K.esc(tn.tenToa)} · tầng ${p.tang}</small>` : `<small>Chưa có phòng</small><b>—</b>`}</div>
  </div>

  <div class="row g-4">
    <div class="col-lg-8">
      <div class="panel mb-4"><div class="panel-head"><h3>Phòng của tôi</h3><span class="sub ms-auto">${p ? `Hợp đồng năm học 2026–2027` : ""}</span></div>
        <div class="panel-body">${p ? `
          <div class="row g-3 align-items-center">
            <div class="col-sm-6"><div class="text-ink3 small">Loại phòng</div><div class="fw-semibold">${K.esc(lp.tenLoai)}</div>
              <div class="mt-2">${K.beds(p.soNguoiHienTai, lp.soNguoiToiDa, p.trangThai)} <span class="small text-ink3 ms-1">${p.soNguoiHienTai}/${lp.soNguoiToiDa} người</span></div></div>
            <div class="col-sm-3"><div class="text-ink3 small">Giá thuê</div><div class="fw-semibold num">${K.money(lp.giaChuan)}<span class="text-ink3 fw-normal">/tháng</span></div></div>
            <div class="col-sm-3"><div class="text-ink3 small">Trưởng nhà</div><div class="fw-semibold">${K.esc(tn.truongNha)}</div></div>
            <div class="col-12">${(lp.tienIch || []).map(t => `<span class="chip">${K.esc(t)}</span>`).join("")}</div>
          </div>` : `<div class="empty"><i class="bi bi-door-closed"></i><b>Bạn chưa được xếp phòng</b>Đăng ký thuê phòng sẽ mở ở Sprint 2.</div>`}
        </div></div>

      <div class="panel"><div class="panel-head"><h3>Thông báo mới</h3><span class="sprint-note ms-auto"><i class="bi bi-info-circle"></i>Xem đầy đủ ở Sprint 2</span></div>
        <ul class="list-k">${tbs.slice(0, 4).map(t => `<li><div class="ic ${t.loai === "Tài chính" ? "violet" : t.loai === "Bảo trì" ? "warn" : t.loai === "Quan trọng" ? "bad" : "blue"}"><i class="bi ${t.loai === "Tài chính" ? "bi-cash-coin" : t.loai === "Bảo trì" ? "bi-tools" : t.loai === "Quan trọng" ? "bi-exclamation-lg" : "bi-calendar-event"}"></i></div><div class="flex-grow-1"><div class="t1">${K.esc(t.tieuDe)}</div><div class="t2">${K.esc(t.doiTuong)} · ${K.ago(t.ngayGui)}</div></div></li>`).join("")}</ul></div>
    </div>
    <div class="col-lg-4">
      <div class="panel mb-4"><div class="panel-head"><h3>Hóa đơn tháng 10</h3></div><div class="panel-body">
        ${hd ? `<div class="d-flex justify-content-between align-items-end"><div><div class="text-ink3 small">Tổng phòng phải trả</div><div class="fs-4 fw-bold num">${K.money(hd.tienPhong + hd.tienDien + hd.tienNuoc + hd.dichVu)}</div></div>${hd.trangThai === "Đã thanh toán" ? '<span class="pill ok">Đã thanh toán</span>' : hd.trangThai === "Quá hạn" ? '<span class="pill bad">Quá hạn</span>' : '<span class="pill warn">Chưa thanh toán</span>'}</div>
        <div class="small text-ink3 mt-2">Hạn thanh toán ${K.date(hd.hanThanhToan)} · thanh toán trực tuyến mở ở Sprint 5</div>` : `<div class="text-ink3">Chưa có hóa đơn cho phòng của bạn.</div>`}
      </div></div>
      <div class="panel"><div class="panel-head"><h3>Lối tắt</h3></div><div class="panel-body"><div class="quick">
        <a href="doi-mat-khau.html"><i class="bi bi-key"></i>Đổi mật khẩu</a>
        <a href="ho-so.html"><i class="bi bi-person-vcard"></i>Hồ sơ cá nhân</a>
        <a href="phan-anh.html"><i class="bi bi-chat-left-text"></i>Gửi phản ánh</a>
        <a href="ra-vao.html"><i class="bi bi-clock-history"></i>Lịch sử ra/vào</a>
      </div></div></div>
    </div>
  </div>`;
})(window.KTX);
