// Boboarts: shared behaviour
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const thumb = w => w.img ? `assets/works/${w.img}-sm.webp` : `assets/video/${w.video}.jpg`;
const full = w => w.img ? `assets/works/${w.img}.webp` : `assets/video/${w.video}.jpg`;
const media = (w, small) => w.video
  ? `<video src="assets/video/${w.video}.mp4" poster="assets/video/${w.video}.jpg" muted loop playsinline preload="none" data-autoplay></video>`
  : `<img src="${small ? thumb(w) : full(w)}" alt="${w.title}, ${w.category.toLowerCase()} in clay" loading="lazy">`;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  $$("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  // Header: solid after scrolling, hides on scroll down
  const header = $(".site-header");
  let lastY = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    header.classList.toggle("scrolled", y > 40);
    header.classList.toggle("hide", y > lastY && y > 300 && !document.body.classList.contains("menu-open"));
    lastY = y;
  }, { passive: true });

  // Full-screen menu
  const mb = $(".menu-btn");
  mb.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    mb.setAttribute("aria-expanded", open);
    $$(".menu a").forEach((a, i) => (a.style.transitionDelay = open ? `${80 + i * 60}ms` : "0ms"));
  });
  addEventListener("keydown", e => { if (e.key === "Escape") document.body.classList.remove("menu-open"); });

  if (page === "home") home();
  if (page === "gallery") gallery();
  if (page === "work") work();
  if (page === "contact") contact();
  if ($(".slider")) slider();

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  $$(".reveal").forEach(el => io.observe(el));

  // Videos play only while visible
  const vio = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()), { threshold: .2 });
  $$("video[data-autoplay]").forEach(v => vio.observe(v));

  // Image strip above footer
  const track = $(".strip-track");
  if (track) {
    const imgs = window.WORKS.map(w => `<img src="${thumb(w)}" alt="" loading="lazy">`).join("");
    track.innerHTML = imgs + imgs;
  }
});

