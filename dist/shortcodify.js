/*! blogr-plugins v0.0.1 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrShortcodify = (function(exports) {

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
//#region src/plugins/shortcodify.ts
	const defaults = {
		openTag: "[",
		closeTag: "]",
		unknownTag: "keep",
		recursive: true,
		maxDepth: 5
	};
	function escapeRegExp(str) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
	function coerceAttrValue(raw) {
		if (raw === "true") return true;
		if (raw === "false") return false;
		if (raw !== "" && !Number.isNaN(Number(raw))) return Number(raw);
		return raw;
	}
	function parseAttributes(raw) {
		const attrs = {};
		const attrPattern = /([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s\]/]+)))?/g;
		let match;
		while (match = attrPattern.exec(raw)) {
			const [, key, dq, sq, bare] = match;
			if (dq !== void 0) attrs[key] = coerceAttrValue(dq);
			else if (sq !== void 0) attrs[key] = coerceAttrValue(sq);
			else if (bare !== void 0) attrs[key] = coerceAttrValue(bare);
			else attrs[key] = true;
		}
		return attrs;
	}
	/**
	* Splits `text` into a tree of plain-text and shortcode-element nodes.
	* Handles self-closing tags (`[tag/]`), nesting of unrelated tags, and
	* `[[tag]]` escaping (doubled opening delimiter emits a literal tag with
	* the bracket count reduced by one instead of being parsed).
	*/
	function parse(text, openTag, closeTag) {
		const open = escapeRegExp(openTag);
		const close = escapeRegExp(closeTag);
		const escapedTag = `${open}${open}(/)?([a-zA-Z][\\w-]*)((?:\\s+[^${close}]*)?)\\s*(/)?${close}${close}`;
		const normalTag = `${open}(/)?([a-zA-Z][\\w-]*)((?:\\s+[^${close}]*)?)\\s*(/)?${close}`;
		const tagPattern = new RegExp(`${escapedTag}|${normalTag}`, "g");
		const root = {
			type: "element",
			tag: "",
			attrs: {},
			selfClosing: false,
			raw: "",
			children: []
		};
		const stack = [root];
		let lastIndex = 0;
		let match;
		const pushText = (value) => {
			if (!value) return;
			const top = stack[stack.length - 1];
			const lastChild = top.children[top.children.length - 1];
			if (lastChild?.type === "text") lastChild.value += value;
			else top.children.push({
				type: "text",
				value
			});
		};
		while (match = tagPattern.exec(text)) {
			pushText(text.slice(lastIndex, match.index));
			lastIndex = match.index + match[0].length;
			const [raw, escClosingSlash, escTag, escRawAttrs, escSelfClosingSlash, closingSlash, tag, rawAttrs, selfClosingSlash] = match;
			if (escTag !== void 0) {
				pushText(`${openTag}${escClosingSlash ?? ""}${escTag}${escRawAttrs ?? ""}${escSelfClosingSlash ?? ""}${closeTag}`);
				continue;
			}
			if (closingSlash) {
				const idx = stack.findIndex((node) => node.type === "element" && node.tag === tag);
				if (idx > 0) {
					const opened = stack[idx];
					if (opened.type === "element") opened.closeRaw = raw;
					stack.length = idx;
				} else pushText(raw);
				continue;
			}
			const node = {
				type: "element",
				tag,
				attrs: parseAttributes(rawAttrs ?? ""),
				selfClosing: Boolean(selfClosingSlash),
				raw,
				children: []
			};
			stack[stack.length - 1].children.push(node);
			if (!node.selfClosing) stack.push(node);
		}
		pushText(text.slice(lastIndex));
		return root.children;
	}
	/**
	* Renders a handler's own output for further shortcodes it may contain,
	* e.g. a `[quote]` handler that itself returns `[i]...[/i]`. Only handler
	* *output* is ever re-parsed this way — original source text (including
	* anything that was `[[escaped]]`) is parsed exactly once and never
	* revisited, so escaping stays reliable regardless of recursion.
	*/
	function expandHandlerOutput(result, ctx, depth) {
		if (!ctx.recursive || depth >= ctx.maxDepth || !result.includes(ctx.openTag)) return result;
		return renderTree(parse(result, ctx.openTag, ctx.closeTag), ctx, depth + 1);
	}
	function renderTree(nodes, ctx, depth) {
		let out = "";
		for (const node of nodes) {
			if (node.type === "text") {
				out += node.value;
				continue;
			}
			const innerContent = renderTree(node.children, ctx, depth);
			const handler = ctx.tags[node.tag];
			if (handler) {
				let result;
				try {
					result = handler(node.attrs, innerContent, node.tag);
				} catch (error) {
					ctx.onError?.(error, node.tag);
					result = "";
				}
				out += expandHandlerOutput(result, ctx, depth);
				continue;
			}
			switch (ctx.unknownTag) {
				case "strip":
					out += innerContent;
					break;
				case "remove": break;
				default: out += node.selfClosing ? node.raw : `${node.raw}${innerContent}${node.closeRaw ?? ""}`;
			}
		}
		return out;
	}
	/**
	* Parses and renders `[tag attr="value"]content[/tag]`-style shortcodes in
	* a plain string, given a map of tag → handler. Pure function — does not
	* touch the DOM, so it's the right building block for rendering Blogger
	* post content, RSS/feed text, or any string before it's inserted onto a
	* page.
	*
	* Supports self-closing tags (`[img src="a.jpg"/]`), nested tags
	* (`[quote][b]bold[/b] quote[/quote]`), quoted/unquoted/boolean attributes
	* (`[video src=a.mp4 muted]`), and `[[tag]]` escaping to emit a literal
	* bracketed tag without processing it.
	*
	* @param text - Source text containing zero or more shortcodes.
	* @returns The text with every recognized shortcode replaced by its
	* handler's output.
	*
	* @example
	* ```ts
	* import { renderShortcodes } from "blogr-plugins";
	*
	* const html = renderShortcodes(
	*   "Check out [youtube id=\"dQw4w9WgXcQ\" width=560/] and [b]this[/b].",
	*   {
	*     tags: {
	*       youtube: (attrs) =>
	*         `<iframe width="${attrs.width ?? 560}" height="315" src="https://www.youtube.com/embed/${attrs.id}"></iframe>`,
	*       b: (_attrs, content) => `<strong>${content}</strong>`,
	*     },
	*   },
	* );
	* ```
	*/
	function renderShortcodes(text, options) {
		const opts = {
			...defaults,
			...options
		};
		const ctx = {
			tags: opts.tags,
			unknownTag: opts.unknownTag,
			onError: opts.onError,
			openTag: opts.openTag,
			closeTag: opts.closeTag,
			recursive: opts.recursive,
			maxDepth: opts.maxDepth
		};
		return renderTree(parse(text, opts.openTag, opts.closeTag), ctx, 0);
	}
	/**
	* A small, reusable builder for a tag → handler map, so a shared set of
	* shortcodes (e.g. your site's `[gallery]`, `[youtube]`, `[button]`) can be
	* assembled once and passed to both {@link renderShortcodes} and
	* {@link shortcodify} calls across a codebase.
	*
	* @example
	* ```ts
	* import { createShortcodeRegistry, shortcodify } from "blogr-plugins";
	*
	* const registry = createShortcodeRegistry()
	*   .register("b", (_attrs, content) => `<strong>${content}</strong>`)
	*   .register("color", (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`);
	*
	* shortcodify("#post-body", { tags: registry.tags });
	* ```
	*/
	function createShortcodeRegistry(initial = {}) {
		const tags = { ...initial };
		const registry = {
			/** Live map of every tag registered so far — pass straight into `tags`. */
			tags,
			/** Registers (or overwrites) a single tag's handler. Chainable. */
			register(tag, handler) {
				tags[tag] = handler;
				return registry;
			},
			/** Removes a tag so it falls back to the `unknownTag` policy. Chainable. */
			unregister(tag) {
				delete tags[tag];
				return registry;
			},
			/** Whether a tag currently has a handler. */
			has(tag) {
				return tag in tags;
			}
		};
		return registry;
	}
	/**
	* A handful of ready-made handlers (`b`, `i`, `u`, `url`, `color`) you can
	* spread into your own tag map instead of writing the common ones by hand.
	*
	* @example
	* ```ts
	* import { defaultShortcodeTags, renderShortcodes } from "blogr-plugins";
	*
	* renderShortcodes("[b]Bold[/b] and [url href=\"/x\"]a link[/url]", {
	*   tags: { ...defaultShortcodeTags, ...myOwnTags },
	* });
	* ```
	*/
	const defaultShortcodeTags = {
		b: (_attrs, content) => `<strong>${content}</strong>`,
		i: (_attrs, content) => `<em>${content}</em>`,
		u: (_attrs, content) => `<span style="text-decoration:underline">${content}</span>`,
		color: (attrs, content) => `<span style="color:${attrs.name ?? attrs.value ?? "inherit"}">${content}</span>`,
		url: (attrs, content) => `<a href="${attrs.href ?? "#"}"${attrs.target ? ` target="${attrs.target}"` : ""}>${content}</a>`
	};
	/**
	* DOM-facing version of {@link renderShortcodes}: scans the text nodes
	* inside the given element(s) for shortcodes and replaces each match with
	* its handler's output, in place. A shortcode must live entirely inside one
	* text node to be recognized — for content spanning multiple elements (or
	* before it's inserted into the page at all), call
	* {@link renderShortcodes} on the raw string instead.
	*
	* @param input - Selector, element(s), or jQuery collection to scan.
	* @param options Configuration object.
	* See {@link ShortcodifyOptions}.
	* @returns A {@link PluginInstance} with `destroy()` to revert every replacement.
	*
	* @example
	* ```html
	* <p id="post">Say [b]hello[/b] to [color name="crimson"]Blogr[/color]!</p>
	* ```
	* ```ts
	* import { shortcodify } from "blogr-plugins";
	*
	* shortcodify("#post", {
	*   tags: {
	*     b: (_attrs, content) => `<strong>${content}</strong>`,
	*     color: (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`,
	*   },
	*   allowHtml: true,
	* });
	* ```
	*/
	function shortcodify(input, options) {
		const opts = {
			allowHtml: false,
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
				const updated = renderShortcodes(original, opts);
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
					const referenceNode = textNode.nextSibling;
					for (const n of replacementNodes) parent.insertBefore(n, textNode);
					parent.removeChild(textNode);
					undoFns.push(() => {
						const restored = document.createTextNode(original);
						parent.insertBefore(restored, referenceNode);
						for (const n of replacementNodes) parent.removeChild(n);
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
//#region src/browser/shortcodify.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, {
		shortcodify,
		renderShortcodes,
		createShortcodeRegistry,
		defaultShortcodeTags
	});
	if (hasJQuery()) bindJQueryPlugin(window.jQuery, "shortcodify", (els, options) => shortcodify(els, options));

//#endregion
exports.createShortcodeRegistry = createShortcodeRegistry;
exports.defaultShortcodeTags = defaultShortcodeTags;
exports.renderShortcodes = renderShortcodes;
exports.shortcodify = shortcodify;
return exports;
})({});