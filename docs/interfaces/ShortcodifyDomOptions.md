[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / ShortcodifyDomOptions

# Interface: ShortcodifyDomOptions

Defined in: [src/plugins/shortcodify.ts:58](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/shortcodify.ts#L58)

Extra options for the DOM-facing [shortcodify](../functions/shortcodify.md).

## Extends

- [`ShortcodifyOptions`](ShortcodifyOptions.md)

## Properties

### allowHtml?

> `optional` **allowHtml?**: `boolean`

Defined in: [src/plugins/shortcodify.ts:63](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/shortcodify.ts#L63)

When a rendered result contains markup, parse it as HTML instead of
inserting it as literal text. Default `false`.

***

### closeTag?

> `optional` **closeTag?**: `string`

Defined in: [src/plugins/shortcodify.ts:36](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/shortcodify.ts#L36)

Closing delimiter. Default `"]"`.

#### Inherited from

[`ShortcodifyOptions`](ShortcodifyOptions.md).[`closeTag`](ShortcodifyOptions.md#closetag)

***

### maxDepth?

> `optional` **maxDepth?**: `number`

Defined in: [src/plugins/shortcodify.ts:52](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/shortcodify.ts#L52)

Safety cap on recursive re-render passes. Default `5`.

#### Inherited from

[`ShortcodifyOptions`](ShortcodifyOptions.md).[`maxDepth`](ShortcodifyOptions.md#maxdepth)

***

### onError?

> `optional` **onError?**: (`error`, `tag`) => `void`

Defined in: [src/plugins/shortcodify.ts:54](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/shortcodify.ts#L54)

Called if a handler throws; the offending tag renders as empty string.

#### Parameters

##### error

`unknown`

##### tag

`string`

#### Returns

`void`

#### Inherited from

[`ShortcodifyOptions`](ShortcodifyOptions.md).[`onError`](ShortcodifyOptions.md#onerror)

***

### openTag?

> `optional` **openTag?**: `string`

Defined in: [src/plugins/shortcodify.ts:34](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/shortcodify.ts#L34)

Opening delimiter. Default `"["`.

#### Inherited from

[`ShortcodifyOptions`](ShortcodifyOptions.md).[`openTag`](ShortcodifyOptions.md#opentag)

***

### recursive?

> `optional` **recursive?**: `boolean`

Defined in: [src/plugins/shortcodify.ts:50](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/shortcodify.ts#L50)

Re-render a handler's output for further shortcodes it may itself
contain (e.g. a `[quote]` handler that wraps its content in
`[i]...[/i]`). Bounded by `maxDepth` to avoid infinite loops.
Default `true`.

#### Inherited from

[`ShortcodifyOptions`](ShortcodifyOptions.md).[`recursive`](ShortcodifyOptions.md#recursive)

***

### tags

> **tags**: `Record`\<`string`, [`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)\>

Defined in: [src/plugins/shortcodify.ts:32](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/shortcodify.ts#L32)

Map of tag name → [ShortcodeHandler](../type-aliases/ShortcodeHandler.md).

#### Inherited from

[`ShortcodifyOptions`](ShortcodifyOptions.md).[`tags`](ShortcodifyOptions.md#tags)

***

### unknownTag?

> `optional` **unknownTag?**: [`UnknownTagPolicy`](../type-aliases/UnknownTagPolicy.md)

Defined in: [src/plugins/shortcodify.ts:43](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/shortcodify.ts#L43)

What happens to a recognized-shaped tag with no matching handler:
`"keep"` reproduces the original bracket text untouched, `"strip"`
unwraps it and keeps only the inner content, `"remove"` deletes it
entirely. Default `"keep"`.

#### Inherited from

[`ShortcodifyOptions`](ShortcodifyOptions.md).[`unknownTag`](ShortcodifyOptions.md#unknowntag)
