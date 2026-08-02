[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / ResizeImageOptions

# Interface: ResizeImageOptions

Defined in: [plugins/resizeImage.ts:13](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/resizeImage.ts#L13)

Configuration options for [resizeImage](../functions/resizeImage.md).

## Properties

### crop?

> `optional` **crop?**: `"circle"` \| `"square"`

Defined in: [plugins/resizeImage.ts:19](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/resizeImage.ts#L19)

Crop shape. Default: no crop.

***

### flip?

> `optional` **flip?**: `"horizontally"` \| `"vertically"`

Defined in: [plugins/resizeImage.ts:23](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/resizeImage.ts#L23)

Flip direction. Default: no flip.

***

### format?

> `optional` **format?**: `"jpeg"` \| `"png"` \| `"webp"`

Defined in: [plugins/resizeImage.ts:21](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/resizeImage.ts#L21)

Output image format. Default `"webp"`.

***

### grayscale?

> `optional` **grayscale?**: `boolean`

Defined in: [plugins/resizeImage.ts:27](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/resizeImage.ts#L27)

Convert the image to grayscale. Default `false`.

***

### height?

> `optional` **height?**: `number`

Defined in: [plugins/resizeImage.ts:15](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/resizeImage.ts#L15)

Output height in px. Default `360`.

***

### rotate?

> `optional` **rotate?**: `number`

Defined in: [plugins/resizeImage.ts:25](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/resizeImage.ts#L25)

Rotation in degrees — `90`, `180`, or `270`. Default `0` (no rotation).

***

### width?

> `optional` **width?**: `number`

Defined in: [plugins/resizeImage.ts:17](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/resizeImage.ts#L17)

Output width in px. Default `640`.
