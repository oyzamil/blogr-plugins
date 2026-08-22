[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / resizeImageInDom

# Function: resizeImageInDom()

> **resizeImageInDom**(`input`, `options?`): `void`

Defined in: [src/plugins/resizeImage.ts:370](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/resizeImage.ts#L370)

Applies [resizeImage](resizeImage.md) to every matched element in place — `<img>`
(`src` + `srcset`) or any element with an inline `background-image`.
Elements matching neither are left untouched. No setup call required.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection to resize.

### options?

[`ResizeImageOptions`](../interfaces/ResizeImageOptions.md) = `{}`

Configuration object.
See [ResizeImageOptions](../interfaces/ResizeImageOptions.md).

## Returns

`void`

## Example

```ts
import { resizeImageInDom } from "blogr-plugins";
resizeImageInDom(".post-thumb img", { width: 400, height: 400 });
resizeImageInDom(".thumb", { ytThumbnail: "mqdefault" });
```
