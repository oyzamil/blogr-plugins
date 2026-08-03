# `createWidget`

A self-contained Blogger listing widget — related posts, a recent-posts
sidebar, random picks, a comment stream, or a page list — built on top of
the [`blogr`](https://jsr.io/@oyzamil/blogr) SDK. It mounts into a
container, defers its own fetch until that container nears the viewport,
resizes thumbnails via the [`resizeImage`](./README.md#resizeimageurl-options--issupportedimageurl)
plugin, and can page results with an infinite-scroll sentinel and/or a
"load more" button.

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
		<article class="related-post">
			<img src="${entry.thumbnail}" alt="${entry.title}" />
			<h3>${entry.title}</h3>
			<p>${entry.content}</p>
		</article>
	`,
});

// later, e.g. before a client-side route change
widget.destroy();
```

Requires the `blogr` package — installed automatically as a dependency of
`blogr-plugins`, no extra `npm install` needed.

## Table of contents

- [How it works](#how-it-works)
- [Return value — `WidgetInstance`](#return-value--widgetinstance)
- [`WidgetEntry`](#widgetentry)
- [Options reference](#options-reference)
  - [Source](#source)
  - [Filtering](#filtering)
  - [Images](#images)
  - [Content](#content)
  - [Pagination](#pagination)
  - [Lazy loading](#lazy-loading)
  - [Caching](#caching)
  - [Transformers](#transformers)
  - [Lifecycle hooks](#lifecycle-hooks)
  - [Render functions](#render-functions)
- [Recipes](#recipes)
- [Known limitations](#known-limitations)

## How it works

1. **Mount.** `createWidget` resolves `containerSelector` immediately
   (throwing if nothing matches) but does **not** fetch yet. It watches the
   container with an `IntersectionObserver` (`rootMargin`) and only starts
   loading once it's about to scroll into view.
2. **Fetch.** Depending on `type`/`feed`/`query`/`deepSearch`, it either:
   - asks the SDK for one page/batch over the network (`"paged"` mode —
     used for `feed: "posts"` (default), `"comments"`, or `"pages"`, when
     `type` isn't `"random"` and either there's no `query` or `deepSearch`
     is `true`), tracking the SDK's own `Pager` for further pages, or
   - fetches a larger buffer once and keeps everything else in memory
     (`"buffered"` mode — used for `type: "random"`, or for `feed: "posts"`
     with `deepSearch: false` and a non-empty `query`), so pagination and
     query changes never touch the network again.
3. **Normalize.** Every raw `Post`/`Comment` becomes a typed
   [`WidgetEntry`](#widgetentry) — thumbnail resized/falls back, content
   stripped-to-text and truncated, dates formatted — then run through your
   `transformers`, in order.
4. **Filter.** `excludeCurrent`, `related` (against `currentPostId`'s
   labels), `sort`, and `random` (shuffle) are applied to the normalized
   batch.
5. **Render.** `beforeRender` → `template` → insert → `entryClass` →
   `afterRender`, for each entry. Pagination controls (`loadMore`
   button/`infiniteScroll` sentinel) are (re)attached after every render.

## Return value — `WidgetInstance`

```ts
interface WidgetInstance {
	/** Removes every observer/listener and clears the container. */
	destroy(): void;
	/** Re-fetches from scratch, bypassing the local cache. */
	refresh(): Promise<void>;
	/** Updates the search query and re-fetches (deepSearch: true) or re-filters the in-memory buffer (deepSearch: false). */
	setQuery(query: string): Promise<void>;
}
```

```ts
const widget = createWidget({ containerSelector: "#related", blogUrl });

searchInput.addEventListener("input", (e) => {
	widget.setQuery(e.target.value);
});

refreshButton.addEventListener("click", () => {
	widget.refresh();
});

// on route change / unmount
widget.destroy();
```

## `WidgetEntry`

The normalized shape passed to `template`, `entryClass`, and every
lifecycle hook — identical regardless of which feed it came from:

```ts
interface WidgetEntry {
	id: string;
	title: string;      // "" for comments, which have no title
	url: string;
	author: string;     // "" if unavailable
	published: string;  // formatted per `dateFormat`
	updated: string;    // formatted per `dateFormat`
	labels: string[];   // [] for comments, which carry none
	thumbnail: string;  // resized URL, fallbackImage, or "" if thumbnail: false
	content: string;    // plain-text summary, truncated to `summaryLength`
	raw: Post | Comment; // the original blogr SDK object — everything else
}
```

Reach for `entry.raw` for anything not exposed above — e.g. `raw.summary`,
`raw.comments` (comment count metadata on a `Post`), or `raw.geo`.

## Options reference

Only `containerSelector` and `blogUrl` are required; everything else has a
sensible default.

### Source

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `containerSelector` | `ElementInput` (selector string, `Element`, list, or jQuery collection) | — | **Required.** Where the widget mounts and renders. |
| `blogUrl` | `string` | — | **Required.** URL (or numeric Blogger blog id) passed straight to `new Blogr(...)`. |
| `type` | `"recent" \| "random"` | `"recent"` | `"recent"` lists newest-first; `"random"` samples random entries (client-side buffer, see [How it works](#how-it-works)). |
| `feed` | `"posts" \| "comments" \| "pages"` | `"posts"` | Which Blogger feed to list. `"comments"`/`"pages"` **ignore** `labels`, `query`, and `related` — Blogger's feed API has no label/search filter for those feeds — and their entries have `labels: []`/`thumbnail: ""`. |
| `labels` | `string[]` | `[]` | Filter by labels, AND semantics (an entry must carry every one). Empty = no filter (all entries). Only applies to `feed: "posts"`. |
| `orderBy` | `"published" \| "updated"` | `"published"` | Feed field to sort by (passed straight to the SDK). |
| `sort` | `"asc" \| "desc"` | `"desc"` | Direction to show entries in. Blogger's feed is always newest-first for a given `orderBy`; `"asc"` reverses the fetched batch client-side. |
| `query` | `string` | `""` | Search query. Combine with `deepSearch` to choose how it's applied. Only applies to `feed: "posts"`. |
| `deepSearch` | `boolean` | `false` | `true`: every query change re-fetches from the network (via the SDK's search). `false`: fetches a broader buffer once, then filters/searches it client-side on every `setQuery()` call with zero further requests. |
| `dateFormat` | `string` | `"MMM d, yyyy"` | Token pattern applied to `published`/`updated`. Supported tokens: `yyyy yy MMMM MMM MM M dd d EEEE EEE HH hh mm ss a` (year, month name/number, day, weekday name, 24h/12h hour, minute, second, AM/PM). |

### Filtering

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `related` | `boolean` | `false` | Only keep entries that share **at least one** label with the post identified by `currentPostId`. (Blogger's `label` filter is AND-only across *all* given labels, so this is done client-side to get OR/"shares a label" semantics — see [Known limitations](#known-limitations).) Requires `currentPostId`. |
| `random` | `boolean` | `false` | Shuffle the final rendered order. Independent of `type` — you can e.g. fetch the most **recent** 20 posts (`type: "recent"`) and still show them in a shuffled order (`random: true`). |
| `excludeCurrent` | `boolean` | `false` | Drop `currentPostId` from the results (e.g. so a "related posts" widget never lists the post it's shown on). |
| `currentPostId` | `string` | auto-detected | Id of the post the widget is shown alongside. **Not part of the original prop list** — added because `related`/`excludeCurrent` do nothing without it. Falls back to a `data-blogr-post-id` attribute found anywhere in the page if omitted; set it explicitly for anything else (Blogger doesn't expose the numeric post id in the DOM on its own). |

### Images

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `thumbnail` | `false \| "default" \| ResizeImageOptions` | `"default"` | `"default"` resizes each entry's own/extracted thumbnail with `resizeImage`'s defaults (640×360 webp). Pass a [`ResizeImageOptions`](./README.md#resizeimageurl-options--issupportedimageurl) object (`width`, `height`, `crop`, `format`, `flip`, `rotate`, `grayscale`) to customize it. `false` skips thumbnail extraction/rendering entirely — `entry.thumbnail` is `""`. |
| `fallbackImage` | `string` | a tiny built-in gray placeholder (data URI) | Used when an entry has no image of its own. Ignored when `thumbnail: false`. |

### Content

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `summaryLength` | `number` | `120` | Max characters kept in `entry.content` (plain text, HTML-stripped via the SDK's `htmlToText`), with a trailing `…` when truncated. `0` disables truncation. |

### Pagination

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `infiniteScroll` | `boolean` | `false` | Auto-loads the next batch via an `IntersectionObserver` sentinel once the user scrolls near the end of the rendered list. Can be combined with `loadMore`. |
| `loadMore` | `boolean` | `false` | Renders a "load more" button that fetches/reveals the next batch on click. |
| `loadMoreText` | `string` | `"Load more"` | Label for the load-more button. |
| `maxVisibleItems` | `number` | `6` | Entries fetched/shown per batch — both the initial batch size and every subsequent page/reveal. |

### Lazy loading

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `rootMargin` | `string` | `"0px"` | `rootMargin` for **both** `IntersectionObserver`s the widget uses: the one that defers the very first fetch until the container nears the viewport, and the one behind `infiniteScroll`. |

### Caching

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `cache` | `boolean` | `false` | Turns on **two** layers: (1) the SDK's own in-memory, per-session `blog.cache` (keyed by request URL, cleared on page reload), and (2) a `localStorage`-backed cache of the widget's own fetched/normalized entries (keyed by `cacheKey`), which **does** survive a page reload — so a second page view within `cacheTTL` skips the network entirely. |
| `cacheKey` | `string` | `containerSelector` (as a string) or `"widget"` | `localStorage` key for layer (2) above. Set this explicitly if you mount more than one widget with the same `containerSelector` value (e.g. a reusable component) so they don't collide. |
| `cacheTTL` | `number` | `3600` (1 hour) | How long a cached batch stays valid, in **seconds**. Applies to both cache layers. |

### Transformers

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `transformers` | `Array<(entry, index) => WidgetEntry \| Promise<WidgetEntry>>` | `[]` | Applied to every normalized entry, in array order — each transformer receives the previous one's output. Runs **after** normalization (thumbnail/content/dates already resolved) and **before** `beforeRender`/`template`. May be async; each is awaited before the next runs. |

```ts
createWidget({
	containerSelector: "#related",
	blogUrl,
	transformers: [
		// add a computed field
		(entry) => ({ ...entry, readingTime: Math.ceil(entry.content.split(" ").length / 200) }),
		// fetch something extra per entry (async is fine)
		async (entry) => {
			const extra = await fetch(`/api/views/${entry.id}`).then((r) => r.json());
			return { ...entry, views: extra.count };
		},
	],
	template: (entry) => `<div>${entry.title} — ${entry.readingTime} min read, ${entry.views} views</div>`,
});
```

> `WidgetEntry` as typed doesn't declare `readingTime`/`views` — cast or
> extend the type in your own code (`entry as WidgetEntry & { readingTime: number }`)
> if you want type-checking on transformer-added fields.

### Lifecycle hooks

| Hook | Signature | When |
| --- | --- | --- |
| `beforeFetch` | `() => void \| Promise<void>` | Right before every network fetch (initial load, `refresh()`, and any `deepSearch: true` query change). Awaited if it returns a promise. |
| `afterFetch` | `(entries: WidgetEntry[]) => void \| Promise<void>` | Right after a successful fetch, with the normalized+filtered batch, before rendering. Awaited if it returns a promise. |
| `beforeRender` | `(entry: WidgetEntry) => void` | Once per entry, right before its `template` is rendered. |
| `afterRender` | `(element: HTMLElement, entry: WidgetEntry) => void` | Once per entry, after its element has been inserted into the DOM — good place to attach listeners. |
| `onError` | `(err: unknown) => void` | Whenever a fetch (or a step inside `load()`) throws. The `error` template is also shown. |
| `onEmpty` | `(): void` | Whenever there are zero entries to show — first load or after filtering to nothing. The `empty` template is also shown. |

### Render functions

| Option | Signature | Default | Description |
| --- | --- | --- | --- |
| `loading` | `(status: string) => string` | a small spinner + status text | Renders the loading state. `status` is always `"Loading posts..."` today. |
| `error` | `(errorMsg: string) => string` | `<div>{errorMsg}</div>` | Renders the error state. `errorMsg` is the caught error's `message` (or its `String()` form). |
| `empty` | `() => string` | `<p>No posts found.</p>` | Renders the empty state. |
| `template` | `(entry: WidgetEntry, i: number) => string` | a minimal title+content block | Renders one entry. `i` is its index within the *currently rendered* batch (resets each full re-render, keeps counting up across `loadMore`/`infiniteScroll` appends). Must return exactly one root element — extra top-level siblings are dropped (only the first is used as the entry's wrapper). |
| `entryClass` | `(entry: WidgetEntry, index: number) => string` | `""` | Extra class name(s) (space-separated) added to an entry's wrapper element after it's created. |

## Recipes

**Related posts widget** (the example from the top of this doc) — shares a
label with the current post, never shows the current post itself:

```ts
createWidget({
	containerSelector: "#relatedPosts",
	blogUrl: "https://example.blogspot.com",
	related: true,
	excludeCurrent: true,
	currentPostId: "1234567890123456789",
});
```

**Random posts widget**, refreshed on demand:

```ts
const widget = createWidget({
	containerSelector: "#randomPosts",
	blogUrl: "https://example.blogspot.com",
	type: "random",
	maxVisibleItems: 3,
});

document.getElementById("shuffle")?.addEventListener("click", () => widget.refresh());
```

**Client-side search box** over an already-fetched buffer (no network calls
after the first load):

```ts
const widget = createWidget({
	containerSelector: "#searchResults",
	blogUrl: "https://example.blogspot.com",
	deepSearch: false,
	maxVisibleItems: 10,
});

searchInput.addEventListener("input", (e) => widget.setQuery(e.currentTarget.value));
```

**Latest comments stream:**

```ts
createWidget({
	containerSelector: "#latestComments",
	blogUrl: "https://example.blogspot.com",
	feed: "comments",
	template: (entry) => `<div><strong>${entry.author}</strong>: ${entry.content}</div>`,
});
```

## Known limitations

- **`related` is client-side, not a Blogger API filter.** The SDK's
  `label` param is AND-only (an entry must carry *every* given label), so
  "shares at least one label" is implemented by fetching a batch and
  filtering in the browser rather than by the network request itself —
  large blogs with very few overlapping labels may need a larger internal
  buffer than the current fixed multiplier provides.
- **`comments`/`pages` feeds ignore `labels`/`query`/`related`.** Blogger's
  comments and pages feeds have no label or full-text-search filter.
- **`currentPostId` auto-detection is best-effort.** Blogger doesn't expose
  the numeric post id in the DOM on its own; the fallback only catches a
  `data-blogr-post-id` attribute you've added yourself. Pass
  `currentPostId` explicitly for anything else.
- **`type: "random"` pagination may repeat entries.** Loading more random
  items re-samples from the blog rather than tracking what's already been
  shown, so duplicates are possible across batches.
- **A shortcode-style multi-node template isn't supported** — `template`
  must return exactly one root element; wrap multi-element markup in a
  single container element.