[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / CookifySetOptions

# Interface: CookifySetOptions

Defined in: [src/plugins/cookify.ts:2](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/cookify.ts#L2)

Options accepted when writing a cookie with [cookify](../variables/cookify.md).

## Properties

### domain?

> `optional` **domain?**: `string`

Defined in: [src/plugins/cookify.ts:8](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/cookify.ts#L8)

Cookie domain.

***

### expiresDays?

> `optional` **expiresDays?**: `number`

Defined in: [src/plugins/cookify.ts:4](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/cookify.ts#L4)

Days until expiry. Omit for a session cookie.

***

### path?

> `optional` **path?**: `string`

Defined in: [src/plugins/cookify.ts:6](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/cookify.ts#L6)

Cookie path. Default `"/"`.

***

### sameSite?

> `optional` **sameSite?**: `"Strict"` \| `"Lax"` \| `"None"`

Defined in: [src/plugins/cookify.ts:12](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/cookify.ts#L12)

SameSite policy. Default `"Lax"`.

***

### secure?

> `optional` **secure?**: `boolean`

Defined in: [src/plugins/cookify.ts:10](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/cookify.ts#L10)

Send only over HTTPS.
