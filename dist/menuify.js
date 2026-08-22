/*! blogr-plugins v0.0.4 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
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
//#region src/utils/merge-options.ts
/**
	* Merges user-supplied options over a set of defaults, dropping any key
	* whose value is explicitly `undefined` first.
	*
	* Plain `{ ...defaults, ...options }` lets `{ someOption: undefined }` (e.g.
	* from a form field that's blank, or a variable that happens to be
	* `undefined`) silently overwrite a real default instead of falling back to
	* it — a common footgun. This closes that gap.
	*
	* @param defaultValues - The base/default option values.
	* @param options - User-supplied options; `undefined`-valued keys are ignored.
	* @returns A merged object with every default preserved unless the caller
	* gave it an actual (non-`undefined`) value.
	*/
	function mergeOptions(defaultValues, options) {
		const cleaned = {};
		for (const key of Object.keys(options)) if (options[key] !== void 0) cleaned[key] = options[key];
		return {
			...defaultValues,
			...cleaned
		};
	}

//#endregion
//#region src/plugins/menuify.ts
	const defaults = {
		nestingPrefix: "_",
		submenuClass: "sub-menu",
		hasSubClass: "has-sub",
		chevronText: "<"
	};
	function menuify(input, options = {}) {
		const opts = mergeOptions(defaults, options);
		const lists = resolveElements(input);
		const undoFns = [];
		for (const list of lists) {
			const items = Array.from(list.children).filter((el) => el.tagName === "LI");
			const levelParents = [];
			const levelSubmenus = [];
			const moves = [];
			const textEdits = [];
			const addedSubmenus = [];
			const addedClasses = [];
			const addedChevrons = [];
			const prefixChar = opts.nestingPrefix.charAt(0);
			for (const li of items) {
				const link = li.querySelector("a");
				if (!link) continue;
				const text = link.textContent ?? "";
				let depth = 0;
				while (depth < text.length && text[depth] === prefixChar) depth++;
				if (depth > 0) {
					if (depth - 1 >= levelParents.length) continue;
					const parentLi = levelParents[depth - 1];
					let submenu = levelSubmenus[depth - 1];
					if (!submenu) {
						submenu = document.createElement("ul");
						submenu.className = opts.submenuClass;
						parentLi.appendChild(submenu);
						parentLi.classList.add(opts.hasSubClass);
						const parentLink = parentLi.querySelector("a");
						if (parentLink) {
							const chevron = document.createElement("span");
							chevron.className = "chevron";
							chevron.textContent = opts.chevronText;
							parentLink.appendChild(chevron);
							addedChevrons.push(chevron);
						}
						addedSubmenus.push(submenu);
						addedClasses.push(parentLi);
						levelSubmenus[depth - 1] = submenu;
					}
					textEdits.push({
						el: link,
						original: text
					});
					link.textContent = text.slice(depth);
					moves.push({
						li,
						nextSibling: li.nextSibling
					});
					submenu.appendChild(li);
					levelParents[depth] = li;
					if (levelSubmenus.length < depth) levelSubmenus.length = depth;
				} else {
					levelParents.length = 1;
					levelSubmenus.length = 0;
					levelParents[0] = li;
				}
			}
			undoFns.push(() => {
				for (const { el, original } of textEdits) el.textContent = original;
				for (const { li, nextSibling } of moves.reverse()) list.insertBefore(li, nextSibling);
				for (const submenu of addedSubmenus) submenu.remove();
				for (const el of addedClasses) el.classList.remove(opts.hasSubClass);
				for (const chevron of addedChevrons) chevron.remove();
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