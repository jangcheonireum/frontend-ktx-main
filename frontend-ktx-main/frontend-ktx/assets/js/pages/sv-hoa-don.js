// Trang hóa đơn và thanh toán sinh viên
(async function (K) {
  const page = document.getElementById("page");
  const s = K.session.get() || {};
  const [svs, hds, phongs] = await Promise.all(["sinhVien", "hoaDon", "phong"].map(r => K.api.list(r)));
  const sv = svs.find(x => x.mssv === s.mssv) || svs[0] || {};
  const myRooms = sv.phongDangOid ? [sv.phongDangOid] : [];
  const myHds = hds.filter(h => myRooms.includes(h.phongId) || h.mssv === sv.mssv);
  const p = phongs.find(x => x.phongId === sv.phongDangOid);
  const curOccupants = (p && p.soNguoiHienTai) || 1;

  page.innerHTML = `
  <div class="panel mb-4">
    <div class="panel-head">
      <h3>Hóa đơn phòng ${sv.phongDangOid || "—"}</h3>
      <span class="sub ms-auto">Tiền điện, nước, phòng chia đều theo người ở</span>
    </div>
    <div class="panel-body p-0">
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>Mã HĐ</th>
              <th>Tháng</th>
              <th>Tiền phòng</th>
              <th>Tiền điện</th>
              <th>Tiền nước</th>
              <th>Dịch vụ</th>
              <th>Tổng phòng</th>
              <th>Phần của bạn</th>
              <th>Hạn nộp</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${myHds.length ? myHds.map(h => {
              const total = (h.tienPhong || 0) + (h.tienDien || 0) + (h.tienNuoc || 0) + (h.dichVu || 0);
              const myShare = Math.round(total / curOccupants);
              return `
                <tr>
                  <td><b>${h.hoaDonId}</b></td>
                  <td>${h.thang}</td>
                  <td>${K.money(h.tienPhong)}</td>
                  <td>${K.money(h.tienDien)}</td>
                  <td>${K.money(h.tienNuoc)}</td>
                  <td>${K.money(h.dichVu)}</td>
                  <td class="fw-bold">${K.money(total)}</td>
                  <td class="fw-bold text-primary">${K.money(myShare)}</td>
                  <td>${K.date(h.hanThanhToan)}</td>
                  <td><span class="pill ${h.trangThai === 'Đã thanh toán' ? 'ok' : (h.trangThai === 'Quá hạn' ? 'bad' : 'warn')}">${h.trangThai}</span></td>
                </tr>`;
            }).join("") : `<tr><td colspan="10" class="text-center py-4 text-ink3">Hiện chưa có dữ liệu hóa đơn cho phòng của bạn.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-head">
      <h3>Hướng dẫn thanh toán</h3>
    </div>
    <div class="panel-body">
      <div class="row g-3">
        <div class="col-md-6">
          <div class="border rounded p-3 bg-light">
            <h5 class="fs-6 fw-bold mb-2"><i class="bi bi-bank me-2"></i>Chuyển khoản ngân hàng</h5>
            <div class="small text-ink3 mb-1">Ngân hàng: <b>Vietcombank - Chi nhánh Nghệ An</b></div>
            <div class="small text-ink3 mb-1">Số tài khoản: <b>0101000888999</b></div>
            <div class="small text-ink3 mb-1">Chủ tài khoản: <b>BAN QUAN LY KTX DH VINH</b></div>
            <div class="small text-ink3">Nội dung CK: <b class="text-danger">${sv.mssv || 'MSSV'} ${sv.phongDangOid || 'PHONG'} TIEN KTX</b></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="border rounded p-3 bg-light">
            <h5 class="fs-6 fw-bold mb-2"><i class="bi bi-cash me-2"></i>Nộp trực tiếp tại văn phòng KTX</h5>
            <div class="small text-ink3 mb-1">Địa điểm: <b>Phòng 101, Nhà điều hành KTX (Tầng 1)</b></div>
            <div class="small text-ink3 mb-1">Thời gian: <b>Thứ 2 đến Thứ 6 (7h30 - 17h00)</b></div>
            <div class="small text-ink3">Lưu ý: Giữ lại biên lai thu tiền để đối chiếu khi cần thiết.</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
})(window.KTX);

