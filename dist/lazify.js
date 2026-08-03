/*! blogr-plugins v0.0.1 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrLazify = (function(exports) {

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//#region src/utils/dom.ts
/**
	* Normalizes any supported input (selector string, Element, NodeList, array,
	* or jQuery collection) into a plain array of Elements.
	*
	* @param input - Selector string, Element, element list, or jQuery object.
	* @returns Array of matched elements. Empty if nothing matched.
	*/
	function resolveElements(input) {
		if (typeof input === "string") return Array.from(document.querySelectorAll(input));
		if (input instanceof Element) return [input];
		if (input == null) return [];
		return Array.from(input);
	}

//#endregion
//#region src/plugins/lazify.ts
	const defaults = {
		attribute: "data-src",
		posterAttribute: "data-poster",
		loadedClass: "lazy-ify",
		rootMargin: "200px"
	};
	/**
	* Loads a `<video>`'s poster and/or sources once it's due, either from a
	* `data-src` on the video itself or from `<source data-src>` children (so
	* the browser's own format-negotiation still works). Returns `true` if
	* anything was actually set.
	*/
	function loadVideo(video, opts) {
		let loaded = false;
		const poster = video.getAttribute(opts.posterAttribute);
		if (poster) {
			video.poster = poster;
			loaded = true;
		}
		const sources = video.querySelectorAll(`source[${opts.attribute}]`);
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
	* @param options Configuration object.
	* See {@link LazifyOptions}.
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
	function lazify(input, options = {}) {
		const opts = {
			...defaults,
			...options
		};
		const elements = resolveElements(input);
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const el = entry.target;
				if (el instanceof HTMLVideoElement) {
					if (!loadVideo(el, opts)) continue;
				} else {
					const url = el.getAttribute(opts.attribute);
					if (!url) continue;
					if (el instanceof HTMLImageElement) el.src = url;
					else if (el instanceof HTMLIFrameElement) el.src = url;
					else el.style.backgroundImage = `url(${url})`;
				}
				el.classList.add(opts.loadedClass);
				observer.unobserve(el);
				opts.onLoad?.(el);
			}
		}, { rootMargin: opts.rootMargin });
		for (const el of elements) observer.observe(el);
		return { destroy() {
			observer.disconnect();
		} };
	}

//#endregion
//#region src/utils/jquery-bridge.ts
/**
	* Registers one jQuery plugin method (`$.fn[name]`) that wraps a Blogr
	* plugin function. Skips silently if jQuery isn't present or the method
	* already exists.
	*
	* @param jq - jQuery instance (`window.jQuery`).
	* @param name - Method name, e.g. `"stickify"`.
	* @param fn - Underlying plugin function `(elements, ...args) => PluginInstance`.
	*/
	function bindJQueryPlugin(jq, name, fn) {
		if (!jq || !jq.fn || jq.fn[name]) return;
		jq.fn[name] = function(...args) {
			const instance = fn(this.get(), ...args);
			this.data(`blogr-${name}`, instance);
			return this;
		};
	}
	/** True when jQuery is present on `window`. */
	function hasJQuery() {
		return typeof window !== "undefined" && typeof window.jQuery === "function";
	}

//#endregion
//#region src/browser/lazify.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { lazify });
	if (hasJQuery()) bindJQueryPlugin(window.jQuery, "lazify", (els, options) => lazify(els, options));

//#endregion
exports.lazify = lazify;
return exports;
})({});