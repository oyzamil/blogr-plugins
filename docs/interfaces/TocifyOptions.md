[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / TocifyOptions

# Interface: TocifyOptions

Defined in: [src/plugins/tocify.ts:6](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/tocify.ts#L6)

Configuration options for [tocify](../functions/tocify.md).

## Properties

### content?

> `optional` **content?**: [`ElementInput`](../type-aliases/ElementInput.md)

Defined in: [src/plugins/tocify.ts:12](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/tocify.ts#L12)

Root element to scan for headings. Defaults to the `input` element itself.

***

### headings?

> `optional` **headings?**: `string`

Defined in: [src/plugins/tocify.ts:10](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/tocify.ts#L10)

Selector (relative to the content root) for headings to include. Default `"h1,h2,h3"`.

***

### title?

> `optional` **title?**: `string` \| (() => `string`)

Defined in: [src/plugins/tocify.ts:8](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/tocify.ts#L8)

Optional title rendered as an `<h2>` above the table of contents.
