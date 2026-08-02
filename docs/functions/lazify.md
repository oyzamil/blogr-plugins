[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / lazify

# Function: lazify()

> **lazify**(`input`, `options?`): [`PluginInstance`](../interfaces/PluginInstance.md)

Defined in: [plugins/lazify.ts:93](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/lazify.ts#L93)

Lazily loads media once it scrolls near the viewport, using
`IntersectionObserver`. Handles `<img>` (sets `src`), `<iframe>` (sets
`src`), `<video>` (sets `src`/poster directly, or fills in `<source
data-src>` children and calls `.load()`), and falls back to setting
`background-image` on any other element.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection to lazy-load.

### options?

[`LazifyOptions`](../interfaces/LazifyOptions.md) = `{}`

[LazifyOptions](../interfaces/LazifyOptions.md)

## Returns

[`PluginInstance`](../interfaces/PluginInstance.md)

A [PluginInstance](../interfaces/PluginInstance.md) with `destroy()` to stop observing.

## Example

```html
<img data-src="/photo.jpg" alt="" />
<iframe data-src="https://example.com/embed"></iframe>
<video data-poster="/poster.jpg" controls>
	<source data-src="/clip.webm" type="video/webm" />
	<source data-src="/clip.mp4" type="video/mp4" />
</video>
```
```ts
import { lazify } from "blogr-plugins";
lazify("img[data-src], iframe[data-src], video");
```
