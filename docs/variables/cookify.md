[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / cookify

# Variable: cookify

> `const` **cookify**: [`Cookify`](../interfaces/Cookify.md)

Defined in: [src/plugins/cookify.ts:63](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/cookify.ts#L63)

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
