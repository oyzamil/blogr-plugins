/* blogr-plugins v0.0.1 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrMenuify = (function(exports) {

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
//#region src/plugins/menuify.ts
	const defaults = {
		nestingPrefix: "_",
		submenuClass: "sub-menu",
		hasSubClass: "has-sub"
	};
	/**
	* Converts a flat `<ul><li><a>` link list into a nested dropdown menu.
	* Any link whose text starts with the nesting prefix (default `_`) is moved
	* into a submenu under the previous non-prefixed link, and the prefix is
	* stripped from its visible text.
	*
	* @param input - Selector, element(s), or jQuery collection for the menu list(s).
	* @param options - {@link MenuifyOptions}
	* @returns A {@link PluginInstance} with `destroy()` to revert the DOM changes.
	*
	* @example
	* ```html
	* <ul class="menu">
	*   <li><a>Home</a></li>
	*   <li><a>Blog</a></li>
	*   <li><a>_Web Design</a></li>
	*   <li><a>_SEO</a></li>
	* </ul>
	* ```
	* ```ts
	* import { menuify } from "blogr-plugins";
	* menuify(".menu");
	* // "Web Design" and "SEO" become a submenu nested under "Blog"
	* ```
	*/
	function menuify(input, options = {}) {
		const opts = {
			...defaults,
			...options
		};
		const lists = resolveElements(input);
		const undoFns = [];
		for (const list of lists) {
			const items = Array.from(list.children).filter((el) => el.tagName === "LI");
			let currentParent = null;
			let currentSubmenu = null;
			const moves = [];
			const textEdits = [];
			const addedSubmenus = [];
			const addedClasses = [];
			for (const li of items) {
				const link = li.querySelector("a");
				if (!link) continue;
				const text = link.textContent ?? "";
				if (text.startsWith(opts.nestingPrefix)) {
					if (!currentParent) continue;
					if (!currentSubmenu) {
						currentSubmenu = document.createElement("ul");
						currentSubmenu.className = opts.submenuClass;
						currentParent.appendChild(currentSubmenu);
						currentParent.classList.add(opts.hasSubClass);
						addedSubmenus.push(currentSubmenu);
						addedClasses.push(currentParent);
					}
					textEdits.push({
						el: link,
						original: text
					});
					link.textContent = text.slice(opts.nestingPrefix.length);
					moves.push({
						li,
						nextSibling: li.nextSibling
					});
					currentSubmenu.appendChild(li);
				} else {
					currentParent = li;
					currentSubmenu = null;
				}
			}
			undoFns.push(() => {
				for (const { el, original } of textEdits) el.textContent = original;
				for (const { li, nextSibling } of moves.reverse()) list.insertBefore(li, nextSibling);
				for (const submenu of addedSubmenus) submenu.remove();
				for (const el of addedClasses) el.classList.remove(opts.hasSubClass);
			});
		}
		return { destroy() {
			for (const undo of undoFns) undo();
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
//#region src/browser/menuify.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { menuify });
	if (hasJQuery()) bindJQueryPlugin(window.jQuery, "menuify", (els, options) => menuify(els, options));

//#endregion
exports.menuify = menuify;
return exports;
})({});