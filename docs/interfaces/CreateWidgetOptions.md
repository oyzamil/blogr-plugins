[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / CreateWidgetOptions

# Interface: CreateWidgetOptions

Defined in: plugins/createWidget.ts:65

Configuration for [createWidget](../functions/createWidget.md).

## Properties

### afterFetch?

> `optional` **afterFetch?**: (`entries`) => `void` \| `Promise`\<`void`\>

Defined in: plugins/createWidget.ts:178

Called with the normalized batch right after a successful fetch, before rendering. May be async.

#### Parameters

##### entries

[`WidgetEntry`](WidgetEntry.md)[]

#### Returns

`void` \| `Promise`\<`void`\>

***

### afterRender?

> `optional` **afterRender?**: (`element`, `entry`) => `void`

Defined in: plugins/createWidget.ts:182

Called after an entry's element has been inserted into the DOM.

#### Parameters

##### element

`HTMLElement`

##### entry

[`WidgetEntry`](WidgetEntry.md)

#### Returns

`void`

***

### beforeFetch?

> `optional` **beforeFetch?**: () => `void` \| `Promise`\<`void`\>

Defined in: plugins/createWidget.ts:176

Called right before each network fetch. May be async.

#### Returns

`void` \| `Promise`\<`void`\>

***

### beforeRender?

> `optional` **beforeRender?**: (`entry`) => `void`

Defined in: plugins/createWidget.ts:180

Called for each entry right before it's rendered.

#### Parameters

##### entry

[`WidgetEntry`](WidgetEntry.md)

#### Returns

`void`

***

### blogUrl

> **blogUrl**: `string`

Defined in: plugins/createWidget.ts:76

URL (or numeric id) of the Blogger blog to read from. **Required.**

***

### cache?

> `optional` **cache?**: `boolean`

Defined in: plugins/createWidget.ts:165

Persist fetched entries in `localStorage` (keyed by `cacheKey`) so a
fresh page load can skip the network entirely within `cacheTTL`.
Separate from and in addition to `blog.cache` (the SDK's own
in-memory, per-session response cache), which this also enables.
Default `false`.

***

### cacheKey?

> `optional` **cacheKey?**: `string`

Defined in: plugins/createWidget.ts:167

Cache key. Defaults to `containerSelector` (as a string) or `"widget"`.

***

### cacheTTL?

> `optional` **cacheTTL?**: `number`

Defined in: plugins/createWidget.ts:169

How long a cached batch stays valid, in seconds. Default `3600` (1 hour).

***

### containerSelector

> **containerSelector**: [`ElementInput`](../type-aliases/ElementInput.md)

Defined in: plugins/createWidget.ts:74

Where the widget mounts and renders. **Required.**

***

### currentPostId?

> `optional` **currentPostId?**: `string`

Defined in: plugins/createWidget.ts:122

Id of the post the widget is shown alongside — required for `related`
and `excludeCurrent` to do anything. Not part of the original spec's
prop list, but both of those options are meaningless without it, so
it's added here; falls back to `<link rel="canonical">`'s id-bearing
query param when omitted, or does nothing if that can't be found.

***

### dateFormat?

> `optional` **dateFormat?**: `string`

Defined in: plugins/createWidget.ts:103

Token-based date format applied to `published`/`updated`. Supports
`yyyy yy MMMM MMM MM M dd d EEEE EEE HH hh mm ss a`. Default
`"MMM d, yyyy"`.

***

### deepSearch?

> `optional` **deepSearch?**: `boolean`

Defined in: plugins/createWidget.ts:97

`true`: every `setQuery()`/query change re-fetches from the network.
`false`: fetches a broader buffer once, then filters/searches inside
it client-side without any further network requests. Default `false`.

***

### empty?

> `optional` **empty?**: () => `string`

Defined in: plugins/createWidget.ts:193

Renders the empty state.

#### Returns

`string`

***

### entryClass?

> `optional` **entryClass?**: (`entry`, `index`) => `string`

Defined in: plugins/createWidget.ts:197

Extra class name(s) for an entry's wrapper element.

#### Parameters

##### entry

[`WidgetEntry`](WidgetEntry.md)

##### index

`number`

#### Returns

`string`

***

### error?

> `optional` **error?**: (`errorMsg`) => `string`

Defined in: plugins/createWidget.ts:191

Renders the error state.

#### Parameters

##### errorMsg

`string`

#### Returns

`string`

***

### excludeCurrent?

> `optional` **excludeCurrent?**: `boolean`

Defined in: plugins/createWidget.ts:114

Drop `currentPostId` from the results. Default `false`.

***

### fallbackImage?

> `optional` **fallbackImage?**: `string`

Defined in: plugins/createWidget.ts:133

Shown when an entry has no image of its own. Defaults to a small built-in placeholder.

***

### feed?

> `optional` **feed?**: [`WidgetFeed`](../type-aliases/WidgetFeed.md)

Defined in: plugins/createWidget.ts:83

Which feed to list. `"comments"`/`"pages"` ignore `labels`/`query`/
`related` (Blogger's feed API doesn't support filtering those feeds
that way) and their entries have no `labels`/`thumbnail`. Default
`"posts"`.

***

### infiniteScroll?

> `optional` **infiniteScroll?**: `boolean`

Defined in: plugins/createWidget.ts:141

Auto-load more entries via `IntersectionObserver` as the user scrolls near the end. Default `false`.

***

### jsonp?

> `optional` **jsonp?**: `boolean`

Defined in: plugins/createWidget.ts:67

Enable JSONP transport (browser-only).

#### Default

```ts
false
```

***

### labels?

> `optional` **labels?**: `string`[]

Defined in: plugins/createWidget.ts:85

Labels to filter by (AND semantics — an entry must carry every one). Empty/omitted = no label filter.

***

### loading?

> `optional` **loading?**: (`status`) => `string`

Defined in: plugins/createWidget.ts:189

Renders the loading state. `status` is a short human-readable phase, e.g. `"Loading posts..."`.

#### Parameters

##### status

`string`

#### Returns

`string`

***

### loadMore?

> `optional` **loadMore?**: `boolean`

Defined in: plugins/createWidget.ts:143

Render a "load more" button. Can be combined with `infiniteScroll`. Default `false`.

***

### loadMoreText?

> `optional` **loadMoreText?**: `string`

Defined in: plugins/createWidget.ts:145

Label for the load-more button. Default `"Load more"`.

***

### maxVisibleItems?

> `optional` **maxVisibleItems?**: `number`

Defined in: plugins/createWidget.ts:147

Entries fetched/shown per batch. Default `6`.

***

### onEmpty?

> `optional` **onEmpty?**: () => `void`

Defined in: plugins/createWidget.ts:186

Called whenever there are zero entries to show (initial load or after filtering).

#### Returns

`void`

***

### onError?

> `optional` **onError?**: (`err`) => `void`

Defined in: plugins/createWidget.ts:184

Called when a fetch or render step throws.

#### Parameters

##### err

`unknown`

#### Returns

`void`

***

### orderBy?

> `optional` **orderBy?**: [`WidgetOrderBy`](../type-aliases/WidgetOrderBy.md)

Defined in: plugins/createWidget.ts:87

Feed field to sort by. Default `"published"`.

***

### query?

> `optional` **query?**: `string`

Defined in: plugins/createWidget.ts:91

Search query. Combine with `deepSearch` to control how it's applied.

***

### random?

> `optional` **random?**: `boolean`

Defined in: plugins/createWidget.ts:112

Shuffle the final rendered order (independent of `type`). Default `false`.

***

### related?

> `optional` **related?**: `boolean`

Defined in: plugins/createWidget.ts:110

Only include entries that share at least one label with the post
identified by `currentPostId`. Requires `currentPostId`. Default `false`.

***

### rootMargin?

> `optional` **rootMargin?**: `string`

Defined in: plugins/createWidget.ts:155

`rootMargin` for the `IntersectionObserver`s used both to defer the
widget's first fetch until its container nears the viewport, and to
trigger `infiniteScroll`. Default `"0px"`.

***

### sort?

> `optional` **sort?**: [`WidgetSort`](../type-aliases/WidgetSort.md)

Defined in: plugins/createWidget.ts:89

Direction to show entries in. Default `"desc"`.

***

### summaryLength?

> `optional` **summaryLength?**: `number`

Defined in: plugins/createWidget.ts:137

Max characters of plain-text summary kept in `entry.content`. `0` disables truncation. Default `120`.

***

### template?

> `optional` **template?**: (`entry`, `i`) => `string`

Defined in: plugins/createWidget.ts:195

Renders one entry. `i` is its index in the currently rendered batch.

#### Parameters

##### entry

[`WidgetEntry`](WidgetEntry.md)

##### i

`number`

#### Returns

`string`

***

### thumbnail?

> `optional` **thumbnail?**: `false` \| `"default"` \| [`ResizeImageOptions`](ResizeImageOptions.md)

Defined in: plugins/createWidget.ts:131

`"default"` resizes each entry's own/extracted thumbnail with
[resizeImage](../functions/resizeImage.md)'s defaults. Pass a [ResizeImageOptions](ResizeImageOptions.md)
object to customize width/height/crop/etc. `false` disables
thumbnails entirely (skips extraction and rendering). Default `"default"`.

***

### transformers?

> `optional` **transformers?**: [`WidgetTransformer`](../type-aliases/WidgetTransformer.md)[]

Defined in: plugins/createWidget.ts:172

Applied to every entry, in order, right after normalization.

***

### type?

> `optional` **type?**: [`WidgetSourceType`](../type-aliases/WidgetSourceType.md)

Defined in: plugins/createWidget.ts:72

How the initial batch is sourced: `"recent"` lists newest-first,
`"random"` samples random entries. Default `"recent"`.
