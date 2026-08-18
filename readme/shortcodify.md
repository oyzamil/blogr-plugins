# shortcodify

A full shortcode/templating engine for `[tag attr="value"]content[/tag]`
syntax — think Blogger's own conditional tags or WordPress shortcodes, but
typed, dependency-free, and configurable. Ships four pieces:

- **`renderShortcodes(text, options)`** — pure function, parses a plain
  string and returns the rendered result. Use this for Blogger post
  content, feed text, or any string before it's inserted into the page.
- **`shortcodify(target, options)`** — DOM-facing version that scans an
  element's text nodes for shortcodes and replaces them in place. Returns
  a `{ destroy(): void }` instance like every other plugin here.
- **`createShortcodeRegistry(initial?)`** — a small chainable builder for
  assembling a reusable `tag -> handler` map once and sharing it across
  multiple `renderShortcodes`/`shortcodify` calls.
- **`defaultShortcodeTags`** — a handful of ready-made handlers (`b`, `i`,
  `u`, `color`, `url`) you can spread into your own tag map.

---

## Syntax supported

- **Attributes**: quoted (`attr="value"`), single-quoted (`attr='value'`),
  unquoted (`attr=value`), and boolean flags (`muted`). Numeric-looking
  values are coerced to `number`, and `true`/`false` to `boolean`.
- **Self-closing tags**: `[img src="a.jpg"/]` — handler gets called with
  empty content.
- **Nesting**: `[quote][b]bold[/b] text[/quote]` — inner tags are rendered
  first, so `quote`'s handler receives already-rendered content.
- **Escaping**: `[[b]]not parsed[[/b]]` renders as the literal text
  `[b]not parsed[/b]` instead of being processed.
- **Unknown tags**: anything shaped like a tag but with no registered
  handler follows the `unknownTag` policy (`"keep"` | `"strip"` |
  `"remove"`).
- **Recursive handler output**: if a handler's own return value contains
  further shortcode syntax (e.g. a `[quote]` handler that emits
  `[i]...[/i]`), it's re-rendered too, up to `maxDepth` passes — but only
  handler *output* is ever re-parsed, so `[[escaped]]` text is guaranteed
  to never be processed no matter how deep the recursion goes.

---

## `renderShortcodes(text, options)`

Pure function — parses a string and returns rendered HTML.

```ts
import { renderShortcodes } from "blogr-plugins";

const html = renderShortcodes(
	'Check out [youtube id="dQw4w9WgXcQ" width=560/] and [b]this[/b].',
	{
		tags: {
			youtube: (attrs) =>
				`<iframe width="${attrs.width ?? 560}" height="315" src="https://www.youtube.com/embed/${attrs.id}"></iframe>`,
			b: (_attrs, content) => `<strong>${content}</strong>`,
		},
	},
);
```

### Parameters

| Parameter | Type                      | Description |
| --------- | ------------------------- | ------------- |
| `text`    | `string`                  | Text containing shortcodes to parse |
| `options` | `ShortcodifyOptions`      | Tag handlers and parsing config (see below) |

### Return value

Rendered HTML string.

---

## `shortcodify(target, options?)`

DOM-facing version that scans element text nodes for shortcodes in place.

```html
<p id="post">Say [b]hello[/b] to [color name="crimson"]Blogr[/color]!</p>
```

```ts
import { shortcodify } from "blogr-plugins";

const instance = shortcodify("#post", {
	tags: {
		b: (_attrs, content) => `<strong>${content}</strong>`,
		color: (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`,
	},
	allowHtml: true, // parse handler output as HTML instead of literal text
});

instance.destroy(); // reverts every text node it rewrote
```

### Parameters

| Parameter | Type                  | Description |
| --------- | --------------------- | ------------- |
| `target`  | `ElementInput`        | CSS selector, Element, array/NodeList, or jQuery collection |
| `options` | `ShortcodifyOptions`  | Tag handlers and parsing config (see below) |

### Return value — `ShortcodifyInstance`

```ts
interface ShortcodifyInstance {
	destroy(): void;
}
```

- **`destroy()`** — reverts every text node that contained shortcodes back
  to its original content.

### Note on text-node parsing

A shortcode must live entirely inside a single text node to be found by
`shortcodify` (it walks the DOM the same way `replacify` does). For
content that spans multiple elements — or before it's ever inserted into
the page — call `renderShortcodes` on the raw string instead.

---

## `createShortcodeRegistry(initial?)`

Chainable builder for assembling a reusable tag registry.

```ts
import { createShortcodeRegistry, shortcodify } from "blogr-plugins";

