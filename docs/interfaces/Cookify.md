[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / Cookify

# Interface: Cookify

Defined in: [src/plugins/cookify.ts:15](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/cookify.ts#L15)

## Methods

### get()

> **get**\<`T`\>(`name`): `T` \| `undefined`

Defined in: [src/plugins/cookify.ts:30](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/cookify.ts#L30)

Reads a cookie.

#### Type Parameters

##### T

`T` = `string`

#### Parameters

##### name

`string`

Cookie name.

#### Returns

`T` \| `undefined`

Parsed value, or `undefined` if not set.

***

### getAll()

> **getAll**(): `Record`\<`string`, `unknown`\>

Defined in: [src/plugins/cookify.ts:36](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/cookify.ts#L36)

Reads every cookie.

#### Returns

`Record`\<`string`, `unknown`\>

Record containing all cookies.

***

### remove()

> **remove**(`name`, `options?`): `boolean`

Defined in: [src/plugins/cookify.ts:44](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/cookify.ts#L44)

Deletes a cookie.

#### Parameters

##### name

`string`

Cookie name.

##### options?

`Pick`\<[`CookifySetOptions`](CookifySetOptions.md), `"path"` \| `"domain"`\>

Must match `path`/`domain` used when setting cookie.

#### Returns

`boolean`

`true` if cookie existed.

***

### set()

> **set**(`name`, `value`, `options?`): `void`

Defined in: [src/plugins/cookify.ts:23](https://github.com/oyzamil/blogr-plugins/blob/a92ff5e65bb0bdfd281fc9eabcd591cb092e5a70/src/plugins/cookify.ts#L23)

Writes a cookie.

#### Parameters

##### name

`string`

Cookie name.

##### value

`unknown`

Any JSON-serializable value.

##### options?

[`CookifySetOptions`](CookifySetOptions.md)

Configuration object.
See [CookifySetOptions](CookifySetOptions.md).

#### Returns

`void`
