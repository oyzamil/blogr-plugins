[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / tocify

# Function: tocify()

> **tocify**(`input`, `options?`): [`PluginInstance`](../interfaces/PluginInstance.md)

Defined in: [plugins/tocify.ts:43](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/tocify.ts#L43)

Builds a nested table-of-contents `<ul>` from the headings found inside a
container, assigning an `id` to each heading (if it doesn't already have
one) so the TOC links can jump to them.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element, or jQuery collection to render the TOC into.

### options?

[`TocifyOptions`](../interfaces/TocifyOptions.md) = `{}`

[TocifyOptions](../interfaces/TocifyOptions.md)

## Returns

[`PluginInstance`](../interfaces/PluginInstance.md)

A [PluginInstance](../interfaces/PluginInstance.md) with `destroy()` to remove the generated TOC.

## Example

```ts
import { tocify } from "blogr-plugins";
tocify("#toc", { content: "#article", headings: "h2,h3" });
```
