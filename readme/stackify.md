# stackify

Turns a container's children into a peeking card stack — like a small deck
of index cards — that auto-cycles the front card to the back on a timer.

```html
<div id="testimonials">
	<div class="card">...</div>
	<div class="card">...</div>
	<div class="card">...</div>
</div>
```

```ts
import { stackify } from "blogr-plugins";

const stack = stackify("#testimonials", {
	offset: 20,
	interval: 4000,
	pauseOnHover: true,
});

stack.next();     // advance manually
stack.prev();     // or go back
stack.goTo(2);    // bring the 3rd original card to the front
stack.pause();    // stop the auto-cycle timer
stack.play();     // resume it
stack.getActiveIndex(); // -> [<original index currently in front>]

stack.destroy(); // restores every card's original styles
```

---

## `stackify(target, options?)`

```ts
function stackify(
	target: ElementInput,
	options?: StackifyOptions,
): StackifyInstance;
```

### `target`

A CSS selector, a single `Element`, an array/`NodeList` of elements, or a
jQuery collection — one stack instance per matched container.

### `options`

All options are optional.

| Option            | Type                              | Default              | Description |
| ------------------ | ---------------------------------- | --------------------- | ------------- |
| `offset`            | `number`                           | `20`                  | Px peek between cards — implemented with absolute positioning |
| `scaleStep`         | `number`                           | `0`                   | Shrinks each card behind the front by this fraction (depth effect) |
| `visibleCards`      | `number`                           | every card            | How many cards stay visible; further-back ones fade to `opacity: 0` |
| `interval`          | `number`                           | `3000`                | Ms between automatic cycles. `0` disables the timer |
| `autoplay`          | `boolean`                          | `true`                | Whether the timer starts immediately |
| `duration`          | `number`                           | `500`                 | Transition duration (ms) for card movements |
| `easing`            | `string`                           | `"ease"`              | CSS timing function for transitions |
| `direction`         | `"forward" \| "backward"`          | `"forward"`           | `"forward"` = front→back; `"backward"` = back→front |
| `pauseOnHover`      | `boolean`                          | `true`                | Pause the timer while pointer is over the stack |
| `clickToActivate`   | `boolean`                          | `true`                | Clicking a non-front card brings it to the front |
| `draggable`         | `boolean`                          | `false`               | Lets the front card be dragged/swiped left/right to advance |
| `startIndex`        | `number`                           | `0`                   | Original index of the card that starts in front |
| `activeClass`       | `string`                           | `"stackify-active"`   | Class toggled on the current front card |
| `cardClass`         | `string`                           | `"stackify-card"`     | Class added to every card |
| `stackClass`        | `string`                           | `"stackify-stack"`    | Class added to the container |
| `onBeforeChange`    | `(detail) => void`                 | —                     | Called right as a transition begins |
| `onAfterChange`     | `(detail) => void`                 | —                     | Called once a transition finishes |

---

## Option details

### `offset`

Pixels of "peek" between a card and the one behind it — implemented with
absolute positioning (not CSS margin) so it stays correct regardless of
card height.

### `scaleStep`

Optional depth effect: each card behind the front is shrunk by this fraction.
Example: `scaleStep: 0.05` shrinks each card 5% compared to the one in front.

### `visibleCards`

How many cards (including the front) stay visible. Cards beyond this count
fade to `opacity: 0`. Leave unset to show all cards.

### `interval`

Milliseconds between auto-cycles. Set to `0` to disable auto-cycling entirely
— useful for manual controls only.

### `autoplay`

Whether the timer starts immediately on init. Can be toggled with `.play()` /
`.pause()`.

### `duration` / `easing`

Transition animation for card movements. `duration` in ms, `easing` as a
CSS timing function string.

### `direction`

- `"forward"` — front card moves to the back each cycle
- `"backward"` — back card moves to the front each cycle

### `pauseOnHover`

When `true`, the auto-cycle pauses while the pointer is over the stack.

### `clickToActivate`

When `true`, clicking a non-front card brings it to the front immediately.

### `draggable`

When `true`, the front card can be dragged/swiped left to advance or right
to go back.

### `startIndex`

Original DOM index (0-based) of the card that starts in front. Useful if you
want to display the 2nd or 3rd card first instead of the 1st.

### `activeClass` / `cardClass` / `stackClass`

CSS class names applied to the container and cards. Style with these selectors
in your CSS.

### `onBeforeChange` / `onAfterChange`

Lifecycle callbacks fired during transitions.

```ts
onBeforeChange: ({ fromIndex, toIndex, fromCard, toCard }) => {
	console.log(`Transitioning from card ${fromIndex} to ${toIndex}`);
}
```

Receive `{ fromIndex, toIndex, fromCard, toCard }` where indices are the
original DOM order (stable regardless of how many cycles have occurred).

---

## Return value — `StackifyInstance`

```ts
interface StackifyInstance {
	next(): void;
	prev(): void;
	goTo(index: number): void;
	play(): void;
	pause(): void;
	getActiveIndex(): number | number[];
	destroy(): void;
}
```

### Methods

- **`next()`** — advance one card (respect `direction`).
- **`prev()`** — go back one card.
- **`goTo(index)`** — bring the card at original DOM index `index` to the front.
- **`play()`** — start the auto-cycle timer.
- **`pause()`** — stop the auto-cycle timer.
- **`getActiveIndex()`** — get the original index of the front card (or an array if
  multiple containers were matched).
- **`destroy()`** — stops the timer, removes all applied classes, and restores
  original card styles.

If `target` matches more than one container, `next()`/`prev()`/`goTo()` /
`play()`/`pause()` control every matched stack together, and `getActiveIndex()`
returns one entry per stack.

---

## Styling

`stackify` doesn't inject any visual styling (shadows, borders, radius) —
only the structural positioning it needs to work. Style `.stackify-card`
and `.stackify-active` yourself in your CSS, or see
[`demo/stackify.html`](./demo/stackify.html) for a full example matching
a typical testimonial-card look.

---

## Formats & builds

Like every plugin in this package, `stackify` ships in three forms:

- **ESM / CJS** (`import { stackify } from "blogr-plugins"`), for
  bundled projects.
- **Standalone IIFE** — `dist/stackify.js` — exposes
  `window.BlogrPlugins.stackify`, for a plain `<script>` tag with no
  build step.
- **jQuery bridge** — if `jQuery`/`$` is present on the page when the
  script loads, `$(selector).stackify(options)` is registered
  automatically.

```html
<script src="https://unpkg.com/blogr-plugins/dist/stackify.min.js"></script>
<script>
	BlogrPlugins.stackify("#testimonials", { offset: 20, interval: 4000 });
	// or, with jQuery loaded first:
	$("#testimonials").stackify({ offset: 20, interval: 4000 });
</script>
```