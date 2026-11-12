// Cảnh báo an ninh (US13, US22, US23 – Sprint 4–5) – giao diện
(async function (K) {
  const cbs = await K.api.list("canhBao");
  const lv = m => m === "Cao" ? `<span class="pill bad">Mức cao</span>` : m === "Trung bình" ? `<span class="pill warn">Trung bình</span>` : `<span class="pill mute">Thấp</span>`;
  const ICON = { "Người lạ": "bi-person-exclamation", "Lảng vảng": "bi-hourglass-split", "Ra/vào ngoài giờ": "bi-moon-stars" };
  const L = K.listPage({
    title: "Cảnh báo an ninh", desc: "Sự kiện do camera AI phát hiện: người lạ, lảng vảng ở cửa, ra/vào ngoài giờ.",
    stats: r => K.stat("c-bad", "bi-shield-exclamation", "Chưa xử lý", r.filter(c => c.trangThai === "Chưa xử lý").length) + K.stat("c-warn", "bi-person-exclamation", "Người lạ", r.filter(c => c.loai === "Người lạ").length, "7 ngày qua") + K.stat("c-ok", "bi-check2-circle", "Đã xử lý", r.filter(c => c.trangThai === "Đã xử lý").length),
    tabs: { items: [{ v: "", t: "Tất cả" }, { v: "Chưa xử lý", t: "Chưa xử lý" }, { v: "Đã xử lý", t: "Đã xử lý" }], match: (r, v) => r.trangThai === v },
    placeholder: "Tìm mô tả, camera…", search: ["moTa", "camera", "loai"],
    filters: [{ id: "loai", label: "Mọi loại", options: Object.keys(ICON), key: "loai" }, { id: "md", label: "Mọi mức độ", options: ["Cao", "Trung bình", "Thấp"], key: "mucDo" }],
    cols: [
      { h: "Sự kiện", cell: c => `<div class="d-flex gap-2"><div class="ic ${c.mucDo === "Cao" ? "bad" : "warn"}" style="width:32px;height:32px;border-radius:8px;display:grid;place-items:center;flex-shrink:0"><i class="bi ${ICON[c.loai]}"></i></div><div class="cell-2"><b>${c.loai}</b><small>${K.esc(c.moTa)}</small></div></div>` },
      { h: "Camera", sort: "camera", cell: c => c.camera },
      { h: "Thời điểm", sort: "thoiGian", cell: c => K.dateTime(c.thoiGian) },
      { h: "Mức độ", sort: "mucDo", cell: c => lv(c.mucDo) },
      { h: "Trạng thái", sort: "trangThai", cell: c => c.trangThai === "Chưa xử lý" ? `<span class="pill bad">Chưa xử lý</span>` : `<span class="pill ok">Đã xử lý</span>` },
      { h: "", cls: "actions", cell: c => c.trangThai === "Chưa xử lý" ? `<button class="btn btn-sm btn-primary" data-done="${c.id}">Đánh dấu đã xử lý</button>` : "" }
    ]
  });
  L.setData(cbs);
  L.page.addEventListener("click", async e => {
    const b = e.target.closest("[data-done]"); if (!b) return;
    const c = L.data.find(x => x.id === +b.dataset.done); c.trangThai = "Đã xử lý"; await K.api.update("canhBao", c.id, { trangThai: c.trangThai }); L.render(); K.toast("Đã xử lý cảnh báo #" + c.id);
  });
})(window.KTX);
