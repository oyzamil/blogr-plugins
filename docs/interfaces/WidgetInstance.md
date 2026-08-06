[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / WidgetInstance

# Interface: WidgetInstance

Defined in: src/plugins/createWidget.ts:244

Returned by [createWidget](../functions/createWidget.md).

## Extends

- [`PluginInstance`](PluginInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: src/types.ts:18

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`

#### Inherited from

[`PluginInstance`](PluginInstance.md).[`destroy`](PluginInstance.md#destroy)

***

### refresh()

> **refresh**(): `Promise`\<`void`\>

Defined in: src/plugins/createWidget.ts:246

Re-fetches from scratch, bypassing the local cache.

#### Returns

`Promise`\<`void`\>

***

### setQuery()

> **setQuery**(`query`): `Promise`\<`void`\>

Defined in: src/plugins/createWidget.ts:248

Updates the search query and re-fetches (or re-filters, per `deepSearch`).

#### Parameters

##### query

`string`

#### Returns

`Promise`\<`void`\>
