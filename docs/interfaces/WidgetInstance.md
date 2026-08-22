[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / WidgetInstance

# Interface: WidgetInstance

Defined in: [src/plugins/createWidget.ts:250](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L250)

Returned by [createWidget](../functions/createWidget.md).

## Extends

- [`PluginInstance`](PluginInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [src/types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`

#### Inherited from

[`PluginInstance`](PluginInstance.md).[`destroy`](PluginInstance.md#destroy)

***

### refresh()

> **refresh**(): `Promise`\<`void`\>

Defined in: [src/plugins/createWidget.ts:252](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L252)

Re-fetches from scratch, bypassing the local cache.

#### Returns

`Promise`\<`void`\>

***

### setQuery()

> **setQuery**(`query`): `Promise`\<`void`\>

Defined in: [src/plugins/createWidget.ts:254](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/createWidget.ts#L254)

Updates the search query and re-fetches (or re-filters, per `deepSearch`).

#### Parameters

##### query

`string`

#### Returns

`Promise`\<`void`\>
