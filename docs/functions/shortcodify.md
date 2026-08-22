[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / shortcodify

# Function: shortcodify()

> **shortcodify**(`input`, `options`): [`PluginInstance`](../interfaces/PluginInstance.md)

Defined in: [src/plugins/shortcodify.ts:452](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/shortcodify.ts#L452)

DOM-facing version of [renderShortcodes](renderShortcodes.md): scans the text nodes
inside the given element(s) for shortcodes and replaces each match with
its handler's output, in place. A shortcode must live entirely inside one
text node to be recognized — for content spanning multiple elements (or
before it's inserted into the page at all), call
[renderShortcodes](renderShortcodes.md) on the raw string instead.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection to scan.

### options

[`ShortcodifyDomOptions`](../interfaces/ShortcodifyDomOptions.md)

Configuration object.
See [ShortcodifyOptions](../interfaces/ShortcodifyOptions.md).

## Returns

[`PluginInstance`](../interfaces/PluginInstance.md)

A [PluginInstance](../interfaces/PluginInstance.md) with `destroy()` to revert every replacement.

## Example

```html
<p id="post">Say [b]hello[/b] to [color name="crimson"]Blogr[/color]!</p>
```
```ts
import { shortcodify } from "blogr-plugins";

shortcodify("#post", {
  tags: {
    b: (_attrs, content) => `<strong>${content}</strong>`,
    color: (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`,
  },
  allowHtml: true,
});
```
