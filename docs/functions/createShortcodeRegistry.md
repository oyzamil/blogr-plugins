[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / createShortcodeRegistry

# Function: createShortcodeRegistry()

> **createShortcodeRegistry**(`initial?`): [`ShortcodeRegistry`](../interfaces/ShortcodeRegistry.md)

Defined in: [src/plugins/shortcodify.ts:368](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/shortcodify.ts#L368)

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
