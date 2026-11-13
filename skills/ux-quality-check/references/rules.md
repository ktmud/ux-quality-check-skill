# UX rule catalog

Each rule has a stable id, a reason, a check in code, a check in the browser and a fix. Cite the
id in a finding. The examples use React and CSS, but each rule applies to any web stack.

A repo's own design system or UI rules take priority. Where a repo names its own control, token
or component for a rule (a dialog helper, a pill switch, an AI mark), check against that one. The
defaults here apply where the repo names none.

"Applies to" names the kinds of change a rule checks. `SKILL.md` step 2 tags each changed surface
with these kinds, and step 3 runs each rule that shares a kind with the surface:

| Kind | The change adds or edits |
| --- | --- |
| `write` | A control that saves, sends, deletes or starts work |
| `data` | Content loaded, polled or refreshed from a server |
| `form` | A text input, select, toggle or other editable field |
| `list` | Rows, cards, sidebar items or table cells |
| `control` | A button, link, icon or toggle, or its hover, focus or pressed style |
| `overlay` | A menu, popover, tooltip, modal or drawer |
| `layout` | Spacing, size, position or page structure |
| `route` | A page, tab or URL state |
| `copy` | Text a user reads: labels, empty states, errors, AI output |
| `chart` | A chart or graph |
| `style` | Colors, type, borders, shadows or themes |

Run the layout checks in each interaction state that `SKILL.md` step 3 lists: at rest, on hover,
on keyboard focus, and selected next to hovered.

