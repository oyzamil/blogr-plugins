/* blogr-plugins v0.0.1 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrReplacify = (function(exports) {

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
//#region src/plugins/replacify.ts
	const defaults = { allowHtml: false };
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
	function replacify(input, search, replacement, options = {}) {
		const opts = {
			...defaults,
			...options
		};
		const elements = resolveElements(input);
		const undoFns = [];
		for (const el of elements) {
			const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
			const textNodes = [];
			let node;
			while (node = walker.nextNode()) textNodes.push(node);
			for (const textNode of textNodes) {
				const original = textNode.nodeValue ?? "";
				const updated = original.replace(search, replacement);
				if (updated === original) continue;
				if (!opts.allowHtml || !/</.test(updated)) {
					textNode.nodeValue = updated;
					undoFns.push(() => {
						textNode.nodeValue = original;
					});
				} else {
					const wrapper = document.createElement("span");
					wrapper.innerHTML = updated;
					const parent = textNode.parentNode;
					if (!parent) continue;
					const replacementNodes = Array.from(wrapper.childNodes);
					const anchor = document.createComment("");
					parent.insertBefore(anchor, textNode);
					for (const n of replacementNodes) parent.insertBefore(n, textNode);
					parent.removeChild(textNode);
					undoFns.push(() => {
						const restored = document.createTextNode(original);
						parent.insertBefore(restored, anchor);
						for (const n of replacementNodes) parent.removeChild(n);
						parent.removeChild(anchor);
					});
				}
			}
		}
		return { destroy() {
			for (const undo of undoFns.reverse()) undo();
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
//#region src/browser/replacify.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { replacify });
	if (hasJQuery()) bindJQueryPlugin(window.jQuery, "replacify", (els, search, replacement, options) => replacify(els, search, replacement, options));

//#endregion
exports.replacify = replacify;
return exports;
})({});