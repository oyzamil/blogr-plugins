[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / PluginInstance

# Interface: PluginInstance

Defined in: [types.ts:16](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/types.ts#L16)

Common shape returned by every plugin instance so callers always have a
predictable way to tear a plugin down.

## Extended by

- [`WidgetInstance`](WidgetInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`
