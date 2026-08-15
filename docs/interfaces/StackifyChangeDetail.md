[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / StackifyChangeDetail

# Interface: StackifyChangeDetail

Defined in: [src/plugins/stackify.ts:23](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L23)

Detail object passed to `onBeforeChange`/`onAfterChange`.

## Properties

### fromCard

> **fromCard**: `HTMLElement`

Defined in: [src/plugins/stackify.ts:29](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L29)

The card element that was in front.

***

### fromIndex

> **fromIndex**: `number`

Defined in: [src/plugins/stackify.ts:25](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L25)

Original index (in DOM order) of the card that was in front.

***

### toCard

> **toCard**: `HTMLElement`

Defined in: [src/plugins/stackify.ts:31](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L31)

The card element that is now in front.

***

### toIndex

> **toIndex**: `number`

Defined in: [src/plugins/stackify.ts:27](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/stackify.ts#L27)

Original index (in DOM order) of the card that is now in front.
