[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / RelatifyOptions

# Interface: RelatifyOptions

Defined in: [src/plugins/relatify.ts:34](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L34)

Configuration for [relatify](../functions/relatify.md).

## Properties

### afterFetch?

> `optional` **afterFetch?**: (`posts`) => `void`

Defined in: [src/plugins/relatify.ts:113](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L113)

Called with the final list of chosen related posts, before any are inserted.

#### Parameters

##### posts

[`RelatedPost`](RelatedPost.md)[]

#### Returns

`void`

***

### beforeFetch?

> `optional` **beforeFetch?**: () => `void`

Defined in: [src/plugins/relatify.ts:111](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L111)

Called right before fetching.

#### Returns

`void`

***

### blogUrl?

> `optional` **blogUrl?**: `string`

Defined in: [src/plugins/relatify.ts:99](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L99)

URL (or numeric id) of the Blogger blog to read from. Defaults to
`window.location.origin` — override only if this runs somewhere
other than the blog itself (e.g. local development against a
different site).

***

### currentUrl?

> `optional` **currentUrl?**: `string`

Defined in: [src/plugins/relatify.ts:105](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L105)

URL of the current post, used to exclude it from its own related
list. Defaults to `<link rel="canonical">`'s `href`, falling back to
`location.href`. Override if neither is reliable in your setup.

***

### excludeLabels?

> `optional` **excludeLabels?**: `string`[]

Defined in: [src/plugins/relatify.ts:79](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L79)

Labels to leave out of the *search* — i.e. even if `labels` (or the
post's own labels) includes one of these, it won't be used to look
up related posts. This does **not** filter candidate results: a
related post found via a non-excluded label is kept even if it also
happens to carry an excluded label. Default `[]`.

***

### insertAfter?

> `optional` **insertAfter?**: `string` \| `string`[]

Defined in: [src/plugins/relatify.ts:63](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L63)

Element(s) after which a related-post link may be inserted — a CSS
selector, or an array of selectors (joined with `,`, so
`["p", ".paragraph", ".video"]` behaves like
`"p, .paragraph, .video"`). Matched *within* the container. Default
`"p"`.

***

### jsonp?

> `optional` **jsonp?**: `boolean`

Defined in: [src/plugins/relatify.ts:36](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L36)

Enable JSONP transport (browser-only).

#### Default

```ts
true
```

***

### labels?

> `optional` **labels?**: `string`[]

Defined in: [src/plugins/relatify.ts:55](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L55)

Labels to find related posts for — paste this straight from your
Blogger template (see the `<script>` snippet in the README) so it
reflects the *current* post's actual labels:

```html
<script>
	const labels = [
		<b:loop values='data:post.labels' var='label'>
			"<data:label.name/>"<b:if cond='not data:label.isLast'>,</b:if>
		</b:loop>
	];
</script>
```

Omitted or empty fetches recent posts across the whole blog instead
of filtering by label at all.

***

### lazy?

> `optional` **lazy?**: `boolean`

Defined in: [src/plugins/relatify.ts:129](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L129)

Enable lazy loading — plugin initializes only when first `insertAfter`
element comes near the viewport, preventing API calls on page load.
Default `true`.

***

### linkClass?

> `optional` **linkClass?**: `string`

Defined in: [src/plugins/relatify.ts:109](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L109)

Wrapper element class for each inserted link. Default `"relatify-link"`.

***

### maxLinks?

> `optional` **maxLinks?**: `number`

Defined in: [src/plugins/relatify.ts:71](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L71)

Maximum number of links to insert. Default: scaled to the
container's word count — 2 for a ~500-word article, 3 for ~1000,
and so on (`Math.floor(wordCount / 500) + 1`, minimum `1`). Always
additionally capped by however many eligible `insertAfter` elements
and related posts actually exist.

***

### onEmpty?

> `optional` **onEmpty?**: () => `void`

Defined in: [src/plugins/relatify.ts:121](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L121)

Called when no related posts (or no eligible insertion points) were found.

#### Returns

`void`

***

### onError?

> `optional` **onError?**: (`err`) => `void`

Defined in: [src/plugins/relatify.ts:123](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L123)

Called if the fetch fails.

#### Parameters

##### err

`unknown`

#### Returns

`void`

***

### onInsert?

> `optional` **onInsert?**: (`detail`) => `void`

Defined in: [src/plugins/relatify.ts:115](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L115)

Called once per link actually inserted.

#### Parameters

##### detail

###### element

`HTMLElement`

###### index

`number`

###### post

[`RelatedPost`](RelatedPost.md)

#### Returns

`void`

***

### relevance?

> `optional` **relevance?**: [`RelatifyRelevance`](../type-aliases/RelatifyRelevance.md)

Defined in: [src/plugins/relatify.ts:86](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L86)

`"strict"` scores every candidate by word overlap against the
nearest heading inside the container (falling back to
`document.title`) and picks the highest-scoring matches. `"default"`
shuffles the candidates and picks randomly. Default `"strict"`.

***

### rootMargin?

> `optional` **rootMargin?**: `string`

Defined in: [src/plugins/relatify.ts:135](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L135)

Margin (in pixels or CSS string) for IntersectionObserver to trigger
lazy load before element enters viewport. Default `"0px"`.
Examples: `"100px"`, `"10%"`, `"0px 0px 50px 0px"`.

***

### sampleSize?

> `optional` **sampleSize?**: `number`

Defined in: [src/plugins/relatify.ts:107](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L107)

How many candidate posts to fetch (per label, or overall when unfiltered) before scoring/picking from them. Default `20`.

***

### template?

> `optional` **template?**: (`post`, `index`) => `string`

Defined in: [src/plugins/relatify.ts:92](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L92)

Renders one inserted link. Same shape as `createWidget`'s
`template`: `(post, index) => string`. Default:
`` `You may also like: <a href="${post.url}">${post.title}</a>` ``.

#### Parameters

##### post

[`RelatedPost`](RelatedPost.md)

##### index

`number`

#### Returns

`string`
