// Quản lý Tòa nhà (US02 – TS1-07): xem danh sách, tìm kiếm, lọc khu, thêm / sửa / xóa
(function (K) {
  const page = document.getElementById("page");
  page.innerHTML = `
  <div class="page-head">
    <div><h1>Tòa nhà</h1><p>Danh mục các tòa trong khu ký túc xá và tình trạng lấp đầy từng tòa.</p></div>
    <div class="actions"><button class="btn btn-primary" id="btnAdd"><i class="bi bi-plus-lg"></i>Thêm tòa nhà</button></div>
  </div>
  <div class="stat-strip" id="stats"></div>
  <div class="panel">
    <div class="toolbar">
      <div class="input-icon grow"><i class="bi bi-search"></i><input class="form-control" id="q" type="search" placeholder="Tìm mã, tên tòa, trưởng nhà…"></div>
      <select class="form-select" id="fKhu"><option value="">Tất cả khu</option><option>Nam</option><option>Nữ</option></select>
      <div class="seg ms-auto" role="group" aria-label="Kiểu hiển thị"><button class="on" data-view="card"><i class="bi bi-grid"></i>Thẻ</button><button data-view="table"><i class="bi bi-list-ul"></i>Bảng</button></div>
    </div>
    <div id="cardView" class="panel-body"><div class="row g-3" id="cards"></div></div>
    <div id="tableView" hidden>
      <div class="table-wrap"><table class="table table-k"><thead><tr>
        <th data-sort="toaNhaId">Mã tòa</th><th data-sort="tenToa">Tên tòa</th><th data-sort="loaiKhu">Khu</th><th data-sort="soTang" class="text-end">Số tầng</th>
        <th data-sort="soPhong" class="text-end">Số phòng</th><th data-sort="tyLe">Lấp đầy</th><th data-sort="truongNha">Trưởng nhà</th><th></th></tr></thead><tbody id="tbody"></tbody></table></div>
      <div class="table-foot" id="foot"></div>
    </div>
  </div>

  <div class="modal fade" id="m" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title" id="mTitle">Thêm tòa nhà</h5><button class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button></div>
    <form id="f" novalidate><div class="modal-body"><div class="row g-3">
      <div class="col-sm-5"><label class="form-label" for="toaNhaId">Mã tòa<span class="req">*</span></label><input class="form-control text-uppercase" id="toaNhaId" name="toaNhaId" maxlength="10" placeholder="VD: A3"><div class="form-text">Chữ in hoa và số, tối đa 10 ký tự.</div></div>
      <div class="col-sm-7"><label class="form-label" for="tenToa">Tên tòa<span class="req">*</span></label><input class="form-control" id="tenToa" name="tenToa" maxlength="50" placeholder="VD: Tòa A3"></div>
      <div class="col-sm-5"><label class="form-label" for="soTang">Số tầng<span class="req">*</span></label><input class="form-control" type="number" min="1" max="30" id="soTang" name="soTang"></div>
      <div class="col-sm-7"><label class="form-label">Khu<span class="req">*</span></label><div class="seg w-100" id="khuSeg"><button type="button" class="on flex-fill justify-content-center" data-v="Nam"><i class="bi bi-gender-male"></i>Nam</button><button type="button" class="flex-fill justify-content-center" data-v="Nữ"><i class="bi bi-gender-female"></i>Nữ</button></div><input type="hidden" name="loaiKhu" value="Nam"></div>
      <div class="col-12"><label class="form-label" for="truongNha">Trưởng nhà</label><input class="form-control" id="truongNha" name="truongNha" maxlength="100" placeholder="Họ tên cán bộ phụ trách tòa"></div>
    </div></div>
    <div class="modal-footer"><button type="button" class="btn btn-ghost" data-bs-dismiss="modal">Hủy</button><button class="btn btn-primary" id="btnSave">Lưu tòa nhà</button></div></form>
  </div></div></div>`;

  const $ = K.$; let all = [], phongs = [], lps = [], editing = null, view = "card";
  const modal = new bootstrap.Modal("#m"), f = $("#f");
  const table = new K.Table({ tbody: $("#tbody"), foot: $("#foot"), colspan: 8, row: rowHtml, empty: "Không có tòa nhà nào" });
  table.bindSort(page.querySelector("thead"));

  function enrich(t) {
    const ps = phongs.filter(p => p.toaNhaId === t.toaNhaId);
    const cap = ps.reduce((s, p) => s + (lps.find(l => l.loaiPhongId === p.loaiPhongId)?.soNguoiToiDa || 0), 0);
    const occ = ps.reduce((s, p) => s + (p.soNguoiHienTai || 0), 0);
    return { ...t, soPhong: ps.length, sucChua: cap, dangO: occ, tyLe: cap ? Math.round(occ / cap * 100) : 0, phongTrong: ps.filter(p => p.trangThai === "Còn trống").length };
  }
  function facade(t) { const n = 12, on = Math.round(t.tyLe / 100 * n); return `<div class="facade ${t.loaiKhu === "Nữ" ? "nu" : ""}" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i class="${(i * 7) % n < on ? "on" : ""}"></i>`).join("")}</div>`; }
  function actions(t) { return `<button class="btn-icon" data-edit="${t.toaNhaId}" title="Sửa" aria-label="Sửa ${K.esc(t.tenToa)}"><i class="bi bi-pencil"></i></button><button class="btn-icon danger" data-del="${t.toaNhaId}" title="Xóa" aria-label="Xóa ${K.esc(t.tenToa)}"><i class="bi bi-trash3"></i></button>`; }
  function rowHtml(t) {
    return `<tr><td><span class="id-chip">${K.esc(t.toaNhaId)}</span></td><td class="fw-semibold">${K.esc(t.tenToa)}</td>
      <td><span class="pill ${t.loaiKhu === "Nữ" ? "violet" : "blue"}">${K.esc(t.loaiKhu)}</span></td><td class="text-end num">${t.soTang}</td><td class="text-end num">${t.soPhong}</td>
      <td style="min-width:150px"><div class="d-flex align-items-center gap-2"><div class="meter flex-grow-1"><span style="width:${t.tyLe}%"></span></div><span class="num small fw-semibold">${t.tyLe}%</span></div></td>
      <td>${K.esc(t.truongNha || "—")}</td><td class="actions">${actions(t)}</td></tr>`;
  }
  function cardHtml(t) {
    return `<div class="col-md-6 col-xl-4"><div class="panel bld">
      <div class="bld-top">${facade(t)}<div class="flex-grow-1"><div class="d-flex align-items-center gap-2"><h3>${K.esc(t.tenToa)}</h3><span class="pill ${t.loaiKhu === "Nữ" ? "violet" : "blue"}">Khu ${K.esc(t.loaiKhu)}</span></div>
        <div class="meta">Mã ${K.esc(t.toaNhaId)} · ${t.soTang} tầng</div><div class="meta"><i class="bi bi-person"></i> ${K.esc(t.truongNha || "Chưa phân công")}</div></div>
        <div class="dropdown"><button class="btn-icon" data-bs-toggle="dropdown" aria-label="Thao tác"><i class="bi bi-three-dots-vertical"></i></button>
          <ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item" href="phong.html?toa=${t.toaNhaId}"><i class="bi bi-door-open"></i>Xem phòng</a></li><li><a class="dropdown-item" href="#" data-edit="${t.toaNhaId}"><i class="bi bi-pencil"></i>Sửa</a></li><li><a class="dropdown-item text-danger" href="#" data-del="${t.toaNhaId}"><i class="bi bi-trash3"></i>Xóa</a></li></ul></div></div>
      <div><div class="d-flex justify-content-between small mb-1"><span class="text-ink3">Lấp đầy</span><span class="fw-semibold num">${t.dangO}/${t.sucChua} chỗ · ${t.tyLe}%</span></div><div class="meter"><span style="width:${t.tyLe}%"></span></div></div>
      <div class="bld-stats"><div><b>${t.soPhong}</b>phòng</div><div><b>${t.phongTrong}</b>còn trống</div><div><b>${t.sucChua - t.dangO}</b>chỗ trống</div></div>
    </div></div>`;
  }

  async function load() {
    [all, phongs, lps] = await Promise.all([K.api.list("toaNha"), K.api.list("phong"), K.api.list("loaiPhong")]);
    all = all.map(enrich); render();
  }
  function render() {
    const q = K.norm($("#q").value), khu = $("#fKhu").value;
    const rows = all.filter(t => (!khu || t.loaiKhu === khu) && (!q || K.norm(t.toaNhaId + " " + t.tenToa + " " + t.truongNha).includes(q)));
    const cap = all.reduce((s, t) => s + t.sucChua, 0), occ = all.reduce((s, t) => s + t.dangO, 0);
    $("#stats").innerHTML = `
      <div class="stat c-blue"><div class="k"><i class="bi bi-buildings"></i>Tổng tòa nhà</div><div class="v">${all.length}</div><div class="d">${all.filter(t => t.loaiKhu === "Nam").length} khu nam · ${all.filter(t => t.loaiKhu === "Nữ").length} khu nữ</div></div>
      <div class="stat c-violet"><div class="k"><i class="bi bi-door-open"></i>Tổng phòng</div><div class="v">${phongs.length}</div><div class="d">trên ${all.reduce((s, t) => s + t.soTang, 0)} tầng</div></div>
      <div class="stat c-ok"><div class="k"><i class="bi bi-person-check"></i>Sức chứa</div><div class="v">${occ}<small> / ${cap}</small></div><div class="d">sinh viên đang ở / tối đa</div></div>
      <div class="stat c-warn"><div class="k"><i class="bi bi-pie-chart"></i>Tỷ lệ lấp đầy</div><div class="v">${cap ? Math.round(occ / cap * 100) : 0}<small>%</small></div><div class="d">toàn khu KTX</div></div>`;
    $("#cards").innerHTML = rows.length ? rows.map(cardHtml).join("") : `<div class="col-12"><div class="empty"><i class="bi bi-buildings"></i><b>Không tìm thấy tòa nhà</b>Thử từ khóa khác hoặc thêm tòa nhà mới.</div></div>`;
    table.set(rows);
  }

  function open(t) {
    editing = t ? t.toaNhaId : null; f.reset(); f.querySelectorAll(".is-invalid").forEach(x => x.classList.remove("is-invalid"));
    $("#mTitle").textContent = t ? `Sửa ${t.tenToa}` : "Thêm tòa nhà";
    $("#btnSave").textContent = t ? "Lưu thay đổi" : "Lưu tòa nhà";
    f.toaNhaId.readOnly = !!t; delete f.tenToa.dataset.touched;
    if (t) { f.toaNhaId.value = t.toaNhaId; f.tenToa.value = t.tenToa; f.soTang.value = t.soTang; f.truongNha.value = t.truongNha || ""; }
    setKhu(t ? t.loaiKhu : "Nam"); modal.show();
    setTimeout(() => (t ? f.tenToa : f.toaNhaId).focus(), 300);
  }
  function setKhu(v) { f.loaiKhu.value = v; $("#khuSeg").querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.v === v)); }
  $("#khuSeg").onclick = e => { const b = e.target.closest("button"); if (b) setKhu(b.dataset.v); };
  f.toaNhaId.addEventListener("input", () => { f.toaNhaId.value = f.toaNhaId.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!editing && !f.tenToa.dataset.touched) f.tenToa.value = f.toaNhaId.value ? "Tòa " + f.toaNhaId.value : ""; });
  f.tenToa.addEventListener("input", () => f.tenToa.dataset.touched = 1);

  f.addEventListener("submit", async e => {
    e.preventDefault();
    const usedMaxFloor = editing ? Math.max(0, ...phongs.filter(p => p.toaNhaId === editing).map(p => p.tang || 0)) : 0;
    const ok = K.validate(f, {
      toaNhaId: v => !v ? "Nhập mã tòa." : (!/^[A-Z0-9]{1,10}$/.test(v) ? "Mã chỉ gồm chữ in hoa và số." : (!editing && all.some(t => t.toaNhaId === v) ? `Mã ${v} đã tồn tại.` : "")),
      tenToa: v => v ? "" : "Nhập tên tòa.",
      soTang: v => !v ? "Nhập số tầng." : (+v < 1 || +v > 30 ? "Số tầng từ 1 đến 30." : (+v < usedMaxFloor ? `Tòa đang có phòng ở tầng ${usedMaxFloor}, không thể giảm xuống ${v}.` : ""))
    });
    if (!ok) return;
    const obj = { toaNhaId: f.toaNhaId.value, tenToa: f.tenToa.value.trim(), soTang: +f.soTang.value, loaiKhu: f.loaiKhu.value, truongNha: f.truongNha.value.trim() };
    try {
      if (editing) await K.api.update("toaNha", editing, obj); else await K.api.create("toaNha", obj);
      modal.hide(); K.toast(editing ? `Đã lưu thay đổi ${obj.tenToa}` : `Đã thêm ${obj.tenToa}`); load();
    } catch (err) { K.toast(err.message, "bad"); }
  });

  page.addEventListener("click", async e => {
    const ed = e.target.closest("[data-edit]"), del = e.target.closest("[data-del]");
    if (ed) { e.preventDefault(); open(all.find(t => t.toaNhaId === ed.dataset.edit)); }
    if (del) {
      e.preventDefault();
      const t = all.find(x => x.toaNhaId === del.dataset.del);
      if (t.soPhong > 0) { K.confirm({ title: `Chưa thể xóa ${t.tenToa}`, body: `Tòa đang có <b>${t.soPhong} phòng</b>. Xóa hoặc chuyển hết phòng sang tòa khác trước khi xóa tòa nhà.`, okText: "Xem phòng" }).then(ok => ok && (location.href = "phong.html?toa=" + t.toaNhaId)); return; }
      if (await K.confirm({ title: `Xóa ${t.tenToa}?`, body: "Tòa nhà sẽ bị xóa khỏi danh mục. Thao tác này không hoàn tác được.", okText: "Xóa tòa nhà", danger: true })) { await K.api.remove("toaNha", t.toaNhaId); K.toast(`Đã xóa ${t.tenToa}`); load(); }
    }
  });
  page.querySelectorAll("[data-view]").forEach(b => b.onclick = () => { view = b.dataset.view; page.querySelectorAll("[data-view]").forEach(x => x.classList.toggle("on", x === b)); $("#cardView").hidden = view !== "card"; $("#tableView").hidden = view !== "table"; });
  $("#btnAdd").onclick = () => open(null);
  $("#q").oninput = render; $("#fKhu").onchange = render;
  load();
})(window.KTX);