// ---------- Home ----------
function home() {
  const W = window.WORKS, by = s => W.find(w => w.slug === s);

  // Floating, tilted artworks around the hero and the drift section.
  // [slug, left %, top %, width px, rotateY, rotateZ, parallax speed]
  const heroFloats = [
    ["heritage-mask", 43, 9, 120, -8, 2, .35],
    ["boy-relief", 6, 22, 150, 22, -6, .55],
    ["the-warrior", 82, 18, 140, -24, 6, .45],
    ["seated-cat", 8, 78, 130, 10, -3, .7],
    ["cornrows", 44, 82, 150, 0, -2, .8],
    ["the-elder", 80, 74, 120, -12, 4, .6],
  ];
  const driftFloats = [
    ["the-labourer", 8, 10, 170, 0, 0, .5],
    ["profile-study", 26, 34, 140, 0, 0, .9],
    ["the-fallen", 70, 6, 150, 0, 0, .7],
    ["heritage-mask", 86, 30, 120, 0, 0, 1.1],
    ["boy-relief", 60, 88, 190, 0, 0, .4],
    ["seated-cat", 6, 70, 150, 0, 0, .8],
    ["cornrows", 80, 68, 160, 0, 0, .6],
  ];
  const place = (host, list) => list.map(([slug, x, y, w, ry, rz, sp]) => {
    const f = document.createElement("a");
    f.className = "float"; f.href = `work.html?p=${slug}`;
    f.style.cssText = `left:${x}%;top:${y}%;width:${w}px;aspect-ratio:4/5;transform:perspective(900px) rotateY(${ry}deg) rotateZ(${rz}deg)`;
    f.innerHTML = `<img src="${thumb(by(slug))}" alt="${by(slug).title}" loading="lazy">`;
    f.dataset.sp = sp; f.dataset.base = f.style.transform;
    if (innerWidth < 700) { f.style.width = `${w * .6}px`; }
    host.appendChild(f);
    return f;
  });
  const hero = $(".hero"), drift = $(".drift"), header = $(".site-header");
  const floats = [...place(hero, heroFloats), ...place(drift, driftFloats)];

  // Words in the drift paragraph light up as you scroll
  const p = $(".drift-text p");
  p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" ");
  const words = $$(".w", p);

  // Organic, never-repeating drift for each floating image.
  // Every float gets its own random amplitudes, speeds and phases; summing two
  // sine waves with unrelated frequencies keeps the paths from looking looped.
  const rnd = (a, b) => a + Math.random() * (b - a);
  floats.forEach((f, i) => {
    f._m = {
      ax: rnd(14, 34), ay: rnd(16, 38),             // drift distance (px)
      fx: rnd(.05, .12), fy: rnd(.04, .1),          // drift speed (Hz)
      gx: rnd(.13, .23), gy: rnd(.11, .21),         // second wave for irregularity
      px: rnd(0, 6.3), py: rnd(0, 6.3), pr: rnd(0, 6.3),
      rz: rnd(1.5, 4.5), rt: rnd(3, 8),             // rotation and 3D tilt sway (deg)
      depth: rnd(.4, 1.2),                          // mouse parallax depth
      hover: 0, shown: 0, delay: 150 + i * 110,
    };
    f.addEventListener("pointerenter", () => (f._m.over = true));
    f.addEventListener("pointerleave", () => (f._m.over = false));
  });

  let mx = 0, my = 0, smx = 0, smy = 0, sy = scrollY;
  addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

  const t0 = performance.now();
  const tick = now => {
    const t = (now - t0) / 1000;
    sy += (scrollY - sy) * .12;                      // smoothed scroll
    smx += (mx - smx) * .05; smy += (my - smy) * .05; // smoothed mouse
    floats.forEach(f => {
      const m = f._m, host = f.parentElement;
      m.shown += ((now - t0 > m.delay ? 1 : 0) - m.shown) * .06;
      m.hover += ((m.over ? 1 : 0) - m.hover) * .12;
      const k = Math.PI * 2;
      const dx = reduced ? 0 : m.ax * (Math.sin(t * m.fx * k + m.px) * .7 + Math.sin(t * m.gx * k + m.py) * .3);
      const dy = reduced ? 0 : m.ay * (Math.cos(t * m.fy * k + m.py) * .7 + Math.sin(t * m.gy * k + m.px) * .3);
      const rz = reduced ? 0 : m.rz * Math.sin(t * m.fx * .8 * k + m.pr);
      const rx = reduced ? 0 : m.rt * Math.sin(t * m.fy * .9 * k + m.px);
      const ry = reduced ? 0 : m.rt * Math.cos(t * m.gx * .6 * k + m.pr);
      const par = reduced ? 0 : -(sy - host.offsetTop) * f.dataset.sp * .5;
      const mxp = smx * 60 * m.depth, myp = smy * 40 * m.depth;
      const sc = (.88 + .12 * m.shown) * (1 + .07 * m.hover);
      f.style.opacity = m.shown.toFixed(3);
      f.style.zIndex = m.over ? 4 : 1;
      f.style.transform = `translate3d(${(dx + mxp).toFixed(2)}px, ${(dy + myp + par + (1 - m.shown) * 30).toFixed(2)}px, 0) ${f.dataset.base} rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const onScroll = () => {
    // Charcoal background as soon as scrolling begins; header follows while over it
    document.body.classList.toggle("hero-dark", scrollY > 8);
    const darkEnd = drift.offsetTop + drift.offsetHeight - header.offsetHeight;
    document.body.classList.toggle("header-dark", scrollY > 8 && scrollY < darkEnd);
    const r = drift.getBoundingClientRect();
    const prog = Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / (r.height * .7)));
    const n = Math.round(prog * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < n));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ---------- Artwork slider ----------
function slider() {
  const s = $(".slider"), wrap = $(".slider-wrap");
  if (!s.children.length) window.WORKS.forEach(w => {
    s.insertAdjacentHTML("beforeend", `<a class="slide" href="work.html?p=${w.slug}">
      <div class="ph">${media(w, true)}</div>
      <h3>${w.title} <span class="it">— ${w.format}</span></h3>
      <span class="it-sm">${w.category}</span></a>`);
  });
  let i = 0;
  const step = () => s.children[0].getBoundingClientRect().width + 20;
  const max = () => Math.max(0, Math.ceil((s.scrollWidth - wrap.clientWidth) / step()));
  const go = d => { i = Math.min(max(), Math.max(0, i + d)); s.style.transform = `translateX(${-i * step()}px)`; };
  $(".slider-nav .prev")?.addEventListener("click", () => go(-1));
  $(".slider-nav .next")?.addEventListener("click", () => go(1));
}

// ---------- Gallery ----------
function gallery() {
  const g = $(".gallery");
  window.WORKS.forEach(w => g.insertAdjacentHTML("beforeend", `<a class="card reveal" data-cat="${w.cat}" href="work.html?p=${w.slug}">
    <div class="ph">${media(w, true)}</div>
    <h3>${w.title} <span class="it">— ${w.format}</span></h3>
    <span class="it-sm">${w.category}</span></a>`));
  const btns = $$(".filters button");
  btns.forEach(b => b.addEventListener("click", () => {
    btns.forEach(x => x.classList.toggle("active", x === b));
    $$(".gallery .card").forEach(c => (c.style.display = b.dataset.f === "all" || c.dataset.cat === b.dataset.f ? "" : "none"));
  }));
}

// ---------- Work detail ----------
function work() {
  const W = window.WORKS;
  const i = Math.max(0, W.findIndex(w => w.slug === new URLSearchParams(location.search).get("p")));
  const w = W[i], next = W[(i + 1) % W.length];
  document.title = `${w.title} | Boboarts`;
  $(".page-head").innerHTML = `<div><span class="it-sm">${w.category}</span><h1 class="h-xl" style="margin-top:10px">${w.title}</h1></div>
    <a class="pill" href="gallery.html">All works <span class="arr">↗</span></a>`;
  $(".detail").innerHTML = `
    <div class="media">${w.video
      ? `<video src="assets/video/${w.video}.mp4" poster="assets/video/${w.video}.jpg" controls playsinline loop muted data-autoplay></video>`
      : `<img src="${full(w)}" alt="${w.title}, ${w.category.toLowerCase()} in clay">`}</div>
    <div class="meta">
      <p class="info">${w.info}</p>
      <dl class="kv"><dt>Category</dt><dd>${w.category}</dd><dt>Format</dt><dd>${w.format}</dd><dt>Medium</dt><dd>Clay, hand-sculpted</dd></dl>
      <a class="pill solid" href="contact.html?commission=${encodeURIComponent(w.category)}">Commission something similar <span class="arr">↗</span></a>
      <a class="card" href="work.html?p=${next.slug}" style="margin-top:56px;max-width:220px">
        <span class="it-sm">Next work</span>
        <div class="ph" style="margin-top:10px;aspect-ratio:4/5">${media(next, true)}</div>
        <h3>${next.title}</h3></a>
    </div>`;
}

// ---------- Contact ----------
function contact() {
  const form = $("#enquiry"), sel = form.querySelector("[name=type]");
  const want = new URLSearchParams(location.search).get("commission");
  if (want) { const o = [...sel.options].find(o => o.text.toLowerCase() === want.toLowerCase()); if (o) sel.value = o.value; }
  // No backend yet: open the visitor's mail app with the message filled in.
  // To collect messages instead, give the form an action (e.g. Formspree) and method="POST".
  form.addEventListener("submit", e => {
    if (form.getAttribute("action")) return;
    e.preventDefault();
    const d = new FormData(form);
    const body = [`Name: ${d.get("name")}`, `Email: ${d.get("email")}`, `Phone: ${d.get("phone") || "-"}`, `Commission: ${d.get("type")}`, `Size / budget: ${d.get("budget") || "-"}`, "", d.get("message")].join("\n");
    location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent("Commission enquiry: " + d.get("type"))}&body=${encodeURIComponent(body)}`;
  });
}
