// Boboarts: shared behaviour

// ---- Theme preview switcher ----
// Remove this block (and the .theme-switcher CSS) once a palette is chosen.
(function () {
  const themes = [
    { id: "kiln", label: "Kiln", bg: "#151312", accent: "#b87a50" },
    { id: "terracotta", label: "Terra", bg: "#171717", accent: "#c8693c" },
    { id: "earth", label: "Earth", bg: "#1a1511", accent: "#a87650" },
    { id: "sand", label: "Sand", bg: "#ebe3d8", accent: "#9b5732" },
  ];
  const root = document.documentElement;
  const fromUrl = new URLSearchParams(location.search).get("theme");
  let current = themes.some(t => t.id === fromUrl) ? fromUrl : (localStorage.getItem("bobo-theme") || "kiln");
  root.dataset.theme = current;
  document.addEventListener("DOMContentLoaded", () => {
    const box = document.createElement("div");
    box.className = "theme-switcher";
    box.innerHTML = "<p>Colour option</p><div class='opts'></div>";
    const opts = box.querySelector(".opts");
    themes.forEach(t => {
      const b = document.createElement("button");
      b.type = "button"; b.dataset.id = t.id;
      b.innerHTML = `<span class="sw" style="background:linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)"></span>${t.label}`;
      b.onclick = () => { current = t.id; root.dataset.theme = t.id; localStorage.setItem("bobo-theme", t.id); sync(); };
      opts.appendChild(b);
    });
    const sync = () => opts.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.id === current));
    sync();
    document.body.appendChild(box);
  });
})();

const $ = (s, el = document) => el.querySelector(s);
const thumb = w => w.img ? `assets/works/${w.img}-sm.webp` : `assets/video/${w.video}.jpg`;
const full = w => w.img ? `assets/works/${w.img}.webp` : `assets/video/${w.video}.jpg`;
const mediaHTML = (w, small) => w.video
  ? `<video src="assets/video/${w.video}.mp4" poster="assets/video/${w.video}.jpg" muted loop playsinline preload="metadata" data-autoplay></video>`
  : `<img src="${small ? thumb(w) : full(w)}" alt="${w.title}, ${w.category.toLowerCase()} in clay" ${small ? 'loading="lazy"' : ""}>`;

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  // Clock ("Your time")
  const clock = $("[data-clock]");
  const tick = () => clock && (clock.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  tick(); setInterval(tick, 15000);
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  // Mobile menu
  const mb = $(".menu-btn"), nav = $(".nav");
  mb && mb.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    mb.textContent = open ? "Close" : "Menu";
    mb.setAttribute("aria-expanded", open);
  });

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  if (page === "home") home();
  if (page === "works") works();
  if (page === "project") project();
  if (page === "contact") contact();

  // Play videos only while on screen (home handles its own)
  if (page !== "home") {
    const vio = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()), { threshold: .25 });
    document.querySelectorAll("video[data-autoplay]").forEach(v => vio.observe(v));
  }
});

