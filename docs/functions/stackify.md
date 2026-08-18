[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / stackify

# Function: stackify()

> **stackify**(`input`, `options?`): [`StackifyInstance`](../interfaces/StackifyInstance.md)

Defined in: [src/plugins/stackify.ts:955](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/stackify.ts#L955)

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
  data-duration="500">
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
const stack2 = stackify("#other", { interval: 2000 });

stack.next(); // advance manually
stack.destroy();
```
