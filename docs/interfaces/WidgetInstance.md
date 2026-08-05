[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / WidgetInstance

# Interface: WidgetInstance

Defined in: [src/plugins/createWidget.ts:244](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/createWidget.ts#L244)

Returned by [createWidget](../functions/createWidget.md).

## Extends

- [`PluginInstance`](PluginInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [src/types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`

#### Inherited from

[`PluginInstance`](PluginInstance.md).[`destroy`](PluginInstance.md#destroy)

***

### refresh()

> **refresh**(): `Promise`\<`void`\>

Defined in: [src/plugins/createWidget.ts:246](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/createWidget.ts#L246)

Re-fetches from scratch, bypassing the local cache.

#### Returns

`Promise`\<`void`\>

***

### setQuery()

> **setQuery**(`query`): `Promise`\<`void`\>

Defined in: [src/plugins/createWidget.ts:248](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/createWidget.ts#L248)

Updates the search query and re-fetches (or re-filters, per `deepSearch`).

#### Parameters

##### query

`string`

#### Returns

`Promise`\<`void`\>
