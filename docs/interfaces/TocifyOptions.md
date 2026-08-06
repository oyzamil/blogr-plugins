[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / TocifyOptions

# Interface: TocifyOptions

Defined in: src/plugins/tocify.ts:6

Configuration options for [tocify](../functions/tocify.md).

## Properties

### content?

> `optional` **content?**: [`ElementInput`](../type-aliases/ElementInput.md)

Defined in: src/plugins/tocify.ts:10

Root element to scan for headings. Defaults to the `input` element itself.

***

### headings?

> `optional` **headings?**: `string`

Defined in: src/plugins/tocify.ts:8

Selector (relative to the content root) for headings to include. Default `"h1,h2,h3"`.
