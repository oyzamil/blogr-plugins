[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / LazifyOptions

# Interface: LazifyOptions

Defined in: [src/plugins/lazify.ts:6](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/lazify.ts#L6)

Configuration options for [lazify](../functions/lazify.md).

## Properties

### attribute?

> `optional` **attribute?**: `string`

Defined in: [src/plugins/lazify.ts:8](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/lazify.ts#L8)

Attribute holding the real media URL. Default `"data-src"`.

***

### bgImageAttribute?

> `optional` **bgImageAttribute?**: `string`

Defined in: [src/plugins/lazify.ts:12](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/lazify.ts#L12)

Attribute holding a CSS background-image URL. Applies to any element. Default `"data-bg-image"`.

***

### errorClass?

> `optional` **errorClass?**: `string`

Defined in: [src/plugins/lazify.ts:16](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/lazify.ts#L16)

Class added if an element fails to load. Default `"lazy-ify-error"`.

***

### loadedClass?

> `optional` **loadedClass?**: `string`

Defined in: [src/plugins/lazify.ts:14](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/lazify.ts#L14)

Class added once an element has finished loading. Default `"lazy-ify"`.

***

### onError?

> `optional` **onError?**: (`el`, `event`) => `void`

Defined in: [src/plugins/lazify.ts:29](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/lazify.ts#L29)

Called if an element's real media fails to load.

#### Parameters

##### el

`Element`

##### event

`Event`

#### Returns

`void`

***

### onLoad?

> `optional` **onLoad?**: (`el`) => `void`

Defined in: [src/plugins/lazify.ts:27](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/lazify.ts#L27)

Called after each element finishes loading successfully.

#### Parameters

##### el

`Element`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder?**: `string` \| `false`

Defined in: [src/plugins/lazify.ts:25](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/lazify.ts#L25)

URL applied immediately (before intersection) so there's no broken-image
flash while waiting to load. Set to `false` to disable. Applied to
`<img src>`, `<video poster>`, and `background-image` targets only —
skipped for `<iframe>`. Default is a 1x1 transparent gif.

***

### posterAttribute?

> `optional` **posterAttribute?**: `string`

Defined in: [src/plugins/lazify.ts:10](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/lazify.ts#L10)

Attribute holding a `<video>`'s poster image URL. Default `"data-poster"`.

***

### rootMargin?

> `optional` **rootMargin?**: `string`

Defined in: [src/plugins/lazify.ts:18](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/lazify.ts#L18)

Root margin passed to the underlying `IntersectionObserver`. Default `"200px"`.
