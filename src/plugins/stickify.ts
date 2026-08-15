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

import { type ElementInput, type PluginInstance } from "../types";
import { resolveElements } from "../utils/dom";

/** Configuration options for {@link stickify}. */
export interface StickifyOptions {
	/** Selector for the sidebar's scroll container. Defaults to the sidebar's parent. */
	containerSelector?: string;
	/** Extra px gap kept above the sidebar while stuck. */
	additionalMarginTop?: number;
	/** Extra px gap kept below the sidebar before it stops at the container's end. */
	additionalMarginBottom?: number;
	/** Keep the sidebar's wrapper `min-height` in sync so the container never collapses. Default `true`. */
	updateSidebarHeight?: boolean;
	/** Viewport width (px) below which stickiness is disabled entirely. */
	minWidth?: number;
	/** Disable stickiness when the sidebar no longer fits its container (e.g. stacked mobile layouts). Default `true`. */
	disableOnResponsiveLayouts?: boolean;
	/**
	 * `"modern"` follows scroll direction the way a native sticky element
	 * would. `"stick-to-top"` pins the top edge at `additionalMarginTop`.
	 * `"stick-to-bottom"` pins the bottom edge to the viewport instead.
	 */
	sidebarBehavior?: "modern" | "stick-to-top" | "stick-to-bottom";
	/** Inline `position` applied to the sidebar itself before stickiness kicks in. Default `"relative"`. */
	defaultPosition?: string;
	/** Log a note to the console when init is delayed because the viewport is under `minWidth`. */
	verbose?: boolean;
}

const defaults: Required<StickifyOptions> = {
	containerSelector: "",
	additionalMarginTop: 0,
	additionalMarginBottom: 0,
	updateSidebarHeight: true,
	minWidth: 0,
	disableOnResponsiveLayouts: true,
	sidebarBehavior: "modern",
	defaultPosition: "relative",
	verbose: false,
};

interface SidebarState {
	sidebar: HTMLElement;
	stickySidebar: HTMLElement;
	container: HTMLElement;
	onScroll: () => void;
	resizeObserver: ResizeObserver;
	previousScrollTop: number;
	stickySidebarPaddingTop: number;
	stickySidebarPaddingBottom: number;
	marginBottom: number;
	paddingTop: number;
	paddingBottom: number;
}

function getOffset(element: HTMLElement): { top: number; left: number } {
	const rect = element.getBoundingClientRect();
	return {
		top: rect.top + window.scrollY - document.documentElement.clientTop,
		left: rect.left + window.scrollX - document.documentElement.clientLeft,
	};
}

function getOuterWidth(element: HTMLElement): number {
	const style = getComputedStyle(element);
	return (
		element.getBoundingClientRect().width +
		parseFloat(style.marginLeft) +
		parseFloat(style.marginRight)
	);
}

function isVisible(element: HTMLElement): boolean {
	return !!(
		element.offsetWidth ||
		element.offsetHeight ||
		element.getClientRects().length
	);
}

function resetSidebar(s: SidebarState): void {
	s.sidebar.style.minHeight = "1px";
	Object.assign(s.stickySidebar.style, {
		position: "static",
		width: "",
		transform: "none",
	});
}

