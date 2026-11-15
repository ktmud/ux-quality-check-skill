// Bug lab demos. Each demo is a small app page. The lab renders it in an <iframe srcdoc>, loads
// assets/measure.js into that frame, and runs the helper the rule names. Nothing here computes a
// measurement: every number on screen is the return value of a measure.js helper, or a DOM read
// that the demo labels as one.
(() => {
  // Shared styles for the demo apps. `html.bug` and `html.fixed` pick the variant.
  const base = `
  :root{--bg:#ffffff;--panel:#f6f6f8;--raise:#ffffff;--ink:#17181c;--ink-2:#5c5f69;--line:#e4e5ea;--line-2:#cfd1d8;
    --accent:#4f46e5;--accent-ink:#ffffff;--accent-soft:#ecebfd;--good:#13795b;--warn:#a15c00;--shadow:0 1px 2px rgba(16,17,20,.06),0 4px 14px rgba(16,17,20,.06);
    color-scheme:light}
  :root[data-theme=dark]{--bg:#1b1c21;--panel:#222329;--raise:#26272e;--ink:#ececf1;--ink-2:#a1a4ae;--line:#33353d;--line-2:#454852;
    --accent:#8b85ff;--accent-ink:#121317;--accent-soft:#2c2a52;--good:#4cc49a;--warn:#f0b35a;--shadow:0 1px 2px rgba(0,0,0,.3),0 6px 18px rgba(0,0,0,.25);
    color-scheme:dark}
  *{box-sizing:border-box}
  html,body{margin:0}
  body{background:var(--bg);color:var(--ink);font:14px/1.45 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased;padding:18px 20px}
  button{font:inherit;color:inherit}
  .app-head{display:flex;align-items:center;gap:10px;margin:0 0 12px}
  .app-head h1{font-size:15px;font-weight:650;margin:0;letter-spacing:-.01em}
  .app-head .count{font-size:12px;color:var(--ink-2);background:var(--panel);border-radius:999px;padding:2px 8px}
  .app-head .spacer{flex:1}
  .avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:650;flex:0 0 auto;color:#fff}
  .muted{color:var(--ink-2)}
  #uxq-layer{position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:hidden}
  .uxq-box{position:absolute;border:1.5px solid #ef4444;border-radius:4px;background:rgba(239,68,68,.08)}
  .uxq-box.ok{border-color:#10b981;background:rgba(16,185,129,.08)}
  .uxq-tag{position:absolute;font:600 10.5px/1 ui-monospace,"SF Mono",Menlo,monospace;color:#fff;background:#ef4444;padding:3px 5px;border-radius:4px;white-space:nowrap;transform:translateY(-100%)}
  .uxq-tag.ok{background:#0e9f6e}
  .uxq-line{position:absolute;background:#ef4444}
  `;

  // Frame-side runtime: draws measurement marks over the page and reports to the lab.
  const runtime = `
  window.uxqClear = () => { const l = document.getElementById("uxq-layer"); if (l) l.remove(); };
  window.uxqMark = (items) => {
    uxqClear();
    const l = document.createElement("div"); l.id = "uxq-layer"; document.body.appendChild(l);
    for (const it of items) {
      if (it.box) { const r = it.box; const d = document.createElement("div"); d.className = "uxq-box" + (it.ok ? " ok" : "");
        Object.assign(d.style, { left: r.left - 2 + "px", top: r.top - 2 + "px", width: r.width + 4 + "px", height: r.height + 4 + "px" });
        if (it.radius) d.style.borderRadius = it.radius; l.appendChild(d); }
      if (it.line) { const d = document.createElement("div"); d.className = "uxq-line"; Object.assign(d.style, it.line); l.appendChild(d); }
      if (it.tag) { const t = document.createElement("div"); t.className = "uxq-tag" + (it.ok ? " ok" : ""); t.textContent = it.tag;
        const x = Math.min(Math.max(2, it.at[0]), innerWidth - 8 * it.tag.length - 10);
        Object.assign(t.style, { left: x + "px", top: Math.max(16, it.at[1]) + "px" }); l.appendChild(t); }
    }
  };
  window.uxqRect = (el) => el.getBoundingClientRect();
  window.uxqPost = (data) => parent.postMessage(Object.assign({ uxq: true, demo: document.documentElement.dataset.demo }, data), "*");
  `;

  const demos = [];

  // 1. Hover adds a border: the rows below it move.
  demos.push({
    id: "hover-shift",
    rule: "no-interaction-shift",
    group: "Layout and spacing",
    title: "Hovering a row moves the rows below it",
    blurb: "The hover style adds a 1px border to a row that has none at rest. The row grows by 2px, so every row under the pointer's row moves down.",
    live: true,
    prompt: "Hover a row, or click in the frame and press Tab.",
    call: `snapshot(".thread, .list-foot", "rest")\n// hover one row\nsnapshot(".thread, .list-foot", "hover")\nmoved("rest", "hover")`,
    height: 384,
    surface: "Inbox, thread list (ThreadList.css:14)",
    css: `
    .list{display:flex;flex-direction:column}
    .thread{all:unset;box-sizing:border-box;display:grid;grid-template-columns:30px 1fr auto;gap:2px 12px;align-items:center;padding:9px 12px;border-radius:10px;cursor:pointer}
    .thread .who{font-weight:600;font-size:13.5px}
    .thread .sub{grid-column:2;color:var(--ink-2);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .thread .time{font-size:12px;color:var(--ink-2);grid-row:1;grid-column:3}
    .thread .avatar{grid-row:span 2}
    .bug .thread:hover,.bug .thread:focus-visible,.bug .thread.is-hover{background:var(--panel);border:1px solid var(--line-2)}
    .fixed .thread{border:1px solid transparent}
    .fixed .thread:hover,.fixed .thread.is-hover{background:var(--panel);border-color:var(--line-2)}
    .fixed .thread:focus-visible{background:var(--panel);border-color:var(--line-2);outline:2px solid var(--accent);outline-offset:1px}
    .bug .thread:focus-visible{outline:none}
    .list-foot{margin-top:10px;font-size:12px;color:var(--ink-2);padding:0 12px}`,
    body: `
    <div class="app-head"><h1>Inbox</h1><span class="count">5 new</span></div>
    <div class="list">
      ${[
        ["MR", "#4f46e5", "Mara Reyes", "Draft for the spring launch page", "9:41"],
        ["TO", "#0369a1", "Theo Okafor", "Can we move the sync to Thursday?", "9:12"],
        ["LV", "#b45309", "Lina Voss", "Updated pricing table, take a look", "8:57"],
        ["JP", "#047857", "June Park", "Notes from the design review", "8:30"],
        ["AS", "#be185d", "Ari Sol", "Quick question about the export", "Mon"],
      ].map(([i, c, n, s, t]) => `<button class="thread" aria-label="${n}"><span class="avatar" style="background:${c}">${i}</span><span class="who">${n}</span><span class="time">${t}</span><span class="sub">${s}</span></button>`).join("")}
    </div>
    <div class="list-foot">Showing 5 of 128 threads</div>`,
    script: `
    const SEL = ".thread, .list-foot";
    const rest = () => requestAnimationFrame(() => { uxqClear(); snapshot(SEL, "rest"); });
    rest();
    const report = (row, how) => requestAnimationFrame(() => {
      snapshot(SEL, "hover-tmp");
      const res = moved("rest", "hover-tmp");
      const rows = [...document.querySelectorAll(".thread")];
      uxqMark(res.map((d) => { const el = [...document.querySelectorAll(SEL)].find((e) => label(e) === d.el); const r = el.getBoundingClientRect();
        return { box: r, tag: (d.dy ? "dy " + (d.dy > 0 ? "+" : "") + d.dy + "px" : "dh +" + d.dh + "px"), at: [r.right - 84, r.top + 9] }; }));
      uxqPost({ type: "live", how, row: rows.indexOf(row) + 1, result: res });
    });
    for (const row of document.querySelectorAll(".thread")) {
      row.addEventListener("pointerenter", () => report(row, "hover"));
      row.addEventListener("focus", () => { if (row.matches(":focus-visible")) report(row, "focus"); });
      row.addEventListener("blur", rest);
    }
    document.querySelector(".list").addEventListener("pointerleave", rest);
    window.forceHover = async (n) => { const row = document.querySelectorAll(".thread")[n - 1];
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      uxqClear(); snapshot(SEL, "rest"); row.classList.add("is-hover");
      return new Promise((ok) => requestAnimationFrame(() => { snapshot(SEL, "hover-tmp"); const res = moved("rest", "hover-tmp");
        uxqMark(res.map((d) => { const el = [...document.querySelectorAll(SEL)].find((e) => label(e) === d.el); const r = el.getBoundingClientRect();
          return { box: r, tag: (d.dy ? "dy +" + d.dy + "px" : "dh +" + d.dh + "px"), at: [r.right - 84, r.top + 9] }; }));
        ok(res); })); };
    window.unforce = () => { for (const r of document.querySelectorAll(".thread.is-hover")) r.classList.remove("is-hover"); uxqClear(); };`,
    // Run button: force the hover style on row 2, the way CSS.forcePseudoState does.
    run: async (w) => { const res = await w.forceHover(2); return { call: `snapshot(".thread, .list-foot", "rest")\n// row 2 in its hover state\nsnapshot(".thread, .list-foot", "hover")\nmoved("rest", "hover")`, result: res }; },
    finding: (res) => res.length ? {
      evidence: `With row 2 hovered, moved("rest", "hover") returns ${res.length} elements. Row 2 grows by ${res[0].dh || res[0].dy}px, and ${res.filter((d) => d.dy > 0).length} elements below it move down by ${(res.find((d) => d.dy > 0) || {}).dy}px.`,
      fix: "Give every row a 1px transparent border at rest, so the hover style changes only the border color.",
    } : null,
  });

  // 2. A hover-only action saves space only on some rows: the size column is ragged.
  demos.push({
    id: "ragged-column",
    rule: "columns-align",
    group: "Layout and spacing",
    title: "A hover-only action pushes some counts out of line",
    blurb: "Only files you own render the ⋯ button. It is hidden until hover, but it still takes space, so those rows end their size 36px further left.",
    call: `rightEdges(".size")`,
    height: 322,
    surface: "Files, file list (FileRow.tsx:31)",
    css: `
    .files{border:1px solid var(--line);border-radius:12px;overflow:hidden}
    .file{display:flex;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid var(--line)}
    .file:first-child{border-top:0}
    .file:hover{background:var(--panel)}
    .ico{width:28px;height:28px;border-radius:7px;display:grid;place-items:center;background:var(--accent-soft);color:var(--ink);font-size:10px;font-weight:700;flex:0 0 auto}
    .name{flex:1;min-width:0;font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .size{font-variant-numeric:tabular-nums;color:var(--ink-2);font-size:13px}
    .more{all:unset;width:28px;height:28px;border-radius:7px;display:grid;place-items:center;color:var(--ink-2);opacity:0;cursor:pointer;flex:0 0 auto}
    .file:hover .more,.more:focus-visible{opacity:1}
    .more:hover{background:var(--line)}
    .more:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
    .slot{width:28px;height:28px;flex:0 0 auto}
    .fixed .file:not(.own) .slot{display:block}
    .bug .slot{display:none}
    @media (hover:none){.more{opacity:1}}`,
    body: `
    <div class="app-head"><h1>Files</h1><span class="count">Project assets</span></div>
    <div class="files">
      ${[
        ["PDF", "Brand guidelines.pdf", "4.2 MB", 1],
        ["FIG", "Onboarding flow.fig", "18.6 MB", 0],
        ["PNG", "Hero banner.png", "912 KB", 1],
        ["CSV", "Signups by week.csv", "38 KB", 0],
        ["MP4", "Product teaser.mp4", "64.0 MB", 1],
      ].map(([k, n, s, own]) => `<div class="file${own ? " own" : ""}"><span class="ico">${k}</span><span class="name">${n}</span><span class="size">${s}</span>${own ? `<button class="more" aria-label="More actions for ${n}">⋯</button>` : `<span class="slot" aria-hidden="true"></span>`}</div>`).join("")}
    </div>`,
    run: (w) => {
      const edges = w.rightEdges(".size");
      const uniq = [...new Set(edges)];
      const els = [...w.document.querySelectorAll(".size")];
      w.uxqMark(els.map((el, i) => { const r = el.getBoundingClientRect(); return { box: r, ok: uniq.length === 1, tag: i === 0 || edges[i] !== edges[i - 1] ? `${edges[i]}` : null, at: [r.left - 6, r.top - 3] }; })
        .map((m) => (m.tag ? m : { box: m.box, ok: m.ok }))
        .concat(uniq.map((x) => ({ line: { left: x + "px", top: "40px", bottom: "0", width: "1px", opacity: uniq.length > 1 ? 1 : 0 } }))));
      return { result: edges };
    },
    finding: (edges) => { const u = [...new Set(edges)]; return u.length > 1 ? {
      evidence: `rightEdges(".size") returns ${u.length} distinct values: ${u.join(" and ")}. The ${edges.filter((e) => e === Math.min(...u)).length} rows with the ⋯ button end ${Math.max(...u) - Math.min(...u)}px further left.`,
      fix: "Render the action slot in every row with a fixed 28px width, or position the hover action over the row's end.",
    } : null; },
  });

  // 3. Chips with fills sit flush.
  demos.push({
    id: "cramped-chips",
    rule: "no-cramped-controls",
    group: "Layout and spacing",
    title: "Filter chips touch, so two of them read as one",
    blurb: "The chip group has no gap. The selected chip draws a fill, and its neighbor draws one on hover, so the two boxes meet with 0px between them.",
    call: `gaps(".chip")`,
    height: 300,
    surface: "Tasks, filter bar (FilterChips.css:3)",
    css: `
    .chips{display:flex;flex-wrap:wrap}
    .fixed .chips{gap:8px}
    .chip{all:unset;box-sizing:border-box;height:32px;padding:0 12px;border-radius:8px;display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:550;color:var(--ink-2);cursor:pointer;border:1px solid var(--line)}
    .chip b{font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums}
    .chip:hover,.chip.force{background:var(--panel);color:var(--ink)}
    .chip:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
    .chip[aria-pressed=true]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
    .chip[aria-pressed=true] b{color:inherit}
    .task{display:flex;align-items:center;gap:10px;padding:10px 2px;border-bottom:1px solid var(--line);font-size:13.5px}
    .task:last-child{border-bottom:0}
    .dot{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--line-2);flex:0 0 auto}
    .tasks{margin-top:14px}`,
    body: `
    <div class="app-head"><h1>Tasks</h1><span class="spacer"></span><span class="count">Sprint 14</span></div>
    <div class="chips" role="group" aria-label="Filter tasks">
      <button class="chip">All <b>24</b></button><button class="chip" aria-pressed="true">Open <b>9</b></button><button class="chip force">Assigned <b>5</b></button><button class="chip">In review <b>4</b></button><button class="chip">Done <b>6</b></button>
    </div>
    <div class="tasks">
      <div class="task"><span class="dot"></span>Write release notes for 2.4</div>
      <div class="task"><span class="dot"></span>Fix avatar crop on retina screens</div>
      <div class="task"><span class="dot"></span>Review the empty state copy</div>
    </div>`,
    run: (w) => {
      const res = w.gaps(".chip");
      const chips = [...w.document.querySelectorAll(".chip")];
      w.uxqMark(res.map((g, i) => { const a = chips[i].getBoundingClientRect(), b = chips[i + 1].getBoundingClientRect();
        if (Math.abs(a.top - b.top) > 2) return null;
        return { line: { left: a.right - 1 + "px", top: a.top - 4 + "px", width: Math.max(2, b.left - a.right + 2) + "px", height: a.height + 8 + "px", background: g.x > 0 ? "rgba(16,185,129,.55)" : "#ef4444" }, tag: g.x + "px", ok: g.x > 0, at: [a.right - 14, a.top - 6] }; }).filter(Boolean));
      return { result: res };
    },
    finding: (res) => { const flush = res.filter((g) => g.x === 0 && g.y < 0); return flush.length ? {
      evidence: `gaps(".chip") returns x: 0 for ${flush.length} of ${res.length} pairs. "Open" (selected, filled) and "Assigned" (hovered, filled) touch with no space between them.`,
      fix: "Put gap: 8px on the chip group. Do not space the chips with a margin on one side.",
    } : null; },
  });

  // 4. Hard-coded gray passes in light and fails in dark.
  demos.push({
    id: "dark-contrast",
    rule: "theme-contrast",
    group: "Visual system",
    title: "A hard-coded gray passes in light mode and fails in dark",
    blurb: "The usage card sets its caption to #62656f instead of a theme token. On white that is 5.8:1. On the dark card it drops below 3:1.",
    call: `// once per theme\ntextContrast(".meta")`,
    height: 300,
    themed: true,
    surface: "Billing, usage card (UsageCard.css:22)",
    css: `
    .card{background:var(--raise);border:1px solid var(--line);border-radius:14px;padding:16px 18px;box-shadow:var(--shadow)}
    .row{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
    .plan{font-weight:650;font-size:15px}
    .pill{font-size:12px;font-weight:600;color:var(--good);background:var(--panel);padding:2px 8px;border-radius:999px}
    .big{font-size:26px;font-weight:700;letter-spacing:-.02em;margin:12px 0 2px;font-variant-numeric:tabular-nums}
    .bar{height:8px;border-radius:99px;background:var(--panel);overflow:hidden;margin:10px 0 12px}
    .bar i{display:block;height:100%;width:68%;background:var(--accent);border-radius:99px}
    .bug .meta{color:#62656f}
    .fixed .meta{color:var(--ink-2)}
    .meta{font-size:13px}`,
    body: `
    <div class="app-head"><h1>Billing</h1></div>
    <div class="card">
      <div class="row"><span class="plan">Team plan</span><span class="pill">Active</span></div>
      <div class="big">6,812 <span style="font-size:15px;font-weight:600" class="muted">/ 10,000 runs</span></div>
      <div class="bar"><i></i></div>
      <div class="row"><span class="meta">Resets on the 1st of each month</span><span class="meta">68% used</span></div>
    </div>`,
    run: async (w) => {
      const html = w.document.documentElement;
      const was = html.dataset.theme;
      const out = {};
      for (const t of ["light", "dark"]) { html.dataset.theme = t; out[t] = w.textContrast(".meta").map(({ el, fg, bg, ratio }) => ({ el, fg, bg, ratio })); }
      html.dataset.theme = was;
      const cur = out[was];
      w.uxqMark([...w.document.querySelectorAll(".meta")].map((el, i) => { const r = el.getBoundingClientRect(); const ok = cur[i].ratio >= 4.5;
        return { box: r, ok, tag: cur[i].ratio + ":1", at: [r.left, r.bottom + 20] }; }));
      return { result: out };
    },
    finding: (out) => { const bad = Object.entries(out).filter(([, v]) => v.some((x) => x.ratio < 4.5)); return bad.length ? {
      evidence: `textContrast(".meta") returns ${out.light[0].ratio}:1 in light and ${out.dark[0].ratio}:1 in dark (text ${out.dark[0].fg} on ${out.dark[0].bg}). Body text needs 4.5:1.`,
      fix: "Set the caption color from the --ink-2 token, which has a value for each theme.",
    } : null; },
  });

  // 5. Tiny toolbar buttons.
  demos.push({
    id: "tiny-targets",
    rule: "targets-and-shift",
    group: "Layout and spacing",
    title: "Toolbar icons are 18px targets",
    blurb: "The editor's format buttons are as small as their icons. WCAG 2.2 asks for 24 by 24 CSS px, or 24px of clear space around the target.",
    call: `smallTargets()`,
    height: 300,
    surface: "Notes, editor toolbar (Toolbar.tsx:12)",
    css: `
    .editor{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--raise)}
    .bar{display:flex;align-items:center;gap:4px;padding:8px 10px;border-bottom:1px solid var(--line);background:var(--panel)}
    .tool{all:unset;display:grid;place-items:center;border-radius:5px;color:var(--ink-2);cursor:pointer}
    .bug .tool{width:18px;height:18px}
    .fixed .tool{width:30px;height:30px;border-radius:7px}
    .tool:hover{background:var(--line);color:var(--ink)}
    .tool:focus-visible{outline:2px solid var(--accent)}
    .tool svg{width:15px;height:15px}
    .sep{width:1px;height:18px;background:var(--line-2);margin:0 6px}
    .doc{padding:14px 16px;min-height:150px;font-size:14px}
    .doc h2{font-size:16px;margin:0 0 6px}
    .doc p{margin:0;color:var(--ink-2)}`,
    body: `
    <div class="app-head"><h1>Notes</h1><span class="count">Saved</span></div>
    <div class="editor">
      <div class="bar" role="toolbar" aria-label="Format">
        <button class="tool" aria-label="Bold"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4.5 3h4.2a2.4 2.4 0 0 1 0 4.8H4.5zM4.5 7.8h5a2.6 2.6 0 0 1 0 5.2h-5z"/></svg></button>
        <button class="tool" aria-label="Italic"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 3H6.5M9.5 13H6M9 3 7 13"/></svg></button>
        <button class="tool" aria-label="Strikethrough"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 8h10M11 4.5C10.4 3.6 9.4 3 8 3 6.3 3 5 3.9 5 5.3c0 1 .6 1.7 1.6 2.1M5 11.3c.5 1 1.6 1.7 3 1.7 1.8 0 3-1 3-2.4"/></svg></button>
        <span class="sep"></span>
        <button class="tool" aria-label="Link"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l2-2a2.6 2.6 0 0 0-3.7-3.7l-.6.6M9.2 6.8a2.6 2.6 0 0 0-3.7 0l-2 2a2.6 2.6 0 0 0 3.7 3.7l.6-.6"/></svg></button>
        <button class="tool" aria-label="Bulleted list"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 4h7M6 8h7M6 12h7"/><circle cx="3" cy="4" r=".6" fill="currentColor"/><circle cx="3" cy="8" r=".6" fill="currentColor"/><circle cx="3" cy="12" r=".6" fill="currentColor"/></svg></button>
      </div>
      <div class="doc"><h2>Launch checklist</h2><p>Confirm the pricing copy, then book the walkthrough with support.</p></div>
    </div>`,
    run: (w) => {
      const res = w.smallTargets();
      w.uxqMark([...w.document.querySelectorAll(".tool")].map((el, i) => { const r = el.getBoundingClientRect(); const bad = r.width < 24 || r.height < 24;
        return { box: r, ok: !bad, tag: i === 0 ? `${Math.round(r.width)}×${Math.round(r.height)}` : null, at: [r.left, r.top - 4] }; }).map((m) => (m.tag ? m : { box: m.box, ok: m.ok })));
      return { result: res };
    },
    finding: (res) => res.length ? {
      evidence: `smallTargets() returns ${res.length} controls at ${res[0].w}×${res[0].h} px: ${res.map((r) => r.el.match(/"(.*)"/)?.[1]).join(", ")}.`,
      fix: "Make each toolbar button 30×30 px and keep the 15px icon centered inside it.",
    } : null,
  });

  // 6. A late banner pushes the page down.
  demos.push({
    id: "late-banner",
    rule: "targets-and-shift",
    group: "Layout and spacing",
    title: "A banner that arrives late moves the whole page",
    blurb: "The upgrade banner loads 900ms after the page, with no space saved for its 104px. The cards jump down after the user has started to read them.",
    call: `// reload, wait for the data, then\nlayoutShift()`,
    reload: true,
    height: 380,
    surface: "Dashboard, upgrade banner (Dashboard.tsx:48)",
    css: `
    .slot{transition:none}
    .fixed .slot{min-height:104px;margin-bottom:12px}
    .banner{display:flex;align-items:center;gap:14px;padding:0 16px;height:104px;border-radius:12px;background:var(--accent-soft);color:var(--ink);font-size:13px}
    .banner .art{width:64px;height:64px;border-radius:12px;background:var(--accent);opacity:.9;flex:0 0 auto;display:grid;place-items:center;color:var(--accent-ink);font-weight:800;font-size:20px}
    .banner p{margin:0;flex:1}
    .banner strong{display:block;font-size:14.5px;margin-bottom:2px}
    .banner .go{flex:0 0 auto;height:32px;padding:0 12px;border-radius:8px;background:var(--accent);color:var(--accent-ink);font-weight:600;display:grid;place-items:center}
    .bug .banner{margin-bottom:12px}
        .fixed .slot:empty{background:var(--panel);border-radius:10px}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
    .stat{border:1px solid var(--line);border-radius:12px;padding:12px 14px}
    .stat .k{font-size:12px;color:var(--ink-2)}
    .stat .v{font-size:22px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
    .stat .d{font-size:12px;color:var(--good);font-weight:600}`,
    body: `
    <div class="app-head"><h1>Overview</h1><span class="spacer"></span><span class="count">Last 7 days</span></div>
    <div class="slot" id="slot"></div>
    <div class="grid">
      <div class="stat"><div class="k">Visitors</div><div class="v">48,210</div><div class="d">+12.4%</div></div>
      <div class="stat"><div class="k">Sign-ups</div><div class="v">1,932</div><div class="d">+6.1%</div></div>
      <div class="stat"><div class="k">Trials started</div><div class="v">412</div><div class="d">+3.8%</div></div>
      <div class="stat"><div class="k">Conversion</div><div class="v">4.0%</div><div class="d">+0.3 pts</div></div>
    </div>`,
    script: `
    setTimeout(() => { document.getElementById("slot").innerHTML = '<div class="banner"><span class="art">20%</span><p><strong>Annual plans are here</strong>Pay yearly and save 20% on every seat.</p><span class="go">Compare plans</span></div>'; }, 900);`,
    run: async (w) => {
      const res = w.layoutShift();
      if (res === null) return { result: null };
      w.uxqMark(res.total > 0 ? [...w.document.querySelectorAll(".stat")].map((el, i) => { const r = el.getBoundingClientRect(); return { box: r, tag: i === 0 ? "shifted" : null, at: [r.left, r.top - 4] }; }).map((m) => (m.tag ? m : { box: m.box }))
        : [{ box: w.document.querySelector(".grid").getBoundingClientRect(), ok: true, tag: "no shift", at: [20, 60] }]);
      return { result: res };
    },
    finding: (res) => res === null ? { skip: "This browser does not report layout-shift entries, so layoutShift() returns null. Open the page in a Chromium browser to measure it." }
      : res.total >= 0.1 ? {
      evidence: `layoutShift() after one reload returns a total of ${res.total}. The limit is 0.1. The shift sources are ${res.sources.slice(0, 3).join(", ")}${res.sources.length > 3 ? " and others" : ""}.`,
      fix: "Save the banner's 104px height before its data arrives, so the cards render at their final place.",
    } : null,
  });

  // 7. A long link scrolls the phone page sideways.
  demos.push({
    id: "phone-overflow",
    rule: "no-horizontal-overflow",
    group: "Layout and spacing",
    title: "A long invite link scrolls the phone page sideways",
    blurb: "The share sheet keeps the invite link on one line. At phone width the link is wider than the screen, so the whole page scrolls sideways.",
    call: `overflowing()`,
    height: 330,
    phone: true,
    surface: "Share sheet, invite link at 360px (ShareSheet.css:9)",
    css: `
    body{padding:16px}
    .sheet{border:1px solid var(--line);border-radius:16px;padding:16px;background:var(--raise);box-shadow:var(--shadow)}
    .sheet h2{margin:0 0 4px;font-size:16px}
    .sheet p{margin:0 0 12px;color:var(--ink-2);font-size:13px}
    .link{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:10px;padding:8px 8px 8px 12px;background:var(--panel)}
    .url{font:12.5px/1.4 ui-monospace,"SF Mono",Menlo,monospace}
    .bug .url{white-space:nowrap}
    .fixed .url{flex:1;min-width:0;overflow-wrap:anywhere}
    .copy:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
    .copy{all:unset;flex:0 0 auto;height:32px;padding:0 12px;border-radius:8px;background:var(--accent);color:var(--accent-ink);font-weight:600;font-size:13px;display:grid;place-items:center;cursor:pointer}
    .people{display:flex;gap:6px;margin-top:14px}
    .people .avatar{width:28px;height:28px}`,
    body: `
    <div class="sheet">
      <h2>Invite to “Spring launch”</h2>
      <p>Anyone with the link can view and comment.</p>
      <div class="link"><span class="url" title="https://share.example.app/invite/spring-launch-board?token=7f3a9c1e2b4d6a8f0e1c3b5d7a9f2e4c">https://share.example.app/invite/spring-launch-board?token=7f3a9c1e2b4d6a8f0e1c3b5d7a9f2e4c</span><button class="copy">Copy</button></div>
      <div class="people"><span class="avatar" style="background:#4f46e5">MR</span><span class="avatar" style="background:#0369a1">TO</span><span class="avatar" style="background:#b45309">LV</span></div>
    </div>`,
    run: (w) => {
      const res = w.overflowing();
      const de = w.document.documentElement;
      w.uxqMark(res.length ? [{ line: { left: de.clientWidth - 2 + "px", top: 0, bottom: 0, width: "2px" } , tag: `+${de.scrollWidth - de.clientWidth}px`, at: [de.clientWidth - 70, 26] }] : [{ box: w.document.querySelector(".sheet").getBoundingClientRect(), ok: true, tag: "fits", at: [20, 20] }]);
      return { result: res };
    },
    finding: (res) => res.length ? {
      evidence: `overflowing() at 360px returns ${res.map((r) => `${r.el.split(" ")[0]} (scrollWidth ${r.scrollWidth}, clientWidth ${r.clientWidth})`).join(", ")}. The page scrolls ${res[0].scrollWidth - res[0].clientWidth}px sideways.`,
      fix: "Let the link shrink with min-width: 0 and wrap with overflow-wrap: anywhere.",
    } : null,
  });

  // 8. A save button with no pending state.
  demos.push({
    id: "pending-write",
    rule: "pending-write",
    group: "Feedback and state",
    title: "A Post button that stays enabled while it posts sends the comment twice",
    blurb: "While the request is in flight, the button stays enabled. A second click sends a second write. The label also grows, so Cancel slides left.",
    call: `snapshot(".actions button", "idle")\n// click Post twice, then while pending\nsnapshot(".actions button", "pending")\nmoved("idle", "pending")`,
    height: 330,
    surface: "Review, Add comment form (CommentForm.tsx:42)",
    dom: true,
    css: `
    .thread{display:flex;gap:10px;margin-bottom:12px}
    .bubble{background:var(--panel);border-radius:12px;padding:8px 12px;font-size:13.5px}
    .bubble b{display:block;font-size:12.5px;margin-bottom:2px}
    textarea{width:100%;height:74px;resize:none;border:1px solid var(--line-2);border-radius:10px;padding:10px 12px;font:inherit;background:var(--raise);color:var(--ink)}
    textarea:focus{outline:2px solid var(--accent);outline-offset:-1px;border-color:transparent}
    .actions{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-top:10px}
    .actions .sent{margin-right:auto;font-size:12px;color:var(--ink-2);font-variant-numeric:tabular-nums}
    .btn{all:unset;box-sizing:border-box;height:34px;padding:0 14px;border-radius:9px;font-weight:600;font-size:13.5px;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer}
    .ghost{border:1px solid var(--line-2)}
    .btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
    .ghost:hover{background:var(--panel)}
    .primary:hover{filter:brightness(1.08)}
    .btn:active{transform:translateY(1px)}
    .primary{background:var(--accent);color:var(--accent-ink)}
    .primary[disabled]{cursor:default;opacity:.8}
    .fixed .primary{display:inline-grid;justify-items:center}
    .fixed .primary .lbl{grid-area:1/1;display:inline-flex;align-items:center;gap:8px}
    .fixed .primary .lbl.hide{visibility:hidden}
    .spin{width:13px;height:13px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:s .7s linear infinite}
    @keyframes s{to{transform:rotate(1turn)}}`,
    body: `
    <div class="app-head"><h1>Review</h1><span class="count">Homepage hero v3</span></div>
    <div class="thread"><span class="avatar" style="background:#047857">JP</span><div class="bubble"><b>June Park</b>Can we try the warmer photo in the hero?</div></div>
    <textarea aria-label="Comment">Yes, and let's crop it tighter on mobile.</textarea>
    <div class="actions"><span class="sent">Requests sent: <b id="sent">0</b></span><button class="btn ghost">Cancel</button><button class="btn primary" id="post"></button></div>`,
    script: `
    let sent = 0, pending = false;
    const post = document.getElementById("post");
    const fixed = document.documentElement.classList.contains("fixed");
    const render = () => {
      if (fixed) { post.innerHTML = '<span class="lbl' + (pending ? ' hide' : '') + '">Post comment</span><span class="lbl' + (pending ? '' : ' hide') + '"><span class="spin" aria-hidden="true"></span>Posting…</span>'; post.disabled = pending; post.setAttribute("aria-busy", String(pending)); }
      else post.textContent = pending ? "Posting comment…" : "Post comment";
    };
    render();
    post.addEventListener("click", () => {
      if (fixed && pending) return;
      sent++; document.getElementById("sent").textContent = sent; pending = true; render();
      setTimeout(() => { pending = false; render(); }, 1600);
    });`,
    run: async (w) => {
      const d = w.document;
      const post = d.getElementById("post");
      w.uxqClear();
      w.snapshot(".actions button", "idle");
      const before = Number(d.getElementById("sent").textContent);
      post.click();
      await new Promise((r) => setTimeout(r, 120));
      post.click();
      await new Promise((r) => requestAnimationFrame(r));
      w.snapshot(".actions button", "pending");
      const res = w.moved("idle", "pending");
      const dom = { disabled: post.disabled, ariaBusy: post.getAttribute("aria-busy"), requests: Number(d.getElementById("sent").textContent) - before };
      const btns = [...d.querySelectorAll(".actions button")];
      w.uxqMark(res.length ? res.map((m) => { const el = btns.find((b) => w.label(b) === m.el) || btns[0]; const r = el.getBoundingClientRect();
        return { box: r, tag: m.dx ? `dx ${m.dx}px` : `dw +${m.dw}px`, at: [r.left, r.bottom + 22] }; })
        : [{ box: post.getBoundingClientRect(), ok: true, tag: "disabled, same width", at: [post.getBoundingClientRect().left - 60, post.getBoundingClientRect().top - 4] }]);
      return { result: res, dom };
    },
    finding: (res, extra) => (res.length || extra.dom.requests > 1) ? {
      evidence: `Two clicks 120ms apart sent ${extra.dom.requests} requests. While pending, the button has disabled ${extra.dom.disabled} and aria-busy ${extra.dom.ariaBusy}. The label also grows: moved("idle", "pending") returns ${res.map((m) => `${/ghost/.test(m.el) ? "Cancel" : "Post"} (${[m.dx && `dx ${m.dx}px`, m.dw && `dw +${m.dw}px`].filter(Boolean).join(", ")})`).join(" and ")}.`,
      fix: "Disable the button and set aria-busy while the request runs. Stack both labels in one grid cell so the width stays fixed.",
    } : null,
  });

  // 9. Row dividers with a radius curl at both ends.
  demos.push({
    id: "stray-corners",
    rule: "no-stray-corners",
    group: "Visual system",
    title: "Row dividers curl up at both ends",
    blurb: "Each settings row has a bottom border and a 10px radius for its hover fill. At rest the radius bends the divider at both ends.",
    call: `strayCorners(".setting")`,
    height: 318,
    surface: "Settings, notification rows (SettingRow.css:6)",
    css: `
    .settings{display:flex;flex-direction:column}
    .setting{display:flex;align-items:center;gap:12px;padding:12px 10px;border-bottom:2px solid var(--line-2)}
    .bug .setting{border-radius:12px}
    .setting:hover{background:var(--panel)}
    .fixed .setting{border-radius:0}
    .fixed .setting:hover{border-radius:0}
    .setting .t{flex:1}
    .setting .t b{display:block;font-weight:600;font-size:13.5px}
    .setting .t span{font-size:12.5px;color:var(--ink-2)}
    .sw{width:36px;height:22px;border-radius:99px;background:var(--line-2);position:relative;flex:0 0 auto}
    .sw::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2)}
    .sw.on{background:var(--accent)}
    .sw.on::after{left:17px}`,
    body: `
    <div class="app-head"><h1>Notifications</h1></div>
    <div class="settings">
      <div class="setting"><div class="t"><b>Mentions</b><span>When someone mentions you in a comment</span></div><span class="sw on" role="img" aria-label="On"></span></div>
      <div class="setting"><div class="t"><b>Replies</b><span>Replies to threads you follow</span></div><span class="sw on" role="img" aria-label="On"></span></div>
      <div class="setting"><div class="t"><b>Weekly digest</b><span>A summary every Monday morning</span></div><span class="sw" role="img" aria-label="Off"></span></div>
    </div>`,
    run: (w) => {
      const res = w.strayCorners(".setting");
      const els = [...w.document.querySelectorAll(".setting")];
      w.uxqMark(els.map((el, i) => { const r = el.getBoundingClientRect(); return res.length
        ? { box: { left: r.left, top: r.bottom - 14, width: 14, height: 14 }, tag: i === 0 ? `radius ${res[0].radius}px` : null, at: [r.left, r.bottom - 16] }
        : { box: { left: r.left, top: r.bottom - 3, width: r.width, height: 3 }, ok: true, tag: i === 0 ? "square ends" : null, at: [r.left, r.bottom - 6] }; })
        .flatMap((m, i) => { if (!res.length) return [m.tag ? m : { box: m.box, ok: true }]; const r = els[i].getBoundingClientRect(); const right = { box: { left: r.right - 14, top: r.bottom - 14, width: 14, height: 14 } }; return [m.tag ? m : { box: m.box }, right]; }));
      return { result: res };
    },
    finding: (res) => res.length ? {
      evidence: `strayCorners(".setting") returns ${res.length} rows with radius ${res[0].radius}px, a border on [${res[0].sides.join(", ")}] only, and no fill at rest.`,
      fix: "Keep the rows square and draw the hover fill on an inset pseudo-element that carries the radius.",
    } : null,
  });

  window.UXQ_DEMOS = { base, runtime, demos };
})();
