// Đổi mật khẩu (TS1-05) – dùng chung cho Ban quản lý và Sinh viên
(function (K) {
  const page = document.getElementById("page");
  page.innerHTML = `
  <div class="page-head"><div><h1>Đổi mật khẩu</h1><p>Mật khẩu mới áp dụng cho lần đăng nhập tiếp theo trên mọi thiết bị.</p></div></div>
  <div class="row g-4">
    <div class="col-lg-7 col-xl-6">
      <div class="panel"><div class="panel-body p-4">
        <div id="pwMsg" role="alert"></div>
        <form id="pwForm" novalidate>
          <div class="mb-3"><label class="form-label" for="old">Mật khẩu hiện tại<span class="req">*</span></label>
            <div class="position-relative"><input class="form-control" type="password" id="old" name="old" autocomplete="current-password"><button type="button" class="pw-toggle" data-pw="old" aria-label="Hiện mật khẩu"><i class="bi bi-eye"></i></button></div></div>
          <div class="mb-3"><label class="form-label" for="nw">Mật khẩu mới<span class="req">*</span></label>
            <div class="position-relative"><input class="form-control" type="password" id="nw" name="nw" autocomplete="new-password"><button type="button" class="pw-toggle" data-pw="nw" aria-label="Hiện mật khẩu"><i class="bi bi-eye"></i></button></div>
            <div class="strength" id="str"><i></i><i></i><i></i><i></i></div>
            <ul class="rules" id="rules">
              <li data-r="len">Ít nhất 8 ký tự</li><li data-r="up">Có chữ in hoa</li><li data-r="num">Có chữ số</li><li data-r="sym">Có ký tự đặc biệt (!@#…)</li>
            </ul></div>
          <div class="mb-4"><label class="form-label" for="cf">Nhập lại mật khẩu mới<span class="req">*</span></label>
            <div class="position-relative"><input class="form-control" type="password" id="cf" name="cf" autocomplete="new-password"><button type="button" class="pw-toggle" data-pw="cf" aria-label="Hiện mật khẩu"><i class="bi bi-eye"></i></button></div></div>
          <div class="d-flex gap-2"><button class="btn btn-primary" id="pwBtn"><i class="bi bi-shield-check"></i>Lưu mật khẩu mới</button><a class="btn btn-ghost" href="javascript:history.back()">Hủy</a></div>
        </form>
      </div></div>
    </div>
    <div class="col-lg-5 col-xl-4">
      <div class="panel"><div class="panel-head"><h3>Giữ tài khoản an toàn</h3></div>
        <ul class="list-k">
          <li><div class="ic blue"><i class="bi bi-incognito"></i></div><div><div class="t1">Không dùng lại mật khẩu cũ</div><div class="t2">Đặc biệt là mật khẩu email hay mạng xã hội.</div></div></li>
          <li><div class="ic violet"><i class="bi bi-people"></i></div><div><div class="t1">Không chia sẻ cho bạn cùng phòng</div><div class="t2">Mọi thao tác đều ghi theo tài khoản của bạn.</div></div></li>
          <li><div class="ic ok"><i class="bi bi-box-arrow-right"></i></div><div><div class="t1">Đăng xuất trên máy dùng chung</div><div class="t2">Máy phòng tự học, máy thư viện…</div></div></li>
        </ul></div>
    </div>
  </div>`;

  page.querySelectorAll("[data-pw]").forEach(b => b.onclick = () => { const i = document.getElementById(b.dataset.pw); const v = i.type === "password"; i.type = v ? "text" : "password"; b.innerHTML = `<i class="bi ${v ? "bi-eye-slash" : "bi-eye"}"></i>`; });
  const tests = { len: v => v.length >= 8, up: v => /[A-Z]/.test(v), num: v => /\d/.test(v), sym: v => /[^A-Za-z0-9]/.test(v) };
  const nw = document.getElementById("nw");
  nw.addEventListener("input", () => {
    let s = 0; for (const [k, f] of Object.entries(tests)) { const ok = f(nw.value); if (ok) s++; page.querySelector(`[data-r="${k}"]`).classList.toggle("ok", ok); }
    document.getElementById("str").className = "strength" + (nw.value ? " s" + s : "");
  });

  document.getElementById("pwForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, msg = document.getElementById("pwMsg"); msg.innerHTML = "";
    const ok = K.validate(f, {
      old: v => v ? "" : "Nhập mật khẩu hiện tại.",
      nw: (v, all) => !v ? "Nhập mật khẩu mới." : (!Object.values(tests).every(t => t(v)) ? "Mật khẩu mới chưa đạt đủ 4 điều kiện bên dưới." : (v === all.old ? "Mật khẩu mới phải khác mật khẩu hiện tại." : "")),
      cf: (v, all) => !v ? "Nhập lại mật khẩu mới." : (v !== all.nw ? "Hai mật khẩu chưa khớp nhau." : "")
    });
    if (!ok) return;
    const btn = document.getElementById("pwBtn"); btn.disabled = true;
    try {
      await K.api.changePassword(K.session.get().taiKhoanId, f.old.value, f.nw.value);
      f.reset(); document.getElementById("str").className = "strength"; page.querySelectorAll("#rules li").forEach(l => l.classList.remove("ok"));
      msg.innerHTML = `<div class="alert-k ok"><i class="bi bi-check-circle"></i><div>Đã đổi mật khẩu. Lần đăng nhập sau dùng mật khẩu mới.</div></div>`;
      K.toast("Đã đổi mật khẩu");
    } catch (err) {
      f.old.classList.add("is-invalid");
      msg.innerHTML = `<div class="alert-k bad"><i class="bi bi-exclamation-octagon"></i><div>${K.esc(err.message)}</div></div>`;
    } finally { btn.disabled = false; }
  });
})(window.KTX);
