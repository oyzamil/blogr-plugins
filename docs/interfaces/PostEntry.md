[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / PostEntry

# Interface: PostEntry

Defined in: [src/plugins/createWidget.ts:25](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L25)

A normalized post or page. Anything not listed here — id, title, url, author, etc. — is unchanged from the source feed and lives on `raw` instead.

## Properties

### author

> **author**: `Author`

Defined in: [src/plugins/createWidget.ts:34](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L34)

Author Details.

***

### content

> **content**: `string`

Defined in: [src/plugins/createWidget.ts:44](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L44)

Plain-text summary, truncated to `summaryLength` characters.

***

### id

> **id**: `string`

Defined in: [src/plugins/createWidget.ts:28](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L28)

Numeric id, as reported by Blogger.

***

### kind

> **kind**: `"posts"` \| `"pages"`

Defined in: [src/plugins/createWidget.ts:26](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L26)

***

### labels

> **labels**: `string`[]

Defined in: [src/plugins/createWidget.ts:40](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L40)

Labels. Always `[]` for pages/comments (which carry none).

***

### published

> **published**: `string`

Defined in: [src/plugins/createWidget.ts:36](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L36)

Publish date, formatted per `dateFormat`.

***

### raw

> **raw**: `Post`

Defined in: [src/plugins/createWidget.ts:46](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L46)

The original, un-normalized SDK object.

***

### thumbnail

> **thumbnail**: `string`

Defined in: [src/plugins/createWidget.ts:42](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L42)

Resized thumbnail (via [resizeImage](../functions/resizeImage.md)), falling back to `fallbackImage`. `""` when `thumbnail: false`.

***

### title

> **title**: `string`

Defined in: [src/plugins/createWidget.ts:30](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L30)

Title. `""` for comments (which have none).

***

### updated

> **updated**: `string`

Defined in: [src/plugins/createWidget.ts:38](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L38)

Last-updated date, formatted per `dateFormat`.

***

### url

> **url**: `string`

Defined in: [src/plugins/createWidget.ts:32](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/plugins/createWidget.ts#L32)

Canonical URL.
