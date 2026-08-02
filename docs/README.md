**blogr-plugins**

***

# blogr-plugins

Typed, modular plugin kit for Blogr templates — sticky sidebar, dropdown
menu, lazy-loading images, table of contents, text replace, and cookies.
Modern TypeScript rewrite of the old jQuery-only plugins, usable as plain
ES modules **or** as classic jQuery plugins.

- Zero dependencies at runtime
- Tree-shakeable — each plugin is its own module
- Ships ESM, CJS, and IIFE (with minified builds of each)
- Full TypeScript types + JSDoc
- Works standalone (vanilla JS) or bridges into jQuery automatically

## Install

```bash
npm install blogr-plugins
```

## Quick start

### As a modern SDK (ESM/TS)

```ts
import { stickify, menuify, lazify, tocify, replacify, cookify } from "blogr-plugins";

stickify("#sidebar", { additionalMarginTop: 20 });
menuify("#menu");
lazify("img[data-src]");
tocify("#toc", { content: "#article", headings: "h2,h3" });
replacify("#intro", /Blogr/g, "Blogr™");
cookify.set("theme", "dark", { expiresDays: 30 });
```

### Via `<script>` tag (IIFE)

```html
<script src="https://unpkg.com/blogr-plugins/dist/blogr-plugins.min.js"></script>
<script>
	const { stickify, menuify } = BlogrPlugins;
	stickify("#sidebar");
	menuify("#menu");
</script>
```

### Single plugin from a CDN (no full bundle)

Don't need all six. Each plugin also ships as its own standalone IIFE file
— pull just that one from unpkg/jsdelivr/cdnjs:

```html
<script src="https://unpkg.com/blogr-plugins/dist/stickify.min.js"></script>
<script>
	BlogrPlugins.stickify("#sidebar", { additionalMarginTop: 20 });
</script>
```

Files: `stickify.js`, `menuify.js`, `lazify.js`, `tocify.js`, `replacify.js`,
`cookify.js` (each with a `.min.js` twin). Every one still writes onto
`BlogrPlugins`, merging in rather than overwriting — so you can load
two or three of these side by side and they all land on the same global:

```html
<script src=".../stickify.min.js"></script>
<script src=".../menuify.min.js"></script>
<script>
	BlogrPlugins.stickify("#sidebar");
	BlogrPlugins.menuify("#menu");
</script>
```

Same jQuery auto-bridge applies per file too — load `lazify.min.js` alone
and you get `$.fn.lazify` with none of the other five attached.

If jQuery is already loaded on the page, the IIFE build **automatically**
registers `$.fn.stickify`, `$.fn.menuify`, `$.fn.lazify`, `$.fn.tocify` and
`$.fn.replacify` — no extra setup:

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://unpkg.com/blogr-plugins/dist/blogr-plugins.min.js"></script>
<script>
	$("#sidebar").stickify({ additionalMarginTop: 20 });
	$("#menu").menuify();
	$("img[data-src]").lazify();
</script>
```

Every function accepts a **CSS selector, a single `Element`, an array/`NodeList`
of elements, or a jQuery collection** — pick whichever fits your codebase.

## Plugins

### `stickify(target, options?)`

Sticks a sidebar to the viewport while scrolling, clamped to its container so
it never overflows the bottom. Full option-parity port of Theia Sticky
Sidebar — handles collapsible margins, floated multi-column layouts, and
responsive stacking the same way the original does.

| Option              | Type     | Default            | Description                                    |
| -------------------- | -------- | ------------------ | ----------------------------------------------- |
| `containerSelector`  | `string` | sidebar's parent   | Scroll container to clamp against                |

> **Gotcha:** if you don't set `containerSelector`, the container defaults
> to the sidebar's *direct* parent. If that parent is exactly as tall as
> the sidebar (e.g. an `<aside>` wrapping only the sidebar), there's no
> extra room to stick into and the sidebar will just sit static. Point
> `containerSelector` at whatever taller wrapper holds both the sidebar and
> your main content column.
| `additionalMarginTop`      | `number` | `0`            | Gap kept above the sidebar while stuck            |
| `additionalMarginBottom`   | `number` | `0`            | Gap kept below the sidebar before it stops        |
| `minWidth`                 | `number` | `0`            | Viewport width below which stickiness is disabled |
| `disableOnResponsiveLayouts` | `boolean` | `true`     | Disable when sidebar no longer fits its container |
| `sidebarBehavior`          | `"modern" \| "stick-to-top" \| "stick-to-bottom"` | `"modern"` | Which edge sticks, and where |
| `updateSidebarHeight`      | `boolean` | `true`         | Keep the sidebar's `min-height` in sync so the container never collapses |
| `defaultPosition`          | `string`  | `"relative"`   | Inline `position` set on the sidebar before stickiness kicks in |
| `verbose`                  | `boolean` | `false`        | Log a note when init is delayed by `minWidth`     |

```ts
const instance = stickify(".leftSidebar, .content, .rightSidebar", {
	additionalMarginTop: 30,
});
instance.destroy(); // unbind scroll/resize/ResizeObserver, restore original styles
```

### `menuify(target, options?)`

Turns a flat `<ul><li><a>` link list into a nested dropdown. Any link whose
text starts with the nesting prefix (`_` by default) is nested under the
previous non-prefixed link, and the prefix is stripped from the label.

```html
<ul id="menu">
	<li><a>Home</a></li>
	<li><a>Blog</a></li>
	<li><a>_Web Design</a></li>
	<li><a>_SEO</a></li>
	<li><a>Contact</a></li>
