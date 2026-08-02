[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / isSupportedImage

# Function: isSupportedImage()

> **isSupportedImage**(`url`): `boolean`

Defined in: [plugins/resizeImage.ts:62](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/resizeImage.ts#L62)

Checks whether a URL is a Blogger/Google-hosted image that supports
these transformation parameters.

## Parameters

### url

`string` \| `URL`

Image URL to check.

## Returns

`boolean`

`true` if the host and image-size path segment are recognized.

## Example

```ts
import { isSupportedImage } from "blogr-plugins";
isSupportedImage("https://1.bp.blogspot.com/path/s72-c/image.jpg"); // true
```
