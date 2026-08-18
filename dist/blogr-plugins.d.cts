//#region src/types.d.ts
/**
 * Anything a plugin accepts as its target: a CSS selector, a single element,
 * a list of elements, or a jQuery collection (if jQuery is on the page).
 */
type ElementInput = string | Element | Element[] | NodeListOf<Element> | ArrayLike<Element>;
/**
 * Common shape returned by every plugin instance so callers always have a
 * predictable way to tear a plugin down.
 */
interface PluginInstance {
  /** Removes listeners/observers and undoes DOM changes made by the plugin. */
  destroy(): void;
}
//#endregion
//#region src/plugins/adsenseLoader.d.ts
/** Configuration for {@link adsenseLoader}. */
interface AdsenseLoaderOptions {
  /**
   * Start loading this many pixels before the wrapper enters the
   * viewport. Default `"200px"`.
   */
  rootMargin?: string;
  /** `IntersectionObserver` threshold. Default `0`. */
  threshold?: number | number[];
  /** Watch for wrapper elements inserted after init (e.g. infinite-scroll posts). Default `true`. */
  observeMutations?: boolean;
  /** Root element to scan/observe within. Default `document.body`. */
  container?: Element | Document;
  /**
   * Media query that decides which of `data-mobile-size` /
   * `data-pc-size` a wrapper resolves to. Default
   * `"(max-width: 767px)"`.
   */
  mobileBreakpoint?: string;
  /**
   * If the ad comes back unfilled or fails to load, remove the wrapper
   * from the DOM entirely (matching the old plugin's behavior) rather
   * than leaving a dead, empty slot. Default `true`.
   */
  removeOnUnfilled?: boolean;
  /** Called right before a wrapper's ad starts loading. */
  onLoad?: (wrapper: HTMLElement) => void;
  /** Called once a wrapper's ad has actually filled. */
  onFilled?: (wrapper: HTMLElement) => void;
  /**
   * Called when a wrapper's ad comes back unfilled or fails to load —
   * right before it's removed (if `removeOnUnfilled` is on). Use this
   * for a fallback instead of relying on the (about to be gone) wrapper.
   */
  onUnfilled?: (wrapper: HTMLElement) => void;
}
/** Returned by {@link adsenseLoader}. */
type AdsenseLoaderInstance = PluginInstance;
/**
 * Lazy-loads AdSense units wrapped in a container div — `<div
 * class="adsense"><ins class="adsbygoogle" ...></ins></div>` — right as
 * each one is about to enter the viewport, using `IntersectionObserver`
 * instead of scroll/resize polling.
 *
 * Also supports responsive sizing: give a wrapper `data-mobile-size`
 * and/or `data-pc-size` listing candidate sizes as `heightxwidth` pairs
 * (height first), and the plugin picks the best-fitting one for the
 * current breakpoint/width and applies it to the wrapper directly —
 * before the ad loads, so it never resizes an already-filled ad (see the
 * policy note below).
 *
 * ```html
 * <div class="adsense"
 * 	data-mobile-size="['50x320', '100x320']"
 * 	data-pc-size="['90x728', '250x300']">
 * 	<ins class="adsbygoogle"
 * 		data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
 * 		data-ad-slot="9964452094"></ins>
 * </div>
 * ```
 *
 * > **On ad refresh:** AdSense's publisher policy does not permit
 * > programmatically refreshing an already-served ad. This plugin
 * > resizes a wrapper's own CSS box before its ad loads — it never
 * > touches, resizes, or reloads an ad that has already filled.
 *
 * @param input - Selector, element(s), or jQuery collection for the
 * `.adsense`-style wrapper(s) to lazy-load.
 * @param options - {@link AdsenseLoaderOptions}
 * @returns An {@link AdsenseLoaderInstance} — `destroy()` disconnects
 * every observer and restores any wrapper that never filled to its
 * original markup (filled ads are left exactly as AdSense rendered them).
 *
 * @example
 * ```ts
 * import { adsenseLoader } from "blogr-plugins";
 *
 * adsenseLoader(".adsense", {
 * 	rootMargin: "200px",
 * 	onFilled: (wrapper) => wrapper.classList.add("adsense--loaded"),
 * 	onUnfilled: (wrapper) => console.log("no fill for", wrapper),
 * });
 * ```
 */
declare function adsenseLoader(input: ElementInput, options?: AdsenseLoaderOptions): AdsenseLoaderInstance;
//#endregion
//#region src/plugins/avatarify.d.ts
/**
 * Any [DiceBear](https://www.dicebear.com/styles) style name (`"thumbs"`,
 * `"bottts"`, `"initials"`, `"identicon"`, ...). Kept as a plain `string`
 * rather than a strict union so new DiceBear styles work without a type
 * update.
 */
type AvatarStyle = "adventurer" | "adventurer-neutral" | "avataaars" | "avataaars-neutral" | "big-ears" | "big-ears-neutral" | "big-smile" | "blobs" | "bottts" | "bottts-neutral" | "clay" | "constellation" | "critters" | "croodles" | "croodles-neutral" | "disco" | "dylan" | "fun-emoji" | "glass" | "glyphs" | "icons" | "identicon" | "initial-face" | "initials" | "landscape" | "loops" | "lorelei" | "lorelei-neutral" | "micah" | "miniavs" | "moods" | "notionists" | "notionists-neutral" | "open-peeps" | "personas" | "pixel-art" | "pixel-art-neutral" | "pixelbot" | "planets" | "rings" | "shape-grid" | "shapes" | "sprouts" | "squircles" | "stripes" | "thumbs" | "toon-head" | "triangles" | "waves" | "weave";
/** Detail passed to `onAvatarSet`. */
interface AvatarSetDetail {
  /** The username the avatar was generated for. */
  username: string;
  /** The generated avatar URL that was applied. */
  url: string;
  /** The element matched by `usernameSelector`. */
  usernameEl: Element;
  /** The element matched by `avatarSelector` that received the avatar. */
  avatarEl: Element;
}
/** Detail passed to `onSuccess`. */
interface AvatarSuccessDetail extends AvatarSetDetail {
  /** Increments once per avatar that actually finishes loading, in load order — use to log/track individual images. */
  index: number;
  /** Stable id for this avatar: `avatarEl.id` if the element has one, else `"avatar-{index}"`. */
  id: string;
}
/** Configuration for {@link avatarify}. */
interface AvatarifyConfig {
  /**
   * Root element to watch (selector, element(s), or jQuery collection).
   * The `MutationObserver` (detect dynamically-added comments) watches
   * this element. Optional — if omitted, falls back to the closest
   * ancestor of the first element matching `commentSelector`, then of the
   * first element matching `avatarSelector`, then to `document.body`.
   */
  container?: ElementInput;
  /** Selector (relative to a comment element) for the commenter's username. **Required.** */
  usernameSelector: string;
  /** Selector for the comment element that wraps one username + timestamp + avatar. **Required.** */
  commentSelector: string;
  /** Selector (relative to a comment element) for the profile-picture element. **Required.** */
  avatarSelector: string;
  /**
   * Selector (relative to a comment element) for the timestamp element.
   * Omit to leave the timestamp out of the avatar seed entirely (every
   * comment from the same username then gets the same avatar).
   */
  timestampSelector?: string;
  /**
   * Attribute on the timestamp element to read (e.g. `"data-datetime"`).
   * Omitted/falsy reads the element's text content instead.
   */
  timestampAttribute?: string;
  /**
   * `true` replaces every avatar, even ones that already have a real
   * image. `false` (default) leaves real avatars' image alone but still
   * re-applies them onto `avatarAttribute`'s target (src/background-image)
   * if that differs from where the image currently lives.
   */
  setRandomAvatarForAll?: boolean;
  /**
   * Forces how avatar gets applied: `"src"` sets `src` attr,
   * `"background-image"` sets inline `background-image` style. Omit for
   * auto-detect: elements with `avatarDataAttribute` set or non-`<img>`
   * tags get `background-image`, plain `<img>` tags get `src`.
   */
  avatarAttribute?: "src" | "background-image";
  /**
   * Data-attribute NAME that holds a real avatar url directly (Blogger
   * lazy-src style, e.g. `data-image="//..."`). Checked before `src`/css
   * bg when reading the current image. Default `"data-avatar"` — set
   * this to match your markup, e.g. `"data-image"`.
   */
  avatarDataAttribute?: string;
  /** DiceBear style to request. Default `"thumbs"`. */
  avatarStyle?: AvatarStyle;
  /**
   * Background-image/`src` substrings that count as "no avatar set" —
   * checked with `.includes()`. Extend this if your theme's blank
   * placeholder isn't one of the two Blogger defaults already covered.
   * An avatar with no image at all (`background-image: none` / no `src`)
   * always counts as empty regardless of this list.
   */
  emptyAvatarPatterns?: (string | RegExp)[];
  /** DiceBear API version segment. Default `"7.x"`. */
  dicebearVersion?: string;
  /**
   * Full URL template overriding DiceBear entirely — `{style}` and
   * `{seed}` are replaced (seed is pre-encoded). Use this to point at a
   * self-hosted avatar service instead.
   */
  apiUrl?: string;
  /**
   * Overrides how the per-comment seed string is built. Default: the
   * username alone when `avatarStyle` is `"initials"`, otherwise the
   * username with the timestamp appended (so re-commenting the same text
   * still gets a distinct avatar per comment).
   */
  seed?: (username: string, timestamp: string) => string;
  /**
   * `rootMargin` for each avatar's own lazy-load `IntersectionObserver` —
   * every avatar loads independently once it nears the viewport, so only
   * on-screen (or about-to-be) avatars ever fetch. Default `"0px"`.
   */
  rootMargin?: string;
  /** Debounce (ms) applied to `MutationObserver`-triggered rescans, so a batch of DOM changes only triggers one pass. Default `150`. */
  debounce?: number;
  /** Called once per avatar actually set (fires right after the url is assigned to the DOM). */
  onAvatarSet?: (detail: AvatarSetDetail) => void;
  /**
   * Called once per avatar, separately, after its image actually finishes
   * loading (real success — not just DOM assignment). Gets `index`/`id`
   * so you can tell which avatar loaded.
   */
  onSuccess?: (detail: AvatarSuccessDetail) => void;
  /** Called on a recoverable issue (selector matched nothing, etc). Defaults to `console.error`. */
  onError?: (message: string) => void;
}
/** Returned by {@link avatarify}. */
interface AvatarifyInstance extends PluginInstance {
  /** Forces an immediate load of every matched avatar, bypassing the debounce and the per-avatar in-view gate. */
  refresh(): void;
}
/**
 * Auto-generates a [DiceBear](https://www.dicebear.com) avatar for every
 * commenter who doesn't already have one — built for Blogger's native
 * comment widget, where anonymous/no-photo commenters get a blank
 * placeholder image. Each avatar lazy-loads independently (only fetched
 * once it nears the viewport) and a `MutationObserver` keeps watching so
 * comments added later — pagination, "load more", async widgets — get
 * avatars too.
 *
 * @param config - {@link AvatarifyConfig}
 * @returns An {@link AvatarifyInstance} — `destroy()` stops both observers
 * (already-set avatars are left in place); `refresh()` force-loads every
 * matched avatar immediately.
 *
 * @example
 * ```ts
 * import { avatarify } from "blogr-plugins";
 *
 * avatarify({
 * 	container: "#comments",
 * 	usernameSelector: ".cmHr .n bdi",
 * 	commentSelector: ".c",
 * 	timestampSelector: ".d.dtTm",
 * 	timestampAttribute: "data-datetime",
 * 	avatarSelector: ".cmAv .im",
 * 	setRandomAvatarForAll: true,
 * 	avatarStyle: "thumbs",
 * });
 * ```
 */
