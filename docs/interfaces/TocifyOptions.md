[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / TocifyOptions

# Interface: TocifyOptions

Defined in: [plugins/tocify.ts:6](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/tocify.ts#L6)

Configuration options for [tocify](../functions/tocify.md).

## Properties

### content?

> `optional` **content?**: [`ElementInput`](../type-aliases/ElementInput.md)

Defined in: [plugins/tocify.ts:10](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/tocify.ts#L10)

Root element to scan for headings. Defaults to the `input` element itself.

***

### headings?

> `optional` **headings?**: `string`

Defined in: [plugins/tocify.ts:8](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/tocify.ts#L8)

Selector (relative to the content root) for headings to include. Default `"h1,h2,h3"`.
