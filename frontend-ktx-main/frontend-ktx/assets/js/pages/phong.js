// Quản lý Phòng (US02 – TS1-08): danh sách, lọc theo tòa/trạng thái, sơ đồ theo tầng, form thêm/sửa
(function (K) {
  const page = document.getElementById("page");
  page.innerHTML = `
  <div class="page-head">
    <div><h1>Phòng ở</h1><p>Theo dõi chỗ trống từng phòng, lọc theo tòa và trạng thái, cập nhật thông tin phòng.</p></div>
    <div class="actions"><button class="btn btn-ghost" id="btnExport"><i class="bi bi-download"></i>Xuất CSV</button><button class="btn btn-violet" id="btnAdd"><i class="bi bi-plus-lg"></i>Thêm phòng</button></div>
  </div>
  <div class="stat-strip" id="stats"></div>
  <div class="panel">
    <div class="toolbar">
      <div class="input-icon grow"><i class="bi bi-search"></i><input class="form-control" id="q" type="search" placeholder="Tìm mã phòng, tên phòng…"></div>
      <select class="form-select" id="fToa" aria-label="Lọc theo tòa"><option value="">Tất cả tòa</option></select>
      <select class="form-select" id="fLoai" aria-label="Lọc theo loại phòng"><option value="">Mọi loại phòng</option></select>
      <select class="form-select" id="fTT" aria-label="Lọc theo trạng thái"><option value="">Mọi trạng thái</option><option>Còn trống</option><option>Đã đầy</option><option>Đang bảo trì</option></select>
      <button class="btn btn-ghost btn-sm" id="btnClear" hidden><i class="bi bi-x-lg"></i>Bỏ lọc</button>
      <div class="seg ms-auto" role="group" aria-label="Kiểu hiển thị"><button class="on" data-view="table"><i class="bi bi-list-ul"></i>Danh sách</button><button data-view="map"><i class="bi bi-grid-3x3-gap"></i>Sơ đồ tầng</button></div>
    </div>
    <div id="tableView">
      <div class="table-wrap"><table class="table table-k"><thead><tr>
        <th data-sort="phongId">Mã phòng</th><th data-sort="toaNhaId">Tòa</th><th data-sort="tang" class="text-end">Tầng</th><th data-sort="tenLoai">Loại phòng</th>
        <th data-sort="giaChuan" class="text-end">Giá / người</th><th data-sort="cho">Chỗ ở</th><th data-sort="trangThai">Trạng thái</th><th></th></tr></thead><tbody id="tbody"></tbody></table></div>
      <div class="table-foot" id="foot"></div>
    </div>
    <div id="mapView" hidden>
      <div class="px-3 pt-3 d-flex flex-wrap gap-3 align-items-center"><div class="legend"><span><i style="background:#fff"></i>Còn trống</span><span><i style="background:var(--violet-50);border-color:#ddd0fb"></i>Đã đầy</span><span><i style="background:var(--warn-50);border-color:#f2dca8"></i>Đang bảo trì</span><span><span class="beds"><i class="on"></i><i></i></span>chỗ đã có người / còn trống</span></div></div>
      <div id="map" class="pb-2"></div>
    </div>
  </div>

  <!-- Thêm / sửa phòng -->
  <div class="modal fade" id="m" tabindex="-1"><div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title" id="mTitle">Thêm phòng</h5><button class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button></div>
    <form id="f" novalidate><div class="modal-body"><div class="row g-3">
      <div class="col-md-4"><label class="form-label" for="toaNhaId">Tòa nhà<span class="req">*</span></label><select class="form-select" id="toaNhaId" name="toaNhaId"></select></div>
      <div class="col-md-4"><label class="form-label" for="tang">Tầng<span class="req">*</span></label><select class="form-select" id="tang" name="tang"></select></div>
      <div class="col-md-4"><label class="form-label" for="soPhong">Số phòng trên tầng<span class="req">*</span></label><input class="form-control" id="soPhong" name="soPhong" type="number" min="1" max="99" placeholder="VD: 7"></div>
      <div class="col-md-6"><label class="form-label" for="phongId">Mã phòng</label><input class="form-control fw-bold" id="phongId" name="phongId" readonly><div class="form-text">Tự sinh theo mẫu Tòa-Tầng+Số, VD: A1-307.</div></div>
      <div class="col-md-6"><label class="form-label" for="tenPhong">Tên hiển thị<span class="req">*</span></label><input class="form-control" id="tenPhong" name="tenPhong" maxlength="20"></div>
      <div class="col-md-6"><label class="form-label" for="loaiPhongId">Loại phòng<span class="req">*</span></label><select class="form-select" id="loaiPhongId" name="loaiPhongId"></select><div class="form-text" id="loaiHint"></div></div>
      <div class="col-md-6"><label class="form-label" for="trangThai">Trạng thái</label><select class="form-select" id="trangThai" name="trangThai"><option value="Hoạt động">Đang hoạt động (tự tính Còn trống / Đã đầy)</option><option value="Đang bảo trì">Đang bảo trì – tạm ngưng xếp người</option></select></div>
      <div class="col-12" id="occBox" hidden><div class="alert-k info mb-0"><i class="bi bi-people"></i><div id="occTxt"></div></div></div>
    </div></div>
    <div class="modal-footer"><button type="button" class="btn btn-ghost" data-bs-dismiss="modal">Hủy</button><button class="btn btn-primary" id="btnSave">Lưu phòng</button></div></form>
  </div></div></div>

  <!-- Chi tiết phòng -->
  <div class="offcanvas offcanvas-end" tabindex="-1" id="detail" style="width:420px"><div class="offcanvas-header border-bottom"><h5 class="offcanvas-title fw-bold" id="dTitle"></h5><button class="btn-close" data-bs-dismiss="offcanvas" aria-label="Đóng"></button></div><div class="offcanvas-body" id="dBody"></div></div>`;

  const $ = K.$;
  let phongs = [], toas = [], lps = [], svs = [], editing = null, view = "table";
  const modal = new bootstrap.Modal("#m"), f = $("#f"), detail = new bootstrap.Offcanvas("#detail");
  const table = new K.Table({ tbody: $("#tbody"), foot: $("#foot"), colspan: 8, pageSize: 12, row: rowHtml, empty: "Không có phòng phù hợp" });
  table.bindSort(page.querySelector("thead"));
  const qs = new URLSearchParams(location.search);

  const lpOf = p => lps.find(l => l.loaiPhongId === p.loaiPhongId) || { tenLoai: "—", soNguoiToiDa: 0, giaChuan: 0 };
  const statusOf = (n, max, maint) => maint ? "Đang bảo trì" : (n >= max ? "Đã đầy" : "Còn trống");
  const actions = p => `<button class="btn-icon" data-view-room="${p.phongId}" title="Chi tiết" aria-label="Chi tiết ${p.phongId}"><i class="bi bi-eye"></i></button><button class="btn-icon" data-edit="${p.phongId}" title="Sửa" aria-label="Sửa ${p.phongId}"><i class="bi bi-pencil"></i></button><button class="btn-icon danger" data-del="${p.phongId}" title="Xóa" aria-label="Xóa ${p.phongId}"><i class="bi bi-trash3"></i></button>`;
  function rowHtml(p) {
    const left = p.max - p.soNguoiHienTai;
    return `<tr><td><span class="id-chip">${p.phongId}</span><div class="muted">${K.esc(p.tenPhong)}</div></td><td>${K.esc(p.toaNhaId)}</td><td class="text-end num">${p.tang}</td>
      <td>${K.esc(p.tenLoai)}</td><td class="text-end num">${K.money(p.giaChuan)}</td>
      <td style="min-width:160px">${K.beds(p.soNguoiHienTai, p.max, p.trangThai)}<div class="muted mt-1">${p.trangThai === "Đang bảo trì" ? "Tạm ngưng" : left > 0 ? `Còn ${left} chỗ` : "Hết chỗ"} · ${p.soNguoiHienTai}/${p.max}</div></td>
      <td>${K.roomPill(p.trangThai)}</td><td class="actions">${actions(p)}</td></tr>`;
  }

  async function load() {
    [phongs, toas, lps, svs] = await Promise.all(["phong", "toaNha", "loaiPhong", "sinhVien"].map(r => K.api.list(r)));
    phongs = phongs.map(p => { const l = lpOf(p); return { ...p, max: l.soNguoiToiDa, tenLoai: l.tenLoai, giaChuan: l.giaChuan, cho: l.soNguoiToiDa - (p.soNguoiHienTai || 0) }; });
    fillFilters(); render();
  }
  let filled = false;
  function fillFilters() {
    const keep = [$("#fToa").value, $("#fLoai").value];
    $("#fToa").innerHTML = `<option value="">Tất cả tòa</option>` + toas.map(t => `<option value="${t.toaNhaId}">${K.esc(t.tenToa)}</option>`).join("");
    $("#fLoai").innerHTML = `<option value="">Mọi loại phòng</option>` + lps.map(l => `<option value="${l.loaiPhongId}">${K.esc(l.tenLoai)}</option>`).join("");
    if (!filled) { $("#fToa").value = qs.get("toa") || ""; $("#fLoai").value = qs.get("loai") || ""; $("#q").value = qs.get("q") || ""; filled = true; }
    else { $("#fToa").value = keep[0]; $("#fLoai").value = keep[1]; }
  }
  function filtered() {
    const q = K.norm($("#q").value), toa = $("#fToa").value, loai = $("#fLoai").value, tt = $("#fTT").value;
    $("#btnClear").hidden = !(q || toa || loai || tt);
    return phongs.filter(p => (!toa || p.toaNhaId === toa) && (!loai || p.loaiPhongId === +loai) && (!tt || p.trangThai === tt) && (!q || K.norm(p.phongId + " " + p.tenPhong).includes(q)));
  }
  function render() {
    const rows = filtered();
    const scope = $("#fToa").value ? phongs.filter(p => p.toaNhaId === $("#fToa").value) : phongs;
    const cap = scope.filter(p => p.trangThai !== "Đang bảo trì").reduce((s, p) => s + p.max, 0), occ = scope.reduce((s, p) => s + p.soNguoiHienTai, 0);
    const n = st => scope.filter(p => p.trangThai === st).length;
    $("#stats").innerHTML = `
      <div class="stat c-blue"><div class="k"><i class="bi bi-door-open"></i>Tổng phòng</div><div class="v">${scope.length}</div><div class="d">${$("#fToa").value ? "trong " + $("#fToa").selectedOptions[0].text : "toàn KTX"}</div></div>
      <div class="stat c-ok"><div class="k"><i class="bi bi-door-closed"></i>Còn trống</div><div class="v">${n("Còn trống")}</div><div class="d">${cap - occ} chỗ có thể xếp</div></div>
      <div class="stat c-violet"><div class="k"><i class="bi bi-people-fill"></i>Đã đầy</div><div class="v">${n("Đã đầy")}</div><div class="d">không nhận thêm</div></div>
      <div class="stat c-warn"><div class="k"><i class="bi bi-cone-striped"></i>Đang bảo trì</div><div class="v">${n("Đang bảo trì")}</div><div class="d">tạm ngưng xếp người</div></div>
      <div class="stat"><div class="k"><i class="bi bi-pie-chart" style="color:var(--blue)"></i>Tỷ lệ lấp đầy</div><div class="v">${cap ? (occ / cap * 100).toFixed(1).replace(".", ",") : 0}<small>%</small></div><div class="meter mt-2"><span style="width:${cap ? occ / cap * 100 : 0}%"></span></div></div>`;
    table.set(rows);
    renderMap(rows);
  }
  function renderMap(rows) {
    const byToa = {};
    rows.forEach(p => (byToa[p.toaNhaId] = byToa[p.toaNhaId] || []).push(p));
    const ids = Object.keys(byToa).sort();
    $("#map").innerHTML = ids.length ? ids.map(id => {
      const t = toas.find(x => x.toaNhaId === id) || { tenToa: id, soTang: 0 };
      const floors = [...new Set(byToa[id].map(p => p.tang))].sort((a, b) => b - a);
      return `<div class="mx-3 mt-3 border rounded-3 overflow-hidden"><div class="px-3 py-2 d-flex align-items-center gap-2" style="background:#fafbfd;border-bottom:1px solid var(--line)"><b>${K.esc(t.tenToa)}</b><span class="pill ${t.loaiKhu === "Nữ" ? "violet" : "blue"}">Khu ${K.esc(t.loaiKhu || "")}</span><span class="small text-ink3 ms-auto">${byToa[id].length} phòng</span></div>
        ${floors.map(fl => `<div class="floor"><div class="floor-label"><b>${fl}</b>Tầng</div><div class="floor-rooms">${byToa[id].filter(p => p.tang === fl).sort((a, b) => a.phongId.localeCompare(b.phongId)).map(p => `
          <button class="room-tile ${p.trangThai === "Đã đầy" ? "st-full" : p.trangThai === "Đang bảo trì" ? "st-maint" : "st-empty"}" data-view-room="${p.phongId}" aria-label="Phòng ${p.phongId}, ${p.trangThai}, ${p.soNguoiHienTai} trên ${p.max} người">
            <div class="rid">${p.phongId.split("-")[1]}${p.trangThai === "Đang bảo trì" ? '<i class="bi bi-cone-striped text-warning"></i>' : ""}</div><div class="rt">${p.max} người · ${K.moneyShort(p.giaChuan)}</div>${K.beds(p.soNguoiHienTai, p.max, p.trangThai)}</button>`).join("")}</div></div>`).join("")}</div>`;
    }).join("") : `<div class="empty"><i class="bi bi-grid-3x3-gap"></i><b>Không có phòng phù hợp</b>Thử bỏ bớt bộ lọc.</div>`;
  }

  // ---- chi tiết ----
  function showDetail(id) {
    const p = phongs.find(x => x.phongId === id), t = toas.find(x => x.toaNhaId === p.toaNhaId), l = lpOf(p);
    const ppl = svs.filter(s => s.phongDangOid === id && s.trangThai === "Đang lưu trú");
    $("#dTitle").textContent = "Phòng " + p.phongId;
    $("#dBody").innerHTML = `
      <div class="d-flex align-items-center gap-2 mb-3">${K.roomPill(p.trangThai)}<span class="text-ink3 small">${K.esc(t?.tenToa || p.toaNhaId)} · tầng ${p.tang}</span></div>
      <div class="border rounded-3 p-3 mb-3"><div class="d-flex justify-content-between mb-2"><span class="text-ink3">Loại phòng</span><b>${K.esc(l.tenLoai)}</b></div>
        <div class="d-flex justify-content-between mb-2"><span class="text-ink3">Giá chuẩn</span><b class="num">${K.money(l.giaChuan)}/người</b></div>
        <div class="d-flex justify-content-between align-items-center"><span class="text-ink3">Chỗ ở</span><span>${K.beds(p.soNguoiHienTai, p.max, p.trangThai)} <b class="ms-1">${p.soNguoiHienTai}/${p.max}</b></span></div></div>
      <div class="mb-3">${(l.tienIch || []).map(x => `<span class="chip">${K.esc(x)}</span>`).join("")}</div>
      <h6 class="fw-bold mb-2">Sinh viên đang ở <span class="text-ink3 fw-normal">(${ppl.length})</span></h6>
      ${ppl.length ? `<ul class="list-k border rounded-3 mb-3">${ppl.map(s => `<li class="px-3"><div class="avatar">${K.initials(s.hoTen)}</div><div><div class="t1">${K.esc(s.hoTen)}</div><div class="t2">${s.mssv} · ${K.esc(s.lop)}</div></div></li>`).join("")}</ul>` : `<div class="text-ink3 small mb-3">Chưa có hồ sơ sinh viên nào gắn với phòng này (hồ sơ sinh viên làm ở Sprint 2).</div>`}
      <div class="d-flex gap-2"><button class="btn btn-primary flex-fill" data-edit="${p.phongId}"><i class="bi bi-pencil"></i>Sửa phòng</button><button class="btn btn-ghost" data-del="${p.phongId}" aria-label="Xóa"><i class="bi bi-trash3"></i></button></div>`;
    detail.show();
  }

  // ---- form ----
  function floorsFor(toaId) { const t = toas.find(x => x.toaNhaId === toaId); return t ? t.soTang : 1; }
  function fillFloors(sel) { const n = floorsFor(f.toaNhaId.value); f.tang.innerHTML = Array.from({ length: n }, (_, i) => `<option value="${i + 1}">Tầng ${i + 1}</option>`).join(""); if (sel) f.tang.value = sel; }
  function genId() {
    if (editing) return;
    const n = +f.soPhong.value; const id = n ? `${f.toaNhaId.value}-${f.tang.value}${String(n).padStart(2, "0")}` : "";
    f.phongId.value = id; if (!f.tenPhong.dataset.touched) f.tenPhong.value = id ? "Phòng " + id.split("-")[1] : "";
  }
  function nextFree() { const used = phongs.filter(p => p.toaNhaId === f.toaNhaId.value && p.tang === +f.tang.value).map(p => +p.phongId.split("-")[1].slice(String(f.tang.value).length)); let i = 1; while (used.includes(i)) i++; return i; }
  function loaiHint() { const l = lps.find(x => x.loaiPhongId === +f.loaiPhongId.value); $("#loaiHint").textContent = l ? `${l.soNguoiToiDa} người · ${K.money(l.giaChuan)}/người/tháng` : ""; }
  f.toaNhaId.onchange = () => { fillFloors(); if (!editing) f.soPhong.value = nextFree(); genId(); };
  f.tang.onchange = () => { if (!editing) f.soPhong.value = nextFree(); genId(); };
  f.soPhong.oninput = genId; f.loaiPhongId.onchange = loaiHint;
  f.tenPhong.oninput = () => f.tenPhong.dataset.touched = 1;

  function open(p) {
    editing = p ? p.phongId : null; f.reset(); delete f.tenPhong.dataset.touched;
    f.querySelectorAll(".is-invalid").forEach(x => x.classList.remove("is-invalid"));
    f.toaNhaId.innerHTML = toas.map(t => `<option value="${t.toaNhaId}">${K.esc(t.tenToa)}</option>`).join("");
    f.loaiPhongId.innerHTML = lps.map(l => `<option value="${l.loaiPhongId}">${K.esc(l.tenLoai)}</option>`).join("");
    $("#mTitle").textContent = p ? `Sửa phòng ${p.phongId}` : "Thêm phòng"; $("#btnSave").textContent = p ? "Lưu thay đổi" : "Lưu phòng";
    [f.toaNhaId, f.tang, f.soPhong].forEach(x => x.disabled = !!p);
    if (p) {
      f.toaNhaId.value = p.toaNhaId; fillFloors(p.tang); f.soPhong.value = +p.phongId.split("-")[1].slice(String(p.tang).length);
      f.phongId.value = p.phongId; f.tenPhong.value = p.tenPhong; f.loaiPhongId.value = p.loaiPhongId; f.trangThai.value = p.trangThai === "Đang bảo trì" ? "Đang bảo trì" : "Hoạt động";
      $("#occBox").hidden = false; $("#occTxt").innerHTML = `Phòng đang có <b>${p.soNguoiHienTai} người</b>. Số người ở được cập nhật tự động khi xếp/chuyển phòng sinh viên.`;
    } else {
      f.toaNhaId.value = $("#fToa").value || toas[0]?.toaNhaId; fillFloors(); f.soPhong.value = nextFree(); genId(); $("#occBox").hidden = true;
    }
    loaiHint(); modal.show(); bootstrap.Offcanvas.getInstance("#detail")?.hide();
  }

  f.addEventListener("submit", async e => {
    e.preventDefault(); genId();
    const p = editing && phongs.find(x => x.phongId === editing);
    const ok = K.validate(f, {
      soPhong: v => !v ? "Nhập số phòng." : (+v < 1 || +v > 99 ? "Từ 1 đến 99." : (!editing && phongs.some(x => x.phongId === f.phongId.value) ? `Phòng ${f.phongId.value} đã tồn tại.` : "")),
      tenPhong: v => v ? "" : "Nhập tên hiển thị.",
      loaiPhongId: v => { const l = lps.find(x => x.loaiPhongId === +v); return !l ? "Chọn loại phòng." : (p && p.soNguoiHienTai > l.soNguoiToiDa ? `Phòng đang có ${p.soNguoiHienTai} người, loại này chỉ cho ${l.soNguoiToiDa}.` : ""); },
      trangThai: v => p && v === "Đang bảo trì" && p.soNguoiHienTai > 0 ? "Chuyển hết sinh viên đi trước khi đặt phòng bảo trì." : ""
    });
    if (!ok) return;
    const l = lps.find(x => x.loaiPhongId === +f.loaiPhongId.value), n = p ? p.soNguoiHienTai : 0;
    const obj = { phongId: f.phongId.value, tenPhong: f.tenPhong.value.trim(), toaNhaId: f.toaNhaId.value, tang: +f.tang.value, loaiPhongId: l.loaiPhongId, soNguoiHienTai: n, trangThai: statusOf(n, l.soNguoiToiDa, f.trangThai.value === "Đang bảo trì") };
    try {
      if (editing) await K.api.update("phong", editing, obj); else await K.api.create("phong", obj);
      modal.hide(); K.toast(editing ? `Đã lưu phòng ${obj.phongId}` : `Đã thêm phòng ${obj.phongId}`); load();
    } catch (err) { K.toast(err.message, "bad"); }
  });

  async function del(id) {
    const p = phongs.find(x => x.phongId === id);
    if (p.soNguoiHienTai > 0) { K.confirm({ title: `Chưa thể xóa ${id}`, body: `Phòng đang có <b>${p.soNguoiHienTai} sinh viên</b>. Chuyển sinh viên sang phòng khác trước khi xóa.`, okText: "Đã hiểu" }); return; }
    if (await K.confirm({ title: `Xóa phòng ${id}?`, body: "Phòng sẽ bị xóa khỏi danh sách. Thao tác này không hoàn tác được.", okText: "Xóa phòng", danger: true })) {
      await K.api.remove("phong", id); bootstrap.Offcanvas.getInstance("#detail")?.hide(); K.toast(`Đã xóa phòng ${id}`); load();
    }
  }

  document.addEventListener("click", e => {
    const v = e.target.closest("[data-view-room]"), ed = e.target.closest("[data-edit]"), d = e.target.closest("[data-del]");
    if (v) showDetail(v.dataset.viewRoom);
    if (ed) open(phongs.find(x => x.phongId === ed.dataset.edit));
    if (d) del(d.dataset.del);
  });
  page.querySelectorAll("[data-view]").forEach(b => b.onclick = () => { view = b.dataset.view; page.querySelectorAll("[data-view]").forEach(x => x.classList.toggle("on", x === b)); $("#tableView").hidden = view !== "table"; $("#mapView").hidden = view !== "map"; });
  ["q"].forEach(id => $("#" + id).oninput = render);
  ["fToa", "fLoai", "fTT"].forEach(id => $("#" + id).onchange = render);
  $("#btnClear").onclick = () => { $("#q").value = ""; $("#fToa").value = ""; $("#fLoai").value = ""; $("#fTT").value = ""; history.replaceState(null, "", location.pathname); render(); };
  $("#btnAdd").onclick = () => open(null);
  $("#btnExport").onclick = () => {
    const rows = filtered(), head = ["Mã phòng", "Tên phòng", "Tòa", "Tầng", "Loại phòng", "Giá/người", "Đang ở", "Tối đa", "Trạng thái"];
    const csv = [head, ...rows.map(p => [p.phongId, p.tenPhong, p.toaNhaId, p.tang, p.tenLoai, p.giaChuan, p.soNguoiHienTai, p.max, p.trangThai])].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })); a.download = "danh-sach-phong.csv"; a.click();
    K.toast(`Đã xuất ${rows.length} phòng`);
  };
  load();
})(window.KTX);