declare function avatarify(config: AvatarifyConfig): AvatarifyInstance;
//#endregion
//#region src/plugins/cookify.d.ts
/** Options accepted when writing a cookie with {@link cookify}. */
interface CookifySetOptions {
  /** Days until expiry. Omit for a session cookie. */
  expiresDays?: number;
  /** Cookie path. Default `"/"`. */
  path?: string;
  /** Cookie domain. */
  domain?: string;
  /** Send only over HTTPS. */
  secure?: boolean;
  /** SameSite policy. Default `"Lax"`. */
  sameSite?: "Strict" | "Lax" | "None";
}
interface Cookify {
  /**
   * Writes a cookie.
   * @param name - Cookie name.
   * @param value - Any JSON-serializable value.
   * @param options Configuration object.
   * See {@link CookifySetOptions}.
   */
  set(name: string, value: unknown, options?: CookifySetOptions): void;
  /**
   * Reads a cookie.
   * @param name - Cookie name.
   * @returns Parsed value, or `undefined` if not set.
   */
  get<T = string>(name: string): T | undefined;
  /**
   * Reads every cookie.
   * @returns Record containing all cookies.
   */
  getAll(): Record<string, unknown>;
  /**
   * Deletes a cookie.
   * @param name - Cookie name.
   * @param options - Must match `path`/`domain` used when setting cookie.
   * @returns `true` if cookie existed.
   */
  remove(name: string, options?: Pick<CookifySetOptions, "path" | "domain">): boolean;
}
/**
 * Small, dependency-free cookie utility (a typed replacement for the classic
 * `js-cookie` plugin). Values are JSON-encoded automatically, so you can
 * store strings, numbers, booleans, or plain objects/arrays.
 *
 * @example
 * ```ts
 * import { cookify } from "blogr-plugins";
 * cookify.set("theme", "dark", { expiresDays: 365 });
 * cookify.get("theme"); // "dark"
 * cookify.remove("theme");
 * ```
 */
declare const cookify: Cookify;
//#endregion
//#region node_modules/blogr/dist/blogr.d.ts
//#region src/types/feed.d.ts
/** An author of a post, page, comment or the blog itself. */
interface Author {
  /** Display name of the author, or `null` if unavailable. */
  name: string | null;
  /** Profile URL of the author, or `null` if unavailable. */
  url: string | null;
  /** Avatar/profile image URL of the author, or `null` if unavailable. */
  image: string | null;
}
/** A single `<link>` entry as reported by the feed. */
interface Link {
  rel: string;
  href: string;
  type: string | null;
  title: string | null;
}
/** Geo-location info attached to a post, if any. */
interface Geo {
  box: string | null;
  featureName: string | null;
  point: string | null;
}
/** Extra info attached to a comment entry. */
interface Extended {
  /** CSS class assigned to the commenter, if any. */
  class: string | null;
  /** Human formatted publish time, if any. */
  time: string | null;
  /** Whether the comment has been removed/moderated. */
  removed: boolean;
}
/** Metadata about comments attached to a post. */
interface PostCommentInfo {
  feed: string | null;
  number: number | null;
  title: string | null;
}
/** A Blogger post or page entry. */
interface Post {
  /** Entry id (numeric string). */
  id: string;
  /** Title of the entry. */
  title: string;
  /** Canonical URL of the entry. */
  url: string;
  /** ISO published timestamp. */
  published: string;
  /** ISO last-updated timestamp. */
  updated: string;
  /** Labels attached to the entry. */
  labels: string[];
  /** Entry author. */
  author: Author;
  /** Full HTML content, or `null` when only a summary was requested. */
  content: string | null;
  /** Plain-text/HTML summary/snippet, or `null`. */
  summary: string | null;
  /** Best-guess thumbnail extracted from content, or `null`. */
  thumbnail: string | null;
  /** Thumbnail explicitly selected by Blogger, or `null`. */
  thumbnailAlt: string | null;
  /** Comment count/metadata for this entry. */
  comments: PostCommentInfo;
  /** Geo-location, if attached. */
  geo: Geo;
  /** Raw `<link>` entries from the feed. */
  links: Link[];
}
/** A comment entry. */
interface Comment {
  id: string;
  title: string;
  url: string;
  published: string;
  updated: string;
  author: Author;
  content: string | null;
  summary: string | null;
  extended: Extended;
  /** The post this comment belongs to. */
  post: {
    id: string;
    url: string;
  };
  /** Id of the parent comment when this is a reply, else `null`. */
  inReplyTo: string | null;
  links: Link[];
}
//#endregion
//#region src/plugins/resizeImage.d.ts
/** Recognized YouTube thumbnail quality presets. */
type YouTubeThumbnailQuality = "default" | "mqdefault" | "hqdefault" | "sddefault" | "maxresdefault";
/** Configuration options for {@link resizeImage}. */
interface ResizeImageOptions {
  /** Output height in px. Default `360`. */
  height?: number;
  /** Output width in px. Default `640`. */
  width?: number;
  /** Crop shape. Default: leave any existing crop untouched. */
  crop?: "circle" | "square";
  /** Output image format. Default `"webp"`. */
  format?: "jpeg" | "png" | "webp";
  /** Flip direction. Default: leave any existing flip untouched. */
  flip?: "horizontally" | "vertically";
  /** Rotation in degrees — `90`, `180`, or `270`. Default: leave any existing rotation untouched. */
  rotate?: number;
  /**
   * Quality preset for YouTube thumbnail URLs. Ignored for Blogger images.
   * Default `"maxresdefault"`. YouTube thumbnails are always served as
   * WebP, so `format`/`width`/`height`/`crop`/`flip`/`rotate` don't apply.
   */
  ytThumbnail?: YouTubeThumbnailQuality;
}
/**
 * Checks whether a URL is a Blogger/Google-hosted image (old or new URL
 * shape) or a YouTube video thumbnail that {@link resizeImage} can handle.
 *
 * @param url - Image URL to check.
 * @returns `true` if the URL is a recognized Blogger image or YouTube thumbnail.
 *
 * @example
 * ```ts
 * import { isSupportedImage } from "blogr-plugins";
 * isSupportedImage("https://1.bp.blogspot.com/path/s72-c/image.jpg"); // true
 * isSupportedImage("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"); // true
 * ```
 */
