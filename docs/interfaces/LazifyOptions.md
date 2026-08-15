[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / LazifyOptions

# Interface: LazifyOptions

Defined in: [src/plugins/lazify.ts:5](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/lazify.ts#L5)

Configuration options for [lazify](../functions/lazify.md).

## Properties

### attribute?

> `optional` **attribute?**: `string`

Defined in: [src/plugins/lazify.ts:7](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/lazify.ts#L7)

Attribute holding the real media URL. Default `"data-src"`.

***

### bgImageAttribute?

> `optional` **bgImageAttribute?**: `string`

Defined in: [src/plugins/lazify.ts:11](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/lazify.ts#L11)

Attribute holding a CSS background-image URL. Applies to any element. Default `"data-bg-image"`.

***

### errorClass?

> `optional` **errorClass?**: `string`

Defined in: [src/plugins/lazify.ts:15](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/lazify.ts#L15)

Class added if an element fails to load. Default `"lazy-ify-error"`.

***

### loadedClass?

> `optional` **loadedClass?**: `string`

Defined in: [src/plugins/lazify.ts:13](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/lazify.ts#L13)

Class added once an element has finished loading. Default `"lazy-ify"`.

***

### onError?

> `optional` **onError?**: (`el`, `event`) => `void`

Defined in: [src/plugins/lazify.ts:28](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/lazify.ts#L28)

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

Defined in: [src/plugins/lazify.ts:26](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/lazify.ts#L26)

Called after each element finishes loading successfully.

#### Parameters

##### el

`Element`

#### Returns

`void`

***

### placeholder?

> `optional` **placeholder?**: `string` \| `false`

Defined in: [src/plugins/lazify.ts:24](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/lazify.ts#L24)

URL applied immediately (before intersection) so there's no broken-image
flash while waiting to load. Set to `false` to disable. Applied to
`<img src>`, `<video poster>`, and `background-image` targets only —
skipped for `<iframe>`. Default is a 1x1 transparent gif.

***

### posterAttribute?

> `optional` **posterAttribute?**: `string`

Defined in: [src/plugins/lazify.ts:9](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/lazify.ts#L9)

Attribute holding a `<video>`'s poster image URL. Default `"data-poster"`.

***

### rootMargin?

> `optional` **rootMargin?**: `string`

Defined in: [src/plugins/lazify.ts:17](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/lazify.ts#L17)

Root margin passed to the underlying `IntersectionObserver`. Default `"200px"`.
