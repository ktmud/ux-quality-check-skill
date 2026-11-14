// UX quality check measurement helpers.
//
// Paste this whole file into the page with the browser tool's JavaScript action, or load it with
// Playwright's page.addScriptTag({ path }). Each helper returns plain data to put in a finding's
// evidence. The file defines the helpers on `window`, so they stay callable across separate
// JavaScript calls. A second paste replaces the helpers and keeps the saved snapshots and the
// layout-shift total.
(() => {
  const state = (window.__uxq = window.__uxq || { snaps: {}, shifts: [], observing: false });

  // A short name for an element in evidence: tag, id and classes. Works for SVG elements, whose
  // className is an object.
  const label = (el) => {
    if (!el || !el.tagName) return String(el);
    const cls = (el.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).slice(0, 3);
    const text = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30);
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${cls.map((c) => `.${c}`).join("")}${text ? ` "${text}"` : ""}`;
  };

  // All elements that match, or an error that names the selector. An empty match is a wrong
  // selector far more often than a pass, so it fails loudly.
  const all = (sel) => {
    const els = [...document.querySelectorAll(sel)];
    if (!els.length) throw new Error(`no element matches ${sel}`);
    return els;
  };
  const half = (n) => Math.round(n * 2) / 2;

  // Right edges of the matched elements. Sibling counts in one column return one value.
  const rightEdges = (sel) => all(sel).map((el) => half(el.getBoundingClientRect().right));

  // Left and right inset of each direct child of a container, in px.
  const insets = (sel) => {
    const box = all(sel)[0];
    const b = box.getBoundingClientRect();
    return [...box.children].map((el) => {
      const r = el.getBoundingClientRect();
      return { el: label(el), left: half(r.left - b.left), right: half(b.right - r.right) };
    });
  };

  // Vertical and horizontal gap from each matched element to the next one, in document order.
  const gaps = (sel) => {
    const els = all(sel);
    const rs = els.map((el) => el.getBoundingClientRect());
    return rs.slice(1).map((r, i) => ({
      from: label(els[i]),
      to: label(els[i + 1]),
      y: half(r.top - rs[i].bottom),
      x: half(r.left - rs[i].right),
    }));
  };

  // Elements whose content is wider than their box, so they scroll or clip sideways.
  const overflowing = () =>
    [document.documentElement, ...document.querySelectorAll("body *")]
      .filter((el) => el.scrollWidth > el.clientWidth + 1 && (el === document.documentElement || getComputedStyle(el).overflowX !== "visible"))
      .map((el) => ({ el: label(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));

  // Elements a user can click that are smaller than 24x24 CSS px.
  const smallTargets = () =>
    [...document.querySelectorAll('a[href], button, [role="button"], [role="tab"], input, select, [tabindex]:not([tabindex="-1"])')]
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && (r.width < 24 || r.height < 24))
      .map(({ el, r }) => ({ el: label(el), w: half(r.width), h: half(r.height) }));

  // Height of each matched element. Siblings of one kind in one row return one value.
  const heights = (sel) => all(sel).map((el) => half(el.getBoundingClientRect().height));

  // Pairs of matched elements whose boxes intersect.
  const overlaps = (sel) => {
    const els = all(sel).map((el) => ({ el, r: el.getBoundingClientRect() }));
    const hits = [];
    for (let i = 0; i < els.length; i++)
      for (let j = i + 1; j < els.length; j++) {
        const [a, b] = [els[i].r, els[j].r];
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom)
          hits.push([label(els[i].el), label(els[j].el)]);
      }
    return hits;
  };

  // Save the boxes of the matched elements under a name. Take one snapshot, act (open, hover,
  // toggle) with the browser tool, take a second one, then compare the two names with moved().
  const snapshot = (sel, name = "last") => {
    state.snaps[name] = all(sel).map((el) => ({ el, r: el.getBoundingClientRect().toJSON() }));
    return `${state.snaps[name].length} elements saved as "${name}"`;
  };

  // Elements in both snapshots whose position or size changed by more than 0.5px. It matches
  // elements by node, so an element added or removed between the two is skipped.
  const moved = (before, after) => {
    const [a, b] = [state.snaps[before], state.snaps[after]];
    if (!a || !b) throw new Error(`take snapshot(sel, "${before}") and snapshot(sel, "${after}") first`);
    const byNode = new Map(b.map((s) => [s.el, s.r]));
    return a
      .filter((s) => byNode.has(s.el))
      .map((s) => {
        const r = byNode.get(s.el);
        return { el: label(s.el), dx: half(r.left - s.r.left), dy: half(r.top - s.r.top), dw: half(r.width - s.r.width), dh: half(r.height - s.r.height) };
      })
      .filter((d) => Math.abs(d.dx) + Math.abs(d.dy) + Math.abs(d.dw) + Math.abs(d.dh) > 0.5);
  };

  // Block containers with a full border or a shadow inside another such container, at least half
  // its width. Controls, code blocks and media are skipped. Pass the content area's selector.
  const nestedBoxes = (sel) => {
    const root = all(sel)[0];
    const boxed = (el) => {
      const s = getComputedStyle(el);
      const border = ["Top", "Right", "Bottom", "Left"].every((k) => parseFloat(s[`border${k}Width`]) > 0);
      return !s.display.startsWith("inline") && (border || s.boxShadow !== "none");
    };
    const skip = "input, textarea, select, button, [role=button], pre, code, img, video, svg, svg *";
    return [...root.querySelectorAll("*")]
      .filter((el) => !el.matches(skip) && boxed(el))
      .map((el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement)
          if (boxed(p) && el.getBoundingClientRect().width >= p.getBoundingClientRect().width / 2)
            return { inner: label(el), outer: label(p) };
        return null;
      })
      .filter(Boolean);
  };

  // Matched elements that round their corners but draw no whole box: a border on one to three
  // sides, no fill and no shadow. A row divider with a radius curls at both ends. Run it at rest
  // and again with each row hovered.
  const strayCorners = (sel) =>
    all(sel)
      .map((el) => {
        const s = getComputedStyle(el);
        const radius = Math.max(...["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((k) => parseFloat(s[`border${k}Radius`]) || 0));
        const sides = ["Top", "Right", "Bottom", "Left"].filter((k) => parseFloat(s[`border${k}Width`]) > 0 && s[`border${k}Style`] !== "none");
        // A fill counts only when it differs from the background behind the element.
        const bg = s.backgroundColor.match(/[\d.]+/g) || [];
        const opaque = bg.length === 3 || (bg.length === 4 && Number(bg[3]) > 0);
        const filled = (opaque && s.backgroundColor !== backgroundOf(el.parentElement)) || s.backgroundImage !== "none" || s.boxShadow !== "none";
        return { el: label(el), radius, sides: sides.map((k) => k.toLowerCase()), filled };
      })
      .filter((d) => d.radius > 0 && d.sides.length > 0 && d.sides.length < 4 && !d.filled);

  // WCAG contrast ratio between two "rgb(r, g, b)" strings.
  const contrast = (fg, bg) => {
    const lum = (c) => {
      const [r, g, b] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map((v) => {
        const s = Number(v) / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    return Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100;
  };

  // The first non-transparent background behind an element. It ignores images, gradients and
  // semi-transparent layers; for text on one of those, sample the pixels from a screenshot.
  const backgroundOf = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg && !/rgba\(.*,\s*0\)$/.test(bg) && bg !== "transparent") return bg;
    }
    return getComputedStyle(document.body).backgroundColor;
  };

  // Text contrast of each matched element against the background behind it.
  const textContrast = (sel) =>
    all(sel).map((el) => {
      const fg = getComputedStyle(el).color;
      const bg = backgroundOf(el);
      return { el: label(el), fg, bg, ratio: contrast(fg, bg) };
    });

  // Layout shift since load. The observer reads buffered entries, so a late paste still counts
  // the shifts that happened before it.
  if (!state.observing && "PerformanceObserver" in window) {
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          if (!e.hadRecentInput)
            state.shifts.push({ value: e.value, sources: (e.sources || []).map((x) => label(x.node)).filter((x) => x !== "null") });
      }).observe({ type: "layout-shift", buffered: true });
      state.observing = true;
    } catch {
      // This browser does not report layout-shift entries, so layoutShift() returns null.
    }
  }
  // The layout shift total since load, and the elements each shift moved.
  const layoutShift = () =>
    state.observing
      ? { total: Math.round(state.shifts.reduce((a, e) => a + e.value, 0) * 1000) / 1000, sources: [...new Set(state.shifts.flatMap((e) => e.sources))] }
      : null;

  // Text that does not fit its own control or box. A native <select> or <input> clips its value
  // inside the control, so scrollWidth stays equal to clientWidth and overflowing() misses it.
  // This measures the shown text with the control's font against the width inside its padding.
  // Other matched elements count when they clip text: scrollWidth larger than clientWidth with
  // overflow other than visible (an ellipsis, or a hidden overflow).
  const clippedText = (sel = "select, input, textarea, button, a, [role=button], [role=tab], td, th, li, span") => {
    const ctx = document.createElement("canvas").getContext("2d");
    // Inputs that draw their own value (a date picker, a file name, a swatch) are skipped.
    const ownValue = "input[type=checkbox], input[type=radio], input[type=range], input[type=color], input[type=hidden], " +
      "input[type=file], input[type=date], input[type=time], input[type=datetime-local], input[type=month], input[type=week]";
    return all(sel)
      .map((el) => {
        const s = getComputedStyle(el);
        if (s.display === "none" || s.visibility === "hidden") return null;
        const inner = el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
        if (el.matches("select, input")) {
          if (el.matches(ownValue)) return null;
          const text = el.matches("select") ? el.selectedOptions[0]?.text || "" : el.value || el.placeholder || "";
          ctx.font = s.font || `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
          const need = half(ctx.measureText(text).width);
          return need > inner + 1 ? { el: label(el), text: text.slice(0, 40), need, have: half(inner) } : null;
        }
        const clips = s.overflowX !== "visible" && el.scrollWidth > el.clientWidth + 1 && (el.textContent || "").trim();
        return clips ? { el: label(el), text: el.textContent.trim().replace(/\s+/g, " ").slice(0, 40), need: el.scrollWidth, have: el.clientWidth } : null;
      })
      .filter(Boolean);
  };

  Object.assign(window, {
    label, rightEdges, insets, gaps, overflowing, smallTargets, heights, overlaps,
    snapshot, moved, nestedBoxes, strayCorners, contrast, backgroundOf, textContrast, layoutShift, clippedText,
  });
  return "ux helpers ready: rightEdges insets gaps overflowing smallTargets heights overlaps snapshot moved nestedBoxes strayCorners contrast backgroundOf textContrast layoutShift clippedText";
})();