declare function isSupportedImage(url: string | URL): boolean;
/**
 * Builds a resized/transformed URL for a Blogger/Google-hosted image.
 * Unsupported URLs are returned unchanged rather than throwing, so it's
 * always safe to run any image URL through this function.
 *
 * For Blogger images, this parses the URL's existing param segment and
 * only overrides the params implied by `options` — width, height and
 * format always apply (falling back to their defaults), while crop, flip
 * and rotate are left untouched unless explicitly requested. Any other
 * recognized param already on the URL (e.g. `nu`, `pd`, `d`) is preserved.
 *
 * For YouTube thumbnail URLs, `width`/`height`/`crop`/`format`/`flip`/`rotate`
 * are ignored — YouTube only serves fixed quality presets — and only
 * `ytThumbnail` applies, always rewritten to the WebP variant.
 *
 * @param url - Source image or YouTube thumbnail URL.
 * @param options Configuration object.
 * See {@link ResizeImageOptions}.
 * @returns The transformed image URL, or the original URL if unsupported.
 *
 * @example
 * ```ts
 * import { resizeImage } from "blogr-plugins";
 *
 * const url = resizeImage("https://1.bp.blogspot.com/path/s72-c/image.jpg", {
 * 	width: 400,
 * 	height: 400,
 * 	format: "webp",
 * });
 * ```
 */
declare function resizeImage(url: string | URL, options?: ResizeImageOptions): string;
/**
 * Applies {@link resizeImage} to every matched element in place — `<img>`
 * (`src` + `srcset`) or any element with an inline `background-image`.
 * Elements matching neither are left untouched. No setup call required.
 *
 * @param input - Selector, element(s), or jQuery collection to resize.
 * @param options Configuration object.
 * See {@link ResizeImageOptions}.
 *
 * @example
 * ```ts
 * import { resizeImageInDom } from "blogr-plugins";
 * resizeImageInDom(".post-thumb img", { width: 400, height: 400 });
 * resizeImageInDom(".thumb", { ytThumbnail: "mqdefault" });
 * ```
 */
declare function resizeImageInDom(input: ElementInput, options?: ResizeImageOptions): void;
//#endregion
//#region src/plugins/createWidget.d.ts
/** What data the widget lists — one flag covers both feed and shape. */
type WidgetType = "posts" | "pages" | "comments" | "authors" | "labels";
/** How the initial batch of entries is sourced. */
type WidgetSourceType = "recent" | "random";
/** Feed field a widget's entries are ordered by. */
type WidgetOrderBy = "published" | "updated";
/** Direction entries are shown in, applied after fetching. */
type WidgetSort = "asc" | "desc";
/** A normalized post or page. Anything not listed here — id, title, url, author, etc. — is unchanged from the source feed and lives on `raw` instead. */
interface PostEntry {
  kind: "posts" | "pages";
  /** Numeric id, as reported by Blogger. */
  id: string;
  /** Title. `""` for comments (which have none). */
  title: string;
  /** Canonical URL. */
  url: string;
  /** Author Details. */
  author: Author;
  /** Publish date, formatted per `dateFormat`. */
  published: string;
  /** Last-updated date, formatted per `dateFormat`. */
  updated: string;
  /** Labels. Always `[]` for pages/comments (which carry none). */
  labels: string[];
  /** Resized thumbnail (via {@link resizeImage}), falling back to `fallbackImage`. `""` when `thumbnail: false`. */
  thumbnail: string;
  /** Plain-text summary, truncated to `summaryLength` characters. */
  content: string;
  /** The original, un-normalized SDK object. */
  raw: Post;
}
/**
 * A normalized comment — every field from the raw comment feed entry (id,
 * url, author, post, inReplyTo, extended, etc.) is spread directly onto
 * this object rather than nested under `raw`. `content`/`published`/
 * `updated` are overridden with truncated/formatted values; everything
 * else is exactly what the feed returned.
 */
interface CommentEntry extends Omit<Comment, "published" | "updated" | "content"> {
  kind: "comments";
  content: string;
  published: string;
  updated: string;
}
/** A normalized author — a thin pass-through of `blogr`'s `Author` (`name`, `url`, `image`), nothing invented. */
interface AuthorEntry {
  kind: "authors";
  id: string;
  name: string;
  url: string;
  image: string;
  raw: Author;
}
/** A normalized label — Blogger's `labels()` returns bare strings, so this is just that string plus a built search link. */
interface LabelEntry {
  kind: "labels";
  id: string;
  name: string;
  url: string;
  raw: string;
}
type WidgetEntry = PostEntry | CommentEntry | AuthorEntry | LabelEntry;
/**
 * Transforms one normalized entry, e.g. to inject a computed field, rewrite
 * a value from a transformer chain, or pull in data from elsewhere. Applied
 * in array order — each transformer receives the previous one's output.
 * May be async. Return `null` to drop the entry from the batch entirely.
 */
