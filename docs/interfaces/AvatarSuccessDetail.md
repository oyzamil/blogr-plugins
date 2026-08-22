[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / AvatarSuccessDetail

# Interface: AvatarSuccessDetail

Defined in: [src/plugins/avatarify.ts:76](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L76)

Detail passed to `onSuccess`.

## Extends

- [`AvatarSetDetail`](AvatarSetDetail.md)

## Properties

### avatarEl

> **avatarEl**: `Element`

Defined in: [src/plugins/avatarify.ts:72](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L72)

The element matched by `avatarSelector` that received the avatar.

#### Inherited from

[`AvatarSetDetail`](AvatarSetDetail.md).[`avatarEl`](AvatarSetDetail.md#avatarel)

***

### id

> **id**: `string`

Defined in: [src/plugins/avatarify.ts:80](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L80)

Stable id for this avatar: `avatarEl.id` if the element has one, else `"avatar-{index}"`.

***

### index

> **index**: `number`

Defined in: [src/plugins/avatarify.ts:78](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L78)

Increments once per avatar that actually finishes loading, in load order — use to log/track individual images.

***

### url

> **url**: `string`

Defined in: [src/plugins/avatarify.ts:68](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L68)

The generated avatar URL that was applied.

#### Inherited from

[`AvatarSetDetail`](AvatarSetDetail.md).[`url`](AvatarSetDetail.md#url)

***

### username

> **username**: `string`

Defined in: [src/plugins/avatarify.ts:66](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L66)

The username the avatar was generated for.

#### Inherited from

[`AvatarSetDetail`](AvatarSetDetail.md).[`username`](AvatarSetDetail.md#username)

***

### usernameEl

> **usernameEl**: `Element`

Defined in: [src/plugins/avatarify.ts:70](https://github.com/oyzamil/blogr-plugins/blob/c591c903e2e8cdb9fbed22a758f777d09510ea9f/src/plugins/avatarify.ts#L70)

The element matched by `usernameSelector`.

#### Inherited from

[`AvatarSetDetail`](AvatarSetDetail.md).[`usernameEl`](AvatarSetDetail.md#usernameel)