// Height of a container as if its floated children were cleared. Fails for floats nested more than one level deep.
function getClearedHeight(element: HTMLElement): number {
	let height = element.getBoundingClientRect().height;
	for (const child of Array.from(element.children)) {
		height = Math.max(height, child.getBoundingClientRect().height);
	}
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
export function stickify(
	input: ElementInput,
	options: StickifyOptions = {},
): PluginInstance {
	const opts = { ...defaults, ...options };
	opts.additionalMarginTop = Math.floor(opts.additionalMarginTop);
	opts.additionalMarginBottom = Math.floor(opts.additionalMarginBottom);

	const elements = resolveElements(input) as HTMLElement[];
	const states: SidebarState[] = [];
	let initialized = false;

	function tryInit(): boolean {
		if (initialized) return true;
		if (document.body.getBoundingClientRect().width < opts.minWidth)
			return false;
		init();
		return true;
	}

	const tryDelayedInit = () => {
		if (tryInit()) {
			document.removeEventListener("scroll", tryDelayedInit);
			window.removeEventListener("resize", tryDelayedInit);
		}
	};

	function init(): void {
		initialized = true;

		if (!document.querySelector("#theia-sticky-sidebar-stylesheet")) {
			document.head.insertAdjacentHTML(
				"beforeend",
				'<style id="theia-sticky-sidebar-stylesheet">.theiaStickySidebar:after {content: ""; display: table; clear: both;}</style>',
			);
		}

		for (const sidebar of elements) {
			const container =
				((opts.containerSelector
					? document.querySelector(opts.containerSelector)
					: null) as HTMLElement | null) ??
				(sidebar.parentNode as HTMLElement | null);

			if (!container) continue;

			Object.assign(sidebar.style, {
				position: opts.defaultPosition,
				overflow: "visible",
				boxSizing: "border-box",
			});

			let stickySidebar = sidebar.querySelector(
				".theiaStickySidebar",
			) as HTMLElement | null;
			if (!stickySidebar) {
				const jsMimeTypes =
					/(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;
				for (const script of Array.from(sidebar.querySelectorAll("script"))) {
					if (script.type.length === 0 || jsMimeTypes.test(script.type))
						script.remove();
				}
				stickySidebar = document.createElement("div");
				stickySidebar.classList.add("theiaStickySidebar");
				stickySidebar.append(...Array.from(sidebar.children));
				sidebar.append(stickySidebar);
			}

			const computed = getComputedStyle(sidebar);
			const marginBottom = parseFloat(computed.marginBottom);
			const paddingTop = parseFloat(computed.paddingTop);
			const paddingBottom = parseFloat(computed.paddingBottom);

			// Probe for collapsible top/bottom margins by nudging padding and measuring the shift.
			let collapsedTopHeight = getOffset(stickySidebar).top;
			let collapsedBottomHeight = stickySidebar.offsetHeight;
			stickySidebar.style.paddingTop = "1px";
			stickySidebar.style.paddingBottom = "1px";
			collapsedTopHeight -= getOffset(stickySidebar).top;
			collapsedBottomHeight =
				stickySidebar.offsetHeight - collapsedBottomHeight - collapsedTopHeight;

			const stickySidebarPaddingTop = collapsedTopHeight === 0 ? 0 : 1;
			const stickySidebarPaddingBottom = collapsedBottomHeight === 0 ? 0 : 1;
			stickySidebar.style.paddingTop =
				stickySidebarPaddingTop === 0 ? "0px" : "1px";
			stickySidebar.style.paddingBottom =
				stickySidebarPaddingBottom === 0 ? "0px" : "1px";

			const state: SidebarState = {
				sidebar,
				stickySidebar,
				container,
				onScroll: () => {},
				resizeObserver: null as unknown as ResizeObserver,
				previousScrollTop: 0,
				stickySidebarPaddingTop,
				stickySidebarPaddingBottom,
				marginBottom,
				paddingTop,
				paddingBottom,
			};

			resetSidebar(state);

			state.onScroll = () => {
				if (!isVisible(stickySidebar!)) return;

				if (document.body.getBoundingClientRect().width < opts.minWidth) {
					resetSidebar(state);
					return;
				}

				if (opts.disableOnResponsiveLayouts) {
					const sidebarWidth =
						getComputedStyle(sidebar).float === "none"
							? getOuterWidth(sidebar)
							: sidebar.offsetWidth;
					if (sidebarWidth + 50 > container.getBoundingClientRect().width) {
						resetSidebar(state);
						return;
					}
				}

				const scrollTop = window.scrollY;
				let position = "static";
				const sidebarOffset = getOffset(sidebar);
				let top = 0;

				if (
					scrollTop >=
					sidebarOffset.top + (state.paddingTop - opts.additionalMarginTop)
				) {
					const offsetTop = state.paddingTop + opts.additionalMarginTop;
					const offsetBottom =
						state.paddingBottom +
						state.marginBottom +
						opts.additionalMarginBottom;

					const containerTop = sidebarOffset.top;
					const containerBottom =
						getOffset(container).top + getClearedHeight(container);

					const windowOffsetTop = opts.additionalMarginTop;
					let windowOffsetBottom: number;

					const sidebarSmallerThanWindow =
						stickySidebar.offsetHeight + offsetTop + offsetBottom <
						window.innerHeight;
					if (sidebarSmallerThanWindow) {
						windowOffsetBottom = windowOffsetTop + stickySidebar.offsetHeight;
					} else {
						windowOffsetBottom =
							window.innerHeight -
							state.marginBottom -
							state.paddingBottom -
							opts.additionalMarginBottom;
					}

					const staticLimitTop = containerTop - scrollTop + state.paddingTop;
					const staticLimitBottom =
						containerBottom -
						scrollTop -
						state.paddingBottom -
						state.marginBottom;

					top = getOffset(stickySidebar).top - scrollTop;
					const scrollTopDiff = state.previousScrollTop - scrollTop;

					if (
						getComputedStyle(stickySidebar).position === "fixed" &&
						opts.sidebarBehavior === "modern"
					) {
						top += scrollTopDiff;
					}

					if (opts.sidebarBehavior === "stick-to-top") {
						top = opts.additionalMarginTop;
					}
					if (opts.sidebarBehavior === "stick-to-bottom") {
						top = windowOffsetBottom - stickySidebar.offsetHeight;
					}

					if (scrollTopDiff > 0) {
						top = Math.min(top, windowOffsetTop);
					} else {
						top = Math.max(
							top,
							windowOffsetBottom - stickySidebar.offsetHeight,
						);
					}

					top = Math.max(top, staticLimitTop);
					top = Math.min(top, staticLimitBottom - stickySidebar.offsetHeight);

					const sidebarSameHeightAsContainer =
						container.getBoundingClientRect().height ===
						stickySidebar.offsetHeight;

					if (!sidebarSameHeightAsContainer && top === windowOffsetTop) {
						position = "fixed";
					} else if (
						!sidebarSameHeightAsContainer &&
						top === windowOffsetBottom - stickySidebar.offsetHeight
					) {
						position = "fixed";
					} else if (
						scrollTop + top - sidebarOffset.top - state.paddingTop <=
						opts.additionalMarginTop
					) {
						position = "static";
					} else {
						position = "absolute";
					}
				}

				if (position === "fixed") {
					Object.assign(stickySidebar.style, {
						position: "fixed",
						width: `${stickySidebar.getBoundingClientRect().width}px`,
						transform: `translateY(${top}px)`,
						left: `${getOffset(sidebar).left + parseFloat(getComputedStyle(sidebar).paddingLeft) - window.scrollX}px`,
						top: "0px",
					});
				} else if (position === "absolute") {
					const css: Partial<CSSStyleDeclaration> = {};
					if (getComputedStyle(stickySidebar).position !== "absolute") {
						css.position = "absolute";
						css.transform = `translateY(${scrollTop + top - sidebarOffset.top - state.stickySidebarPaddingTop - state.stickySidebarPaddingBottom}px)`;
						css.top = "0px";
					}
					css.width = `${stickySidebar.getBoundingClientRect().width}px`;
					css.left = "";
					Object.assign(stickySidebar.style, css);
				} else {
					resetSidebar(state);
				}

				if (position !== "static" && opts.updateSidebarHeight) {
					sidebar.style.minHeight = `${stickySidebar.offsetHeight + getOffset(stickySidebar).top - sidebarOffset.top + state.paddingBottom}px`;
				}

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

	const success = tryInit();
	if (!success) {
		if (opts.verbose) {
			// eslint-disable-next-line no-console
			console.log("stickify: viewport is under minWidth, init delayed.");
		}
		document.addEventListener("scroll", tryDelayedInit);
		window.addEventListener("resize", tryDelayedInit);
	}

	return {
		destroy() {
			document.removeEventListener("scroll", tryDelayedInit);
			window.removeEventListener("resize", tryDelayedInit);
			for (const state of states) {
				document.removeEventListener("scroll", state.onScroll);
				window.removeEventListener("resize", state.onScroll);
				state.resizeObserver.disconnect();
			}
		},
	};
}
