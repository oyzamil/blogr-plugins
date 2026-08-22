/*! blogr-plugins v0.0.4 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrResizeImage = (function(exports) {

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//#region src/plugins/resizeImage.ts
/**
	* Detects and rewrites Blogger-hosted media URLs:
	* - Blogger/Google-hosted images (`googleusercontent.com` / `*.blogspot.com`,
	*   both the old path-segment URL shape and the newer `=`-suffixed shape)
	*   with new size, crop, format, flip and rotation parameters.
	* - YouTube video thumbnails (`i.ytimg.com`, `img.youtube.com`, and the
	*   `i1`–`i4.ytimg.com` mirrors), rewritten to a chosen quality preset and
	*   always served as WebP — YouTube's thumbnail CDN doesn't support the
	*   width/height/crop/flip/rotate params Blogger images do.
	*/
	/** Matches Blogger/Google-hosted image URLs (old and new URL shapes). */
	const HOST_PATTERN = /^(https?:)?(\/\/)[^/]*\.(googleusercontent\.com|blogspot\.com)/;
	/**
	* Matches the new `=`-suffixed param segment (e.g. `...=w1200-h675-rw`).
	* Checked before {@link OLD_SHAPE_PATTERN} — an explicit `=` near the end
	* of the URL is an unambiguous signal, whereas the old-shape pattern can
	* spuriously match *any* path segment (or even the host) that happens to
	* sit right before something with a dot in it.
	*/
	const NEW_SHAPE_PATTERN = /(?<==)[^=&?/]+(?=\?|$)/;
	/**
	* Matches the old path-segment param shape (e.g. `.../s1600/photo.jpg`):
	* the path segment right before the filename.
	*/
	const OLD_SHAPE_PATTERN = /[^/]+(?=\/[^/]+\.[^/?]+(?:\?|$))/;
	/**
	* Locates the resizable param segment within a Blogger image URL, trying
	* the new `=`-suffixed shape first and falling back to the old
	* path-segment shape. Returns `null` if neither shape is present.
	*/
	function findParamSegment(str) {
		return str.match(NEW_SHAPE_PATTERN) ?? str.match(OLD_SHAPE_PATTERN);
	}
	/**
	* Matches a YouTube thumbnail URL and captures its protocol, video ID and
	* trailing query string. Covers both `i.ytimg.com`/`i1`–`i4.ytimg.com` and
	* `img.youtube.com`, and both the plain (`/vi/`) and WebP (`/vi_webp/`)
	* variants, in `.jpg`, `.jpeg` or `.webp`.
	*/
	const YOUTUBE_THUMBNAIL_PATTERN = /^(https?:)?(\/\/)(?:i[1-4]?\.ytimg\.com|img\.youtube\.com)\/vi(?:_webp)?\/([^/]+)\/[a-z0-9]+\.(?:jpe?g|webp)((?:\?[^#]*)?)$/i;
	/** Recognized boolean-flag param prefixes (`present` = on, `absent` = off). */
	const BOOLEAN_PARAMS = /* @__PURE__ */ new Set([
		"nu",
		"c",
		"cc",
		"ci",
		"p",
		"fh",
		"fv",
		"pd",
		"rj",
		"rp",
		"rw",
		"rwa",
		"rg",
		"rh",
		"h",
		"d",
		"no",
		"o",
		"k"
	]);
	/** Recognized numeric param prefixes. */
	const NUMBER_PARAMS = /* @__PURE__ */ new Set([
		"w",
		"h",
		"s",
		"r",
		"ba",
		"br",
		"b",
		"e",
		"a"
	]);
	/** Prefixes that force a specific output format; mutually exclusive. */
	const FORMAT_PARAMS = [
		"rj",
		"rp",
		"rw",
		"rwa",
		"rg",
		"rh"
	];
	/** Prefixes that flip the image; mutually exclusive. */
	const FLIP_PARAMS = ["fh", "fv"];
	/** Prefixes that crop the image into a circle or square; mutually exclusive. */
	const CROP_PARAMS = ["cc", "ci"];
	const defaults = {
		height: 360,
		width: 640,
		format: "webp",
		ytThumbnail: "maxresdefault"
	};
	function toUrlString(url) {
		if (url instanceof URL) return url.toString();
		if (typeof url === "string") return url;
		throw new TypeError("Argument 'url' must be of type string | URL");
	}
	/**
	* Parses a single `-`-delimited param segment part (e.g. `"w400"`, `"cc"`,
	* `"c0xFF0000"`) into its kind, prefix and value.
	*/
	function getParamInfo(part) {
		const hexMatch = /^(c|bc|pc)(0x[0-9A-Fa-f]{6,8})$/.exec(part);
		if (hexMatch?.[1] && hexMatch[2]) return [
			"hex",
			hexMatch[1],
			hexMatch[2]
		];
		const numMatch = /^([a-z]{1,3})(\d+)$/i.exec(part);
		if (numMatch?.[1] && NUMBER_PARAMS.has(numMatch[1])) return [
			"num",
			numMatch[1],
			Number(numMatch[2])
		];
		if (BOOLEAN_PARAMS.has(part)) return [
			"bool",
			part,
			true
		];
		return null;
	}
	/** Parses a full `-`-delimited param segment into an ordered param map. */
	function parseParams(segment) {
		const params = /* @__PURE__ */ new Map();
		for (const part of segment.split("-")) {
			const info = getParamInfo(part);
			if (!info) continue;
			const [kind, prefix, value] = info;
			params.set(prefix, {
				kind,
				value
			});
		}
		return params;
	}
	/** Serializes a param map back into a `-`-delimited segment. */
	function serializeParams(params) {
		const parts = [];
		for (const [prefix, { kind, value }] of params) parts.push(kind === "bool" ? prefix : `${prefix}${value}`);
		return parts.join("-");
	}
	/** Sets `prefix` and deletes every other prefix in `group` from `params`. */
	function setExclusive(params, group, prefix) {
		for (const other of group) if (other !== prefix) params.delete(other);
		params.set(prefix, {
			kind: "bool",
			value: true
		});
	}
	/**
	* Rewrites a YouTube thumbnail URL to the requested quality preset, always
	* served through the WebP-capable `i.ytimg.com/vi_webp/` path regardless of
	* which mirror host or extension the original URL used.
	*/
	function resizeYouTubeThumbnail(match, options) {
		const protocol = match[1] ?? "https:";
		const videoId = match[3];
		const query = match[4] ?? "";
		return `${protocol}//i.ytimg.com/vi_webp/${videoId}/${options.ytThumbnail ?? defaults.ytThumbnail}.webp${query}`;
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
	function isSupportedImage(url) {
		const str = toUrlString(url);
		if (YOUTUBE_THUMBNAIL_PATTERN.test(str)) return true;
		return HOST_PATTERN.test(str) && findParamSegment(str) !== null;
	}
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
	function resizeImage(url, options = {}) {
		const str = toUrlString(url);
		const ytMatch = str.match(YOUTUBE_THUMBNAIL_PATTERN);
		if (ytMatch) return resizeYouTubeThumbnail(ytMatch, options);
		if (!HOST_PATTERN.test(str)) return str;
		const match = findParamSegment(str);
		if (!match?.[0] || match.index === void 0) return str;
		const params = parseParams(match[0]);
		params.delete("s");
		params.set("w", {
			kind: "num",
			value: options.width ?? defaults.width
		});
		params.set("h", {
			kind: "num",
			value: options.height ?? defaults.height
		});
		const format = options.format ?? defaults.format;
		if (format === "jpeg") setExclusive(params, FORMAT_PARAMS, "rj");
		else if (format === "png") setExclusive(params, FORMAT_PARAMS, "rp");
		else if (format === "webp") setExclusive(params, FORMAT_PARAMS, "rw");
		if (options.crop === "circle") setExclusive(params, CROP_PARAMS, "cc");
		else if (options.crop === "square") setExclusive(params, CROP_PARAMS, "ci");
		if (options.flip === "horizontally") setExclusive(params, FLIP_PARAMS, "fh");
		else if (options.flip === "vertically") setExclusive(params, FLIP_PARAMS, "fv");
		if (options.rotate !== void 0) if (options.rotate === 90 || options.rotate === 180 || options.rotate === 270) params.set("r", {
			kind: "num",
			value: options.rotate
		});
		else params.delete("r");
		const newSegment = serializeParams(params);
		return `${str.slice(0, match.index)}${newSegment}${str.slice(match.index + match[0].length)}`;
	}

//#endregion
//#region src/browser/resizeImage.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, {
		resizeImage,
		isSupportedImage
	});

//#endregion
exports.isSupportedImage = isSupportedImage;
exports.resizeImage = resizeImage;
return exports;
})({});