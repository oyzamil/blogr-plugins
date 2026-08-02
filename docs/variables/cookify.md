[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / cookify

# Variable: cookify

> `const` **cookify**: [`Cookify`](../interfaces/Cookify.md)

Defined in: [plugins/cookify.ts:62](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/cookify.ts#L62)

Small, dependency-free cookie utility (a typed replacement for the classic
`js-cookie` plugin). Values are JSON-encoded automatically, so you can
store strings, numbers, booleans, or plain objects/arrays.

## Example

```ts
import { cookify } from "blogr-plugins";
cookify.set("theme", "dark", { expiresDays: 365 });
cookify.get("theme"); // "dark"
cookify.remove("theme");
```
