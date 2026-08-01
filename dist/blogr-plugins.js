/* blogr-plugins v0.0.1 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrPlugins = (function(exports) {

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
//#region src/plugins/stickify.ts
/*!
	* Sticky-sidebar engine adapted from Theia Sticky Sidebar v2.0.0
	* https://github.com/WeCodePixels/theia-sticky-sidebar
	* Copyright 2013-2025 WeCodePixels and other contributors
	* Released under the MIT license
	*
	* Ported into blogr-plugins: wrapped behind the shared ElementInput /
	* PluginInstance shape used by every plugin in this package, options
	* renamed to camelCase-consistent style, `elements` folded into the
	* function's first argument instead of living inside options.
	*/
	const defaults$5 = {
		containerSelector: "",
		additionalMarginTop: 0,
		additionalMarginBottom: 0,
		updateSidebarHeight: true,
		minWidth: 0,
		disableOnResponsiveLayouts: true,
		sidebarBehavior: "modern",
		defaultPosition: "relative",
		verbose: false
	};
	function getOffset(element) {
		const rect = element.getBoundingClientRect();
		return {
			top: rect.top + window.scrollY - document.documentElement.clientTop,
			left: rect.left + window.scrollX - document.documentElement.clientLeft
		};
	}
	function getOuterWidth(element) {
		const style = getComputedStyle(element);
		return element.getBoundingClientRect().width + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
	}
	function isVisible(element) {
		return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	}
	function resetSidebar(s) {
		s.sidebar.style.minHeight = "1px";
		Object.assign(s.stickySidebar.style, {
			position: "static",
			width: "",
			transform: "none"
		});
	}
	function getClearedHeight(element) {
		let height = element.getBoundingClientRect().height;
		for (const child of Array.from(element.children)) height = Math.max(height, child.getBoundingClientRect().height);
		return height;
	}
	/**
	* Makes a sidebar stick to the viewport while scrolling, clamped to its
	* container so it never overflows past the container's bottom edge. Full
	* option-parity port of Theia Sticky Sidebar, so it supports the same
	* `modern` / `stick-to-top` / `stick-to-bottom` behaviors and layout edge
	* cases (collapsible margins, floated multi-column layouts, responsive
	* stacking) as the original.
	*
	* @param input - Selector, element(s), or jQuery collection for the sidebar(s).
	* @param options - {@link StickifyOptions}
	* @returns A {@link PluginInstance} with `destroy()` to unbind everything and restore original styles.
	*
	* @example
	* ```ts
	* import { stickify } from "blogr-plugins";
	* stickify(".leftSidebar, .content, .rightSidebar", { additionalMarginTop: 30 });
	* ```
	*/
	function stickify(input, options = {}) {
		const opts = {
			...defaults$5,
			...options
		};
		opts.additionalMarginTop = Math.floor(opts.additionalMarginTop);
		opts.additionalMarginBottom = Math.floor(opts.additionalMarginBottom);
		const elements = resolveElements(input);
		const states = [];
		let initialized = false;
		function tryInit() {
			if (initialized) return true;
			if (document.body.getBoundingClientRect().width < opts.minWidth) return false;
			init();
			return true;
		}
		const tryDelayedInit = () => {
			if (tryInit()) {
				document.removeEventListener("scroll", tryDelayedInit);
				window.removeEventListener("resize", tryDelayedInit);
			}
		};
		function init() {
			initialized = true;
			if (!document.querySelector("#theia-sticky-sidebar-stylesheet")) document.head.insertAdjacentHTML("beforeend", "<style id=\"theia-sticky-sidebar-stylesheet\">.theiaStickySidebar:after {content: \"\"; display: table; clear: both;}</style>");
			for (const sidebar of elements) {
				const container = (opts.containerSelector ? document.querySelector(opts.containerSelector) : null) ?? sidebar.parentNode;
				if (!container) continue;
				Object.assign(sidebar.style, {
					position: opts.defaultPosition,
					overflow: "visible",
					boxSizing: "border-box"
				});
				let stickySidebar = sidebar.querySelector(".theiaStickySidebar");
				if (!stickySidebar) {
					const jsMimeTypes = /(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;
					for (const script of Array.from(sidebar.querySelectorAll("script"))) if (script.type.length === 0 || jsMimeTypes.test(script.type)) script.remove();
					stickySidebar = document.createElement("div");
					stickySidebar.classList.add("theiaStickySidebar");
					stickySidebar.append(...Array.from(sidebar.children));
					sidebar.append(stickySidebar);
				}
				const computed = getComputedStyle(sidebar);
				const marginBottom = parseFloat(computed.marginBottom);
				const paddingTop = parseFloat(computed.paddingTop);
				const paddingBottom = parseFloat(computed.paddingBottom);
				let collapsedTopHeight = getOffset(stickySidebar).top;
				let collapsedBottomHeight = stickySidebar.offsetHeight;
				stickySidebar.style.paddingTop = "1px";
				stickySidebar.style.paddingBottom = "1px";
				collapsedTopHeight -= getOffset(stickySidebar).top;
				collapsedBottomHeight = stickySidebar.offsetHeight - collapsedBottomHeight - collapsedTopHeight;
				const stickySidebarPaddingTop = collapsedTopHeight === 0 ? 0 : 1;
				const stickySidebarPaddingBottom = collapsedBottomHeight === 0 ? 0 : 1;
				stickySidebar.style.paddingTop = stickySidebarPaddingTop === 0 ? "0px" : "1px";
				stickySidebar.style.paddingBottom = stickySidebarPaddingBottom === 0 ? "0px" : "1px";
				const state = {
					sidebar,
					stickySidebar,
					container,
					onScroll: () => {},
					resizeObserver: null,
					previousScrollTop: 0,
					stickySidebarPaddingTop,
					stickySidebarPaddingBottom,
					marginBottom,
					paddingTop,
					paddingBottom
				};
				resetSidebar(state);
				state.onScroll = () => {
					if (!isVisible(stickySidebar)) return;
					if (document.body.getBoundingClientRect().width < opts.minWidth) {
						resetSidebar(state);
						return;
					}
					if (opts.disableOnResponsiveLayouts) {
						if ((getComputedStyle(sidebar).float === "none" ? getOuterWidth(sidebar) : sidebar.offsetWidth) + 50 > container.getBoundingClientRect().width) {
							resetSidebar(state);
							return;
						}
					}
					const scrollTop = window.scrollY;
					let position = "static";
					const sidebarOffset = getOffset(sidebar);
					let top = 0;
					if (scrollTop >= sidebarOffset.top + (state.paddingTop - opts.additionalMarginTop)) {
						const offsetTop = state.paddingTop + opts.additionalMarginTop;
						const offsetBottom = state.paddingBottom + state.marginBottom + opts.additionalMarginBottom;
						const containerTop = sidebarOffset.top;
						const containerBottom = getOffset(container).top + getClearedHeight(container);
						const windowOffsetTop = opts.additionalMarginTop;
						let windowOffsetBottom;
						if (stickySidebar.offsetHeight + offsetTop + offsetBottom < window.innerHeight) windowOffsetBottom = windowOffsetTop + stickySidebar.offsetHeight;
						else windowOffsetBottom = window.innerHeight - state.marginBottom - state.paddingBottom - opts.additionalMarginBottom;
						const staticLimitTop = containerTop - scrollTop + state.paddingTop;
						const staticLimitBottom = containerBottom - scrollTop - state.paddingBottom - state.marginBottom;
						top = getOffset(stickySidebar).top - scrollTop;
						const scrollTopDiff = state.previousScrollTop - scrollTop;
						if (getComputedStyle(stickySidebar).position === "fixed" && opts.sidebarBehavior === "modern") top += scrollTopDiff;
						if (opts.sidebarBehavior === "stick-to-top") top = opts.additionalMarginTop;
						if (opts.sidebarBehavior === "stick-to-bottom") top = windowOffsetBottom - stickySidebar.offsetHeight;
						if (scrollTopDiff > 0) top = Math.min(top, windowOffsetTop);
						else top = Math.max(top, windowOffsetBottom - stickySidebar.offsetHeight);
						top = Math.max(top, staticLimitTop);
						top = Math.min(top, staticLimitBottom - stickySidebar.offsetHeight);
						const sidebarSameHeightAsContainer = container.getBoundingClientRect().height === stickySidebar.offsetHeight;
						if (!sidebarSameHeightAsContainer && top === windowOffsetTop) position = "fixed";
						else if (!sidebarSameHeightAsContainer && top === windowOffsetBottom - stickySidebar.offsetHeight) position = "fixed";
						else if (scrollTop + top - sidebarOffset.top - state.paddingTop <= opts.additionalMarginTop) position = "static";
						else position = "absolute";
					}
					if (position === "fixed") Object.assign(stickySidebar.style, {
						position: "fixed",
						width: `${stickySidebar.getBoundingClientRect().width}px`,
						transform: `translateY(${top}px)`,
						left: `${getOffset(sidebar).left + parseFloat(getComputedStyle(sidebar).paddingLeft) - window.scrollX}px`,
						top: "0px"
					});
					else if (position === "absolute") {
						const css = {};
						if (getComputedStyle(stickySidebar).position !== "absolute") {
							css.position = "absolute";
							css.transform = `translateY(${scrollTop + top - sidebarOffset.top - state.stickySidebarPaddingTop - state.stickySidebarPaddingBottom}px)`;
							css.top = "0px";
						}
						css.width = `${stickySidebar.getBoundingClientRect().width}px`;
						css.left = "";
						Object.assign(stickySidebar.style, css);
					} else resetSidebar(state);
					if (position !== "static" && opts.updateSidebarHeight) sidebar.style.minHeight = `${stickySidebar.offsetHeight + getOffset(stickySidebar).top - sidebarOffset.top + state.paddingBottom}px`;
					state.previousScrollTop = scrollTop;
				};
				state.onScroll();
				document.addEventListener("scroll", state.onScroll);
				window.addEventListener("resize", state.onScroll);
				state.resizeObserver = new ResizeObserver(() => state.onScroll());
				state.resizeObserver.observe(stickySidebar);
				states.push(state);
			}
		}
		if (!tryInit()) {
			if (opts.verbose) console.log("stickify: viewport is under minWidth, init delayed.");
			document.addEventListener("scroll", tryDelayedInit);
			window.addEventListener("resize", tryDelayedInit);
		}
		return { destroy() {
			document.removeEventListener("scroll", tryDelayedInit);
			window.removeEventListener("resize", tryDelayedInit);
			for (const state of states) {
				document.removeEventListener("scroll", state.onScroll);
				window.removeEventListener("resize", state.onScroll);
				state.resizeObserver.disconnect();
			}
		} };
	}

//#endregion
//#region src/plugins/menuify.ts
	const defaults$4 = {
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
			...defaults$4,
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
//#region src/plugins/lazify.ts
	const defaults$3 = {
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
			...defaults$3,
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
//#region src/plugins/tocify.ts
	const defaults$2 = { headings: "h1,h2,h3" };
	function slugify(text, used) {
		let base = text.trim().replace(/\s+/g, "_") || "heading";
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
	* @param options - {@link TocifyOptions}
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
			...defaults$2,
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
//#region src/plugins/replacify.ts
	const defaults$1 = { allowHtml: false };
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
			...defaults$1,
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
//#region src/plugins/cookify.ts
/**
	* Small, dependency-free cookie utility (a typed replacement for the classic
	* `js-cookie` plugin). Values are JSON-encoded automatically, so you can
	* store strings, numbers, booleans, or plain objects/arrays.
	*
	* @example
	* ```ts
	* import { cookify } from "blogr-plugins";
	* cookify.set("theme", "dark", { expiresDays: 365 });
	* cookify.get("theme"); // "dark"
	* cookify.remove("theme");
	* ```
	*/
	const cookify = {
		/**
		* Writes a cookie.
		* @param name - Cookie name.
		* @param value - Any JSON-serializable value.
		* @param options - {@link CookifySetOptions}
		*/
		set(name, value, options = {}) {
			const encoded = encodeURIComponent(JSON.stringify(value));
			const parts = [`${encodeURIComponent(name)}=${encoded}`];
			if (options.expiresDays != null) {
				const date = /* @__PURE__ */ new Date();
				date.setTime(date.getTime() + options.expiresDays * 864e5);
				parts.push(`expires=${date.toUTCString()}`);
			}
			parts.push(`path=${options.path ?? "/"}`);
			if (options.domain) parts.push(`domain=${options.domain}`);
			if (options.secure) parts.push("secure");
			parts.push(`samesite=${options.sameSite ?? "Lax"}`);
			document.cookie = parts.join("; ");
		},
		/**
		* Reads a cookie.
		* @param name - Cookie name.
		* @returns The parsed value, or `undefined` if not set.
		*/
		get(name) {
			const target = encodeURIComponent(name);
			for (const pair of document.cookie ? document.cookie.split("; ") : []) {
				const idx = pair.indexOf("=");
				if ((idx === -1 ? pair : pair.slice(0, idx)) !== target) continue;
				const raw = idx === -1 ? "" : pair.slice(idx + 1);
				try {
					return JSON.parse(decodeURIComponent(raw));
				} catch {
					return decodeURIComponent(raw);
				}
			}
		},
		/**
		* Reads every cookie.
		* @returns A record of all cookies, parsed the same way as {@link cookify.get}.
		*/
		getAll() {
			const result = {};
			for (const pair of document.cookie ? document.cookie.split("; ") : []) {
				const idx = pair.indexOf("=");
				if (idx === -1) continue;
				const key = decodeURIComponent(pair.slice(0, idx));
				result[key] = this.get(key);
			}
			return result;
		},
		/**
		* Deletes a cookie.
		* @param name - Cookie name.
		* @param options - Must match the `path`/`domain` used when setting it.
		* @returns `true` if the cookie was present beforehand.
		*/
		remove(name, options = {}) {
			const existed = this.get(name) !== void 0;
			this.set(name, "", {
				...options,
				expiresDays: -1
			});
			return existed;
		}
	};

//#endregion
//#region src/plugins/resizeImage.ts
/**
	* Detects and rewrites Blogger/Google-hosted image URLs
	* (`googleusercontent.com` / `bp.blogspot.com`) with new size, crop,
	* format, flip, rotation and grayscale parameters.
	*/
	const HOST_PATTERN = /^(https?:)?(\/\/)[^/]*\.(googleusercontent\.com|blogspot\.com)/;
	const PARAM_SEGMENT_PATTERN = /[^/]+(?=\/[^/]+\.[^/?]+(?:\?|$))|(?<==)[^=&?/]+(?=\?|$)/;
	const defaults = {
		height: 360,
		width: 640,
		format: "webp",
		rotate: 0,
		grayscale: false
	};
	function toUrlString(url) {
		if (url instanceof URL) return url.toString();
		if (typeof url === "string") return url;
		throw new TypeError("Argument 'url' must be of type string | URL");
	}
	/**
	* Checks whether a URL is a Blogger/Google-hosted image that supports
	* these transformation parameters.
	*
	* @param url - Image URL to check.
	* @returns `true` if the host and image-size path segment are recognized.
	*
	* @example
	* ```ts
	* import { isSupportedImage } from "blogr-plugins";
	* isSupportedImage("https://1.bp.blogspot.com/path/s72-c/image.jpg"); // true
	* ```
	*/
	function isSupportedImage(url) {
		const str = toUrlString(url);
		return HOST_PATTERN.test(str) && PARAM_SEGMENT_PATTERN.test(str);
	}
	/**
	* Builds a resized/transformed URL for a Blogger/Google-hosted image.
	* Unsupported URLs are returned unchanged rather than throwing, so it's
	* always safe to run any image URL through this function.
	*
	* @param url - Source image URL.
	* @param options - {@link ResizeImageOptions}
	* @returns The transformed image URL, or the original URL if unsupported.
	*
	* @example
	* ```ts
	* import { resizeImage } from "blogr-plugins";
	*
	* const url = resizeImage("https://1.bp.blogspot.com/path/s72-c/image.jpg", {
	* 	width: 400,
	* 	height: 400,
	* 	format: "webp",
	* });
	* ```
	*/
	function resizeImage(url, options = {}) {
		const str = toUrlString(url);
		if (!HOST_PATTERN.test(str)) return str;
		const match = str.match(PARAM_SEGMENT_PATTERN);
		if (!match?.[0] || match.index === void 0) return str;
		const opts = {
			...defaults,
			...options
		};
		const params = [`w${opts.width}`, `h${opts.height}`];
		if (opts.crop === "circle") params.push("cc");
		else if (opts.crop === "square") params.push("ci");
		if (opts.format === "jpeg") params.push("rj");
		else if (opts.format === "png") params.push("rp");
		else if (opts.format === "webp") params.push("rw");
		if (opts.flip === "horizontally") params.push("fh");
		else if (opts.flip === "vertically") params.push("fv");
		if (opts.rotate === 90 || opts.rotate === 180 || opts.rotate === 270) params.push(`r${opts.rotate}`);
		if (opts.grayscale) params.push("bw");
		return `${str.slice(0, match.index)}${params.join("-")}${str.slice(match.index + match[0].length)}`;
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
//#region src/browser.ts
/**
	* Registers `$.fn.stickify`, `$.fn.menuify`, `$.fn.lazify`, `$.fn.tocify`
	* and `$.fn.replacify` on the given jQuery instance, so any plugin can be
	* called the classic jQuery way, e.g. `$("#sidebar").stickify();`.
	*
	* @param jq - A jQuery instance (`window.jQuery` / `window.$`).
	*/
	function registerJQueryPlugins(jq) {
		bindJQueryPlugin(jq, "stickify", (els, options) => stickify(els, options));
		bindJQueryPlugin(jq, "menuify", (els, options) => menuify(els, options));
		bindJQueryPlugin(jq, "lazify", (els, options) => lazify(els, options));
		bindJQueryPlugin(jq, "tocify", (els, options) => tocify(els, options));
		bindJQueryPlugin(jq, "replacify", (els, search, replacement, options) => replacify(els, search, replacement, options));
	}
	if (hasJQuery()) registerJQueryPlugins(window.jQuery);

//#endregion
exports.cookify = cookify;
exports.isSupportedImage = isSupportedImage;
exports.lazify = lazify;
exports.menuify = menuify;
exports.registerJQueryPlugins = registerJQueryPlugins;
exports.replacify = replacify;
exports.resizeImage = resizeImage;
exports.stickify = stickify;
exports.tocify = tocify;
return exports;
})({});