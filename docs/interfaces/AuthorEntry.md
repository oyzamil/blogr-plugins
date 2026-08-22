[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / AuthorEntry

# Interface: AuthorEntry

Defined in: [src/plugins/createWidget.ts:70](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L70)

A normalized author — every field from `blogr`'s `Author` is spread
directly onto this object. `id`/`name`/`url`/`image` are overridden with
fallback-filled values; `email`/`imageWidth`/`imageHeight` pass through
unchanged.

## Extends

- `Omit`\<`Author`, `"id"` \| `"name"` \| `"url"` \| `"image"`\>

## Properties

### id

> **id**: `string`

Defined in: [src/plugins/createWidget.ts:75](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L75)

***

### image

> **image**: `string`

Defined in: [src/plugins/createWidget.ts:78](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L78)

***

### kind

> **kind**: `"authors"`

Defined in: [src/plugins/createWidget.ts:74](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L74)

***

### name

> **name**: `string`

Defined in: [src/plugins/createWidget.ts:76](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L76)

***

### url

> **url**: `string`

Defined in: [src/plugins/createWidget.ts:77](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L77)
