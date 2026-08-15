[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / TocifyOptions

# Interface: TocifyOptions

Defined in: [src/plugins/tocify.ts:5](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/tocify.ts#L5)

Configuration options for [tocify](../functions/tocify.md).

## Properties

### content?

> `optional` **content?**: [`ElementInput`](../type-aliases/ElementInput.md)

Defined in: [src/plugins/tocify.ts:11](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/tocify.ts#L11)

Root element to scan for headings. Defaults to the `input` element itself.

***

### headings?

> `optional` **headings?**: `string`

Defined in: [src/plugins/tocify.ts:9](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/tocify.ts#L9)

Selector (relative to the content root) for headings to include. Default `"h1,h2,h3"`.

***

### title?

> `optional` **title?**: `string` \| (() => `string`)

Defined in: [src/plugins/tocify.ts:7](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/tocify.ts#L7)

Optional title rendered as an `<h2>` above the table of contents.
