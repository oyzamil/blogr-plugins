[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / MarqifyInstance

# Interface: MarqifyInstance

Defined in: [src/plugins/marqify.ts:63](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L63)

What [marqify](../functions/marqify.md) returns. `next()` / `previous()` are no-ops when `type` is `"marquee"`.

## Extends

- [`PluginInstance`](PluginInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [src/types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`

#### Inherited from

[`PluginInstance`](PluginInstance.md).[`destroy`](PluginInstance.md#destroy)

***

### next()

> **next**(): `void`

Defined in: [src/plugins/marqify.ts:65](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L65)

Slide to the next item. Ticker only — no-op for `"marquee"`.

#### Returns

`void`

***

### previous()

> **previous**(): `void`

Defined in: [src/plugins/marqify.ts:67](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L67)

Slide to the previous item. Ticker only — no-op for `"marquee"`.

#### Returns

`void`
