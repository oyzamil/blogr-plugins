[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / tocify

# Function: tocify()

> **tocify**(`input`, `options?`): [`PluginInstance`](../interfaces/PluginInstance.md)

Defined in: [src/plugins/tocify.ts:49](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/tocify.ts#L49)

Builds a nested table-of-contents `<ul>` from the headings found inside a
container, assigning an `id` to each heading (if it doesn't already have
one) so the TOC links can jump to them.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element, or jQuery collection to render the TOC into.

### options?

[`TocifyOptions`](../interfaces/TocifyOptions.md) = `{}`

Configuration object.
See [TocifyOptions](../interfaces/TocifyOptions.md).

## Returns

[`PluginInstance`](../interfaces/PluginInstance.md)

A [PluginInstance](../interfaces/PluginInstance.md) with `destroy()` to remove the generated TOC.

## Example

```ts
import { tocify } from "blogr-plugins";
tocify("#toc", { content: "#article", headings: "h2,h3" });
```
