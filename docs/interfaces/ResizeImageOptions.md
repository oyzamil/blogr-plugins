[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / ResizeImageOptions

# Interface: ResizeImageOptions

Defined in: src/plugins/resizeImage.ts:103

Configuration options for [resizeImage](../functions/resizeImage.md).

## Properties

### crop?

> `optional` **crop?**: `"circle"` \| `"square"`

Defined in: src/plugins/resizeImage.ts:109

Crop shape. Default: leave any existing crop untouched.

***

### flip?

> `optional` **flip?**: `"horizontally"` \| `"vertically"`

Defined in: src/plugins/resizeImage.ts:113

Flip direction. Default: leave any existing flip untouched.

***

### format?

> `optional` **format?**: `"jpeg"` \| `"png"` \| `"webp"`

Defined in: src/plugins/resizeImage.ts:111

Output image format. Default `"webp"`.

***

### height?

> `optional` **height?**: `number`

Defined in: src/plugins/resizeImage.ts:105

Output height in px. Default `360`.

***

### rotate?

> `optional` **rotate?**: `number`

Defined in: src/plugins/resizeImage.ts:115

Rotation in degrees — `90`, `180`, or `270`. Default: leave any existing rotation untouched.

***

### width?

> `optional` **width?**: `number`

Defined in: src/plugins/resizeImage.ts:107

Output width in px. Default `640`.

***

### ytThumbnail?

> `optional` **ytThumbnail?**: [`YouTubeThumbnailQuality`](../type-aliases/YouTubeThumbnailQuality.md)

Defined in: src/plugins/resizeImage.ts:121

Quality preset for YouTube thumbnail URLs. Ignored for Blogger images.
Default `"maxresdefault"`. YouTube thumbnails are always served as
WebP, so `format`/`width`/`height`/`crop`/`flip`/`rotate` don't apply.
