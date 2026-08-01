/* blogr-plugins v0.0.1 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
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
		loadedClass: "lazy-ify",
		rootMargin: "200px"
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
				const url = el.getAttribute(opts.attribute);
				if (!url) continue;
				if (el instanceof HTMLImageElement) el.src = url;
				else el.style.backgroundImage = `url(${url})`;
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