type WidgetTransformer = (entry: WidgetEntry, index: number) => WidgetEntry | null | Promise<WidgetEntry | null>;
/** Configuration for {@link createWidget}. */
interface CreateWidgetOptions {
  /** Enable JSONP transport (browser-only). @default true */
  jsonp?: boolean;
  /**
   * What the widget lists.
   * - "posts": Blog posts (default)
   * - "pages": Static pages
   * - "comments": Comments
   * - "authors": Distinct post authors
   * - "labels": Labels/categories
   * `"pages"`/`"comments"`/`"authors"`/`"labels"` ignore `labels`/`query`/
   * `related` (Blogger's feed API doesn't support filtering those feeds
   * that way, and authors/labels aren't filterable at all).
   * @default "posts"
   */
  type?: WidgetType;
  /**
   * How the initial batch is sourced: `"recent"` lists newest-first,
   * `"random"` samples random entries. Only applies to `type: "posts"`.
   * Default `"recent"`.
   */
  source?: WidgetSourceType;
  /** Where the widget mounts and renders. **Required.** */
  containerSelector: ElementInput;
  /** URL (or numeric id) of the Blogger blog to read from. **Required.** */
  blogUrl: string;
  /** Labels to filter by (AND semantics — an entry must carry every one). Empty/omitted = no label filter. Only applies to `type: "posts"`.
    labels?: string[];
    /** Feed field to sort by. Default `"published"`. */
  orderBy?: WidgetOrderBy;
  /** Direction to show entries in. Default `"desc"`. */
  sort?: WidgetSort;
  /** Search query. Combine with `deepSearch` to control how it's applied. */
  query?: string;
  /**
   * `true`: every `setQuery()`/query change re-fetches from the network.
   * `false`: fetches a broader buffer once, then filters/searches inside
   * it client-side without any further network requests. Default `false`.
   */
  deepSearch?: boolean;
  /**
   * Token-based date format applied to `published`/`updated`. Supports
   * `yyyy yy MMMM MMM MM M dd d EEEE EEE HH hh mm ss a`. Default
   * `"MMM d, yyyy"`.
   */
  dateFormat?: string;
  /**
   * Only include entries that share at least one label with the post
   * identified by `currentPostId`. Requires `currentPostId`. Default `false`.
   */
  related?: boolean;
  /** Shuffle the final rendered order (independent of `source`). Default `false`. */
  random?: boolean;
  /** Drop `currentPostId` from the results. Default `false`. */
  excludeCurrent?: boolean;
  /**
   * Id of the post the widget is shown alongside — required for `related`
   * and `excludeCurrent` to do anything. Not part of the original spec's
   * prop list, but both of those options are meaningless without it, so
   * it's added here; falls back to `<link rel="canonical">`'s id-bearing
   * query param when omitted, or does nothing if that can't be found.
   */
  currentPostId?: string;
  /**
   * `"default"` resizes each entry's own/extracted thumbnail with
   * {@link resizeImage}'s defaults. Pass a {@link ResizeImageOptions}
   * object to customize width/height/crop/etc. `false` disables
   * thumbnails entirely (skips extraction and rendering). Default `"default"`.
   */
  thumbnail?: false | "default" | ResizeImageOptions;
  /** Shown when an entry has no image of its own. Defaults to a small built-in placeholder. */
  fallbackImage?: string;
  /** Max characters of plain-text summary kept in `entry.content`. `0` disables truncation. Default `120`. */
  summaryLength?: number;
  /** Auto-load more entries via `IntersectionObserver` as the user scrolls near the end. Default `false`. */
  infiniteScroll?: boolean;
  /** Render a "load more" button. Can be combined with `infiniteScroll`. Default `false`. */
  loadMore?: boolean;
  /** Label for the load-more button. Default `"Load more"`. */
  loadMoreText?: string;
  /** Entries fetched/shown per batch. Default `6`. */
  maxVisibleItems?: number;
  /**
   * `rootMargin` for the `IntersectionObserver`s used both to defer the
   * widget's first fetch until its container nears the viewport, and to
   * trigger `infiniteScroll`. Default `"0px"`.
   */
  rootMargin?: string;
  /**
   * Persist fetched entries in `localStorage` (keyed by `cacheKey`) so a
   * fresh page load can skip the network entirely within `cacheTTL`.
   * Separate from and in addition to `blog.cache` (the SDK's own
   * in-memory, per-session response cache), which this also enables.
   * Default `false`.
   */
  cache?: boolean;
  /** Cache key. Defaults to `containerSelector` (as a string) or `"widget"`. */
  cacheKey?: string;
  /** How long a cached batch stays valid, in seconds. Default `3600` (1 hour). */
  cacheTTL?: number;
  /** Applied to every entry, in order, right after normalization. */
  transformers?: WidgetTransformer[];
  /** Called right before each network fetch. May be async. */
  beforeFetch?: () => void | Promise<void>;
  /** Called with the normalized batch right after a successful fetch, before rendering. May be async. */
  afterFetch?: (entries: WidgetEntry[]) => void | Promise<void>;
  /** Called for each entry right before it's rendered. */
  beforeRender?: (entry: WidgetEntry) => void;
  /** Called after an entry's element has been inserted into the DOM. */
  afterRender?: (element: HTMLElement, entry: WidgetEntry) => void;
  /** Called when a fetch or render step throws. */
  onError?: (err: unknown) => void;
  /** Called whenever there are zero entries to show (initial load or after filtering). */
  onEmpty?: () => void;
  /** Renders the loading state. `status` is a short human-readable phase, e.g. `"Loading posts..."`. */
  loading?: (status: string) => string;
  /** Renders the error state. */
  error?: (errorMsg: string) => string;
  /** Renders the empty state. */
  empty?: () => string;
  /** Renders one entry. `i` is its index in the currently rendered batch. */
  template?: (entry: WidgetEntry, i: number) => string;
  /** Extra class name(s) for an entry's wrapper element. */
  entryClass?: (entry: WidgetEntry, index: number) => string;
}
/** Returned by {@link createWidget}. */
interface WidgetInstance extends PluginInstance {
  /** Re-fetches from scratch, bypassing the local cache. */
  refresh(): Promise<void>;
  /** Updates the search query and re-fetches (or re-filters, per `deepSearch`). */
  setQuery(query: string): Promise<void>;
}
/**
 * Builds and mounts a fully self-contained Blogger listing widget — related
 * posts, a recent-posts sidebar, random picks, a comment stream, or a page
 * list — backed by the [`blogr`](https://jsr.io/@oyzamil/blogr) SDK. Fetches
 * are deferred until the container scrolls near the viewport, thumbnails are
 * resized via {@link resizeImage}, and results can be paged with an
 * infinite-scroll sentinel and/or a "load more" button.
 *
 * @param options Configuration object.
 * See {@link CreateWidgetOptions}.
 * @returns A {@link WidgetInstance} — `destroy()` tears down every observer
 * and clears the container; `refresh()`/`setQuery()` let you drive it after
 * the fact.
 *
 * @example
 * ```ts
 * import { createWidget } from "blogr-plugins";
 *
 * const widget = createWidget({
 * 	containerSelector: "#relatedPosts",
 * 	blogUrl: "https://example.blogspot.com",
 * 	type: "posts", // or "pages" | "comments" | "authors" | "labels"
 * 	related: true,
 * 	excludeCurrent: true,
 * 	currentPostId: "1234567890123456789",
 * 	labels: ["javascript"],
 * 	maxVisibleItems: 6,
 * 	loadMore: true,
 * 	template: (entry) => `
 * 		<article class="related-post">
 * 			<img src="${entry.thumbnail}" alt="${entry.raw.title}" />
 * 			<h3>${entry.raw.title}</h3>
 * 			<p>${entry.content}</p>
 * 		</article>
 * 	`,
 * });
 *
 * // later, e.g. before a client-side route change
 * widget.destroy();
 * ```
 */
declare function createWidget(options: CreateWidgetOptions): WidgetInstance;
//#endregion
//#region src/plugins/lazify.d.ts
/** Configuration options for {@link lazify}. */
interface LazifyOptions {
  /** Attribute holding the real media URL. Default `"data-src"`. */
  attribute?: string;
  /** Attribute holding a `<video>`'s poster image URL. Default `"data-poster"`. */
  posterAttribute?: string;
  /** Attribute holding a CSS background-image URL. Applies to any element. Default `"data-bg-image"`. */
  bgImageAttribute?: string;
  /** Class added once an element has finished loading. Default `"lazy-ify"`. */
  loadedClass?: string;
  /** Class added if an element fails to load. Default `"lazy-ify-error"`. */
  errorClass?: string;
  /** Root margin passed to the underlying `IntersectionObserver`. Default `"200px"`. */
  rootMargin?: string;
  /**
   * URL applied immediately (before intersection) so there's no broken-image
   * flash while waiting to load. Set to `false` to disable. Applied to
   * `<img src>`, `<video poster>`, and `background-image` targets only —
   * skipped for `<iframe>`. Default is a 1x1 transparent gif.
   */
  placeholder?: string | false;
  /** Called after each element finishes loading successfully. */
  onLoad?: (el: Element) => void;
  /** Called if an element's real media fails to load. */
  onError?: (el: Element, event: Event) => void;
}
/**
 * Lazily loads media once it scrolls near the viewport, using
 * `IntersectionObserver`. Handles `<img>` (sets `src`), `<iframe>` (sets
 * `src`), `<video>` (sets `src`/poster directly, or fills in `<source
 * data-src>` children and calls `.load()`), and any element with
 * `data-bg-image` (or, failing that, any other element) sets
 * `background-image`.
 *
 * A blank placeholder is applied immediately (before intersection) so
 * nothing shows a broken-image icon while it waits to load. `onLoad` fires
 * only once the real media has actually finished loading; `onError` fires
 * if it fails, and `errorClass` is added to the element.
 *
 * @param input - Selector, element(s), or jQuery collection to lazy-load.
 * @param options Configuration object.
 * See {@link LazifyOptions}.
 * @returns A {@link PluginInstance} with `destroy()` to stop observing.
 *
 * @example
 * ```html
 * <img data-src="/photo.jpg" alt="" />
 * <iframe data-src="https://example.com/embed"></iframe>
 * <div data-bg-image="/hero.jpg"></div>
 * <video data-poster="/poster.jpg" controls>
 * 	<source data-src="/clip.webm" type="video/webm" />
 * 	<source data-src="/clip.mp4" type="video/mp4" />
 * </video>
 * ```
 * ```ts
 * import { lazify } from "blogr-plugins";
 * lazify("img[data-src], iframe[data-src], video, [data-bg-image]", {
 * 	onError: (el) => el.classList.add("broken"),
 * });
 * ```
 */
