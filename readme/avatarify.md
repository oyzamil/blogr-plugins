# avatarify

Auto-generates a [DiceBear](https://www.dicebear.com) avatar for every
commenter who doesn't already have one — built for Blogger's native comment
widget, where anonymous/no-photo commenters get a blank placeholder image.
Lazy-loads (only scans once the comment section nears the viewport) and
keeps watching with a `MutationObserver`, so comments added later —
pagination, "load more", async widgets — get avatars too.

```ts
import { avatarify } from "blogr-plugins";

const instance = avatarify({
	container: "#comments",
	usernameSelector: ".cmHr .n bdi",
	commentSelector: ".c",
	timestampSelector: ".d.dtTm",
	timestampAttribute: "data-datetime",
	avatarSelector: ".cmAv .im",
	setRandomAvatarForAll: true,
	avatarStyle: "thumbs",
});

instance.refresh(); // force an immediate rescan
instance.destroy(); // stop both observers (already-set avatars are left in place)
```

---

## `avatarify(config)`

```ts
function avatarify(config: AvatarifyConfig): AvatarifyInstance;
```

Unlike most plugins in this package, `avatarify` takes a single config
object rather than a separate target + options — `container` lives inside
that object.

### `config`

| Option | Type | Default | Description |
|---|---|---|---|
| `container` | `ElementInput` | see fallback note below | Root element watched by both observers |
| [`usernameSelector`](#required-selectors) | `string` | — | **Required.** Selector for the commenter's username element |
| [`commentSelector`](#required-selectors) | `string` | — | **Required.** Selector for the comment wrapper (used with `.closest()` from the username) |
| [`avatarSelector`](#required-selectors) | `string` | — | **Required.** Selector (relative to the comment) for the avatar element |
| [`timestampSelector`](#timestampselector--timestampattribute) | `string` | none | Selector (relative to the comment) for the timestamp element. Omit to leave timestamp out of the seed entirely |
| [`timestampAttribute`](#timestampselector--timestampattribute) | `string` | none | Attribute to read on the timestamp element (e.g. `"data-datetime"`); falls back to its text content |
| [`setRandomAvatarForAll`](#setrandomavatarforall) | `boolean` | `false` | `true` replaces every avatar, even ones with a real photo already |
| [`avatarStyle`](#avatarstyle--dicebearversion--apiurl) | `string` | `"thumbs"` | Any [DiceBear style](https://www.dicebear.com/styles) name |
| `emptyAvatarUrls` | `string[]` | Blogger's two blank URLs | Additional background-image/`src` substrings to treat as "blank" |
| [`dicebearVersion`](#avatarstyle--dicebearversion--apiurl) | `string` | `"7.x"` | DiceBear API version segment |
| [`apiUrl`](#avatarstyle--dicebearversion--apiurl) | `string` | none | Full URL template overriding DiceBear — `{style}`/`{seed}` are replaced |
| [`seed`](#seed) | `(username, timestamp) => string` | username + timestamp | Overrides how the per-comment seed string is built |
| `rootMargin` | `string` | `"0px"` | `rootMargin` for the lazy-load `IntersectionObserver` |
| `debounce` | `number` | `150` | Ms debounce applied to `MutationObserver`-triggered rescans |
| [`onAvatarSet`](#onavatarset--onerror) | `(detail) => void` | — | Called once per avatar actually set |
| [`onError`](#onavatarset--onerror) | `(message: string) => void` | `console.error` | Called on a recoverable issue (a selector matched nothing, etc) |

---

## Option details

### Required selectors

`usernameSelector`, `commentSelector`, and `avatarSelector` are required —
there's no sensible default since they depend entirely on your Blogger
comment template's markup.

If `container` is omitted, it falls back to the closest ancestor of the
first element matching `commentSelector`, then of the first element
matching `avatarSelector`, then to `document.body`.

### `timestampSelector` / `timestampAttribute`

Feed the comment's timestamp into the avatar seed alongside the username,
so two commenters with the same name (or the same commenter across
different posts) still get visually distinct avatars where a timestamp is
available. Omit `timestampSelector` to seed from the username alone.

### `setRandomAvatarForAll`

By default, only commenters whose avatar is currently one of Blogger's
blank placeholder images get a generated avatar. Set this to `true` to
overwrite every avatar, including commenters who already uploaded a real
photo.

### `avatarStyle` / `dicebearVersion` / `apiUrl`

`avatarStyle` picks which [DiceBear style](https://www.dicebear.com/styles)
to request (e.g. `"thumbs"`, `"identicon"`, `"bottts"`). `dicebearVersion`
controls the API version segment used when building the DiceBear URL.

Set `apiUrl` to bypass DiceBear entirely and point at your own avatar
service — the string is used as a template with `{style}` and `{seed}`
placeholders substituted in.

### `seed`

```ts
seed?: (username: string, timestamp: string | null) => string;
```

Overrides how the per-comment seed string is built before being sent to
the avatar service. Defaults to combining the username and timestamp (when
available).

### `onAvatarSet` / `onError`

`onAvatarSet` fires once per avatar actually set, useful for analytics or
custom post-processing. `onError` fires on a recoverable issue — e.g. one
of the selectors not matching anything for a given comment — and defaults
to `console.error` rather than throwing.

---

## Avatar element detection

The avatar element can be either an `<img>` (its `src` is set) or any other
element using a CSS `background-image` (set with `!important`, matching
Blogger's own `.im` avatar div convention) — detected automatically per
element.

---

## Return value — `AvatarifyInstance`

```ts
interface AvatarifyInstance {
	refresh(): void;
	destroy(): void;
}
```

- **`refresh()`** — forces an immediate rescan of the comment section.
- **`destroy()`** — stops both the `IntersectionObserver` and the
  `MutationObserver`; avatars already set are left in place.

---

## jQuery bridge

`avatarify` has no jQuery bridge — `container` lives inside its config
object rather than being the jQuery target, so call
`BlogrPlugins.avatarify({ ... })` directly either way.