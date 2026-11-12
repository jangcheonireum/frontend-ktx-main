// Trang gửi phản ánh sự cố sinh viên
(async function (K) {
  const page = document.getElementById("page");
  const s = K.session.get() || {};
  const [svs, pas] = await Promise.all(["sinhVien", "phanAnh"].map(r => K.api.list(r)));
  const sv = svs.find(x => x.mssv === s.mssv) || svs[0] || {};
  const myPas = pas.filter(p => p.mssv === sv.mssv);

  page.innerHTML = `
  <div class="row g-4">
    <div class="col-lg-5">
      <div class="panel">
        <div class="panel-head">
          <h3>Báo hỏng & Phản ánh sự cố</h3>
        </div>
        <div class="panel-body">
          <form id="formPhanAnh">
            <div class="mb-3">
              <label class="form-label text-ink3 small">Phòng xảy ra sự cố</label>
              <input class="form-control" id="paPhong" value="${K.esc(sv.phongDangOid || '')}" placeholder="VD: A1-307" required>
            </div>
            <div class="mb-3">
              <label class="form-label text-ink3 small">Loại sự cố</label>
              <select class="form-select" id="paLoai" required>
                <option value="Điện">Hệ thống điện (ổ cắm, công tắc, chập điện)</option>
                <option value="Nước">Hệ thống nước (vòi rò rỉ, tắc cống, bồn cầu)</option>
                <option value="Thiết bị">Thiết bị phòng (quạt trần, bình nóng lạnh, giường, khóa cửa)</option>
                <option value="Wifi">Mạng Internet / Wifi</option>
                <option value="Vệ sinh">Vệ sinh môi trường & hành lang</option>
                <option value="Khác">Vấn đề khác</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label text-ink3 small">Mô tả chi tiết</label>
              <textarea class="form-control" id="paNoiDung" rows="4" placeholder="Mô tả cụ thể sự cố để bộ phận kỹ thuật hỗ trợ nhanh nhất..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary w-100"><i class="bi bi-send me-1"></i>Gửi phản ánh</button>
          </form>
        </div>
      </div>
    </div>

    <div class="col-lg-7">
      <div class="panel">
        <div class="panel-head">
          <h3>Lịch sử phản ánh của bạn</h3>
        </div>
        <div class="panel-body p-0">
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Loại sự cố</th>
                  <th>Nội dung</th>
                  <th>Thời gian gửi</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody id="paTableBody">
                ${myPas.length ? myPas.map(p => `
                  <tr>
                    <td>#${p.id}</td>
                    <td><span class="badge bg-secondary">${K.esc(p.loai)}</span></td>
                    <td><div class="text-truncate" style="max-width:200px" title="${K.esc(p.noiDung)}">${K.esc(p.noiDung)}</div></td>
                    <td><small class="text-ink3">${K.dateTime(p.ngayGui)}</small></td>
                    <td><span class="pill ${p.trangThai === 'Đã hoàn thành' ? 'ok' : (p.trangThai === 'Đang xử lý' ? 'warn' : 'bad')}">${p.trangThai}</span></td>
                  </tr>
                `).join("") : `<tr><td colspan="5" class="text-center py-4 text-ink3">Bạn chưa gửi phản ánh sự cố nào.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById("formPhanAnh").onsubmit = async (e) => {
    e.preventDefault();
    const loai = document.getElementById("paLoai").value;
    const phongId = document.getElementById("paPhong").value;
    const noiDung = document.getElementById("paNoiDung").value;

    const newItem = {
      mssv: sv.mssv,
      phongId: phongId,
      loai: loai,
      noiDung: noiDung,
      ngayGui: new Date().toISOString(),
      trangThai: "Chờ tiếp nhận"
    };

    try {
      await K.api.create("phanAnh", newItem);
      K.toast("Đã gửi phản ánh tới Ban quản lý!", "ok");
      document.getElementById("paNoiDung").value = "";
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      K.toast("Lỗi gửi phản ánh: " + err.message, "bad");
    }
  };
})(window.KTX);

