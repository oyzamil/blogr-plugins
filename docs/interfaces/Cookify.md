[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / Cookify

# Interface: Cookify

Defined in: src/plugins/cookify.ts:15

## Methods

### get()

> **get**\<`T`\>(`name`): `T` \| `undefined`

Defined in: src/plugins/cookify.ts:30

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

Defined in: src/plugins/cookify.ts:36

Reads every cookie.

#### Returns

`Record`\<`string`, `unknown`\>

Record containing all cookies.

***

### remove()

> **remove**(`name`, `options?`): `boolean`

Defined in: src/plugins/cookify.ts:44

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

Defined in: src/plugins/cookify.ts:23

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
