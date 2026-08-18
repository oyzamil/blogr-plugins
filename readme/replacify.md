# replacify

Find-and-replace inside text nodes only — never touches tags or attributes.

```ts
import { replacify } from "blogr-plugins";

replacify(".post-body", /\bBlogr\b/g, "Blogr™");

// allowHtml lets the replacement itself contain markup
const instance = replacify(
	".post-body",
	"click here",
	'<a href="/start">click here</a>',
	{ allowHtml: true },
);

instance.destroy(); // reverts every text node it touched
```

---

## `replacify(target, search, replacement, options?)`

```ts
function replacify(
	target: ElementInput,
	search: string | RegExp,
	replacement: string,
	options?: ReplacifyOptions,
): ReplacifyInstance;
```

### `target`

A CSS selector, a single `Element`, an array/`NodeList` of elements, or a
jQuery collection — replacements are made in each matched element and its
text-node descendants.

### `search`

A plain string or regex pattern to find. Regex is matched across all text
nodes in the target.

### `replacement`

The text or HTML to replace matches with. If `allowHtml` is `false`, treated
as literal text. If `true`, parsed as HTML markup.

### `options`

All options are optional.

| Option      | Type      | Default | Description |
| ----------- | --------- | ------- | ------------- |
| `allowHtml` | `boolean` | `false` | Parse replacement string as HTML markup |

---

## Option details

### `allowHtml`

When `false` (default), the replacement is inserted as literal text — any
HTML characters are escaped. When `true`, the replacement string is parsed
as HTML and inserted as DOM nodes.

```ts
// Replacement is escaped (shows as plain text):
replacify(".post", "hello", "<strong>hello</strong>", { allowHtml: false });

// Replacement is parsed as HTML (shows as bold):
replacify(".post", "hello", "<strong>hello</strong>", { allowHtml: true });
```

---

## Return value — `ReplacifyInstance`

```ts
interface ReplacifyInstance {
	destroy(): void;
}
```

- **`destroy()`** — reverts every text node that was replaced back to its
  original content.

---

## Formats & builds

Like every plugin in this package, `replacify` ships in three forms:

- **ESM / CJS** (`import { replacify } from "blogr-plugins"`), for
  bundled projects.
- **Standalone IIFE** — `dist/replacify.js` — exposes
  `window.BlogrPlugins.replacify`, for a plain `<script>` tag with no
  build step.
- **jQuery bridge** — if `jQuery`/`$` is present on the page when the
  script loads, `$(selector).replacify(search, replacement, options)` is
  registered automatically.

```html
<script src="https://unpkg.com/blogr-plugins/dist/replacify.min.js"></script>
<script>
	BlogrPlugins.replacify(".post-body", /\bBlogr\b/g, "Blogr™");
	// or, with jQuery loaded first:
	$(".post-body").replacify(/\bBlogr\b/g, "Blogr™");
</script>
```