/*! blogr-plugins v0.0.3 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrStickify = (function(exports) {

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
	const defaults = {
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
	function getOuterWidth(element, style) {
		const computed = style ?? getComputedStyle(element);
		return element.getBoundingClientRect().width + parseFloat(computed.marginLeft) + parseFloat(computed.marginRight);
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
	* @param options Configuration object.
	* See {@link StickifyOptions}.
	* @returns A {@link PluginInstance} with `destroy()` to unbind everything and restore original styles.
	*
	* @example
	* ```ts
	* import { stickify } from "blogr-plugins";
	* stickify(".leftSidebar, .content, .rightSidebar", { additionalMarginTop: 30 });
	* ```
	*/
	function stickify(input, options = {}) {
		const opts = mergeOptions(defaults, options);
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
					scheduleOnScroll: () => {},
					rafId: null,
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
					const sidebarStyle = getComputedStyle(sidebar);
					let stickySidebarStyle = null;
					const getStickySidebarStyle = () => stickySidebarStyle ?? (stickySidebarStyle = getComputedStyle(stickySidebar));
					if (opts.disableOnResponsiveLayouts) {
						if ((sidebarStyle.float === "none" ? getOuterWidth(sidebar, sidebarStyle) : sidebar.offsetWidth) + 50 > container.getBoundingClientRect().width) {
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
						if (getStickySidebarStyle().position === "fixed" && opts.sidebarBehavior === "modern") top += scrollTopDiff;
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
						left: `${getOffset(sidebar).left + parseFloat(sidebarStyle.paddingLeft) - window.scrollX}px`,
						top: "0px"
					});
					else if (position === "absolute") {
						const css = {};
						if (getStickySidebarStyle().position !== "absolute") {
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
				state.scheduleOnScroll = () => {
					if (state.rafId !== null) return;
					state.rafId = requestAnimationFrame(() => {
						state.rafId = null;
						state.onScroll();
					});
				};
				state.onScroll();
				document.addEventListener("scroll", state.scheduleOnScroll, { passive: true });
				window.addEventListener("resize", state.scheduleOnScroll);
				state.resizeObserver = new ResizeObserver(() => state.scheduleOnScroll());
				state.resizeObserver.observe(stickySidebar);
				states.push(state);
			}
		}
		if (!tryInit()) {
			if (opts.verbose) console.log("stickify: viewport is under minWidth, init delayed.");
			document.addEventListener("scroll", tryDelayedInit, { passive: true });
			window.addEventListener("resize", tryDelayedInit);
		}
		return { destroy() {
			document.removeEventListener("scroll", tryDelayedInit);
			window.removeEventListener("resize", tryDelayedInit);
			for (const state of states) {
				document.removeEventListener("scroll", state.scheduleOnScroll);
				window.removeEventListener("resize", state.scheduleOnScroll);
				if (state.rafId !== null) cancelAnimationFrame(state.rafId);
				state.resizeObserver.disconnect();
			}
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
//#region src/browser/stickify.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { stickify });
	if (hasJQuery()) bindJQueryPlugin(window.jQuery, "stickify", (els, options) => stickify(els, options));

//#endregion
exports.stickify = stickify;
return exports;
})({});