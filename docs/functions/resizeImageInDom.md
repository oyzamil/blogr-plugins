[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / resizeImageInDom

# Function: resizeImageInDom()

> **resizeImageInDom**(`input`, `options?`): `void`

Defined in: [src/plugins/resizeImage.ts:370](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/resizeImage.ts#L370)

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
