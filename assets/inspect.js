// The page measures itself.
// - Inspect: loads measure.js into this page. Pointing at or tabbing to an element draws its
//   measured box and the gap to its next sibling. A strip shows the page's own audit.
// - Ship a bug: injects one real defect into this page, measures it with measure.js, and shows
//   the finding in the hero report until "Fix it" removes it.
(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const raf = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // measure.js puts its helpers on window. Load it once, on first use.
  let ready = null;
  const helpers = () => ready || (ready = new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = "assets/measure.js"; s.onload = ok; s.onerror = () => fail(new Error("measure.js did not load"));
    document.head.appendChild(s);
  }));

  // ---------- Inspect ----------
  const btn = $("#inspect"), strip = $("#audit"), layer = $("#insp");
  let on = false, target = null, frame = 0;

  const textEls = () => [...document.querySelectorAll("main *, header *, footer *")].filter((el) => {
    if (el.closest("#insp, #audit, iframe") || !el.getClientRects().length) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.opacity === "0") return false;
    return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  });

  function audit() {
    const o = overflowing().length;
    const t = smallTargets().length;
    let low = null;
    for (const el of textEls()) {
      const r = contrast(getComputedStyle(el).color, backgroundOf(el));
      if (!low || r < low.r) low = { r, el };
    }
    const ls = layoutShift();
    strip.querySelector("[data-a=o]").textContent = o;
    strip.querySelector("[data-a=t]").textContent = t;
    strip.querySelector("[data-a=c]").textContent = low ? `${low.r}:1` : "n/a";
    strip.querySelector("[data-a=l]").textContent = ls ? ls.total.toFixed(3) : "not reported";
    for (const [k, bad] of [["o", o > 0], ["t", t > 0], ["c", low && low.r < 4.5], ["l", ls && ls.total >= 0.1]])
      strip.querySelector(`[data-a=${k}]`).closest("span").classList.toggle("bad", !!bad);
  }

  function draw() {
    frame = 0;
    layer.replaceChildren();
    if (!on || !target || !target.isConnected) return;
    const r = target.getBoundingClientRect();
    if (!r.width && !r.height) return;
    const box = document.createElement("div");
    box.className = "ib";
    Object.assign(box.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    const tag = document.createElement("div");
    tag.className = "it";
    tag.textContent = `${label(target).split(" ")[0]}  ${Math.round(r.width * 2) / 2} × ${Math.round(r.height * 2) / 2}`;
    tag.style.left = Math.max(4, Math.min(r.left, innerWidth - 260)) + "px";
    tag.style.top = (r.top > 28 ? r.top - 24 : r.bottom + 4) + "px";
    layer.append(box, tag);
    // The gap to the next sibling, from gaps().
    const next = target.nextElementSibling;
    if (next && next.getClientRects().length) {
      target.setAttribute("data-uxq-pair", ""); next.setAttribute("data-uxq-pair", "");
      try {
        const [g] = gaps("[data-uxq-pair]");
        const n = next.getBoundingClientRect();
        const below = n.top >= r.bottom - 1;
        const v = below ? g.y : g.x;
        const d = document.createElement("div");
        d.className = "ig";
        if (below) Object.assign(d.style, { left: Math.max(r.left, n.left) + 16 + "px", top: r.bottom + "px", width: "1px", height: Math.max(1, v) + "px" });
        else Object.assign(d.style, { left: r.right + "px", top: r.top + r.height / 2 + "px", width: Math.max(1, v) + "px", height: "1px" });
        const gl = document.createElement("div");
        gl.className = "it gap";
        gl.textContent = `gap ${v}px`;
        gl.style.left = (below ? Math.max(r.left, n.left) + 24 : r.right + Math.max(1, v) / 2 - 26) + "px";
        gl.style.top = (below ? r.bottom + Math.max(1, v) / 2 - 9 : r.top + r.height / 2 + 6) + "px";
        layer.append(d, gl);
      } catch {}
      target.removeAttribute("data-uxq-pair"); next.removeAttribute("data-uxq-pair");
    }
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };

  async function setInspect(v) {
    if (v) await helpers();
    on = v;
    btn.setAttribute("aria-pressed", String(on));
    strip.hidden = !on;
    document.body.classList.toggle("inspecting", on);
    if (on) audit(); else { target = null; layer.replaceChildren(); }
  }
  btn.addEventListener("click", () => setInspect(!on));
  document.addEventListener("pointermove", (e) => {
    if (!on) return;
    const el = e.target.closest ? e.target : null;
    if (!el || el.closest("#insp, #audit")) return;
    if (el !== target) { target = el; schedule(); }
  }, { passive: true });
  document.addEventListener("focusin", (e) => { if (on && !e.target.closest("#audit")) { target = e.target; schedule(); } });
  addEventListener("scroll", () => on && schedule(), { passive: true });
  addEventListener("resize", () => { if (on) { schedule(); audit(); } });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && on) setInspect(false); });
  $("#audit-close").addEventListener("click", () => { setInspect(false); btn.focus(); });
  new MutationObserver(() => on && setTimeout(audit, 50)).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  // ---------- Ship a bug ----------
  const ship = $("#ship"), fix = $("#fixit");
  const theme = () => document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  let injected = null, k = 0;

  const BUGS = [
    {
      rule: "no-interaction-shift", sev: "medium", surface: "Hero, Try the bug lab button",
      async run() {
        const css = ".cta .btn-primary.uxq-hover{padding:0 26px}";
        const st = inject(css);
        snapshot(".cta .btn", "ship-rest");
        $(".cta .btn-primary").classList.add("uxq-hover");
        await raf();
        snapshot(".cta .btn", "ship-hover");
        const res = moved("ship-rest", "ship-hover");
        return { st, cleanup: () => $(".cta .btn-primary").classList.remove("uxq-hover"),
          evidence: `The hover style adds 8px of padding on each side. moved("rest", "hover") returns ${res.map((m) => `${m.el.split(" ")[0]} (${[m.dx && `dx ${m.dx}px`, m.dw && `dw +${m.dw}px`].filter(Boolean).join(", ")})`).join(" and ")}.`,
          fix: "Keep the padding the same on hover. Change only the fill.", ok: res.length > 0 };
      },
    },
    {
      rule: "targets-and-shift", sev: "medium", surface: "Page, announcement banner",
      async run() {
        const before = layoutShift();
        const b = document.createElement("div");
        b.className = "late-banner"; b.innerHTML = "<strong>New in the bug lab</strong><span>Nine demos, each with the bug and the fix.</span>";
        await wait(800); // later than 500 ms after the click, so the shift counts
        $("main").prepend(b);
        await wait(500);
        const after = layoutShift();
        const d = after && before ? Math.round((after.total - before.total) * 1000) / 1000 : null;
        return { cleanup: () => b.remove(),
          evidence: d === null ? "This browser does not report layout-shift entries, so layoutShift() returns null." : `The banner arrives 800ms after the click with no space saved for it. layoutShift() rises by ${d}. The limit for the page is 0.1${d >= 0.1 ? "" : ", so at this size it passes"}.`,
          fix: "Save the banner's height before it loads, or show it over the content.", ok: d !== null && d >= 0.1 };
      },
    },
    {
      rule: "theme-contrast", sev: "high", surface: "Hero, intro paragraph",
      async run() {
        const gray = theme() === "dark" ? "#4a4c53" : "#9a9ca3";
        const st = inject(`.hero .lede{color:${gray}!important}`);
        await raf();
        const [r] = textContrast(".hero .lede");
        return { st, evidence: `A hard-coded ${gray} on the ${theme()} theme. textContrast(".lede") returns ${r.ratio}:1 (${r.fg} on ${r.bg}). Body text needs 4.5:1.`,
          fix: "Use the --ink-2 token, which has a value for each theme.", ok: r.ratio < 4.5 };
      },
    },
    {
      rule: "no-horizontal-overflow", sev: "medium", surface: "Get started, install commands",
      async run() {
        const st = inject(".install .code code{white-space:pre!important;overflow-wrap:normal!important}");
        await raf();
        const res = overflowing().filter((x) => /pre\.code|code/.test(x.el));
        return { st, evidence: res.length ? `overflowing() returns ${res.length} code blocks, the widest with scrollWidth ${Math.max(...res.map((x) => x.scrollWidth))} and clientWidth ${res[0].clientWidth}. The command scrolls sideways.` : "overflowing() found nothing at this width.",
          fix: "Let long commands wrap, or give the block a visible scroll edge.", ok: res.length > 0 };
      },
    },
  ];
  function inject(css) { const s = document.createElement("style"); s.dataset.ship = ""; s.textContent = css; document.head.appendChild(s); return s; }

  async function shipBug() {
    ship.disabled = true; ship.setAttribute("aria-busy", "true");
    $("#hero-meta").textContent = "Shipping a bug to this page…";
    window.uxqShipped = true;
    if (injected) undo();
    const bug = BUGS[k++ % BUGS.length];
    try {
      await helpers();
      const r = await bug.run();
      injected = { bug, ...r };
      const sev = bug.sev[0].toUpperCase() + bug.sev.slice(1);
      $("#hero-meta").textContent = `Checked this page after the change. ${r.ok ? "1 finding." : "No finding."}`;
      $("#hero-findings").innerHTML = `<li><span class="sev ${bug.sev}">${sev}</span><span class="rid">${bug.rule}</span><span class="surf">${esc(bug.surface.split(",")[0])}</span></li>`;
      $("#hero-detail").innerHTML = `<dl><dt>Surface</dt><dd>${esc(bug.surface)}</dd><dt>Rule</dt><dd><code>${bug.rule}</code></dd><dt>Evidence</dt><dd>${esc(r.evidence)}</dd><dt>Fix</dt><dd>${esc(r.fix)}</dd></dl>`;
      fix.hidden = false;
      ship.querySelector("span").textContent = "Ship another bug";
      if (bug.rule === "no-horizontal-overflow") document.querySelector("#start").scrollIntoView({ block: "center" });
    } finally {
      ship.disabled = false; ship.removeAttribute("aria-busy");
    }
  }
  function undo() {
    if (!injected) return;
    injected.st && injected.st.remove();
    injected.cleanup && injected.cleanup();
    injected = null;
  }
  ship.addEventListener("click", shipBug);
  fix.addEventListener("click", () => {
    undo();
    window.uxqShipped = false;
    fix.hidden = true;
    ship.querySelector("span").textContent = "Ship a bug";
    ship.focus();
    window.uxqRunHero && window.uxqRunHero();
  });
})();
