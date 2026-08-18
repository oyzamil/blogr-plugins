# stickify

Sticks a sidebar to the viewport while scrolling, clamped to its container so
it never overflows the bottom. Full option-parity port of Theia Sticky
Sidebar — handles collapsible margins, floated multi-column layouts, and
responsive stacking the same way the original does.

```ts
import { stickify } from "blogr-plugins";

const instance = stickify(".leftSidebar, .content, .rightSidebar", {
	additionalMarginTop: 30,
	sidebarBehavior: "modern", // or "stick-to-top" / "stick-to-bottom"
});

instance.destroy(); // unbind scroll/resize/ResizeObserver, restore original styles
```

---

## `stickify(target, options?)`

```ts
function stickify(
	target: ElementInput,
	options?: StickifyOptions,
): StickifyInstance;
```

### `target`

A CSS selector, a single `Element`, an array/`NodeList` of elements, or a
jQuery collection — one sticky sidebar instance per matched element.

### `options`

All options are optional.

| Option                      | Type                                                  | Default      | Description |
| ----------------------------- | ------------------------------------------------------- | -------------- | ------------- |
| `containerSelector`           | `string`                                                | sidebar's parent | Scroll container to clamp against |
| `additionalMarginTop`         | `number`                                                | `0`            | Gap kept above the sidebar while stuck |
| `additionalMarginBottom`      | `number`                                                | `0`            | Gap kept below the sidebar before it stops |
| `minWidth`                    | `number`                                                | `0`            | Viewport width below which stickiness is disabled |
| `disableOnResponsiveLayouts`  | `boolean`                                               | `true`         | Disable when sidebar no longer fits its container |
| `sidebarBehavior`             | `"modern" \| "stick-to-top" \| "stick-to-bottom"`      | `"modern"`     | Which edge sticks, and where |
| `updateSidebarHeight`         | `boolean`                                               | `true`         | Keep the sidebar's `min-height` in sync so the container never collapses |
| `defaultPosition`             | `string`                                                | `"relative"`   | Inline `position` set on the sidebar before stickiness kicks in |
| `verbose`                     | `boolean`                                               | `false`        | Log a note when init is delayed by `minWidth` |

---

## Option details

### `containerSelector`

Scroll container to clamp the sidebar against. Defaults to the sidebar's *direct* parent.

> **Gotcha:** if you don't set `containerSelector`, the container defaults
> to the sidebar's *direct* parent. If that parent is exactly as tall as
> the sidebar (e.g. an `<aside>` wrapping only the sidebar), there's no
> extra room to stick into and the sidebar will just sit static. Point
> `containerSelector` at whatever taller wrapper holds both the sidebar and
> your main content column.

### `additionalMarginTop` / `additionalMarginBottom`

Gap kept above/below the sidebar while stuck, in pixels.

### `minWidth`

Viewport width (px) below which stickiness is disabled. Useful for responsive layouts where the sidebar stacks vertically on mobile.

### `disableOnResponsiveLayouts`

When `true`, stickiness automatically disables if the sidebar no longer fits inside its container (e.g. when viewport narrows and layout shifts to single-column).

### `sidebarBehavior`

Which edge of the sidebar sticks to the viewport:

- `"modern"` — sidebar sticks to the top while there's space, then to the bottom as it approaches the container's end
- `"stick-to-top"` — sidebar always sticks to the top
- `"stick-to-bottom"` — sidebar always sticks to the bottom

### `updateSidebarHeight`

When `true`, the plugin keeps the sidebar's `min-height` synchronized with its container's height, preventing the container from collapsing as the sidebar moves.

### `defaultPosition`

Inline `position` CSS value set on the sidebar before stickiness kicks in (e.g. `"relative"`, `"static"`). When the sidebar becomes sticky, its position becomes `"fixed"`.

### `verbose`

Log a console note if initialization is delayed by the `minWidth` check.

---

## Return value — `StickifyInstance`

```ts
interface StickifyInstance {
	destroy(): void;
}
```

- **`destroy()`** — unbinds all scroll/resize listeners, disconnects the `ResizeObserver`, and restores the sidebar's original inline styles.

---

## Formats & builds

Like every plugin in this package, `stickify` ships in three forms:

- **ESM / CJS** (`import { stickify } from "blogr-plugins"`), for
  bundled projects.
- **Standalone IIFE** — `dist/stickify.js` — exposes
  `window.BlogrPlugins.stickify`, for a plain `<script>` tag with no
  build step.
- **jQuery bridge** — if `jQuery`/`$` is present on the page when the
  script loads, `$(selector).stickify(options)` is registered
  automatically.

```html
<script src="https://unpkg.com/blogr-plugins/dist/stickify.min.js"></script>
<script>
	BlogrPlugins.stickify(".leftSidebar", { additionalMarginTop: 20 });
	// or, with jQuery loaded first:
	$(".leftSidebar").stickify({ additionalMarginTop: 20 });
</script>
```