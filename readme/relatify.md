# relatify

Fetches related posts for the current article by label and inserts a
randomly-placed link (or several, scaled to article length) after
paragraphs — or any other elements you choose — within it.

```ts
import { relatify } from "blogr-plugins";

const instance = relatify("article", {
	labels, // see "Getting the current post's labels" below
	insertAfter: ["p", ".paragraph", ".video"],
	excludeLabels: ["announcements"],
	relevance: "strict",
	maxLinks: 3,
	template: (post) =>
		`Related: <a href="${post.url}">${post.title}</a>`,
});

instance.destroy(); // removes every inserted link (or cancels an in-flight fetch)
```

Also works as a jQuery plugin (`$("article").relatify({ labels })`) — it
fits the classic `$(sel).plugin(options)` shape.

---

## Getting the current post's labels

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

---

## `relatify(target, options?)`

```ts
function relatify(
	target: ElementInput,
	options?: RelatifyOptions,
): RelatifyInstance;
```

### `options`

| Option | Type | Default | Description |
|---|---|---|---|
| `labels` | `string[]` | `[]` | Labels to find related posts for. Empty fetches recent posts across the whole blog instead of filtering by label |
| `insertAfter` | `string \| string[]` | `"p"` | Element(s) after which a link may be inserted, matched within the container. An array is joined with `,` |
| [`maxLinks`](#maxlinks) | `number` | scaled to word count | `Math.floor(wordCount / 500) + 1` (min `1`) — 2 for ~500 words, 3 for ~1000, and so on. Always capped by however many eligible `insertAfter` elements and related posts actually exist |
| [`excludeLabels`](#excludelabels) | `string[]` | `[]` | Labels left out of the *search* — see note below |
| [`relevance`](#relevance) | `"strict" \| "default"` | `"strict"` | `"strict"` scores candidates by word overlap against the nearest heading (or `document.title`) and picks the best matches; `"default"` shuffles and picks randomly |
| `template` | `(post, index) => string` | `` `You may also like: <a href="${post.url}">${post.title}</a>` `` | Renders one inserted link — same shape as `createWidget`'s `template` |
| `blogUrl` | `string` | `window.location.origin` | Only needed if this runs somewhere other than the blog itself |
| `currentUrl` | `string` | `<link rel="canonical">`, then `location.href` | Override if neither reliably identifies the current post in your setup |
| `sampleSize` | `number` | `20` | How many candidate posts to fetch (per label, or overall when unfiltered) before scoring/picking |
| `linkClass` | `string` | `"relatify-link"` | Class on each inserted link's wrapper `<div>` |
| `beforeFetch` | `() => void` | — | Called right before fetching |
| `afterFetch` | `(posts) => void` | — | Called with the final chosen related posts, before any are inserted |
| `onInsert` | `(detail) => void` | — | Called once per link actually inserted — `{ post, element, index }` |
| `onEmpty` | `() => void` | — | Called when there are no related posts, or no eligible `insertAfter` elements |
| `onError` | `(err) => void` | `console.error` | Called if the fetch fails |
| [`lazy`](#lazy--rootmargin) | `boolean` | `true` | Enable lazy loading — plugin initializes only when first `insertAfter` element comes near the viewport, preventing API calls on page load |
| [`rootMargin`](#lazy--rootmargin) | `string` | `"0px"` | Margin (in pixels or CSS string) for `IntersectionObserver` to trigger lazy load before element enters viewport. Examples: `"100px"`, `"10%"`, `"0px 0px 50px 0px"` |

---

## Option details

### `maxLinks`

Scales with article length by default: `Math.floor(wordCount / 500) + 1`,
with a minimum of `1` — roughly 2 links for a ~500-word post, 3 for
~1000 words, and so on. Whatever value you pass (or the computed default)
is still capped by however many eligible `insertAfter` elements and
related posts actually exist.

### `excludeLabels`

Only controls which labels are *used to search* — even if `labels`
includes one of these, it won't be queried. A related post found via a
different, non-excluded label is still kept even if it also happens to
carry an excluded label; `excludeLabels` doesn't filter results by the
candidates' own labels.

### `relevance`

`"strict"` (the default) scores candidates by word overlap against the
nearest heading (or `document.title` if none is found) and picks the best
matches. `"default"` skips scoring and shuffles/picks randomly instead.

### `lazy` / `rootMargin`

On by default: `relatify` only initializes (and only makes its first
fetch) once the first `insertAfter` element comes near the viewport, via
an `IntersectionObserver`. `rootMargin` controls how far before the
element enters the viewport that trigger fires.

---

## Return value — `RelatifyInstance`

```ts
interface RelatifyInstance {
	destroy(): void;
}
```

- **`destroy()`** — removes every link this call inserted, or cancels an
  in-flight fetch if it hasn't resolved yet.

```ts
const relatedLinks = relatify("article", { labels });
// later, e.g. before a client-side route change:
relatedLinks.destroy();
```

---

## jQuery bridge

`relatify` fits the classic `$(sel).plugin(options)` jQuery shape, so it
**does** get the jQuery bridge: `$("article").relatify({ labels })`.