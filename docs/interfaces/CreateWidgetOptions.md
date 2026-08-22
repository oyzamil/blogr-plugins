[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / CreateWidgetOptions

# Interface: CreateWidgetOptions

Defined in: [src/plugins/createWidget.ts:107](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L107)

Configuration for [createWidget](../functions/createWidget.md).

## Properties

### afterFetch?

> `optional` **afterFetch?**: (`entries`) => `void` \| `Promise`\<`void`\>

Defined in: [src/plugins/createWidget.ts:227](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L227)

Called with the normalized batch right after a successful fetch, before rendering. May be async.

#### Parameters

##### entries

[`WidgetEntry`](../type-aliases/WidgetEntry.md)[]

#### Returns

`void` \| `Promise`\<`void`\>

***

### afterRender?

> `optional` **afterRender?**: (`element`, `entry`) => `void`

Defined in: [src/plugins/createWidget.ts:231](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L231)

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

Defined in: [src/plugins/createWidget.ts:225](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L225)

Called right before each network fetch. May be async.

#### Returns

`void` \| `Promise`\<`void`\>

***

### beforeRender?

> `optional` **beforeRender?**: (`entry`) => `void`

Defined in: [src/plugins/createWidget.ts:229](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L229)

Called for each entry right before it's rendered.

#### Parameters

##### entry

[`WidgetEntry`](../type-aliases/WidgetEntry.md)

#### Returns

`void`

***

### blogUrl

> **blogUrl**: `string`

Defined in: [src/plugins/createWidget.ts:132](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L132)

URL (or numeric id) of the Blogger blog to read from. **Required.**

***

### cache?

> `optional` **cache?**: `boolean`

Defined in: [src/plugins/createWidget.ts:214](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L214)

Persist fetched entries in `localStorage` (keyed by `cacheKey`) so a
fresh page load can skip the network entirely within `cacheTTL`.
Separate from and in addition to `blog.cache` (the SDK's own
in-memory, per-session response cache), which this also enables.
Default `false`.

***

### cacheKey?

> `optional` **cacheKey?**: `string`

Defined in: [src/plugins/createWidget.ts:216](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L216)

Cache key. Defaults to `containerSelector` (as a string) or `"widget"`.

***

### cacheTTL?

> `optional` **cacheTTL?**: `number`

Defined in: [src/plugins/createWidget.ts:218](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L218)

How long a cached batch stays valid, in seconds. Default `3600` (1 hour).

***

### containerSelector

> **containerSelector**: [`ElementInput`](../type-aliases/ElementInput.md)

Defined in: [src/plugins/createWidget.ts:130](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L130)

Where the widget mounts and renders. **Required.**

***

### currentPostId?

> `optional` **currentPostId?**: `string`

Defined in: [src/plugins/createWidget.ts:171](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L171)

Id of the post the widget is shown alongside — required for `related`
and `excludeCurrent` to do anything. Not part of the original spec's
prop list, but both of those options are meaningless without it, so
it's added here; falls back to `<link rel="canonical">`'s id-bearing
query param when omitted, or does nothing if that can't be found.

***

### dateFormat?

> `optional` **dateFormat?**: `string`

Defined in: [src/plugins/createWidget.ts:152](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L152)

Token-based date format applied to `published`/`updated`. Supports
`yyyy yy MMMM MMM MM M dd d EEEE EEE HH hh mm ss a`. Default
`"MMM d, yyyy"`.

***

### deepSearch?

> `optional` **deepSearch?**: `boolean`

Defined in: [src/plugins/createWidget.ts:146](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L146)

`true`: every `setQuery()`/query change re-fetches from the network.
`false`: fetches a broader buffer once, then filters/searches inside
it client-side without any further network requests. Default `false`.

***

### empty?

> `optional` **empty?**: () => `string`

Defined in: [src/plugins/createWidget.ts:242](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L242)

Renders the empty state.

#### Returns

`string`

***

### entryClass?

> `optional` **entryClass?**: (`entry`, `index`) => `string`

Defined in: [src/plugins/createWidget.ts:246](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L246)

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

Defined in: [src/plugins/createWidget.ts:240](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L240)

Renders the error state.

#### Parameters

##### errorMsg

`string`

#### Returns

`string`

***

### excludeCurrent?

> `optional` **excludeCurrent?**: `boolean`

Defined in: [src/plugins/createWidget.ts:163](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L163)

Drop `currentPostId` from the results. Default `false`.

***

### fallbackImage?

> `optional` **fallbackImage?**: `string`

Defined in: [src/plugins/createWidget.ts:182](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L182)

Shown when an entry has no image of its own. Defaults to a small built-in placeholder.

***

### infiniteScroll?

> `optional` **infiniteScroll?**: `boolean`

Defined in: [src/plugins/createWidget.ts:190](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L190)

Auto-load more entries via `IntersectionObserver` as the user scrolls near the end. Default `false`.

***

### jsonp?

> `optional` **jsonp?**: `boolean`

Defined in: [src/plugins/createWidget.ts:109](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L109)

Enable JSONP transport (browser-only).

#### Default

```ts
true
```

***

### labels?

> `optional` **labels?**: `string`[]

Defined in: [src/plugins/createWidget.ts:134](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L134)

Labels to filter by (AND semantics — an entry must carry every one). Empty/omitted = no label filter. Only applies to `type: "posts"`.

***

### loading?

> `optional` **loading?**: (`status`) => `string`

Defined in: [src/plugins/createWidget.ts:238](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L238)

Renders the loading state. `status` is a short human-readable phase, e.g. `"Loading posts..."`.

#### Parameters

##### status

`string`

#### Returns

`string`

***

### loadMore?

> `optional` **loadMore?**: `boolean`

Defined in: [src/plugins/createWidget.ts:192](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L192)

Render a "load more" button. Can be combined with `infiniteScroll`. Default `false`.

***

### loadMoreText?

> `optional` **loadMoreText?**: `string`

Defined in: [src/plugins/createWidget.ts:194](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L194)

Label for the load-more button. Default `"Load more"`.

***

### maxVisibleItems?

> `optional` **maxVisibleItems?**: `number`

Defined in: [src/plugins/createWidget.ts:196](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L196)

Entries fetched/shown per batch. Default `6`.

***

### onEmpty?

> `optional` **onEmpty?**: () => `void`

Defined in: [src/plugins/createWidget.ts:235](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L235)

Called whenever there are zero entries to show (initial load or after filtering).

#### Returns

`void`

***

### onError?

> `optional` **onError?**: (`err`) => `void`

Defined in: [src/plugins/createWidget.ts:233](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L233)

Called when a fetch or render step throws.

#### Parameters

##### err

`unknown`

#### Returns

`void`

***

### orderBy?

> `optional` **orderBy?**: [`WidgetOrderBy`](../type-aliases/WidgetOrderBy.md)

Defined in: [src/plugins/createWidget.ts:136](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L136)

Feed field to sort by. Default `"published"`.

***

### query?

> `optional` **query?**: `string`

Defined in: [src/plugins/createWidget.ts:140](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L140)

Search query. Combine with `deepSearch` to control how it's applied.

***

### random?

> `optional` **random?**: `boolean`

Defined in: [src/plugins/createWidget.ts:161](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L161)

Shuffle the final rendered order (independent of `source`). Default `false`.

***

### related?

> `optional` **related?**: `boolean`

Defined in: [src/plugins/createWidget.ts:159](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L159)

Only include entries that share at least one label with the post
identified by `currentPostId`. Requires `currentPostId`. Default `false`.

***

### rootMargin?

> `optional` **rootMargin?**: `string`

Defined in: [src/plugins/createWidget.ts:204](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L204)

`rootMargin` for the `IntersectionObserver`s used both to defer the
widget's first fetch until its container nears the viewport, and to
trigger `infiniteScroll`. Default `"0px"`.

***

### sort?

> `optional` **sort?**: [`WidgetSort`](../type-aliases/WidgetSort.md)

Defined in: [src/plugins/createWidget.ts:138](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L138)

Direction to show entries in. Default `"desc"`.

***

### source?

> `optional` **source?**: [`WidgetSourceType`](../type-aliases/WidgetSourceType.md)

Defined in: [src/plugins/createWidget.ts:128](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L128)

How the initial batch is sourced: `"recent"` lists newest-first,
`"random"` samples random entries. Only applies to `type: "posts"`.
Default `"recent"`.

***

### summaryLength?

> `optional` **summaryLength?**: `number`

Defined in: [src/plugins/createWidget.ts:186](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L186)

Max characters of plain-text summary kept in `entry.summary`. `0` disables truncation. Default `120`.

***

### template?

> `optional` **template?**: (`entry`, `i`) => `string`

Defined in: [src/plugins/createWidget.ts:244](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L244)

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

Defined in: [src/plugins/createWidget.ts:180](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L180)

`"default"` resizes each entry's own/extracted thumbnail with
[resizeImage](../functions/resizeImage.md)'s defaults. Pass a [ResizeImageOptions](ResizeImageOptions.md)
object to customize width/height/crop/etc. `false` disables
thumbnails entirely (skips extraction and rendering). Default `"default"`.

***

### transformers?

> `optional` **transformers?**: [`WidgetTransformer`](../type-aliases/WidgetTransformer.md)[]

Defined in: [src/plugins/createWidget.ts:221](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L221)

Applied to every entry, in order, right after normalization.

***

### type?

> `optional` **type?**: [`WidgetType`](../type-aliases/WidgetType.md)

Defined in: [src/plugins/createWidget.ts:122](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L122)

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
