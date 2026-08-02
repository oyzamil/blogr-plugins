[**blogr-plugins**](../README.md)

***

[blogr-plugins](../globals.md) / Cookify

# Interface: Cookify

Defined in: [plugins/cookify.ts:15](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/cookify.ts#L15)

## Methods

### get()

> **get**\<`T`\>(`name`): `T` \| `undefined`

Defined in: [plugins/cookify.ts:29](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/cookify.ts#L29)

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

Defined in: [plugins/cookify.ts:35](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/cookify.ts#L35)

Reads every cookie.

#### Returns

`Record`\<`string`, `unknown`\>

Record containing all cookies.

***

### remove()

> **remove**(`name`, `options?`): `boolean`

Defined in: [plugins/cookify.ts:43](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/cookify.ts#L43)

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

Defined in: [plugins/cookify.ts:22](https://github.com/oyzamil/blogr-plugins/blob/7c9761d7144e5f99842f890efb3515619017d4ea/src/plugins/cookify.ts#L22)

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

[CookifySetOptions](CookifySetOptions.md)

#### Returns

`void`
