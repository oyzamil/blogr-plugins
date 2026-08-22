[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / StackifyOptions

# Interface: StackifyOptions

Defined in: [src/plugins/stackify.ts:39](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L39)

Configuration options for [stackify](../functions/stackify.md).

## Properties

### activeClass?

> `optional` **activeClass?**: `string`

Defined in: [src/plugins/stackify.ts:96](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L96)

Class toggled on whichever card is currently in front. Default `"stackify-active"`.

***

### autoplay?

> `optional` **autoplay?**: `boolean`

Defined in: [src/plugins/stackify.ts:63](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L63)

Whether the auto-cycle timer starts immediately. Default `true`.

***

### cardClass?

> `optional` **cardClass?**: `string`

Defined in: [src/plugins/stackify.ts:98](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L98)

Class added to every card. Default `"stackify-card"`.

***

### clickToActivate?

> `optional` **clickToActivate?**: `boolean`

Defined in: [src/plugins/stackify.ts:86](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L86)

Clicking a non-front card brings it to the front. Default `true`.

***

### direction?

> `optional` **direction?**: [`StackDirection`](../type-aliases/StackDirection.md)

Defined in: [src/plugins/stackify.ts:69](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L69)

`"forward"` sends the front card to the back; `"backward"` brings the back card to the front. Applies to the auto-cycle timer. Default `"forward"`.

***

### draggable?

> `optional` **draggable?**: `boolean`

Defined in: [src/plugins/stackify.ts:92](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L92)

Lets the front card be dragged/swiped to advance/go back — along
whichever axis [orientation](#orientation) sets (top/bottom for vertical,
left/right for horizontal). Default `false`.

***

### duration?

> `optional` **duration?**: `number`

Defined in: [src/plugins/stackify.ts:65](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L65)

Transition duration, in ms, for a card moving between stack positions. Default `500`.

***

### easing?

> `optional` **easing?**: `string`

Defined in: [src/plugins/stackify.ts:67](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L67)

CSS timing function for that transition. Default `"ease"`.

***

### interval?

> `optional` **interval?**: `number`

Defined in: [src/plugins/stackify.ts:61](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L61)

Milliseconds between automatic cycles. `0` disables the timer (still cyclable via `next()`/`prev()`/`goTo()`). Default `3000`.

***

### layout?

> `optional` **layout?**: `"marquee"` \| `"stack"`

Defined in: [src/plugins/stackify.ts:107](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L107)

Stack layout: `"stack"` is the peeking-card-deck effect (default).
`"marquee"` lays cards out in a row (or column, see
[orientation](#orientation)) that scrolls continuously (speed set by
[marqueeSpeed](#marqueespeed)), like a ticker.

***

### marqueeSpeed?

> `optional` **marqueeSpeed?**: `number`

Defined in: [src/plugins/stackify.ts:118](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L118)

`"marquee"` layout only. Scroll speed in px/second. Default `60`.

***

### offset?

> `optional` **offset?**: `number`

Defined in: [src/plugins/stackify.ts:46](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L46)

Gap in px between cards. In `"stack"` layout this is how far a card
peeks past the one in front of it. In `"marquee"` layout it's the
gap between cards along the scroll axis — same option, both
layouts read it. Default `20`.

***

### onAfterChange?

> `optional` **onAfterChange?**: (`detail`) => `void`

Defined in: [src/plugins/stackify.ts:135](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L135)

Called once a cycle's transition has finished.

#### Parameters

##### detail

[`StackifyChangeDetail`](StackifyChangeDetail.md)

#### Returns

`void`

***

### onBeforeChange?

> `optional` **onBeforeChange?**: (`detail`) => `void`

Defined in: [src/plugins/stackify.ts:133](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L133)

Called right before a cycle starts (right as the transition begins).

#### Parameters

##### detail

[`StackifyChangeDetail`](StackifyChangeDetail.md)

#### Returns

`void`

***

### orientation?

> `optional` **orientation?**: [`StackOrientation`](../type-aliases/StackOrientation.md)

Defined in: [src/plugins/stackify.ts:76](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L76)

Which axis the layout runs on, and which axis dragging works on.
`"vertical"` peeks/drags top-to-bottom, `"horizontal"`
peeks/drags left-to-right. Default: `"vertical"` for
`layout: "stack"`, `"horizontal"` for `layout: "marquee"`.

***

### pauseOnHover?

> `optional` **pauseOnHover?**: `boolean`

Defined in: [src/plugins/stackify.ts:84](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L84)

Pause the auto-cycle timer while the pointer is over the stack, resuming on pointer-leave. Default `true`.

***

### peekWidth?

> `optional` **peekWidth?**: `"none"` \| `"expand"` \| `"shrink"`

Defined in: [src/plugins/stackify.ts:114](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L114)

`"stack"` layout only. Whether cards behind the front one grow
(`"expand"`) or shrink (`"shrink"`) in cross-axis size relative to
it, for a fanned-out peek effect. `"none"` keeps every card the
same size. Default `"none"`.

***

### peekWidthStep?

> `optional` **peekWidthStep?**: `number`

Defined in: [src/plugins/stackify.ts:116](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L116)

Size change, as a fraction per card, applied when [peekWidth](#peekwidth) is set. Default `0.05`.

***

### scaleStep?

> `optional` **scaleStep?**: `number`

Defined in: [src/plugins/stackify.ts:53](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L53)

Shrinks each card behind the front one by this fraction (e.g. `0.05`
= each card 5% smaller than the one in front of it) for a subtle
depth/fan effect. `0` keeps every card full size, matching a flat
peeking stack. Default `0`.

***

### size?

> `optional` **size?**: [`StackifySize`](StackifySize.md) \| [`StackifySizeByLayout`](StackifySizeByLayout.md)

Defined in: [src/plugins/stackify.ts:131](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L131)

Container height/width — purely opt-in. Plugin never measures
cards or auto-calcs a size; whichever axis you don't give stays
untouched (normal CSS/parent sizing applies). Number -> px,
string used as-is (e.g. `"20rem"`, `"100%"`).

Two shapes:
- Flat, applies regardless of [layout](#layout):
  `size: { height: "400px" }`
- Per-layout, only the block matching current `layout` applies:
  `size: { stack: { height: "400px" }, marquee: { width: "50%" } }`

***

### stackClass?

> `optional` **stackClass?**: `string`

Defined in: [src/plugins/stackify.ts:100](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L100)

Class added to the container. Default `"stackify-stack"`.

***

### stackDirection?

> `optional` **stackDirection?**: [`StackPeekDirection`](../type-aliases/StackPeekDirection.md)

Defined in: [src/plugins/stackify.ts:82](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L82)

`"stack"` layout only. Which side the peeking cards trail toward.
 Default: `"top"` for vertical [orientation](#orientation),
`"left"` for horizontal.

***

### startIndex?

> `optional` **startIndex?**: `number`

Defined in: [src/plugins/stackify.ts:94](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L94)

Original index of the card that starts in front. Default `0`.

***

### visibleCards?

> `optional` **visibleCards?**: `number`

Defined in: [src/plugins/stackify.ts:59](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stackify.ts#L59)

How many cards (counting the front one) stay visible at once; any
further back are faded to `opacity: 0` (still present, just hidden)
so a stack of 8 doesn't visually pile up. Default: every card.
