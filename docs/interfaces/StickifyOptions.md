[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / StickifyOptions

# Interface: StickifyOptions

Defined in: [src/plugins/stickify.ts:18](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stickify.ts#L18)

Configuration options for [stickify](../functions/stickify.md).

## Properties

### additionalMarginBottom?

> `optional` **additionalMarginBottom?**: `number`

Defined in: [src/plugins/stickify.ts:24](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stickify.ts#L24)

Extra px gap kept below the sidebar before it stops at the container's end.

***

### additionalMarginTop?

> `optional` **additionalMarginTop?**: `number`

Defined in: [src/plugins/stickify.ts:22](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stickify.ts#L22)

Extra px gap kept above the sidebar while stuck.

***

### containerSelector?

> `optional` **containerSelector?**: `string`

Defined in: [src/plugins/stickify.ts:20](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stickify.ts#L20)

Selector for the sidebar's scroll container. Defaults to the sidebar's parent.

***

### defaultPosition?

> `optional` **defaultPosition?**: `string`

Defined in: [src/plugins/stickify.ts:38](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stickify.ts#L38)

Inline `position` applied to the sidebar itself before stickiness kicks in. Default `"relative"`.

***

### disableOnResponsiveLayouts?

> `optional` **disableOnResponsiveLayouts?**: `boolean`

Defined in: [src/plugins/stickify.ts:30](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stickify.ts#L30)

Disable stickiness when the sidebar no longer fits its container (e.g. stacked mobile layouts). Default `true`.

***

### minWidth?

> `optional` **minWidth?**: `number`

Defined in: [src/plugins/stickify.ts:28](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stickify.ts#L28)

Viewport width (px) below which stickiness is disabled entirely.

***

### sidebarBehavior?

> `optional` **sidebarBehavior?**: `"modern"` \| `"stick-to-top"` \| `"stick-to-bottom"`

Defined in: [src/plugins/stickify.ts:36](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stickify.ts#L36)

`"modern"` follows scroll direction the way a native sticky element
would. `"stick-to-top"` pins the top edge at `additionalMarginTop`.
`"stick-to-bottom"` pins the bottom edge to the viewport instead.

***

### updateSidebarHeight?

> `optional` **updateSidebarHeight?**: `boolean`

Defined in: [src/plugins/stickify.ts:26](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stickify.ts#L26)

Keep the sidebar's wrapper `min-height` in sync so the container never collapses. Default `true`.

***

### verbose?

> `optional` **verbose?**: `boolean`

Defined in: [src/plugins/stickify.ts:40](https://github.com/oyzamil/blogr-plugins/blob/65c02684e222f1835897abca8b42aab2b12c6582/src/plugins/stickify.ts#L40)

Log a note to the console when init is delayed because the viewport is under `minWidth`.
