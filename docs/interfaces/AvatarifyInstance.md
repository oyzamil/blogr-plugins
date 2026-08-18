[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / AvatarifyInstance

# Interface: AvatarifyInstance

Defined in: [src/plugins/avatarify.ts:177](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/avatarify.ts#L177)

Returned by [avatarify](../functions/avatarify.md).

## Extends

- [`PluginInstance`](PluginInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [src/types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`

#### Inherited from

[`PluginInstance`](PluginInstance.md).[`destroy`](PluginInstance.md#destroy)

***

### refresh()

> **refresh**(): `void`

Defined in: [src/plugins/avatarify.ts:179](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/avatarify.ts#L179)

Forces an immediate load of every matched avatar, bypassing the debounce and the per-avatar in-view gate.

#### Returns

`void`
