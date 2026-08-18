[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / LazyAdsenseOptions

# Interface: LazyAdsenseOptions

Defined in: src/plugins/lazyAdsense.ts:8

Configuration for [lazyAdsense](../functions/lazyAdsense.md).

## Properties

### adClient?

> `optional` **adClient?**: `string`

Defined in: src/plugins/lazyAdsense.ts:48

`data-ad-client` to use when injecting the AdSense library script, if
it isn't already present on the page. Defaults to the first matched
ad's own `data-ad-client` attribute — set this explicitly if that
might not be reliable (e.g. the first ad in the DOM isn't the first
one that will load).

***

### concurrency?

> `optional` **concurrency?**: `number`

Defined in: src/plugins/lazyAdsense.ts:40

Maximum number of ads that may be loading at once. Default `2`.

***

### container?

> `optional` **container?**: `Element` \| `Document`

Defined in: src/plugins/lazyAdsense.ts:50

Root element to scan/observe within. Default `document.body`.

***

### delay?

> `optional` **delay?**: `number`

Defined in: src/plugins/lazyAdsense.ts:38

Delay, in ms, after an ad becomes eligible before it actually loads. Default `0`.

***

### observeMutations?

> `optional` **observeMutations?**: `boolean`

Defined in: src/plugins/lazyAdsense.ts:36

Watch for ad elements inserted after init (e.g. infinite-scroll posts). Default `true`.

***

### onError?

> `optional` **onError?**: (`error`, `element`) => `void`

Defined in: src/plugins/lazyAdsense.ts:54

Called if loading an ad fails.

#### Parameters

##### error

`unknown`

##### element

`HTMLElement`

#### Returns

`void`

***

### onLoad?

> `optional` **onLoad?**: (`element`) => `void`

Defined in: src/plugins/lazyAdsense.ts:52

Called right before an ad is loaded.

#### Parameters

##### element

`HTMLElement`

#### Returns

`void`

***

### rootMargin?

> `optional` **rootMargin?**: `string`

Defined in: src/plugins/lazyAdsense.ts:32

Start loading this many pixels before the ad enters the viewport. Default `"300px"`.

***

### selector?

> `optional` **selector?**: `string`

Defined in: src/plugins/lazyAdsense.ts:30

Selector for ad elements. Default `"ins.adsbygoogle, amp-ad[type=adsense]"`.

If your template's raw HTML already carries the *live*
`adsbygoogle` class (as Google's own snippet does), the plugin still
loads it correctly — but for genuinely reliable lazy loading you
should also **remove the per-ad
`(adsbygoogle = window.adsbygoogle || []).push({});` script block**
that normally follows each `<ins>` in Google's boilerplate. That
inline push fires immediately on page load and fills every
not-yet-filled `ins.adsbygoogle` on the page at once, which defeats
lazy loading regardless of what this plugin does — this plugin
becomes the *only* thing calling `push()`, once per ad, right when
it's due.

***

### threshold?

> `optional` **threshold?**: `number` \| `number`[]

Defined in: src/plugins/lazyAdsense.ts:34

`IntersectionObserver` threshold. Default `0`.

***

### type?

> `optional` **type?**: [`LazyAdsenseType`](../type-aliases/LazyAdsenseType.md)

Defined in: src/plugins/lazyAdsense.ts:14

Which ad format(s) to handle. `"html"` targets `<ins class="adsbygoogle">`
units, `"amp"` targets `<amp-ad type="adsense">` units, `"auto"`
(default) handles whichever of the two a matched element actually is.
