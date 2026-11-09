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
  const hero = $(".hero"), drift = $(".drift");
  const floats = [...place(hero, heroFloats), ...place(drift, driftFloats)];

  // Words in the drift paragraph light up as you scroll
  const p = $(".drift-text p");
  p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" ");
  const words = $$(".w", p);

  const onScroll = () => {
    const y = scrollY;
    if (!reduced) floats.forEach(f => {
      const host = f.parentElement, top = host.offsetTop;
      f.style.transform = `translateY(${-(y - top) * f.dataset.sp * .5}px) ${f.dataset.base}`;
    });
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
