// Camera nhận diện tại cửa ra vào (US11, US12, US21 – Sprint 3–4) – giao diện
(async function (K) {
  const page = document.getElementById("page");
  const nks = await K.api.list("nhatKy");
  const cams = [
    { id: "CAM-01", t: "Cổng chính", boxes: [{ x: 22, y: 30, w: 14, h: 30, n: "23574801 · 97%" }, { x: 60, y: 26, w: 13, h: 28, n: "Người lạ", s: 1 }] },
    { id: "CAM-02", t: "Cửa tòa A1", boxes: [{ x: 40, y: 32, w: 15, h: 32, n: "23574807 · 93%" }] },
    { id: "CAM-03", t: "Cửa tòa B1", boxes: [] },
    { id: "CAM-04", t: "Cửa sau tòa A2", boxes: [{ x: 55, y: 35, w: 12, h: 26, n: "23574811 · 91%" }] }
  ];
  page.innerHTML = `
  <div class="page-head"><div><h1>Camera nhận diện</h1><p>Hình ảnh trực tiếp tại các cửa ra vào và nhật ký nhận diện khuôn mặt.</p></div>
    <div class="actions">${K.later("Sprint 3–4")}</div></div>
  <div class="row g-4">
    <div class="col-xl-8"><div class="row g-3">${cams.map(c => `<div class="col-md-6"><div class="cam"><div class="feed"></div>
      <div class="lbl"><span class="live">TRỰC TIẾP</span>${c.id} · ${c.t}</div>
      ${c.boxes.map(b => `<div class="box ${b.s ? "stranger" : ""}" style="left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%"><span>${b.n}</span></div>`).join("")}
      <div class="ts" data-clock></div></div></div>`).join("")}</div></div>
    <div class="col-xl-4"><div class="panel"><div class="panel-head"><h3>Nhật ký ra/vào hôm nay</h3><span class="sub ms-auto">${nks.length} lượt</span></div>
      <ul class="list-k" style="max-height:560px;overflow:auto">${nks.map(n => `<li><div class="ic ${n.mssv ? (n.huong === "Vào" ? "ok" : "blue") : "bad"}"><i class="bi ${n.mssv ? (n.huong === "Vào" ? "bi-box-arrow-in-right" : "bi-box-arrow-right") : "bi-person-exclamation"}"></i></div>
        <div class="flex-grow-1"><div class="t1">${K.esc(n.hoTen)}${n.phongId ? ` <span class="text-ink3 fw-normal">· ${n.phongId}</span>` : ""}</div><div class="t2">${n.huong} · ${n.camera} · ${n.mssv ? Math.round(n.doTinCay * 100) + "% khớp" : "không có trong hệ thống"}</div></div>
        <span class="small text-ink3 num">${new Date(n.thoiGian).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span></li>`).join("")}</ul></div></div>
  </div>`;
  const tick = () => document.querySelectorAll("[data-clock]").forEach(el => el.textContent = new Date().toLocaleString("vi-VN"));
  tick(); setInterval(tick, 1000);
})(window.KTX);
