[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / readMeter

# Function: readMeter()

> **readMeter**(`input`, `options?`): [`ReadMeterInstance`](../interfaces/ReadMeterInstance.md)

Defined in: [src/plugins/readMeter.ts:299](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/readMeter.ts#L299)

Estimates reading time for one or more content blocks — word count
(optionally splitting out code blocks at a slower reading speed) plus
optional flat per-image time — and renders it as a small badge, e.g.
`"Read time: 5"`.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection for the
container(s) to analyze. By default the whole container's text is
measured; use `options.includeElements`/`options.excludeElements` to
narrow that down to specific children.

### options?

[`ReadMeterOptions`](../interfaces/ReadMeterOptions.md) = `{}`

[ReadMeterOptions](../interfaces/ReadMeterOptions.md)

## Returns

[`ReadMeterInstance`](../interfaces/ReadMeterInstance.md)

A [ReadMeterInstance](../interfaces/ReadMeterInstance.md) — `refresh()` to force an
immediate recalculation, `destroy()` to remove any inserted badges and
stop listening for resize.

## Example

```ts
import { readMeter } from "blogr-plugins";

readMeter(".post", {
	includeElements: ["article"],
	excludeElements: [".share-buttons", ".author-bio"],
	wordsPerMinute: 200,
	includeImages: true,
	format: "text",
	appendTo: ".post-meta",
});
```