declare function lazify(input: ElementInput, options?: LazifyOptions): PluginInstance;
//#endregion
//#region src/plugins/marqify.d.ts
/** Which mode {@link marqify} renders: a continuous scroller, or a one-at-a-time ticker. Default `"marquee"`. */
type MarqifyType = "marquee" | "ticker";
/**
 * Which way content moves. `"marquee"` only supports `"left"` / `"right"`;
 * `"ticker"` supports all four.
 */
type MarqifyDirection = "left" | "right" | "top" | "bottom";
/** Direction values valid when `type` is `"marquee"`. */
type MarqifyMarqueeDirection = "left" | "right";
/** Named speed presets, or a raw numeric speed for fine control. */
type MarqifySpeed = "slow" | "medium" | "fast" | number;
/** Configuration for {@link marqify}. */
interface MarqifyOptions {
  /**
   * `"marquee"` scrolls content continuously and seamlessly.
   * `"ticker"` shows one item at a time, sliding to the next/previous
   * item — either on its own timer or via {@link MarqifyInstance.next}
   * and {@link MarqifyInstance.previous}. Default `"marquee"`.
   */
  type?: MarqifyType;
  /**
   * Which way content moves. For `type: "marquee"` only `"left"` /
   * `"right"` are valid (anything else falls back to `"left"` with a
   * warning). For `type: "ticker"` all four are valid. Default `"left"`.
   */
  direction?: MarqifyDirection;
  /** Delay, in ms, before the marquee starts moving. `0` (default) means no delay. Marquee only. */
  delayBeforeStart?: number;
  /**
   * Duplicates the container's content so the marquee loops seamlessly
   * with no visible reset. `false` renders the content once with no
   * duplication — the animation still runs, but jumps back to the start
   * every cycle instead of looping smoothly. Default `true`. Marquee only.
   */
  duplicated?: boolean;
  /** Pauses the marquee while the pointer is over it. Default `true`. Marquee only. Also pauses ticker autoplay on hover. */
  pauseOnHover?: boolean;
  /**
   * `"slow"` / `"medium"` / `"fast"` map to `0.25` / `0.5` / `1`
   * respectively (higher = faster); pass a number directly for finer
   * control. Default `"medium"`.
   *
   * For `type: "ticker"` this instead controls the slide transition —
   * `"slow"` / `"medium"` / `"fast"` map to `800` / `500` / `300` ms;
   * pass a number directly to set the transition duration in ms.
   */
  speed?: MarqifySpeed;
  /** Ticker only. Auto-advances to the next item on a timer. Default `true`. */
  autoPlay?: boolean;
  /** Ticker only. Ms between auto-advances when `autoPlay` is on. Default `3000`. */
  interval?: number;
}
/** What {@link marqify} returns. `next()` / `previous()` are no-ops when `type` is `"marquee"`. */
interface MarqifyInstance extends PluginInstance {
  /** Slide to the next item. Ticker only — no-op for `"marquee"`. */
  next(): void;
  /** Slide to the previous item. Ticker only — no-op for `"marquee"`. */
  previous(): void;
}
/**
 * Turns a container's children into an infinitely-scrolling CSS marquee —
 * logos, card rows, testimonial strips, anything you'd otherwise reach for
 * a heavier carousel library for. Ports the reps/duration calculation from
 * the [marqy](https://github.com/abnud1/marqy) web component into an
 * imperative plugin: pass it a container of items instead of a custom
 * element, and it rebuilds that container into a seamless, duplicated
 * marquee track sized to always fill it, regardless of viewport width.
 *
 * Injects a small stylesheet into `<head>` the first time it's called
 * (once per page, however many containers you marquee).
 *
 * Also doubles as a **ticker**: pass `type: "ticker"` and instead of a
 * continuous scroll, one child at a time is shown, sliding out to make way
 * for the next in the direction you configure (`"left"` / `"right"` /
 * `"top"` / `"bottom"`). Advance it with the returned instance's
 * {@link MarqifyInstance.next} / {@link MarqifyInstance.previous} — e.g.
 * from a pair of prev/next buttons.
 *
 * @param input - Selector, element(s), or jQuery collection for the
 * container(s) whose children should marquee/tick.
 * @param options - {@link MarqifyOptions}
 * @returns A {@link MarqifyInstance} — `destroy()` disconnects the resize
 * observers and restores the container's original content; `next()` /
 * `previous()` step the ticker (no-ops when `type` is `"marquee"`).
 *
 * @example
 * ```html
 * <div class="cards">
 * 	<div class="card">Card A</div>
 * 	<div class="card">Card B</div>
 * 	<div class="card">Card C</div>
 * </div>
 * ```
 * ```ts
 * import { marqify } from "blogr-plugins";
 *
 * const instance = marqify(".cards", {
 * 	direction: "left",
 * 	speed: "fast",
 * 	pauseOnHover: true,
 * });
 *
 * instance.destroy();
 * ```
 *
 * @example Ticker
 * ```html
 * <div class="announcements">
 * 	<div>📣 New release shipped</div>
 * 	<div>🐛 Fixed a nasty bug</div>
 * 	<div>🎉 100 stars on GitHub</div>
 * </div>
 * <button id="prev">‹</button>
 * <button id="next">›</button>
 * ```
 * ```ts
 * import { marqify } from "blogr-plugins";
 *
 * const ticker = marqify(".announcements", {
 * 	type: "ticker",
 * 	direction: "top",
 * 	speed: "medium",
 * });
 *
 * document.getElementById("next").addEventListener("click", () => ticker.next());
 * document.getElementById("prev").addEventListener("click", () => ticker.previous());
 * ```
 */
declare function marqify(input: ElementInput, options?: MarqifyOptions): MarqifyInstance;
//#endregion
//#region src/plugins/menuify.d.ts
/** Configuration options for {@link menuify}. */
interface MenuifyOptions {
  /** Prefix marking a link as belonging to the previous item's submenu. Default `"_"`. */
  nestingPrefix?: string;
  /** Class applied to generated `<ul>` submenus. Default `"sub-menu"`. */
  submenuClass?: string;
  /** Class applied to `<li>` items that received a submenu. Default `"has-sub"`. */
  hasSubClass?: string;
  /** Chevron element text. Default `"<"`. */
  chevronText?: string;
}
declare function menuify(input: ElementInput, options?: MenuifyOptions): PluginInstance;
//#endregion
//#region src/plugins/relatify.d.ts
/** How candidate posts are picked once fetched. */
type RelatifyRelevance = "strict" | "default";
/**
 * A single related post handed to `template` and the lifecycle hooks —
 * mirrors `createWidget`'s `WidgetEntry` shape for familiarity.
 */
