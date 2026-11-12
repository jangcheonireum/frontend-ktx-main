// Hợp đồng thuê phòng (US05 – Sprint 3) – giao diện
(async function (K) {
  const [hds, svs, toas] = await Promise.all(["hopDong", "sinhVien", "toaNha"].map(r => K.api.list(r)));
  const name = m => (svs.find(s => s.mssv === m) || {}).hoTen || m;
  const rows = hds.map(h => ({ ...h, hoTen: name(h.mssv) }));
  const pill = s => s === "Hiệu lực" ? `<span class="pill ok">${s}</span>` : s === "Sắp hết hạn" ? `<span class="pill warn">${s}</span>` : `<span class="pill bad">${s}</span>`;
  const L = K.listPage({
    title: "Hợp đồng thuê phòng", desc: "Theo dõi thời hạn, tiền cọc và gia hạn hợp đồng của sinh viên.",
    actions: `<button class="btn btn-ghost" data-csv><i class="bi bi-download"></i>Xuất CSV</button><button class="btn btn-primary" data-add><i class="bi bi-file-earmark-plus"></i>Lập hợp đồng</button>`,
    stats: r => K.stat("c-blue", "bi-file-earmark-text", "Tổng hợp đồng", r.length) + K.stat("c-ok", "bi-check2-circle", "Đang hiệu lực", r.filter(h => h.trangThai === "Hiệu lực").length) + K.stat("c-warn", "bi-clock", "Sắp hết hạn", r.filter(h => h.trangThai === "Sắp hết hạn").length, "trong 30 ngày tới") + K.stat("c-bad", "bi-x-octagon", "Đã hết hạn", r.filter(h => h.trangThai === "Hết hạn").length),
    tabs: { items: [{ v: "", t: "Tất cả" }, { v: "Hiệu lực", t: "Hiệu lực" }, { v: "Sắp hết hạn", t: "Sắp hết hạn" }, { v: "Hết hạn", t: "Hết hạn" }], match: (r, v) => r.trangThai === v },
    placeholder: "Tìm mã HĐ, tên, MSSV, phòng…", search: ["hopDongId", "hoTen", "mssv", "phongId"],
    filters: [{ id: "toa", label: "Mọi tòa", options: toas.map(t => ({ v: t.toaNhaId, t: t.tenToa })), match: (r, v) => r.phongId.startsWith(v + "-") }],
    cols: [
      { h: "Mã HĐ", sort: "hopDongId", cell: h => `<span class="id-chip">${h.hopDongId}</span>` },
      { h: "Sinh viên", sort: "hoTen", cell: h => K.person(h.hoTen, h.mssv) },
      { h: "Phòng", sort: "phongId", cell: h => `<span class="id-chip">${h.phongId}</span>` },
      { h: "Thời hạn", sort: "ngayKetThuc", cell: h => `<div class="cell-2"><b class="fw-normal">${K.date(h.ngayBatDau)} – ${K.date(h.ngayKetThuc)}</b></div>` },
      { h: "Giá thuê", cls: "text-end num", sort: "giaThue", cell: h => K.money(h.giaThue) + '<div class="muted">cọc ' + K.money(h.tienCoc) + "</div>" },
      { h: "Trạng thái", sort: "trangThai", cell: h => pill(h.trangThai) },
      { h: "", cls: "actions", cell: h => `<button class="btn-icon" title="Gia hạn" data-renew="${h.hopDongId}" aria-label="Gia hạn"><i class="bi bi-arrow-repeat"></i></button><button class="btn-icon" title="In hợp đồng" aria-label="In" onclick="window.print()"><i class="bi bi-printer"></i></button><button class="btn-icon danger" title="Thanh lý" data-end="${h.hopDongId}" aria-label="Thanh lý"><i class="bi bi-x-lg"></i></button>` }
    ]
  });
  L.setData(rows);
  const M = K.modal("hdM", "Lập hợp đồng thuê phòng", `<div class="row g-3">
    <div class="col-md-6"><label class="form-label">Sinh viên<span class="req">*</span></label><select class="form-select" name="mssv">${svs.filter(s => s.phongDangOid).map(s => `<option value="${s.mssv}">${s.mssv} – ${K.esc(s.hoTen)}</option>`).join("")}</select></div>
    <div class="col-md-6"><label class="form-label">Phòng</label><input class="form-control" name="phongId" readonly></div>
    <div class="col-md-6"><label class="form-label">Ngày bắt đầu<span class="req">*</span></label><input class="form-control" type="date" name="bd" value="2026-11-01"></div>
    <div class="col-md-6"><label class="form-label">Thời hạn</label><select class="form-select" name="th"><option value="5">1 học kỳ (5 tháng)</option><option value="10" selected>1 năm học (10 tháng)</option></select></div>
    <div class="col-md-6"><label class="form-label">Tiền cọc</label><input class="form-control" name="coc" value="500.000"></div>
    <div class="col-md-6"><label class="form-label">Ghi chú</label><input class="form-control" name="gc"></div></div>`, "Lập hợp đồng", "modal-lg");
  const syncRoom = () => M.form.phongId.value = (svs.find(s => s.mssv === M.form.mssv.value) || {}).phongDangOid || "";
  M.form.mssv.onchange = syncRoom;
  M.form.onsubmit = e => { e.preventDefault(); M.m.hide(); K.toast("Đã lập hợp đồng (giao diện mẫu – lưu thật ở Sprint 3)"); };
  L.page.addEventListener("click", async e => {
    if (e.target.closest("[data-add]")) { syncRoom(); M.m.show(); }
    const r = e.target.closest("[data-renew]"); if (r) K.toast(`Đã gửi yêu cầu gia hạn ${r.dataset.renew}`);
    const en = e.target.closest("[data-end]"); if (en && await K.confirm({ title: "Thanh lý hợp đồng?", body: `Hợp đồng <b>${en.dataset.end}</b> sẽ kết thúc và phòng được trả lại chỗ trống.`, okText: "Thanh lý", danger: true })) K.toast("Đã thanh lý hợp đồng");
    if (e.target.closest("[data-csv]")) L.csv("hop-dong.csv", ["Mã HĐ", "MSSV", "Họ tên", "Phòng", "Bắt đầu", "Kết thúc", "Giá thuê", "Cọc", "Trạng thái"], h => [h.hopDongId, h.mssv, h.hoTen, h.phongId, h.ngayBatDau, h.ngayKetThuc, h.giaThue, h.tienCoc, h.trangThai]);
  });
})(window.KTX);
