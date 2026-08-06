[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / lazify

# Function: lazify()

> **lazify**(`input`, `options?`): [`PluginInstance`](../interfaces/PluginInstance.md)

Defined in: src/plugins/lazify.ts:175

Lazily loads media once it scrolls near the viewport, using
`IntersectionObserver`. Handles `<img>` (sets `src`), `<iframe>` (sets
`src`), `<video>` (sets `src`/poster directly, or fills in `<source
data-src>` children and calls `.load()`), and any element with
`data-bg-image` (or, failing that, any other element) sets
`background-image`.

A blank placeholder is applied immediately (before intersection) so
nothing shows a broken-image icon while it waits to load. `onLoad` fires
only once the real media has actually finished loading; `onError` fires
if it fails, and `errorClass` is added to the element.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection to lazy-load.

### options?

[`LazifyOptions`](../interfaces/LazifyOptions.md) = `{}`

Configuration object.
See [LazifyOptions](../interfaces/LazifyOptions.md).

## Returns

[`PluginInstance`](../interfaces/PluginInstance.md)

A [PluginInstance](../interfaces/PluginInstance.md) with `destroy()` to stop observing.

## Example

```html
<img data-src="/photo.jpg" alt="" />
<iframe data-src="https://example.com/embed"></iframe>
<div data-bg-image="/hero.jpg"></div>
<video data-poster="/poster.jpg" controls>
	<source data-src="/clip.webm" type="video/webm" />
	<source data-src="/clip.mp4" type="video/mp4" />
</video>
```
```ts
import { lazify } from "blogr-plugins";
lazify("img[data-src], iframe[data-src], video, [data-bg-image]", {
	onError: (el) => el.classList.add("broken"),
});
```
