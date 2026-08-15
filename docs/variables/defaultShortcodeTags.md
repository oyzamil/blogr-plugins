[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / defaultShortcodeTags

# Variable: defaultShortcodeTags

> `const` **defaultShortcodeTags**: `Record`\<`string`, [`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)\>

Defined in: [src/plugins/shortcodify.ts:394](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/shortcodify.ts#L394)

A handful of ready-made handlers (`b`, `i`, `u`, `url`, `color`) you can
spread into your own tag map instead of writing the common ones by hand.

## Example

```ts
import { defaultShortcodeTags, renderShortcodes } from "blogr-plugins";

renderShortcodes("[b]Bold[/b] and [url href=\"/x\"]a link[/url]", {
  tags: { ...defaultShortcodeTags, ...myOwnTags },
});
```