const registry = createShortcodeRegistry()
	.register("b", (_attrs, content) => `<strong>${content}</strong>`)
	.register("color", (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`);

registry.has("b"); // true

shortcodify("#post-body", { tags: registry.tags, allowHtml: true });

// later, drop a tag so it falls back to the unknownTag policy
registry.unregister("color");
```

### Methods

| Method                          | Description |
| ------------------------------- | ------------- |
| `register(name, handler)`       | Add a tag handler |
| `unregister(name)`              | Remove a tag handler |
| `has(name)`                     | Check if a tag is registered |
| `get tags(): Record<...>`       | Get the underlying tag map for use in `renderShortcodes`/`shortcodify` |

---

## `defaultShortcodeTags`

Ready-made handlers for common formatting tags.

```ts
import { defaultShortcodeTags, renderShortcodes } from "blogr-plugins";

renderShortcodes('[b]Bold[/b] and [url href="/x"]a link[/url]', {
	tags: { ...defaultShortcodeTags, ...myOwnTags },
});
```

| Tag     | Renders as |
| ------- | ---------- |
| `b`     | `<strong>content</strong>` |
| `i`     | `<em>content</em>` |
| `u`     | `<span style="text-decoration:underline">content</span>` |
| `color` | `<span style="color:{name}">content</span>` (accepts `name` or `value` attr) |
| `url`   | `<a href="{href}" target="{target}?">content</a>` |

---

## `ShortcodifyOptions` reference

| Option       | Type                                          | Default   | Description |
| ------------ | ---------------------------------------------- | --------- | ------------- |
| `tags`       | `Record<string, ShortcodeHandler>`             | —         | Map of tag name → handler. **Required.** |
| `openTag`    | `string`                                       | `"["`     | Opening delimiter |
| `closeTag`   | `string`                                       | `"]"`     | Closing delimiter |
| `unknownTag` | `"keep" \| "strip" \| "remove"`                 | `"keep"`  | What to do with a tag-shaped match that has no handler |
| `recursive`  | `boolean`                                       | `true`    | Re-render a handler's own output for further shortcodes it contains |
| `maxDepth`   | `number`                                        | `5`       | Safety cap on recursive re-render passes |
| `onError`    | `(error: unknown, tag: string) => void`         | —         | Called if a handler throws; the tag renders as an empty string |
| `allowHtml`  | `boolean` (shortcodify only)                    | `false`   | Parse rendered output as HTML instead of inserting it as literal text |

---

## `ShortcodeHandler`

```ts
type ShortcodeHandler = (
	attrs: ShortcodeAttributes,
	content: string,
	tag: string
) => string;
```

- `attrs` — plain object of coerced attribute values (strings, numbers, booleans)
- `content` — the tag's already-rendered inner text (empty string for self-closing tags)
- `tag` — the tag name (useful for generic handlers)

Returns a string to be rendered in place of the shortcode (either as HTML if
`allowHtml: true`, or as literal escaped text otherwise).

---

## Formats & builds

Like every plugin in this package, `shortcodify` ships in three forms:

- **ESM / CJS** (`import { shortcodify, renderShortcodes } from "blogr-plugins"`),
  for bundled projects.
- **Standalone IIFE** — `dist/shortcodify.js` — exposes
  `window.BlogrPlugins.shortcodify`, `window.BlogrPlugins.renderShortcodes`,
  etc., for a plain `<script>` tag with no build step.
- **jQuery bridge** — if `jQuery`/`$` is present on the page when the
  script loads, `$(selector).shortcodify(options)` is registered
  automatically.

```html
<script src="https://unpkg.com/blogr-plugins/dist/shortcodify.min.js"></script>
<script>
	const { shortcodify, defaultShortcodeTags } = BlogrPlugins;
	shortcodify("#post-body", {
		tags: { ...defaultShortcodeTags, b: (_, c) => `<strong>${c}</strong>` },
	});
	// or, with jQuery loaded first:
	$("#post-body").shortcodify({ tags: { b: (_, c) => `<strong>${c}</strong>` } });
</script>
```