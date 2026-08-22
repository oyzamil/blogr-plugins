[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / relatify

# Function: relatify()

> **relatify**(`input`, `options?`): [`PluginInstance`](../interfaces/PluginInstance.md)

Defined in: [src/plugins/relatify.ts:448](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/relatify.ts#L448)

Fetches related posts for the current article by label and inserts a
randomly-placed link (or several, scaled to article length) after
`insertAfter` elements within the container.

Get the current post's labels straight from your Blogger template and
pass them in as `labels`:

```html
<script>
	const labels = [
		<b:loop values='data:post.labels' var='label'>
			"<data:label.name/>"<b:if cond='not data:label.isLast'>,</b:if>
		</b:loop>
	];
</script>
```

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection for the
article container — related links are inserted inside it.

### options?

[`RelatifyOptions`](../interfaces/RelatifyOptions.md) = `{}`

[RelatifyOptions](../interfaces/RelatifyOptions.md)

## Returns

[`PluginInstance`](../interfaces/PluginInstance.md)

A [PluginInstance](../interfaces/PluginInstance.md) — `destroy()` removes every link it
inserted (or, if the fetch hasn't resolved yet, cancels it).

## Example

```ts
import { relatify } from "blogr-plugins";

relatify("article", {
	labels,
	insertAfter: ["p", ".paragraph", ".video"],
	excludeLabels: ["announcements"],
	relevance: "strict",
	template: (post) =>
		`Related: <a href="${post.url}">${post.title}</a>`,
});
```
