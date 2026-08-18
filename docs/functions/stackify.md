[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / stackify

# Function: stackify()

> **stackify**(`input`, `options?`): [`StackifyInstance`](../interfaces/StackifyInstance.md)

Defined in: [src/plugins/stackify.ts:1053](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/stackify.ts#L1053)

Turns a container's children into a peeking card stack — like a small
deck of index cards — that auto-cycles the front card to the back on a
timer, cycling through every card in turn.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection for the
*stack container* (its children become the cards).

### options?

[`StackifyOptions`](../interfaces/StackifyOptions.md)

Optional [StackifyOptions](../interfaces/StackifyOptions.md). If omitted, reads from
container's `data-*` attributes.

## Returns

[`StackifyInstance`](../interfaces/StackifyInstance.md)

A [StackifyInstance](../interfaces/StackifyInstance.md) — `destroy()` restores every card's
original styles; `next()`/`prev()`/`goTo()`/`play()`/`pause()` drive the
stack programmatically.

## Example

```html
<div id="testimonials"
  data-layout="stack"
  data-offset="20"
  data-interval="4000"
  data-duration="500"
  data-stack-direction="right">
	<div class="card">...</div>
	<div class="card">...</div>
	<div class="card">...</div>
</div>
```
```ts
import { stackify } from "blogr-plugins";

// Read all options from data-* attributes
const stack = stackify("#testimonials");

// Or override specific options
const stack2 = stackify("#other", { interval: 2000, stackDirection: "all" });

stack.next(); // advance manually
stack.destroy();
```
