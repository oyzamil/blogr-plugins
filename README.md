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
> [`demo/stackify.html`](./demo/stackify.html) for a full example matching
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
`blogr-plugins`). See **[createWidget.MD](./createWidget.MD)** for the full
prop reference, every lifecycle hook, and detailed examples.

### `avatarify(config)` — comment avatars

Auto-generates a [DiceBear](https://www.dicebear.com) avatar for every
commenter who doesn't already have one — built for Blogger's native comment
widget, where anonymous/no-photo commenters get a blank placeholder image.
Lazy-loads (only scans once the comment section nears the viewport) and
keeps watching with a `MutationObserver`, so comments added later —
pagination, "load more", async widgets — get avatars too.

```ts
import { avatarify } from "blogr-plugins";

const instance = avatarify({
	container: "#comments",
	usernameSelector: ".cmHr .n bdi",
	commentSelector: ".c",
	timestampSelector: ".d.dtTm",
	timestampAttribute: "data-datetime",
	avatarSelector: ".cmAv .im",
	setRandomAvatarForAll: true,
	avatarStyle: "thumbs",
});

instance.refresh(); // force an immediate rescan
instance.destroy(); // stop both observers (already-set avatars are left in place)
```

| Option                    | Type                                       | Default                | Description |
| -------------------------- | ------------------------------------------- | ------------------------ | ------------ |
| `container`                 | `ElementInput`                              | see fallback note below  | Root element watched by both observers |
| `usernameSelector`          | `string`                                    | —                         | **Required.** Selector for the commenter's username element |
| `commentSelector`           | `string`                                    | —                         | **Required.** Selector for the comment wrapper (used with `.closest()` from the username) |
| `avatarSelector`            | `string`                                    | —                         | **Required.** Selector (relative to the comment) for the avatar element |
| `timestampSelector`         | `string`                                    | none                      | Selector (relative to the comment) for the timestamp element. Omit to leave timestamp out of the seed entirely |
| `timestampAttribute`        | `string`                                    | none                      | Attribute to read on the timestamp element (e.g. `"data-datetime"`); falls back to its text content |
| `setRandomAvatarForAll`     | `boolean`                                   | `false`                   | `true` replaces every avatar, even ones with a real photo already |
| `avatarStyle`                | `string`                                    | `"thumbs"`                | Any [DiceBear style](https://www.dicebear.com/styles) name |
| `emptyAvatarUrls`            | `string[]`                                  | Blogger's two blank URLs  | Additional background-image/`src` substrings to treat as "blank" |
| `dicebearVersion`            | `string`                                    | `"7.x"`                   | DiceBear API version segment |
| `apiUrl`                     | `string`                                    | none                      | Full URL template overriding DiceBear — `{style}`/`{seed}` are replaced |
| `seed`                       | `(username, timestamp) => string`           | username + timestamp      | Overrides how the per-comment seed string is built |
| `rootMargin`                 | `string`                                    | `"0px"`                   | `rootMargin` for the lazy-load `IntersectionObserver` |
| `debounce`                   | `number`                                    | `150`                     | Ms debounce applied to `MutationObserver`-triggered rescans |
| `onAvatarSet`                | `(detail) => void`                          | —                         | Called once per avatar actually set |
| `onError`                    | `(message: string) => void`                 | `console.error`           | Called on a recoverable issue (a selector matched nothing, etc) |

If `container` is omitted, it falls back to the closest ancestor of the
first element matching `commentSelector`, then of the first element
matching `avatarSelector`, then to `document.body`.

The avatar element can be either an `<img>` (its `src` is set) or any other
element using a CSS `background-image` (set with `!important`, matching
Blogger's own `.im` avatar div convention) — detected automatically per
element.

> `avatarify` has no jQuery bridge — `container` lives inside its config
> object rather than being the jQuery target, so call
> `BlogrPlugins.avatarify({ ... })` directly either way. See
> [`demo/avatarify.html`](./demo/avatarify.html) for a full Tailwind-styled
> example with a live comment thread.

### `relatify(target, options?)` — in-article related links

Fetches related posts for the current article by label and inserts a
randomly-placed link (or several, scaled to article length) after
paragraphs — or any other elements you choose — within it.

#### Getting the current post's labels

`relatify` needs the *current* post's own labels to look up related posts
for it. Blogger doesn't expose that anywhere in the DOM by default, so add
this `<script>` block to your **post template** (in the Blogger theme
editor: **Theme → Edit HTML**, or **Layout → Edit** on the post page
element), somewhere inside the post-loop so `data:post.labels` resolves —
right after the post content is a good spot:

```html
<script>
	const labels = [
		<b:loop values='data:post.labels' var='label'>
			"<data:label.name/>"<b:if cond='not data:label.isLast'>,</b:if>
		</b:loop>
	];
</script>
```

This renders as a plain JS array of the post's label names at page-render
time (e.g. `const labels = ["javascript", "tutorial"];`), which is a
different `labels` from `blogr-plugins`' own JS-side variable naming — feel
free to rename it (e.g. `postLabels`) to avoid any confusion in your
template. Then pass it straight into `relatify`:

```html
<script src="https://unpkg.com/blogr-plugins/dist/blogr-plugins.min.js"></script>
<script>
	const { relatify } = BlogrPlugins;
	relatify("article", { labels });
</script>
```

#### Usage

```ts
import { relatify } from "blogr-plugins";

const instance = relatify("article", {
	labels, // from the snippet above
	insertAfter: ["p", ".paragraph", ".video"],
	excludeLabels: ["announcements"],
	relevance: "strict",
	maxLinks: 3,
	template: (post) =>
		`Related: <a href="${post.url}">${post.title}</a>`,
});

instance.destroy(); // removes every inserted link (or cancels an in-flight fetch)
```

| Option           | Type                                             | Default                    | Description |
| ----------------- | -------------------------------------------------- | ---------------------------- | ------------ |
| `labels`            | `string[]`                                          | `[]`                          | Labels to find related posts for. Empty fetches recent posts across the whole blog instead of filtering by label |
| `insertAfter`       | `string \| string[]`                                | `"p"`                         | Element(s) after which a link may be inserted, matched within the container. An array is joined with `,` |
| `maxLinks`          | `number`                                            | scaled to word count          | `Math.floor(wordCount / 500) + 1` (min `1`) — 2 for ~500 words, 3 for ~1000, and so on. Always capped by however many eligible `insertAfter` elements and related posts actually exist |
| `excludeLabels`      | `string[]`                                          | `[]`                          | Labels left out of the *search* — see note below |
| `relevance`          | `"strict" \| "default"`                             | `"strict"`                    | `"strict"` scores candidates by word overlap against the nearest heading (or `document.title`) and picks the best matches; `"default"` shuffles and picks randomly |
| `template`           | `(post, index) => string`                           | `` `You may also like: <a href="${post.url}">${post.title}</a>` `` | Renders one inserted link — same shape as `createWidget`'s `template` |
| `blogUrl`            | `string`                                            | `window.location.origin`      | Only needed if this runs somewhere other than the blog itself |
| `currentUrl`         | `string`                                            | `<link rel="canonical">`, then `location.href` | Override if neither reliably identifies the current post in your setup |
| `sampleSize`         | `number`                                            | `20`                          | How many candidate posts to fetch (per label, or overall when unfiltered) before scoring/picking |
| `linkClass`          | `string`                                            | `"relatify-link"`             | Class on each inserted link's wrapper `<div>` |
| `beforeFetch`        | `() => void`                                        | —                              | Called right before fetching |
| `afterFetch`         | `(posts) => void`                                   | —                              | Called with the final chosen related posts, before any are inserted |
| `onInsert`           | `(detail) => void`                                  | —                              | Called once per link actually inserted — `{ post, element, index }` |
| `onEmpty`            | `() => void`                                        | —                              | Called when there are no related posts, or no eligible `insertAfter` elements |
| `onError`            | `(err) => void`                                     | `console.error`                | Called if the fetch fails |
| `lazy`               | `boolean`                                           | `true`                         | Enable lazy loading — plugin initializes only when first `insertAfter` element comes near the viewport, preventing API calls on page load |
| `rootMargin`         | `string`                                            | `"0px"`                        | Margin (in pixels or CSS string) for `IntersectionObserver` to trigger lazy load before element enters viewport. Examples: `"100px"`, `"10%"`, `"0px 0px 50px 0px"` |

**`excludeLabels` note:** it only controls which labels are *used to
search* — even if `labels` includes one of these, it won't be queried. A
related post found via a different, non-excluded label is still kept even
if it also happens to carry an excluded label; `excludeLabels` doesn't
filter results by the candidates' own labels.

`relatify` fits the classic `$(sel).plugin(options)` jQuery shape, so it
**does** get the jQuery bridge: `$("article").relatify({ labels })`.

See [`demo/relatify.html`](./demo/relatify.html) for a full example reading
live from a real Blogger blog.

### `marqify(target, options?)` — infinite marquee

Turns a container's children into an infinitely-scrolling CSS marquee —
logos, card rows, testimonial strips — sized to always fill the container
regardless of viewport width. Ports the reps/duration calculation from the
[marqy](https://github.com/abnud1/marqy) web component into an imperative
plugin: pass it a container of items instead of a custom element.

**Injects a small stylesheet into `<head>`** (once per page, id
`marqify-styles`, however many containers you marquee) the first time it's
called — no separate CSS file to import.

```html
<div class="cards">
	<div class="card">Card A</div>
	<div class="card">Card B</div>
	<div class="card">Card C</div>
</div>
```

```ts
import { marqify } from "blogr-plugins";

const instance = marqify(".cards", {
	direction: "left",
	speed: "fast",
	pauseOnHover: true,
});

instance.destroy(); // disconnects observers, restores the original content
```

| Option              | Type                                    | Default    | Description |
| --------------------- | ----------------------------------------- | ------------ | ------------ |
| `direction`            | `"left" \| "right"`                       | `"left"`     | Which way the content scrolls |
| `delayBeforeStart`     | `number`                                  | `0`          | Delay (ms) before the marquee starts moving. `0` = no delay |
| `duplicated`           | `boolean`                                 | `true`       | Duplicates the content so the loop is seamless. `false` renders it once — the animation still runs, but jumps back to the start each cycle instead of looping smoothly |
| `pauseOnHover`         | `boolean`                                 | `true`       | Pauses while the pointer is over it |
| `speed`                | `"slow" \| "medium" \| "fast" \| number`  | `"medium"`   | Named presets map to `0.25` / `0.5` / `1` (higher = faster); pass a number directly for finer control |

`marqify` fits the classic `$(sel).plugin(options)` jQuery shape, so it
**does** get the jQuery bridge: `$(".cards").marqify({ speed: "fast" })`.

See [`demo/marqify.html`](./demo/marqify.html) for a full example with live
option controls.

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
`refresh()`.

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
