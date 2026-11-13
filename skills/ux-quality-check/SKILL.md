---
name: ux-quality-check
description: >
  Check the UX of a UI change against a catalog of about 50 common defects in six groups:
  feedback and state (pending, loading, errors, lost input), layout and spacing (gaps, alignment,
  overflow, content that moves on hover or open), controls and icons, content and forms,
  navigation, and the visual system. Use after you change UI code in any web stack, or when asked
  to "check the UX of this change", "UX review this diff" or "look for UX issues". Reads the diff
  and, with a dev server or a static page and a browser tool, measures the page at rest, on hover
  and on focus. Reports each finding as surface, rule, evidence and fix. Not for filing bugs from
  screenshots, and not for visual design critique.
---

# UX quality check

Check the UI surfaces a change touches against the rules in
[`references/rules.md`](references/rules.md). Each rule there has a reason, a check in code, a
check in the browser and a fix. The table at the top of that file says which kinds of change
each rule applies to.

## 1. Find the change

1. Get the diff the request names: a PR, a branch, a commit or the uncommitted changes. With no
   name, use the uncommitted changes. If there are none, use the branch against its merge base
   with the default branch (`git diff $(git merge-base HEAD origin/HEAD)...HEAD`). If the branch
   is the default branch, use the last commit. Say in the report which diff you checked.
2. List the changed UI files: components, templates, styles, and the strings and props they
   render. A change to a shared component or token is a UI change too.
3. If no file in the diff renders UI (only server code, tests, config or docs), say so in one or
   two sentences and stop. Report no findings.

## 2. Read the repo's own UI rules, and map the surfaces

A repo's rules take priority over the catalog's defaults.

- Read the repo's agent docs (`AGENTS.md`, `CLAUDE.md`, a design-system README) for a "UI rules"
  or similar section. Note each control, token or component they name for a rule, such as a
  dialog helper, an async button, type tokens or an AI mark. A fix names that component.
- Look for the repo's own UX checks: a `make ux-check` or `ux:check` target, a layout or
  accessibility script, lint rules, or tests that scan sources for UI rules. Run each one that
  covers the change and use its output as evidence.

Then map each changed file to the surfaces a user sees: the route, the view and the control. A
shared component maps to each surface that uses it. Name a surface the way a user finds it
("Review page, Add comment form"). For each surface, note:

- **Kinds.** Tag the surface with each kind in the legend of `references/rules.md` that the diff
  adds or edits: `write`, `data`, `form`, `list`, `control`, `overlay`, `layout`, `route`,
  `copy`, `chart`, `style`. A new hover style is `control` and `list`. A save button is `write`.
- **States.** Empty, loading, pending, error, hover, focus, selected and disabled. Most findings
  sit in a state the author did not open.

## 3. Run the checks

For each surface, run each rule whose "Applies to" shares a kind with the surface. Read the
rule's section before you check it. Note each rule you skip and the reason.

**Read the code first.** Each rule's "Check in code" says what to look for. This catches most
defects, and it needs no browser. Before you report a missing state, read the components the
code calls: a wrapper (an async button, a form hook, a parent that passes `pending`) often
handles it.

**Then measure in the browser, when you can.** A static HTML page opens from disk with a
`file://` URL. For an app, look for a running dev server, or start one with the repo's
documented command. Use the browser tool the host gives you: a built-in browser pane, a
Playwright script or headless Chrome. If the page asks for a sign-in, ask the user to sign in in
that browser. Type no credentials yourself.

Load [`scripts/measure.js`](scripts/measure.js) into the page. It defines the helpers that each
rule's "Check in the browser" names, and `references/rules.md` lists what each one returns.
Paste it again after each page load. Check each theme and scheme the app offers, and at least a
phone width and a desktop width.

**Measure each changed row, card and control in its interaction states too.** A hover, focus or
selected state often adds a fill, border, shadow or control. Two boxed items then touch, an item
grows and moves its neighbors, or a hover-only action pushes a count out of line. For each list,
card group or control group on the surface:

1. Run `snapshot(sel, "rest")` and `gaps(sel)` with the items at rest.
2. Hover one item with the browser tool, then run `snapshot(sel, "hover")` and `gaps(sel)`
   again. Do the same with keyboard focus (press Tab), and with the selected item next to a
   hovered item.
3. Run `moved("rest", "hover")`. A gap of 0px between two boxed items, or an item that moved
   when another was hovered, is a finding.

Do the same around each action that opens a menu, popover or panel: snapshot the main blocks,
open it, snapshot again, and compare. In code, read each `:hover`, `:focus-visible` and
selected-class rule for properties that add a box or change size: `background`, `border`,
`box-shadow`, `padding`, `margin`, `width` and `display`.

With no browser, or no page to open, report the code findings and list the browser checks that
did not run.

## 4. Check each finding

Before you report a finding, check it once more:

- **Code finding.** Confirm that a user can reach the state: the branch runs, the prop is
  passed, and no wrapper or parent handles it.
- **Browser finding.** Measure it a second time, after a reload, in the state the finding names.
  Drop a value that does not repeat.
- **In the change or before it.** A defect on a line the diff added or changed belongs to the
  change. So does a state the diff adds without its counterpart, even when the missing line would
  go elsewhere: a new `:hover` rule with no `:focus-visible` rule, or a new write with no pending
  state. A defect on a line the diff did not touch existed before it. Report it under "Existing
  defects", apart from the change's findings, and only when it sits on a changed surface.

Drop a finding that fails its check. Report a finding that you could not check as "Not
confirmed", with the reason.

## 5. Report the findings

Start with one line that names the diff you checked and the surfaces. Then give one finding per
defect, most severe first. Severity:

- **High**: the user loses data or input, sends a duplicate write, cannot reach a control, or
  cannot read text.
- **Medium**: the control misleads (wrong icon, color-only state, missing AI mark) or the layout
  is visibly broken.
- **Low**: inconsistency with the repo's system (raw type values, mixed selection controls,
  filler).

Each finding has four parts:

| Part | Contents |
| --- | --- |
| Surface | The view and control, plus the file and line (`ReviewForm.tsx:42`) |
| Rule | The rule id from the catalog, or the repo rule it breaks |
| Evidence | What you read or measured: the code line, the measured values, the state, theme and width |
| Fix | The change, in one or two sentences, with the repo's component or token where it names one |

Example:

> **Surface:** Stack sidebar, author filter list (`AuthorList.tsx:58`)
> **Rule:** `no-cramped-controls`
> **Evidence:** `gaps(".author-row")` at 1440px, with row 2 hovered: `y: 0` between row 1
> (selected) and row 2. At rest the gap is also 0, but only the selected row draws a box.
> **Fix:** Add `gap: 2px` to the list, or inset the hover fill by 2px.

Then add these sections:

1. **Existing defects**: the defects from step 4 that the change did not introduce, one line
   each.
2. **Not checked**: the rules you skipped and why, and the browser checks that did not run.

When the user asks for fixes, make them, then run the same checks again on the same surfaces.
