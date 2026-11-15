(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const { base, runtime, demos } = window.UXQ_DEMOS;
  const CATALOG = window.UXQ_CATALOG;
  const MEASURE_URL = new URL("assets/measure.js", location.href).href;
  const SEVERITY = { "pending-write": "high", "dark-contrast": "high", "hover-shift": "medium", "ragged-column": "medium", "cramped-chips": "medium",
    "tiny-targets": "medium", "late-banner": "medium", "phone-overflow": "medium", "stray-corners": "low" };
  const URLS = { "hover-shift": "localhost:5173/inbox", "ragged-column": "localhost:5173/files", "cramped-chips": "localhost:5173/tasks",
    "dark-contrast": "localhost:5173/billing", "tiny-targets": "localhost:5173/notes", "late-banner": "localhost:5173/overview",
    "phone-overflow": "localhost:5173/share", "pending-write": "localhost:5173/review", "stray-corners": "localhost:5173/settings" };

  // ---------- theme ----------
  const media = matchMedia("(prefers-color-scheme: dark)");
  const theme = () => document.documentElement.dataset.theme || (media.matches ? "dark" : "light");
  const themeBtn = $("#theme");
  const syncThemeBtn = () => themeBtn.setAttribute("aria-label", theme() === "dark" ? "Switch to light theme" : "Switch to dark theme");
  syncThemeBtn();
  themeBtn.addEventListener("click", () => {
    const next = theme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("uxq-theme", next); } catch {}
    syncThemeBtn();
    onTheme();
  });
  media.addEventListener("change", () => { if (!document.documentElement.dataset.theme) { syncThemeBtn(); onTheme(); } });

  // ---------- syntax highlight (js, json, bash) ----------
  const KW = new Set(["const", "let", "var", "return", "await", "async", "new", "true", "false", "null", "if", "else", "for", "of", "function"]);
  function hl(src, lang) {
    if (lang === "bash") {
      return src.split("\n").map((line) => {
        if (/^\s*#/.test(line)) return `<span class="t-c">${esc(line)}</span>`;
        return line.split(/(\s+)/).map((w, i) => {
          if (/^\s+$/.test(w)) return w;
          if (i === 0) return `<span class="t-f">${esc(w)}</span>`;
          if (/^-/.test(w)) return `<span class="t-k">${esc(w)}</span>`;
          if (/^(https?:|~|\/)/.test(w) || w.includes("/")) return `<span class="t-s">${esc(w)}</span>`;
          return esc(w);
        }).join("");
      }).join("\n");
    }
    const re = /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(\s*\()?|([{}[\]().,:;=>+\-*/…])/g;
    let out = "", last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      last = re.lastIndex;
      if (m[1]) out += `<span class="t-c">${esc(m[1])}</span>`;
      else if (m[2]) {
        const after = src.slice(re.lastIndex).match(/^\s*:/);
        out += `<span class="${after && lang === "json" ? "t-a" : "t-s"}">${esc(m[2])}</span>`;
      } else if (m[3]) out += `<span class="t-n">${m[3]}</span>`;
      else if (m[4]) {
        const isKey = /^\s*:/.test(src.slice(re.lastIndex)) && !m[5];
        if (KW.has(m[4])) out += `<span class="t-k">${m[4]}</span>`;
        else if (m[5]) out += `<span class="t-f">${m[4]}</span>${esc(m[5])}`;
        else if (isKey) out += `<span class="t-a">${m[4]}</span>`;
        else out += esc(m[4]);
      } else if (m[6]) out += `<span class="t-p">${esc(m[6])}</span>`;
    }
    return out + esc(src.slice(last));
  }
  for (const c of document.querySelectorAll("pre code[class*=language-]")) {
    const lang = c.className.match(/language-(\w+)/)[1];
    c.innerHTML = hl(c.textContent, lang);
  }

  // ---------- redline measurements: the tags show each element's measured box ----------
  const measureMarks = () => {
    for (const el of document.querySelectorAll("[data-measure]")) { const r = el.getBoundingClientRect(); el.dataset.tag = `${Math.round(r.width)} × ${Math.round(r.height)}`; }
    for (const d of document.querySelectorAll(".dim")) { const h = d.parentElement.querySelector("h2"); d.querySelector("b").textContent = `${Math.round(h.getBoundingClientRect().width)}px`; }
  };
  for (const h of document.querySelectorAll("#lab .section-head h2")) {
    const w = document.createElement("div"); w.className = "dim-wrap"; h.before(w); w.appendChild(h);
    const d = document.createElement("div"); d.className = "dim"; d.setAttribute("aria-hidden", "true"); d.innerHTML = "<i></i><b></b>"; w.appendChild(d);
  }
  new ResizeObserver(measureMarks).observe(document.body);
  document.fonts && document.fonts.ready.then(measureMarks);

  // ---------- phone menu ----------
  const menuBtn = $("#menu-btn"), sheet = $("#menu-sheet");
  const setMenu = (open) => { sheet.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open)); if (open) sheet.querySelector("a").focus(); };
  menuBtn.addEventListener("click", () => setMenu(sheet.hidden));
  sheet.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener("click", (e) => { if (!sheet.hidden && !e.target.closest("#menu-sheet, #menu-btn")) setMenu(false); });

  // ---------- permalinks ----------
  const LINK = '<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true" focusable="false"><path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0Z"/></svg>';
  const addPermalink = (h) => {
    if (!h.id || h.querySelector(".permalink")) return;
    const a = document.createElement("a");
    a.className = "permalink"; a.href = "#" + h.id; a.setAttribute("aria-label", "Permalink to this section"); a.innerHTML = LINK;
    h.appendChild(a);
  };
  document.querySelectorAll("h2[id], h3[id], h4[id]").forEach(addPermalink);

  // ---------- frames ----------
  function srcdoc(demo, mode, th) {
    return `<!doctype html><html lang="en" class="${mode}" data-theme="${th}" data-demo="${demo.id}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(demo.title)}</title><style>${base}${demo.css}</style></head><body>${demo.body}<script src="${MEASURE_URL}"><\/script><script>${runtime}${demo.script || ""}<\/script></body></html>`;
  }
  // Make a frame and resolve with its window once measure.js is ready.
  function mount(box, demo, mode, th) {
    return new Promise((resolve, reject) => {
      const f = document.createElement("iframe");
      f.title = `${demo.title} (${mode === "bug" ? "with the bug" : "fixed"})`;
      f.style.height = demo.height + "px";
      if (!demo.phone) f.style.width = "100%";
      f.addEventListener("load", () => {
        const w = f.contentWindow;
        if (typeof w.gaps !== "function") return reject(new Error("measure.js did not load in the frame"));
        resolve({ frame: f, w });
      }, { once: true });
      f.srcdoc = srcdoc(demo, mode, th);
      box.replaceChildren(f);
    });
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function measure(demo, w) {
    if (demo.reload) await wait(Math.max(0, 1500 - (performance.now() - w.__mountedAt)));
    const r = await demo.run(w);
    return { call: r.call || demo.call, result: r.result, dom: r.dom };
  }

  // ---------- lab ----------
  const rail = $("#rail");
  rail.innerHTML = demos.map((d, i) => `<li><button class="rail-item" type="button" data-id="${d.id}" aria-current="false"><span class="num">${i + 1}</span><span class="rid">${d.rule}</span><span class="rt">${esc(d.title)}</span></button></li>`).join("");
  const pick = $("#pick");
  pick.innerHTML = demos.map((d, i) => `<option value="${d.id}">${d.rule}</option>`).join("");
  pick.addEventListener("change", () => { state.id = pick.value; history.replaceState(null, "", "#demo-" + state.id); load(); });
  const step = (k) => { const i = (demos.findIndex((d) => d.id === state.id) + k + demos.length) % demos.length; state.id = demos[i].id; history.replaceState(null, "", "#demo-" + state.id); load(); };
  $("#prev").addEventListener("click", () => step(-1));
  $("#next").addEventListener("click", () => step(1));
  const state = { id: demos[0].id, mode: "bug", token: 0, w: null };
  const demoById = (id) => demos.find((d) => d.id === id);

  function renderOut(demo, r, status) {
    const call = r ? r.call : demo.call;
    let text = call;
    if (r) {
      text += "\n// returns\n" + JSON.stringify(r.result, null, 2);
      if (r.dom) text += "\n// DOM read, not a measure.js helper\n" + JSON.stringify(r.dom, null, 2);
    }
    $("#out-code").innerHTML = hl(text, "js");
    const st = $("#out-state");
    st.textContent = status.text; st.className = "out-state " + (status.tone || "");
  }
  function renderFinding(demo, r) {
    const el = $("#finding");
    if (!r) { el.className = "finding"; el.innerHTML = `<p class="finding-head">Finding</p><p>Measuring…</p>`; return; }
    const f = demo.finding(r.result, r);
    if (f && f.skip) { el.className = "finding"; el.innerHTML = `<p class="finding-head">Not checked</p><p>${esc(f.skip)}</p>`; return; }
    if (!f) {
      el.className = "finding good";
      el.innerHTML = `<p class="finding-head"><span class="badge-ok">✓ No finding</span></p><p>The same helper returns no defect for this version of <strong>${esc(demo.surface.split(" (")[0])}</strong>.</p>`;
      return;
    }
    const sev = SEVERITY[demo.id];
    el.className = "finding bad";
    el.innerHTML = `<p class="finding-head"><span class="sev ${sev}">${sev[0].toUpperCase() + sev.slice(1)}</span> Finding</p>
      <dl><dt>Surface</dt><dd>${esc(demo.surface)}</dd><dt>Rule</dt><dd><code>${demo.rule}</code></dd><dt>Evidence</dt><dd>${esc(f.evidence)}</dd><dt>Fix</dt><dd>${esc(f.fix)}</dd></dl>`;
  }

  async function load({ scroll = false } = {}) {
    const demo = demoById(state.id);
    const token = ++state.token;
    for (const b of rail.querySelectorAll(".rail-item")) b.setAttribute("aria-current", String(b.dataset.id === demo.id));
    pick.value = demo.id;
    $("#p-rule").textContent = demo.rule;
    $("#p-group").textContent = demo.group;
    $("#p-title-text").textContent = demo.title;
    $("#p-blurb").textContent = demo.blurb;
    $("#p-url").textContent = URLS[demo.id];
    const pill = $("#p-mode");
    pill.textContent = state.mode === "bug" ? "bug" : "fixed"; pill.className = "mode-pill" + (state.mode === "fixed" ? " fixed" : "");
    for (const b of document.querySelectorAll(".seg button")) b.setAttribute("aria-checked", String(b.dataset.mode === state.mode));
    $("#p-hint").textContent = demo.live ? demo.prompt : demo.themed ? "Runs in light and dark." : demo.reload ? "Measures 1.5s after load." : demo.phone ? "Frame is 360px wide." : "";
    $("#run-label").textContent = demo.live ? "Force hover on row 2" : demo.reload ? "Reload and measure" : "Run check";
    const box = $("#frame-box");
    box.classList.toggle("phone", !!demo.phone);
    const fresh = !$("#out-code").textContent;
    if (fresh) { renderOut(demo, null, { text: "Loading frame" }); renderFinding(demo, null); }
    else { $(".out").classList.add("stale"); $("#finding").classList.add("stale"); $("#out-state").textContent = "Loading frame"; $("#out-state").className = "out-state"; }
    try {
      const { w } = await mount(box, demo, state.mode, theme());
      w.__mountedAt = performance.now();
      if (token !== state.token) return;
      state.w = w;
      await runCheck(token);
    } catch (e) {
      renderOut(demo, null, { text: "Error", tone: "bad" });
      $("#finding").innerHTML = `<p class="finding-head">Could not measure</p><p>${esc(e.message)}. Reload the page to try again.</p>`;
    }
    if (scroll) $("#lab").scrollIntoView({ block: "start" });
  }

  async function runCheck(token = state.token) {
    const demo = demoById(state.id);
    const run = $("#run");
    run.disabled = true; run.setAttribute("aria-busy", "true");
    $(".out").classList.add("stale"); $("#finding").classList.add("stale");
    $("#out-state").textContent = "Running"; $("#out-state").className = "out-state";
    try {
      const t0 = performance.now();
      const r = await measure(demo, state.w);
      const ms = demo.reload ? null : Math.max(1, Math.round(performance.now() - t0));
      if (token !== state.token) return;
      const f = demo.finding(r.result, r);
      renderOut(demo, r, f && !f.skip ? { text: "Finding", tone: "bad" } : f ? { text: "Not reported" } : { text: "Pass", tone: "good" });
      if (ms) $("#out-state").dataset.ms = `${ms} ms`; else delete $("#out-state").dataset.ms;
      renderFinding(demo, r);
      $(".out").classList.remove("stale"); $("#finding").classList.remove("stale");
      if (demo.live && state.w.unforce) setTimeout(() => token === state.token && state.w.unforce(), 1800);
    } catch (e) {
      renderOut(demo, null, { text: "Error", tone: "bad" });
      $("#finding").innerHTML = `<p class="finding-head">Could not measure</p><p>${esc(e.message)}</p>`;
    } finally {
      run.disabled = false; run.removeAttribute("aria-busy");
      $(".out").classList.remove("stale"); $("#finding").classList.remove("stale");
    }
  }

  rail.addEventListener("click", (e) => {
    const b = e.target.closest(".rail-item"); if (!b) return;
    state.id = b.dataset.id;
    history.replaceState(null, "", "#demo-" + state.id);
    load();
  });
  document.querySelector(".seg").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-mode]"); if (!b || b.dataset.mode === state.mode) return;
    state.mode = b.dataset.mode; load();
  });
  document.querySelector(".seg").addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    state.mode = state.mode === "bug" ? "fixed" : "bug"; load();
    requestAnimationFrame(() => document.querySelector(`.seg [data-mode=${state.mode}]`).focus());
  });
  $("#run").addEventListener("click", () => {
    const demo = demoById(state.id);
    if (demo.reload || demo.id === "pending-write") load(); else runCheck();
  });
  // Live results from the hover demo.
  addEventListener("message", (e) => {
    const d = e.data;
    if (!d || !d.uxq || d.type !== "live" || d.demo !== state.id || !state.w || e.source !== state.w) return;
    const demo = demoById(state.id);
    const call = `snapshot(".thread, .list-foot", "rest")\n// row ${d.row} in its ${d.how} state\nsnapshot(".thread, .list-foot", "hover")\nmoved("rest", "hover")`;
    const r = { call, result: d.result };
    renderOut(demo, r, d.result.length ? { text: "Finding", tone: "bad" } : { text: "Pass", tone: "good" });
    const f = demo.finding(d.result);
    if (f) f.evidence = f.evidence.replace("With row 2 hovered", `With row ${d.row} in its ${d.how} state`).replace("Row 2 grows", `Row ${d.row} grows`);
    const el = $("#finding");
    renderFinding({ ...demo, finding: () => f }, r);
    if (!d.result.length) el.querySelector("p:last-child").textContent = `Row ${d.row} in its ${d.how} state moved nothing. The border was already there, so only its color changed.`;
  });

  function onTheme() {
    if (state.w) load();
    runHero();
  }

  // ---------- hero report: run three demos off screen ----------
  window.uxqRunHero = () => runHero();
  const heroDemos = ["pending-write", "dark-contrast", "hover-shift"];
  let heroToken = 0;
  async function runHero() {
    const token = ++heroToken;
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    // On screen but invisible: Chrome pauses animation frames in frames outside the viewport.
    Object.assign(host.style, { position: "fixed", left: "0", top: "0", width: "620px", maxWidth: "100vw", opacity: "0", pointerEvents: "none", zIndex: "-1" });
    document.body.appendChild(host);
    const items = [];
    for (const id of heroDemos) {
      const demo = demoById(id);
      const box = document.createElement("div"); host.appendChild(box);
      try {
        const { w } = await mount(box, demo, "bug", theme());
        w.__mountedAt = performance.now();
        const r = await measure(demo, w);
        const f = demo.finding(r.result, r);
        if (f && !f.skip) items.push({ demo, f });
      } catch {}
    }
    host.remove();
    if (token !== heroToken || window.uxqShipped) return;
    const list = $("#hero-findings");
    list.innerHTML = items.map(({ demo }) => `<li><span class="sev ${SEVERITY[demo.id]}">${SEVERITY[demo.id][0].toUpperCase() + SEVERITY[demo.id].slice(1)}</span><span class="rid">${demo.rule}</span><span class="surf">${esc(demo.surface.split(",")[0])}</span></li>`).join("");
    const surf = [...new Set(items.map(({ demo }) => demo.surface.split(",")[0]))];
    $("#hero-meta").textContent = items.length ? `Checked the uncommitted changes: ${surf.slice(0, -1).join(", ")}${surf.length > 1 ? " and " : ""}${surf[surf.length - 1]}.` : "Could not run the checks.";
    $("#hero-status").textContent = `${items.length} findings · ${heroDemos.length} apps`;
    const top = items[0];
    $("#hero-detail").innerHTML = top
      ? `<dl><dt>Surface</dt><dd>${esc(top.demo.surface)}</dd><dt>Rule</dt><dd><code>${top.demo.rule}</code></dd><dt>Evidence</dt><dd>${esc(top.f.evidence)}</dd><dt>Fix</dt><dd>${esc(top.f.fix)}</dd></dl>`
      : `<p>Could not run the demo apps in this browser.</p>`;
  }

  // ---------- rule catalog ----------
  const groups = [...new Set(CATALOG.map((r) => r.group))];
  const demoRules = new Map(demos.map((d) => [d.rule, d.id]));
  const filter = { group: "All", q: "" };
  const gEl = $("#groups");
  gEl.innerHTML = ["All", ...groups].map((g) => `<button type="button" class="fchip" data-g="${esc(g)}" aria-pressed="${g === "All"}">${esc(g)} <b>${g === "All" ? CATALOG.length : CATALOG.filter((r) => r.group === g).length}</b></button>`).join("");
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  const list = $("#rule-list");
  const slug = (g) => g.toLowerCase().replace(/[^a-z]+/g, "-");
  const card = (r) => `<li class="rule-li" data-id="${r.id}"><details class="rule" id="rule-${r.id}">
      <summary><span class="rid">${r.id}</span><svg class="chev" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg><span class="rt">${esc(r.title)}</span>
      <span class="meta">${r.kinds.map((k) => `<span class="kind">${k}</span>`).join("")}${demoRules.has(r.id) ? '<span class="try">In the bug lab</span>' : ""}</span></summary>
      <div class="rule-body"><p class="meta-in">${r.kinds.map((k) => `<span class="kind">${k}</span>`).join("")}${demoRules.has(r.id) ? '<span class="try">In the bug lab</span>' : ""}</p><h4>Rule</h4><p>${inline(r.rule)}</p><h4>Check in code</h4><p>${inline(r.code)}</p><h4>Check in the browser</h4><p>${inline(r.browser)}</p><h4>Fix</h4><p>${inline(r.fix)}</p>
      ${demoRules.has(r.id) ? `<p class="go"><a class="btn btn-quiet btn-sm" href="#demo-${demoRules.get(r.id)}">Try it in the bug lab</a></p>` : ""}</div></details></li>`;
  list.innerHTML = groups.map((g) => `<section class="rule-group" data-group="${esc(g)}"><h3 id="rules-${slug(g)}">${esc(g)} <span class="gcount" data-gcount></span></h3>${(() => { const rs = CATALOG.filter((r) => r.group === g); const h = Math.ceil(rs.length / 2); return `<div class="rules-cols"><ul class="rules">${rs.slice(0, h).map(card).join("")}</ul><ul class="rules">${rs.slice(h).map(card).join("")}</ul></div>`; })()}</section>`).join("") + '<p class="empty" hidden>No rule matches these filters.</p>';
  list.querySelectorAll("h3[id]").forEach(addPermalink);
  const text = new Map(CATALOG.map((r) => [r.id, [r.id, r.title, r.rule, r.code, r.browser, r.fix, r.kinds.join(" ")].join(" ").toLowerCase()]));
  function applyFilter() {
    let n = 0;
    const words = filter.q.toLowerCase().split(/\s+/).filter(Boolean);
    for (const sec of list.querySelectorAll(".rule-group")) {
      let k = 0;
      const inGroup = filter.group === "All" || sec.dataset.group === filter.group;
      for (const li of sec.querySelectorAll(".rule-li")) {
        const ok = inGroup && words.every((w) => text.get(li.dataset.id).includes(w));
        li.hidden = !ok; if (ok) k++;
      }
      sec.hidden = !k; n += k;
      sec.querySelector("[data-gcount]").textContent = k;
    }
    for (const b of gEl.children) {
      b.setAttribute("aria-pressed", String(b.dataset.g === filter.group));
      const m = (r) => words.every((w) => text.get(r.id).includes(w));
      b.querySelector("b").textContent = CATALOG.filter((r) => (b.dataset.g === "All" || r.group === b.dataset.g) && m(r)).length;
    }
    gsel.value = filter.group;
    const line = $("#count-line");
    const active = filter.group !== "All" || filter.q;
    line.innerHTML = `Showing ${n} of ${CATALOG.length} rules${filter.group !== "All" ? ` in ${esc(filter.group)}` : ""}${filter.q ? ` that match “${esc(filter.q)}”` : ""}.${active ? ' <button type="button" id="clear">Clear filters</button>' : ""}`;
    list.querySelector(".empty").hidden = !!n;
  }
  const gsel = $("#gsel");
  gsel.innerHTML = ["All", ...groups].map((g) => `<option value="${esc(g)}">${g === "All" ? "All groups" : esc(g)} (${g === "All" ? CATALOG.length : CATALOG.filter((r) => r.group === g).length})</option>`).join("");
  gsel.addEventListener("change", () => { filter.group = gsel.value; applyFilter(); });
  gEl.addEventListener("click", (e) => { const b = e.target.closest(".fchip"); if (!b) return; filter.group = b.dataset.g; applyFilter(); });
  $("#q").addEventListener("input", (e) => { filter.q = e.target.value.trim(); applyFilter(); });
  $("#count-line").addEventListener("click", (e) => { if (e.target.id !== "clear") return; filter.group = "All"; filter.q = ""; $("#q").value = ""; applyFilter(); $("#q").focus(); });
  applyFilter();

  // ---------- hash routing ----------
  function route() {
    const h = location.hash.slice(1);
    if (h.startsWith("demo-") && demoById(h.slice(5))) { state.id = h.slice(5); load({ scroll: true }); return true; }
    if (h.startsWith("rule-")) {
      const d = document.getElementById(h);
      if (d) { filter.group = "All"; filter.q = ""; $("#q").value = ""; applyFilter(); d.open = true; d.classList.add("flash"); setTimeout(() => d.classList.remove("flash"), 1700); d.scrollIntoView({ block: "center" }); }
    }
    return false;
  }
  addEventListener("hashchange", route);
  // A link to the demo already in the hash fires no hashchange, so route on click too.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#demo-"]');
    if (!a || a.getAttribute("href") !== location.hash) return;
    e.preventDefault(); route();
  });
  if (!route()) load();
  runHero();
})();
