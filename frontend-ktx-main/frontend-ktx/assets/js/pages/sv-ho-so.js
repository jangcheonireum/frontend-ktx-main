// Trang hồ sơ cá nhân sinh viên
(async function (K) {
  const page = document.getElementById("page");
  const s = K.session.get() || {};
  const [svs, phongs, lps, tns] = await Promise.all(["sinhVien", "phong", "loaiPhong", "toaNha"].map(r => K.api.list(r)));
  const sv = svs.find(x => x.mssv === s.mssv) || svs[0] || {};
  const p = phongs.find(x => x.phongId === sv.phongDangOid);
  const lp = p && lps.find(x => x.loaiPhongId === p.loaiPhongId);
  const tn = p && tns.find(x => x.toaNhaId === p.toaNhaId);

  page.innerHTML = `
  <div class="row g-4">
    <div class="col-lg-4">
      <div class="panel text-center py-4">
        <div class="avatar xl mx-auto mb-3" style="width:80px;height:80px;font-size:2rem">${K.initials(sv.hoTen || s.hoTen)}</div>
        <h3 class="mb-1">${K.esc(sv.hoTen || s.hoTen)}</h3>
        <p class="text-ink3 mb-2">MSSV: <b>${K.esc(sv.mssv || s.mssv)}</b></p>
        <span class="pill ${sv.trangThai === "Đang lưu trú" ? "ok" : "warn"}">${K.esc(sv.trangThai || "Đang lưu trú")}</span>

        <hr class="my-4">

        <div class="text-start px-3">
          <div class="mb-3">
            <small class="text-ink3 d-block">Trạng thái nhận diện (FaceID)</small>
            <span class="badge ${sv.faceId ? "bg-success" : "bg-secondary"} mt-1">
              <i class="bi ${sv.faceId ? "bi-check-circle" : "bi-x-circle"} me-1"></i>${sv.faceId ? "Đã đăng ký FaceID" : "Chưa đăng ký FaceID"}
            </span>
          </div>
          <div class="mb-3">
            <small class="text-ink3 d-block">Phòng lưu trú</small>
            <div class="fw-semibold">${p ? `${p.phongId} (${tn.tenToa})` : "Chưa xếp phòng"}</div>
          </div>
          <div>
            <small class="text-ink3 d-block">Loại phòng</small>
            <div class="fw-semibold">${lp ? lp.tenLoai : "—"}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-8">
      <div class="panel mb-4">
        <div class="panel-head">
          <h3>Thông tin cá nhân & đào tạo</h3>
        </div>
        <div class="panel-body">
          <form id="formHoSo" class="row g-3">
            <div class="col-md-6">
              <label class="form-label text-ink3 small">Họ và tên</label>
              <input class="form-control" value="${K.esc(sv.hoTen || s.hoTen)}" readonly>
            </div>
            <div class="col-md-6">
              <label class="form-label text-ink3 small">Mã số sinh viên</label>
              <input class="form-control" value="${K.esc(sv.mssv || s.mssv)}" readonly>
            </div>
            <div class="col-md-6">
              <label class="form-label text-ink3 small">Giới tính</label>
              <input class="form-control" value="${K.esc(sv.gioiTinh || 'Nam')}" readonly>
            </div>
            <div class="col-md-6">
              <label class="form-label text-ink3 small">Ngày sinh</label>
              <input class="form-control" type="date" value="${K.esc(sv.ngaySinh || '2004-01-01')}" readonly>
            </div>
            <div class="col-md-6">
              <label class="form-label text-ink3 small">Khoa / Viện</label>
              <input class="form-control" value="${K.esc(sv.khoa || 'Công nghệ thông tin')}" readonly>
            </div>
            <div class="col-md-6">
              <label class="form-label text-ink3 small">Lớp sinh hoạt</label>
              <input class="form-control" value="${K.esc(sv.lop || '65K1')}" readonly>
            </div>
            <div class="col-md-6">
              <label class="form-label text-ink3 small">Số điện thoại</label>
              <input class="form-control" id="svSdt" value="${K.esc(sv.sdt || '0912345678')}">
            </div>
            <div class="col-md-6">
              <label class="form-label text-ink3 small">Email trường</label>
              <input class="form-control" id="svEmail" value="${K.esc(sv.email || (s.mssv + '@vinhuni.edu.vn'))}">
            </div>
            <div class="col-12">
              <label class="form-label text-ink3 small">Quê quán / Thường trú</label>
              <input class="form-control" id="svQue" value="${K.esc(sv.queQuan || 'Nghệ An')}">
            </div>
            <div class="col-12 text-end mt-4">
              <button type="submit" class="btn btn-primary"><i class="bi bi-save me-1"></i>Lưu thay đổi liên hệ</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById("formHoSo").onsubmit = async (e) => {
    e.preventDefault();
    sv.sdt = document.getElementById("svSdt").value;
    sv.email = document.getElementById("svEmail").value;
    sv.queQuan = document.getElementById("svQue").value;
    try {
      await K.api.update("sinhVien", sv.mssv, sv);
      K.toast("Cập nhật thông tin liên hệ thành công!", "ok");
    } catch (err) {
      K.toast("Lỗi: " + err.message, "bad");
    }
  };
})(window.KTX);
