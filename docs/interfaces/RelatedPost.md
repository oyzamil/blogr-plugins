[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / RelatedPost

# Interface: RelatedPost

Defined in: [src/plugins/relatify.ts:15](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/relatify.ts#L15)

A single related post handed to `template` and the lifecycle hooks —
mirrors `createWidget`'s `WidgetEntry` shape for familiarity.

## Properties

### author

> **author**: `string`

Defined in: [src/plugins/relatify.ts:23](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/relatify.ts#L23)

Author display name, or `""` if unavailable.

***

### content

> **content**: `string`

Defined in: [src/plugins/relatify.ts:29](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/relatify.ts#L29)

Plain-text summary (Blogger's own summary field, HTML stripped).

***

### id

> **id**: `string`

Defined in: [src/plugins/relatify.ts:17](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/relatify.ts#L17)

Post id, as reported by Blogger.

***

### labels

> **labels**: `string`[]

Defined in: [src/plugins/relatify.ts:27](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/relatify.ts#L27)

Labels on the post.

***

### published

> **published**: `string`

Defined in: [src/plugins/relatify.ts:25](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/relatify.ts#L25)

Publish date (ISO string, as reported by Blogger).

***

### raw

> **raw**: `Post`

Defined in: [src/plugins/relatify.ts:31](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/relatify.ts#L31)

The original SDK `Post` object, for anything not exposed above.

***

### title

> **title**: `string`

Defined in: [src/plugins/relatify.ts:19](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/relatify.ts#L19)

Post title.

***

### url

> **url**: `string`

Defined in: [src/plugins/relatify.ts:21](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/relatify.ts#L21)

Canonical URL of the post.
