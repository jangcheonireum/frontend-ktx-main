// Soạn và gửi thông báo (US09 – Sprint 2) – giao diện
(async function (K) {
  const page = document.getElementById("page");
  const [tbs, toas] = await Promise.all(["thongBao", "toaNha"].map(r => K.api.list(r)));
  const LOAI = { "Tài chính": ["violet", "bi-cash-coin"], "Bảo trì": ["warn", "bi-tools"], "Quan trọng": ["bad", "bi-exclamation-lg"], "Sự kiện": ["blue", "bi-calendar-event"], "Chung": ["ok", "bi-info-lg"] };
  page.innerHTML = `
  <div class="page-head"><div><h1>Thông báo</h1><p>Gửi thông báo cho toàn bộ sinh viên hoặc theo từng tòa nhà.</p></div></div>
  <div class="row g-4">
    <div class="col-xl-5"><div class="panel"><div class="panel-head"><h3>Soạn thông báo</h3></div><div class="panel-body">
      <form id="f" novalidate>
        <div class="mb-3"><label class="form-label">Tiêu đề<span class="req">*</span></label><input class="form-control" name="tieuDe" maxlength="150" placeholder="VD: Lịch cắt nước tòa A1"></div>
        <div class="row g-3 mb-3"><div class="col-6"><label class="form-label">Phân loại</label><select class="form-select" name="loai">${Object.keys(LOAI).map(l => `<option>${l}</option>`).join("")}</select></div>
          <div class="col-6"><label class="form-label">Gửi đến</label><select class="form-select" name="doiTuong"><option>Tất cả sinh viên</option>${toas.map(t => `<option>${K.esc(t.tenToa)}</option>`).join("")}</select></div></div>
        <div class="mb-3"><label class="form-label">Nội dung<span class="req">*</span></label><textarea class="form-control" name="noiDung" rows="6" placeholder="Nội dung chi tiết, thời gian, địa điểm…"></textarea><div class="form-text"><span id="cnt">0</span>/2000 ký tự</div></div>
        <div class="mb-3"><label class="form-label">Tệp đính kèm</label><input class="form-control" type="file" name="file"></div>
        <button class="btn btn-primary w-100"><i class="bi bi-send"></i>Gửi thông báo</button>
      </form></div></div></div>
    <div class="col-xl-7"><div class="panel"><div class="panel-head"><h3>Đã gửi</h3><span class="sub ms-auto" id="sentN"></span></div><ul class="list-k" id="list"></ul></div></div>
  </div>`;
  const draw = () => {
    document.getElementById("sentN").textContent = tbs.length + " thông báo";
    document.getElementById("list").innerHTML = tbs.slice().sort((a, b) => b.ngayGui.localeCompare(a.ngayGui)).map(t => { const [c, i] = LOAI[t.loai] || LOAI.Chung;
      return `<li class="align-items-start"><div class="ic ${c}"><i class="bi ${i}"></i></div><div class="flex-grow-1"><div class="t1">${K.esc(t.tieuDe)}</div><div class="small text-ink2 my-1">${K.esc(t.noiDung)}</div><div class="t2"><span class="pill ${c} me-2">${t.loai}</span>${K.esc(t.doiTuong)} · ${K.ago(t.ngayGui)}</div></div></li>`; }).join("");
  };
  draw();
  const f = document.getElementById("f");
  f.noiDung.oninput = () => document.getElementById("cnt").textContent = f.noiDung.value.length;
  f.onsubmit = async e => {
    e.preventDefault();
    if (!K.validate(f, { tieuDe: v => v ? "" : "Nhập tiêu đề.", noiDung: v => !v ? "Nhập nội dung." : (v.length > 2000 ? "Tối đa 2000 ký tự." : "") })) return;
    const o = { tieuDe: f.tieuDe.value.trim(), noiDung: f.noiDung.value.trim(), loai: f.loai.value, doiTuong: f.doiTuong.value, ngayGui: new Date().toISOString() };
    tbs.push(await K.api.create("thongBao", o)); f.reset(); draw(); K.toast("Đã gửi thông báo đến " + o.doiTuong);
  };
})(window.KTX);
