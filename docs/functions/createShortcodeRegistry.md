[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / createShortcodeRegistry

# Function: createShortcodeRegistry()

> **createShortcodeRegistry**(`initial?`): [`ShortcodeRegistry`](../interfaces/ShortcodeRegistry.md)

Defined in: [src/plugins/shortcodify.ts:372](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/shortcodify.ts#L372)

A small, reusable builder for a tag → handler map, so a shared set of
shortcodes (e.g. your site's `[gallery]`, `[youtube]`, `[button]`) can be
assembled once and passed to both [renderShortcodes](renderShortcodes.md) and
[shortcodify](shortcodify.md) calls across a codebase.

## Parameters

### initial?

`Record`\<`string`, [`ShortcodeHandler`](../type-aliases/ShortcodeHandler.md)\> = `{}`

## Returns

[`ShortcodeRegistry`](../interfaces/ShortcodeRegistry.md)

## Example

```ts
import { createShortcodeRegistry, shortcodify } from "blogr-plugins";

const registry = createShortcodeRegistry()
  .register("b", (_attrs, content) => `<strong>${content}</strong>`)
  .register("color", (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`);

shortcodify("#post-body", { tags: registry.tags });
```
