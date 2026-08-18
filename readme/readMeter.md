# readMeter

Estimates reading time for one or more content blocks — word count
(optionally splitting out code blocks at a slower reading speed) plus
an optional flat per-image time — and renders it as a small badge, e.g.
`"Read time: 5"`.

```ts
import { readMeter } from "blogr-plugins";

readMeter(".post", {
	includeElements: ["article"],
	excludeElements: [".share-buttons"],
	wordsPerMinute: 200,
	includeImages: true,
	format: "text",
	appendTo: ".post-meta",
});
```

Also works as a jQuery plugin (`$(".post").readMeter({...})`) and as a
standalone browser global (`BlogrReadMeter.readMeter(...)`) — see
[Formats](#formats--builds) below.

---

## `readMeter(input, options?)`

```ts
function readMeter(
	input: ElementInput,
	options?: ReadMeterOptions,
): ReadMeterInstance;
```

### `input`

A CSS selector, a single `Element`, an array/`NodeList` of elements, or a
jQuery collection — one badge is computed **per matched element**. This is
the *container* to process: by default the container's whole text is
measured, but `options.includeElements`/`options.excludeElements` let you
narrow that down to specific children (see below).

```ts
// One badge for a single article page:
readMeter("article.post-content");

// One badge per post on an index/archive page:
readMeter(".post-preview");
```

### `options`

All options are optional.

| Option | Type | Default | Description |
|---|---|---|---|
| [`includeElements`](#includeelements--excludeelements) | `string[]` | `undefined` (whole target) | Only measure these children of each matched container. |
| [`excludeElements`](#includeelements--excludeelements) | `string[]` | `undefined` (nothing excluded) | Strip these children out of the measured content. |
| [`wordsPerMinute`](#wordsperminute) | `number` | `200` | Reading speed for regular text. |
| [`includeImages`](#includeimages--imagetimeseconds) | `boolean` | `false` | Add extra time for images. |
| [`imageTimeSeconds`](#includeimages--imagetimeseconds) | `number` | `10` | Seconds added per image when `includeImages` is on. |
| [`includeCode`](#includecode--codewordsperminute) | `boolean` | `false` | Count code blocks separately, at a slower speed. |
| [`codeWordsPerMinute`](#includecode--codewordsperminute) | `number` | `100` | Reading speed for code text when `includeCode` is on. |
| [`format`](#format) | `"minutes" \| "minutes+seconds" \| "text"` | `"minutes"` | How the time is rendered as a string. |
| [`template`](#template) | `(readTime: string) => string` | `(time) => \`Read time: ${time}\`` | Renders the badge's markup from the formatted time string. |
| [`appendTo`](#appendto) | `string \| HTMLElement \| null` | `null` | Where to insert the badge. `null` = don't insert, just report via `onUpdate`. |
| [`updateOnResize`](#updateonresize--debouncems) | `boolean` | `false` | Recalculate (debounced) on window resize. |
| [`debounceMs`](#updateonresize--debouncems) | `number` | `250` | Debounce delay for the resize handler. |
| [`onUpdate`](#onupdate) | `(timeString: string, minutes: number) => void` | — | Called after every calculation. |

---

## Option details

### `includeElements` / `excludeElements`

By default, the plugin measures the **whole matched container's** text.
These two options let you narrow that down without having to restructure
your markup.

**`includeElements`** — CSS selectors, relative to each container, for
the children to measure. Every descendant matching *any* of the given
selectors is included (duplicates across overlapping selectors are only
counted once). If omitted, or if none of the selectors match anything
inside a given container, that container's whole text is used instead —
you never need to special-case a missing match.

**`excludeElements`** — CSS selectors, relative to each container, for
descendants to strip out before measuring. Applied *after*
`includeElements`, so it can remove something nested inside whatever was
included (e.g. a share-buttons block sitting inside your `<article>`).
Also affects image counting — an `<img>` inside an excluded element
doesn't count toward `includeImages` either.

```ts
// #post has no nested <article>, so #post's own text is measured:
readMeter("#post");

// Only .body is measured, not the rest of .post's markup:
readMeter(".post", { includeElements: [".body"] });

// Measure .body, but strip out a share-buttons block nested inside it:
readMeter(".post", {
	includeElements: [".body"],
	excludeElements: [".share-buttons"],
});
```

### `wordsPerMinute`

Reading speed for ordinary text, in words per minute. Word count is a
simple whitespace split of the content's `textContent` (after removing
code blocks, if `includeCode` is on — see below).

### `includeImages` / `imageTimeSeconds`

When `includeImages` is `true`, every `<img>` found inside the content
adds `imageTimeSeconds` seconds to the total (a flat per-image cost, not
based on image size or position — matching the common "images add ~10s
each" convention used by most reading-time estimators).

```ts
readMeter(".post", { includeImages: true, imageTimeSeconds: 12 });
```

### `includeCode` / `codeWordsPerMinute`

By default, text inside `<pre>`/`<code>` elements is just part of the
regular word count, read at `wordsPerMinute` like everything else.

Turning `includeCode` on changes that: code text is pulled *out* of the
regular count and timed separately at `codeWordsPerMinute` (100wpm by
default — code is typically skimmed more slowly, or skipped/scanned, than
prose). The two totals are added together, so code words are never
counted twice.

```ts
readMeter(".post", { includeCode: true, codeWordsPerMinute: 80 });
```

### `format`

Controls how the computed time is turned into a string (passed as the
first argument to `onUpdate`, and used to build the badge's text):

| `format` | Example | Notes |
|---|---|---|
| `"minutes"` (default) | `"5"` | Whole minutes, rounded **up**, minimum `1` for any non-empty content. |
| `"minutes+seconds"` | `"5m 30s"` | `Xm Ys` — total time rounded to the nearest second, then split into minutes/seconds. |
| `"text"` | `"5 minute read"` | Same whole-minute rounding as `"minutes"`, wrapped in words. |

`"minutes"` and `"text"` both round *up* rather than to the nearest
minute — a 90-second read shows as `"2"` / `"2 minute read"`, not `"1"`,
and content under a minute still shows `"1"` rather than `"0"`.

### `template`

Controls the markup rendered into the badge when it's inserted (via
`appendTo`). Follows the same `template` convention as `createWidget` and
`relatify` in this package: a function that receives the already-formatted
time string and returns HTML, used as the badge's `innerHTML` **verbatim**.

```ts
// Default:
template: (time) => `Read time: ${time}`

// Custom markup:
readMeter(".post", {
	appendTo: ".meta",
	format: "text",
	template: (time) => `<svg class="clock-icon">…</svg> <span>${time}</span>`,
});
```

> Note: `format: "text"` already includes the word "read" in the
> formatted string (e.g. `"5 minute read"`). Combining it with the
> default `template` produces `"Read time: 5 minute read"`. This is
> intentional — the two options are independent — so pick a `format` /
> `template` pairing that doesn't repeat itself for your use case (e.g.
> use `format: "minutes"` with the default template, or `format: "text"`
> with a custom template that skips the "Read time:" prefix).

### `appendTo`

Where the badge gets inserted:

- **`null`** (default): nothing is inserted into the page — use
  `onUpdate` to get the computed value and render it yourself.
- **CSS selector string**: resolved *first inside the matched container*,
  then (if nothing matches there) against the whole document — so the
  same selector works whether you have one target with a nested `.meta`
  element, or one shared display area for many targets.
- **`HTMLElement`**: used directly as the mount point for every matched
  target (useful for a single shared summary, e.g. on a single-post
  page).

In every case, the badge is *appended* into the mount point — any
existing content there is left alone — and the same badge element is
reused (not duplicated) on every recalculation, whether triggered by
`updateOnResize` or a manual `.refresh()`.

```ts
// Nested per-post meta area:
readMeter(".post", { appendTo: ".post-meta" });

// One shared display element for a single article page:
readMeter("article", { appendTo: document.getElementById("read-time")! });
```

### `updateOnResize` / `debounceMs`

When `updateOnResize` is `true`, the plugin listens for `window`
`resize` events and re-runs the full calculation (debounced by
`debounceMs`, default `250`ms) — useful if your content or image set can
change in response to a viewport/layout change (e.g. a responsive image
gallery swapping in a different image set). A burst of resize events
collapses into a single recalculation once things settle.

Off by default, since word/image counts don't normally change on
resize.

### `onUpdate`

```ts
onUpdate?: (timeString: string, minutes: number) => void;
```

Called after **every** calculation — the initial run, every
`updateOnResize`-triggered recalculation, and every manual
`.refresh()` call — regardless of whether `appendTo` is set.

- `timeString` — the fully formatted string per `format` (e.g. `"5"`,
  `"5m 30s"`, `"5 minute read"`).
- `minutes` — the **raw, unrounded** total in minutes (e.g. `5.5`), for
  callers who want to do their own formatting/analytics instead of (or
  alongside) `timeString`.

```ts
readMeter(".post", {
	appendTo: null,
	onUpdate(timeString, minutes) {
		analytics.track("read_time_shown", { minutes });
		myBadge.textContent = timeString;
	},
});
```

---

## Return value — `ReadMeterInstance`

```ts
interface ReadMeterInstance {
	refresh(): void;
	destroy(): void;
}
```

- **`refresh()`** — re-runs the calculation immediately for every matched
  target and re-fires `onUpdate` / updates the badge. Useful after
  content changes outside of a resize event (e.g. content swapped in via
  AJAX, a "load more" click, client-side routing).
- **`destroy()`** — removes every badge this call inserted and stops
  listening for resize (if `updateOnResize` was on). Does not touch your
  original content.

```ts
const instance = readMeter(".post", { appendTo: ".post-meta" });

// content changed programmatically — recompute without a resize:
instance.refresh();

// later, e.g. before a client-side route change:
instance.destroy();
```

---

## Formats & builds

Like every plugin in this package, `readMeter` ships in three forms:

- **ESM / CJS** (`import { readMeter } from "blogr-plugins"`), for
  bundled projects.
- **Standalone IIFE** — `dist/readMeter.js` — exposes
  `window.BlogrReadMeter.readMeter`, for a plain `<script>` tag with no
  build step.
- **jQuery bridge** — if `jQuery`/`$` is present on the page when the
  script loads, `$(selector).readMeter(options)` is registered
  automatically.

```html
<script src="https://cdn.jsdelivr.net/npm/blogr-plugins/dist/readMeter.min.js"></script>
<script>
	BlogrReadMeter.readMeter(".post", { appendTo: ".post-meta" });
	// or, with jQuery loaded first:
	$(".post").readMeter({ appendTo: ".post-meta" });
</script>
```

`readMeter` has no dependency on the `blogr` SDK — unlike `relatify` and
`createWidget`, it works purely off DOM content already on the page, so
there's nothing extra to load.