interface RelatedPost {
  /** Post id, as reported by Blogger. */
  id: string;
  /** Post title. */
  title: string;
  /** Canonical URL of the post. */
  url: string;
  /** Author display name, or `""` if unavailable. */
  author: string;
  /** Publish date (ISO string, as reported by Blogger). */
  published: string;
  /** Labels on the post. */
  labels: string[];
  /** Plain-text summary (Blogger's own summary field, HTML stripped). */
  content: string;
  /** The original SDK `Post` object, for anything not exposed above. */
  raw: Post;
}
/** Configuration for {@link relatify}. */
interface RelatifyOptions {
  /** Enable JSONP transport (browser-only). @default true */
  jsonp?: boolean;
  /**
   * Labels to find related posts for — paste this straight from your
   * Blogger template (see the `<script>` snippet in the README) so it
   * reflects the *current* post's actual labels:
   *
   * ```html
   * <script>
   * 	const labels = [
   * 		<b:loop values='data:post.labels' var='label'>
   * 			"<data:label.name/>"<b:if cond='not data:label.isLast'>,</b:if>
   * 		</b:loop>
   * 	];
   * </script>
   * ```
   *
   * Omitted or empty fetches recent posts across the whole blog instead
   * of filtering by label at all.
   */
  labels?: string[];
  /**
   * Element(s) after which a related-post link may be inserted — a CSS
   * selector, or an array of selectors (joined with `,`, so
   * `["p", ".paragraph", ".video"]` behaves like
   * `"p, .paragraph, .video"`). Matched *within* the container. Default
   * `"p"`.
   */
  insertAfter?: string | string[];
  /**
   * Maximum number of links to insert. Default: scaled to the
   * container's word count — 2 for a ~500-word article, 3 for ~1000,
   * and so on (`Math.floor(wordCount / 500) + 1`, minimum `1`). Always
   * additionally capped by however many eligible `insertAfter` elements
   * and related posts actually exist.
   */
  maxLinks?: number;
  /**
   * Labels to leave out of the *search* — i.e. even if `labels` (or the
   * post's own labels) includes one of these, it won't be used to look
   * up related posts. This does **not** filter candidate results: a
   * related post found via a non-excluded label is kept even if it also
   * happens to carry an excluded label. Default `[]`.
   */
  excludeLabels?: string[];
  /**
   * `"strict"` scores every candidate by word overlap against the
   * nearest heading inside the container (falling back to
   * `document.title`) and picks the highest-scoring matches. `"default"`
   * shuffles the candidates and picks randomly. Default `"strict"`.
   */
  relevance?: RelatifyRelevance;
  /**
   * Renders one inserted link. Same shape as `createWidget`'s
   * `template`: `(post, index) => string`. Default:
   * `` `You may also like: <a href="${post.url}">${post.title}</a>` ``.
   */
  template?: (post: RelatedPost, index: number) => string;
  /**
   * URL (or numeric id) of the Blogger blog to read from. Defaults to
   * `window.location.origin` — override only if this runs somewhere
   * other than the blog itself (e.g. local development against a
   * different site).
   */
  blogUrl?: string;
  /**
   * URL of the current post, used to exclude it from its own related
   * list. Defaults to `<link rel="canonical">`'s `href`, falling back to
   * `location.href`. Override if neither is reliable in your setup.
   */
  currentUrl?: string;
  /** How many candidate posts to fetch (per label, or overall when unfiltered) before scoring/picking from them. Default `20`. */
  sampleSize?: number;
  /** Wrapper element class for each inserted link. Default `"relatify-link"`. */
  linkClass?: string;
  /** Called right before fetching. */
  beforeFetch?: () => void;
  /** Called with the final list of chosen related posts, before any are inserted. */
  afterFetch?: (posts: RelatedPost[]) => void;
  /** Called once per link actually inserted. */
  onInsert?: (detail: {
    post: RelatedPost;
    element: HTMLElement;
    index: number;
  }) => void;
  /** Called when no related posts (or no eligible insertion points) were found. */
  onEmpty?: () => void;
  /** Called if the fetch fails. */
  onError?: (err: unknown) => void;
  /**
   * Enable lazy loading — plugin initializes only when first `insertAfter`
   * element comes near the viewport, preventing API calls on page load.
   * Default `true`.
   */
  lazy?: boolean;
  /**
   * Margin (in pixels or CSS string) for IntersectionObserver to trigger
   * lazy load before element enters viewport. Default `"0px"`.
   * Examples: `"100px"`, `"10%"`, `"0px 0px 50px 0px"`.
   */
  rootMargin?: string;
}
/**
 * Fetches related posts for the current article by label and inserts a
 * randomly-placed link (or several, scaled to article length) after
 * `insertAfter` elements within the container.
 *
 * Get the current post's labels straight from your Blogger template and
 * pass them in as `labels`:
 *
 * ```html
 * <script>
 * 	const labels = [
 * 		<b:loop values='data:post.labels' var='label'>
 * 			"<data:label.name/>"<b:if cond='not data:label.isLast'>,</b:if>
 * 		</b:loop>
 * 	];
 * </script>
 * ```
 *
 * @param input - Selector, element(s), or jQuery collection for the
 * article container — related links are inserted inside it.
 * @param options - {@link RelatifyOptions}
 * @returns A {@link PluginInstance} — `destroy()` removes every link it
 * inserted (or, if the fetch hasn't resolved yet, cancels it).
 *
 * @example
 * ```ts
 * import { relatify } from "blogr-plugins";
 *
 * relatify("article", {
 * 	labels,
 * 	insertAfter: ["p", ".paragraph", ".video"],
 * 	excludeLabels: ["announcements"],
 * 	relevance: "strict",
 * 	template: (post) =>
 * 		`Related: <a href="${post.url}">${post.title}</a>`,
 * });
 * ```
 */
declare function relatify(input: ElementInput, options?: RelatifyOptions): PluginInstance;
//#endregion
//#region src/plugins/replacify.d.ts
/** Configuration options for {@link replacify}. */
interface ReplacifyOptions {
  /** When true, replacement may contain HTML and will be parsed as markup. Default `false`. */
  allowHtml?: boolean;
}
/**
 * Finds and replaces text within an element's text nodes only — it never
 * touches tag names or attributes, so it's safe to run on rendered markup.
 *
 * @param input - Selector, element(s), or jQuery collection to search within.
 * @param search - String or RegExp to find.
 * @param replacement - Replacement text (or HTML, if `allowHtml` is set).
 * @param options Configuration object.
 * See {@link ReplacifyOptions}.
 * @returns A {@link PluginInstance} with `destroy()` to revert the text.
 *
 * @example
 * ```ts
 * import { replacify } from "blogr-plugins";
 * replacify(".post-body", /\bBlogr\b/g, "Blogr™");
 * ```
 */
declare function replacify(input: ElementInput, search: string | RegExp, replacement: string, options?: ReplacifyOptions): PluginInstance;
//#endregion
//#region src/plugins/shortcodify.d.ts
/** A single shortcode attribute value, auto-coerced from its raw text. */
type ShortcodeAttributeValue = string | number | boolean;
/** Parsed attributes for one shortcode occurrence. */
type ShortcodeAttributes = Record<string, ShortcodeAttributeValue>;
/**
 * Renders one shortcode tag to its final string.
 *
 * @param attrs - Parsed attributes, e.g. `{ width: 400, caption: "Nice" }`.
 * @param content - Already-rendered inner content (empty string for
 * self-closing tags).
 * @param tag - The tag name that matched, useful when one handler is
 * registered for several tags.
 */
type ShortcodeHandler = (attrs: ShortcodeAttributes, content: string, tag: string) => string;
/** What to do with a `[tag]` whose name has no registered handler. */
type UnknownTagPolicy = "keep" | "strip" | "remove";
/** Configuration options shared by {@link renderShortcodes} and {@link shortcodify}. */
interface ShortcodifyOptions {
  /** Map of tag name → {@link ShortcodeHandler}. */
  tags: Record<string, ShortcodeHandler>;
  /** Opening delimiter. Default `"["`. */
  openTag?: string;
  /** Closing delimiter. Default `"]"`. */
  closeTag?: string;
  /**
   * What happens to a recognized-shaped tag with no matching handler:
   * `"keep"` reproduces the original bracket text untouched, `"strip"`
   * unwraps it and keeps only the inner content, `"remove"` deletes it
   * entirely. Default `"keep"`.
   */
  unknownTag?: UnknownTagPolicy;
  /**
   * Re-render a handler's output for further shortcodes it may itself
   * contain (e.g. a `[quote]` handler that wraps its content in
   * `[i]...[/i]`). Bounded by `maxDepth` to avoid infinite loops.
   * Default `true`.
   */
  recursive?: boolean;
  /** Safety cap on recursive re-render passes. Default `5`. */
  maxDepth?: number;
  /** Called if a handler throws; the offending tag renders as empty string. */
  onError?: (error: unknown, tag: string) => void;
}
/** Extra options for the DOM-facing {@link shortcodify}. */
interface ShortcodifyDomOptions extends ShortcodifyOptions {
  /**
   * When a rendered result contains markup, parse it as HTML instead of
   * inserting it as literal text. Default `false`.
   */
  allowHtml?: boolean;
}
/**
 * Parses and renders `[tag attr="value"]content[/tag]`-style shortcodes in
 * a plain string, given a map of tag → handler. Pure function — does not
 * touch the DOM, so it's the right building block for rendering Blogger
 * post content, RSS/feed text, or any string before it's inserted onto a
 * page.
 *
 * Supports self-closing tags (`[img src="a.jpg"/]`), nested tags
 * (`[quote][b]bold[/b] quote[/quote]`), quoted/unquoted/boolean attributes
 * (`[video src=a.mp4 muted]`), and `[[tag]]` escaping to emit a literal
 * bracketed tag without processing it.
 *
 * @param text - Source text containing zero or more shortcodes.
 * @returns The text with every recognized shortcode replaced by its
 * handler's output.
 *
 * @example
 * ```ts
 * import { renderShortcodes } from "blogr-plugins";
 *
 * const html = renderShortcodes(
 *   "Check out [youtube id=\"dQw4w9WgXcQ\" width=560/] and [b]this[/b].",
 *   {
 *     tags: {
 *       youtube: (attrs) =>
 *         `<iframe width="${attrs.width ?? 560}" height="315" src="https://www.youtube.com/embed/${attrs.id}"></iframe>`,
 *       b: (_attrs, content) => `<strong>${content}</strong>`,
 *     },
 *   },
 * );
 * ```
 */