</ul>
```

```ts
menuify("#menu");
// "Web Design" and "SEO" become a <ul class="sub-menu"> under "Blog"
```

| Option           | Type     | Default        |
| ---------------- | -------- | -------------- |
| `nestingPrefix`  | `string` | `"_"`          |
| `submenuClass`   | `string` | `"sub-menu"`   |
| `hasSubClass`    | `string` | `"has-sub"`    |

### `lazify(target, options?)`

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
lazify("img[data-src], iframe[data-src], video", {
	rootMargin: "200px",
	onLoad: (el) => console.log("loaded", el),
});
```

| Option            | Type                       | Default          |
| ------------------ | -------------------------- | ---------------- |
| `attribute`         | `string`                   | `"data-src"`     |
| `posterAttribute`   | `string`                   | `"data-poster"`  |
| `loadedClass`       | `string`                   | `"lazy-ify"`     |
| `rootMargin`        | `string`                   | `"200px"`        |
| `onLoad`            | `(el: Element) => void`    | —                |

### `tocify(target, options?)`

Builds a nested table-of-contents list from the headings inside a container,
assigning `id`s to headings that don't already have one.

```ts
tocify("#toc", { content: "#article", headings: "h2,h3" });
```

| Option     | Type          | Default        |
| ---------- | ------------- | -------------- |
| `headings` | `string`      | `"h1,h2,h3"`   |
| `content`  | `ElementInput`| the target itself |

### `replacify(target, search, replacement, options?)`

Find-and-replace inside text nodes only — never touches tags or attributes.

```ts
replacify(".post-body", /\bBlogr\b/g, "Blogr™");
replacify(".post-body", "click here", '<a href="/start">click here</a>', { allowHtml: true });
```

| Option      | Type      | Default | Description                          |
| ----------- | --------- | ------- | ------------------------------------- |
| `allowHtml` | `boolean` | `false` | Parse replacement string as markup    |

### `cookify`

Small, dependency-free cookie utility. Values are JSON-encoded automatically.

```ts
cookify.set("theme", "dark", { expiresDays: 365 });
cookify.get("theme");    // "dark"
cookify.getAll();        // { theme: "dark", ... }
cookify.remove("theme");
```

### `resizeImage(url, options?)` / `isSupportedImage(url)`

Rewrites Blogger/Google-hosted image URLs (`googleusercontent.com` /
`bp.blogspot.com`) with new size, crop, format, flip, rotation and
grayscale parameters. Unsupported URLs are returned unchanged — safe to
run any image URL through it without checking first.

```ts
import { resizeImage, isSupportedImage } from "blogr-plugins";

const url = resizeImage("https://1.bp.blogspot.com/path/s72-c/image.jpg", {
	width: 400,
	height: 400,
	format: "webp",
});

isSupportedImage(url); // true
```

| Option      | Type                             | Default   | Description                        |
| ----------- | --------------------------------- | --------- | ------------------------------------ |
| `height`    | `number`                          | `360`     | Output height in px                  |
| `width`     | `number`                          | `640`     | Output width in px                   |
| `crop`      | `"circle" \| "square"`            | none      | Crop shape                           |
| `format`    | `"jpeg" \| "png" \| "webp"`       | `"webp"`  | Output image format                  |
| `flip`      | `"horizontally" \| "vertically"`  | none      | Flip direction                       |
| `rotate`    | `number` (`90 \| 180 \| 270`)     | `0`       | Rotation in degrees                  |
| `grayscale` | `boolean`                         | `false`   | Convert to grayscale                 |

## Cleaning up

`stickify`, `menuify`, `lazify`, `replacify`, and `tocify` all return a
`{ destroy(): void }` instance so you can unbind listeners and revert any DOM
changes, e.g. before a client-side route change:

```ts
const menu = menuify("#menu");
// later
menu.destroy();
```

## Examples

See [`examples/index.html`](_media/index.html) for a full page exercising
every plugin via both the vanilla API and the jQuery bridge.

## Development

```bash
npm install
npm run dev        # tsup --watch
npm test           # vitest
npm run typecheck  # tsc --noEmit
npm run build      # esm + cjs + iife, each plain and minified
```

## License

MIT
