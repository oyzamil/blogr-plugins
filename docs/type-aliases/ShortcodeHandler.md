[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / ShortcodeHandler

# Type Alias: ShortcodeHandler

> **ShortcodeHandler** = (`attrs`, `content`, `tag`) => `string`

Defined in: [src/plugins/shortcodify.ts:20](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/shortcodify.ts#L20)

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