// ---------- Home ----------
function home() {
  const W = window.WORKS;
  const stage = $(".stage"), ticks = $(".ticks"), nameEl = $(".current-name"), capEl = $(".home-bottom .cap");

  // Preloader: count to 100 with scattered thumbnails (once per visit)
  const pre = $(".preloader");
  if (pre) {
    if (sessionStorage.getItem("bobo-loaded") || matchMedia("(prefers-reduced-motion: reduce)").matches) pre.remove();
    else {
      const spots = [[-190, -150], [130, -130], [-230, 30], [190, 40], [-30, 160]];
      spots.forEach(([x, y], i) => {
        const im = document.createElement("img");
        im.src = thumb(W[[1, 5, 6, 4, 9][i]]); im.alt = "";
        im.style.left = `calc(50% + ${x}px - 42px)`; im.style.top = `calc(50% + ${y}px - 52px)`;
        im.style.rotate = `${(i % 2 ? 1 : -1) * (2 + i)}deg`;
        pre.appendChild(im);
      });
      const num = $(".count b", pre), imgs = pre.querySelectorAll("img");
      let n = 0;
      const step = () => {
        n = Math.min(100, n + Math.ceil(Math.random() * 7));
        num.textContent = n;
        imgs.forEach((im, i) => n > (i + 1) * 17 && im.classList.add("show"));
        if (n < 100) setTimeout(step, 45);
        else setTimeout(() => { pre.classList.add("done"); sessionStorage.setItem("bobo-loaded", 1); setTimeout(() => pre.remove(), 800); }, 450);
      };
      setTimeout(step, 200);
    }
  }

  // Build slides
  const tilts = [[-4, 6, -2], [3, -5, 1.5], [-2, -4, -1], [5, 4, 2], [-3, 5, 1], [2, -6, -2]];
  const slides = W.map((w, i) => {
    const a = document.createElement("a");
    a.href = `work.html?p=${w.slug}`;
    a.className = `slide ${w.shape}`;
    a.innerHTML = `<div class="frame">${mediaHTML(w, true)}</div>`;
    a.dataset.tilt = tilts[i % tilts.length].join(",");
    stage.appendChild(a);
    const t = document.createElement("i"); ticks.appendChild(t);
    return a;
  });
  // extra decorative ticks like a ruler
  const tickEls = [...ticks.children];

  const gap = () => slides[0].offsetHeight + Math.max(48, innerHeight * .08);
  let target = 0, pos = 0, active = -1, dragging = false, lastY = 0, moved = 0;
  const N = W.length;
  const wrap = i => ((i % N) + N) % N;

  addEventListener("wheel", e => { target += e.deltaY / gap(); }, { passive: true });
  stage.addEventListener("pointerdown", e => { dragging = true; lastY = e.clientY; moved = 0; });
  addEventListener("pointermove", e => { if (!dragging) return; const d = lastY - e.clientY; moved += Math.abs(d); target += d / gap(); lastY = e.clientY; });
  addEventListener("pointerup", () => { dragging = false; target = Math.round(target); });
  stage.addEventListener("click", e => { if (moved > 6) e.preventDefault(); }, true);
  addEventListener("keydown", e => {
    if (e.key === "ArrowDown") target = Math.round(target) + 1;
    if (e.key === "ArrowUp") target = Math.round(target) - 1;
  });
  // settle on the nearest slide shortly after wheel stops
  let settle; addEventListener("wheel", () => { clearTimeout(settle); settle = setTimeout(() => (target = Math.round(target)), 140); }, { passive: true });

  // Sound toggle
  let soundOn = false;
  const sbtn = $(".sound");
  sbtn.addEventListener("click", () => {
    soundOn = !soundOn;
    sbtn.querySelector("span").textContent = soundOn ? "Sound on" : "Sound off";
    sbtn.querySelector(".x").style.display = soundOn ? "none" : "";
    slides.forEach((s, i) => { const v = s.querySelector("video"); if (v) v.muted = !(soundOn && i === active); });
  });

  function frame() {
    pos += (target - pos) * .09;
    const g = gap();
    slides.forEach((s, i) => {
      // shortest offset on the loop
      let o = i - pos; o = o - N * Math.round(o / N);
      const [rx, ry, rz] = s.dataset.tilt.split(",").map(Number);
      const k = Math.max(-1, Math.min(1, o));
      const x = (i % 2 ? 1 : -1) * 18 * Math.min(1, Math.abs(o));
      s.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${o * g}px), 0) rotateX(${rx * k}deg) rotateY(${ry * (0.4 + Math.abs(k))}deg) rotateZ(${rz * Math.abs(k) * .8}deg)`;
      s.style.zIndex = 100 - Math.round(Math.abs(o) * 10);
      s.style.visibility = Math.abs(o) > 2.2 ? "hidden" : "visible";
    });
    const cur = wrap(Math.round(pos));
    if (cur !== active) {
      active = cur;
      const w = W[cur];
      nameEl.innerHTML = `${w.title}<small>${w.category}</small>`;
      capEl.textContent = w.format;
      tickEls.forEach((t, i) => { t.className = i === cur ? "on" : Math.abs(i - cur) === 1 ? "near" : ""; });
      slides.forEach((s, i) => {
        const v = s.querySelector("video"); if (!v) return;
        if (Math.abs(i - cur) <= 1 || Math.abs(i - cur) === N - 1) { v.muted = !(soundOn && i === cur); v.play().catch(() => {}); } else v.pause();
      });
    }
    requestAnimationFrame(frame);
  }
  frame();
}

// ---------- Works: horizontal strip ----------
function works() {
  const strip = $(".strip");
  const heights = [300, 220, 360, 260, 330, 240, 280, 350, 230, 310, 270, 250];
  window.WORKS.forEach((w, i) => {
    const h = heights[i % heights.length];
    const ratio = w.shape === "land" ? 4 / 3 : w.shape === "tall" ? 9 / 14 : 4 / 5;
    const a = document.createElement("a");
    a.href = `work.html?p=${w.slug}`;
    a.className = "reveal";
    a.innerHTML = `<span>${w.title}</span><div class="frame" style="height:${h}px;width:${Math.round(h * ratio)}px">${mediaHTML(w, true)}</div>`;
    a.style.transitionDelay = `${i * 50}ms`;
    strip.appendChild(a);
  });
  requestAnimationFrame(() => strip.querySelectorAll(".reveal").forEach(el => el.classList.add("in")));

  // Vertical wheel scrolls the strip sideways (desktop)
  if (matchMedia("(min-width: 761px)").matches) {
    let x = 0, tx = 0;
    const max = () => Math.max(0, strip.scrollWidth - innerWidth);
    addEventListener("wheel", e => { tx = Math.max(0, Math.min(max(), tx + e.deltaY + e.deltaX)); }, { passive: true });
    (function loop() { x += (tx - x) * .1; strip.style.transform = `translateX(${-x}px)`; requestAnimationFrame(loop); })();
  }
}

// ---------- Project detail ----------
function project() {
  const W = window.WORKS;
  const slug = new URLSearchParams(location.search).get("p");
  const i = Math.max(0, W.findIndex(w => w.slug === slug));
  const w = W[i], next = W[(i + 1) % W.length];
  document.title = `${w.title} | Boboarts`;
  $(".project").innerHTML = `
    <div class="left">
      <div class="muted">Work</div>
      <h1>${w.title}</h1>
      <dl class="kv">
        <dt>Category</dt><dd>${w.category}</dd>
        <dt>Format</dt><dd>${w.format}</dd>
        <dt>Medium</dt><dd>Clay, hand-sculpted</dd>
      </dl>
      <div class="muted" style="margin-bottom:6px">About the piece</div>
      <p class="info">${w.info}</p>
      <a class="btn" href="contact.html?commission=${encodeURIComponent(w.category)}">Commission something similar</a>
      <div><a class="next" href="work.html?p=${next.slug}"><span class="muted">Next work</span><br>${next.title}<img src="${thumb(next)}" alt=""></a></div>
    </div>
    <div class="media">${w.video
      ? `<video src="assets/video/${w.video}.mp4" poster="assets/video/${w.video}.jpg" controls playsinline loop muted data-autoplay></video>`
      : `<img src="${full(w)}" alt="${w.title}, ${w.category.toLowerCase()} in clay">`}</div>`;
}

// ---------- Contact form ----------
function contact() {
  const form = $("#enquiry");
  const want = new URLSearchParams(location.search).get("commission");
  const sel = form.querySelector("[name=type]");
  if (want) {
    const match = [...sel.options].find(o => o.value.toLowerCase() === want.toLowerCase() || o.text.toLowerCase() === want.toLowerCase());
    if (match) sel.value = match.value;
  }
  // No backend yet: open the visitor's mail app with the message filled in.
  // To collect messages instead, give the form an action (e.g. Formspree) and method="POST".
  form.addEventListener("submit", e => {
    if (form.getAttribute("action")) return;
    e.preventDefault();
    const d = new FormData(form);
    const body = [`Name: ${d.get("name")}`, `Email: ${d.get("email")}`, `Phone: ${d.get("phone") || "-"}`, `Commission: ${d.get("type")}`, "", d.get("message")].join("\n");
    location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent("Commission enquiry: " + d.get("type"))}&body=${encodeURIComponent(body)}`;
  });
}
