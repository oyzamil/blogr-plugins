[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / isSupportedImage

# Function: isSupportedImage()

> **isSupportedImage**(`url`): `boolean`

Defined in: [src/plugins/resizeImage.ts:219](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/resizeImage.ts#L219)

Checks whether a URL is a Blogger/Google-hosted image (old or new URL
shape) or a YouTube video thumbnail that [resizeImage](resizeImage.md) can handle.

## Parameters

### url

`string` \| `URL`

Image URL to check.

## Returns

`boolean`

`true` if the URL is a recognized Blogger image or YouTube thumbnail.

## Example

```ts
import { isSupportedImage } from "blogr-plugins";
isSupportedImage("https://1.bp.blogspot.com/path/s72-c/image.jpg"); // true
isSupportedImage("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"); // true
```
