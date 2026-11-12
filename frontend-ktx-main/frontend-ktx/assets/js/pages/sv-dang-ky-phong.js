// Trang đăng ký phòng cho sinh viên
(async function (K) {
  const page = document.getElementById("page");
  const s = K.session.get() || {};
  const [svs, phongs, lps, tns] = await Promise.all(["sinhVien", "phong", "loaiPhong", "toaNha"].map(r => K.api.list(r)));
  const sv = svs.find(x => x.mssv === s.mssv) || svs[0] || {};
  const availableRooms = phongs.filter(p => p.trangThai === "Còn trống");

  page.innerHTML = `
  <div class="row g-4">
    <div class="col-lg-7">
      <div class="panel">
        <div class="panel-head">
          <h3>Đơn đăng ký nguyện vọng thuê phòng KTX</h3>
          <span class="sub ms-auto">Học kỳ 1 năm học 2026–2027</span>
        </div>
        <div class="panel-body">
          <form id="formDangKy">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label text-ink3 small">Mã số sinh viên</label>
                <input class="form-control" value="${K.esc(sv.mssv || s.mssv)}" readonly>
              </div>
              <div class="col-md-6">
                <label class="form-label text-ink3 small">Họ và tên</label>
                <input class="form-control" value="${K.esc(sv.hoTen || s.hoTen)}" readonly>
              </div>
              <div class="col-md-6">
                <label class="form-label text-ink3 small">Nguyện vọng Tòa nhà</label>
                <select class="form-select" id="dkToa" required>
                  ${tns.map(t => `<option value="${t.toaNhaId}">${t.tenToa} (Khu ${t.loaiKhu})</option>`).join("")}
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label text-ink3 small">Nguyện vọng Loại phòng</label>
                <select class="form-select" id="dkLoai" required>
                  ${lps.map(l => `<option value="${l.loaiPhongId}">${l.tenLoai} (${K.money(l.giaChuan)}/tháng)</option>`).join("")}
                </select>
              </div>
              <div class="col-12">
                <label class="form-label text-ink3 small">Chọn phòng còn chỗ trống</label>
                <select class="form-select" id="dkPhong" required>
                  ${availableRooms.slice(0, 15).map(p => {
                    const t = tns.find(x => x.toaNhaId === p.toaNhaId);
                    const l = lps.find(x => x.loaiPhongId === p.loaiPhongId);
                    return `<option value="${p.phongId}">${p.phongId} - ${t ? t.tenToa : ''} (${l ? l.tenLoai : ''}) - Hiện có ${p.soNguoiHienTai} người</option>`;
                  }).join("")}
                </select>
              </div>
              <div class="col-12">
                <label class="form-label text-ink3 small">Ghi chú bổ sung (nếu có)</label>
                <textarea class="form-control" rows="3" placeholder="Nguyện vọng ở cùng bạn cùng lớp, ưu tiên tầng thấp..."></textarea>
              </div>
              <div class="col-12 mt-4 text-end">
                <button type="submit" class="btn btn-primary"><i class="bi bi-send me-1"></i>Gửi đơn đăng ký</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="col-lg-5">
      <div class="panel mb-4">
        <div class="panel-head">
          <h3>Tình trạng hiện tại</h3>
        </div>
        <div class="panel-body">
          <div class="d-flex align-items-center mb-3">
            <i class="bi bi-info-circle fs-3 text-primary me-3"></i>
            <div>
              <div class="fw-semibold">Trạng thái cư trú:</div>
              <div class="text-ink3">${K.esc(sv.trangThai || 'Đang lưu trú')}</div>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <i class="bi bi-door-open fs-3 text-success me-3"></i>
            <div>
              <div class="fw-semibold">Phòng đang xếp:</div>
              <div class="text-ink3">${sv.phongDangOid ? `Phòng <b>${sv.phongDangOid}</b>` : 'Chưa có phòng'}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Bảng giá tham khảo</h3>
        </div>
        <div class="panel-body p-0">
          <ul class="list-group list-group-flush">
            ${lps.map(l => `
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-semibold">${l.tenLoai}</div>
                  <small class="text-ink3">Tối đa ${l.soNguoiToiDa} người</small>
                </div>
                <span class="badge bg-primary rounded-pill">${K.money(l.giaChuan)}</span>
              </li>
            `).join("")}
          </ul>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById("formDangKy").onsubmit = async (e) => {
    e.preventDefault();
    const phongMoi = document.getElementById("dkPhong").value;
    sv.phongDangOid = phongMoi;
    sv.trangThai = "Đang lưu trú";
    try {
      await K.api.update("sinhVien", sv.mssv, sv);
      K.toast("Gửi đăng ký phòng thành công! Đã cập nhật phòng của bạn.", "ok");
      setTimeout(() => location.href = "trang-chu.html", 800);
    } catch (err) {
      K.toast("Lỗi đăng ký: " + err.message, "bad");
    }
  };
})(window.KTX);

