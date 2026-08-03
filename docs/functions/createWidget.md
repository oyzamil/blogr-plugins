[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / createWidget

# Function: createWidget()

> **createWidget**(`options`): [`WidgetInstance`](../interfaces/WidgetInstance.md)

Defined in: plugins/createWidget.ts:395

Builds and mounts a fully self-contained Blogger listing widget — related
posts, a recent-posts sidebar, random picks, a comment stream, or a page
list — backed by the [`blogr`](https://jsr.io/@oyzamil/blogr) SDK. Fetches
are deferred until the container scrolls near the viewport, thumbnails are
resized via [resizeImage](resizeImage.md), and results can be paged with an
infinite-scroll sentinel and/or a "load more" button.

## Parameters

### options

[`CreateWidgetOptions`](../interfaces/CreateWidgetOptions.md)

Configuration object.
See [CreateWidgetOptions](../interfaces/CreateWidgetOptions.md).

## Returns

[`WidgetInstance`](../interfaces/WidgetInstance.md)

A [WidgetInstance](../interfaces/WidgetInstance.md) — `destroy()` tears down every observer
and clears the container; `refresh()`/`setQuery()` let you drive it after
the fact.

## Example

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
