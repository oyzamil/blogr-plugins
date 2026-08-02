import type { ElementInput, PluginInstance } from "../types.js";

import { resolveElements } from "../utils/dom.js";

/** Configuration options for {@link lazify}. */
export interface LazifyOptions {
	/** Attribute holding the real media URL. Default `"data-src"`. */
	attribute?: string;
	/** Attribute holding a `<video>`'s poster image URL. Default `"data-poster"`. */
	posterAttribute?: string;
	/** Class added once an element has finished loading. Default `"lazy-ify"`. */
	loadedClass?: string;
	/** Root margin passed to the underlying `IntersectionObserver`. Default `"200px"`. */
	rootMargin?: string;
	/** Called after each element finishes loading. */
	onLoad?: (el: Element) => void;
}

const defaults: Required<Omit<LazifyOptions, "onLoad">> = {
	attribute: "data-src",
	posterAttribute: "data-poster",
	loadedClass: "lazy-ify",
	rootMargin: "200px",
};

/**
 * Loads a `<video>`'s poster and/or sources once it's due, either from a
 * `data-src` on the video itself or from `<source data-src>` children (so
 * the browser's own format-negotiation still works). Returns `true` if
 * anything was actually set.
 */
function loadVideo(
	video: HTMLVideoElement,
	opts: Required<Omit<LazifyOptions, "onLoad">>,
): boolean {
	let loaded = false;

	const poster = video.getAttribute(opts.posterAttribute);
	if (poster) {
		video.poster = poster;
		loaded = true;
	}

	const sources = video.querySelectorAll<HTMLSourceElement>(
		`source[${opts.attribute}]`,
	);
	if (sources.length > 0) {
		for (const source of Array.from(sources)) {
			const src = source.getAttribute(opts.attribute);
			if (src) {
				source.src = src;
				loaded = true;
			}
		}
		if (loaded) video.load();
	} else {
		const src = video.getAttribute(opts.attribute);
		if (src) {
			video.src = src;
			video.load();
			loaded = true;
		}
	}

	return loaded;
}

/**
 * Lazily loads media once it scrolls near the viewport, using
 * `IntersectionObserver`. Handles `<img>` (sets `src`), `<iframe>` (sets
 * `src`), `<video>` (sets `src`/poster directly, or fills in `<source
 * data-src>` children and calls `.load()`), and falls back to setting
 * `background-image` on any other element.
 *
 * @param input - Selector, element(s), or jQuery collection to lazy-load.
 * @param options - {@link LazifyOptions}
 * @returns A {@link PluginInstance} with `destroy()` to stop observing.
 *
 * @example
 * ```html
 * <img data-src="/photo.jpg" alt="" />
 * <iframe data-src="https://example.com/embed"></iframe>
 * <video data-poster="/poster.jpg" controls>
 * 	<source data-src="/clip.webm" type="video/webm" />
 * 	<source data-src="/clip.mp4" type="video/mp4" />
 * </video>
 * ```
 * ```ts
 * import { lazify } from "blogr-plugins";
 * lazify("img[data-src], iframe[data-src], video");
 * ```
 */
export function lazify(
	input: ElementInput,
	options: LazifyOptions = {},
): PluginInstance {
	const opts = { ...defaults, ...options };
	const elements = resolveElements(input);

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const el = entry.target;

				if (el instanceof HTMLVideoElement) {
					if (!loadVideo(el, opts)) continue;
				} else {
					const url = el.getAttribute(opts.attribute);
					if (!url) continue;

					if (el instanceof HTMLImageElement) {
						el.src = url;
					} else if (el instanceof HTMLIFrameElement) {
						el.src = url;
					} else {
						(el as HTMLElement).style.backgroundImage = `url(${url})`;
					}
				}

				el.classList.add(opts.loadedClass);
				observer.unobserve(el);
				opts.onLoad?.(el);
			}
		},
		{ rootMargin: opts.rootMargin },
	);

	for (const el of elements) observer.observe(el);

	return {
		destroy() {
			observer.disconnect();
		},
	};
}
