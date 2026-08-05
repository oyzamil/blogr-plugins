[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / PluginInstance

# Interface: PluginInstance

Defined in: [src/types.ts:16](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/types.ts#L16)

Common shape returned by every plugin instance so callers always have a
predictable way to tear a plugin down.

## Extended by

- [`WidgetInstance`](WidgetInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [src/types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`
