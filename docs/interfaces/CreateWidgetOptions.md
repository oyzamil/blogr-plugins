[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / CreateWidgetOptions

# Interface: CreateWidgetOptions

Defined in: src/plugins/createWidget.ts:101

Configuration for [createWidget](../functions/createWidget.md).

## Properties

### afterFetch?

> `optional` **afterFetch?**: (`entries`) => `void` \| `Promise`\<`void`\>

Defined in: src/plugins/createWidget.ts:221

Called with the normalized batch right after a successful fetch, before rendering. May be async.

#### Parameters

##### entries

[`WidgetEntry`](../type-aliases/WidgetEntry.md)[]

#### Returns

`void` \| `Promise`\<`void`\>

***

### afterRender?

> `optional` **afterRender?**: (`element`, `entry`) => `void`

Defined in: src/plugins/createWidget.ts:225

Called after an entry's element has been inserted into the DOM.

#### Parameters

##### element

`HTMLElement`

##### entry

[`WidgetEntry`](../type-aliases/WidgetEntry.md)

#### Returns

`void`

***

### beforeFetch?

> `optional` **beforeFetch?**: () => `void` \| `Promise`\<`void`\>

Defined in: src/plugins/createWidget.ts:219

Called right before each network fetch. May be async.

#### Returns

`void` \| `Promise`\<`void`\>

***

### beforeRender?

> `optional` **beforeRender?**: (`entry`) => `void`

Defined in: src/plugins/createWidget.ts:223

Called for each entry right before it's rendered.

#### Parameters

##### entry

[`WidgetEntry`](../type-aliases/WidgetEntry.md)

#### Returns

`void`

***

### blogUrl

> **blogUrl**: `string`

Defined in: src/plugins/createWidget.ts:126

URL (or numeric id) of the Blogger blog to read from. **Required.**

***

### cache?

> `optional` **cache?**: `boolean`

Defined in: src/plugins/createWidget.ts:208

Persist fetched entries in `localStorage` (keyed by `cacheKey`) so a
fresh page load can skip the network entirely within `cacheTTL`.
Separate from and in addition to `blog.cache` (the SDK's own
in-memory, per-session response cache), which this also enables.
Default `false`.

***

### cacheKey?

> `optional` **cacheKey?**: `string`

Defined in: src/plugins/createWidget.ts:210

Cache key. Defaults to `containerSelector` (as a string) or `"widget"`.

***

### cacheTTL?

> `optional` **cacheTTL?**: `number`

Defined in: src/plugins/createWidget.ts:212

How long a cached batch stays valid, in seconds. Default `3600` (1 hour).

***

### containerSelector

> **containerSelector**: [`ElementInput`](../type-aliases/ElementInput.md)

Defined in: src/plugins/createWidget.ts:124

Where the widget mounts and renders. **Required.**

***

### currentPostId?

> `optional` **currentPostId?**: `string`

Defined in: src/plugins/createWidget.ts:165

Id of the post the widget is shown alongside — required for `related`
and `excludeCurrent` to do anything. Not part of the original spec's
prop list, but both of those options are meaningless without it, so
it's added here; falls back to `<link rel="canonical">`'s id-bearing
query param when omitted, or does nothing if that can't be found.

***

### dateFormat?

> `optional` **dateFormat?**: `string`

Defined in: src/plugins/createWidget.ts:146

Token-based date format applied to `published`/`updated`. Supports
`yyyy yy MMMM MMM MM M dd d EEEE EEE HH hh mm ss a`. Default
`"MMM d, yyyy"`.

***

### deepSearch?

> `optional` **deepSearch?**: `boolean`

Defined in: src/plugins/createWidget.ts:140

`true`: every `setQuery()`/query change re-fetches from the network.
`false`: fetches a broader buffer once, then filters/searches inside
it client-side without any further network requests. Default `false`.

***

### empty?

> `optional` **empty?**: () => `string`

Defined in: src/plugins/createWidget.ts:236

Renders the empty state.

#### Returns

`string`

***

### entryClass?

> `optional` **entryClass?**: (`entry`, `index`) => `string`

Defined in: src/plugins/createWidget.ts:240

Extra class name(s) for an entry's wrapper element.

#### Parameters

##### entry

[`WidgetEntry`](../type-aliases/WidgetEntry.md)

##### index

`number`

#### Returns

`string`

***

### error?

> `optional` **error?**: (`errorMsg`) => `string`

Defined in: src/plugins/createWidget.ts:234

Renders the error state.

#### Parameters

##### errorMsg

`string`

#### Returns

`string`

***

### excludeCurrent?

> `optional` **excludeCurrent?**: `boolean`

Defined in: src/plugins/createWidget.ts:157

Drop `currentPostId` from the results. Default `false`.

***

### fallbackImage?

> `optional` **fallbackImage?**: `string`

Defined in: src/plugins/createWidget.ts:176

Shown when an entry has no image of its own. Defaults to a small built-in placeholder.

***

### infiniteScroll?

> `optional` **infiniteScroll?**: `boolean`

Defined in: src/plugins/createWidget.ts:184

Auto-load more entries via `IntersectionObserver` as the user scrolls near the end. Default `false`.

***

### jsonp?

> `optional` **jsonp?**: `boolean`

Defined in: src/plugins/createWidget.ts:103

Enable JSONP transport (browser-only).

#### Default

```ts
false
```

***

### loading?

> `optional` **loading?**: (`status`) => `string`

Defined in: src/plugins/createWidget.ts:232

Renders the loading state. `status` is a short human-readable phase, e.g. `"Loading posts..."`.

#### Parameters

##### status

`string`

#### Returns

`string`

***

### loadMore?

> `optional` **loadMore?**: `boolean`

Defined in: src/plugins/createWidget.ts:186

Render a "load more" button. Can be combined with `infiniteScroll`. Default `false`.

***

### loadMoreText?

> `optional` **loadMoreText?**: `string`

Defined in: src/plugins/createWidget.ts:188

Label for the load-more button. Default `"Load more"`.

***

### maxVisibleItems?

> `optional` **maxVisibleItems?**: `number`

Defined in: src/plugins/createWidget.ts:190

Entries fetched/shown per batch. Default `6`.

***

### onEmpty?

> `optional` **onEmpty?**: () => `void`

Defined in: src/plugins/createWidget.ts:229

Called whenever there are zero entries to show (initial load or after filtering).

#### Returns

`void`

***

### onError?

> `optional` **onError?**: (`err`) => `void`

Defined in: src/plugins/createWidget.ts:227

Called when a fetch or render step throws.

#### Parameters

##### err

`unknown`

#### Returns

`void`

***

### orderBy?

> `optional` **orderBy?**: [`WidgetOrderBy`](../type-aliases/WidgetOrderBy.md)

Defined in: src/plugins/createWidget.ts:130

Labels to filter by (AND semantics — an entry must carry every one). Empty/omitted = no label filter. Only applies to `type: "posts"`.
labels?: string[];
/** Feed field to sort by. Default `"published"`.

***

### query?

> `optional` **query?**: `string`

Defined in: src/plugins/createWidget.ts:134

Search query. Combine with `deepSearch` to control how it's applied.

***

### random?

> `optional` **random?**: `boolean`

Defined in: src/plugins/createWidget.ts:155

Shuffle the final rendered order (independent of `source`). Default `false`.

***

### related?

> `optional` **related?**: `boolean`

Defined in: src/plugins/createWidget.ts:153

Only include entries that share at least one label with the post
identified by `currentPostId`. Requires `currentPostId`. Default `false`.

***

### rootMargin?

> `optional` **rootMargin?**: `string`

Defined in: src/plugins/createWidget.ts:198

`rootMargin` for the `IntersectionObserver`s used both to defer the
widget's first fetch until its container nears the viewport, and to
trigger `infiniteScroll`. Default `"0px"`.

***

### sort?

> `optional` **sort?**: [`WidgetSort`](../type-aliases/WidgetSort.md)

Defined in: src/plugins/createWidget.ts:132

Direction to show entries in. Default `"desc"`.

***

### source?

> `optional` **source?**: [`WidgetSourceType`](../type-aliases/WidgetSourceType.md)

Defined in: src/plugins/createWidget.ts:122

How the initial batch is sourced: `"recent"` lists newest-first,
`"random"` samples random entries. Only applies to `type: "posts"`.
Default `"recent"`.

***

### summaryLength?

> `optional` **summaryLength?**: `number`

Defined in: src/plugins/createWidget.ts:180

Max characters of plain-text summary kept in `entry.content`. `0` disables truncation. Default `120`.

***

### template?

> `optional` **template?**: (`entry`, `i`) => `string`

Defined in: src/plugins/createWidget.ts:238

Renders one entry. `i` is its index in the currently rendered batch.

#### Parameters

##### entry

[`WidgetEntry`](../type-aliases/WidgetEntry.md)

##### i

`number`

#### Returns

`string`

***

### thumbnail?

> `optional` **thumbnail?**: `false` \| `"default"` \| [`ResizeImageOptions`](ResizeImageOptions.md)

Defined in: src/plugins/createWidget.ts:174

`"default"` resizes each entry's own/extracted thumbnail with
[resizeImage](../functions/resizeImage.md)'s defaults. Pass a [ResizeImageOptions](ResizeImageOptions.md)
object to customize width/height/crop/etc. `false` disables
thumbnails entirely (skips extraction and rendering). Default `"default"`.

***

### transformers?

> `optional` **transformers?**: [`WidgetTransformer`](../type-aliases/WidgetTransformer.md)[]

Defined in: src/plugins/createWidget.ts:215

Applied to every entry, in order, right after normalization.

***

### type?

> `optional` **type?**: [`WidgetType`](../type-aliases/WidgetType.md)

Defined in: src/plugins/createWidget.ts:116

What the widget lists.
- "posts": Blog posts (default)
- "pages": Static pages
- "comments": Comments
- "authors": Distinct post authors
- "labels": Labels/categories
`"pages"`/`"comments"`/`"authors"`/`"labels"` ignore `labels`/`query`/
`related` (Blogger's feed API doesn't support filtering those feeds
that way, and authors/labels aren't filterable at all).

#### Default

```ts
"posts"
```
