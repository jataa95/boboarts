// Boboarts: shared behaviour

// ---- Theme preview switcher ----
// Remove this block (and the .theme-switcher CSS) once a palette is chosen.
(function () {
  const themes = [
    { id: "kiln", label: "Kiln", bg: "#151312", accent: "#b87a50" },
    { id: "terracotta", label: "Terra", bg: "#171717", accent: "#c8693c" },
    { id: "earth", label: "Earth", bg: "#1a1511", accent: "#a87650" },
    { id: "sand", label: "Sand", bg: "#e8ded1", accent: "#9b5732" },
  ];
  const root = document.documentElement;
  const fromUrl = new URLSearchParams(location.search).get("theme");
  let current = themes.some(t => t.id === fromUrl) ? fromUrl : (localStorage.getItem("bobo-theme") || "kiln");
  root.dataset.theme = current;

  const box = document.createElement("div");
  box.className = "theme-switcher";
  box.innerHTML = "<p>Colour option</p><div class='opts'></div>";
  const opts = box.querySelector(".opts");
  themes.forEach(t => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<span class="sw" style="background:linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)"></span>${t.label}`;
    b.onclick = () => {
      current = t.id;
      root.dataset.theme = t.id;
      localStorage.setItem("bobo-theme", t.id);
      sync();
    };
    b.dataset.id = t.id;
    opts.appendChild(b);
  });
  function sync() { opts.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.id === current)); }
  sync();
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(box));
})();

document.addEventListener("DOMContentLoaded", () => {
  // Footer year
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "Close" : "Menu";
  });

  // Reveal on scroll
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  // Autoplay process videos only while visible
  const vio = new IntersectionObserver(entries => entries.forEach(e => {
    e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause();
  }), { threshold: 0.3 });
  document.querySelectorAll("video[data-autoplay]").forEach(v => vio.observe(v));

  // Gallery filters
  const chips = document.querySelectorAll(".chip");
  chips.forEach(c => c.addEventListener("click", () => {
    chips.forEach(x => x.classList.remove("active"));
    c.classList.add("active");
    const f = c.dataset.filter;
    document.querySelectorAll(".gallery .work").forEach(w => {
      w.style.display = f === "all" || w.dataset.cat === f ? "" : "none";
    });
  }));

  // Lightbox
  const works = document.querySelectorAll(".work");
  if (works.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = '<button aria-label="Close">×</button><img alt=""><p></p>';
    document.body.appendChild(lb);
    const img = lb.querySelector("img"), cap = lb.querySelector("p");
    const close = () => lb.classList.remove("open");
    works.forEach(w => {
      w.tabIndex = 0;
      const open = () => {
        const i = w.querySelector("img");
        img.src = i.dataset.full || i.src;
        img.alt = i.alt;
        cap.textContent = w.querySelector("strong")?.textContent || "";
        lb.classList.add("open");
      };
      w.addEventListener("click", open);
      w.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
    });
    lb.addEventListener("click", e => { if (e.target !== img) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  // Contact form: prefill from ?commission=...
  const form = document.querySelector("#commission-form");
  if (form) {
    const want = new URLSearchParams(location.search).get("commission");
    const sel = form.querySelector("[name=type]");
    if (want && sel) [...sel.options].forEach(o => { if (o.value === want) sel.value = want; });

    // No backend yet: open the visitor's mail app with the message filled in.
    // To collect messages instead, point the form's action at a service such as Formspree.
    form.addEventListener("submit", e => {
      if (form.getAttribute("action")) return;
      e.preventDefault();
      const d = new FormData(form);
      const body = [
        `Name: ${d.get("name")}`,
        `Email: ${d.get("email")}`,
        `Phone: ${d.get("phone") || "-"}`,
        `Commission: ${d.get("type")}`,
        `Size / budget: ${d.get("budget") || "-"}`,
        "",
        d.get("message"),
      ].join("\n");
      location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent("Commission enquiry: " + d.get("type"))}&body=${encodeURIComponent(body)}`;
    });
  }
});
