[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / PluginInstance

# Interface: PluginInstance

Defined in: [types.ts:16](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/types.ts#L16)

Common shape returned by every plugin instance so callers always have a
predictable way to tear a plugin down.

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`
