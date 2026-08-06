[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / MenuifyOptions

# Interface: MenuifyOptions

Defined in: src/plugins/menuify.ts:6

Configuration options for [menuify](../functions/menuify.md).

## Properties

### chevronText?

> `optional` **chevronText?**: `string`

Defined in: src/plugins/menuify.ts:14

Chevron element text. Default `"<"`.

***

### hasSubClass?

> `optional` **hasSubClass?**: `string`

Defined in: src/plugins/menuify.ts:12

Class applied to `<li>` items that received a submenu. Default `"has-sub"`.

***

### nestingPrefix?

> `optional` **nestingPrefix?**: `string`

Defined in: src/plugins/menuify.ts:8

Prefix marking a link as belonging to the previous item's submenu. Default `"_"`.

***

### submenuClass?

> `optional` **submenuClass?**: `string`

Defined in: src/plugins/menuify.ts:10

Class applied to generated `<ul>` submenus. Default `"sub-menu"`.
