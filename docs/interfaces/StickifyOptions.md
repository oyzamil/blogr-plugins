[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / StickifyOptions

# Interface: StickifyOptions

Defined in: [src/plugins/stickify.ts:17](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/stickify.ts#L17)

Configuration options for [stickify](../functions/stickify.md).

## Properties

### additionalMarginBottom?

> `optional` **additionalMarginBottom?**: `number`

Defined in: [src/plugins/stickify.ts:23](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/stickify.ts#L23)

Extra px gap kept below the sidebar before it stops at the container's end.

***

### additionalMarginTop?

> `optional` **additionalMarginTop?**: `number`

Defined in: [src/plugins/stickify.ts:21](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/stickify.ts#L21)

Extra px gap kept above the sidebar while stuck.

***

### containerSelector?

> `optional` **containerSelector?**: `string`

Defined in: [src/plugins/stickify.ts:19](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/stickify.ts#L19)

Selector for the sidebar's scroll container. Defaults to the sidebar's parent.

***

### defaultPosition?

> `optional` **defaultPosition?**: `string`

Defined in: [src/plugins/stickify.ts:37](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/stickify.ts#L37)

Inline `position` applied to the sidebar itself before stickiness kicks in. Default `"relative"`.

***

### disableOnResponsiveLayouts?

> `optional` **disableOnResponsiveLayouts?**: `boolean`

Defined in: [src/plugins/stickify.ts:29](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/stickify.ts#L29)

Disable stickiness when the sidebar no longer fits its container (e.g. stacked mobile layouts). Default `true`.

***

### minWidth?

> `optional` **minWidth?**: `number`

Defined in: [src/plugins/stickify.ts:27](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/stickify.ts#L27)

Viewport width (px) below which stickiness is disabled entirely.

***

### sidebarBehavior?

> `optional` **sidebarBehavior?**: `"modern"` \| `"stick-to-top"` \| `"stick-to-bottom"`

Defined in: [src/plugins/stickify.ts:35](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/stickify.ts#L35)

`"modern"` follows scroll direction the way a native sticky element
would. `"stick-to-top"` pins the top edge at `additionalMarginTop`.
`"stick-to-bottom"` pins the bottom edge to the viewport instead.

***

### updateSidebarHeight?

> `optional` **updateSidebarHeight?**: `boolean`

Defined in: [src/plugins/stickify.ts:25](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/stickify.ts#L25)

Keep the sidebar's wrapper `min-height` in sync so the container never collapses. Default `true`.

***

### verbose?

> `optional` **verbose?**: `boolean`

Defined in: [src/plugins/stickify.ts:39](https://github.com/oyzamil/blogr-plugins/blob/89c47a5392ebf2cd8b3a12bff3d2821cc0aae46d/src/plugins/stickify.ts#L39)

Log a note to the console when init is delayed because the viewport is under `minWidth`.
