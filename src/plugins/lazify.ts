import type { ElementInput, PluginInstance } from "../types.js";

import { resolveElements } from "../utils/dom.js";

/** Configuration options for {@link lazify}. */
export interface LazifyOptions {
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

type ResolvedOptions = Required<Omit<LazifyOptions, "onLoad" | "onError">>;

const BLANK_PLACEHOLDER =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const defaults: ResolvedOptions = {
	attribute: "data-src",
	posterAttribute: "data-poster",
	bgImageAttribute: "data-bg-image",
	loadedClass: "lazy-ify",
	errorClass: "lazy-ify-error",
	rootMargin: "200px",
	placeholder: BLANK_PLACEHOLDER,
};

/** Sets a blank placeholder so nothing shows a broken-image icon pre-load. */
function applyPlaceholder(el: Element, opts: ResolvedOptions): void {
	if (!opts.placeholder) return;

	if (el instanceof HTMLImageElement) {
		if (!el.getAttribute("src")) el.src = opts.placeholder;
	} else if (el instanceof HTMLVideoElement) {
		if (!el.getAttribute("poster")) el.poster = opts.placeholder;
	} else if (!(el instanceof HTMLIFrameElement)) {
		const style = (el as HTMLElement).style;
		if (!style.backgroundImage) {
			style.backgroundImage = `url(${opts.placeholder})`;
		}
	}
}

/**
 * Loads a `<video>`'s poster and/or sources once it's due, either from a
 * `data-src` on the video itself or from `<source data-src>` children (so
 * the browser's own format-negotiation still works). Calls `onDone` once
 * the video actually finishes loading data or errors out.
 *
 * Note: the poster image's own success/failure isn't tracked separately —
 * `onDone` reflects the video source(s) only.
 *
 * @returns `true` if anything was actually set (and `onDone` will fire).
 */
function loadVideo(
	video: HTMLVideoElement,
	opts: ResolvedOptions,
	onDone: (success: boolean, event?: Event) => void,
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
	} else {
		const src = video.getAttribute(opts.attribute);
		if (src) {
			video.src = src;
			loaded = true;
		}
	}

	if (loaded) {
		video.addEventListener("loadeddata", () => onDone(true), {
			once: true,
		});
		video.addEventListener("error", (event) => onDone(false, event), {
			once: true,
		});
		video.load();
	}

	return loaded;
}

/** Preloads a URL as background-image, since CSS gives no load/error events. */
function loadBackgroundImage(
	el: Element,
	url: string,
	onDone: (success: boolean, event?: Event) => void,
): void {
	const preload = new Image();
	preload.addEventListener(
		"load",
		() => {
			(el as HTMLElement).style.backgroundImage = `url(${url})`;
			onDone(true);
		},
		{ once: true },
	);
	preload.addEventListener("error", (event) => onDone(false, event), {
		once: true,
	});
	preload.src = url;
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
export function lazify(
	input: ElementInput,
	options: LazifyOptions = {},
): PluginInstance {
	const opts: ResolvedOptions = { ...defaults, ...options };
	const onLoadCb = options.onLoad;
	const onErrorCb = options.onError;
	const elements = resolveElements(input);

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const el = entry.target;

				const finish = (success: boolean, event?: Event) => {
					el.classList.remove(opts.loadedClass, opts.errorClass);
					el.classList.add(success ? opts.loadedClass : opts.errorClass);
					if (success) {
						onLoadCb?.(el);
					} else {
						onErrorCb?.(el, event ?? new Event("error"));
					}
				};

				if (el instanceof HTMLVideoElement) {
					if (!loadVideo(el, opts, finish)) {
						observer.unobserve(el);
						continue;
					}
				} else {
					const bgUrl = el.getAttribute(opts.bgImageAttribute);

					if (bgUrl) {
						loadBackgroundImage(el, bgUrl, finish);
					} else {
						const url = el.getAttribute(opts.attribute);
						if (!url) {
							observer.unobserve(el);
							continue;
						}

						if (el instanceof HTMLImageElement) {
							el.addEventListener("load", () => finish(true), {
								once: true,
							});
							el.addEventListener("error", (event) => finish(false, event), {
								once: true,
							});
							el.src = url;
						} else if (el instanceof HTMLIFrameElement) {
							el.addEventListener("load", () => finish(true), {
								once: true,
							});
							el.addEventListener("error", (event) => finish(false, event), {
								once: true,
							});
							el.src = url;
						} else {
							loadBackgroundImage(el, url, finish);
						}
					}
				}

				observer.unobserve(el);
			}
		},
		{ rootMargin: opts.rootMargin },
	);

	for (const el of elements) {
		applyPlaceholder(el, opts);
		observer.observe(el);
	}

	return {
		destroy() {
			observer.disconnect();
		},
	};
}