declare function renderShortcodes(text: string, options: ShortcodifyOptions): string;
interface ShortcodeRegistry {
  /** Live map of every tag registered so far — pass straight into `tags`. */
  tags: Record<string, ShortcodeHandler>;
  /** Registers (or overwrites) a single tag's handler. Chainable. */
  register(tag: string, handler: ShortcodeHandler): ShortcodeRegistry;
  /** Removes a tag so it falls back to the `unknownTag` policy. Chainable. */
  unregister(tag: string): ShortcodeRegistry;
  /** Whether a tag currently has a handler. */
  has(tag: string): boolean;
}
/**
 * A small, reusable builder for a tag → handler map, so a shared set of
 * shortcodes (e.g. your site's `[gallery]`, `[youtube]`, `[button]`) can be
 * assembled once and passed to both {@link renderShortcodes} and
 * {@link shortcodify} calls across a codebase.
 *
 * @example
 * ```ts
 * import { createShortcodeRegistry, shortcodify } from "blogr-plugins";
 *
 * const registry = createShortcodeRegistry()
 *   .register("b", (_attrs, content) => `<strong>${content}</strong>`)
 *   .register("color", (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`);
 *
 * shortcodify("#post-body", { tags: registry.tags });
 * ```
 */
declare function createShortcodeRegistry(initial?: Record<string, ShortcodeHandler>): ShortcodeRegistry;
/**
 * A handful of ready-made handlers (`b`, `i`, `u`, `url`, `color`) you can
 * spread into your own tag map instead of writing the common ones by hand.
 *
 * @example
 * ```ts
 * import { defaultShortcodeTags, renderShortcodes } from "blogr-plugins";
 *
 * renderShortcodes("[b]Bold[/b] and [url href=\"/x\"]a link[/url]", {
 *   tags: { ...defaultShortcodeTags, ...myOwnTags },
 * });
 * ```
 */
declare const defaultShortcodeTags: Record<string, ShortcodeHandler>;
/**
 * DOM-facing version of {@link renderShortcodes}: scans the text nodes
 * inside the given element(s) for shortcodes and replaces each match with
 * its handler's output, in place. A shortcode must live entirely inside one
 * text node to be recognized — for content spanning multiple elements (or
 * before it's inserted into the page at all), call
 * {@link renderShortcodes} on the raw string instead.
 *
 * @param input - Selector, element(s), or jQuery collection to scan.
 * @param options Configuration object.
 * See {@link ShortcodifyOptions}.
 * @returns A {@link PluginInstance} with `destroy()` to revert every replacement.
 *
 * @example
 * ```html
 * <p id="post">Say [b]hello[/b] to [color name="crimson"]Blogr[/color]!</p>
 * ```
 * ```ts
 * import { shortcodify } from "blogr-plugins";
 *
 * shortcodify("#post", {
 *   tags: {
 *     b: (_attrs, content) => `<strong>${content}</strong>`,
 *     color: (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`,
 *   },
 *   allowHtml: true,
 * });
 * ```
 */
declare function shortcodify(input: ElementInput, options: ShortcodifyDomOptions): PluginInstance;
//#endregion
//#region src/plugins/stackify.d.ts
/** Which way the auto-cycle rotates the stack. */
type StackDirection = "forward" | "backward";
/** Which axis a layout peeks/scrolls along, and which axis dragging works on. */
type StackOrientation = "vertical" | "horizontal";
/** Which side peeking cards trail toward, in `"stack"` layout. */
type StackPeekDirection = "top" | "bottom" | "left" | "right";
/** Container size override. Number -> px, string used as-is. */
interface StackifySize {
  height?: number | string;
  width?: number | string;
}
/** Per-layout size override — only the block matching current `layout` applies. */
interface StackifySizeByLayout {
  stack?: StackifySize;
  marquee?: StackifySize;
}
/** Detail object passed to `onBeforeChange`/`onAfterChange`. */
interface StackifyChangeDetail {
  /** Original index (in DOM order) of the card that was in front. */
  fromIndex: number;
  /** Original index (in DOM order) of the card that is now in front. */
  toIndex: number;
  /** The card element that was in front. */
  fromCard: HTMLElement;
  /** The card element that is now in front. */
  toCard: HTMLElement;
}
/** Configuration options for {@link stackify}. */
interface StackifyOptions {
  /**
   * Gap in px between cards. In `"stack"` layout this is how far a card
   * peeks past the one in front of it. In `"marquee"` layout it's the
   * gap between cards along the scroll axis — same option, both
   * layouts read it. Default `20`.
   */
  offset?: number;
  /**
   * Shrinks each card behind the front one by this fraction (e.g. `0.05`
   * = each card 5% smaller than the one in front of it) for a subtle
   * depth/fan effect. `0` keeps every card full size, matching a flat
   * peeking stack. Default `0`.
   */
  scaleStep?: number;
  /**
   * How many cards (counting the front one) stay visible at once; any
   * further back are faded to `opacity: 0` (still present, just hidden)
   * so a stack of 8 doesn't visually pile up. Default: every card.
   */
  visibleCards?: number;
  /** Milliseconds between automatic cycles. `0` disables the timer (still cyclable via `next()`/`prev()`/`goTo()`). Default `3000`. */
  interval?: number;
  /** Whether the auto-cycle timer starts immediately. Default `true`. */
  autoplay?: boolean;
  /** Transition duration, in ms, for a card moving between stack positions. Default `500`. */
  duration?: number;
  /** CSS timing function for that transition. Default `"ease"`. */
  easing?: string;
  /** `"forward"` sends the front card to the back; `"backward"` brings the back card to the front. Applies to the auto-cycle timer. Default `"forward"`. */
  direction?: StackDirection;
  /**
   * Which axis the layout runs on, and which axis dragging works on.
   * `"vertical"` peeks/drags top-to-bottom, `"horizontal"`
   * peeks/drags left-to-right. Default: `"vertical"` for
   * `layout: "stack"`, `"horizontal"` for `layout: "marquee"`.
   */
  orientation?: StackOrientation;
  /**
   * `"stack"` layout only. Which side the peeking cards trail toward.
   *  Default: `"top"` for vertical {@link orientation},
   * `"left"` for horizontal.
   */
  stackDirection?: StackPeekDirection;
  /** Pause the auto-cycle timer while the pointer is over the stack, resuming on pointer-leave. Default `true`. */
  pauseOnHover?: boolean;
  /** Clicking a non-front card brings it to the front. Default `true`. */
  clickToActivate?: boolean;
  /**
   * Lets the front card be dragged/swiped to advance/go back — along
   * whichever axis {@link orientation} sets (top/bottom for vertical,
   * left/right for horizontal). Default `false`.
   */
  draggable?: boolean;
  /** Original index of the card that starts in front. Default `0`. */
  startIndex?: number;
  /** Class toggled on whichever card is currently in front. Default `"stackify-active"`. */
  activeClass?: string;
  /** Class added to every card. Default `"stackify-card"`. */
  cardClass?: string;
  /** Class added to the container. Default `"stackify-stack"`. */
  stackClass?: string;
  /**
   * Stack layout: `"stack"` is the peeking-card-deck effect (default).
   * `"marquee"` lays cards out in a row (or column, see
   * {@link orientation}) that scrolls continuously (speed set by
   * {@link marqueeSpeed}), like a ticker.
   */
  layout?: "stack" | "marquee";
  /**
   * `"stack"` layout only. Whether cards behind the front one grow
   * (`"expand"`) or shrink (`"shrink"`) in cross-axis size relative to
   * it, for a fanned-out peek effect. `"none"` keeps every card the
   * same size. Default `"none"`.
   */
  peekWidth?: "expand" | "shrink" | "none";
  /** Size change, as a fraction per card, applied when {@link peekWidth} is set. Default `0.05`. */
  peekWidthStep?: number;
  /** `"marquee"` layout only. Scroll speed in px/second. Default `60`. */
  marqueeSpeed?: number;
  /**
   * Container height/width — purely opt-in. Plugin never measures
   * cards or auto-calcs a size; whichever axis you don't give stays
   * untouched (normal CSS/parent sizing applies). Number -> px,
   * string used as-is (e.g. `"20rem"`, `"100%"`).
   *
   * Two shapes:
   * - Flat, applies regardless of {@link layout}:
   *   `size: { height: "400px" }`
   * - Per-layout, only the block matching current `layout` applies:
   *   `size: { stack: { height: "400px" }, marquee: { width: "50%" } }`
   */
  size?: StackifySize | StackifySizeByLayout;
  /** Called right before a cycle starts (right as the transition begins). */
  onBeforeChange?: (detail: StackifyChangeDetail) => void;
  /** Called once a cycle's transition has finished. */
  onAfterChange?: (detail: StackifyChangeDetail) => void;
}
/** Returned by {@link stackify}. */
interface StackifyInstance extends PluginInstance {
  /** Sends the current front card to the back; the next one becomes front. */
  next(): void;
  /** Brings the back-most card to the front. */
  prev(): void;
  /** Brings the card at `originalIndex` (its position in the initial DOM order) to the front. */
  goTo(originalIndex: number): void;
  /** Resumes the auto-cycle timer. */
  play(): void;
  /** Pauses the auto-cycle timer. */
  pause(): void;
  /** Original index of the card currently in front, per matched stack (usually one). */
  getActiveIndex(): number[];
}
/**
 * Turns a container's children into a peeking card stack — like a small
 * deck of index cards — that auto-cycles the front card to the back on a
 * timer, cycling through every card in turn.
 *
 * @param input - Selector, element(s), or jQuery collection for the
 * *stack container* (its children become the cards).
 * @param options - Optional {@link StackifyOptions}. If omitted, reads from
 * container's `data-*` attributes.
 * @returns A {@link StackifyInstance} — `destroy()` restores every card's
 * original styles; `next()`/`prev()`/`goTo()`/`play()`/`pause()` drive the
 * stack programmatically.
 *
 * @example
 * ```html
 * <div id="testimonials"
 *   data-layout="stack"
 *   data-offset="20"
 *   data-interval="4000"
 *   data-duration="500"
 *   data-stack-direction="right">
 * 	<div class="card">...</div>
 * 	<div class="card">...</div>
 * 	<div class="card">...</div>
 * </div>
 * ```
 * ```ts
 * import { stackify } from "blogr-plugins";
 *
 * // Read all options from data-* attributes
 * const stack = stackify("#testimonials");
 *
 * // Or override specific options
 * const stack2 = stackify("#other", { interval: 2000, stackDirection: "all" });
 *
 * stack.next(); // advance manually
 * stack.destroy();
 * ```
 */
