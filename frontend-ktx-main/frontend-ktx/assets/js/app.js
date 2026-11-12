/* =========================================================
   app.js – Layout dùng chung (TS1-03), phân quyền phía giao diện,
   và các tiện ích UI: toast, hộp xác nhận, bảng có lọc/sắp xếp/phân trang.
   Mỗi trang chỉ cần: <body data-role="admin|sinhvien" data-page="..."
   data-title="..."> và đặt nội dung trong <main id="page">.
   ========================================================= */
(function (K) {
  // ---------- Tiện ích ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => (Number(n) || 0).toLocaleString("vi-VN") + " đ";
  const moneyShort = (n) => n >= 1e6 ? (n / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + " tr" : (n / 1e3).toLocaleString("vi-VN") + "k";
  const date = (s) => s ? new Date(s).toLocaleDateString("vi-VN") : "—";
  const dateTime = (s) => s ? new Date(s).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
  const ago = (s) => { const m = Math.round((Date.now() - new Date(s)) / 60000); if (m < 60) return m + " phút trước"; if (m < 1440) return Math.round(m / 60) + " giờ trước"; return Math.round(m / 1440) + " ngày trước"; };
  const initials = (n) => String(n || "?").trim().split(/\s+/).slice(-2).map(w => w[0]).join("").toUpperCase();
  const norm = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  Object.assign(K, { esc, money, moneyShort, date, dateTime, ago, initials, norm, $, $$ });

  // ---------- Phiên đăng nhập ----------
  const SKEY = "ktx.session";
  K.session = {
    get() { try { return JSON.parse(K.ls.get(SKEY)); } catch (e) { return null; } },
    set(u) { K.ls.set(SKEY, JSON.stringify(u)); },
    clear() { K.ls.del(SKEY); }
  };
  const ADMIN_ROLES = ["Admin", "Quản lý", "Bảo vệ"];
  K.homeFor = (role, base = "") => (role === "Sinh viên" ? base + "sinhvien/trang-chu.html" : (role === "Bảo vệ" ? base + "admin/camera.html" : base + "admin/tong-quan.html"));

  // ---------- Menu theo vai trò ----------
  const ALL = ["Admin", "Quản lý"], SEC = ["Admin", "Quản lý", "Bảo vệ"];
  const MENU = {
    admin: [
      { g: "Tổng quan" },
      { id: "tong-quan", icon: "bi-grid-1x2", t: "Bảng điều khiển", s: 6, roles: ALL },
      { g: "Cơ sở lưu trú" },
      { id: "toa-nha", icon: "bi-buildings", t: "Tòa nhà", s: 1, roles: ALL },
      { id: "loai-phong", icon: "bi-layers", t: "Loại phòng", s: 1, roles: ALL },
      { id: "phong", icon: "bi-door-open", t: "Phòng ở", s: 1, roles: ALL },
      { id: "co-so-vat-chat", icon: "bi-box-seam", t: "Cơ sở vật chất", s: "MR", roles: ALL },
      { g: "Sinh viên" },
      { id: "sinh-vien", icon: "bi-people", t: "Hồ sơ sinh viên", s: 2, roles: ALL },
      { id: "hop-dong", icon: "bi-file-earmark-text", t: "Hợp đồng thuê", s: 3, roles: ALL },
      { g: "Tài chính" },
      { id: "dien-nuoc", icon: "bi-lightning-charge", t: "Điện nước", s: 4, roles: ALL },
      { id: "hoa-don", icon: "bi-receipt", t: "Hóa đơn", s: 4, roles: ALL },
      { g: "Liên lạc" },
      { id: "thong-bao", icon: "bi-megaphone", t: "Thông báo", s: 2, roles: ALL },
      { id: "phan-anh", icon: "bi-tools", t: "Phản ánh sự cố", s: 6, roles: ALL, badge: "pa" },
      { g: "An ninh" },
      { id: "camera", icon: "bi-camera-video", t: "Camera nhận diện", s: 4, roles: SEC },
      { id: "khach", icon: "bi-person-badge", t: "Khách ra/vào", s: "MR", roles: SEC },
      { id: "canh-bao", icon: "bi-shield-exclamation", t: "Cảnh báo an ninh", s: 5, roles: SEC, badge: "cb" },
      { g: "Hệ thống" },
      { id: "tai-khoan", icon: "bi-person-gear", t: "Tài khoản & phân quyền", s: 1, roles: ["Admin"] },
      { id: "doi-mat-khau", icon: "bi-key", t: "Đổi mật khẩu", s: 1, roles: SEC }
    ],
    sinhvien: [
      { g: "Cá nhân" },
      { id: "trang-chu", icon: "bi-house-door", t: "Trang chủ", s: 1 },
      { id: "ho-so", icon: "bi-person-vcard", t: "Hồ sơ cá nhân", s: 2 },
      { id: "dang-ky-phong", icon: "bi-pencil-square", t: "Đăng ký thuê phòng", s: 2 },
      { g: "Sinh hoạt" },
      { id: "hoa-don", icon: "bi-receipt", t: "Hóa đơn & thanh toán", s: 5 },
      { id: "ra-vao", icon: "bi-clock-history", t: "Lịch sử ra/vào", s: 5 },
      { id: "thong-bao", icon: "bi-bell", t: "Thông báo", s: 2 },
      { id: "phan-anh", icon: "bi-chat-left-text", t: "Gửi phản ánh", s: 6 },
      { g: "Tài khoản" },
      { id: "doi-mat-khau", icon: "bi-key", t: "Đổi mật khẩu", s: 1 }
    ]
  };
  // Trang sinh viên đã hoàn thiện giao diện
  const BUILT_SV = ["trang-chu", "doi-mat-khau", "ho-so", "dang-ky-phong", "hoa-don", "ra-vao", "thong-bao", "phan-anh"];

  function brandMark() {
    return `<div class="brand-mark" aria-hidden="true">${[1, 0, 1, 0, 1, 1, 1, 0, 0].map(o => `<span class="${o ? "on" : ""}"></span>`).join("")}</div>`;
  }
  K.brandMark = brandMark;

  function renderShell() {
    const body = document.body;
    const area = body.dataset.role;
    if (!area) return;
    const page = body.dataset.page;
    const s = K.session.get();
    // ---- Bảo vệ trang theo vai trò (phía giao diện; backend Java vẫn phải kiểm tra lại) ----
    if (!s) { location.replace("../login.html?next=" + encodeURIComponent(location.pathname.split("/").slice(-2).join("/"))); return; }
    if (area === "admin" && !ADMIN_ROLES.includes(s.vaiTro)) { location.replace("../" + K.homeFor(s.vaiTro)); return; }
    if (area === "sinhvien" && s.vaiTro !== "Sinh viên") { location.replace("../" + K.homeFor(s.vaiTro)); return; }
    const items = MENU[area];
    const cur = items.find(i => i.id === page);
    if (area === "admin" && cur && cur.roles && !cur.roles.includes(s.vaiTro)) {
      location.replace("../" + K.homeFor(s.vaiTro) + "?denied=1"); return;
    }

    const d = (K._dbPeek && K._dbPeek()) || {};
    const badgeVal = { pa: d.pa, cb: d.cb };
    let navHtml = "";
    let group = "", groupLinks = [];
    const flushGroup = () => {
      if (!groupLinks.length) return;
      navHtml += `<div class="nav-group">${group}</div>`;
      groupLinks.forEach(i => {
        const href = area === "sinhvien" && !BUILT_SV.includes(i.id) ? `#" data-later="${i.s}` : `${i.id}.html`;
        const tag = i.badge && badgeVal[i.badge] ? `<span class="tag">${badgeVal[i.badge]}</span>` : (i.s === 1 ? `<span class="tag" title="Thuộc Sprint 1">S1</span>` : `<span class="tag later" title="${i.s === "MR" ? "Hạng mục mở rộng" : "Thuộc Sprint " + i.s}">${i.s === "MR" ? "MR" : "S" + i.s}</span>`);
        navHtml += `<a class="nav-link-item ${i.id === page ? "active" : ""}" href="${href}" ${i.id === page ? 'aria-current="page"' : ""}><i class="bi ${i.icon}"></i><span>${i.t}</span>${tag}</a>`;
      });
      groupLinks = [];
    };
    items.forEach(i => {
      if (i.g) { flushGroup(); group = i.g; return; }
      if (i.roles && !i.roles.includes(s.vaiTro)) return;
      if (area === "admin" && s.vaiTro === "Bảo vệ" && i.id === "doi-mat-khau") return;
      groupLinks.push(i);
    });
    flushGroup();

    const pageEl = document.getElementById("page");
    const app = document.createElement("div");
    app.className = "app";
    app.innerHTML = `
      <aside class="sidebar" aria-label="Điều hướng chính">
        <div class="sidebar-brand">${brandMark()}<div><b>KTX Thông Minh</b><small>${area === "admin" ? "Ban quản lý" : "Cổng sinh viên"} · ĐH Vinh</small></div></div>
        <nav class="sidebar-nav">${navHtml}</nav>
        <div class="sidebar-foot">S1 = Sprint 1 · MR = mở rộng</div>
      </aside>
      <div class="backdrop" data-close-nav></div>
      <div class="main">
        <header class="topbar">
          <button class="btn-icon d-lg-none" data-toggle-nav aria-label="Mở menu"><i class="bi bi-list fs-4"></i></button>
          <div class="crumbs d-none d-sm-block">${area === "admin" ? "Quản lý KTX" : "Sinh viên"} / <b>${esc(body.dataset.title || (cur && cur.t) || "")}</b></div>
          <div class="search input-icon"><i class="bi bi-search"></i><input class="form-control" type="search" placeholder="Tìm phòng, sinh viên, MSSV…" aria-label="Tìm kiếm nhanh" id="globalSearch"></div>
          <button class="btn-icon ${area === "admin" ? "notif-dot" : ""} ms-auto ms-lg-0" aria-label="Thông báo" title="Thông báo"><i class="bi bi-bell fs-5"></i></button>
          <div class="dropdown">
            <div class="user-chip" data-bs-toggle="dropdown" role="button" tabindex="0" aria-label="Tài khoản">
              <div class="avatar">${initials(s.hoTen)}</div>
              <div class="who"><b>${esc(s.hoTen)}</b><small>${esc(s.vaiTro)}${s.mssv ? " · " + s.mssv : ""}</small></div>
              <i class="bi bi-chevron-down small text-ink3 d-none d-md-inline"></i>
            </div>
            <ul class="dropdown-menu dropdown-menu-end">
              <li class="px-2 py-1 small text-ink3">Đăng nhập: ${esc(s.tenDangNhap)}</li>
              <li><a class="dropdown-item" href="doi-mat-khau.html"><i class="bi bi-key"></i>Đổi mật khẩu</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" data-logout><i class="bi bi-box-arrow-right"></i>Đăng xuất</a></li>
            </ul>
          </div>
        </header>
        <div class="content"></div>
      </div>`;
    body.prepend(app);
    app.querySelector(".content").appendChild(pageEl);
    pageEl.hidden = false;

    app.addEventListener("click", (e) => {
      if (e.target.closest("[data-toggle-nav]")) app.classList.toggle("nav-open");
      if (e.target.closest("[data-close-nav]")) app.classList.remove("nav-open");
      const later = e.target.closest("[data-later]");
      if (later) { e.preventDefault(); const v = later.dataset.later; K.toast(v === "MR" ? "Chức năng mở rộng – chưa nằm trong kế hoạch Sprint 1." : `Màn hình này thuộc Sprint ${v}, sẽ làm ở các sprint sau.`, "warn"); }
      if (e.target.closest("[data-logout]")) { e.preventDefault(); K.logout(); }
    });
    const gs = document.getElementById("globalSearch");
    if (gs) gs.addEventListener("keydown", (e) => { if (e.key === "Enter" && gs.value.trim()) location.href = "phong.html?q=" + encodeURIComponent(gs.value.trim()); });
    if (new URLSearchParams(location.search).get("denied")) setTimeout(() => K.toast("Tài khoản của bạn không có quyền truy cập trang đó.", "bad"), 200);
  }

  K.logout = async function () {
    const ok = await K.confirm({ title: "Đăng xuất?", body: "Bạn sẽ cần đăng nhập lại để tiếp tục làm việc.", okText: "Đăng xuất", danger: true });
    if (!ok) return;
    K.session.clear();
    location.href = "../login.html?out=1";
  };

  // ---------- Toast ----------
  K.toast = function (msg, type = "ok") {
    let st = document.querySelector(".toast-stack");
    if (!st) { st = document.createElement("div"); st.className = "toast-stack"; st.setAttribute("aria-live", "polite"); document.body.appendChild(st); }
    const icon = { ok: "bi-check-circle-fill", bad: "bi-x-circle-fill", warn: "bi-exclamation-triangle-fill" }[type] || "bi-info-circle-fill";
    const el = document.createElement("div");
    el.className = "toast-k " + type;
    el.innerHTML = `<i class="bi ${icon}"></i><div>${esc(msg)}</div>`;
    st.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; setTimeout(() => el.remove(), 300); }, 3200);
  };

  // ---------- Hộp xác nhận ----------
  K.confirm = function ({ title, body, okText = "Xác nhận", danger = false }) {
    return new Promise((resolve) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = `<div class="modal fade" tabindex="-1"><div class="modal-dialog modal-dialog-centered" style="max-width:420px"><div class="modal-content">
        <div class="modal-body pt-4 px-4">
          <div class="d-flex gap-3"><div class="ic ${danger ? "bad" : "blue"}" style="width:42px;height:42px;border-radius:10px;display:grid;place-items:center;flex-shrink:0;font-size:19px"><i class="bi ${danger ? "bi-exclamation-triangle" : "bi-question-circle"}"></i></div>
          <div><h5 class="fw-bold mb-1" style="font-size:17px">${esc(title)}</h5><div class="text-ink3">${body}</div></div></div>
        </div>
        <div class="modal-footer border-0 pt-0 px-4 pb-4"><button class="btn btn-ghost" data-bs-dismiss="modal">Hủy</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-ok>${esc(okText)}</button></div>
      </div></div></div>`;
      const el = wrap.firstElementChild; document.body.appendChild(el);
      const m = new bootstrap.Modal(el); let res = false;
      el.querySelector("[data-ok]").onclick = () => { res = true; m.hide(); };
      el.addEventListener("hidden.bs.modal", () => { el.remove(); resolve(res); });
      m.show();
    });
  };

  // ---------- Bảng: lọc + sắp xếp + phân trang ----------
  K.Table = class {
    constructor({ tbody, foot, pageSize = 10, row, empty = "Không có dữ liệu phù hợp.", colspan = 8, onRender }) {
      Object.assign(this, { tbody, foot, pageSize, row, empty, colspan, onRender, page: 1, data: [], sortKey: null, sortDir: 1 });
    }
    set(data) { this.data = data; this.page = 1; this.render(); }
    sortBy(key, th) {
      if (this.sortKey === key) this.sortDir *= -1; else { this.sortKey = key; this.sortDir = 1; }
      if (th) { th.closest("tr").querySelectorAll(".sort").forEach(x => x.classList.remove("asc", "desc")); th.classList.add(this.sortDir > 0 ? "asc" : "desc"); }
      this.render();
    }
    bindSort(thead) { thead.querySelectorAll("[data-sort]").forEach(th => { th.classList.add("sort"); th.tabIndex = 0; th.onclick = () => this.sortBy(th.dataset.sort, th); th.onkeydown = (e) => { if (e.key === "Enter") this.sortBy(th.dataset.sort, th); }; }); }
    render() {
      let rows = this.data.slice();
      if (this.sortKey) { const k = this.sortKey, d = this.sortDir; rows.sort((a, b) => { const x = a[k], y = b[k]; return (typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""), "vi", { numeric: true })) * d; }); }
      const total = rows.length, pages = Math.max(1, Math.ceil(total / this.pageSize));
      if (this.page > pages) this.page = pages;
      const slice = rows.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
      this.tbody.innerHTML = slice.length ? slice.map(this.row).join("") : `<tr><td colspan="${this.colspan}"><div class="empty"><i class="bi bi-inbox"></i><b>${this.empty}</b>Thử bỏ bớt bộ lọc hoặc đổi từ khóa tìm kiếm.</div></td></tr>`;
      if (this.foot) {
        const from = total ? (this.page - 1) * this.pageSize + 1 : 0, to = Math.min(total, this.page * this.pageSize);
        let btns = `<button ${this.page === 1 ? "disabled" : ""} data-p="${this.page - 1}" aria-label="Trang trước"><i class="bi bi-chevron-left"></i></button>`;
        for (let p = 1; p <= pages; p++) { if (pages > 7 && p > 2 && p < pages - 1 && Math.abs(p - this.page) > 1) { if (!btns.endsWith("…</span>")) btns += `<span class="px-1">…</span>`; continue; } btns += `<button class="${p === this.page ? "on" : ""}" data-p="${p}">${p}</button>`; }
        btns += `<button ${this.page === pages ? "disabled" : ""} data-p="${this.page + 1}" aria-label="Trang sau"><i class="bi bi-chevron-right"></i></button>`;
        this.foot.innerHTML = `<span>Hiển thị ${from}–${to} trên ${total}</span><div class="pager">${btns}</div>`;
        this.foot.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { this.page = +b.dataset.p; this.render(); });
      }
      if (this.onRender) this.onRender();
    }
  };

  // ---------- Kiểm tra form ----------
  K.validate = function (form, rules) {
    let ok = true; const v = {};
    form.querySelectorAll(".is-invalid").forEach(x => x.classList.remove("is-invalid"));
    for (const [name, fn] of Object.entries(rules)) {
      const el = form.elements[name]; if (!el) continue;
      const val = el.value.trim(); v[name] = val;
      const err = fn(val, v);
      if (err) {
        ok = false; el.classList.add("is-invalid");
        let fb = el.parentElement.querySelector(".invalid-feedback");
        if (!fb) { fb = document.createElement("div"); fb.className = "invalid-feedback"; el.parentElement.appendChild(fb); }
        fb.textContent = err;
      }
    }
    if (!ok) { const f = form.querySelector(".is-invalid"); if (f) f.focus(); }
    return ok;
  };

  // ---------- Khung trang danh sách dùng chung cho các trang quản lý ----------
  // cfg: { title, desc, actions, stats(rows)->html, search:[keys], placeholder,
  //        filters:[{id,label,options:[v|{v,t}],key|match(row,val)}], cols:[{h,sort,cls,cell(row)}],
  //        pageSize, empty, tabs:{key, items:[...]}, after(html under table), onRow? }
  K.listPage = function (cfg) {
    const page = document.getElementById("page");
    page.innerHTML = `
      <div class="page-head"><div><h1>${cfg.title}</h1><p>${cfg.desc || ""}</p></div><div class="actions">${cfg.actions || ""}</div></div>
      ${cfg.stats ? `<div class="stat-strip" data-stats></div>` : ""}
      ${cfg.top || ""}
      ${cfg.tabs ? `<div class="tabs-k" role="tablist" data-tabs></div>` : ""}
      <div class="panel">
        <div class="toolbar">
          <div class="input-icon grow"><i class="bi bi-search"></i><input class="form-control" type="search" data-q placeholder="${cfg.placeholder || "Tìm kiếm…"}"></div>
          ${(cfg.filters || []).map(f => `<select class="form-select" data-f="${f.id}" aria-label="${f.label}"><option value="">${f.label}</option>${f.options.map(o => typeof o === "object" ? `<option value="${esc(o.v)}">${esc(o.t)}</option>` : `<option>${esc(o)}</option>`).join("")}</select>`).join("")}
          ${cfg.toolbarRight ? `<div class="ms-auto d-flex gap-2">${cfg.toolbarRight}</div>` : ""}
        </div>
        <div class="table-wrap"><table class="table table-k"><thead><tr>${cfg.cols.map(c => `<th ${c.sort ? `data-sort="${c.sort}"` : ""} class="${c.cls || ""}">${c.h}</th>`).join("")}</tr></thead><tbody data-tbody></tbody></table></div>
        <div class="table-foot" data-foot></div>
      </div>
      ${cfg.after || ""}`;
    const t = new K.Table({ tbody: page.querySelector("[data-tbody]"), foot: page.querySelector("[data-foot]"), pageSize: cfg.pageSize || 10, colspan: cfg.cols.length, empty: cfg.empty || "Không có dữ liệu phù hợp", row: r => `<tr>${cfg.cols.map(c => `<td class="${c.cls || ""}">${c.cell(r)}</td>`).join("")}</tr>` });
    t.bindSort(page.querySelector("thead"));
    let rows = [], tab = "";
    const api = {
      page, table: t,
      setData(d) { rows = d; api.render(); },
      get data() { return rows; },
      filtered() {
        const q = norm(page.querySelector("[data-q]").value);
        return rows.filter(r => {
          if (cfg.tabs && tab && !cfg.tabs.match(r, tab)) return false;
          if (q && !norm((cfg.search || []).map(k => typeof k === "function" ? k(r) : r[k]).join(" ")).includes(q)) return false;
          for (const f of cfg.filters || []) { const v = page.querySelector(`[data-f="${f.id}"]`).value; if (v && !(f.match ? f.match(r, v) : String(r[f.key]) === v)) return false; }
          return true;
        });
      },
      render() {
        if (cfg.stats) page.querySelector("[data-stats]").innerHTML = cfg.stats(rows);
        if (cfg.tabs) page.querySelector("[data-tabs]").innerHTML = cfg.tabs.items.map(it => `<button class="${it.v === tab ? "on" : ""}" data-tab="${esc(it.v)}" role="tab">${it.t}<span class="n">${it.v ? rows.filter(r => cfg.tabs.match(r, it.v)).length : rows.length}</span></button>`).join("");
        t.set(api.filtered());
      },
      csv(name, head, map) {
        const data = api.filtered();
        const csv = [head, ...data.map(map)].map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
        const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })); a.download = name; a.click();
        K.toast(`Đã xuất ${data.length} dòng`);
      }
    };
    page.querySelector("[data-q]").addEventListener("input", api.render);
    page.querySelectorAll("[data-f]").forEach(s => s.addEventListener("change", api.render));
    page.addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) { tab = b.dataset.tab; api.render(); } });
    return api;
  };
  K.stat = (cls, icon, k, v, d) => `<div class="stat ${cls}"><div class="k"><i class="bi ${icon}"></i>${k}</div><div class="v">${v}</div>${d ? `<div class="d">${d}</div>` : ""}</div>`;
  K.person = (name, sub) => `<div class="d-flex align-items-center gap-2"><div class="avatar" style="width:30px;height:30px;font-size:11.5px">${initials(name)}</div><div class="cell-2"><b>${esc(name)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</div></div>`;
  K.modal = function (id, title, bodyHtml, okText, size = "") {
    const w = document.createElement("div");
    w.innerHTML = `<div class="modal fade" id="${id}" tabindex="-1"><div class="modal-dialog modal-dialog-centered ${size}"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">${title}</h5><button class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button></div><form novalidate><div class="modal-body">${bodyHtml}</div><div class="modal-footer"><button type="button" class="btn btn-ghost" data-bs-dismiss="modal">Hủy</button>${okText ? `<button class="btn btn-primary">${okText}</button>` : ""}</div></form></div></div></div>`;
    const el = w.firstElementChild; document.getElementById("page").appendChild(el);
    return { el, form: el.querySelector("form"), m: new bootstrap.Modal(el), title: el.querySelector(".modal-title") };
  };
  K.later = (s) => `<span class="sprint-note"><i class="bi bi-info-circle"></i>Giao diện mẫu – nghiệp vụ hoàn thiện ở ${s}</span>`;

  K.beds = (n, max, st) => `<span class="beds ${st === "Đang bảo trì" ? "maint" : (n >= max ? "full" : "")}" title="${n}/${max} chỗ">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</span>`;
  K.roomPill = (st) => st === "Đang bảo trì" ? `<span class="pill warn">Đang bảo trì</span>` : st === "Đã đầy" ? `<span class="pill violet">Đã đầy</span>` : `<span class="pill ok">Còn trống</span>`;

  // badge số lượng cho sidebar
  K._dbPeek = function () {
    try { const d = JSON.parse(K.ls.get("ktx.db.v3")); return { pa: d.phanAnh.filter(x => x.trangThai === "Chờ tiếp nhận").length, cb: d.canhBao.filter(x => x.trangThai === "Chưa xử lý").length }; } catch (e) { return {}; }
  };

  document.addEventListener("DOMContentLoaded", renderShell);
})(window.KTX);
