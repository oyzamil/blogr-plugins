[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / PostEntry

# Interface: PostEntry

Defined in: [src/plugins/createWidget.ts:32](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L32)

A normalized post or page — every field from the raw feed entry (id, url,
author, labels, comments, geo, links, etc.) is spread directly onto this
object. `summary`/`published`/`updated`/`thumbnail` are overridden with
processed values; everything else is exactly what the feed returned.

## Extends

- `Omit`\<`Post`, `"published"` \| `"updated"` \| `"content"` \| `"thumbnail"` \| `"summary"`\>

## Properties

### author

> **author**: `Author`

Defined in: node\_modules/blogr/dist/blogr.d.ts:77

Entry author.

#### Inherited from

`Omit.author`

***

### comments

> **comments**: `PostCommentInfo`

Defined in: node\_modules/blogr/dist/blogr.d.ts:87

Comment count/metadata for this entry.

#### Inherited from

`Omit.comments`

***

### geo

> **geo**: `Geo`

Defined in: node\_modules/blogr/dist/blogr.d.ts:89

Geo-location, if attached.

#### Inherited from

`Omit.geo`

***

### id

> **id**: `string`

Defined in: node\_modules/blogr/dist/blogr.d.ts:65

Entry id (numeric string).

#### Inherited from

`Omit.id`

***

### kind

> **kind**: `"posts"` \| `"pages"`

Defined in: [src/plugins/createWidget.ts:36](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L36)

***

### labels

> **labels**: `string`[]

Defined in: node\_modules/blogr/dist/blogr.d.ts:75

Labels attached to the entry.

#### Inherited from

`Omit.labels`

***

### links

> **links**: `Link`[]

Defined in: node\_modules/blogr/dist/blogr.d.ts:91

Raw `<link>` entries from the feed.

#### Inherited from

`Omit.links`

***

### published

> **published**: `string`

Defined in: [src/plugins/createWidget.ts:38](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L38)

Publish date, formatted per `dateFormat`.

***

### summary

> **summary**: `string`

Defined in: [src/plugins/createWidget.ts:42](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L42)

Plain text — HTML tags and comments stripped — truncated to `summaryLength` characters.

***

### thumbnail

> **thumbnail**: `string`

Defined in: [src/plugins/createWidget.ts:44](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L44)

Resized thumbnail (via [resizeImage](../functions/resizeImage.md)), falling back to `fallbackImage`. `""` when `thumbnail: false`.

***

### thumbnailAlt

> **thumbnailAlt**: `string` \| `null`

Defined in: node\_modules/blogr/dist/blogr.d.ts:85

Thumbnail explicitly selected by Blogger, or `null`.

#### Inherited from

`Omit.thumbnailAlt`

***

### title

> **title**: `string`

Defined in: node\_modules/blogr/dist/blogr.d.ts:67

Title of the entry.

#### Inherited from

`Omit.title`

***

### updated

> **updated**: `string`

Defined in: [src/plugins/createWidget.ts:40](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L40)

Last-updated date, formatted per `dateFormat`.

***

### url

> **url**: `string`

Defined in: node\_modules/blogr/dist/blogr.d.ts:69

Canonical URL of the entry.

#### Inherited from

`Omit.url`
