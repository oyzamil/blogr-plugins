import type { ElementInput, PluginInstance } from "../types.js";

import { resolveElements } from "../utils/dom.js";

/** Configuration options for {@link lazify}. */
export interface LazifyOptions {
	/** Attribute holding the real image URL. Default `"data-src"`. */
	attribute?: string;
	/** Class added once the image has finished loading. Default `"lazy-ify"`. */
	loadedClass?: string;
	/** Root margin passed to the underlying `IntersectionObserver`. Default `"200px"`. */
	rootMargin?: string;
	/** Called after each element finishes loading. */
	onLoad?: (el: Element) => void;
}

const defaults: Required<Omit<LazifyOptions, "onLoad">> = {
	attribute: "data-src",
	loadedClass: "lazy-ify",
	rootMargin: "200px",
};

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
				const url = el.getAttribute(opts.attribute);
				if (!url) continue;

				if (el instanceof HTMLImageElement) {
					el.src = url;
				} else {
					(el as HTMLElement).style.backgroundImage = `url(${url})`;
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
