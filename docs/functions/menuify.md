[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / menuify

# Function: menuify()

> **menuify**(`input`, `options?`): [`PluginInstance`](../interfaces/PluginInstance.md)

Defined in: [plugins/menuify.ts:46](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/menuify.ts#L46)

Converts a flat `<ul><li><a>` link list into a nested dropdown menu.
Any link whose text starts with the nesting prefix (default `_`) is moved
into a submenu under the previous non-prefixed link, and the prefix is
stripped from its visible text.

## Parameters

### input

[`ElementInput`](../type-aliases/ElementInput.md)

Selector, element(s), or jQuery collection for the menu list(s).

### options?

[`MenuifyOptions`](../interfaces/MenuifyOptions.md) = `{}`

[MenuifyOptions](../interfaces/MenuifyOptions.md)

## Returns

[`PluginInstance`](../interfaces/PluginInstance.md)

A [PluginInstance](../interfaces/PluginInstance.md) with `destroy()` to revert the DOM changes.

## Example

```html
<ul class="menu">
  <li><a>Home</a></li>
  <li><a>Blog</a></li>
  <li><a>_Web Design</a></li>
  <li><a>_SEO</a></li>
</ul>
```
```ts
import { menuify } from "blogr-plugins";
menuify(".menu");
// "Web Design" and "SEO" become a submenu nested under "Blog"
```
