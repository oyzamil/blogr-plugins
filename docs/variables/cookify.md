[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / cookify

# Variable: cookify

> `const` **cookify**: [`Cookify`](../interfaces/Cookify.md)

Defined in: [src/plugins/cookify.ts:63](https://github.com/oyzamil/blogr-plugins/blob/1b47abfb765f6fb33bbfc0cf6bdf277243f434b5/src/plugins/cookify.ts#L63)

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
