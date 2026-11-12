// Bảng điều khiển Ban quản lý (giao diện – số liệu tổng hợp đầy đủ ở Sprint 6, US14)
(async function (K) {
  const page = document.getElementById("page");
  const [phongs, lps, toas, svs, pas, cbs, hds] = await Promise.all(["phong", "loaiPhong", "toaNha", "sinhVien", "phanAnh", "canhBao", "hoaDon"].map(r => K.api.list(r)));
  const cap = p => (lps.find(l => l.loaiPhongId === p.loaiPhongId) || {}).soNguoiToiDa || 0;
  const active = phongs.filter(p => p.trangThai !== "Đang bảo trì");
  const tot = active.reduce((s, p) => s + cap(p), 0), occ = phongs.reduce((s, p) => s + p.soNguoiHienTai, 0);
  const s = K.session.get();
  const months = ["T5", "T6", "T7", "T8", "T9", "T10"], revenue = [182, 176, 95, 168, 214, 226];

  page.innerHTML = `
  <div class="page-head"><div><h1>Chào ${K.esc(s.hoTen)}, hôm nay KTX thế nào</h1><p>${new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</p></div>
    <div class="actions"><a class="btn btn-ghost" href="thong-bao.html"><i class="bi bi-megaphone"></i>Gửi thông báo</a><a class="btn btn-primary" href="phong.html"><i class="bi bi-door-open"></i>Xem phòng</a></div></div>
  <div class="stat-strip">
    ${K.stat("c-blue", "bi-pie-chart", "Tỷ lệ lấp đầy", `${Math.round(occ / tot * 100)}<small>%</small>`, `${occ}/${tot} chỗ đang dùng`)}
    ${K.stat("c-ok", "bi-door-closed", "Phòng còn trống", phongs.filter(p => p.trangThai === "Còn trống").length, `${tot - occ} chỗ có thể xếp`)}
    ${K.stat("c-warn", "bi-tools", "Phản ánh chờ xử lý", pas.filter(p => p.trangThai !== "Đã hoàn thành").length, `${pas.filter(p => p.trangThai === "Chờ tiếp nhận").length} chưa tiếp nhận`)}
    ${K.stat("c-bad", "bi-shield-exclamation", "Cảnh báo an ninh", cbs.filter(c => c.trangThai === "Chưa xử lý").length, "chưa xử lý")}
  </div>
  <div class="row g-4">
    <div class="col-xl-8">
      <div class="panel mb-4"><div class="panel-head"><div><h3>Doanh thu thu được theo tháng</h3><div class="sub">Triệu đồng · tiền phòng + điện nước + dịch vụ</div></div><span class="ms-auto fw-bold num fs-5">${revenue.reduce((a, b) => a + b, 0).toLocaleString("vi-VN")} tr</span></div>
        <div class="panel-body"><div style="height:260px"><canvas id="rev" aria-label="Biểu đồ doanh thu 6 tháng" role="img"></canvas></div>
          <details class="mt-2 small"><summary class="text-ink3">Xem dạng bảng</summary><table class="table table-sm mt-2 num"><tr>${months.map(m => `<th>${m}</th>`).join("")}</tr><tr>${revenue.map(v => `<td>${v} tr</td>`).join("")}</tr></table></details></div></div>
      <div class="panel"><div class="panel-head"><h3>Lấp đầy theo tòa</h3><a class="ms-auto small fw-semibold" href="toa-nha.html">Quản lý tòa nhà</a></div><div class="panel-body">
        ${toas.map(t => { const ps = phongs.filter(p => p.toaNhaId === t.toaNhaId); const c = ps.filter(p => p.trangThai !== "Đang bảo trì").reduce((a, p) => a + cap(p), 0), o = ps.reduce((a, p) => a + p.soNguoiHienTai, 0), pct = c ? Math.round(o / c * 100) : 0;
          return `<div class="d-flex align-items-center gap-3 mb-3"><div style="width:130px" class="fw-semibold">${K.esc(t.tenToa)}</div><div class="meter flex-grow-1" style="height:10px"><span style="width:${pct}%"></span></div><div class="num small" style="width:110px;text-align:right"><b>${pct}%</b> · ${o}/${c}</div></div>`; }).join("")}
      </div></div>
    </div>
    <div class="col-xl-4">
      <div class="panel mb-4"><div class="panel-head"><h3>Thao tác nhanh</h3></div><div class="panel-body"><div class="quick">
        <a href="phong.html"><i class="bi bi-plus-square"></i>Thêm phòng</a><a href="sinh-vien.html"><i class="bi bi-person-plus"></i>Thêm sinh viên</a>
        <a href="hoa-don.html"><i class="bi bi-receipt"></i>Tạo hóa đơn</a><a href="phan-anh.html"><i class="bi bi-tools"></i>Xử lý phản ánh</a></div></div></div>
      <div class="panel mb-4"><div class="panel-head"><h3>Phản ánh mới nhất</h3><a class="ms-auto small fw-semibold" href="phan-anh.html">Xem tất cả</a></div>
        <ul class="list-k">${pas.slice(0, 4).map(p => `<li><div class="ic ${p.trangThai === "Chờ tiếp nhận" ? "warn" : p.trangThai === "Đang xử lý" ? "blue" : "ok"}"><i class="bi ${p.loai === "Điện" ? "bi-lightning" : p.loai === "Nước" ? "bi-droplet" : p.loai === "Wifi" ? "bi-wifi" : "bi-wrench"}"></i></div><div class="flex-grow-1 min-w-0"><div class="t1 text-truncate">${K.esc(p.noiDung)}</div><div class="t2">Phòng ${p.phongId} · ${K.ago(p.ngayGui)}</div></div></li>`).join("")}</ul></div>
      <div class="panel"><div class="panel-head"><h3>Hóa đơn tháng 10</h3></div><div class="panel-body">
        ${["Đã thanh toán", "Chưa thanh toán", "Quá hạn"].map(st => { const n = hds.filter(h => h.trangThai === st).length; return `<div class="d-flex justify-content-between align-items-center mb-2"><span class="pill ${st === "Đã thanh toán" ? "ok" : st === "Quá hạn" ? "bad" : "warn"}">${st}</span><b class="num">${n} phòng</b></div>`; }).join("")}
      </div></div>
    </div>
  </div>`;

  if (window.Chart) {
    new Chart(document.getElementById("rev"), {
      type: "bar",
      data: { labels: months, datasets: [{ data: revenue, backgroundColor: "#2f5bea", hoverBackgroundColor: "#2449c9", borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: "bottom", maxBarThickness: 36 }] },
      options: {
        maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1a1d2e", padding: 10, displayColors: false, callbacks: { title: c => "Tháng " + c[0].label.slice(1), label: c => c.parsed.y + " triệu đồng" } } },
        scales: { x: { grid: { display: false }, ticks: { color: "#8a90a6" } }, y: { beginAtZero: true, grid: { color: "#eef0f6" }, border: { display: false }, ticks: { color: "#8a90a6", callback: v => v + " tr" } } },
        font: { family: "Be Vietnam Pro" }
      }
    });
  }
})(window.KTX);
