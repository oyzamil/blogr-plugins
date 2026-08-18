[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / RelatedPost

# Interface: RelatedPost

Defined in: [src/plugins/relatify.ts:14](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L14)

A single related post handed to `template` and the lifecycle hooks —
mirrors `createWidget`'s `WidgetEntry` shape for familiarity.

## Properties

### author

> **author**: `string`

Defined in: [src/plugins/relatify.ts:22](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L22)

Author display name, or `""` if unavailable.

***

### content

> **content**: `string`

Defined in: [src/plugins/relatify.ts:28](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L28)

Plain-text summary (Blogger's own summary field, HTML stripped).

***

### id

> **id**: `string`

Defined in: [src/plugins/relatify.ts:16](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L16)

Post id, as reported by Blogger.

***

### labels

> **labels**: `string`[]

Defined in: [src/plugins/relatify.ts:26](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L26)

Labels on the post.

***

### published

> **published**: `string`

Defined in: [src/plugins/relatify.ts:24](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L24)

Publish date (ISO string, as reported by Blogger).

***

### raw

> **raw**: `Post`

Defined in: [src/plugins/relatify.ts:30](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L30)

The original SDK `Post` object, for anything not exposed above.

***

### title

> **title**: `string`

Defined in: [src/plugins/relatify.ts:18](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L18)

Post title.

***

### url

> **url**: `string`

Defined in: [src/plugins/relatify.ts:20](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/relatify.ts#L20)

Canonical URL of the post.
