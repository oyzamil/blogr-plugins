[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / WidgetInstance

# Interface: WidgetInstance

Defined in: [src/plugins/createWidget.ts:242](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/createWidget.ts#L242)

Returned by [createWidget](../functions/createWidget.md).

## Extends

- [`PluginInstance`](PluginInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [src/types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`

#### Inherited from

[`PluginInstance`](PluginInstance.md).[`destroy`](PluginInstance.md#destroy)

***

### refresh()

> **refresh**(): `Promise`\<`void`\>

Defined in: [src/plugins/createWidget.ts:244](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/createWidget.ts#L244)

Re-fetches from scratch, bypassing the local cache.

#### Returns

`Promise`\<`void`\>

***

### setQuery()

> **setQuery**(`query`): `Promise`\<`void`\>

Defined in: [src/plugins/createWidget.ts:246](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/createWidget.ts#L246)

Updates the search query and re-fetches (or re-filters, per `deepSearch`).

#### Parameters

##### query

`string`

#### Returns

`Promise`\<`void`\>
