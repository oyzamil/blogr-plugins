[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / TocifyOptions

# Interface: TocifyOptions

Defined in: [src/plugins/tocify.ts:6](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/tocify.ts#L6)

Configuration options for [tocify](../functions/tocify.md).

## Properties

### content?

> `optional` **content?**: [`ElementInput`](../type-aliases/ElementInput.md)

Defined in: [src/plugins/tocify.ts:10](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/tocify.ts#L10)

Root element to scan for headings. Defaults to the `input` element itself.

***

### headings?

> `optional` **headings?**: `string`

Defined in: [src/plugins/tocify.ts:8](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/tocify.ts#L8)

Selector (relative to the content root) for headings to include. Default `"h1,h2,h3"`.
