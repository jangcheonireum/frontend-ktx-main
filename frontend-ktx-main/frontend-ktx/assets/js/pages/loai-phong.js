// Quản lý Loại phòng (US02 – TS1-07): tiêu chuẩn phòng, sức chứa, đơn giá niêm yết, tiện ích
(function (K) {
  const page = document.getElementById("page");
  const SUGGEST = ["Điều hòa", "Quạt trần", "Nhà vệ sinh khép kín", "Nhà vệ sinh chung", "Bình nóng lạnh", "Wifi", "Tủ lạnh", "Ban công", "Máy giặt chung"];
  page.innerHTML = `
  <div class="page-head">
    <div><h1>Loại phòng</h1><p>Tiêu chuẩn phòng ở và đơn giá niêm yết. Giá ở đây là giá mỗi sinh viên mỗi tháng.</p></div>
    <div class="actions"><button class="btn btn-primary" id="btnAdd"><i class="bi bi-plus-lg"></i>Thêm loại phòng</button></div>
  </div>
  <div class="panel mb-4">
    <div class="toolbar">
      <div class="input-icon grow"><i class="bi bi-search"></i><input class="form-control" id="q" type="search" placeholder="Tìm theo tên loại, tiện ích…"></div>
      <select class="form-select" id="fCap"><option value="">Mọi sức chứa</option><option value="2">2 người</option><option value="4">4 người</option><option value="6">6 người</option><option value="8">8 người</option></select>
      <select class="form-select" id="fSort"><option value="cap">Sắp theo sức chứa</option><option value="priceAsc">Giá tăng dần</option><option value="priceDesc">Giá giảm dần</option></select>
    </div>
    <div class="panel-body"><div class="row g-3" id="cards"></div></div>
  </div>

  <div class="modal fade" id="m" tabindex="-1"><div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title" id="mTitle">Thêm loại phòng</h5><button class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button></div>
    <form id="f" novalidate><div class="modal-body"><div class="row g-3">
      <div class="col-md-8"><label class="form-label" for="tenLoai">Tên loại phòng<span class="req">*</span></label><input class="form-control" id="tenLoai" name="tenLoai" maxlength="50" placeholder="VD: Phòng 4 người điều hòa"></div>
      <div class="col-md-4"><label class="form-label" for="soNguoiToiDa">Số người tối đa<span class="req">*</span></label><input class="form-control" type="number" min="1" max="12" id="soNguoiToiDa" name="soNguoiToiDa"></div>
      <div class="col-md-6"><label class="form-label" for="giaChuan">Giá chuẩn (đ / người / tháng)<span class="req">*</span></label><input class="form-control num" id="giaChuan" name="giaChuan" inputmode="numeric" placeholder="VD: 450.000"><div class="form-text" id="giaHint"></div></div>
      <div class="col-md-6"><label class="form-label">Xem trước</label><div class="d-flex align-items-center gap-3 border rounded p-2 px-3" style="min-height:42px"><span class="bunks-prev" id="prev"></span><span class="small text-ink3" id="prevTxt"></span></div></div>
      <div class="col-12"><label class="form-label" for="tagIn">Tiện ích</label>
        <div class="tag-input" id="tags"><input id="tagIn" placeholder="Gõ rồi nhấn Enter…" list="tagList"></div>
        <datalist id="tagList">${SUGGEST.map(s => `<option>${s}</option>`).join("")}</datalist>
        <div class="mt-2" id="sugg"></div></div>
    </div></div>
    <div class="modal-footer"><button type="button" class="btn btn-ghost" data-bs-dismiss="modal">Hủy</button><button class="btn btn-primary" id="btnSave">Lưu loại phòng</button></div></form>
  </div></div></div>`;

  const $ = K.$; let all = [], phongs = [], editing = null, tags = [];
  const modal = new bootstrap.Modal("#m"), f = $("#f");

  const bunks = n => `<span class="bunks" aria-hidden="true">${Array.from({ length: Math.min(n, 12) }, () => "<i></i>").join("")}</span>`;
  function card(l) {
    const ps = phongs.filter(p => p.loaiPhongId === l.loaiPhongId);
    const empty = ps.filter(p => p.trangThai === "Còn trống").length;
    return `<div class="col-md-6 col-xl-4"><div class="panel rtype">
      <div class="d-flex align-items-start gap-2"><div class="flex-grow-1"><h3 class="fs-6 fw-bold mb-1">${K.esc(l.tenLoai)}</h3><div class="text-ink3 small">Tối đa ${l.soNguoiToiDa} người</div></div>
        <button class="btn-icon" data-edit="${l.loaiPhongId}" aria-label="Sửa ${K.esc(l.tenLoai)}" title="Sửa"><i class="bi bi-pencil"></i></button><button class="btn-icon danger" data-del="${l.loaiPhongId}" aria-label="Xóa ${K.esc(l.tenLoai)}" title="Xóa"><i class="bi bi-trash3"></i></button></div>
      ${bunks(l.soNguoiToiDa)}
      <div class="price">${K.money(l.giaChuan)} <small>/ người / tháng</small></div>
      <div>${(l.tienIch || []).map(t => `<span class="chip">${K.esc(t)}</span>`).join("") || '<span class="text-ink3 small">Chưa khai báo tiện ích</span>'}</div>
      <div class="mt-auto pt-2 border-top d-flex justify-content-between small"><span class="text-ink3">Đang áp dụng</span><a href="phong.html?loai=${l.loaiPhongId}" class="fw-semibold">${ps.length} phòng · ${empty} còn trống</a></div>
    </div></div>`;
  }
  async function load() { [all, phongs] = await Promise.all([K.api.list("loaiPhong"), K.api.list("phong")]); render(); }
  function render() {
    const q = K.norm($("#q").value), cap = $("#fCap").value, so = $("#fSort").value;
    let rows = all.filter(l => (!cap || l.soNguoiToiDa === +cap) && (!q || K.norm(l.tenLoai + " " + (l.tienIch || []).join(" ")).includes(q)));
    rows.sort((a, b) => so === "priceAsc" ? a.giaChuan - b.giaChuan : so === "priceDesc" ? b.giaChuan - a.giaChuan : b.soNguoiToiDa - a.soNguoiToiDa || a.giaChuan - b.giaChuan);
    $("#cards").innerHTML = rows.length ? rows.map(card).join("") : `<div class="col-12"><div class="empty"><i class="bi bi-layers"></i><b>Không có loại phòng phù hợp</b>Đổi bộ lọc hoặc thêm loại phòng mới.</div></div>`;
  }

  // ---- tag input ----
  function drawTags() {
    $("#tags").querySelectorAll(".t").forEach(x => x.remove());
    tags.forEach((t, i) => $("#tagIn").insertAdjacentHTML("beforebegin", `<span class="t">${K.esc(t)}<button type="button" data-rm="${i}" aria-label="Bỏ ${K.esc(t)}">×</button></span>`));
    $("#sugg").innerHTML = SUGGEST.filter(s => !tags.includes(s)).map(s => `<button type="button" class="chip border-0" data-add="${s}">+ ${s}</button>`).join("");
  }
  const addTag = v => { v = v.trim(); if (v && !tags.some(t => K.norm(t) === K.norm(v))) tags.push(v); $("#tagIn").value = ""; drawTags(); };
  $("#tagIn").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag($("#tagIn").value); } if (e.key === "Backspace" && !$("#tagIn").value && tags.length) { tags.pop(); drawTags(); } });
  $("#tagIn").addEventListener("change", e => addTag(e.target.value));
  $("#tags").onclick = e => { const r = e.target.closest("[data-rm]"); if (r) { tags.splice(+r.dataset.rm, 1); drawTags(); } else $("#tagIn").focus(); };
  $("#sugg").onclick = e => { const a = e.target.closest("[data-add]"); if (a) addTag(a.dataset.add); };

  // ---- giá + xem trước ----
  const parseMoney = v => +String(v).replace(/\D/g, "");
  f.giaChuan.addEventListener("input", () => { const n = parseMoney(f.giaChuan.value); f.giaChuan.value = n ? n.toLocaleString("vi-VN") : ""; preview(); });
  f.soNguoiToiDa.addEventListener("input", preview);
  function preview() {
    const n = +f.soNguoiToiDa.value || 0, g = parseMoney(f.giaChuan.value);
    $("#prev").innerHTML = n ? bunks(n) : "";
    $("#prevTxt").textContent = n && g ? `Cả phòng: ${K.money(n * g)}/tháng khi ở đủ` : "Nhập sức chứa và giá";
    $("#giaHint").textContent = g ? `= ${K.money(g)}` : "";
  }

  function open(l) {
    editing = l ? l.loaiPhongId : null; f.reset(); f.querySelectorAll(".is-invalid").forEach(x => x.classList.remove("is-invalid"));
    $("#mTitle").textContent = l ? "Sửa loại phòng" : "Thêm loại phòng"; $("#btnSave").textContent = l ? "Lưu thay đổi" : "Lưu loại phòng";
    tags = l ? [...(l.tienIch || [])] : [];
    if (l) { f.tenLoai.value = l.tenLoai; f.soNguoiToiDa.value = l.soNguoiToiDa; f.giaChuan.value = l.giaChuan.toLocaleString("vi-VN"); }
    drawTags(); preview(); modal.show(); setTimeout(() => f.tenLoai.focus(), 300);
  }

  f.addEventListener("submit", async e => {
    e.preventDefault();
    const inUse = editing ? phongs.filter(p => p.loaiPhongId === editing) : [];
    const maxOcc = Math.max(0, ...inUse.map(p => p.soNguoiHienTai || 0));
    const ok = K.validate(f, {
      tenLoai: v => !v ? "Nhập tên loại phòng." : (all.some(l => l.loaiPhongId !== editing && K.norm(l.tenLoai) === K.norm(v)) ? "Tên loại phòng này đã có." : ""),
      soNguoiToiDa: v => !v ? "Nhập số người tối đa." : (+v < 1 || +v > 12 ? "Từ 1 đến 12 người." : (+v < maxOcc ? `Có phòng đang ở ${maxOcc} người, không thể giảm xuống ${v}.` : "")),
      giaChuan: v => !parseMoney(v) ? "Nhập giá chuẩn." : (parseMoney(v) < 50000 ? "Giá tối thiểu 50.000 đ." : "")
    });
    if (!ok) return;
    const obj = { tenLoai: f.tenLoai.value.trim(), soNguoiToiDa: +f.soNguoiToiDa.value, giaChuan: parseMoney(f.giaChuan.value), tienIch: tags };
    try {
      if (editing) await K.api.update("loaiPhong", editing, obj); else await K.api.create("loaiPhong", obj);
      modal.hide(); K.toast(editing ? "Đã lưu thay đổi loại phòng" : `Đã thêm ${obj.tenLoai}`); load();
    } catch (err) { K.toast(err.message, "bad"); }
  });

  page.addEventListener("click", async e => {
    const ed = e.target.closest("[data-edit]"), del = e.target.closest("[data-del]");
    if (ed) open(all.find(l => l.loaiPhongId === +ed.dataset.edit));
    if (del) {
      const l = all.find(x => x.loaiPhongId === +del.dataset.del), n = phongs.filter(p => p.loaiPhongId === l.loaiPhongId).length;
      if (n) { K.confirm({ title: "Chưa thể xóa loại phòng", body: `<b>${n} phòng</b> đang dùng “${K.esc(l.tenLoai)}”. Đổi loại cho các phòng đó trước.`, okText: "Xem các phòng" }).then(ok => ok && (location.href = "phong.html?loai=" + l.loaiPhongId)); return; }
      if (await K.confirm({ title: "Xóa loại phòng?", body: `“${K.esc(l.tenLoai)}” sẽ bị xóa khỏi danh mục.`, okText: "Xóa loại phòng", danger: true })) { await K.api.remove("loaiPhong", l.loaiPhongId); K.toast("Đã xóa loại phòng"); load(); }
    }
  });
  $("#btnAdd").onclick = () => open(null);
  $("#q").oninput = render; $("#fCap").onchange = render; $("#fSort").onchange = render;
  load();
})(window.KTX);
