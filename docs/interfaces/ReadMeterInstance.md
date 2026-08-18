[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / ReadMeterInstance

# Interface: ReadMeterInstance

Defined in: src/plugins/readMeter.ts:97

Returned by [readMeter](../functions/readMeter.md).

## Extends

- [`PluginInstance`](PluginInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [src/types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/645bb3710cdb7902190d431c3fddc067c18a5ce0/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`

#### Inherited from

[`PluginInstance`](PluginInstance.md).[`destroy`](PluginInstance.md#destroy)

***

### refresh()

> **refresh**(): `void`

Defined in: src/plugins/readMeter.ts:103

Re-runs the calculation immediately (e.g. after content was swapped
in via AJAX, outside of a resize event) and re-renders/fires
`onUpdate` exactly like the initial run.

#### Returns

`void`
