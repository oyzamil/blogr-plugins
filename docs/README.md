**blogr-plugins**

***

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
  stickify, menuify, lazify, tocify, replacify, shortcodify, cookify,
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

Don't need all eight. Each plugin also ships as its own standalone IIFE
file — pull just that one from unpkg/jsdelivr/cdnjs:

```html
<script src="https://unpkg.com/blogr-plugins/dist/stickify.min.js"></script>
<script>
	BlogrPlugins.stickify("#sidebar", { additionalMarginTop: 20 });
</script>
```

Files: `stickify.js`, `menuify.js`, `lazify.js`, `tocify.js`, `replacify.js`,
`shortcodify.js`, `cookify.js`, `resizeImage.js` (each with a `.min.js`
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
`$.fn.replacify` and `$.fn.shortcodify` — no extra setup:

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
import { stickify } from "blogr-plugins";

const instance = stickify(".leftSidebar, .content, .rightSidebar", {
	additionalMarginTop: 30,
	sidebarBehavior: "modern", // or "stick-to-top" / "stick-to-bottom"
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
import { menuify } from "blogr-plugins";

const instance = menuify("#menu");
// "Web Design" and "SEO" become a <ul class="sub-menu"> under "Blog"

instance.destroy(); // restores the flat list and removes the generated submenus
```

| Option           | Type     | Default        | Description |
| ---------------- | -------- | -------------- | ------------ |
| `nestingPrefix`  | `string` | `"_"`          | Prefix marking a link as belonging to the previous item's submenu |
| `submenuClass`   | `string` | `"sub-menu"`   | Class applied to generated `<ul>` submenus |
| `hasSubClass`    | `string` | `"has-sub"`    | Class applied to `<li>` items that received a submenu |

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
import { lazify } from "blogr-plugins";

const instance = lazify("img[data-src], iframe[data-src], video", {
	rootMargin: "200px",
	onLoad: (el) => console.log("loaded", el),
});

instance.destroy(); // stop observing anything not yet loaded
```

| Option            | Type                       | Default          | Description |
| ------------------ | -------------------------- | ---------------- | ------------ |
| `attribute`         | `string`                   | `"data-src"`     | Attribute holding the real media URL |
| `posterAttribute`   | `string`                   | `"data-poster"`  | Attribute holding a `<video>`'s poster image URL |
| `loadedClass`       | `string`                   | `"lazy-ify"`     | Class added once an element has finished loading |
| `rootMargin`        | `string`                   | `"200px"`        | Root margin passed to the underlying `IntersectionObserver` |
| `onLoad`            | `(el: Element) => void`    | —                | Called after each element finishes loading |

### `tocify(target, options?)`

Builds a nested table-of-contents list from the headings inside a container,
assigning `id`s to headings that don't already have one.

```ts
import { tocify } from "blogr-plugins";

const instance = tocify("#toc", { content: "#article", headings: "h2,h3" });

instance.destroy(); // removes the generated <ul class="toc-list">
```

| Option     | Type          | Default            | Description |
| ---------- | ------------- | ------------------ | ------------ |
| `headings` | `string`      | `"h1,h2,h3"`       | Selector (relative to the content root) for headings to include |
| `content`  | `ElementInput`| the target itself  | Root element to scan for headings |

### `replacify(target, search, replacement, options?)`

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

| Option      | Type      | Default | Description                          |
| ----------- | --------- | ------- | ------------------------------------ |
| `allowHtml` | `boolean` | `false` | Parse replacement string as markup   |

### `shortcodify` — shortcode engine

A full shortcode/templating engine for `[tag attr="value"]content[/tag]`
syntax — think Blogger's own conditional tags or WordPress shortcodes, but
typed, dependency-free, and configurable. It's a from-scratch, hardened
rewrite of a small internal `shortCodeIfy(str, key)` helper (a single
`$key={value}`-style lookup with no nesting, no typed attributes, and no
error handling); this version adds a real tag/attribute grammar, nesting,
self-closing tags, a reusable tag registry, escaping, and safe error
recovery.

It ships four pieces:

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

#### Syntax supported

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

#### `renderShortcodes(text, options)`

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

#### `shortcodify(target, options)`

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

> A shortcode must live entirely inside a single text node to be found by
> `shortcodify` (it walks the DOM the same way `replacify` does). For
> content that spans multiple elements — or before it's ever inserted into
> the page — call `renderShortcodes` on the raw string instead.

#### `createShortcodeRegistry(initial?)`

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

#### `defaultShortcodeTags`

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

#### `ShortcodifyOptions` reference

| Option       | Type                                          | Default   | Description |
| ------------ | ---------------------------------------------- | --------- | ------------ |
| `tags`       | `Record<string, ShortcodeHandler>`             | —         | Map of tag name → handler. **Required.** |
| `openTag`    | `string`                                       | `"["`     | Opening delimiter |
| `closeTag`   | `string`                                       | `"]"`     | Closing delimiter |
| `unknownTag` | `"keep" \| "strip" \| "remove"`                 | `"keep"`  | What to do with a tag-shaped match that has no handler |
| `recursive`  | `boolean`                                       | `true`    | Re-render a handler's own output for further shortcodes it contains |
| `maxDepth`   | `number`                                        | `5`       | Safety cap on recursive re-render passes |
| `onError`    | `(error: unknown, tag: string) => void`         | —         | Called if a handler throws; the tag renders as an empty string |
| `allowHtml`  | `boolean` (`shortcodify` only)                  | `false`   | Parse rendered output as HTML instead of inserting it as literal text |

A `ShortcodeHandler` has the signature
`(attrs: ShortcodeAttributes, content: string, tag: string) => string`,
where `attrs` is a plain object of already-coerced values and `content` is
the tag's already-rendered inner text (empty string for self-closing tags).

### `cookify`

Small, dependency-free cookie utility (a typed replacement for the classic
`js-cookie` plugin). Values are JSON-encoded automatically, so you can store
strings, numbers, booleans, or plain objects/arrays.

```ts
import { cookify } from "blogr-plugins";

cookify.set("theme", "dark", { expiresDays: 365 });
cookify.get("theme");    // "dark"
cookify.getAll();        // { theme: "dark", ... }
cookify.remove("theme"); // true (it existed)
```

| Method                                  | Description |
| ---------------------------------------- | ------------ |
| `set(name, value, options?)`            | Writes a cookie. `options`: `expiresDays`, `path` (default `"/"`), `domain`, `secure`, `sameSite` (default `"Lax"`) |
| `get<T>(name)`                          | Reads and JSON-parses a cookie, or `undefined` if not set |
| `getAll()`                              | Returns every cookie as a `Record<string, unknown>` |
| `remove(name, options?)`                | Deletes a cookie (`path`/`domain` must match what it was set with); returns whether it existed |

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

### `stackify(target, options?)` — peeking card stack

Turns a container's children into a peeking card stack — like a small deck
of index cards — that auto-cycles the front card to the back on a timer.

```html
<div id="testimonials">
	<div class="card">...</div>
	<div class="card">...</div>
	<div class="card">...</div>
</div>
```

```ts
import { stackify } from "blogr-plugins";

const stack = stackify("#testimonials", {
	offset: 20,
	interval: 4000,
	pauseOnHover: true,
});

stack.next();     // advance manually
stack.prev();     // or go back
stack.goTo(2);    // bring the 3rd original card to the front
stack.pause();    // stop the auto-cycle timer
stack.play();     // resume it
stack.getActiveIndex(); // -> [<original index currently in front>]

stack.destroy(); // restores every card's original styles
```

| Option            | Type                              | Default              | Description |
| ------------------ | ---------------------------------- | --------------------- | ------------ |
| `offset`            | `number`                           | `20`                  | Px peek between a card and the one behind it — implemented with absolute positioning (not a literal CSS margin) so it stays correct regardless of card height |
| `scaleStep`         | `number`                           | `0`                    | Shrinks each card behind the front one by this fraction, for a subtle fan/depth effect |
| `visibleCards`      | `number`                           | every card             | How many cards (counting the front) stay visible; further-back ones fade to `opacity: 0` |
| `interval`          | `number`                           | `3000`                 | Ms between automatic cycles. `0` disables the timer |
| `autoplay`          | `boolean`                          | `true`                 | Whether the timer starts immediately |
| `duration`          | `number`                           | `500`                  | Transition duration (ms) for a card moving between stack positions |
| `easing`            | `string`                           | `"ease"`               | CSS timing function for that transition |
| `direction`         | `"forward" \| "backward"`          | `"forward"`            | `"forward"` sends the front card to the back each tick; `"backward"` brings the back card to the front |
| `pauseOnHover`      | `boolean`                          | `true`                 | Pause the timer while the pointer is over the stack |
| `clickToActivate`   | `boolean`                          | `true`                 | Clicking a non-front card brings it to the front |
| `draggable`         | `boolean`                          | `false`                | Lets the front card be dragged/swiped left or right to advance/go back |
| `startIndex`        | `number`                           | `0`                    | Original index of the card that starts in front |
| `activeClass`       | `string`                           | `"stackify-active"`    | Class toggled on whichever card is currently in front |
| `cardClass`         | `string`                           | `"stackify-card"`      | Class added to every card |
| `stackClass`        | `string`                           | `"stackify-stack"`     | Class added to the container |
| `onBeforeChange`    | `(detail) => void`                 | —                      | Called right as a cycle's transition begins |
| `onAfterChange`     | `(detail) => void`                 | —                      | Called once a cycle's transition has finished |

`onBeforeChange`/`onAfterChange` receive
`{ fromIndex, toIndex, fromCard, toCard }`, where `fromIndex`/`toIndex` are
the cards' original (DOM order) indices — stable regardless of how many
times the stack has cycled.

If `target` matches more than one container, `next()`/`prev()`/`goTo()`/
`play()`/`pause()` control every matched stack together, and
`getActiveIndex()` returns one entry per stack, in match order.

> `stackify` doesn't inject any visual styling (shadows, borders, radius) —
> only the structural positioning it needs to work. Style `.stackify-card`
> and `.stackify-active` yourself, or see
> [`demo/stackify.html`](_media/stackify.html) for a full example matching
> a typical testimonial-card look.

### `createWidget` — Blogger listing widget

A self-contained related-posts/recent-posts/random-posts/comments/pages
widget built on the [`blogr`](https://jsr.io/@oyzamil/blogr) SDK — fetching,
thumbnail resizing (via `resizeImage`), infinite scroll/load-more, in-memory
and `localStorage` caching, and a full lifecycle-hook/templating API.

```ts
import { createWidget } from "blogr-plugins";

const widget = createWidget({
	containerSelector: "#relatedPosts",
	blogUrl: "https://example.blogspot.com",
	related: true,
	excludeCurrent: true,
	currentPostId: "1234567890123456789",
	labels: ["javascript"],
	maxVisibleItems: 6,
	loadMore: true,
	template: (entry) => `
		<article>
			<img src="${entry.thumbnail}" alt="${entry.title}" />
			<h3>${entry.title}</h3>
			<p>${entry.content}</p>
		</article>
	`,
});

widget.destroy();
```

Requires the `blogr` package (installed automatically as a dependency of
`blogr-plugins`). See **[createWidget.MD](_media/createWidget.MD)** for the full
prop reference, every lifecycle hook, and detailed examples.

## Cleaning up

`stickify`, `menuify`, `lazify`, `tocify`, `replacify`, and `shortcodify`
all return a `{ destroy(): void }` instance so you can unbind listeners and
revert any DOM changes, e.g. before a client-side route change:

```ts
const menu = menuify("#menu");
// later
menu.destroy();
```

`createWidget` returns a `WidgetInstance` — the same `destroy()` plus
`refresh()` and `setQuery()`; see [createWidget.MD](_media/createWidget.MD).

## Demo

See [`demo/index.html`](_media/index.html) for a full page exercising
every plugin via both the vanilla API and the jQuery bridge.

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
