[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / PostEntry

# Interface: PostEntry

Defined in: src/plugins/createWidget.ts:27

A normalized post or page. Anything not listed here — id, title, url, author, etc. — is unchanged from the source feed and lives on `raw` instead.

## Properties

### author

> **author**: `Author`

Defined in: src/plugins/createWidget.ts:36

Author Details.

***

### content

> **content**: `string`

Defined in: src/plugins/createWidget.ts:46

Plain-text summary, truncated to `summaryLength` characters.

***

### id

> **id**: `string`

Defined in: src/plugins/createWidget.ts:30

Numeric id, as reported by Blogger.

***

### kind

> **kind**: `"posts"` \| `"pages"`

Defined in: src/plugins/createWidget.ts:28

***

### labels

> **labels**: `string`[]

Defined in: src/plugins/createWidget.ts:42

Labels. Always `[]` for pages/comments (which carry none).

***

### published

> **published**: `string`

Defined in: src/plugins/createWidget.ts:38

Publish date, formatted per `dateFormat`.

***

### raw

> **raw**: `Post`

Defined in: src/plugins/createWidget.ts:48

The original, un-normalized SDK object.

***

### thumbnail

> **thumbnail**: `string`

Defined in: src/plugins/createWidget.ts:44

Resized thumbnail (via [resizeImage](../functions/resizeImage.md)), falling back to `fallbackImage`. `""` when `thumbnail: false`.

***

### title

> **title**: `string`

Defined in: src/plugins/createWidget.ts:32

Title. `""` for comments (which have none).

***

### updated

> **updated**: `string`

Defined in: src/plugins/createWidget.ts:40

Last-updated date, formatted per `dateFormat`.

***

### url

> **url**: `string`

Defined in: src/plugins/createWidget.ts:34

Canonical URL.
