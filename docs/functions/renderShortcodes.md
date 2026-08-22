[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / renderShortcodes

# Function: renderShortcodes()

> **renderShortcodes**(`text`, `options`): `string`

Defined in: [src/plugins/shortcodify.ts:322](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/shortcodify.ts#L322)

Parses and renders `[tag attr="value"]content[/tag]`-style shortcodes in
a plain string, given a map of tag → handler. Pure function — does not
touch the DOM, so it's the right building block for rendering Blogger
post content, RSS/feed text, or any string before it's inserted onto a
page.

Supports self-closing tags (`[img src="a.jpg"/]`), nested tags
(`[quote][b]bold[/b] quote[/quote]`), quoted/unquoted/boolean attributes
(`[video src=a.mp4 muted]`), and `[[tag]]` escaping to emit a literal
bracketed tag without processing it.

## Parameters

### text

`string`

Source text containing zero or more shortcodes.

### options

[`ShortcodifyOptions`](../interfaces/ShortcodifyOptions.md)

## Returns

`string`

The text with every recognized shortcode replaced by its
handler's output.

## Example

```ts
import { renderShortcodes } from "blogr-plugins";

const html = renderShortcodes(
  "Check out [youtube id=\"dQw4w9WgXcQ\" width=560/] and [b]this[/b].",
  {
    tags: {
      youtube: (attrs) =>
        `<iframe width="${attrs.width ?? 560}" height="315" src="https://www.youtube.com/embed/${attrs.id}"></iframe>`,
      b: (_attrs, content) => `<strong>${content}</strong>`,
    },
  },
);
```
