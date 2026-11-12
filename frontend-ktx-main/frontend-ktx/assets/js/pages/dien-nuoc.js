// Chỉ số điện nước (US06 – Sprint 4) – giao diện
(async function (K) {
  const GIA_DIEN = 3500, GIA_NUOC = 15000;
  const [dns, toas] = await Promise.all(["dienNuoc", "toaNha"].map(r => K.api.list(r)));
  const rows = dns.map(d => ({ ...d, kwh: d.dienMoi - d.dienCu, m3: d.nuocMoi - d.nuocCu }));
  const pill = s => s === "Đã tính hóa đơn" ? `<span class="pill ok">${s}</span>` : s === "Chờ xác nhận" ? `<span class="pill info">${s}</span>` : `<span class="pill warn">${s}</span>`;
  const L = K.listPage({
    title: "Chỉ số điện nước", desc: `Ghi chỉ số kỳ 10/2026. Đơn giá: điện ${K.money(GIA_DIEN)}/kWh · nước ${K.money(GIA_NUOC)}/m³.`,
    actions: `<button class="btn btn-ghost" data-price><i class="bi bi-sliders"></i>Đơn giá</button><button class="btn btn-primary" data-close><i class="bi bi-send-check"></i>Chốt & lập hóa đơn</button>`,
    stats: r => K.stat("c-blue", "bi-lightning-charge", "Tổng điện tiêu thụ", r.reduce((s, d) => s + d.kwh, 0).toLocaleString("vi-VN") + "<small> kWh</small>") + K.stat("c-violet", "bi-droplet", "Tổng nước", r.reduce((s, d) => s + d.m3, 0) + "<small> m³</small>") + K.stat("c-warn", "bi-pencil-square", "Chưa lập hóa đơn", r.filter(d => d.trangThai !== "Đã tính hóa đơn").length, "phòng") + K.stat("c-ok", "bi-check2-all", "Đã tính hóa đơn", r.filter(d => d.trangThai === "Đã tính hóa đơn").length, "phòng"),
    placeholder: "Tìm phòng…", search: ["phongId"],
    filters: [{ id: "toa", label: "Mọi tòa", options: toas.map(t => ({ v: t.toaNhaId, t: t.tenToa })), match: (r, v) => r.phongId.startsWith(v + "-") }, { id: "tt", label: "Mọi trạng thái", options: ["Chưa lập", "Chờ xác nhận", "Đã tính hóa đơn"], key: "trangThai" }],
    cols: [
      { h: "Phòng", sort: "phongId", cell: d => `<span class="id-chip">${d.phongId}</span>` },
      { h: "Điện (cũ → mới)", cls: "num", cell: d => `${d.dienCu} → <b>${d.dienMoi}</b>` },
      { h: "kWh", cls: "text-end num", sort: "kwh", cell: d => d.kwh },
      { h: "Nước (cũ → mới)", cls: "num", cell: d => `${d.nuocCu} → <b>${d.nuocMoi}</b>` },
      { h: "m³", cls: "text-end num", sort: "m3", cell: d => d.m3 },
      { h: "Thành tiền", cls: "text-end num", cell: d => `<b>${K.money(d.kwh * GIA_DIEN + d.m3 * GIA_NUOC)}</b>` },
      { h: "Ngày ghi", sort: "ngayGhi", cell: d => K.date(d.ngayGhi) },
      { h: "Trạng thái", sort: "trangThai", cell: d => pill(d.trangThai) },
      { h: "", cls: "actions", cell: d => `<button class="btn-icon" title="Nhập chỉ số" aria-label="Nhập chỉ số" data-edit="${d.id}"><i class="bi bi-pencil"></i></button>` }
    ]
  });
  L.setData(rows);
  const M = K.modal("dnM", "Nhập chỉ số", `<div class="row g-3">
    <div class="col-6"><label class="form-label">Điện cũ</label><input class="form-control num" name="dienCu" readonly></div><div class="col-6"><label class="form-label">Điện mới<span class="req">*</span></label><input class="form-control num" name="dienMoi" type="number"></div>
    <div class="col-6"><label class="form-label">Nước cũ</label><input class="form-control num" name="nuocCu" readonly></div><div class="col-6"><label class="form-label">Nước mới<span class="req">*</span></label><input class="form-control num" name="nuocMoi" type="number"></div>
    <div class="col-12"><div class="alert-k info mb-0"><i class="bi bi-calculator"></i><div data-calc></div></div></div></div>`, "Lưu chỉ số");
  let cur;
  const calc = () => { const k = M.form.dienMoi.value - cur.dienCu, m = M.form.nuocMoi.value - cur.nuocCu; M.el.querySelector("[data-calc]").textContent = k >= 0 && m >= 0 ? `${k} kWh · ${m} m³ → ${K.money(k * GIA_DIEN + m * GIA_NUOC)}` : "Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ."; };
  M.form.oninput = calc;
  M.form.onsubmit = async e => { e.preventDefault(); if (!K.validate(M.form, { dienMoi: v => +v >= cur.dienCu ? "" : "Phải ≥ chỉ số cũ.", nuocMoi: v => +v >= cur.nuocCu ? "" : "Phải ≥ chỉ số cũ." })) return;
    Object.assign(cur, { dienMoi: +M.form.dienMoi.value, nuocMoi: +M.form.nuocMoi.value, ngayGhi: new Date().toISOString(), trangThai: "Chờ xác nhận" }); cur.kwh = cur.dienMoi - cur.dienCu; cur.m3 = cur.nuocMoi - cur.nuocCu;
    await K.api.update("dienNuoc", cur.id, { dienMoi: cur.dienMoi, nuocMoi: cur.nuocMoi, trangThai: cur.trangThai, ngayGhi: cur.ngayGhi }); M.m.hide(); L.render(); K.toast("Đã lưu chỉ số phòng " + cur.phongId); };
  L.page.addEventListener("click", e => {
    const ed = e.target.closest("[data-edit]"); if (ed) { cur = L.data.find(d => d.id === +ed.dataset.edit); M.title.textContent = "Nhập chỉ số phòng " + cur.phongId; ["dienCu", "dienMoi", "nuocCu", "nuocMoi"].forEach(k => M.form[k].value = cur[k]); calc(); M.m.show(); }
    if (e.target.closest("[data-close]")) K.confirm({ title: "Chốt chỉ số kỳ 10/2026?", body: "Các phòng “Chờ xác nhận” sẽ được lập hóa đơn và gửi cho sinh viên. Chạy thật ở Sprint 4.", okText: "Đã hiểu" });
    if (e.target.closest("[data-price]")) K.toast("Cấu hình đơn giá điện nước thuộc Sprint 4", "warn");
  });
})(window.KTX);
