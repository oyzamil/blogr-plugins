[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / PluginInstance

# Interface: PluginInstance

Defined in: src/types.ts:16

Common shape returned by every plugin instance so callers always have a
predictable way to tear a plugin down.

## Extended by

- [`WidgetInstance`](WidgetInstance.md)
- [`StackifyInstance`](StackifyInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: src/types.ts:18

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`
