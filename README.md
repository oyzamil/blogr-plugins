# blogr-plugins

Typed, modular plugin kit for Blogr templates — sticky sidebar, dropdown
menu, lazy-loading media, table of contents, text replace, shortcodes, a
cookie utility, and Blogger image-URL resizing. Modern TypeScript rewrite
of the old jQuery-only plugins, usable as plain ES modules **or** as
classic jQuery plugins.

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
import {
  stickify, menuify, lazify, tocify, replacify, shortcodify, stackify, avatarify, relatify, cookify,
} from "blogr-plugins";

stickify("#sidebar", { additionalMarginTop: 20 });
menuify("#menu");
lazify("img[data-src]");
tocify("#toc", { content: "#article", headings: "h2,h3" });
replacify("#intro", /Blogr/g, "Blogr™");
shortcodify("#post-body", {
  tags: { b: (_attrs, content) => `<strong>${content}</strong>` },
  allowHtml: true,
});
stackify("#testimonials", { offset: 20, interval: 4000 });
avatarify({
  container: "#comments",
  usernameSelector: ".cmHr .n bdi",
  commentSelector: ".c",
  avatarSelector: ".cmAv .im",
});
relatify("article", { labels }); // labels from the <b:loop> snippet below
marqify(".cards", { direction: "left", speed: "fast" });
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

Don't need all twelve. Each plugin also ships as its own standalone IIFE
file — pull just that one from unpkg/jsdelivr/cdnjs:

```html
<script src="https://unpkg.com/blogr-plugins/dist/stickify.min.js"></script>
<script>
	BlogrPlugins.stickify("#sidebar", { additionalMarginTop: 20 });
</script>
```

Files: `stickify.js`, `menuify.js`, `lazify.js`, `tocify.js`, `replacify.js`,
`shortcodify.js`, `stackify.js`, `avatarify.js`, `relatify.js`, `cookify.js`,
`resizeImage.js`, `createWidget.js` (each with a `.min.js`
twin). Every one still writes onto `BlogrPlugins`, merging in rather than
overwriting — so you can load two or three of these side by side and they
all land on the same global:

```html
<script src=".../stickify.min.js"></script>
<script src=".../menuify.min.js"></script>
<script>
	BlogrPlugins.stickify("#sidebar");
	BlogrPlugins.menuify("#menu");
</script>
```

Same jQuery auto-bridge applies per file too — load `lazify.min.js` alone
and you get `$.fn.lazify` with none of the other plugins attached.

If jQuery is already loaded on the page, the IIFE build **automatically**
registers `$.fn.stickify`, `$.fn.menuify`, `$.fn.lazify`, `$.fn.tocify`,
`$.fn.replacify`, `$.fn.shortcodify`, `$.fn.stackify` and `$.fn.relatify` —
no extra setup:

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://unpkg.com/blogr-plugins/dist/blogr-plugins.min.js"></script>
<script>
	$("#sidebar").stickify({ additionalMarginTop: 20 });
	$("#menu").menuify();
	$("img[data-src]").lazify();
	$("#post-body").shortcodify({
		tags: { b: (_attrs, content) => `<strong>${content}</strong>` },
	});
	$("#testimonials").stackify({ offset: 20, interval: 4000 });
	$("article").relatify({ labels });
	$(".cards").marqify({ speed: "fast" });
</script>
```

Every function accepts a **CSS selector, a single `Element`, an array/`NodeList`
of elements, or a jQuery collection** — pick whichever fits your codebase.

## Plugins

Each plugin has its own doc page with the full option reference and
examples:

| Plugin | Description |
|---|---|
| [`avatarify`](./readme/avatarify.md) | Auto-generates DiceBear avatars for commenters without a photo. |
| [`cookify`](./readme/cookify.md) | Small, dependency-free cookie utility (a typed replacement for the classic `js-cookie` plugin). |
| [`createWidget`](./readme/createWidget.MD) | Blogger listing widget — related/recent/random posts, comments, pages. |
| [`lazify`](./readme/lazify.MD) | Lazy-loads media with `IntersectionObserver` once it scrolls near the viewport |
| [`marqify`](./readme/marqify.md) | Turns a container's children into an infinite scrolling marquee. |
| [`menuify`](./readme/menuify.MD) | Turns a flat `<ul><li><a>` link list into a nested dropdown. |
| [`readMeter`](./readme/readMeter.md) | Estimates reading time and renders it as a badge. |
| [`relatify`](./readme/relatify.md) | Fetches related posts by label and inserts links within the article. |
| [`replacify`](./readme/replacify.MD) | Find-and-replace inside text nodes only — never touches tags or attributes. |
| [`resizeImage`](./readme/resizeImage.MD) | Resize Blogger/Google-hosted image URLs. |
| [`shortcodify`](./readme/shortcodify.MD) | A full shortcode/templating engine for `[tag attr="value"]content[/tag]` syntax. |
| [`stackify`](./readme/createWidget.MD) | Turns a container's children into a peeking card stack. |
| [`stickify`](./readme/stickify.MD) | Sticks a sidebar to the viewport while scrolling, clamped to its container. |
| [`tocify`](./readme/tocify.MD) | Builds a nested table-of-contents list from the headings inside a container. |

> `stickify`, `menuify`, `lazify`, `tocify`, `replacify`, `shortcodify`,
> `stackify`, and `cookify` are also part of this package (see the Quick
> start examples above) but don't yet have a dedicated doc page here.

## Cleaning up

`stickify`, `menuify`, `lazify`, `tocify`, `replacify`, `shortcodify`,
`stackify`, `relatify`, and `marqify` all return a `{ destroy(): void }` instance (`stackify`'s adds
`next()`/`prev()`/`goTo()`/`play()`/`pause()`/`getActiveIndex()` too) so
you can unbind listeners and revert any DOM changes, e.g. before a
client-side route change:

```ts
const menu = menuify("#menu");
// later
menu.destroy();
```

`createWidget` returns a `WidgetInstance` — the same `destroy()` plus
`refresh()` and `setQuery()`; see [createWidget.MD](./createWidget.MD).
`avatarify` returns an `AvatarifyInstance` — the same `destroy()` plus
`refresh()`; see [avatarify.md](./avatarify.md).

## Demo

See [`demo/index.html`](./demo/index.html) for a full page exercising
every plugin via both the vanilla API and the jQuery bridge,
[`demo/stackify.html`](./demo/stackify.html) for a dedicated stackify demo
with live option controls, and
[`demo/avatarify.html`](./demo/avatarify.html) for a dedicated avatarify
demo with a live, dynamically-updating comment thread, and
[`demo/relatify.html`](./demo/relatify.html) for a dedicated relatify demo
reading live from a real Blogger blog, and
[`demo/marqify.html`](./demo/marqify.html) for a dedicated marqify demo
with live option controls.

## Development

```bash
npm install
npm run dev        # tsdown --watch
npm test           # vitest
npm run typecheck  # tsc --noEmit
npm run build      # esm + cjs + iife (full bundle, per-plugin, plain and minified)
npm run docs       # typedoc -> markdown API reference
```

## License

MIT