declare function stackify(input: ElementInput, options?: StackifyOptions): StackifyInstance;
//#endregion
//#region src/plugins/stickify.d.ts
/** Configuration options for {@link stickify}. */
interface StickifyOptions {
  /** Selector for the sidebar's scroll container. Defaults to the sidebar's parent. */
  containerSelector?: string;
  /** Extra px gap kept above the sidebar while stuck. */
  additionalMarginTop?: number;
  /** Extra px gap kept below the sidebar before it stops at the container's end. */
  additionalMarginBottom?: number;
  /** Keep the sidebar's wrapper `min-height` in sync so the container never collapses. Default `true`. */
  updateSidebarHeight?: boolean;
  /** Viewport width (px) below which stickiness is disabled entirely. */
  minWidth?: number;
  /** Disable stickiness when the sidebar no longer fits its container (e.g. stacked mobile layouts). Default `true`. */
  disableOnResponsiveLayouts?: boolean;
  /**
   * `"modern"` follows scroll direction the way a native sticky element
   * would. `"stick-to-top"` pins the top edge at `additionalMarginTop`.
   * `"stick-to-bottom"` pins the bottom edge to the viewport instead.
   */
  sidebarBehavior?: "modern" | "stick-to-top" | "stick-to-bottom";
  /** Inline `position` applied to the sidebar itself before stickiness kicks in. Default `"relative"`. */
  defaultPosition?: string;
  /** Log a note to the console when init is delayed because the viewport is under `minWidth`. */
  verbose?: boolean;
}
/**
 * Makes a sidebar stick to the viewport while scrolling, clamped to its
 * container so it never overflows past the container's bottom edge. Full
 * option-parity port of Theia Sticky Sidebar, so it supports the same
 * `modern` / `stick-to-top` / `stick-to-bottom` behaviors and layout edge
 * cases (collapsible margins, floated multi-column layouts, responsive
 * stacking) as the original.
 *
 * @param input - Selector, element(s), or jQuery collection for the sidebar(s).
 * @param options Configuration object.
 * See {@link StickifyOptions}.
 * @returns A {@link PluginInstance} with `destroy()` to unbind everything and restore original styles.
 *
 * @example
 * ```ts
 * import { stickify } from "blogr-plugins";
 * stickify(".leftSidebar, .content, .rightSidebar", { additionalMarginTop: 30 });
 * ```
 */
declare function stickify(input: ElementInput, options?: StickifyOptions): PluginInstance;
//#endregion
//#region src/plugins/tocify.d.ts
/** Configuration options for {@link tocify}. */
interface TocifyOptions {
  /** Optional title rendered as an `<h2>` above the table of contents. */
  title?: string | (() => string);
  /** Selector (relative to the content root) for headings to include. Default `"h1,h2,h3"`. */
  headings?: string;
  /** Root element to scan for headings. Defaults to the `input` element itself. */
  content?: ElementInput;
}
/**
 * Builds a nested table-of-contents `<ul>` from the headings found inside a
 * container, assigning an `id` to each heading (if it doesn't already have
 * one) so the TOC links can jump to them.
 *
 * @param input - Selector, element, or jQuery collection to render the TOC into.
 * @param options Configuration object.
 * See {@link TocifyOptions}.
 * @returns A {@link PluginInstance} with `destroy()` to remove the generated TOC.
 *
 * @example
 * ```ts
 * import { tocify } from "blogr-plugins";
 * tocify("#toc", { content: "#article", headings: "h2,h3" });
 * ```
 */
declare function tocify(input: ElementInput, options?: TocifyOptions): PluginInstance;
//#endregion
export { type AdsenseLoaderInstance, type AdsenseLoaderOptions, type AuthorEntry, type AvatarSetDetail, type AvatarStyle, type AvatarSuccessDetail, type AvatarifyConfig, type AvatarifyInstance, type CommentEntry, type Cookify, type CookifySetOptions, type CreateWidgetOptions, type ElementInput, type LabelEntry, type LazifyOptions, type MarqifyDirection, type MarqifyInstance, type MarqifyMarqueeDirection, type MarqifyOptions, type MarqifySpeed, type MarqifyType, type MenuifyOptions, type PluginInstance, type PostEntry, type RelatedPost, type RelatifyOptions, type RelatifyRelevance, type ReplacifyOptions, type ResizeImageOptions, type ShortcodeAttributeValue, type ShortcodeAttributes, type ShortcodeHandler, type ShortcodeRegistry, type ShortcodifyDomOptions, type ShortcodifyOptions, type StackDirection, type StackOrientation, type StackifyChangeDetail, type StackifyInstance, type StackifyOptions, type StackifySize, type StackifySizeByLayout, type StickifyOptions, type TocifyOptions, type UnknownTagPolicy, type WidgetEntry, type WidgetInstance, type WidgetOrderBy, type WidgetSort, type WidgetSourceType, type WidgetTransformer, type WidgetType, type YouTubeThumbnailQuality, adsenseLoader, avatarify, cookify, createShortcodeRegistry, createWidget, defaultShortcodeTags, isSupportedImage, lazify, marqify, menuify, relatify, renderShortcodes, replacify, resizeImage, resizeImageInDom, shortcodify, stackify, stickify, tocify };