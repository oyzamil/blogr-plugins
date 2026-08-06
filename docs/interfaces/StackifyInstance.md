[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / StackifyInstance

# Interface: StackifyInstance

Defined in: src/plugins/stackify.ts:130

Returned by [stackify](../functions/stackify.md).

## Extends

- [`PluginInstance`](PluginInstance.md)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: src/types.ts:18

Removes listeners/observers and undoes DOM changes made by the plugin.

#### Returns

`void`

#### Inherited from

[`PluginInstance`](PluginInstance.md).[`destroy`](PluginInstance.md#destroy)

***

### getActiveIndex()

> **getActiveIndex**(): `number`[]

Defined in: src/plugins/stackify.ts:142

Original index of the card currently in front, per matched stack (usually one).

#### Returns

`number`[]

***

### goTo()

> **goTo**(`originalIndex`): `void`

Defined in: src/plugins/stackify.ts:136

Brings the card at `originalIndex` (its position in the initial DOM order) to the front.

#### Parameters

##### originalIndex

`number`

#### Returns

`void`

***

### next()

> **next**(): `void`

Defined in: src/plugins/stackify.ts:132

Sends the current front card to the back; the next one becomes front.

#### Returns

`void`

***

### pause()

> **pause**(): `void`

Defined in: src/plugins/stackify.ts:140

Pauses the auto-cycle timer.

#### Returns

`void`

***

### play()

> **play**(): `void`

Defined in: src/plugins/stackify.ts:138

Resumes the auto-cycle timer.

#### Returns

`void`

***

### prev()

> **prev**(): `void`

Defined in: src/plugins/stackify.ts:134

Brings the back-most card to the front.

#### Returns

`void`
