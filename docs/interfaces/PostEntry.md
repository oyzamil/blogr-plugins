[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / PostEntry

# Interface: PostEntry

Defined in: [src/plugins/createWidget.ts:26](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L26)

A normalized post or page. Anything not listed here — id, title, url, author, etc. — is unchanged from the source feed and lives on `raw` instead.

## Properties

### author

> **author**: `Author`

Defined in: [src/plugins/createWidget.ts:35](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L35)

Author Details.

***

### content

> **content**: `string`

Defined in: [src/plugins/createWidget.ts:45](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L45)

Plain-text summary, truncated to `summaryLength` characters.

***

### id

> **id**: `string`

Defined in: [src/plugins/createWidget.ts:29](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L29)

Numeric id, as reported by Blogger.

***

### kind

> **kind**: `"posts"` \| `"pages"`

Defined in: [src/plugins/createWidget.ts:27](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L27)

***

### labels

> **labels**: `string`[]

Defined in: [src/plugins/createWidget.ts:41](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L41)

Labels. Always `[]` for pages/comments (which carry none).

***

### published

> **published**: `string`

Defined in: [src/plugins/createWidget.ts:37](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L37)

Publish date, formatted per `dateFormat`.

***

### raw

> **raw**: `Post`

Defined in: [src/plugins/createWidget.ts:47](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L47)

The original, un-normalized SDK object.

***

### thumbnail

> **thumbnail**: `string`

Defined in: [src/plugins/createWidget.ts:43](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L43)

Resized thumbnail (via [resizeImage](../functions/resizeImage.md)), falling back to `fallbackImage`. `""` when `thumbnail: false`.

***

### title

> **title**: `string`

Defined in: [src/plugins/createWidget.ts:31](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L31)

Title. `""` for comments (which have none).

***

### updated

> **updated**: `string`

Defined in: [src/plugins/createWidget.ts:39](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L39)

Last-updated date, formatted per `dateFormat`.

***

### url

> **url**: `string`

Defined in: [src/plugins/createWidget.ts:33](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/createWidget.ts#L33)

Canonical URL.
