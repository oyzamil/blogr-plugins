[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / ShortcodeRegistry

# Interface: ShortcodeRegistry

Defined in: [src/plugins/shortcodify.ts:341](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/shortcodify.ts#L341)

## Properties

### tags

> **tags**: `Record`\<`string`, [`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)\>

Defined in: [src/plugins/shortcodify.ts:343](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/shortcodify.ts#L343)

Live map of every tag registered so far — pass straight into `tags`.

## Methods

### has()

> **has**(`tag`): `boolean`

Defined in: [src/plugins/shortcodify.ts:352](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/shortcodify.ts#L352)

Whether a tag currently has a handler.

#### Parameters

##### tag

`string`

#### Returns

`boolean`

***

### register()

> **register**(`tag`, `handler`): `ShortcodeRegistry`

Defined in: [src/plugins/shortcodify.ts:346](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/shortcodify.ts#L346)

Registers (or overwrites) a single tag's handler. Chainable.

#### Parameters

##### tag

`string`

##### handler

[`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)

#### Returns

`ShortcodeRegistry`

***

### unregister()

> **unregister**(`tag`): `ShortcodeRegistry`

Defined in: [src/plugins/shortcodify.ts:349](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/shortcodify.ts#L349)

Removes a tag so it falls back to the `unknownTag` policy. Chainable.

#### Parameters

##### tag

`string`

#### Returns

`ShortcodeRegistry`
