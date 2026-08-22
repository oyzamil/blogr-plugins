[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / AvatarifyConfig

# Interface: AvatarifyConfig

Defined in: [src/plugins/avatarify.ts:84](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L84)

Configuration for [avatarify](../functions/avatarify.md).

## Properties

### apiUrl?

> `optional` **apiUrl?**: `string`

Defined in: [src/plugins/avatarify.ts:148](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L148)

Full URL template overriding DiceBear entirely — `{style}` and
`{seed}` are replaced (seed is pre-encoded). Use this to point at a
self-hosted avatar service instead.

***

### avatarAttribute?

> `optional` **avatarAttribute?**: `"src"` \| `"background-image"`

Defined in: [src/plugins/avatarify.ts:123](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L123)

Forces how avatar gets applied: `"src"` sets `src` attr,
`"background-image"` sets inline `background-image` style. Omit for
auto-detect: elements with `avatarDataAttribute` set or non-`<img>`
tags get `background-image`, plain `<img>` tags get `src`.

***

### avatarDataAttribute?

> `optional` **avatarDataAttribute?**: `string`

Defined in: [src/plugins/avatarify.ts:130](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L130)

Data-attribute NAME that holds a real avatar url directly (Blogger
lazy-src style, e.g. `data-image="//..."`). Checked before `src`/css
bg when reading the current image. Default `"data-avatar"` — set
this to match your markup, e.g. `"data-image"`.

***

### avatarSelector

> **avatarSelector**: `string`

Defined in: [src/plugins/avatarify.ts:98](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L98)

Selector (relative to a comment element) for the profile-picture element. **Required.**

***

### avatarStyle?

> `optional` **avatarStyle?**: [`AvatarStyle`](../type-aliases/AvatarStyle.md)

Defined in: [src/plugins/avatarify.ts:132](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L132)

DiceBear style to request. Default `"thumbs"`.

***

### commentSelector

> **commentSelector**: `string`

Defined in: [src/plugins/avatarify.ts:96](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L96)

Selector for the comment element that wraps one username + timestamp + avatar. **Required.**

***

### container?

> `optional` **container?**: [`ElementInput`](../type-aliases/ElementInput.md)

Defined in: [src/plugins/avatarify.ts:92](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L92)

Root element to watch (selector, element(s), or jQuery collection).
The `MutationObserver` (detect dynamically-added comments) watches
this element. Optional — if omitted, falls back to the closest
ancestor of the first element matching `commentSelector`, then of the
first element matching `avatarSelector`, then to `document.body`.

***

### debounce?

> `optional` **debounce?**: `number`

Defined in: [src/plugins/avatarify.ts:163](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L163)

Debounce (ms) applied to `MutationObserver`-triggered rescans, so a batch of DOM changes only triggers one pass. Default `150`.

***

### dicebearVersion?

> `optional` **dicebearVersion?**: `string`

Defined in: [src/plugins/avatarify.ts:142](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L142)

DiceBear API version segment. Default `"7.x"`.

***

### emptyAvatarPatterns?

> `optional` **emptyAvatarPatterns?**: (`string` \| `RegExp`)[]

Defined in: [src/plugins/avatarify.ts:140](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L140)

Background-image/`src` substrings that count as "no avatar set" —
checked with `.includes()`. Extend this if your theme's blank
placeholder isn't one of the two Blogger defaults already covered.
An avatar with no image at all (`background-image: none` / no `src`)
always counts as empty regardless of this list.

***

### onAvatarSet?

> `optional` **onAvatarSet?**: (`detail`) => `void`

Defined in: [src/plugins/avatarify.ts:165](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L165)

Called once per avatar actually set (fires right after the url is assigned to the DOM).

#### Parameters

##### detail

[`AvatarSetDetail`](AvatarSetDetail.md)

#### Returns

`void`

***

### onError?

> `optional` **onError?**: (`message`) => `void`

Defined in: [src/plugins/avatarify.ts:173](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L173)

Called on a recoverable issue (selector matched nothing, etc). Defaults to `console.error`.

#### Parameters

##### message

`string`

#### Returns

`void`

***

### onSuccess?

> `optional` **onSuccess?**: (`detail`) => `void`

Defined in: [src/plugins/avatarify.ts:171](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L171)

Called once per avatar, separately, after its image actually finishes
loading (real success — not just DOM assignment). Gets `index`/`id`
so you can tell which avatar loaded.

#### Parameters

##### detail

[`AvatarSuccessDetail`](AvatarSuccessDetail.md)

#### Returns

`void`

***

### rootMargin?

> `optional` **rootMargin?**: `string`

Defined in: [src/plugins/avatarify.ts:161](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L161)

`rootMargin` for each avatar's own lazy-load `IntersectionObserver` —
every avatar loads independently once it nears the viewport, so only
on-screen (or about-to-be) avatars ever fetch. Default `"0px"`.

***

### seed?

> `optional` **seed?**: (`username`, `timestamp`) => `string`

Defined in: [src/plugins/avatarify.ts:155](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L155)

Overrides how the per-comment seed string is built. Default: the
username alone when `avatarStyle` is `"initials"`, otherwise the
username with the timestamp appended (so re-commenting the same text
still gets a distinct avatar per comment).

#### Parameters

##### username

`string`

##### timestamp

`string`

#### Returns

`string`

***

### setRandomAvatarForAll?

> `optional` **setRandomAvatarForAll?**: `boolean`

Defined in: [src/plugins/avatarify.ts:116](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L116)

`true` replaces every avatar, even ones that already have a real
image. `false` (default) leaves real avatars' image alone but still
re-applies them onto `avatarAttribute`'s target (src/background-image)
if that differs from where the image currently lives.

***

### timestampAttribute?

> `optional` **timestampAttribute?**: `string`

Defined in: [src/plugins/avatarify.ts:109](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L109)

Attribute on the timestamp element to read (e.g. `"data-datetime"`).
Omitted/falsy reads the element's text content instead.

***

### timestampSelector?

> `optional` **timestampSelector?**: `string`

Defined in: [src/plugins/avatarify.ts:104](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L104)

Selector (relative to a comment element) for the timestamp element.
Omit to leave the timestamp out of the avatar seed entirely (every
comment from the same username then gets the same avatar).

***

### usernameSelector

> **usernameSelector**: `string`

Defined in: [src/plugins/avatarify.ts:94](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L94)

Selector (relative to a comment element) for the commenter's username. **Required.**
