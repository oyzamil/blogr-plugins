[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / ShortcodeRegistry

# Interface: ShortcodeRegistry

Defined in: [src/plugins/shortcodify.ts:337](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/shortcodify.ts#L337)

## Properties

### tags

> **tags**: `Record`\<`string`, [`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)\>

Defined in: [src/plugins/shortcodify.ts:339](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/shortcodify.ts#L339)

Live map of every tag registered so far — pass straight into `tags`.

## Methods

### has()

> **has**(`tag`): `boolean`

Defined in: [src/plugins/shortcodify.ts:348](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/shortcodify.ts#L348)

Whether a tag currently has a handler.

#### Parameters

##### tag

`string`

#### Returns

`boolean`

***

### register()

> **register**(`tag`, `handler`): `ShortcodeRegistry`

Defined in: [src/plugins/shortcodify.ts:342](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/shortcodify.ts#L342)

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

Defined in: [src/plugins/shortcodify.ts:345](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/shortcodify.ts#L345)

Removes a tag so it falls back to the `unknownTag` policy. Chainable.

#### Parameters

##### tag

`string`

#### Returns

`ShortcodeRegistry`
