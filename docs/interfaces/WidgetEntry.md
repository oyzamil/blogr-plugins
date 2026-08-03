[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / WidgetEntry

# Interface: WidgetEntry

Defined in: plugins/createWidget.ts:26

A single normalized entry handed to `template`, `entryClass`, and every
lifecycle hook — same shape regardless of whether it came from the posts,
pages, or comments feed.

## Properties

### author

> **author**: `string`

Defined in: plugins/createWidget.ts:34

Author display name, or `""` if unavailable.

***

### content

> **content**: `string`

Defined in: plugins/createWidget.ts:48

Plain-text summary, truncated to `summaryLength` characters.

***

### id

> **id**: `string`

Defined in: plugins/createWidget.ts:28

Entry id (numeric string), as reported by Blogger.

***

### labels

> **labels**: `string`[]

Defined in: plugins/createWidget.ts:40

Labels on the entry. Always `[]` for comments (which carry none).

***

### published

> **published**: `string`

Defined in: plugins/createWidget.ts:36

Publish date, formatted per `dateFormat`.

***

### raw

> **raw**: `Post` \| `Comment`

Defined in: plugins/createWidget.ts:50

The original, un-normalized SDK object, for anything not exposed above.

***

### thumbnail

> **thumbnail**: `string`

Defined in: plugins/createWidget.ts:46

Resolved thumbnail URL — already run through `resizeImage` (unless
`thumbnail: false`), falling back to `fallbackImage` when the entry
has no image of its own. `""` when `thumbnail: false`.

***

### title

> **title**: `string`

Defined in: plugins/createWidget.ts:30

Entry title (empty string for comments, which have none).

***

### updated

> **updated**: `string`

Defined in: plugins/createWidget.ts:38

Last-updated date, formatted per `dateFormat`.

***

### url

> **url**: `string`

Defined in: plugins/createWidget.ts:32

Canonical URL of the entry.