| Group | Id | Rule | Applies to |
| --- | --- | --- | --- |
| Feedback and state | [`pending-write`](#pending-write) | A write button shows a pending state | write |
| | [`loading-is-not-empty`](#loading-is-not-empty) | A loading view is not an empty view | data |
| | [`refresh-in-place`](#refresh-in-place) | New data updates the view in place | data, write |
| | [`progress-visible-elsewhere`](#progress-visible-elsewhere) | Background work shows progress on every view | write |
| | [`keep-user-input`](#keep-user-input) | Typed input survives failures and view changes | form |
| | [`disabled-says-why`](#disabled-says-why) | A blocked action says why | write, form |
| | [`status-is-visible`](#status-is-visible) | An item's status shows wherever the item shows | list, data |
| | [`not-color-alone`](#not-color-alone) | State is not shown by color alone | style, list |
| | [`interaction-states`](#interaction-states) | Each clickable item shows hover, pressed and focus states | control, list |
| | [`confirm-once`](#confirm-once) | A finished action confirms once and retires its trigger | write |
| | [`errors-lead-to-fix`](#errors-lead-to-fix) | An error names what failed and leads to the fix | write, data, form |
| | [`long-work-can-stop`](#long-work-can-stop) | A long run can be stopped and keeps its partial results | write |
| Layout and spacing | [`consistent-gutters`](#consistent-gutters) | Blocks in a content area share its side insets | layout |
| | [`same-page-frame`](#same-page-frame) | Sibling pages share one frame | route, layout |
| | [`aligned-edges`](#aligned-edges) | Sibling edges, heights, baselines and labels line up | layout, list |
| | [`columns-align`](#columns-align) | Columns in a list line up | list |
| | [`no-cramped-controls`](#no-cramped-controls) | Controls and boxed items have room between them | layout, list, control |
| | [`text-fits`](#text-fits) | Each text wraps or truncates by its kind | layout, copy, list |
| | [`no-horizontal-overflow`](#no-horizontal-overflow) | Nothing scrolls sideways by accident | layout |
| | [`fits-the-viewport`](#fits-the-viewport) | The main area fits the space below the fixed bars | layout |
| | [`no-interaction-shift`](#no-interaction-shift) | Opening, hovering or toggling does not move other content | overlay, list, control |
| | [`toggle-stays-put`](#toggle-stays-put) | A toggle stays where it was and changes only the region it controls | control, layout |
| | [`layer-order`](#layer-order) | Overlays sit above sticky and fixed elements | overlay |
| | [`overlay-sizing`](#overlay-sizing) | Popovers and modals fit their content and the screen | overlay |
| | [`popover-anchoring`](#popover-anchoring) | A floating layer stays attached to its trigger | overlay |
| | [`clear-scroll-areas`](#clear-scroll-areas) | Scroll areas behave as the reader expects | layout, list |
| | [`mobile-layout`](#mobile-layout) | Phone widths get their own layout | layout, route |
| | [`targets-and-shift`](#targets-and-shift) | Hit targets are big enough and late content does not move the page | layout, data, control |
| Controls and icons | [`icon-matches-action`](#icon-matches-action) | An icon's look matches its action | control |
| | [`no-decorative-icons`](#no-decorative-icons) | Icons carry meaning, not decoration | control |
| | [`no-dead-controls`](#no-dead-controls) | Every visible control and badge does what it shows | control |
| | [`one-control-per-concept`](#one-control-per-concept) | One control per concept, one trigger per action | control, form |
| | [`one-selection-system`](#one-selection-system) | Selection controls follow one system | control, form |
| | [`control-fits-the-data`](#control-fits-the-data) | A form input matches the kind of value it takes | form |
| | [`hover-also-focus-touch`](#hover-also-focus-touch) | Hover-only controls also show on focus and touch | control, list |
| | [`no-native-dialogs`](#no-native-dialogs) | No native browser dialogs | write |
| Content and forms | [`no-empty-filler`](#no-empty-filler) | No empty-value filler | copy, data |
| | [`labels-name-the-action`](#labels-name-the-action) | Labels say what happens, in the product's terms | copy, control |
| | [`safe-traceable-defaults`](#safe-traceable-defaults) | Defaults are valid, safe and explainable | form |
| | [`same-data-same-view`](#same-data-same-view) | The same data looks the same everywhere | data, route |
| | [`references-link-out`](#references-link-out) | References to other entities link to their source | copy, data |
| | [`filters-show-state`](#filters-show-state) | An active filter shows, clears and drives every count | list, data |
| | [`chart-legibility`](#chart-legibility) | Chart labels and tooltips never cover data or controls | chart |
| | [`ai-mark`](#ai-mark) | AI-written content carries an AI mark | copy |
| Navigation | [`navigation-keeps-place`](#navigation-keeps-place) | Back, reload and links keep the reader's place | route |
| | [`page-titles`](#page-titles) | Each page sets its own document title | route |
| | [`section-permalinks`](#section-permalinks) | Each section of a long document has a permalink | route, copy |
| Visual system | [`type-tokens`](#type-tokens) | Type and weight come from tokens | style |
| | [`theme-contrast`](#theme-contrast) | Every theme and scheme keeps 4.5:1 text contrast | style |
| | [`no-edge-stripe`](#no-edge-stripe) | A callout or card shows its kind without a thick left border | style |
| | [`no-nested-boxes`](#no-nested-boxes) | No bordered box inside another bordered box | layout, style |
| | [`no-stray-corners`](#no-stray-corners) | A rounded corner appears only on a whole box | list, style, control |

## Measurement helpers

[`scripts/measure.js`](../scripts/measure.js) defines the helpers that the browser checks below
name. Paste the whole file into the page with the browser tool's JavaScript action, or load it with
Playwright's `page.addScriptTag({ path })`. It puts the helpers on `window`, so later calls can
use them, and a second paste keeps the saved snapshots. A page load clears `window`, so paste the
file again after each load or navigation.

| Helper | Returns |
| --- | --- |
| `rightEdges(sel)` | The right edge of each match. A column of siblings returns one value |
| `heights(sel)` | The height of each match. Siblings in one row return one value |
| `insets(sel)` | The left and right inset of each child of the first match |
| `gaps(sel)` | The vertical and horizontal gap from each match to the next |
| `overlaps(sel)` | Pairs of matches whose boxes intersect |
| `overflowing()` | Elements whose content is wider than their box |
| `smallTargets()` | Clickable elements smaller than 24x24 px |
| `snapshot(sel, name)` | Saves the boxes of the matches under `name` |
| `moved(before, after)` | The elements whose box changed between two saved snapshots |
| `nestedBoxes(sel)` | Bordered or shadowed blocks inside another one, in the first match |
| `strayCorners(sel)` | Matches with a corner radius but a border on only one to three sides, and no fill or shadow |
| `textContrast(sel)` | The text color, background and WCAG ratio of each match |
| `contrast(fg, bg)` | The WCAG ratio of two `rgb()` strings |
| `backgroundOf(el)` | The first opaque background behind an element |
| `layoutShift()` | The layout shift total since load and the elements it moved, or `null` where the browser does not report shifts |

A selector that matches nothing throws an error that names it. Fix the selector, because an empty
match proves nothing. `backgroundOf` ignores images, gradients and semi-transparent layers. When
the text sits on one of those, sample the pixels from a screenshot.

JavaScript in the page cannot set `:hover`. Hover with the browser tool's hover action or
Playwright's `locator.hover()` between two `snapshot` calls, or force the state with the DevTools
protocol (`CSS.forcePseudoState`).

## Feedback and state

### pending-write

**Rule.** While a write request is in flight, the button that sent it is disabled, keeps its
width, shows a spinner and an "-ing" label ("Adding…"), and has `aria-busy="true"`. One pending
operation shows one progress indicator. On failure the form keeps the user's input and shows the
error next to the form.

**Why.** With no feedback, the user does not know if the click worked. They click again and send
a second write, or they leave and lose the input. A button that changes width moves the controls
next to it.

**Check in code.** Find each handler that calls a mutation (`fetch` with `POST`, `PUT`, `PATCH`
or `DELETE`, a `useMutation`, a server action). Look for a pending flag that sets `disabled`,
`aria-busy` and the label. Check that the error path does not clear the input state.

```tsx
<button type="submit" disabled={pending} aria-busy={pending} className="btn">
  {pending ? <Spinner aria-hidden /> : null}
  {pending ? "Adding comment…" : "Add comment"}
</button>
```

Keep the width with a `min-width` set from the idle label, or with a grid that stacks both
labels in one cell and hides one.

**Check in the browser.** Slow the request (throttle the network or hold the response with a
route handler). Click the button, then read its `disabled`, `aria-busy`, text and
`getBoundingClientRect().width` while the request is pending. Compare the width with the idle
width. Count the spinners on the surface. Click again and count the requests. Make the request
fail and check that the input value is still there.

**Fix.** Add a pending state that covers all four parts. Clear the input only on success.

### loading-is-not-empty

**Rule.** While data loads, the view shows a skeleton shaped like the content of that route:
the same shell, rails, insets and block sizes, from the first paint. Each chart type has a
skeleton of its own shape. It does not show "No results", an empty table, a starter page or a
validation message. A placeholder for a value that is missing does not look like a skeleton.
Controls that do not need the data (the header, navigation, tabs) stay usable while it loads.
Content the user wrote, such as their own message, shows at once.

**Why.** An empty state during loading tells the user there is nothing. They act on that, or
they watch the view change shape when the data arrives. A skeleton without the sidebar, then one
with it, moves the page twice.

**Check in code.** For each query the surface renders, read the branch for the loading state.
`if (!data?.length) return <Empty/>` before a loading check fails. A route that reuses another
route's skeleton (a table skeleton for a three-column detail page) fails. A form validator that
runs on the empty loading value fails. A header or tab bar that waits on the page's data fails.

**Check in the browser.** Throttle the network and load the route. Take a screenshot at the first
paint and while the data is pending. Run `snapshot` on the main regions at each, and again after
load, with a name for each. Compare them with `moved`, and compare the regions and insets. Read the pending text for empty or validation messages.
Click the header and tabs while the data is pending.

**Fix.** Check the loading flag before the empty check. Give each route and chart type a skeleton
of its final layout, inside the real shell.

### refresh-in-place

**Rule.** After a write, a background refresh or a poll, the view updates the changed data in
place. Counts, lists and related panels show the new state at once. The page does not flash,
reload or close open panels. The area that changed gets a brief highlight when the change came
from the user's own one-click action. Data that can go stale refreshes when the browser tab gets
focus again.

**Why.** A stale count makes the user doubt the write. A full reload loses scroll, focus and open
panels.

**Check in code.** After each mutation, find what refetches or updates the cache. A mutation with
no cache update or invalidation for the lists and counts that show the item fails. A poll that
sets a top-level loading flag, or that changes a `key` on the page, fails. Look for a `focus` or
`visibilitychange` listener, or the data library's refetch-on-focus option.

**Check in the browser.** Make the write, then read the counts and lists that include the item.
During a background refresh, record the screen or watch for the skeleton. Check that an open
panel stays open.

**Fix.** Update or invalidate every query that shows the item. Keep the existing data on screen
while a refresh runs.

### progress-visible-elsewhere

**Rule.** Work that runs in the background (an agent run, an import, a deploy) shows its progress
on every view where the user can be, not only on its own pane. The page also shows when its data
was last fetched, when that data can be stale.

**Why.** The user moves to another view while the work runs. With no indicator they cannot tell
if the work is still running, finished or stuck.

**Check in code.** Find where the job state lives. A job state that only the job's own pane reads
fails.

**Check in the browser.** Start the work, go to another view, and look for an indicator. Wait for
it to finish and check that the indicator changes.

**Fix.** Put a small status in a shared place, such as the tab label, header or nav item.

### keep-user-input

**Rule.** Text the user typed survives a failed send, a mode switch (such as Form to JSON), a
step change, a tab change, closing an editor with an auto-saved draft, and Escape. When an action
would drop it, the UI asks first. A background refresh does not overwrite a field that has focus,
and a field accepts an empty value while the user edits it. A suggestion from a previous round
leaves the placeholder after the user sends a new message.

**Why.** Lost input makes the user write it again, and they stop trusting the form.

**Check in code.** Find each draft state (`useState` for an input, an editor value). Check the
paths that reset it: the error path of a send, a `key` change on the parent, an unmount on a tab
or step switch, an Escape handler, an effect that copies server data into the field, and a
parser that rejects an empty value.

**Check in the browser.** Type text, then make the send fail, switch mode, step to the next item,
switch tabs, close the editor and press Escape. After each, check the text is still there or a
question appeared. Clear a field, wait for a refresh, and check it stays empty.

**Fix.** Clear drafts only on success. Keep drafts outside components that unmount, or ask before
the drop.

### disabled-says-why

**Rule.** Hide an action the user can never take. Explain an action the user cannot take now: a
disabled control states the rule that blocks it, next to the control or in its tooltip. A lock
also applies to an editor that is already open. A disabled option in a choice list gets a reason,
or it is removed.

**Why.** A grey control with no reason looks broken. Disabled radio buttons with no reason make
the user guess which input unlocks them.

**Check in code.** Find each `disabled` prop. Check that the same condition renders a reason.
Check that a lock flag is read by the editor, not only by the button that opens it.

**Check in the browser.** For each disabled control, read its accessible description and
tooltip. Open the editor, then set the lock from another tab or user, and try to save.

**Fix.** Add the reason text, or hide the control. Check the lock again at save time.

### status-is-visible

**Rule.** A status the user acts on (draft, already posted, read-only, overridden, archived)
shows as a label on every surface that shows the item, with an entry point to change it where the
user can.

**Why.** The user decides what to do from the status. When one surface hides it, they act on the
wrong assumption, such as reviewing a draft PR or posting a finding twice.

**Check in code.** List the components that render the item. Check that each reads the status
field and renders a label for it.

**Check in the browser.** Load an item in each status. Check each surface that shows it: list
rows, cards, headers, hover cards and detail pages.

**Fix.** Add the label to the shared item component, and the toggle where the user has the
right to change it.

### not-color-alone

**Rule.** A state (draft, failed, disabled, selected, new) shows with a second cue beside its
color: an icon, a shape or line style, or a word.

**Why.** Readers with a color vision deficiency cannot tell some states apart. Color alone also
fails in grayscale, in high-contrast modes and in some themes.

**Check in code.** Find conditional classes or styles that change only `color`,
`background-color` or `border-color` for a state. For example, a draft PR that is gray and
nothing else fails. A draft PR with a dashed icon or edge and "draft" in its label passes.

**Check in the browser.** Take a screenshot with a grayscale filter
(`document.documentElement.style.filter = "grayscale(1)"`). Check that each state can still be
told apart. Read the accessible name and check that it includes the state.

**Fix.** Add an icon, a line style or a word, and put the state in the accessible name.

### interaction-states

**Rule.** Each button, link, row and chip a user can click has a hover style, a pressed
(`:active`) style and a `:focus-visible` style, each different from its rest style, and
`cursor: pointer`. A disabled control shows `cursor: not-allowed` or the default cursor. An item
the user cannot act on (read-only text, a static card) has no hover style. Hover changes only the
hovered item: its siblings keep their opacity and color. A hover or selected fill stays inside the
item's border radius, and extends past the text by the item's padding. A control uses one
affordance for "clickable": a border or an underline, not both.

**Why.** A click with no pressed state feels lost, so the user clicks again. A hover style on
static content promises an action that is not there. Dimmed siblings make the page flicker as the
pointer moves.

**Check in code.** For each interactive class in the diff, look for `:hover`, `:active` and
`:focus-visible` rules and a `cursor` value. Look for `:hover` rules on non-interactive items.
Look for rules such as `.list:hover .item:not(:hover)` that dim siblings. Look for a fill on a
child of a rounded parent with no `overflow: hidden` and no matching radius.

**Check in the browser.** For each control, read `getComputedStyle` at rest, with the pointer on
it, with the mouse button down and with keyboard focus. Compare `background-color`, `color`,
`border-color`, `box-shadow`, `outline` and `cursor`. A state with the same values as rest is a
finding. Hover one card and read the `opacity` of its siblings. Zoom a screenshot on the corners
of a hovered rounded row.

**Fix.** Add the missing state rules from the repo's tokens. Remove hover styles from static
items. Clip the fill with `overflow: hidden` or give it the parent's radius.

### confirm-once

**Rule.** An action confirms once, in or next to the control that ran it: a copy button changes
to "Copied" for a moment, with no toast and no tooltip as well. A second click of the same action
does not stack a second toast. When an action is done for good (applied, resolved, published),
its trigger goes away and a done label takes its place.

**Why.** Three confirmations for one click are noise. A trigger that stays after its work is
done invites a second run.

**Check in code.** For each action handler, list the feedback it fires: a label swap, a toast, a
tooltip, a banner. More than one for one action fails. Check that a one-time action's trigger
renders only while the action is still open.

**Check in the browser.** Click each action once and count the visible confirmations. Click it
twice and count the toasts. Finish a one-time action and look for its trigger.

**Fix.** Keep the confirmation closest to the control and remove the others. Replace a finished
trigger with a done label.

### errors-lead-to-fix

**Rule.** An error message names what failed and what the user can do ("Could not load 3 of 12
results: the search service timed out"). A Retry control shows only when a retry can succeed. A
failed connection or permission shows the control that fixes it (reconnect, request access). A
field error shows next to its field, after the field loses focus or after submit, not while the
user types for the first time. A server rejection maps to the field it is about. When submit fails,
the form scrolls to, opens the step of and focuses the first invalid field. An error clears when
the user fixes its cause.

**Why.** "Something went wrong" leaves the user nothing to do. A Retry that fails again teaches
them to ignore the button. An error below the fold, or on another step, looks like a submit that
did nothing.

**Check in code.** Read each error string in the diff and the data it shows. A generic string
with the cause available in the response fails. Check what decides whether Retry renders. Check
when field validation runs (`onChange` from the first keystroke fails) and what clears it. Check
that the submit handler moves focus to the first invalid field.

**Check in the browser.** Make each request fail (block it, return a 4xx and a 5xx). Read the
message and the controls. Submit a form with an error on a field out of view or on another step,
and read `document.activeElement`. Fix the field and check that the error goes away.

**Fix.** Map each failure to a message with its cause and its fix. Gate Retry on retryable
errors. Validate on blur and submit, focus the first invalid field, and clear errors on change.

### long-work-can-stop

**Rule.** An action that runs longer than a few seconds (an agent run, a generation, a bulk job)
has a Stop control while it runs. The control that started it can turn into Stop. Stop keeps the
results that arrived before it and says the run was stopped.

**Why.** With no Stop the user waits for a run they know is wrong, or reloads and loses all of it.

**Check in code.** Find long-running requests and streams. Check for an abort path
(`AbortController`, a cancel endpoint) wired to a visible control, and that the partial results
stay in state after the abort.

**Check in the browser.** Start a run, press Stop partway, and check that the run ends, the
partial results stay and the view says it stopped.

**Fix.** Add an abort path and a Stop control. Keep partial results on abort.

## Layout and spacing

### consistent-gutters

**Rule.** Each block in a content area has the same left and right inset as its siblings. A
block touches the area's edge, a divider or the window edge only when it is a full-bleed bar:
square corners, no side border, no shadow.

**Why.** A card that touches a divider while the content below it starts 45px in looks unfinished,
and the reader cannot tell if it belongs to the area.

**Check in code.** Look for a banner, PSA or notice rendered outside the padded wrapper that its
siblings use, or with `margin: 0` and `width: 100%` inside a padded area. Look for a full-width
bar with `border-radius`.

**Check in the browser.** Run `insets` on the main content area. A child with an inset near 0
while its siblings have a larger inset is a finding. Report both values.

**Fix.** Render the block inside the padded wrapper, or make it a real full-bleed bar.

### same-page-frame

**Rule.** Sibling pages of one app share one frame: the same content max-width, the same left
edge, the same header and the same rails at the same positions. A pane that shows on several
pages (a chat pane, a side rail) sits at the same top offset on each. The gap from a tab bar to
its content is the same on every tab. Switching between sibling pages or tabs moves no persistent
element.

**Why.** When the header or the main column jumps on each click, the app feels like several apps,
and the reader loses the place their eyes were on.

**Check in code.** Check that each route renders inside one shared layout component. Look for
per-page `max-width`, padding or header markup that copies the shared one with other values.

**Check in the browser.** Visit each sibling route at one width. On each, run `snapshot` on the
header, the rails and the main column. More than 1px of difference between routes is a finding.
Do the same for each tab of a tabbed page.

**Fix.** Move the frame into one layout component and use its width and padding tokens.

### aligned-edges

**Rule.** The left edges, baselines and icon centers of sibling elements match within 1px. Labels
in one list start at one x, even when the leading icons or avatars differ in width. An icon in a
row or a breadcrumb is centered on the text's line. Controls of one kind in one row (buttons,
inputs, selects, pill switches, the two parts of a split button) have one height. Cards in one row
have one height, and their footers sit at one y.

**Why.** A 2 to 8px offset reads as a mistake, and the eye has to find each row's start. A button
taller than its neighbor looks like a different kind of control.

**Check in code.** Look for leading icons with no fixed-width slot, avatars and icons of
different sizes in one list, and icons aligned with `vertical-align: baseline` or a fixed
`margin-top`. Look for controls in one row that come from different components, or that set
their own `height` or `padding`. Look for cards in a grid with no `align-items: stretch` and no
footer pinned with `margin-top: auto`.

**Check in the browser.** Collect `getBoundingClientRect().left` of each label in a list, and
compare the vertical center of each icon with its text's center. Run `heights` on the controls of
each toolbar and form row, and on the cards of each row. More than 1px of spread is a finding.

**Fix.** Give leading icons a fixed-width slot. Center icons with `align-items: center` on a flex
row. Use the shared control components and their size tokens. Stretch cards in a row and pin
their footers.

### columns-align

**Rule.** Values that form a column in a list (counts, times, sizes, actions) share one right
edge across sibling rows. A control that shows only on hover either overlays the content or saves
the same space in every row.

**Why.** A ragged column makes the reader scan each row, and it reads as broken. A common cause:
rows with a hover-only action save space for it, and a row without that action does not, so its
count sits further right.

**Check in code.** Look for a row whose trailing slot is conditional
(`{canHide && <HideButton/>}`) next to a count. Look for `visibility: hidden` on some rows and
`display: none` or no element on others. Check that numeric columns use
`font-variant-numeric: tabular-nums`.

**Check in the browser.** Run `rightEdges` on the count selector for one list. More than one
distinct value is a finding. Include the values and the rows they came from. Repeat with a
row in its hover state.

**Fix.** Render the trailing slot in every row with a fixed width, or position the hover control
absolutely over the row's end so it takes no space.

### no-cramped-controls

**Rule.** Adjacent buttons, pills and links have at least 8px between them. Two siblings that each
draw a box (a fill, border or shadow, in any state such as hover or selected) never touch. Items
that wrap to a second line keep the same gap as items on one line. The gap between groups (sections,
menu groups split by a divider, a banner and the block above it) is larger than the gap between
items in a group. A label is closer to its own field than to the next field. Padding and line height
come from the repo's tokens, and body line height is at least 1.3. A box has equal top and bottom
padding.

**Why.** Touching boxes read as one control. Cramped controls cause wrong clicks and look
unfinished. When the gap between groups equals the gap inside them, the reader cannot see the
groups.

**Check in code.** Look for lists of boxed items with no `gap` on the container. Look for
`:hover` or selected rules that add a background or shadow to items that sit flush. Look for
spacing set with a margin on one side of an item, which breaks when the row wraps.

**Check in the browser.** Run `gaps` on the items of each list, at rest and with each item
hovered and selected, and at a width where the row wraps. A gap of 0 between two boxed items is a
finding. Compare the gaps around each divider and section heading with the gaps inside the group,
and each label's gap to its field with its gap to the field before it.
Read the computed `line-height` of body text and the padding of each box.

**Fix.** Put a `gap` on the list container, not a margin on the active item. Use a larger spacing
token between groups than inside them.

### text-fits

**Rule.** Each piece of text wraps or truncates by its kind:

- Prose, descriptions and messages wrap.
- Button labels, dates, short ids in a table column, status pills and table header cells stay on
  one line, or on two lines at most for a header. The layout makes room for them.
- A long value that must stay on one line (a name in a rail, an id in a column) truncates with an
  ellipsis, in the middle when its end tells items apart. Its full value shows on hover and on
  focus in the product's tooltip.
- Text that truncates or clamps never clips the descenders of `g`, `y` and `p`.
- A title of any length leaves its row's controls visible and in place.

**Why.** A date or a button label split over two lines reads as two items. A name cut at its end
hides the part that tells it from its neighbors. A long title that pushes the actions off screen
hides them.

**Check in code.** Look for `white-space: nowrap` on prose and for no `nowrap` on buttons, dates
and pills. Look for `text-overflow: ellipsis` with no tooltip component that holds the full value.
Look for `overflow: hidden` with a `line-height` below 1.2. Check that a title next to actions has
`min-width: 0` and the actions have `flex-shrink: 0`.

**Check in the browser.** At each supported width, find buttons, pills, dates and header cells
whose height is larger than one line (two for a header). Hover each truncated text and read the
tooltip. Set a title to 200 characters and check that the row's controls stay inside the row.
Zoom a screenshot on truncated text with descenders.

**Fix.** Set `nowrap` on short values and wrap on prose. Truncate long values with a tooltip of
the full value. Let the title shrink, not the actions.

### no-horizontal-overflow

**Rule.** At each supported width (for example 375, 768 and 1440), the document and its
containers do not scroll sideways, unless the container is a deliberate horizontal scroller with
a visible affordance. Long identifiers, URLs and code inside prose wrap. A list of ids wraps
between ids, not inside one. Text on one line follows [`text-fits`](#text-fits).

**Why.** Sideways scroll hides content off screen, and readers rarely find it.

**Check in code.** Look for `white-space: nowrap` and long unbroken tokens in narrow panels, and
fixed widths in px inside fluid columns. Code identifiers in prose need `overflow-wrap: anywhere`
or `word-break: break-word`.

**Check in the browser.** Run `overflowing` at each width. Report each element with its
`scrollWidth` and `clientWidth`.

**Fix.** Let the text wrap, or give the block its own scroll with a visible edge.

### fits-the-viewport

**Rule.** The main scroll area's height equals the viewport minus every fixed bar above it,
including banners and PSAs that show only sometimes. Sticky offsets and side rails follow that
header height. A site-wide banner pushes down the sidebars too.

**Why.** A header height fixed in CSS cuts off the bottom of the page when a banner adds height,
and sticky elements slide under the header.

**Check in code.** Look for `height: calc(100vh - 52px)` and other fixed header heights, and
sticky `top` values in px. Check that a banner sets a CSS variable or that the layout uses flex or
grid rows instead.

**Check in the browser.** Turn on the banner or PSA. Scroll to the end of each scroll area and
check that its last content shows. Compare the rail's bottom with the viewport's bottom.

**Fix.** Lay out the shell as a flex or grid column, or set the header height in one CSS variable
that every offset reads.

### no-interaction-shift

**Rule.** An action on one element moves nothing above it or beside it. Content that the action
inserts in the flow (an expanded row, an accordion, "show more") may push the content below it.
These actions move nothing at all: opening a menu, popover or tooltip; hovering or focusing a
row; switching the tabs of one panel (Write and Preview); showing a notice strip in one pane of a
multi-pane layout. A panel keeps one height across its tabs. A drawer that opens beside a list
leaves the list's text wrap as it was, or drops low-priority columns.

`toggle-stays-put` covers the toggle itself. `targets-and-shift` covers content that arrives late. `columns-align` covers the space of
hover-only parts in a row. `layer-order` covers how a floating layer renders.

**Why.** Content that jumps under the pointer makes the next click land on the wrong item. A
modal that grows when a tooltip opens inside it moves its own buttons.

**Check in code.** Look for menus and tooltips rendered in the flow, with no `position: absolute`
or `fixed`. Look for hover, focus or toggle rules that change `display`, `height`, `padding`,
`margin` or `border-width`. Look for tab panels with no shared `min-height`, and a notice strip
rendered inside one pane's column of a shared grid.

**Check in the browser.** Run `snapshot(sel, "before")` on the surface's main blocks and on the
siblings of the element. Do the action, run `snapshot(sel, "after")`, and compare with
`moved("before", "after")`. For the actions that must
move nothing, any other block that moved or resized is a finding. For an expand action, a block
above or beside the element that moved is a finding. Report the action and the deltas.

**Fix.** Float menus and tooltips. Give changing labels and tab panels a fixed width or a minimum
height. Put a notice strip above all panes, or inside the pane as an overlay.

### toggle-stays-put

**Rule.** A toggle (show filters, expand all, a view switch, a sidebar collapse, a theme switch)
stays at the same position and size when the user clicks it, in both of its states. Its label
sits in a slot of fixed width, so "Show" and "Hide" take the same space. The toggle changes only
the region it controls: it opens that region below or beside itself, or over the content as an
overlay. It does not insert content before itself, move to another toolbar, or change the layout
of the page around it (a one-column page that becomes two columns, a header that wraps).

**Why.** The user looks for the toggle where they last clicked it, to undo or check the change.
When the toggle moves, they lose it and have to search the page. A drastic layout change also
discards the user's place in the content.

**Check in code.** For each control with two states (`aria-pressed`, `aria-expanded`, a boolean
in state that it flips), read what renders on each side of it in both states. Look for content
rendered before the toggle in the same row or column, a label with no fixed width, a toggle
rendered in two places (one for each state), and a state that changes `grid-template-columns`,
`flex-direction` or the parent container of the toggle.

**Check in the browser.** Run `snapshot` on the toggle and on the page's main blocks, click the
toggle, run `snapshot` again, and compare with `moved`. Click it again and compare the third
snapshot with the first. Any movement or size change of the toggle itself is a finding. A block
outside the toggled region that moved, resized or rewrapped is a finding. Report both deltas.

**Fix.** Render the toggle once, in a fixed slot. Put the region it opens after it in the flow,
or overlay the region. Give the label a fixed width, or use an icon whose shape changes.

### layer-order

**Rule.** A modal and its overlay sit above every sticky or fixed element. A floating widget
(feedback, chat, toast) never covers a primary action. Menus and popovers near the screen edge
stay on screen and on top.

**Why.** A sticky header over a modal hides its title or close button. A widget over Save blocks
the main task.

**Check in code.** Check that modals render in a portal at the document root. List the `z-index`
values of sticky headers, toasts and widgets and compare them with the modal layer.

**Check in the browser.** Open each modal with the page scrolled so a sticky header is active.
Use `document.elementFromPoint` at the modal's title and close button. At narrow widths, check
what sits on top of the primary action.

**Fix.** Render overlays in a portal. Use the repo's layer tokens.

### overlay-sizing

**Rule.** A popover, menu, tooltip or modal has a max width and shows in full inside the
viewport. A tooltip wraps at its max width and does not run across the page. A menu is as wide as
its longest item needs and does not start or end with a divider. A menu with
no items does not open. A popover may extend past the edge of its trigger, left-aligned with it
while the screen has room. A box around a chart, image or diagram hugs it. An image never displays
wider than its real width.

**Why.** A popover stretched to its input's width wastes space. A modal taller than the screen
hides its actions. A tooltip as wide as the editor is hard to read.

**Check in code.** Look for popovers with `width: 100%` of their anchor, tooltips with no
`max-width`, modals with no `max-height` and inner scroll, and images with `width: 100%` and no
`max-width`. Check what renders when a menu's item list is empty.

**Check in the browser.** Open each popover, menu, tooltip and modal at each width, with the
longest content you can make. Check its rect is inside the viewport and its actions are visible.
Read the first and last child of each menu. Compare an image's rendered width with
`naturalWidth`.

**Fix.** Set a max width on the popover and tooltip. Give the modal a max height with a scrolling
body. Remove the edge dividers. Hide the menu trigger when the list is empty. Position is in
[`popover-anchoring`](#popover-anchoring).

### popover-anchoring

**Rule.** A popover, menu or tooltip renders hidden until it has its position, so it never paints
at the top-left corner first. It attaches to its trigger, or to the selected text it is about,
and does not follow the pointer. It moves with its trigger when an ancestor scrolls, or it
closes when the trigger leaves the view. Scrolling inside it, or scrolling the page while the
trigger stays in view, does not close an open dropdown. A
hover popover stays open while the pointer crosses the gap to it and while it is over the
popover's padding. A tooltip does not flicker while the pointer moves inside one hit region. A
tooltip on a control hides while that control's own menu is open. A popover inside a modal or a
container with `overflow: hidden` shows in full, not cut off by that container. Tooltips use the
product's tooltip component, not the `title` attribute. Stacking order is in
[`layer-order`](#layer-order).

**Why.** A menu that flashes in the corner, chases the pointer or closes when the page moves a few
pixels feels broken, and the user cannot reach the item they aimed for. The `title` attribute shows
late, cannot be styled and does not show on focus or touch.

**Check in code.** Check that floating layers use the repo's shared popover or a positioning
library, with the layer hidden until its first position. Look for positions computed from mouse
events, `scroll` listeners that close the layer, popovers rendered inside an `overflow: hidden`
parent, and `title=` on interactive elements.

**Check in the browser.** Open each layer and take a screenshot right away: a layer at (0, 0) is a
finding. Move the pointer inside the trigger and read the layer's rect: it should stay still.
Scroll the nearest scroll ancestor and compare the offset from the trigger. Move the pointer from
the trigger into the popover's padding and check it stays open. Open a menu inside a modal and
check its rect is not cut by the modal's edge.

**Fix.** Use the shared popover component with collision handling and a portal. Anchor to the
trigger, not the pointer. Add a hover-intent delay that covers the gap.

### clear-scroll-areas

**Rule.** When the user picks another item in a list, the detail pane scrolls to its top, and the
list keeps its own scroll offset. An embedded read-only editor, code view or graph passes the
mouse wheel to the page, or passes it at its scroll limit. A list short enough to show in full
shows in full. Nested scroll areas do not scroll the same way. A fade at the end of a scroll area
does not cover the last item when the area is scrolled to the end. In a feed that grows (chat,
logs), new content scrolls the view only when the reader is already at the bottom, and the
user's own new message scrolls into view. While a drawer or modal is open, the page under it does
not scroll. In a pane longer than the viewport, its header and primary action stay in view.

**Why.** A detail pane that keeps the previous item's scroll opens in the middle. A read-only
editor that captures the wheel traps the reader. A feed that jumps to the bottom while the reader
reads an older message loses their place.

**Check in code.** Look for a detail pane that does not reset `scrollTop` when the selected id
changes. Look for read-only Monaco or CodeMirror instances that consume the wheel, such as Monaco's
`alwaysConsumeMouseWheel`. Look for nested `overflow: auto` containers. Look for a fade overlay
with no bottom padding on the list under it. Check that auto-scroll reads whether the reader is
at the bottom first.

**Check in the browser.** Scroll the detail pane, pick another item, and read `scrollTop` of the
pane and of the list. Scroll the wheel over the read-only editor and check that the page moves.
Scroll each area to its end and check the last item is fully visible. Scroll a feed up, add an
item, and read `scrollTop`. Send a message and check it is in view. Open a drawer, scroll over it
past its end, and read the page's `scrollY`. Scroll a long pane and check its header and primary
action are still in view.

**Fix.** Reset scroll on selection change. Turn off wheel capture in read-only mode. Pad the end
of a faded list by the fade's height. Auto-scroll only from the bottom. Make pane headers and
action bars sticky.

### mobile-layout

**Rule.** At phone width the nav collapses into a menu, a wide table becomes cards or a stacked
list, two-column panels become one column, and page padding shrinks so the content gets the
space. Header controls fold into icons or the account menu before the product name gets cut off.
A segmented switcher keeps its content width. On touch devices, keyboard shortcut hints do not
show, and a drag starts only after a long press, so a swipe scrolls the page.

**Why.** A desktop layout shrunk to 375px leaves tiny text, sideways scroll and no room for the
content.

**Check in code.** Look for a media query or container query for the nav, tables and multi-column
layouts.

**Check in the browser.** Load each changed surface at 375px with touch emulation. Run
`overflowing` and `smallTargets`. Check that the product name in the header is not clipped
(`scrollWidth <= clientWidth`) and that no `kbd` hint is visible. Check that each segmented
switcher is narrower than its container. Swipe over a draggable list and check that the page
scrolls. Take a screenshot.

**Fix.** Add the phone layout for each part that fails.

### targets-and-shift

**Rule.** Each control is at least 24x24 CSS px, or has 24px of clear space around it (WCAG 2.2
target size). The whole editable element is the click target, not only a small icon in it.
Content that loads late (images, async data, fonts, banners) does not move content already on
screen. An item stays where it first rendered. The page's cumulative layout shift stays under 0.1.

**Why.** Small targets cause missed clicks and wrong clicks. Shifting content makes users click
the wrong thing and lose their place while they read.

**Check in code.** Flag icon buttons with no padding or a size under 24px. Flag images without
`width` and `height` or `aspect-ratio`. Flag async regions that render nothing while loading and
then a full block, with no skeleton or reserved height. Flag a banner that renders in one place
while loading and in another after.

**Check in the browser.** Run `smallTargets` at each width the app supports (for example 375,
768 and 1440). Reload, paste `scripts/measure.js` at once, wait for the data, and read `layoutShift()`.
Report the total and the elements it names as sources.

**Fix.** Pad small controls to 24px. Reserve space for late content with fixed dimensions, an
`aspect-ratio` or a skeleton of the final size.

## Controls and icons

### icon-matches-action

**Rule.** An icon promises an action, and the control does that action. A toggle icon (eye,
star, pin, bell) toggles state in place and has `aria-pressed`. A control that goes to another
page is a link (`<a href>`) and uses an arrow or chevron, or no icon. An icon that points a
direction (previous, next) points the right way. A button that opens a panel closes it on a
second click. One action has one icon across the app, and all icons come from one icon set.

**Why.** An eye next to a name reads as "show or hide this item". If a click opens another page,
the user loses their place and stops trusting the other icons.

**Check in code.** For each icon button in the diff, compare the icon name with the handler. A
handler that calls `navigate`, `router.push` or sets `location` behind a toggle icon fails. A
toggle without `aria-pressed` fails. Navigation done in a `<button onClick>` and not in an
`<a href>` fails, because it loses middle-click and "open in new tab". List the icon imports in
the changed files: more than one icon package fails, and so does one action with two icon names.

**Check in the browser.** Click the control. Check whether the URL changes or a state flips in
place. Read `aria-pressed` before and after a toggle. Click a panel's open button twice and check
that the panel closes.

**Fix.** Use a link with a chevron for navigation, or make the toggle a real toggle with
`aria-pressed` and an accessible name that says what it toggles.

### no-decorative-icons

**Rule.** An icon adds meaning. A text link or button whose label is clear needs no icon. A type
icon is not repeated on every row when a filter or header already shows the type.

**Why.** Repeated and decorative icons add noise, and they make the meaningful icons harder to
find.

**Check in code.** List the icons the diff adds. For each, ask what the reader learns from it that
the label next to it does not say.

**Check in the browser.** Count the icons per row in a list. Check whether one value repeats on
every row.

**Fix.** Remove the icon, or move one copy to the filter or header.

### no-dead-controls

**Rule.** Each visible control does what it shows: a button has a handler that changes something
the user can see, a link has a target that exists, each menu item acts, and a command or nav item
lands on the page its label names. A control for a feature the current context does not support
(an upload button where uploads do not work, a kill switch for a flag that does not exist) is not
rendered. A dot or badge shows only for a real state, such as unread or new. Every screen has a
visible way out: back, close or a parent link.

`disabled-says-why` covers a control that the user cannot use now but could later.

**Why.** A control that does nothing, or a toast as its only result, teaches the user that the
UI cannot be trusted. A dot with no meaning pulls attention to nothing. A screen with no exit
traps the user.

**Check in code.** For each button and menu item in the diff, find its handler and what it
changes. A no-op, a `TODO` or a toast with no other effect fails. For each link and nav command,
check that the route exists and renders the named page. Check the condition behind each badge and
dot. Check that controls for optional features read the feature's availability.

**Check in the browser.** Click each control on the surface and record what changed: URL, view,
state. A click with no visible change is a finding. Compare each landing page's heading with the
label that led there. On each screen, find the way back or out.

**Fix.** Wire the control, remove it, or hide it where its feature is not available. Add a back,
close or parent link to each screen.

### one-control-per-concept

**Rule.** A screen has one control per concept, such as one entity type filter. The same kind of
input uses the same control across a form. Each action has one trigger, not a hover pencil plus a
click on the row, and not a hover button that does what a click on the row does. A row shows each
badge once. A page shows one breadcrumb. A pair of actions that shows on several surfaces keeps
one order. New pages reuse the design system's components and patterns.

**Why.** Two controls for one concept make the user wonder which one wins. A custom control next
to a design-system one looks unfinished.

**Check in code.** List the filters, toggles and inputs on the surface and group them by what they
set. More than one per concept fails. Flag local components that copy a design-system component.
Flag a row with a hover button and a row click handler that go to one place.

**Check in the browser.** Change one of two duplicate controls and check whether the other
follows. Count the breadcrumb elements on the page and the copies of each badge in a row. Compare
the order of a repeated action pair (Copy and Open, Save and Cancel) across surfaces.

**Fix.** Keep one control. Replace local copies with the shared component.

### one-selection-system

**Rule.** A control that switches a view or a mode is one of three kinds, drawn the same way
everywhere:

- A boxed control (a bordered or filled container) is a pill switch: the selected option sits on
  a pill.
- A tab row marks the selected tab with an underline and has no box around it.
- Tabs on a box's top edge open into the box: the selected tab takes the box's border and fill,
  and covers the line under the tab row.

**Why.** Mixed systems make the reader learn each control again. An underline inside a box, or a
folder tab that does not join its box, reads as a different control or a layout bug.

**Check in code.** List each segmented control, toggle group and tab list the diff adds or
changes. Check that each one uses the repo's shared component for its kind and not local CSS.

**Check in the browser.** For each such control, read the computed `border`, `background` and
`box-shadow` of the selected option and of its container. An underline (`border-bottom` or an
inset bottom shadow) on a selected option inside a bordered container fails. A selected folder
tab whose bottom edge does not overlap the box's top border fails.

**Fix.** Use the kind that matches the container: pill inside a box, underline in an open row,
joined tab on a box's edge.

### control-fits-the-data

**Rule.** A form input matches the kind of value it takes:

- A choice among a few options (about four or fewer) shows them all, as a segmented control,
  radio cards or radio buttons.
- A choice from a longer list is the product's dropdown or combobox, with type-ahead when the
  list is long. A native `<select>` is used only where the repo's design system uses one.
- A value that has known options but also accepts others is a combobox that accepts free text.
- A field that takes several values accepts several, and wraps its chips inside its width.
- Long text gets a textarea. Code, JSON and queries get a monospace editor.
- A value the app can derive is filled in for the user.

An open combobox shows the full list with the current value marked, not only the current value.
Clicking the field itself opens and closes it. An option whose name is not clear has a short
description under it.

**Why.** A free-text field for a value from a known list invites typos. A dropdown for two
options hides a choice that fits on screen. A native select ignores the app's theme and search.

**Check in code.** For each field in the changed forms, compare the control with the field's
type and its option source. Search for `<select` in the changed files. Look for text inputs bound
to enums or to values that a list endpoint returns. Check the combobox's filter on open.

**Check in the browser.** Open each combobox that has a value and count the options shown. Click
the field twice and check that the list opens and closes. Add several values to a multi-value
field and check that it wraps, not scrolls.

**Fix.** Swap the control for the one that fits the value, from the repo's component library.

### hover-also-focus-touch

**Rule.** A control that appears on hover also appears on keyboard focus (`:focus-visible` or
`:focus-within` on its row). On touch devices it is always visible.

**Why.** Keyboard users cannot hover, and touch screens have no hover. Without these cases, the
control cannot be reached.

**Check in code.** For each `:hover` rule that changes `opacity`, `visibility` or `display`,
check for a matching `:focus-within` or `:focus-visible` rule and a
`@media (hover: none)` rule.

```css
.row .action { opacity: 0; }
.row:hover .action,
.row:focus-within .action { opacity: 1; }
@media (hover: none) {
  .row .action { opacity: 1; }
}
```

**Check in the browser.** Tab to the control and read its computed `opacity` and `visibility`.
Emulate a touch device (mobile viewport with touch) and read them again.

**Fix.** Add the focus and `hover: none` rules.

### no-native-dialogs

**Rule.** The UI does not call `window.alert`, `window.confirm` or `window.prompt`. It asks in an
in-app dialog. The dialog's primary button names the action ("Start 3 reviews", "Delete
branch"), not "OK".

**Why.** Native dialogs block the page, ignore the app's theme and focus handling, cannot be
styled or tested well, and some embedded browsers suppress them. "OK" does not tell the user what
they agree to.

**Check in code.** Search the changed files:

```bash
grep -rnE '\b(window\.)?(alert|confirm|prompt)\s*\(' <changed files>
```

Ignore method calls on other objects (`session.prompt(...)`), comments and strings. Check each
dialog's primary button label.

**Check in the browser.** Trigger each destructive or confirming action. A native dialog shows
as a `dialog` event in the browser tool. Check that the in-app dialog traps focus, closes on
Escape and returns focus to the trigger.

**Fix.** Use the repo's dialog component. Name the primary button with the verb and the object.

## Content and forms

### no-empty-filler

**Rule.** A stat or a sentence shows only when its value can change what the reader does next. A
section whose rows are all zero or empty is hidden. A count with no data does not get a sentence
of its own. Helper copy does not explain the rule a second time.

**Why.** "You dismissed none of the last 4 findings" uses two lines to say nothing. Filler pushes
the useful content down and teaches the reader to skip the area.

**Check in code.** Find text built from a count or a list. Check what renders when the count is 0
or the list is empty. A template like `` `You dismissed ${n === 0 ? "none" : n} of …` `` with no
guard fails. Check sections that render a list of stats for an all-zero guard.

**Check in the browser.** Load the surface with empty or zero data (a fixture, a new account, a
filter that matches nothing). Read the text of the surface. Report each line that states a zero or
an absence the reader cannot act on.

**Fix.** Return `null` for the zero case, or merge the zero case into a short empty state that
says what to do next.

### labels-name-the-action

**Rule.** A button names what it does and whether it saves: "Confirm" for a step that stages a
change, "Save" only for a step that saves. One concept has one term across the product. Labels
use human words, not identifiers (`key_metrics`), service names or implementation details ("Written
to fence"). A short tier or category name carries its noun ("High risk call", not "High call"), and
a bare number carries its unit ("97% confidence", not "97%"). A column header names what its cells
hold. A compact pill may use a short label when its menu shows the full one.

**Why.** A label that overstates the action ("Save rule" that saves nothing) scares or misleads
the user. Two terms for one concept make them look for a difference that is not there.

**Check in code.** Read every new label and button text in the diff. Compare terms with the
labels on related pages. Flag identifiers rendered as text.

**Check in the browser.** Click each button and compare what happens with its label.

**Fix.** Rename to the verb and object of the real action. Pick one term and use it everywhere.

### safe-traceable-defaults

**Rule.** A default value is valid, safe and explainable: a future date for a future action, 0%
exposure rather than 100%, a team the user can trace. A dependent field clears when the field it
depends on changes. A list with one choice selects it. A required field with no safe default
starts empty, with no value chosen for the user. Nothing on a page shows as selected or
highlighted on first load unless the user chose it or the URL names it. Opening a page does not
open a menu. Error placement is in [`errors-lead-to-fix`](#errors-lead-to-fix).

**Why.** A wrong prefill gets saved unread. A dependent field that keeps an old value creates a
mismatch the user does not see. A highlight with no cause makes the user look for a reason.

**Check in code.** Read each `defaultValue` and initial state. Check the effect or handler that
runs when a parent field changes. Look for `autoFocus` on a combobox and for an initial selected
id that comes from neither the user nor the URL.

**Check in the browser.** Open the form fresh. Change each parent field and read its dependents.
Load each page and check for open menus and highlighted items.

**Fix.** Use safe defaults, clear dependents on change, and start with no selection.

### same-data-same-view

**Rule.** Two views of the same value show the same value in the same format: the same phases,
the same names, the same links. One status has one label and one color on every surface, and
severity colors (warning, error, success) come from the repo's status tokens. One person has one
avatar everywhere. A relative time ("3h ago") shows the full date and time on hover, in the
user's locale. Items of one kind in one row behave the same (all clickable, or none). One rule
behaves the same on every entity type.

**Why.** When the summary and the detail disagree, the user trusts neither. A status that is
green in the list and gray in the header reads as two states.

**Check in code.** Find where each view reads the value. Two formatters or two derivations of one
value fail. Compare the props passed to sibling items in a row. Find each place that maps a
status to a color and check that they share one map.

**Check in the browser.** Open both views of one item and compare the values, their format and
their colors. Hover each relative time.

**Fix.** Share one formatter, one status map and one source for the value.

### references-link-out

**Rule.** A reference to another entity (a PR, a repo, a metric, a flag, a translation key)
shows its canonical name or id, not a generic phrase ("acme/web", not "the web repository"),
and links to its page in the system that owns it. Where the name alone does not say enough, hover
or focus shows a short preview. Code, queries, commands, branch names and ids have a copy
control. Prose does not. A link to another origin opens in a new tab with `rel="noopener"`. A link
inside the app opens in place, unless leaving would lose unsaved work.

**Why.** A reader who sees a bare id has to search for it. A generic phrase hides which entity it
means. A copy button on prose is noise, and a missing one on a query makes the user select text by
hand.

**Check in code.** For each reference the diff renders, check that it is a link to the owning
system and that its text is the canonical name. Check each `pre`, code block and id field for a
copy control. Compare each link's origin with its `target`.

**Check in the browser.** Hover each reference. Click each copy control and read the clipboard.
Click each external link and check that a new tab opens.

**Fix.** Render references through one component that takes the id and builds the link, the
label and the preview.

### filters-show-state

**Rule.** An active filter shows on screen, with a control that clears it. The filter trigger names
its current scope ("All surfaces" when nothing is picked). A filter removes the items that do not
match; it does not dim them. Counts, stats and summaries on the page follow the active filter. A
filtered view opened from a link shows its filter and the way to clear it. Clearing a search resets
its pagination.

**Why.** A filter the user cannot see makes the list look incomplete. A count that ignores the
filter disagrees with the list next to it.

**Check in code.** Find the filter state and each component that reads the list. A count or stat
computed from the unfiltered list fails. Check that the trigger label reads the filter state.

**Check in the browser.** Apply each filter. Read the trigger label, the counts and the number of
rows. Look for the clear control and use it. Open a filtered link in a new tab.

**Fix.** Show active filters with a clear control. Compute counts from the filtered list.

### chart-legibility

**Rule.** In a chart, no label, legend or value overlaps another label or a mark it does not
belong to. A label that does not fit its segment is shortened or hidden, and its full text shows on
hover. A hover label or tooltip stays inside the chart, near the mark it describes, and does not
cover the chart's own controls. A chart is no taller than it is wide, unless it is a list of
horizontal bars with one bar per row. A color, width or size that carries meaning has a legend.

**Why.** Overlapping labels cannot be read. A tooltip over the toolbar blocks the controls. A tall
narrow bar chart makes small differences look large.

**Check in code.** Check the label layout for collision handling or a rule that hides small
labels. Check the chart's aspect ratio or height rule. Check for a legend when color or size
encodes a field.

**Check in the browser.** Run `overlaps` on the chart's text nodes and on its controls together
with its tooltip. Hover the first and last marks and check the tooltip rect is inside the chart.
Compare each chart's height with its width.

**Fix.** Use collision handling or hide labels below a size. Clamp the tooltip inside the plot.
Cap the chart's aspect ratio. Add the legend.

### ai-mark

**Rule.** Content an AI wrote (a summary, a suggested reply, a generated title) carries the
repo's AI mark, placed before its title, or before the text when it has no title. Text a person
wrote carries no mark. A person's edit of AI text follows the repo's rule for edited content.

**Why.** Readers weigh AI text differently from a colleague's words. A missing mark misleads. A
mark on human text accuses the author.

**Check in code.** For each new text surface, trace where its string comes from. Generated text
without the mark component fails. The mark on a field a person fills in (a PR description, a
comment, a renamed title) fails.

**Check in the browser.** Find the mark element on each AI surface. Check that its accessible
name or tooltip says it is AI-written, and from what source if the repo records one.

**Fix.** Add the mark to AI surfaces and remove it from human ones.

## Navigation

### navigation-keeps-place

**Rule.** Back returns to the page the user came from, at the scroll position they left. Where a
page has more than one way in, a breadcrumb shows the path, and each of its parts except the last
is a link to a real parent page. A multi-step flow has a Back control on every step after the
first. A top-level nav item opens its index page, not an item in it. A reload keeps the view,
because its state is in the URL. A link that filters a list lands on results. Filter state is in
[`filters-show-state`](#filters-show-state).

**Why.** A back button that always goes to one fixed page loses the user's place. State held only
in memory is lost on reload and cannot be shared.

**Check in code.** Find back buttons with a fixed target and no `history.back()`. Find view
state (tab, filter, selected item) kept in component state and not in the URL. Check each
breadcrumb part for an `href`.

**Check in the browser.** Reach the page from two different places and press back from each, and
read `scrollY` after back. Reload each view. Open each filter link and check the result count.
Click each top-level nav item and each breadcrumb part. Step through each multi-step flow and look
for Back on each step after the first.

**Fix.** Use history back or a breadcrumb. Put view state in the URL.

### page-titles

**Rule.** Each route sets a document title that names its content, in one pattern across the app
("Order 1042 · Orders · Admin").

**Why.** Users find tabs, history entries and bookmarks by title. One title on every page makes
them all look alike.

**Check in code.** Check that each route sets `document.title` or uses the repo's title helper.

**Check in the browser.** Visit each changed route and read `document.title`.

**Fix.** Set the title per route with the shared pattern.

### section-permalinks

**Rule.** On a long document page (a report, a doc, a help page), each `h2` to `h4` has a stable
`id` and a permalink control that shows on hover and on keyboard focus. A table of contents links
to the same ids and marks the section in view. Opening a URL with a `#id` scrolls to that section
after the content that comes before it has rendered. A jump to a target (a footnote, a search
hit) highlights the target for at least one second after the scroll ends.

**Why.** A reader who wants to point a colleague at one section has to send the whole page and a
description. A `#id` link that scrolls before late content renders lands in the wrong place.

**Check in code.** Check that headings get ids, that ids are unique, and that a permalink anchor
renders inside each heading. Check that the hash scroll runs after the async content loads.

**Check in the browser.** Tab to a heading's permalink and read its `opacity`. Load the page with
a `#id` on a slow network and read the heading's `getBoundingClientRect().top` after the content
loads. Click a table of contents entry and check the marked entry.

**Fix.** Generate ids from heading text, render the permalink, and scroll to the hash after load.

## Visual system

### type-tokens

**Rule.** Font size, line height and weight come from the repo's type tokens, not raw values.
One heavy weight (for example 600) sets the view's one title. Emphasis inside text uses a lighter
weight (for example 500). A section title is smaller than the page title and larger than the
controls next to it. Monospace is for code, ids and keyboard keys. Labels, headers, counts and
prose use the sans face, with tabular numerals where numbers line up or change in place. The font
is plain and legible. A new link matches the size and color of the links next to it.

**Why.** Raw values drift, and several bold elements in one view compete with the title and with
each other.

**Check in code.** In changed CSS and `style` props, flag `font-size`, `line-height` and
`font-weight` set to a literal where the repo has tokens. Count the heavy weights per view. Find
each use of the monospace token or family and check that it renders code, an id or a key.

**Check in the browser.** Collect the computed `font-weight` of every visible text element in the
view. More than one element group at the heavy weight is a finding, unless the repo's rules allow
it. Compare the computed `font-size` of each section title with the page title and with the
controls in its row. List the elements whose `font-family` is monospace and read their text.

**Fix.** Use the tokens. Drop emphasis to the lighter weight. Move labels and counts to the sans
face.

### theme-contrast

**Rule.** Every changed surface works in light and dark and in every theme the app offers. Body
text has a contrast ratio of at least 4.5:1 against its background. Large text (24px, or 18.66px
bold) and UI parts such as icons and borders need at least 3:1.

**Why.** A change is usually built and checked in one theme. Hard-coded colors break the others.

**Check in code.** Flag literal colors (`#hex`, `rgb()`, named colors) in changed CSS and `style`
props where the repo has color tokens. Check that each new token has a value in every theme and
scheme.

**Check in the browser.** Load the surface in each theme and scheme. For each visible text
element, run `contrast(getComputedStyle(el).color, backgroundOf(el))`. Report the element, theme,
scheme, both colors and the ratio for each failure.

**Fix.** Use the theme tokens. Add the missing theme values.

### no-edge-stripe

**Rule.** A callout or card shows its kind (info, warning, error, source) with an icon, a pill, a
dot or a tinted header. It does not use a thick colored left border, an inset shadow drawn as an
edge stripe, or a narrow bar element at its left edge. A blockquote's left rule is fine.

**Why.** The stripe is the default look of generated UI. It is easy to miss, it carries meaning
by color alone, and stacked cards with different stripes look noisy.

**Check in code.** In changed CSS and `style` props, look for `border-left` or
`border-inline-start` wider than 1px, a fourth `border-width` value over 1px, an inset
`box-shadow` with an x offset of 2px or more and no blur, and an absolutely placed element 2 to
6px wide at `left: 0` with full height.

**Check in the browser.** Read `getComputedStyle(card).borderLeftWidth` and compare it with the
other three sides.

**Fix.** Replace the stripe with an icon or pill in the card's header, or a tinted header row.

### no-nested-boxes

**Rule.** A bordered or shadowed container does not sit inside another one. Group content with
space, a heading or a tint instead. A figure, chart or screenshot inside a card gets no bordered
wrapper of its own.
Two borders do not touch to form a double line. A copy or icon button inside a box has no box of
its own. Inputs, code blocks and controls inside a card are not counted.

**Why.** Boxes inside boxes add lines without adding meaning. They use up the width, and the
reader cannot tell which box is the group.

**Check in code.** Look for a card, panel or bordered `div` rendered as a child of another card
or panel, and for wrapper elements whose only job is a border around a figure.

**Check in the browser.** Run `nestedBoxes` on the main area. Report each inner and outer pair.
Look for two adjacent elements whose touching sides both have a border.

**Fix.** Remove the inner border and keep the spacing, or merge the two boxes.

### no-stray-corners

**Rule.** A corner radius shows only on a box the user reads as whole: one with a full border, a
fill or a shadow. A row divider (a top or bottom border alone) has square ends. Where a row gets a
rounded fill on hover or when selected, the radius goes on that fill, not on the element that
draws the divider. A row's divider runs to the same edges as the dividers of its siblings.

**Why.** A divider with a radius curls up at both ends, so at rest each row shows two small arcs and
a line that stops short of the list's edge. It reads as a rendering glitch, and it appears only in
the state that nobody designed: the row when it is not hovered.

**Check in code.** Look for a list row with `border-radius` and a one-side border
(`border-top` or `border-bottom`), often because the radius was added for a hover fill. Look for a
`:hover` or selected rule that adds a radius to an element that already draws a divider.

**Check in the browser.** Run `strayCorners(sel)` on the rows at rest, then again with each row
hovered and selected. Any match is a finding. Report the radius and the sides that draw a border.

**Fix.** Draw the dividers on the list (a `gap` with a background, or a border on each row's
wrapper), or on a full-width pseudo-element. Put the radius and the fill on the hover state alone,
or inset the fill with a pseudo-element so that it does not touch the divider.
