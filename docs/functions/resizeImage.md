[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / resizeImage

# Function: resizeImage()

> **resizeImage**(`url`, `options?`): `string`

Defined in: [plugins/resizeImage.ts:87](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/resizeImage.ts#L87)

Builds a resized/transformed URL for a Blogger/Google-hosted image.
Unsupported URLs are returned unchanged rather than throwing, so it's
always safe to run any image URL through this function.

## Parameters

### url

`string` \| `URL`

Source image URL.

### options?

[`ResizeImageOptions`](../interfaces/ResizeImageOptions.md) = `{}`

[ResizeImageOptions](../interfaces/ResizeImageOptions.md)

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
