[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / MarqifyOptions

# Interface: MarqifyOptions

Defined in: [src/plugins/marqify.ts:21](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L21)

Configuration for [marqify](../functions/marqify.md).

## Properties

### autoPlay?

> `optional` **autoPlay?**: `boolean`

Defined in: [src/plugins/marqify.ts:57](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L57)

Ticker only. Auto-advances to the next item on a timer. Default `true`.

***

### delayBeforeStart?

> `optional` **delayBeforeStart?**: `number`

Defined in: [src/plugins/marqify.ts:36](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L36)

Delay, in ms, before the marquee starts moving. `0` (default) means no delay. Marquee only.

***

### direction?

> `optional` **direction?**: [`MarqifyDirection`](../type-aliases/MarqifyDirection.md)

Defined in: [src/plugins/marqify.ts:34](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L34)

Which way content moves. For `type: "marquee"` only `"left"` /
`"right"` are valid (anything else falls back to `"left"` with a
warning). For `type: "ticker"` all four are valid. Default `"left"`.

***

### duplicated?

> `optional` **duplicated?**: `boolean`

Defined in: [src/plugins/marqify.ts:43](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L43)

Duplicates the container's content so the marquee loops seamlessly
with no visible reset. `false` renders the content once with no
duplication — the animation still runs, but jumps back to the start
every cycle instead of looping smoothly. Default `true`. Marquee only.

***

### interval?

> `optional` **interval?**: `number`

Defined in: [src/plugins/marqify.ts:59](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L59)

Ticker only. Ms between auto-advances when `autoPlay` is on. Default `3000`.

***

### pauseOnHover?

> `optional` **pauseOnHover?**: `boolean`

Defined in: [src/plugins/marqify.ts:45](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L45)

Pauses the marquee while the pointer is over it. Default `true`. Marquee only. Also pauses ticker autoplay on hover.

***

### speed?

> `optional` **speed?**: [`MarqifySpeed`](../type-aliases/MarqifySpeed.md)

Defined in: [src/plugins/marqify.ts:55](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L55)

`"slow"` / `"medium"` / `"fast"` map to `0.25` / `0.5` / `1`
respectively (higher = faster); pass a number directly for finer
control. Default `"medium"`.

For `type: "ticker"` this instead controls the slide transition —
`"slow"` / `"medium"` / `"fast"` map to `800` / `500` / `300` ms;
pass a number directly to set the transition duration in ms.

***

### type?

> `optional` **type?**: [`MarqifyType`](../type-aliases/MarqifyType.md)

Defined in: [src/plugins/marqify.ts:28](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/marqify.ts#L28)

`"marquee"` scrolls content continuously and seamlessly.
`"ticker"` shows one item at a time, sliding to the next/previous
item — either on its own timer or via [MarqifyInstance.next](MarqifyInstance.md#next)
and [MarqifyInstance.previous](MarqifyInstance.md#previous). Default `"marquee"`.
