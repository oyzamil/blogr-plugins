[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / cookify

# Variable: cookify

> `const` **cookify**: [`Cookify`](../interfaces/Cookify.md)

Defined in: [src/plugins/cookify.ts:63](https://github.com/oyzamil/blogr-plugins/blob/8ead24b94d5a4e6ad2ececeab3afb6768104a8ff/src/plugins/cookify.ts#L63)

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
