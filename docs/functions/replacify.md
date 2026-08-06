[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / replacify

# Function: replacify()

> **replacify**(`input`, `search`, `replacement`, `options?`): [`PluginInstance`](../interfaces/PluginInstance.md)

Defined in: src/plugins/replacify.ts:32

Finds and replaces text within an element's text nodes only — it never
touches tag names or attributes, so it's safe to run on rendered markup.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection to search within.

### search

`string` \| `RegExp`

String or RegExp to find.

### replacement

`string`

Replacement text (or HTML, if `allowHtml` is set).

### options?

[`ReplacifyOptions`](../interfaces/ReplacifyOptions.md) = `{}`

Configuration object.
See [ReplacifyOptions](../interfaces/ReplacifyOptions.md).

## Returns

[`PluginInstance`](../interfaces/PluginInstance.md)

A [PluginInstance](../interfaces/PluginInstance.md) with `destroy()` to revert the text.

## Example

```ts
import { replacify } from "blogr-plugins";
replacify(".post-body", /\bBlogr\b/g, "Blogr™");
```
