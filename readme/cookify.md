# cookify

Small, dependency-free cookie utility (a typed replacement for the classic
`js-cookie` plugin). Values are JSON-encoded automatically, so you can store
strings, numbers, booleans, or plain objects/arrays.

```ts
import { cookify } from "blogr-plugins";

cookify.set("theme", "dark", { expiresDays: 365 });
cookify.get("theme");    // "dark"
cookify.getAll();        // { theme: "dark", ... }
cookify.remove("theme"); // true (it existed)
```

---

## API

### `set(name, value, options?)`

Writes a cookie.

```ts
cookify.set("user", { id: 123, name: "Alice" }, { expiresDays: 30 });
```

| Parameter | Type                | Description |
| --------- | ------------------- | ------------- |
| `name`    | `string`            | Cookie name |
| `value`   | any                 | Value to store (auto-JSON-encoded) |
| `options` | `CookieSetOptions`  | See options below |

#### `CookieSetOptions`

| Option      | Type     | Default   | Description |
| ----------- | -------- | --------- | ------------- |
| `expiresDays` | `number` | —         | Expiration in days from now |
| `path`      | `string` | `"/"`     | Cookie path |
| `domain`    | `string` | —         | Cookie domain |
| `secure`    | `boolean` | —         | HTTPS-only flag |
| `sameSite`  | `string` | `"Lax"`   | SameSite attribute |

---

### `get<T>(name)`

Reads and JSON-parses a cookie, returning `undefined` if not set.

```ts
const theme = cookify.get<string>("theme");
const user = cookify.get<{ id: number; name: string }>("user");
```

---

### `getAll()`

Returns every cookie as a `Record<string, unknown>`.

```ts
const allCookies = cookify.getAll();
// { theme: "dark", user: { id: 123, name: "Alice" }, ... }
```

---

### `remove(name, options?)`

Deletes a cookie. Returns `true` if it existed, `false` otherwise. Note:
`path` and `domain` must match what the cookie was originally set with.

```ts
const removed = cookify.remove("theme");
cookify.remove("user", { path: "/app", domain: "example.com" });
```

---

## Formats & builds

Like every plugin in this package, `cookify` ships in three forms:

- **ESM / CJS** (`import { cookify } from "blogr-plugins"`), for
  bundled projects.
- **Standalone IIFE** — `dist/cookify.js` — exposes
  `window.BlogrPlugins.cookify`, for a plain `<script>` tag with no
  build step.
- No jQuery bridge — `cookify` is a stateless utility, not a jQuery plugin.

```html
<script src="https://unpkg.com/blogr-plugins/dist/cookify.min.js"></script>
<script>
	const { cookify } = BlogrPlugins;
	cookify.set("theme", "dark", { expiresDays: 365 });
	console.log(cookify.get("theme")); // "dark"
</script>
```