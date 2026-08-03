[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / cookify

# Variable: cookify

> `const` **cookify**: [`Cookify`](../interfaces/Cookify.md)

Defined in: [plugins/cookify.ts:63](https://github.com/oyzamil/blogr-plugins/blob/fa7f5eae266e54892098130cd2f5ac5e41005e1c/src/plugins/cookify.ts#L63)

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
