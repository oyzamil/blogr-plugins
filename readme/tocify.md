# tocify

Builds a nested table-of-contents list from the headings inside a container,
assigning `id`s to headings that don't already have one.

```ts
import { tocify } from "blogr-plugins";

const instance = tocify("#toc", { content: "#article", headings: "h2,h3" });

instance.destroy(); // removes the generated <ul class="toc-list">
```

---

## `tocify(target, options?)`

```ts
function tocify(
	target: ElementInput,
	options?: TocifyOptions,
): TocifyInstance;
```

### `target`

A CSS selector, a single `Element`, an array/`NodeList` of elements, or a
jQuery collection — one table-of-contents list is generated per matched element.

### `options`

All options are optional.

| Option     | Type            | Default          | Description |
| ---------- | --------------- | ---------------- | ------------- |
| `headings` | `string`        | `"h1,h2,h3"`     | Selector (relative to the content root) for headings to include |
| `content`  | `ElementInput`  | the target itself | Root element to scan for headings |

---

## Option details

### `headings`

CSS selector for heading elements to include in the table of contents.
Examples:
- `"h2,h3"` — only `<h2>` and `<h3>`
- `"h1,h2,h3,h4"` — all levels
- `"h2:not(.skip)"` — `<h2>` unless it has class `skip`

Any matched headings without an `id` attribute get one auto-generated.

### `content`

Root element to scan for headings. By default, the target itself is scanned.
Pass a different selector or element if your TOC container and content are separate:

```ts
tocify("#toc", { content: "article.post-content", headings: "h2,h3" });
```

---

## Return value — `TocifyInstance`

```ts
interface TocifyInstance {
	destroy(): void;
}
```

- **`destroy()`** — removes the generated `<ul class="toc-list">` from the target.
  Heading `id`s that were auto-generated are left in place.

---

## Formats & builds

Like every plugin in this package, `tocify` ships in three forms:

- **ESM / CJS** (`import { tocify } from "blogr-plugins"`), for
  bundled projects.
- **Standalone IIFE** — `dist/tocify.js` — exposes
  `window.BlogrPlugins.tocify`, for a plain `<script>` tag with no
  build step.
- **jQuery bridge** — if `jQuery`/`$` is present on the page when the
  script loads, `$(selector).tocify(options)` is registered
  automatically.

```html
<script src="https://unpkg.com/blogr-plugins/dist/tocify.min.js"></script>
<script>
	BlogrPlugins.tocify("#toc", { content: "#article" });
	// or, with jQuery loaded first:
	$("#toc").tocify({ content: "#article" });
</script>
```