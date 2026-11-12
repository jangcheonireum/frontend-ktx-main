// Trang lịch sử ra vào qua FaceID của sinh viên
(async function (K) {
  const page = document.getElementById("page");
  const s = K.session.get() || {};
  const [svs, logs] = await Promise.all(["sinhVien", "nhatKy"].map(r => K.api.list(r)));
  const sv = svs.find(x => x.mssv === s.mssv) || svs[0] || {};
  const myLogs = logs.filter(l => l.mssv === sv.mssv);

  page.innerHTML = `
  <div class="panel">
    <div class="panel-head">
      <h3>Nhật ký ra / vào cổng (Nhận diện khuôn mặt AI)</h3>
      <span class="sub ms-auto">Ghi nhận tự động từ hệ thống Camera an ninh</span>
    </div>
    <div class="panel-body p-0">
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Cổng / Vị trí Camera</th>
              <th>Chiều</th>
              <th>Độ tin cậy nhận diện</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${myLogs.length ? myLogs.map(l => `
              <tr>
                <td><b>${K.dateTime(l.thoiGian)}</b></td>
                <td><i class="bi bi-camera-video me-1 text-primary"></i>${l.camera || 'CAM-01 (Cổng chính)'}</td>
                <td>
                  <span class="badge ${l.huong === 'Vào' ? 'bg-success' : 'bg-warning text-dark'}">
                    <i class="bi ${l.huong === 'Vào' ? 'bi-box-arrow-in-right' : 'bi-box-arrow-right'} me-1"></i>${l.huong}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2" style="height:6px;max-width:100px">
                      <div class="progress-bar bg-success" style="width:${Math.round((l.doTinCay || 0.95) * 100)}%"></div>
                    </div>
                    <small class="fw-semibold">${Math.round((l.doTinCay || 0.95) * 100)}%</small>
                  </div>
                </td>
                <td><span class="pill ok">Hợp lệ</span></td>
              </tr>
            `).join("") : `<tr><td colspan="5" class="text-center py-4 text-ink3">Chưa có nhật ký ra vào nào được ghi nhận gần đây.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
})(window.KTX);

