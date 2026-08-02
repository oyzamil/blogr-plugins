[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / LazifyOptions

# Interface: LazifyOptions

Defined in: [plugins/lazify.ts:6](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/lazify.ts#L6)

Configuration options for [lazify](../functions/lazify.md).

## Properties

### attribute?

> `optional` **attribute?**: `string`

Defined in: [plugins/lazify.ts:8](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/lazify.ts#L8)

Attribute holding the real media URL. Default `"data-src"`.

***

### loadedClass?

> `optional` **loadedClass?**: `string`

Defined in: [plugins/lazify.ts:12](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/lazify.ts#L12)

Class added once an element has finished loading. Default `"lazy-ify"`.

***

### onLoad?

> `optional` **onLoad?**: (`el`) => `void`

Defined in: [plugins/lazify.ts:16](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/lazify.ts#L16)

Called after each element finishes loading.

#### Parameters

##### el

`Element`

#### Returns

`void`

***

### posterAttribute?

> `optional` **posterAttribute?**: `string`

Defined in: [plugins/lazify.ts:10](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/lazify.ts#L10)

Attribute holding a `<video>`'s poster image URL. Default `"data-poster"`.

***

### rootMargin?

> `optional` **rootMargin?**: `string`

Defined in: [plugins/lazify.ts:14](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/lazify.ts#L14)

Root margin passed to the underlying `IntersectionObserver`. Default `"200px"`.
