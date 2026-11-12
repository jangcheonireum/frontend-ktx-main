// Xử lý phản ánh sự cố (US08 – Sprint 6) – giao diện
(async function (K) {
  const [pas, svs, toas] = await Promise.all(["phanAnh", "sinhVien", "toaNha"].map(r => K.api.list(r)));
  const rows = pas.map(p => ({ ...p, hoTen: (svs.find(s => s.mssv === p.mssv) || {}).hoTen || p.mssv }));
  const ICON = { "Điện": "bi-lightning", "Nước": "bi-droplet", "Wifi": "bi-wifi", "Thiết bị": "bi-fan", "Vệ sinh": "bi-trash" };
  const pill = s => s === "Chờ tiếp nhận" ? `<span class="pill warn">${s}</span>` : s === "Đang xử lý" ? `<span class="pill blue">${s}</span>` : `<span class="pill ok">${s}</span>`;
  const NEXT = { "Chờ tiếp nhận": "Đang xử lý", "Đang xử lý": "Đã hoàn thành" };
  const L = K.listPage({
    title: "Phản ánh sự cố", desc: "Tiếp nhận, phân công và theo dõi xử lý các sự cố sinh viên báo lên.",
    tabs: { items: [{ v: "", t: "Tất cả" }, { v: "Chờ tiếp nhận", t: "Chờ tiếp nhận" }, { v: "Đang xử lý", t: "Đang xử lý" }, { v: "Đã hoàn thành", t: "Đã hoàn thành" }], match: (r, v) => r.trangThai === v },
    placeholder: "Tìm MSSV, tên, phòng, nội dung…", search: ["mssv", "hoTen", "phongId", "noiDung"],
    filters: [{ id: "toa", label: "Mọi tòa", options: toas.map(t => ({ v: t.toaNhaId, t: t.tenToa })), match: (r, v) => (r.phongId || "").startsWith(v + "-") }, { id: "loai", label: "Mọi loại sự cố", options: Object.keys(ICON), key: "loai" }],
    cols: [
      { h: "Sự cố", cell: p => `<div class="d-flex gap-2 align-items-start"><div class="ic ${p.trangThai === "Chờ tiếp nhận" ? "warn" : "blue"}" style="width:32px;height:32px;border-radius:8px;display:grid;place-items:center;flex-shrink:0"><i class="bi ${ICON[p.loai]}"></i></div><div class="cell-2"><b>${K.esc(p.noiDung)}</b><small>${p.loai} · #${p.id}</small></div></div>` },
      { h: "Phòng", sort: "phongId", cell: p => `<span class="id-chip">${p.phongId || "—"}</span>` },
      { h: "Người báo", sort: "hoTen", cell: p => K.person(p.hoTen, p.mssv) },
      { h: "Gửi lúc", sort: "ngayGui", cell: p => `<span title="${K.dateTime(p.ngayGui)}">${K.ago(p.ngayGui)}</span>` },
      { h: "Trạng thái", sort: "trangThai", cell: p => pill(p.trangThai) },
      { h: "", cls: "actions", cell: p => NEXT[p.trangThai] ? `<button class="btn btn-sm ${p.trangThai === "Chờ tiếp nhận" ? "btn-primary" : "btn-ghost"}" data-next="${p.id}">${p.trangThai === "Chờ tiếp nhận" ? "Tiếp nhận" : "Báo hoàn thành"}</button>` : `<i class="bi bi-check2-circle text-success"></i>` }
    ]
  });
  L.setData(rows);
  L.page.addEventListener("click", async e => {
    const b = e.target.closest("[data-next]"); if (!b) return;
    const p = L.data.find(x => x.id === +b.dataset.next); p.trangThai = NEXT[p.trangThai];
    await K.api.update("phanAnh", p.id, { trangThai: p.trangThai }); L.render(); K.toast(`Phản ánh #${p.id}: ${p.trangThai}`);
  });
})(window.KTX);
