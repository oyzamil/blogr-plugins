[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / lazyAdsense

# Function: lazyAdsense()

> **lazyAdsense**(`options?`): [`PluginInstance`](../interfaces/PluginInstance.md)

Defined in: src/plugins/lazyAdsense.ts:267

Lazy-loads AdSense (`<ins class="adsbygoogle">`) and AMP
(`<amp-ad type="adsense">`) ad units: each one loads exactly once, right
as it's about to enter the viewport, instead of every ad on the page
requesting an impression on initial load regardless of whether it's ever
actually seen. This is the policy-compliant way to improve real,
*viewable* impressions — it does not refresh, re-request, or reload an
ad that has already loaded.

> **On ad refresh:** AdSense's publisher policy does not permit
> programmatically refreshing an ad unit ("Publishers are not permitted
> to refresh a page or an element of a page without the user requesting
> a refresh"). This plugin intentionally has no reload/refresh
> capability — every matched ad is loaded once and left alone.

## Parameters

### options?

[`LazyAdsenseOptions`](../interfaces/LazyAdsenseOptions.md) = `{}`

[LazyAdsenseOptions](../interfaces/LazyAdsenseOptions.md)

## Returns

[`PluginInstance`](../interfaces/PluginInstance.md)

A [LazyAdsenseInstance](../type-aliases/LazyAdsenseInstance.md) — `destroy()` disconnects both
observers and restores any not-yet-loaded ad elements to their original
classes (already-loaded ads are left exactly as AdSense/AMP rendered
them).

## Example

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
	crossorigin="anonymous"></script>

<!-- No per-ad push({}) script block — lazyAdsense calls push() itself. -->
<ins class="adsbygoogle"
	style="display:block"
	data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
	data-ad-slot="9964452094"
	data-ad-format="auto"
	data-full-width-responsive="true"></ins>
```
```ts
import { lazyAdsense } from "blogr-plugins";

lazyAdsense({
	rootMargin: "300px",
	concurrency: 2,
	onLoad: (el) => console.log("loading ad", el),
	onError: (err, el) => console.error("ad failed to load", err, el),
});
```
