[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / PluginInstance

# Interface: PluginInstance

Defined in: [src/types.ts:16](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/types.ts#L16)

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

Defined in: [src/types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`
