[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / ShortcodifyOptions

# Interface: ShortcodifyOptions

Defined in: [src/plugins/shortcodify.ts:30](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/shortcodify.ts#L30)

Configuration options shared by [renderShortcodes](../functions/renderShortcodes.md) and [shortcodify](../functions/shortcodify.md).

## Extended by

- [`ShortcodifyDomOptions`](ShortcodifyDomOptions.md)

## Properties

### closeTag?

> `optional` **closeTag?**: `string`

Defined in: [src/plugins/shortcodify.ts:36](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/shortcodify.ts#L36)

Closing delimiter. Default `"]"`.

***

### maxDepth?

> `optional` **maxDepth?**: `number`

Defined in: [src/plugins/shortcodify.ts:52](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/shortcodify.ts#L52)

Safety cap on recursive re-render passes. Default `5`.

***

### onError?

> `optional` **onError?**: (`error`, `tag`) => `void`

Defined in: [src/plugins/shortcodify.ts:54](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/shortcodify.ts#L54)

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

Defined in: [src/plugins/shortcodify.ts:34](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/shortcodify.ts#L34)

Opening delimiter. Default `"["`.

***

### recursive?

> `optional` **recursive?**: `boolean`

Defined in: [src/plugins/shortcodify.ts:50](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/shortcodify.ts#L50)

Re-render a handler's output for further shortcodes it may itself
contain (e.g. a `[quote]` handler that wraps its content in
`[i]...[/i]`). Bounded by `maxDepth` to avoid infinite loops.
Default `true`.

***

### tags

> **tags**: `Record`\<`string`, [`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)\>

Defined in: [src/plugins/shortcodify.ts:32](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/shortcodify.ts#L32)

Map of tag name → [ShortcodeHandler](../type-aliases/ShortcodeHandler.md).

***

### unknownTag?

> `optional` **unknownTag?**: [`UnknownTagPolicy`](../type-aliases/UnknownTagPolicy.md)

Defined in: [src/plugins/shortcodify.ts:43](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/shortcodify.ts#L43)

What happens to a recognized-shaped tag with no matching handler:
`"keep"` reproduces the original bracket text untouched, `"strip"`
unwraps it and keeps only the inner content, `"remove"` deletes it
entirely. Default `"keep"`.
