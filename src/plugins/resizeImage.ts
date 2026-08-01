/**
 * Detects and rewrites Blogger/Google-hosted image URLs
 * (`googleusercontent.com` / `bp.blogspot.com`) with new size, crop,
 * format, flip, rotation and grayscale parameters.
 */

const HOST_PATTERN =
	/^(https?:)?(\/\/)[^/]*\.(googleusercontent\.com|blogspot\.com)/;
const PARAM_SEGMENT_PATTERN =
	/[^/]+(?=\/[^/]+\.[^/?]+(?:\?|$))|(?<==)[^=&?/]+(?=\?|$)/;

/** Configuration options for {@link resizeImage}. */
export interface ResizeImageOptions {
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

const defaults: Required<
	Pick<
		ResizeImageOptions,
		"height" | "width" | "format" | "rotate" | "grayscale"
	>
> = {
	height: 360,
	width: 640,
	format: "webp",
	rotate: 0,
	grayscale: false,
};

function toUrlString(url: string | URL): string {
	if (url instanceof URL) return url.toString();
	if (typeof url === "string") return url;
	throw new TypeError("Argument 'url' must be of type string | URL");
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
export function isSupportedImage(url: string | URL): boolean {
	const str = toUrlString(url);
	return HOST_PATTERN.test(str) && PARAM_SEGMENT_PATTERN.test(str);
}

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
export function resizeImage(
	url: string | URL,
	options: ResizeImageOptions = {},
): string {
	const str = toUrlString(url);

	if (!HOST_PATTERN.test(str)) return str;

	const match = str.match(PARAM_SEGMENT_PATTERN);
	if (!match?.[0] || match.index === undefined) return str;

	const opts = { ...defaults, ...options };
	const params: string[] = [`w${opts.width}`, `h${opts.height}`];

	if (opts.crop === "circle") params.push("cc");
	else if (opts.crop === "square") params.push("ci");

	if (opts.format === "jpeg") params.push("rj");
	else if (opts.format === "png") params.push("rp");
	else if (opts.format === "webp") params.push("rw");

	if (opts.flip === "horizontally") params.push("fh");
	else if (opts.flip === "vertically") params.push("fv");

	if (opts.rotate === 90 || opts.rotate === 180 || opts.rotate === 270) {
		params.push(`r${opts.rotate}`);
	}

	if (opts.grayscale) params.push("bw");

	return `${str.slice(0, match.index)}${params.join("-")}${str.slice(match.index + match[0].length)}`;
}
