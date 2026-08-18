# lazify

Lazy-loads media with `IntersectionObserver` once it scrolls near the
viewport: `<img>` and `<iframe>` get their `src` set, `<video>` gets its
poster and/or `<source>` children filled in (then `.load()` is called), and
anything else falls back to setting `background-image`.

```html
<img data-src="/photo.jpg" alt="" />
<iframe data-src="https://example.com/embed"></iframe>
<video data-poster="/poster.jpg" controls>
	<source data-src="/clip.webm" type="video/webm" />
	<source data-src="/clip.mp4" type="video/mp4" />
</video>
```

```ts
import { lazify } from "blogr-plugins";

const instance = lazify("img[data-src], iframe[data-src], video", {
	rootMargin: "200px",
	onLoad: (el) => console.log("loaded", el),
});

instance.destroy(); // stop observing anything not yet loaded
```

---

## `lazify(target, options?)`

```ts
function lazify(
	target: ElementInput,
	options?: LazifyOptions,
): LazifyInstance;
```

### `target`

A CSS selector, a single `Element`, an array/`NodeList` of elements, or a
jQuery collection — each matched element is observed for lazy loading.

### `options`

All options are optional.

| Option            | Type                    | Default      | Description |
| ------------------ | ----------------------- | ------------ | ------------- |
| `attribute`        | `string`                | `"data-src"` | Attribute holding the real media URL |
| `posterAttribute`  | `string`                | `"data-poster"` | Attribute holding a `<video>`'s poster image URL |
| `loadedClass`      | `string`                | `"lazy-ify"` | Class added once an element has finished loading |
| `rootMargin`       | `string`                | `"200px"`    | Root margin passed to the underlying `IntersectionObserver` |
| `onLoad`           | `(el: Element) => void` | —            | Called after each element finishes loading |

---

## Option details

### `attribute`

Name of the HTML attribute holding the real URL for the media to load. 
Common choices: `"data-src"`, `"data-href"`, or any custom attribute name.

### `posterAttribute`

For `<video>` elements, the attribute holding the poster image URL. 
Only applies to `<video>` tags; `<img>` and others use `attribute` instead.

### `loadedClass`

CSS class added to an element once its media has been loaded. Useful for
animations (fade-in, etc.) or styling already-loaded elements.

### `rootMargin`

Margin around the viewport for the `IntersectionObserver`. Set higher values
to trigger loading *before* the element enters the viewport. Examples:
- `"200px"` — load 200px before entering
- `"0px 0px 100px 0px"` — 100px below the viewport only
- `"50%"` — 50% of the viewport height

### `onLoad`

Callback fired after each element's media finishes loading. Receives the
loaded element as its argument.

---

## Return value — `LazifyInstance`

```ts
interface LazifyInstance {
	destroy(): void;
}
```

- **`destroy()`** — stops observing all elements and disconnects the
  `IntersectionObserver`. Already-loaded elements keep their loaded state.

---

## Formats & builds

Like every plugin in this package, `lazify` ships in three forms:

- **ESM / CJS** (`import { lazify } from "blogr-plugins"`), for
  bundled projects.
- **Standalone IIFE** — `dist/lazify.js` — exposes
  `window.BlogrPlugins.lazify`, for a plain `<script>` tag with no
  build step.
- **jQuery bridge** — if `jQuery`/`$` is present on the page when the
  script loads, `$(selector).lazify(options)` is registered
  automatically.

```html
<script src="https://unpkg.com/blogr-plugins/dist/lazify.min.js"></script>
<script>
	BlogrPlugins.lazify("img[data-src]", { rootMargin: "200px" });
	// or, with jQuery loaded first:
	$("img[data-src]").lazify({ rootMargin: "200px" });
</script>
```