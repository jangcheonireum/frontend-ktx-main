// Cơ sở vật chất theo phòng (EX03 – mở rộng) – giao diện
(async function (K) {
  const [vts, toas] = await Promise.all(["vatTu", "toaNha"].map(r => K.api.list(r)));
  const pill = s => s === "Tốt" ? `<span class="pill ok">Tốt</span>` : s === "Hỏng" ? `<span class="pill bad">Hỏng</span>` : `<span class="pill warn">${s}</span>`;
  const names = [...new Set(vts.map(v => v.tenVatTu))];
  const L = K.listPage({
    title: "Cơ sở vật chất", desc: "Tài sản trang bị trong từng phòng và tình trạng sử dụng.",
    actions: `<button class="btn btn-primary" data-add><i class="bi bi-plus-lg"></i>Thêm vật tư</button>`,
    stats: r => K.stat("c-blue", "bi-box-seam", "Tổng vật tư", r.reduce((s, v) => s + v.soLuong, 0), names.length + " loại") + K.stat("c-ok", "bi-check2", "Hoạt động tốt", r.filter(v => v.tinhTrang === "Tốt").length, "mục") + K.stat("c-warn", "bi-wrench", "Cần bảo trì", r.filter(v => v.tinhTrang === "Cần bảo trì").length, "mục") + K.stat("c-bad", "bi-x-octagon", "Hỏng", r.filter(v => v.tinhTrang === "Hỏng").length, `ở ${new Set(r.filter(v => v.tinhTrang === "Hỏng").map(v => v.phongId)).size} phòng`),
    placeholder: "Tìm vật tư, phòng…", search: ["tenVatTu", "phongId"],
    filters: [{ id: "toa", label: "Mọi tòa", options: toas.map(t => ({ v: t.toaNhaId, t: t.tenToa })), match: (r, v) => r.phongId.startsWith(v + "-") }, { id: "ten", label: "Mọi loại vật tư", options: names, key: "tenVatTu" }, { id: "tt", label: "Mọi tình trạng", options: ["Tốt", "Cần bảo trì", "Hỏng"], key: "tinhTrang" }],
    cols: [
      { h: "Vật tư", sort: "tenVatTu", cell: v => `<b>${K.esc(v.tenVatTu)}</b>` },
      { h: "Phòng", sort: "phongId", cell: v => `<span class="id-chip">${v.phongId}</span>` },
      { h: "Số lượng", cls: "text-end num", sort: "soLuong", cell: v => v.soLuong },
      { h: "Tình trạng", sort: "tinhTrang", cell: v => pill(v.tinhTrang) },
      { h: "", cls: "actions", cell: v => v.tinhTrang !== "Tốt" ? `<button class="btn btn-sm btn-ghost" data-fix="${v.id}"><i class="bi bi-check2"></i>Đã sửa xong</button>` : "" }
    ]
  });
  L.setData(vts);
  L.page.addEventListener("click", async e => {
    const f = e.target.closest("[data-fix]"); if (f) { await K.api.update("vatTu", +f.dataset.fix, { tinhTrang: "Tốt" }); L.data.find(v => v.id === +f.dataset.fix).tinhTrang = "Tốt"; L.render(); K.toast("Đã cập nhật tình trạng: Tốt"); }
    if (e.target.closest("[data-add]")) K.toast("Thêm vật tư là hạng mục mở rộng (EX03).", "warn");
  });
})(window.KTX);
