# menuify

Turns a flat `<ul><li><a>` link list into a nested dropdown. Any link whose
text starts with the nesting prefix (`_` by default) is nested under the
previous non-prefixed link, and the prefix is stripped from the label.

```html
<ul id="menu">
	<li><a>Home</a></li>
	<li><a>Blog</a></li>
	<li><a>_Web Design</a></li>
	<li><a>_SEO</a></li>
	<li><a>Contact</a></li>
</ul>
```

```ts
import { menuify } from "blogr-plugins";

const instance = menuify("#menu");
// "Web Design" and "SEO" become a <ul class="sub-menu"> under "Blog"

instance.destroy(); // restores the flat list and removes the generated submenus
```

---

## `menuify(target, options?)`

```ts
function menuify(
	target: ElementInput,
	options?: MenuifyOptions,
): MenuifyInstance;
```

### `target`

A CSS selector, a single `Element`, an array/`NodeList` of elements, or a
jQuery collection — one menu instance per matched element.

### `options`

All options are optional.

| Option          | Type     | Default      | Description |
| --------------- | -------- | ------------ | ------------- |
| `nestingPrefix` | `string` | `"_"`        | Prefix marking a link as belonging to the previous item's submenu |
| `submenuClass`  | `string` | `"sub-menu"` | Class applied to generated `<ul>` submenus |
| `hasSubClass`   | `string` | `"has-sub"`  | Class applied to `<li>` items that received a submenu |

---

## Option details

### `nestingPrefix`

Any link whose text starts with this string is treated as a submenu item
for the previous non-prefixed link. The prefix is stripped from the displayed
text. Default is `"_"` — use `"_"` for a single underscore, `"--"` for
double-dash, etc.

### `submenuClass`

CSS class applied to generated `<ul>` elements that wrap the nested items.
Style with `.sub-menu` in your CSS (or whatever class name you set).

### `hasSubClass`

CSS class applied to `<li>` items that have a submenu. Useful for styling
the parent link differently (e.g. adding an arrow icon) to indicate a
dropdown.

---

## Return value — `MenuifyInstance`

```ts
interface MenuifyInstance {
	destroy(): void;
}
```

- **`destroy()`** — restores the flat list structure and removes every
  generated submenu `<ul>` and applied classes.

---

## Formats & builds

Like every plugin in this package, `menuify` ships in three forms:

- **ESM / CJS** (`import { menuify } from "blogr-plugins"`), for
  bundled projects.
- **Standalone IIFE** — `dist/menuify.js` — exposes
  `window.BlogrPlugins.menuify`, for a plain `<script>` tag with no
  build step.
- **jQuery bridge** — if `jQuery`/`$` is present on the page when the
  script loads, `$(selector).menuify(options)` is registered
  automatically.

```html
<script src="https://unpkg.com/blogr-plugins/dist/menuify.min.js"></script>
<script>
	BlogrPlugins.menuify("#menu");
	// or, with jQuery loaded first:
	$("#menu").menuify();
</script>
```