# marqify

Turns a container's children into an infinitely-scrolling CSS marquee —
logos, card rows, testimonial strips — sized to always fill the container
regardless of viewport width. Ports the reps/duration calculation from the
[marqy](https://github.com/abnud1/marqy) web component into an imperative
plugin: pass it a container of items instead of a custom element.

**Injects a small stylesheet into `<head>`** (once per page, id
`marqify-styles`, however many containers you marquee) the first time it's
called — no separate CSS file to import.

```html
<div class="cards">
	<div class="card">Card A</div>
	<div class="card">Card B</div>
	<div class="card">Card C</div>
</div>
```

```ts
import { marqify } from "blogr-plugins";

const instance = marqify(".cards", {
	direction: "left",
	speed: "fast",
	pauseOnHover: true,
});

instance.destroy(); // disconnects observers, restores the original content
```

Also works as a jQuery plugin (`$(".cards").marqify({ speed: "fast" })`) —
it fits the classic `$(sel).plugin(options)` shape.

---

## `marqify(target, options?)`

```ts
function marqify(
	target: ElementInput,
	options?: MarqifyOptions,
): MarqifyInstance;
```

### `options`

| Option | Type | Default | Description |
|---|---|---|---|
| `direction` | `"left" \| "right"` | `"left"` | Which way the content scrolls |
| `delayBeforeStart` | `number` | `0` | Delay (ms) before the marquee starts moving. `0` = no delay |
| [`duplicated`](#duplicated) | `boolean` | `true` | Duplicates the content so the loop is seamless. `false` renders it once — the animation still runs, but jumps back to the start each cycle instead of looping smoothly |
| `pauseOnHover` | `boolean` | `true` | Pauses while the pointer is over it |
| [`speed`](#speed) | `"slow" \| "medium" \| "fast" \| number` | `"medium"` | Named presets map to `0.25` / `0.5` / `1` (higher = faster); pass a number directly for finer control |

---

## Option details

### `duplicated`

On by default, so the scroll loop reads as seamless — the content is
duplicated and the animation hands off from the original set to the copy.
Turn it off to render the content once; the animation still runs, but
visibly jumps back to the start at the end of each cycle instead of
looping smoothly.

### `speed`

Named presets (`"slow"`, `"medium"`, `"fast"`) map to `0.25`, `0.5`, and
`1` respectively — higher values scroll faster. Pass a plain number
instead of a preset for finer control over the rate.

---

## Injected stylesheet

The first call to `marqify` on a page injects a small stylesheet into
`<head>` (id `marqify-styles`) to support the scrolling animation — this
happens once per page regardless of how many containers you marquee, not
once per call.

---

## Return value — `MarqifyInstance`

```ts
interface MarqifyInstance {
	destroy(): void;
}
```

- **`destroy()`** — disconnects any observers and restores the container's
  original (non-duplicated) content.

```ts
const marquee = marqify(".cards", { speed: "fast" });
// later:
marquee.destroy();
```

---

## jQuery bridge

`marqify` fits the classic `$(sel).plugin(options)` jQuery shape, so it
**does** get the jQuery bridge: `$(".cards").marqify({ speed: "fast" })`.