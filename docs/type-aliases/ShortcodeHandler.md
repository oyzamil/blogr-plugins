[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / ShortcodeHandler

# Type Alias: ShortcodeHandler

> **ShortcodeHandler** = (`attrs`, `content`, `tag`) => `string`

Defined in: [src/plugins/shortcodify.ts:20](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/shortcodify.ts#L20)

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
