[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / ReadMeterInstance

# Interface: ReadMeterInstance

Defined in: [src/plugins/readMeter.ts:97](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/readMeter.ts#L97)

Returned by [readMeter](../functions/readMeter.md).

## Extends

- [`PluginInstance`](PluginInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [src/types.ts:18](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/types.ts#L18)

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`

#### Inherited from

[`PluginInstance`](PluginInstance.md).[`destroy`](PluginInstance.md#destroy)

***

### refresh()

> **refresh**(): `void`

Defined in: [src/plugins/readMeter.ts:103](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/readMeter.ts#L103)

Re-runs the calculation immediately (e.g. after content was swapped
in via AJAX, outside of a resize event) and re-renders/fires
`onUpdate` exactly like the initial run.

#### Returns

`void`
