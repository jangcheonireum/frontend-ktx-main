// Khách ra/vào (EX04 – mở rộng) – giao diện
(async function (K) {
  const [ks, svs] = await Promise.all(["khach", "sinhVien"].map(r => K.api.list(r)));
  const rows = ks.map(k => ({ ...k, svTen: (svs.find(s => s.mssv === k.mssv) || {}).hoTen || k.mssv }));
  const L = K.listPage({
    title: "Khách ra/vào", desc: "Đăng ký khách đến thăm sinh viên, check-in và check-out tại phòng bảo vệ.",
    actions: `<button class="btn btn-primary" data-add><i class="bi bi-person-plus"></i>Đăng ký khách</button>`,
    stats: r => K.stat("c-blue", "bi-people", "Khách hôm nay", r.length) + K.stat("c-warn", "bi-door-open", "Đang trong KTX", r.filter(k => !k.gioRa).length, "chưa check-out") + K.stat("c-ok", "bi-box-arrow-right", "Đã ra", r.filter(k => k.gioRa).length),
    placeholder: "Tìm tên khách, CCCD, sinh viên…", search: ["hoTen", "cccd", "svTen", "mssv", "phongId"],
    filters: [{ id: "st", label: "Mọi trạng thái", options: ["Đang trong KTX", "Đã ra"], match: (r, v) => (v === "Đã ra") === !!r.gioRa }],
    cols: [
      { h: "Khách", sort: "hoTen", cell: k => `<div class="cell-2"><b>${K.esc(k.hoTen)}</b><small>CCCD ${k.cccd}</small></div>` },
      { h: "Thăm", cell: k => K.person(k.svTen, `${k.quanHe} · phòng ${k.phongId}`) },
      { h: "Giờ vào", sort: "gioVao", cell: k => K.dateTime(k.gioVao) },
      { h: "Giờ ra", sort: "gioRa", cell: k => k.gioRa ? K.dateTime(k.gioRa) : `<span class="pill warn">Đang trong KTX</span>` },
      { h: "", cls: "actions", cell: k => k.gioRa ? "" : `<button class="btn btn-sm btn-ghost" data-out="${k.id}"><i class="bi bi-box-arrow-right"></i>Check-out</button>` }
    ]
  });
  L.setData(rows);
  const M = K.modal("kM", "Đăng ký khách", `<div class="row g-3">
    <div class="col-md-7"><label class="form-label">Họ tên khách<span class="req">*</span></label><input class="form-control" name="hoTen"></div>
    <div class="col-md-5"><label class="form-label">CCCD<span class="req">*</span></label><input class="form-control" name="cccd" inputmode="numeric"></div>
    <div class="col-md-7"><label class="form-label">Sinh viên được thăm<span class="req">*</span></label><select class="form-select" name="mssv">${svs.filter(s => s.phongDangOid).map(s => `<option value="${s.mssv}">${s.mssv} – ${K.esc(s.hoTen)}</option>`).join("")}</select></div>
    <div class="col-md-5"><label class="form-label">Quan hệ</label><select class="form-select" name="quanHe"><option>Bố</option><option>Mẹ</option><option>Anh/chị/em</option><option>Bạn</option><option>Khác</option></select></div></div>`, "Check-in khách", "modal-lg");
  M.form.onsubmit = async e => { e.preventDefault(); if (!K.validate(M.form, { hoTen: v => v ? "" : "Nhập họ tên.", cccd: v => /^\d{12}$/.test(v) ? "" : "CCCD gồm 12 chữ số." })) return;
    const sv = svs.find(s => s.mssv === M.form.mssv.value); const o = await K.api.create("khach", { hoTen: M.form.hoTen.value.trim(), cccd: M.form.cccd.value, mssv: sv.mssv, phongId: sv.phongDangOid, quanHe: M.form.quanHe.value, gioVao: new Date().toISOString(), gioRa: null });
    L.data.unshift({ ...o, svTen: sv.hoTen }); L.render(); M.m.hide(); M.form.reset(); K.toast("Đã check-in khách " + o.hoTen); };
  L.page.addEventListener("click", async e => {
    if (e.target.closest("[data-add]")) M.m.show();
    const o = e.target.closest("[data-out]"); if (o) { const k = L.data.find(x => x.id === +o.dataset.out); k.gioRa = new Date().toISOString(); await K.api.update("khach", k.id, { gioRa: k.gioRa }); L.render(); K.toast("Đã check-out " + k.hoTen); }
  });
})(window.KTX);
