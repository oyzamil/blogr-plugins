[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / WidgetTransformer

# Type Alias: WidgetTransformer

> **WidgetTransformer** = (`entry`, `index`) => [`WidgetEntry`](WidgetEntry.md) \| `null` \| `Promise`\<[`WidgetEntry`](WidgetEntry.md) \| `null`\>

Defined in: [src/plugins/createWidget.ts:95](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/createWidget.ts#L95)

Transforms one normalized entry, e.g. to inject a computed field, rewrite
a value from a transformer chain, or pull in data from elsewhere. Applied
in array order — each transformer receives the previous one's output.
May be async. Return `null` to drop the entry from the batch entirely.

## Parameters

### entry

[`WidgetEntry`](WidgetEntry.md)

### index

`number`

## Returns

[`WidgetEntry`](WidgetEntry.md) \| `null` \| `Promise`\<[`WidgetEntry`](WidgetEntry.md) \| `null`\>
