[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / avatarify

# Function: avatarify()

> **avatarify**(`config`): [`AvatarifyInstance`](../interfaces/AvatarifyInstance.md)

Defined in: [src/plugins/avatarify.ts:589](https://github.com/oyzamil/blogr-plugins/blob/b86752cbcef20fc3f5f43d7f67adfc078e4c9868/src/plugins/avatarify.ts#L589)

Auto-generates a [DiceBear](https://www.dicebear.com) avatar for every
commenter who doesn't already have one — built for Blogger's native
comment widget, where anonymous/no-photo commenters get a blank
placeholder image. Each avatar lazy-loads independently (only fetched
once it nears the viewport) and a `MutationObserver` keeps watching so
comments added later — pagination, "load more", async widgets — get
avatars too.

## Parameters

### config

[`AvatarifyConfig`](../interfaces/AvatarifyConfig.md)

[AvatarifyConfig](../interfaces/AvatarifyConfig.md)

## Returns

[`AvatarifyInstance`](../interfaces/AvatarifyInstance.md)

An [AvatarifyInstance](../interfaces/AvatarifyInstance.md) — `destroy()` stops both observers
(already-set avatars are left in place); `refresh()` force-loads every
matched avatar immediately.

## Example

```ts
import { avatarify } from "blogr-plugins";

avatarify({
	container: "#comments",
	usernameSelector: ".cmHr .n bdi",
	commentSelector: ".c",
	timestampSelector: ".d.dtTm",
	timestampAttribute: "data-datetime",
	avatarSelector: ".cmAv .im",
	setRandomAvatarForAll: true,
	avatarStyle: "thumbs",
});
```
