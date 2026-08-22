[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / defaultShortcodeTags

# Variable: defaultShortcodeTags

> `const` **defaultShortcodeTags**: `Record`\<`string`, [`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)\>

Defined in: [src/plugins/shortcodify.ts:412](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/shortcodify.ts#L412)

A handful of ready-made handlers (`b`, `i`, `u`, `url`, `color`) you can
spread into your own tag map instead of writing the common ones by hand.

## Example

```ts
import { defaultShortcodeTags, renderShortcodes } from "blogr-plugins";

renderShortcodes("[b]Bold[/b] and [url href=\"/x\"]a link[/url]", {
  tags: { ...defaultShortcodeTags, ...myOwnTags },
});
```
