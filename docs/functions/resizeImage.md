[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / resizeImage

# Function: resizeImage()

> **resizeImage**(`url`, `options?`): `string`

Defined in: [src/plugins/resizeImage.ts:256](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/resizeImage.ts#L256)

Builds a resized/transformed URL for a Blogger/Google-hosted image.
Unsupported URLs are returned unchanged rather than throwing, so it's
always safe to run any image URL through this function.

For Blogger images, this parses the URL's existing param segment and
only overrides the params implied by `options` — width, height and
format always apply (falling back to their defaults), while crop, flip
and rotate are left untouched unless explicitly requested. Any other
recognized param already on the URL (e.g. `nu`, `pd`, `d`) is preserved.

For YouTube thumbnail URLs, `width`/`height`/`crop`/`format`/`flip`/`rotate`
are ignored — YouTube only serves fixed quality presets — and only
`ytThumbnail` applies, always rewritten to the WebP variant.

## Parameters

### url

`string` \| `URL`

Source image or YouTube thumbnail URL.

### options?

[`ResizeImageOptions`](../interfaces/ResizeImageOptions.md) = `{}`

Configuration object.
See [ResizeImageOptions](../interfaces/ResizeImageOptions.md).

## Returns

`string`

The transformed image URL, or the original URL if unsupported.

## Example

```ts
import { resizeImage } from "blogr-plugins";

const url = resizeImage("https://1.bp.blogspot.com/path/s72-c/image.jpg", {
	width: 400,
	height: 400,
	format: "webp",
});
```
