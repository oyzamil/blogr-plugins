[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / AdsenseLoaderOptions

# Interface: AdsenseLoaderOptions

Defined in: [src/plugins/adsenseLoader.ts:11](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/adsenseLoader.ts#L11)

Configuration for [adsenseLoader](../functions/adsenseLoader.md).

## Properties

### container?

> `optional` **container?**: `Element` \| `Document`

Defined in: [src/plugins/adsenseLoader.ts:22](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/adsenseLoader.ts#L22)

Root element to scan/observe within. Default `document.body`.

***

### mobileBreakpoint?

> `optional` **mobileBreakpoint?**: `string`

Defined in: [src/plugins/adsenseLoader.ts:28](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/adsenseLoader.ts#L28)

Media query that decides which of `data-mobile-size` /
`data-pc-size` a wrapper resolves to. Default
`"(max-width: 767px)"`.

***

### observeMutations?

> `optional` **observeMutations?**: `boolean`

Defined in: [src/plugins/adsenseLoader.ts:20](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/adsenseLoader.ts#L20)

Watch for wrapper elements inserted after init (e.g. infinite-scroll posts). Default `true`.

***

### onFilled?

> `optional` **onFilled?**: (`wrapper`) => `void`

Defined in: [src/plugins/adsenseLoader.ts:38](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/adsenseLoader.ts#L38)

Called once a wrapper's ad has actually filled.

#### Parameters

##### wrapper

`HTMLElement`

#### Returns

`void`

***

### onLoad?

> `optional` **onLoad?**: (`wrapper`) => `void`

Defined in: [src/plugins/adsenseLoader.ts:36](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/adsenseLoader.ts#L36)

Called right before a wrapper's ad starts loading.

#### Parameters

##### wrapper

`HTMLElement`

#### Returns

`void`

***

### onUnfilled?

> `optional` **onUnfilled?**: (`wrapper`) => `void`

Defined in: [src/plugins/adsenseLoader.ts:44](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/adsenseLoader.ts#L44)

Called when a wrapper's ad comes back unfilled or fails to load —
right before it's removed (if `removeOnUnfilled` is on). Use this
for a fallback instead of relying on the (about to be gone) wrapper.

#### Parameters

##### wrapper

`HTMLElement`

#### Returns

`void`

***

### removeOnUnfilled?

> `optional` **removeOnUnfilled?**: `boolean`

Defined in: [src/plugins/adsenseLoader.ts:34](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/adsenseLoader.ts#L34)

If the ad comes back unfilled or fails to load, remove the wrapper
from the DOM entirely (matching the old plugin's behavior) rather
than leaving a dead, empty slot. Default `true`.

***

### rootMargin?

> `optional` **rootMargin?**: `string`

Defined in: [src/plugins/adsenseLoader.ts:16](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/adsenseLoader.ts#L16)

Start loading this many pixels before the wrapper enters the
viewport. Default `"200px"`.

***

### threshold?

> `optional` **threshold?**: `number` \| `number`[]

Defined in: [src/plugins/adsenseLoader.ts:18](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/adsenseLoader.ts#L18)

`IntersectionObserver` threshold. Default `0`.
