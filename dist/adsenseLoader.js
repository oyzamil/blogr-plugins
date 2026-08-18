/*! blogr-plugins v0.0.3 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrAdsenseLoader = (function(exports) {

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
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
//#region src/plugins/adsenseLoader.ts
	const defaults = {
		rootMargin: "200px",
		threshold: 0,
		observeMutations: true,
		mobileBreakpoint: "(max-width: 767px)",
		removeOnUnfilled: true
	};
	const ADSENSE_SCRIPT_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
	const PENDING_CLASS = "adsbygoogle";
	const LOADED_CLASS = "adsense--loaded";
	const UNFILLED_CLASS = "adsense--unfilled";
	const AD_FILL_ATTR = "data-ad-status";
	const UNFILLED = "unfilled";
	let adsenseScriptPromise = null;
	let pushLock = Promise.resolve();
	function withPushLock(fn) {
		const run = pushLock.then(fn, fn);
		pushLock = run.then(() => void 0, () => void 0);
		return run;
	}
	function ensureAdsenseScript() {
		if (adsenseScriptPromise) return adsenseScriptPromise;
		const promise = document.querySelector(`script[src^="${ADSENSE_SCRIPT_SRC}"]`) ? Promise.resolve() : new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.async = true;
			script.crossOrigin = "anonymous";
			script.src = ADSENSE_SCRIPT_SRC;
			script.addEventListener("load", () => resolve());
			script.addEventListener("error", () => reject(/* @__PURE__ */ new Error(`adsenseLoader: failed to load ${ADSENSE_SCRIPT_SRC}`)));
			document.head.appendChild(script);
		});
		adsenseScriptPromise = promise;
		return promise;
	}
	/**
	* Parses a `data-mobile-size` / `data-pc-size` attribute value into a list
	* of sizes. Tolerant of the loose `"['250x250', '300x600']"` format shown
	* in the docs (single quotes, not real JSON) — just pulls every
	* `HEIGHTxWIDTH` pair out with a regex rather than requiring valid JSON.
	* Each entry is `heightxwidth`, e.g. `"250x250"` — height first, width
	* second (matches the plugin's own {@link AdSize}, not the more common
	* width-first convention, so double check against the site's markup).
	*/
	function parseAdSizes(raw) {
		if (!raw) return [];
		return (raw.match(/(\d+)\s*x\s*(\d+)/gi) ?? []).map((pair) => {
			const [height, width] = pair.split(/x/i).map((n) => parseInt(n, 10));
			return {
				height,
				width
			};
		});
	}
	/**
	* Picks the first size in `sizes` that fits within `availableWidth`,
	* falling back to the last (assumed smallest) entry if none fit — so a
	* wrapper always ends up with *some* explicit size rather than none.
	*/
	function pickBestSize(sizes, availableWidth) {
		if (sizes.length === 0) return null;
		for (const size of sizes) if (size.width <= availableWidth) return size;
		return sizes[sizes.length - 1];
	}
	function applySize(wrapper, size) {
		wrapper.style.width = `${size.width}px`;
		wrapper.style.height = `${size.height}px`;
	}
	/**
	* Resolves and applies `data-mobile-size` / `data-pc-size` for `wrapper`,
	* based on the current `mobileBreakpoint` match and the wrapper's
	* available width. No-ops (leaves the wrapper's own CSS in control) if
	* neither attribute is present.
	*/
	function applyResponsiveSize(wrapper, mobileBreakpoint) {
		const isMobile = window.matchMedia(mobileBreakpoint).matches;
		const sizes = parseAdSizes(wrapper.getAttribute(isMobile ? "data-mobile-size" : "data-pc-size"));
		if (sizes.length === 0) return;
		const best = pickBestSize(sizes, wrapper.parentElement?.clientWidth || window.innerWidth);
		if (best) applySize(wrapper, best);
	}
	/**
	* Waits until Google sets the real fill outcome on `ins`
	* (`data-ad-status="filled"` / `"unfilled"`) rather than assuming push()
	* claimed the slot the instant it returns — push() only schedules the
	* claim. Falls back to a timeout so a stuck ad can't deadlock the queue.
	*/
	function waitForFillStatus(ins, timeoutMs = 4e3) {
		return new Promise((resolve) => {
			const current = ins.getAttribute(AD_FILL_ATTR);
			if (current) {
				resolve(current);
				return;
			}
			let done = false;
			const finish = (value) => {
				if (done) return;
				done = true;
				observer.disconnect();
				clearTimeout(timer);
				resolve(value);
			};
			const observer = new MutationObserver(() => {
				const value = ins.getAttribute(AD_FILL_ATTR);
				if (value) finish(value);
			});
			observer.observe(ins, {
				attributes: true,
				attributeFilter: [AD_FILL_ATTR]
			});
			const timer = setTimeout(() => finish(null), timeoutMs);
		});
	}
	/**
	* Lazy-loads AdSense units wrapped in a container div — `<div
	* class="adsense"><ins class="adsbygoogle" ...></ins></div>` — right as
	* each one is about to enter the viewport, using `IntersectionObserver`
	* instead of scroll/resize polling.
	*
	* Also supports responsive sizing: give a wrapper `data-mobile-size`
	* and/or `data-pc-size` listing candidate sizes as `heightxwidth` pairs
	* (height first), and the plugin picks the best-fitting one for the
	* current breakpoint/width and applies it to the wrapper directly —
	* before the ad loads, so it never resizes an already-filled ad (see the
	* policy note below).
	*
	* ```html
	* <div class="adsense"
	* 	data-mobile-size="['50x320', '100x320']"
	* 	data-pc-size="['90x728', '250x300']">
	* 	<ins class="adsbygoogle"
	* 		data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
	* 		data-ad-slot="9964452094"></ins>
	* </div>
	* ```
	*
	* > **On ad refresh:** AdSense's publisher policy does not permit
	* > programmatically refreshing an already-served ad. This plugin
	* > resizes a wrapper's own CSS box before its ad loads — it never
	* > touches, resizes, or reloads an ad that has already filled.
	*
	* @param input - Selector, element(s), or jQuery collection for the
	* `.adsense`-style wrapper(s) to lazy-load.
	* @param options - {@link AdsenseLoaderOptions}
	* @returns An {@link AdsenseLoaderInstance} — `destroy()` disconnects
	* every observer and restores any wrapper that never filled to its
	* original markup (filled ads are left exactly as AdSense rendered them).
	*
	* @example
	* ```ts
	* import { adsenseLoader } from "blogr-plugins";
	*
	* adsenseLoader(".adsense", {
	* 	rootMargin: "200px",
	* 	onFilled: (wrapper) => wrapper.classList.add("adsense--loaded"),
	* 	onUnfilled: (wrapper) => console.log("no fill for", wrapper),
	* });
	* ```
	*/
	function adsenseLoader(input, options = {}) {
		const opts = mergeOptions(defaults, options);
		const container = options.container ?? document.body;
		let destroyed = false;
		const seen = /* @__PURE__ */ new WeakSet();
		const states = /* @__PURE__ */ new Map();
		function findIns(wrapper) {
			return wrapper.querySelector("ins");
		}
		const intersectionObserver = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const wrapper = entry.target;
				intersectionObserver.unobserve(wrapper);
				load(wrapper);
			}
		}, {
			rootMargin: opts.rootMargin,
			threshold: opts.threshold
		});
		async function load(wrapper) {
			if (destroyed) return;
			const ins = findIns(wrapper);
			if (!ins) return;
			try {
				options.onLoad?.(wrapper);
				await ensureAdsenseScript();
				if (destroyed) return;
				if (await withPushLock(async () => {
					ins.classList.add(PENDING_CLASS);
					const w = window;
					w.adsbygoogle = w.adsbygoogle || [];
					w.adsbygoogle.push({});
					return waitForFillStatus(ins);
				}) === UNFILLED) {
					handleUnfilled(wrapper);
					return;
				}
				wrapper.classList.add(LOADED_CLASS);
				options.onFilled?.(wrapper);
			} catch {
				handleUnfilled(wrapper);
			}
		}
		function handleUnfilled(wrapper) {
			wrapper.classList.add(UNFILLED_CLASS);
			options.onUnfilled?.(wrapper);
			if (opts.removeOnUnfilled) {
				states.delete(wrapper);
				wrapper.remove();
			}
		}
		function track(el) {
			if (seen.has(el)) return;
			seen.add(el);
			const wrapper = el;
			states.set(wrapper, { originalHTML: wrapper.innerHTML });
			applyResponsiveSize(wrapper, opts.mobileBreakpoint);
			intersectionObserver.observe(wrapper);
		}
		function scan() {
			for (const el of container.querySelectorAll(".adsense")) track(el);
		}
		scan();
		let mutationObserver = null;
		if (opts.observeMutations) {
			let debounceTimer = null;
			mutationObserver = new MutationObserver(() => {
				if (debounceTimer) clearTimeout(debounceTimer);
				debounceTimer = setTimeout(() => {
					debounceTimer = null;
					scan();
				}, 100);
			});
			mutationObserver.observe(container, {
				childList: true,
				subtree: true
			});
		}
		let resizeTO = null;
		function onResize() {
			if (destroyed) return;
			if (resizeTO) clearTimeout(resizeTO);
			resizeTO = setTimeout(() => {
				resizeTO = null;
				for (const [wrapper, state] of states) {
					if (!wrapper.classList.contains(LOADED_CLASS)) continue;
					const oldWidth = parseInt(wrapper.style.width, 10) || 0;
					const oldHeight = parseInt(wrapper.style.height, 10) || 0;
					applyResponsiveSize(wrapper, opts.mobileBreakpoint);
					const newWidth = parseInt(wrapper.style.width, 10) || 0;
					const newHeight = parseInt(wrapper.style.height, 10) || 0;
					if (oldWidth === newWidth && oldHeight === newHeight) continue;
					intersectionObserver.unobserve(wrapper);
					wrapper.innerHTML = state.originalHTML;
					wrapper.classList.remove(LOADED_CLASS, UNFILLED_CLASS);
					applyResponsiveSize(wrapper, opts.mobileBreakpoint);
					Promise.resolve().then(() => load(wrapper));
				}
			}, 250);
		}
		window.addEventListener("resize", onResize);
		window.addEventListener("orientationchange", onResize);
		return { destroy() {
			destroyed = true;
			intersectionObserver.disconnect();
			mutationObserver?.disconnect();
			if (resizeTO) clearTimeout(resizeTO);
			window.removeEventListener("resize", onResize);
			window.removeEventListener("orientationchange", onResize);
			for (const [wrapper, state] of states) {
				wrapper.innerHTML = state.originalHTML;
				wrapper.classList.remove(LOADED_CLASS, UNFILLED_CLASS);
				wrapper.style.removeProperty("width");
				wrapper.style.removeProperty("height");
			}
			states.clear();
		} };
	}

//#endregion
//#region src/browser/adsenseLoader.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { adsenseLoader });

//#endregion
exports.adsenseLoader = adsenseLoader;
return exports;
})({});