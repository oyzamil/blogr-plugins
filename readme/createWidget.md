# createWidget

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
`blogr-plugins`).

---

## `createWidget(config)`

```ts
function createWidget(config: CreateWidgetConfig): WidgetInstance;
```

Like `avatarify`, `createWidget` takes a single config object rather than
a separate target + options — `containerSelector` lives inside that
object.

### `config`

| Option | Type | Description |
|---|---|---|
| `containerSelector` | `ElementInput` | Where the widget's items are rendered |
| `blogUrl` | `string` | The Blogger blog to fetch from |
| `related` | `boolean` | Fetch posts related to the current post (by label) rather than recent/random |
| `excludeCurrent` | `boolean` | Leave the current post out of the results |
| `currentPostId` | `string` | The current post's ID — needed for `excludeCurrent` and `related` |
| `labels` | `string[]` | Labels to filter/fetch by |
| `maxVisibleItems` | `number` | How many items to show at once |
| `loadMore` | `boolean` | Enable infinite scroll / a load-more control |
| `template` | `(entry) => string` | Renders one item's markup — same shape as `relatify`'s `template` |

> This table reflects only the options shown in the usage example above.
> `createWidget` is described as having "a full lifecycle-hook/templating
> API" plus caching behavior (in-memory and `localStorage`) and
> thumbnail resizing via `resizeImage`, but the specific hook names,
> caching options, and their defaults aren't captured anywhere in the
> source material this doc was generated from — so they're left out here
> rather than guessed at. If you have the fuller prop reference (or the
> `typedoc`-generated API markdown from `npm run docs`), share it and this
> page can be filled in properly.

---

## Return value — `WidgetInstance`

```ts
interface WidgetInstance {
	destroy(): void;
	refresh(): void;
	setQuery(/* not documented in source material */): void;
}
```

- **`destroy()`** — tears down the widget.
- **`refresh()`** — re-runs the widget's fetch/render cycle.
- **`setQuery()`** — mentioned in the main README's cleanup section as part
  of `WidgetInstance`, but its parameters aren't documented in the source
  material this page was generated from.

```ts
const widget = createWidget({ containerSelector: "#relatedPosts", /* ... */ });
// later:
widget.refresh();
widget.destroy();
```

---

## Notes

- `createWidget` depends on the [`blogr`](https://jsr.io/@oyzamil/blogr)
  SDK — installed automatically as a dependency of `blogr-plugins`, no
  extra install step needed.
- Thumbnail resizing is handled internally via `resizeImage` (also part of
  this package).