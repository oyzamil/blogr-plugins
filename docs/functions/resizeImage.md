[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / resizeImage

# Function: resizeImage()

> **resizeImage**(`url`, `options?`): `string`

Defined in: [src/plugins/resizeImage.ts:257](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/resizeImage.ts#L257)

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
