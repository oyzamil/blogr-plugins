[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / ShortcodifyOptions

# Interface: ShortcodifyOptions

Defined in: src/plugins/shortcodify.ts:30

Configuration options shared by [renderShortcodes](../functions/renderShortcodes.md) and [shortcodify](../functions/shortcodify.md).

## Extended by

- [`ShortcodifyDomOptions`](ShortcodifyDomOptions.md)

## Properties

### closeTag?

> `optional` **closeTag?**: `string`

Defined in: src/plugins/shortcodify.ts:36

Closing delimiter. Default `"]"`.

***

### maxDepth?

> `optional` **maxDepth?**: `number`

Defined in: src/plugins/shortcodify.ts:52

Safety cap on recursive re-render passes. Default `5`.

***

### onError?

> `optional` **onError?**: (`error`, `tag`) => `void`

Defined in: src/plugins/shortcodify.ts:54

Called if a handler throws; the offending tag renders as empty string.

#### Parameters

##### error

`unknown`

##### tag

`string`

#### Returns

`void`

***

### openTag?

> `optional` **openTag?**: `string`

Defined in: src/plugins/shortcodify.ts:34

Opening delimiter. Default `"["`.

***

### recursive?

> `optional` **recursive?**: `boolean`

Defined in: src/plugins/shortcodify.ts:50

Re-render a handler's output for further shortcodes it may itself
contain (e.g. a `[quote]` handler that wraps its content in
`[i]...[/i]`). Bounded by `maxDepth` to avoid infinite loops.
Default `true`.

***

### tags

> **tags**: `Record`\<`string`, [`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)\>

Defined in: src/plugins/shortcodify.ts:32

Map of tag name → [ShortcodeHandler](../type-aliases/ShortcodeHandler.md).

***

### unknownTag?

> `optional` **unknownTag?**: [`UnknownTagPolicy`](../type-aliases/UnknownTagPolicy.md)

Defined in: src/plugins/shortcodify.ts:43

What happens to a recognized-shaped tag with no matching handler:
`"keep"` reproduces the original bracket text untouched, `"strip"`
unwraps it and keeps only the inner content, `"remove"` deletes it
entirely. Default `"keep"`.
