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
		bgImageAttribute: "data-bg-image",
		loadedClass: "lazy-ify",
		errorClass: "lazy-ify-error",
		rootMargin: "200px",
		placeholder: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
	};
	/** Sets a blank placeholder so nothing shows a broken-image icon pre-load. */
	function applyPlaceholder(el, opts) {
		if (!opts.placeholder) return;
		if (el instanceof HTMLImageElement) {
			if (!el.getAttribute("src")) el.src = opts.placeholder;
		} else if (el instanceof HTMLVideoElement) {
			if (!el.getAttribute("poster")) el.poster = opts.placeholder;
		} else if (!(el instanceof HTMLIFrameElement)) {
			const style = el.style;
			if (!style.backgroundImage) style.backgroundImage = `url(${opts.placeholder})`;
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
	function loadVideo(video, opts, onDone) {
		let loaded = false;
		const poster = video.getAttribute(opts.posterAttribute);
		if (poster) {
			video.poster = poster;
			loaded = true;
		}
		const sources = video.querySelectorAll(`source[${opts.attribute}]`);
		if (sources.length > 0) for (const source of Array.from(sources)) {
			const src = source.getAttribute(opts.attribute);
			if (src) {
				source.src = src;
				loaded = true;
			}
		}
		else {
			const src = video.getAttribute(opts.attribute);
			if (src) {
				video.src = src;
				loaded = true;
			}
		}
		if (loaded) {
			video.addEventListener("loadeddata", () => onDone(true), { once: true });
			video.addEventListener("error", (event) => onDone(false, event), { once: true });
			video.load();
		}
		return loaded;
	}
	/** Preloads a URL as background-image, since CSS gives no load/error events. */
	function loadBackgroundImage(el, url, onDone) {
		const preload = new Image();
		preload.addEventListener("load", () => {
			el.style.backgroundImage = `url(${url})`;
			onDone(true);
		}, { once: true });
		preload.addEventListener("error", (event) => onDone(false, event), { once: true });
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
	function lazify(input, options = {}) {
		const opts = {
			...defaults,
			...options
		};
		const onLoadCb = options.onLoad;
		const onErrorCb = options.onError;
		const elements = resolveElements(input);
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const el = entry.target;
				const finish = (success, event) => {
					el.classList.remove(opts.loadedClass, opts.errorClass);
					el.classList.add(success ? opts.loadedClass : opts.errorClass);
					if (success) onLoadCb?.(el);
					else onErrorCb?.(el, event ?? new Event("error"));
				};
				if (el instanceof HTMLVideoElement) {
					if (!loadVideo(el, opts, finish)) {
						observer.unobserve(el);
						continue;
					}
				} else {
					const bgUrl = el.getAttribute(opts.bgImageAttribute);
					if (bgUrl) loadBackgroundImage(el, bgUrl, finish);
					else {
						const url = el.getAttribute(opts.attribute);
						if (!url) {
							observer.unobserve(el);
							continue;
						}
						if (el instanceof HTMLImageElement) {
							el.addEventListener("load", () => finish(true), { once: true });
							el.addEventListener("error", (event) => finish(false, event), { once: true });
							el.src = url;
						} else if (el instanceof HTMLIFrameElement) {
							el.addEventListener("load", () => finish(true), { once: true });
							el.addEventListener("error", (event) => finish(false, event), { once: true });
							el.src = url;
						} else loadBackgroundImage(el, url, finish);
					}
				}
				observer.unobserve(el);
			}
		}, { rootMargin: opts.rootMargin });
		for (const el of elements) {
			applyPlaceholder(el, opts);
			observer.observe(el);
		}
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