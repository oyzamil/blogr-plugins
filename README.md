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
| [`avatarify`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/avatarify.md) | Auto-generates DiceBear avatars for commenters without a photo. |
| [`cookify`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/cookify.md) | Small, dependency-free cookie utility (a typed replacement for the classic `js-cookie` plugin). |
| [`createWidget`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/createWidget.md) | Blogger listing widget — related/recent/random posts, comments, pages. |
| [`lazify`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/lazify.md) | Lazy-loads media with `IntersectionObserver` once it scrolls near the viewport |
| [`marqify`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/marqify.md) | Turns a container's children into an infinite scrolling marquee. |
| [`menuify`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/menuify.md) | Turns a flat `<ul><li><a>` link list into a nested dropdown. |
| [`readMeter`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/readMeter.md) | Estimates reading time and renders it as a badge. |
| [`relatify`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/relatify.md) | Fetches related posts by label and inserts links within the article. |
| [`replacify`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/replacify.md) | Find-and-replace inside text nodes only — never touches tags or attributes. |
| [`resizeImage`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/resizeImage.md) | Resize Blogger/Google-hosted image URLs. |
| [`shortcodify`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/shortcodify.md) | A full shortcode/templating engine for `[tag attr="value"]content[/tag]` syntax. |
| [`stackify`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/stackify.md) | Turns a container's children into a peeking card stack. |
| [`stickify`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/stickify.md) | Sticks a sidebar to the viewport while scrolling, clamped to its container. |
| [`tocify`](https://github.com/oyzamil/blogr-plugins/blob/main/readme/tocify.md) | Builds a nested table-of-contents list from the headings inside a container. |

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

## License

MIT