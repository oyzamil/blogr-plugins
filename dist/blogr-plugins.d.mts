
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
 * @param options - {@link StickifyOptions}
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
//#region src/plugins/menuify.d.ts
/** Configuration options for {@link menuify}. */
interface MenuifyOptions {
  /** Prefix marking a link as belonging to the previous item's submenu. Default `"_"`. */
  nestingPrefix?: string;
  /** Class applied to generated `<ul>` submenus. Default `"sub-menu"`. */
  submenuClass?: string;
  /** Class applied to `<li>` items that received a submenu. Default `"has-sub"`. */
  hasSubClass?: string;
}
/**
 * Converts a flat `<ul><li><a>` link list into a nested dropdown menu.
 * Any link whose text starts with the nesting prefix (default `_`) is moved
 * into a submenu under the previous non-prefixed link, and the prefix is
 * stripped from its visible text.
 *
 * @param input - Selector, element(s), or jQuery collection for the menu list(s).
 * @param options - {@link MenuifyOptions}
 * @returns A {@link PluginInstance} with `destroy()` to revert the DOM changes.
 *
 * @example
 * ```html
 * <ul class="menu">
 *   <li><a>Home</a></li>
 *   <li><a>Blog</a></li>
 *   <li><a>_Web Design</a></li>
 *   <li><a>_SEO</a></li>
 * </ul>
 * ```
 * ```ts
 * import { menuify } from "blogr-plugins";
 * menuify(".menu");
 * // "Web Design" and "SEO" become a submenu nested under "Blog"
 * ```
 */
declare function menuify(input: ElementInput, options?: MenuifyOptions): PluginInstance;
//#endregion
//#region src/plugins/lazify.d.ts
/** Configuration options for {@link lazify}. */
interface LazifyOptions {
  /** Attribute holding the real image URL. Default `"data-src"`. */
  attribute?: string;
  /** Class added once the image has finished loading. Default `"lazy-ify"`. */
  loadedClass?: string;
  /** Root margin passed to the underlying `IntersectionObserver`. Default `"200px"`. */
  rootMargin?: string;
  /** Called after each element finishes loading. */
  onLoad?: (el: Element) => void;
}
/**
 * Lazily loads images (or CSS background-images) once they scroll near the
 * viewport, using `IntersectionObserver`. Works on `<img>` tags (sets `src`)
 * and on any other element (sets `background-image`).
 *
 * @param input - Selector, element(s), or jQuery collection to lazy-load.
 * @param options - {@link LazifyOptions}
 * @returns A {@link PluginInstance} with `destroy()` to stop observing.
 *
 * @example
 * ```html
 * <img data-src="/photo.jpg" alt="" />
 * ```
 * ```ts
 * import { lazify } from "blogr-plugins";
 * lazify("img[data-src]");
 * ```
 */
declare function lazify(input: ElementInput, options?: LazifyOptions): PluginInstance;
//#endregion
//#region src/plugins/tocify.d.ts
/** Configuration options for {@link tocify}. */
interface TocifyOptions {
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
 * @param options - {@link TocifyOptions}
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
 * @param options - {@link ReplacifyOptions}
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
declare const cookify: {
  /**
   * Writes a cookie.
   * @param name - Cookie name.
   * @param value - Any JSON-serializable value.
   * @param options - {@link CookifySetOptions}
   */
  set(name: string, value: unknown, options?: CookifySetOptions): void;
  /**
   * Reads a cookie.
   * @param name - Cookie name.
   * @returns The parsed value, or `undefined` if not set.
   */
  get<T = string>(name: string): T | undefined;
  /**
   * Reads every cookie.
   * @returns A record of all cookies, parsed the same way as {@link cookify.get}.
   */
  getAll(): Record<string, unknown>;
  /**
   * Deletes a cookie.
   * @param name - Cookie name.
   * @param options - Must match the `path`/`domain` used when setting it.
   * @returns `true` if the cookie was present beforehand.
   */
  remove(name: string, options?: Pick<CookifySetOptions, "path" | "domain">): boolean;
};
//#endregion
//#region src/plugins/resizeImage.d.ts
/**
 * Detects and rewrites Blogger/Google-hosted image URLs
 * (`googleusercontent.com` / `bp.blogspot.com`) with new size, crop,
 * format, flip, rotation and grayscale parameters.
 */
/** Configuration options for {@link resizeImage}. */
interface ResizeImageOptions {
  /** Output height in px. Default `360`. */
  height?: number;
  /** Output width in px. Default `640`. */
  width?: number;
  /** Crop shape. Default: no crop. */
  crop?: "circle" | "square";
  /** Output image format. Default `"webp"`. */
  format?: "jpeg" | "png" | "webp";
  /** Flip direction. Default: no flip. */
  flip?: "horizontally" | "vertically";
  /** Rotation in degrees — `90`, `180`, or `270`. Default `0` (no rotation). */
  rotate?: number;
  /** Convert the image to grayscale. Default `false`. */
  grayscale?: boolean;
}
/**
 * Checks whether a URL is a Blogger/Google-hosted image that supports
 * these transformation parameters.
 *
 * @param url - Image URL to check.
 * @returns `true` if the host and image-size path segment are recognized.
 *
 * @example
 * ```ts
 * import { isSupportedImage } from "blogr-plugins";
 * isSupportedImage("https://1.bp.blogspot.com/path/s72-c/image.jpg"); // true
 * ```
 */
declare function isSupportedImage(url: string | URL): boolean;
/**
 * Builds a resized/transformed URL for a Blogger/Google-hosted image.
 * Unsupported URLs are returned unchanged rather than throwing, so it's
 * always safe to run any image URL through this function.
 *
 * @param url - Source image URL.
 * @param options - {@link ResizeImageOptions}
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
//#endregion
export { type CookifySetOptions, type ElementInput, type LazifyOptions, type MenuifyOptions, type PluginInstance, type ReplacifyOptions, type ResizeImageOptions, type StickifyOptions, type TocifyOptions, cookify, isSupportedImage, lazify, menuify, replacify, resizeImage, stickify, tocify };