// Hóa đơn hằng tháng (US07 – Sprint 4) – giao diện
(async function (K) {
  const [hds, toas] = await Promise.all(["hoaDon", "toaNha"].map(r => K.api.list(r)));
  const rows = hds.map(h => ({ ...h, tong: h.tienPhong + h.tienDien + h.tienNuoc + h.dichVu }));
  const pill = s => s === "Đã thanh toán" ? `<span class="pill ok">${s}</span>` : s === "Quá hạn" ? `<span class="pill bad">${s}</span>` : `<span class="pill warn">${s}</span>`;
  const sum = (r, st) => r.filter(h => !st || h.trangThai === st).reduce((s, h) => s + h.tong, 0);
  const L = K.listPage({
    title: "Hóa đơn", desc: "Hóa đơn tiền phòng, điện nước và dịch vụ theo từng phòng, kỳ tháng 10/2026.",
    actions: `<button class="btn btn-ghost" data-csv><i class="bi bi-download"></i>Xuất CSV</button><button class="btn btn-primary" data-bulk><i class="bi bi-receipt"></i>Tạo hóa đơn hàng loạt</button>`,
    stats: r => K.stat("c-blue", "bi-cash-stack", "Tổng phải thu", K.moneyShort(sum(r)), r.length + " hóa đơn") + K.stat("c-ok", "bi-check2-circle", "Đã thu", K.moneyShort(sum(r, "Đã thanh toán")), r.filter(h => h.trangThai === "Đã thanh toán").length + " hóa đơn") + K.stat("c-warn", "bi-hourglass", "Chưa thanh toán", K.moneyShort(sum(r, "Chưa thanh toán"))) + K.stat("c-bad", "bi-exclamation-octagon", "Quá hạn", K.moneyShort(sum(r, "Quá hạn")), "cần nhắc nợ"),
    tabs: { items: [{ v: "", t: "Tất cả" }, { v: "Chưa thanh toán", t: "Chưa thanh toán" }, { v: "Quá hạn", t: "Quá hạn" }, { v: "Đã thanh toán", t: "Đã thanh toán" }], match: (r, v) => r.trangThai === v },
    placeholder: "Tìm mã hóa đơn, phòng…", search: ["hoaDonId", "phongId"],
    filters: [{ id: "toa", label: "Mọi tòa", options: toas.map(t => ({ v: t.toaNhaId, t: t.tenToa })), match: (r, v) => r.phongId.startsWith(v + "-") }],
    cols: [
      { h: "Mã hóa đơn", sort: "hoaDonId", cell: h => `<span class="id-chip">${h.hoaDonId}</span><div class="muted">Kỳ ${h.thang}</div>` },
      { h: "Phòng", sort: "phongId", cell: h => `<span class="id-chip">${h.phongId}</span>` },
      { h: "Tiền phòng", cls: "text-end num", sort: "tienPhong", cell: h => K.money(h.tienPhong) },
      { h: "Điện / Nước", cls: "text-end num", cell: h => `${K.money(h.tienDien)}<div class="muted">${K.money(h.tienNuoc)}</div>` },
      { h: "Tổng cộng", cls: "text-end num", sort: "tong", cell: h => `<b>${K.money(h.tong)}</b>` },
      { h: "Hạn", sort: "hanThanhToan", cell: h => K.date(h.hanThanhToan) },
      { h: "Trạng thái", sort: "trangThai", cell: h => pill(h.trangThai) },
      { h: "", cls: "actions", cell: h => (h.trangThai !== "Đã thanh toán" ? `<button class="btn btn-sm btn-ghost" data-pay="${h.hoaDonId}">Ghi nhận thu</button>` : "") + `<button class="btn-icon" title="Xem" aria-label="Xem" data-see="${h.hoaDonId}"><i class="bi bi-eye"></i></button>` }
    ]
  });
  L.setData(rows);
  const D = K.modal("hdD", "Chi tiết hóa đơn", "<div data-b></div>", "");
  L.page.addEventListener("click", async e => {
    const p = e.target.closest("[data-pay]");
    if (p && await K.confirm({ title: "Ghi nhận đã thu tiền?", body: `Hóa đơn <b>${p.dataset.pay}</b> sẽ chuyển sang “Đã thanh toán”.`, okText: "Ghi nhận đã thu" })) { await K.api.update("hoaDon", p.dataset.pay, { trangThai: "Đã thanh toán" }); const h = L.data.find(x => x.hoaDonId === p.dataset.pay); h.trangThai = "Đã thanh toán"; L.render(); K.toast("Đã ghi nhận thu tiền"); }
    const s = e.target.closest("[data-see]");
    if (s) { const h = L.data.find(x => x.hoaDonId === s.dataset.see); D.title.textContent = `Hóa đơn ${h.hoaDonId} · phòng ${h.phongId}`;
      D.el.querySelector("[data-b]").innerHTML = `<table class="table mb-0 num">${[["Tiền phòng", h.tienPhong], ["Tiền điện", h.tienDien], ["Tiền nước", h.tienNuoc], ["Dịch vụ (vệ sinh, internet)", h.dichVu]].map(([k, v]) => `<tr><td>${k}</td><td class="text-end">${K.money(v)}</td></tr>`).join("")}<tr><th>Tổng cộng</th><th class="text-end">${K.money(h.tong)}</th></tr></table><div class="mt-3">${pill(h.trangThai)} <span class="small text-ink3 ms-2">Hạn ${K.date(h.hanThanhToan)}</span></div>`; D.m.show(); }
    if (e.target.closest("[data-bulk]")) K.confirm({ title: "Tạo hóa đơn hàng loạt", body: "Hệ thống sẽ lập hóa đơn kỳ 11/2026 cho các phòng đã chốt chỉ số điện nước. Chức năng chạy thật ở Sprint 4.", okText: "Đã hiểu" });
    if (e.target.closest("[data-csv]")) L.csv("hoa-don.csv", ["Mã", "Phòng", "Kỳ", "Tiền phòng", "Điện", "Nước", "Dịch vụ", "Tổng", "Hạn", "Trạng thái"], h => [h.hoaDonId, h.phongId, h.thang, h.tienPhong, h.tienDien, h.tienNuoc, h.dichVu, h.tong, h.hanThanhToan, h.trangThai]);
  });
})(window.KTX);
