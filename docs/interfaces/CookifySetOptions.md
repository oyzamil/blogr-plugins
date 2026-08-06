[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / CookifySetOptions

# Interface: CookifySetOptions

Defined in: src/plugins/cookify.ts:2

Options accepted when writing a cookie with [cookify](../variables/cookify.md).

## Properties

### domain?

> `optional` **domain?**: `string`

Defined in: src/plugins/cookify.ts:8

Cookie domain.

***

### expiresDays?

> `optional` **expiresDays?**: `number`

Defined in: src/plugins/cookify.ts:4

Days until expiry. Omit for a session cookie.

***

### path?

> `optional` **path?**: `string`

Defined in: src/plugins/cookify.ts:6

Cookie path. Default `"/"`.

***

### sameSite?

> `optional` **sameSite?**: `"Strict"` \| `"Lax"` \| `"None"`

Defined in: src/plugins/cookify.ts:12

SameSite policy. Default `"Lax"`.

***

### secure?

> `optional` **secure?**: `boolean`

Defined in: src/plugins/cookify.ts:10

Send only over HTTPS.
