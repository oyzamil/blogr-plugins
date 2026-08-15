[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / CommentEntry

# Interface: CommentEntry

Defined in: [src/plugins/createWidget.ts:56](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/createWidget.ts#L56)

A normalized comment — every field from the raw comment feed entry (id,
url, author, post, inReplyTo, extended, etc.) is spread directly onto
this object rather than nested under `raw`. `content`/`published`/
`updated` are overridden with truncated/formatted values; everything
else is exactly what the feed returned.

## Extends

- `Omit`\<`Comment`, `"published"` \| `"updated"` \| `"content"`\>

## Properties

### author

> **author**: `Author`

Defined in: node\_modules/blogr/dist/blogr.d.ts:100

#### Inherited from

`Omit.author`

***

### content

> **content**: `string`

Defined in: [src/plugins/createWidget.ts:61](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/createWidget.ts#L61)

***

### extended

> **extended**: `Extended`

Defined in: node\_modules/blogr/dist/blogr.d.ts:103

#### Inherited from

`Omit.extended`

***

### id

> **id**: `string`

Defined in: node\_modules/blogr/dist/blogr.d.ts:95

#### Inherited from

`Omit.id`

***

### inReplyTo

> **inReplyTo**: `string` \| `null`

Defined in: node\_modules/blogr/dist/blogr.d.ts:110

Id of the parent comment when this is a reply, else `null`.

#### Inherited from

`Omit.inReplyTo`

***

### kind

> **kind**: `"comments"`

Defined in: [src/plugins/createWidget.ts:60](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/createWidget.ts#L60)

***

### links

> **links**: `Link`[]

Defined in: node\_modules/blogr/dist/blogr.d.ts:111

#### Inherited from

`Omit.links`

***

### post

> **post**: `object`

Defined in: node\_modules/blogr/dist/blogr.d.ts:105

The post this comment belongs to.

#### id

> **id**: `string`

#### url

> **url**: `string`

#### Inherited from

`Omit.post`

***

### published

> **published**: `string`

Defined in: [src/plugins/createWidget.ts:62](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/createWidget.ts#L62)

***

### summary

> **summary**: `string` \| `null`

Defined in: node\_modules/blogr/dist/blogr.d.ts:102

#### Inherited from

`Omit.summary`

***

### title

> **title**: `string`

Defined in: node\_modules/blogr/dist/blogr.d.ts:96

#### Inherited from

`Omit.title`

***

### updated

> **updated**: `string`

Defined in: [src/plugins/createWidget.ts:63](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/createWidget.ts#L63)

***

### url

> **url**: `string`

Defined in: node\_modules/blogr/dist/blogr.d.ts:97

#### Inherited from

`Omit.url`
