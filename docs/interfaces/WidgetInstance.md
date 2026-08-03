[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / WidgetInstance

# Interface: WidgetInstance

Defined in: plugins/createWidget.ts:201

Returned by [createWidget](../functions/createWidget.md).

## Extends

- [`PluginInstance`](PluginInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`

#### Inherited from

[`PluginInstance`](PluginInstance.md).[`destroy`](PluginInstance.md#destroy)

***

### refresh()

> **refresh**(): `Promise`\<`void`\>

Defined in: plugins/createWidget.ts:203

Re-fetches from scratch, bypassing the local cache.

#### Returns

`Promise`\<`void`\>

***

### setQuery()

> **setQuery**(`query`): `Promise`\<`void`\>

Defined in: plugins/createWidget.ts:205

Updates the search query and re-fetches (or re-filters, per `deepSearch`).

#### Parameters

##### query

`string`

#### Returns

`Promise`\<`void`\>
