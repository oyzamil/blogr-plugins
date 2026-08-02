[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / stickify

# Function: stickify()

> **stickify**(`input`, `options?`): [`PluginInstance`](../interfaces/PluginInstance.md)

Defined in: [plugins/stickify.ts:130](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/stickify.ts#L130)

Makes a sidebar stick to the viewport while scrolling, clamped to its
container so it never overflows past the container's bottom edge. Full
option-parity port of Theia Sticky Sidebar, so it supports the same
`modern` / `stick-to-top` / `stick-to-bottom` behaviors and layout edge
cases (collapsible margins, floated multi-column layouts, responsive
stacking) as the original.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection for the sidebar(s).

### options?

[`StickifyOptions`](../interfaces/StickifyOptions.md) = `{}`

[StickifyOptions](../interfaces/StickifyOptions.md)

## Returns

[`PluginInstance`](../interfaces/PluginInstance.md)

A [PluginInstance](../interfaces/PluginInstance.md) with `destroy()` to unbind everything and restore original styles.

## Example

```ts
import { stickify } from "blogr-plugins";
stickify(".leftSidebar, .content, .rightSidebar", { additionalMarginTop: 30 });
```
