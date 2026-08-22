[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / PluginInstance

# Interface: PluginInstance

Defined in: [src/types.ts:16](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/types.ts#L16)

Common shape returned by every plugin instance so callers always have a
predictable way to tear a plugin down.

## Extended by

- [`AvatarifyInstance`](AvatarifyInstance.md)
- [`WidgetInstance`](WidgetInstance.md)
- [`MarqifyInstance`](MarqifyInstance.md)
- [`ReadMeterInstance`](ReadMeterInstance.md)
- [`StackifyInstance`](StackifyInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [src/types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`
