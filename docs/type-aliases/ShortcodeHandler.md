[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / ShortcodeHandler

# Type Alias: ShortcodeHandler

> **ShortcodeHandler** = (`attrs`, `content`, `tag`) => `string`

Defined in: [src/plugins/shortcodify.ts:19](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/shortcodify.ts#L19)

Renders one shortcode tag to its final string.

## Parameters

### attrs

[`ShortcodeAttributes`](ShortcodeAttributes.md)

Parsed attributes, e.g. `{ width: 400, caption: "Nice" }`.

### content

`string`

Already-rendered inner content (empty string for
self-closing tags).

### tag

`string`

The tag name that matched, useful when one handler is
registered for several tags.

## Returns

`string`
