// Tài khoản & phân quyền (US01 – Sprint 1): danh sách tài khoản, vai trò, khóa/mở, đặt lại mật khẩu
(async function (K) {
  const [tks, vts] = await Promise.all(["taiKhoan", "vaiTro"].map(r => K.api.list(r)));
  const role = id => (vts.find(v => v.vaiTroId === id) || {}).tenVaiTro || "—";
  const RC = { "Admin": "violet", "Quản lý": "blue", "Sinh viên": "ok", "Bảo vệ": "warn" };
  const rows = () => tks.map(t => ({ ...t, vaiTro: role(t.vaiTroId) }));
  const me = K.session.get();
  const L = K.listPage({
    title: "Tài khoản & phân quyền", desc: "Quản lý tài khoản đăng nhập và vai trò. Mật khẩu được băm (BCrypt) ở backend, không hiển thị ở đây.",
    actions: `<button class="btn btn-primary" data-add><i class="bi bi-person-plus"></i>Tạo tài khoản</button>`,
    top: `<div class="panel mb-4"><div class="panel-head"><h3>Quyền theo vai trò</h3><span class="sub">Sprint 1 tập trung 2 nhóm: Ban quản lý và Sinh viên</span></div><div class="table-wrap"><table class="table table-k"><thead><tr><th>Chức năng</th>${vts.map(v => `<th class="text-center">${v.tenVaiTro}</th>`).join("")}</tr></thead><tbody>
      ${[["Tòa nhà, loại phòng, phòng", [1, 1, 0, 0]], ["Hồ sơ sinh viên, hợp đồng", [1, 1, 0, 0]], ["Hóa đơn, điện nước", [1, 1, 0, 0]], ["Camera, cảnh báo, khách", [1, 1, 0, 1]], ["Tài khoản & phân quyền", [1, 0, 0, 0]], ["Cổng sinh viên (phòng, hóa đơn, phản ánh)", [0, 0, 1, 0]], ["Đổi mật khẩu", [1, 1, 1, 1]]]
        .map(([f, a]) => `<tr><td>${f}</td>${a.map(x => `<td class="text-center">${x ? '<i class="bi bi-check-circle-fill text-success" aria-label="Có"></i>' : '<span class="text-ink3" aria-label="Không">–</span>'}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`,
    tabs: { items: [{ v: "", t: "Tất cả" }, ...vts.map(v => ({ v: v.tenVaiTro, t: v.tenVaiTro }))], match: (r, v) => r.vaiTro === v },
    placeholder: "Tìm tên đăng nhập, họ tên…", search: ["tenDangNhap", "hoTen"],
    filters: [{ id: "st", label: "Mọi trạng thái", options: [{ v: "1", t: "Hoạt động" }, { v: "0", t: "Đã khóa" }], match: (r, v) => r.trangThai === (v === "1") }],
    cols: [
      { h: "Tài khoản", sort: "tenDangNhap", cell: t => K.person(t.hoTen, t.tenDangNhap) },
      { h: "Vai trò", sort: "vaiTro", cell: t => `<span class="pill ${RC[t.vaiTro]}">${t.vaiTro}</span>` },
      { h: "Đăng nhập gần nhất", sort: "lastLogin", cell: t => t.lastLogin ? K.dateTime(t.lastLogin) : '<span class="text-ink3">Chưa đăng nhập</span>' },
      { h: "Trạng thái", cell: t => t.trangThai ? '<span class="pill ok">Hoạt động</span>' : '<span class="pill bad">Đã khóa</span>' },
      { h: "", cls: "actions", cell: t => t.taiKhoanId === me.taiKhoanId ? '<span class="small text-ink3">Tài khoản của bạn</span>' : `<button class="btn-icon" title="Đổi vai trò" aria-label="Đổi vai trò" data-role="${t.taiKhoanId}"><i class="bi bi-person-gear"></i></button><button class="btn-icon" title="Đặt lại mật khẩu" aria-label="Đặt lại mật khẩu" data-reset="${t.taiKhoanId}"><i class="bi bi-key"></i></button><button class="btn-icon ${t.trangThai ? "danger" : ""}" title="${t.trangThai ? "Khóa" : "Mở khóa"}" aria-label="${t.trangThai ? "Khóa" : "Mở khóa"}" data-lock="${t.taiKhoanId}"><i class="bi ${t.trangThai ? "bi-lock" : "bi-unlock"}"></i></button>` }
    ]
  });
  L.setData(rows());
  const M = K.modal("tkM", "Tạo tài khoản", `<div class="row g-3">
    <div class="col-md-6"><label class="form-label">Tên đăng nhập<span class="req">*</span></label><input class="form-control" name="tenDangNhap" autocomplete="off"><div class="form-text">Sinh viên dùng MSSV.</div></div>
    <div class="col-md-6"><label class="form-label">Họ tên<span class="req">*</span></label><input class="form-control" name="hoTen"></div>
    <div class="col-md-6"><label class="form-label">Vai trò</label><select class="form-select" name="vaiTroId">${vts.map(v => `<option value="${v.vaiTroId}">${v.tenVaiTro}</option>`).join("")}</select></div>
    <div class="col-md-6"><label class="form-label">Mật khẩu tạm<span class="req">*</span></label><input class="form-control" name="matKhau" value="Ktx@${Math.floor(1000 + Math.random() * 9000)}"><div class="form-text">Người dùng nên đổi ở lần đăng nhập đầu.</div></div></div>`, "Tạo tài khoản", "modal-lg");
  let roleFor = null;
  M.form.onsubmit = async e => { e.preventDefault();
    if (roleFor) { await K.api.update("taiKhoan", roleFor, { vaiTroId: +M.form.vaiTroId.value }); tks.find(t => t.taiKhoanId === roleFor).vaiTroId = +M.form.vaiTroId.value; M.m.hide(); L.setData(rows()); K.toast("Đã đổi vai trò"); return; }
    if (!K.validate(M.form, { tenDangNhap: v => !v ? "Nhập tên đăng nhập." : (tks.some(t => t.tenDangNhap === v) ? "Tên đăng nhập đã tồn tại." : ""), hoTen: v => v ? "" : "Nhập họ tên.", matKhau: v => v.length >= 8 ? "" : "Tối thiểu 8 ký tự." })) return;
    const o = await K.api.create("taiKhoan", { tenDangNhap: M.form.tenDangNhap.value.trim(), hoTen: M.form.hoTen.value.trim(), vaiTroId: +M.form.vaiTroId.value, matKhau: M.form.matKhau.value, trangThai: true, lastLogin: null, taiKhoanId: null });
    tks.push(o); M.m.hide(); L.setData(rows()); K.toast("Đã tạo tài khoản " + o.tenDangNhap); };
  L.page.addEventListener("click", async e => {
    if (e.target.closest("[data-add]")) { roleFor = null; M.form.reset(); M.title.textContent = "Tạo tài khoản"; M.form.querySelectorAll(".col-md-6").forEach((c, i) => c.hidden = false); M.m.show(); }
    const r = e.target.closest("[data-role]"); if (r) { roleFor = +r.dataset.role; const t = tks.find(x => x.taiKhoanId === roleFor); M.title.textContent = "Đổi vai trò · " + t.tenDangNhap; M.form.querySelectorAll(".col-md-6").forEach((c, i) => c.hidden = i !== 2); M.form.vaiTroId.value = t.vaiTroId; M.m.show(); }
    const l = e.target.closest("[data-lock]"); if (l) { const t = tks.find(x => x.taiKhoanId === +l.dataset.lock);
      if (await K.confirm({ title: t.trangThai ? `Khóa ${t.tenDangNhap}?` : `Mở khóa ${t.tenDangNhap}?`, body: t.trangThai ? "Người dùng sẽ không đăng nhập được cho tới khi mở khóa." : "Người dùng có thể đăng nhập lại.", okText: t.trangThai ? "Khóa tài khoản" : "Mở khóa", danger: t.trangThai })) { t.trangThai = !t.trangThai; await K.api.update("taiKhoan", t.taiKhoanId, { trangThai: t.trangThai }); L.setData(rows()); K.toast(t.trangThai ? "Đã mở khóa" : "Đã khóa tài khoản"); } }
    const rs = e.target.closest("[data-reset]"); if (rs) { const t = tks.find(x => x.taiKhoanId === +rs.dataset.reset); const pw = "Ktx@" + Math.floor(1000 + Math.random() * 9000);
      if (await K.confirm({ title: "Đặt lại mật khẩu?", body: `Mật khẩu mới của <b>${t.tenDangNhap}</b> sẽ là <code>${pw}</code>. Gửi cho người dùng qua kênh an toàn.`, okText: "Đặt lại" })) { await K.api.update("taiKhoan", t.taiKhoanId, { matKhau: pw }); K.toast("Đã đặt lại mật khẩu"); } }
  });
})(window.KTX);
