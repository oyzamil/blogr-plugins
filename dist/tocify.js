/*! blogr-plugins v0.0.1 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrTocify = (function(exports) {

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
//#region src/plugins/tocify.ts
	const defaults = { headings: "h1,h2,h3" };
	function slugify(text, used) {
		const base = text.trim().replace(/\s+/g, "_") || "heading";
		let id = base;
		let i = 1;
		while (used.has(id) || document.getElementById(id)) id = `${base}_${i++}`;
		used.add(id);
		return id;
	}
	/**
	* Builds a nested table-of-contents `<ul>` from the headings found inside a
	* container, assigning an `id` to each heading (if it doesn't already have
	* one) so the TOC links can jump to them.
	*
	* @param input - Selector, element, or jQuery collection to render the TOC into.
	* @param options Configuration object.
	* See {@link TocifyOptions}.
	* @returns A {@link PluginInstance} with `destroy()` to remove the generated TOC.
	*
	* @example
	* ```ts
	* import { tocify } from "blogr-plugins";
	* tocify("#toc", { content: "#article", headings: "h2,h3" });
	* ```
	*/
	function tocify(input, options = {}) {
		const opts = {
			...defaults,
			...options
		};
		const targets = resolveElements(input);
		const cleanups = [];
		for (const target of targets) {
			const contentRoot = opts.content ? resolveElements(opts.content)[0] ?? target : target;
			const headings = Array.from(contentRoot.querySelectorAll(opts.headings));
			const used = /* @__PURE__ */ new Set();
			const levels = opts.headings.split(",").map((s) => s.trim());
			const stack = [];
			const root = document.createElement("ul");
			root.className = "toc-list";
			stack.push({
				level: -1,
				list: root
			});
			for (const heading of headings) {
				if (!heading.id) heading.id = slugify(heading.textContent ?? "", used);
				const level = levels.indexOf(heading.tagName.toLowerCase());
				while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
				const parent = stack[stack.length - 1].list;
				const li = document.createElement("li");
				const a = document.createElement("a");
				a.href = `#${heading.id}`;
				a.textContent = heading.textContent ?? "";
				li.appendChild(a);
				parent.appendChild(li);
				const sublist = document.createElement("ul");
				li.appendChild(sublist);
				stack.push({
					level,
					list: sublist
				});
			}
			root.querySelectorAll("ul").forEach((ul) => {
				if (ul.children.length === 0) ul.remove();
			});
			target.appendChild(root);
			cleanups.push(() => root.remove());
		}
		return { destroy() {
			for (const cleanup of cleanups) cleanup();
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
//#region src/browser/tocify.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { tocify });
	if (hasJQuery()) bindJQueryPlugin(window.jQuery, "tocify", (els, options) => tocify(els, options));

//#endregion
exports.tocify = tocify;
return exports;
})({});