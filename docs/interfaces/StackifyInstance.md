[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / StackifyInstance

# Interface: StackifyInstance

Defined in: [src/plugins/stackify.ts:129](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L129)

Returned by [stackify](../functions/stackify.md).

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

### getActiveIndex()

> **getActiveIndex**(): `number`[]

Defined in: [src/plugins/stackify.ts:141](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L141)

Original index of the card currently in front, per matched stack (usually one).

#### Returns

`number`[]

***

### goTo()

> **goTo**(`originalIndex`): `void`

Defined in: [src/plugins/stackify.ts:135](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L135)

Brings the card at `originalIndex` (its position in the initial DOM order) to the front.

#### Parameters

##### originalIndex

`number`

#### Returns

`void`

***

### next()

> **next**(): `void`

Defined in: [src/plugins/stackify.ts:131](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L131)

Sends the current front card to the back; the next one becomes front.

#### Returns

`void`

***

### pause()

> **pause**(): `void`

Defined in: [src/plugins/stackify.ts:139](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L139)

Pauses the auto-cycle timer.

#### Returns

`void`

***

### play()

> **play**(): `void`

Defined in: [src/plugins/stackify.ts:137](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L137)

Resumes the auto-cycle timer.

#### Returns

`void`

***

### prev()

> **prev**(): `void`

Defined in: [src/plugins/stackify.ts:133](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L133)

Brings the back-most card to the front.

#### Returns

`void`
