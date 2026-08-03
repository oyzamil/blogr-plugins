[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / ResizeImageOptions

# Interface: ResizeImageOptions

Defined in: [plugins/resizeImage.ts:99](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/resizeImage.ts#L99)

Configuration options for [resizeImage](../functions/resizeImage.md).

## Properties

### crop?

> `optional` **crop?**: `"circle"` \| `"square"`

Defined in: [plugins/resizeImage.ts:105](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/resizeImage.ts#L105)

Crop shape. Default: leave any existing crop untouched.

***

### flip?

> `optional` **flip?**: `"horizontally"` \| `"vertically"`

Defined in: [plugins/resizeImage.ts:109](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/resizeImage.ts#L109)

Flip direction. Default: leave any existing flip untouched.

***

### format?

> `optional` **format?**: `"jpeg"` \| `"png"` \| `"webp"`

Defined in: [plugins/resizeImage.ts:107](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/resizeImage.ts#L107)

Output image format. Default `"webp"`.

***

### height?

> `optional` **height?**: `number`

Defined in: [plugins/resizeImage.ts:101](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/resizeImage.ts#L101)

Output height in px. Default `360`.

***

### rotate?

> `optional` **rotate?**: `number`

Defined in: [plugins/resizeImage.ts:111](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/resizeImage.ts#L111)

Rotation in degrees — `90`, `180`, or `270`. Default: leave any existing rotation untouched.

***

### width?

> `optional` **width?**: `number`

Defined in: [plugins/resizeImage.ts:103](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/resizeImage.ts#L103)

Output width in px. Default `640`.

***

### ytThumbnail?

> `optional` **ytThumbnail?**: [`YouTubeThumbnailQuality`](../type-aliases/YouTubeThumbnailQuality.md)

Defined in: [plugins/resizeImage.ts:117](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/resizeImage.ts#L117)

Quality preset for YouTube thumbnail URLs. Ignored for Blogger images.
Default `"maxresdefault"`. YouTube thumbnails are always served as
WebP, so `format`/`width`/`height`/`crop`/`flip`/`rotate` don't apply.
