[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / createShortcodeRegistry

# Function: createShortcodeRegistry()

> **createShortcodeRegistry**(`initial?`): `object`

Defined in: [src/plugins/shortcodify.ts:354](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/shortcodify.ts#L354)

A small, reusable builder for a tag → handler map, so a shared set of
shortcodes (e.g. your site's `[gallery]`, `[youtube]`, `[button]`) can be
assembled once and passed to both [renderShortcodes](renderShortcodes.md) and
[shortcodify](shortcodify.md) calls across a codebase.

## Parameters

### initial?

`Record`\<`string`, [`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)\> = `{}`

## Returns

### tags

> **tags**: `Record`\<`string`, [`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)\>

Live map of every tag registered so far — pass straight into `tags`.

### has()

> **has**(`tag`): `boolean`

Whether a tag currently has a handler.

#### Parameters

##### tag

`string`

#### Returns

`boolean`

### register()

> **register**(`tag`, `handler`): \{ tags: Record\<string, ShortcodeHandler\>; register(tag: string, handler: ShortcodeHandler): ...; unregister(tag: string): ...; has(tag: string): boolean; \}

Registers (or overwrites) a single tag's handler. Chainable.

#### Parameters

##### tag

`string`

##### handler

[`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)

#### Returns

\{ tags: Record\<string, ShortcodeHandler\>; register(tag: string, handler: ShortcodeHandler): ...; unregister(tag: string): ...; has(tag: string): boolean; \}

### unregister()

> **unregister**(`tag`): \{ tags: Record\<string, ShortcodeHandler\>; register(tag: string, handler: ShortcodeHandler): ...; unregister(tag: string): ...; has(tag: string): boolean; \}

Removes a tag so it falls back to the `unknownTag` policy. Chainable.

#### Parameters

##### tag

`string`

#### Returns

\{ tags: Record\<string, ShortcodeHandler\>; register(tag: string, handler: ShortcodeHandler): ...; unregister(tag: string): ...; has(tag: string): boolean; \}

## Example

```ts
import { createShortcodeRegistry, shortcodify } from "blogr-plugins";

const registry = createShortcodeRegistry()
  .register("b", (_attrs, content) => `<strong>${content}</strong>`)
  .register("color", (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`);

shortcodify("#post-body", { tags: registry.tags });
```
