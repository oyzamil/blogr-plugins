[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / ResizeImageOptions

# Interface: ResizeImageOptions

Defined in: [src/plugins/resizeImage.ts:102](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/resizeImage.ts#L102)

Configuration options for [resizeImage](../functions/resizeImage.md).

## Properties

### crop?

> `optional` **crop?**: `"circle"` \| `"square"`

Defined in: [src/plugins/resizeImage.ts:108](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/resizeImage.ts#L108)

Crop shape. Default: leave any existing crop untouched.

***

### flip?

> `optional` **flip?**: `"horizontally"` \| `"vertically"`

Defined in: [src/plugins/resizeImage.ts:112](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/resizeImage.ts#L112)

Flip direction. Default: leave any existing flip untouched.

***

### format?

> `optional` **format?**: `"jpeg"` \| `"png"` \| `"webp"`

Defined in: [src/plugins/resizeImage.ts:110](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/resizeImage.ts#L110)

Output image format. Default `"webp"`.

***

### height?

> `optional` **height?**: `number`

Defined in: [src/plugins/resizeImage.ts:104](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/resizeImage.ts#L104)

Output height in px. Default `360`.

***

### rotate?

> `optional` **rotate?**: `number`

Defined in: [src/plugins/resizeImage.ts:114](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/resizeImage.ts#L114)

Rotation in degrees — `90`, `180`, or `270`. Default: leave any existing rotation untouched.

***

### width?

> `optional` **width?**: `number`

Defined in: [src/plugins/resizeImage.ts:106](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/resizeImage.ts#L106)

Output width in px. Default `640`.

***

### ytThumbnail?

> `optional` **ytThumbnail?**: [`YouTubeThumbnailQuality`](../type-aliases/YouTubeThumbnailQuality.md)

Defined in: [src/plugins/resizeImage.ts:120](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/resizeImage.ts#L120)

Quality preset for YouTube thumbnail URLs. Ignored for Blogger images.
Default `"maxresdefault"`. YouTube thumbnails are always served as
WebP, so `format`/`width`/`height`/`crop`/`flip`/`rotate` don't apply.
