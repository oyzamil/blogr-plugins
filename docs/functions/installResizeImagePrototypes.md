[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / installResizeImagePrototypes

# Function: installResizeImagePrototypes()

> **installResizeImagePrototypes**(): `void`

Defined in: [plugins/resizeImage.ts:371](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/resizeImage.ts#L371)

Defines `resizeImage(options?)` on `String.prototype`, `Array.prototype`,
`Element.prototype` and `NodeList.prototype` (non-enumerable, so it won't
show up in `for...in`/`JSON.stringify`), so it can be called directly on
a URL, an array of URLs/elements, a single element, or a `NodeList`:

```ts
installResizeImagePrototypes();

"https://1.bp.blogspot.com/.../s1600/photo.jpg".resizeImage({ width: 400 });
[url1, url2].resizeImage({ width: 400 });
document.querySelector(".images")?.resizeImage({ width: 400 });
document.querySelectorAll(".images").resizeImage({ width: 400 });
```

This patches built-in prototypes, which is inherently a bit invasive —
call it once during setup (e.g. your content script's entry point), not
per-use. Safe to call more than once; it won't redefine an existing
`resizeImage` property.

## Returns

`void`
