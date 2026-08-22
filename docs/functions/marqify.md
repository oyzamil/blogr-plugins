[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / marqify

# Function: marqify()

> **marqify**(`input`, `options?`): [`MarqifyInstance`](../interfaces/MarqifyInstance.md)

Defined in: [src/plugins/marqify.ts:538](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/marqify.ts#L538)

Turns a container's children into an infinitely-scrolling CSS marquee —
logos, card rows, testimonial strips, anything you'd otherwise reach for
a heavier carousel library for. Ports the reps/duration calculation from
the [marqy](https://github.com/abnud1/marqy) web component into an
imperative plugin: pass it a container of items instead of a custom
element, and it rebuilds that container into a seamless, duplicated
marquee track sized to always fill it, regardless of viewport width.

Injects a small stylesheet into `<head>` the first time it's called
(once per page, however many containers you marquee).

Also doubles as a **ticker**: pass `type: "ticker"` and instead of a
continuous scroll, one child at a time is shown, sliding out to make way
for the next in the direction you configure (`"left"` / `"right"` /
`"top"` / `"bottom"`). Advance it with the returned instance's
[MarqifyInstance.next](../interfaces/MarqifyInstance.md#next) / [MarqifyInstance.previous](../interfaces/MarqifyInstance.md#previous) — e.g.
from a pair of prev/next buttons.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection for the
container(s) whose children should marquee/tick.

### options?

[`MarqifyOptions`](../interfaces/MarqifyOptions.md) = `{}`

[MarqifyOptions](../interfaces/MarqifyOptions.md)

## Returns

[`MarqifyInstance`](../interfaces/MarqifyInstance.md)

A [MarqifyInstance](../interfaces/MarqifyInstance.md) — `destroy()` disconnects the resize
observers and restores the container's original content; `next()` /
`previous()` step the ticker (no-ops when `type` is `"marquee"`).

## Examples

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

instance.destroy();
```

**Ticker**

```html
<div class="announcements">
	<div>📣 New release shipped</div>
	<div>🐛 Fixed a nasty bug</div>
	<div>🎉 100 stars on GitHub</div>
</div>
<button id="prev">‹</button>
<button id="next">›</button>
```
```ts
import { marqify } from "blogr-plugins";

const ticker = marqify(".announcements", {
	type: "ticker",
	direction: "top",
	speed: "medium",
});

document.getElementById("next").addEventListener("click", () => ticker.next());
document.getElementById("prev").addEventListener("click", () => ticker.previous());
```
