// Trang thông báo cho sinh viên
(async function (K) {
  const page = document.getElementById("page");
  const tbs = await K.api.list("thongBao");

  page.innerHTML = `
  <div class="panel">
    <div class="panel-head">
      <h3>Thông báo từ Ban quản lý KTX</h3>
      <span class="sub ms-auto">Cập nhật tin tức, quy định và lịch bảo trì</span>
    </div>
    <div class="panel-body">
      <div class="row g-4">
        ${tbs.map(t => `
          <div class="col-12">
            <div class="border rounded p-3 bg-white">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="badge ${t.loai === 'Quan trọng' ? 'bg-danger' : (t.loai === 'Tài chính' ? 'bg-primary' : 'bg-info')}">${t.loai || 'Thông báo'}</span>
                <small class="text-ink3"><i class="bi bi-clock me-1"></i>${K.dateTime(t.ngayGui)}</small>
              </div>
              <h5 class="fs-6 fw-bold mb-2">${K.esc(t.tieuDe)}</h5>
              <p class="text-ink3 mb-2" style="font-size:0.95rem">${K.esc(t.noiDung)}</p>
              <div class="small text-muted"><i class="bi bi-people me-1"></i>Đối tượng: <b>${K.esc(t.doiTuong || 'Tất cả sinh viên')}</b></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  </div>`;
})(window.KTX);

