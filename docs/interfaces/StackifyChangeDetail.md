[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / StackifyChangeDetail

# Interface: StackifyChangeDetail

Defined in: src/plugins/stackify.ts:24

Detail object passed to `onBeforeChange`/`onAfterChange`.

## Properties

### fromCard

> **fromCard**: `HTMLElement`

Defined in: src/plugins/stackify.ts:30

The card element that was in front.

***

### fromIndex

> **fromIndex**: `number`

Defined in: src/plugins/stackify.ts:26

Original index (in DOM order) of the card that was in front.

***

### toCard

> **toCard**: `HTMLElement`

Defined in: src/plugins/stackify.ts:32

The card element that is now in front.

***

### toIndex

> **toIndex**: `number`

Defined in: src/plugins/stackify.ts:28

Original index (in DOM order) of the card that is now in front.
