[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / WidgetTransformer

# Type Alias: WidgetTransformer

> **WidgetTransformer** = (`entry`, `index`) => [`WidgetEntry`](../interfaces/WidgetEntry.md) \| `Promise`\<[`WidgetEntry`](../interfaces/WidgetEntry.md)\>

Defined in: plugins/createWidget.ts:59

Transforms one normalized entry, e.g. to inject a computed field, rewrite
a value from a transformer chain, or pull in data from elsewhere. Applied
in array order — each transformer receives the previous one's output.
May be async.

## Parameters

### entry

[`WidgetEntry`](../interfaces/WidgetEntry.md)

### index

`number`

## Returns

[`WidgetEntry`](../interfaces/WidgetEntry.md) \| `Promise`\<[`WidgetEntry`](../interfaces/WidgetEntry.md)\>
