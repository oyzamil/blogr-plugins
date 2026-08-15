[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / PluginInstance

# Interface: PluginInstance

Defined in: [src/types.ts:16](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/types.ts#L16)

Common shape returned by every plugin instance so callers always have a
predictable way to tear a plugin down.

## Extended by

- [`AvatarifyInstance`](AvatarifyInstance.md)
- [`WidgetInstance`](WidgetInstance.md)
- [`MarqifyInstance`](MarqifyInstance.md)
- [`StackifyInstance`](StackifyInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [src/types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`
