[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / WidgetTransformer

# Type Alias: WidgetTransformer

> **WidgetTransformer** = (`entry`, `index`) => [`WidgetEntry`](WidgetEntry.md) \| `null` \| `Promise`\<[`WidgetEntry`](WidgetEntry.md) \| `null`\>

Defined in: [src/plugins/createWidget.ts:101](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/createWidget.ts#L101)

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
