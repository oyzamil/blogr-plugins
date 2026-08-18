[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / adsenseLoader

# Function: adsenseLoader()

> **adsenseLoader**(`input`, `options?`): [`PluginInstance`](../interfaces/PluginInstance.md)

Defined in: [src/plugins/adsenseLoader.ts:270](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/adsenseLoader.ts#L270)

Lazy-loads AdSense units wrapped in a container div — `<div
class="adsense"><ins class="adsbygoogle" ...></ins></div>` — right as
each one is about to enter the viewport, using `IntersectionObserver`
instead of scroll/resize polling.

Also supports responsive sizing: give a wrapper `data-mobile-size`
and/or `data-pc-size` listing candidate sizes as `heightxwidth` pairs
(height first), and the plugin picks the best-fitting one for the
current breakpoint/width and applies it to the wrapper directly —
before the ad loads, so it never resizes an already-filled ad (see the
policy note below).

```html
<div class="adsense"
	data-mobile-size="['50x320', '100x320']"
	data-pc-size="['90x728', '250x300']">
	<ins class="adsbygoogle"
		data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
		data-ad-slot="9964452094"></ins>
</div>
```

> **On ad refresh:** AdSense's publisher policy does not permit
> programmatically refreshing an already-served ad. This plugin
> resizes a wrapper's own CSS box before its ad loads — it never
> touches, resizes, or reloads an ad that has already filled.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection for the
`.adsense`-style wrapper(s) to lazy-load.

### options?

[`AdsenseLoaderOptions`](../interfaces/AdsenseLoaderOptions.md) = `{}`

[AdsenseLoaderOptions](../interfaces/AdsenseLoaderOptions.md)

## Returns

[`PluginInstance`](../interfaces/PluginInstance.md)

An [AdsenseLoaderInstance](../type-aliases/AdsenseLoaderInstance.md) — `destroy()` disconnects
every observer and restores any wrapper that never filled to its
original markup (filled ads are left exactly as AdSense rendered them).

## Example

```ts
import { adsenseLoader } from "blogr-plugins";

adsenseLoader(".adsense", {
	rootMargin: "200px",
	onFilled: (wrapper) => wrapper.classList.add("adsense--loaded"),
	onUnfilled: (wrapper) => console.log("no fill for", wrapper),
});
```
