[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / StackifyChangeDetail

# Interface: StackifyChangeDetail

Defined in: [src/plugins/stackify.ts:27](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/stackify.ts#L27)

Detail object passed to `onBeforeChange`/`onAfterChange`.

## Properties

### fromCard

> **fromCard**: `HTMLElement`

Defined in: [src/plugins/stackify.ts:33](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/stackify.ts#L33)

The card element that was in front.

***

### fromIndex

> **fromIndex**: `number`

Defined in: [src/plugins/stackify.ts:29](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/stackify.ts#L29)

Original index (in DOM order) of the card that was in front.

***

### toCard

> **toCard**: `HTMLElement`

Defined in: [src/plugins/stackify.ts:35](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/stackify.ts#L35)

The card element that is now in front.

***

### toIndex

> **toIndex**: `number`

Defined in: [src/plugins/stackify.ts:31](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/stackify.ts#L31)

Original index (in DOM order) of the card that is now in front.
