import { type ElementInput, type PluginInstance } from "../types.js";
import { mergeOptions } from "../utils/merge-options.js";

/** A single `heightxwidth` ad size, e.g. `250x250` -> `{ height: 250, width: 250 }`. */
export interface AdSize {
	height: number;
	width: number;
}

/** Configuration for {@link adsenseLoader}. */
export interface AdsenseLoaderOptions {
	/**
	 * Start loading this many pixels before the wrapper enters the
	 * viewport. Default `"200px"`.
	 */
	rootMargin?: string;
	/** `IntersectionObserver` threshold. Default `0`. */
	threshold?: number | number[];
	/** Watch for wrapper elements inserted after init (e.g. infinite-scroll posts). Default `true`. */
	observeMutations?: boolean;
	/** Root element to scan/observe within. Default `document.body`. */
	container?: Element | Document;
	/**
	 * Media query that decides which of `data-mobile-size` /
	 * `data-pc-size` a wrapper resolves to. Default
	 * `"(max-width: 767px)"`.
	 */
	mobileBreakpoint?: string;
	/**
	 * If the ad comes back unfilled or fails to load, remove the wrapper
	 * from the DOM entirely (matching the old plugin's behavior) rather
	 * than leaving a dead, empty slot. Default `true`.
	 */
	removeOnUnfilled?: boolean;
	/** Called right before a wrapper's ad starts loading. */
	onLoad?: (wrapper: HTMLElement) => void;
	/** Called once a wrapper's ad has actually filled. */
	onFilled?: (wrapper: HTMLElement) => void;
	/**
	 * Called when a wrapper's ad comes back unfilled or fails to load —
	 * right before it's removed (if `removeOnUnfilled` is on). Use this
	 * for a fallback instead of relying on the (about to be gone) wrapper.
	 */
	onUnfilled?: (wrapper: HTMLElement) => void;
}

/** Returned by {@link adsenseLoader}. */
export type AdsenseLoaderInstance = PluginInstance;

const defaults = {
	rootMargin: "200px",
	threshold: 0 as number | number[],
	observeMutations: true,
	mobileBreakpoint: "(max-width: 767px)",
	removeOnUnfilled: true,
};

const ADSENSE_SCRIPT_SRC =
	"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
const PENDING_CLASS = "adsbygoogle";
const LOADED_CLASS = "adsense--loaded";
const UNFILLED_CLASS = "adsense--unfilled";
// Set by Google once it's finished processing a push() — "done" regardless
// of outcome. Different from AD_FILL_ATTR below.
const AD_STATUS_ATTR = "data-adsbygoogle-status";
// The actual outcome Google writes once processing settles: "filled" or
// "unfilled".
const AD_FILL_ATTR = "data-ad-status";
const UNFILLED = "unfilled";

let adsenseScriptPromise: Promise<void> | null = null;
// The shared adsbygoogle.push({}) queue fills whichever ins.adsbygoogle it
// finds unfilled — not a specific element. Only one "add class -> push"
// step may run at a time, page-wide, or two wrappers becoming eligible
// together can steal each other's slot.
let pushLock: Promise<void> = Promise.resolve();

/**
 * @internal Test-only — resets module-level state between test cases.
 * Not part of the public API.
 */
export function _resetAdsenseLoaderStateForTests(): void {
	adsenseScriptPromise = null;
	pushLock = Promise.resolve();
}

function withPushLock<T>(fn: () => Promise<T>): Promise<T> {
	const run = pushLock.then(fn, fn);
	pushLock = run.then(
		() => undefined,
		() => undefined,
	);
	return run;
}

function ensureAdsenseScript(): Promise<void> {
	if (adsenseScriptPromise) return adsenseScriptPromise;

	const alreadyOnPage = document.querySelector(
		`script[src^="${ADSENSE_SCRIPT_SRC}"]`,
	);
	const promise = alreadyOnPage
		? Promise.resolve()
		: new Promise<void>((resolve, reject) => {
				const script = document.createElement("script");
				script.async = true;
				script.crossOrigin = "anonymous";
				script.src = ADSENSE_SCRIPT_SRC;
				script.addEventListener("load", () => resolve());
				script.addEventListener("error", () =>
					reject(
						new Error(`adsenseLoader: failed to load ${ADSENSE_SCRIPT_SRC}`),
					),
				);
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
export function parseAdSizes(raw: string | null): AdSize[] {
	if (!raw) return [];
	const matches = raw.match(/(\d+)\s*x\s*(\d+)/gi) ?? [];
	return matches.map((pair) => {
		const [height, width] = pair.split(/x/i).map((n) => parseInt(n, 10));
		return { height, width };
	});
}

/**
 * Picks the first size in `sizes` that fits within `availableWidth`,
 * falling back to the last (assumed smallest) entry if none fit — so a
 * wrapper always ends up with *some* explicit size rather than none.
 */
function pickBestSize(sizes: AdSize[], availableWidth: number): AdSize | null {
	if (sizes.length === 0) return null;
	for (const size of sizes) {
		if (size.width <= availableWidth) return size;
	}
	return sizes[sizes.length - 1];
}

function applySize(wrapper: HTMLElement, size: AdSize): void {
	wrapper.style.width = `${size.width}px`;
	wrapper.style.height = `${size.height}px`;
}

/**
 * Resolves and applies `data-mobile-size` / `data-pc-size` for `wrapper`,
 * based on the current `mobileBreakpoint` match and the wrapper's
 * available width. No-ops (leaves the wrapper's own CSS in control) if
 * neither attribute is present.
 */
function applyResponsiveSize(
	wrapper: HTMLElement,
	mobileBreakpoint: string,
): void {
	const isMobile = window.matchMedia(mobileBreakpoint).matches;
	const raw = wrapper.getAttribute(
		isMobile ? "data-mobile-size" : "data-pc-size",
	);
	const sizes = parseAdSizes(raw);
	if (sizes.length === 0) return;

	const availableWidth =
		wrapper.parentElement?.clientWidth || window.innerWidth;
	const best = pickBestSize(sizes, availableWidth);
	if (best) applySize(wrapper, best);
}

/**
 * Waits until Google sets the real fill outcome on `ins`
 * (`data-ad-status="filled"` / `"unfilled"`) rather than assuming push()
 * claimed the slot the instant it returns — push() only schedules the
 * claim. Falls back to a timeout so a stuck ad can't deadlock the queue.
 */
function waitForFillStatus(
	ins: HTMLElement,
	timeoutMs = 4000,
): Promise<string | null> {
	return new Promise((resolve) => {
		const current = ins.getAttribute(AD_FILL_ATTR);
		if (current) {
			resolve(current);
			return;
		}

		let done = false;
		const finish = (value: string | null) => {
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
			attributeFilter: [AD_FILL_ATTR],
		});

		const timer = setTimeout(() => finish(null), timeoutMs);
	});
}

interface WrapperState {
	originalHTML: string;
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
export function adsenseLoader(
	input: ElementInput,
	options: AdsenseLoaderOptions = {},
): AdsenseLoaderInstance {
	const opts = mergeOptions(defaults, options);
	const container: Element | Document = options.container ?? document.body;

	let destroyed = false;
	const seen = new WeakSet<Element>();
	const states = new Map<HTMLElement, WrapperState>();

	function findIns(wrapper: HTMLElement): HTMLElement | null {
		return wrapper.querySelector("ins");
	}

	const intersectionObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const wrapper = entry.target as HTMLElement;
				intersectionObserver.unobserve(wrapper);
				load(wrapper);
			}
		},
		{ rootMargin: opts.rootMargin, threshold: opts.threshold },
	);

	async function load(wrapper: HTMLElement): Promise<void> {
		if (destroyed) return;
		const ins = findIns(wrapper);
		if (!ins) return;

		try {
			options.onLoad?.(wrapper);
			await ensureAdsenseScript();
			if (destroyed) return;

			const fillStatus = await withPushLock(async () => {
				ins.classList.add(PENDING_CLASS);
				const w = window as unknown as { adsbygoogle: unknown[] };
				w.adsbygoogle = w.adsbygoogle || [];
				w.adsbygoogle.push({});
				return waitForFillStatus(ins);
			});

			if (fillStatus === UNFILLED) {
				handleUnfilled(wrapper);
				return;
			}

			wrapper.classList.add(LOADED_CLASS);
			options.onFilled?.(wrapper);
		} catch {
			handleUnfilled(wrapper);
		}
	}

	function handleUnfilled(wrapper: HTMLElement): void {
		wrapper.classList.add(UNFILLED_CLASS);
		options.onUnfilled?.(wrapper);
		if (opts.removeOnUnfilled) {
			states.delete(wrapper);
			wrapper.remove();
		}
	}

	function track(el: Element): void {
		if (seen.has(el)) return;
		seen.add(el);
		const wrapper = el as HTMLElement;

		states.set(wrapper, { originalHTML: wrapper.innerHTML });
		applyResponsiveSize(wrapper, opts.mobileBreakpoint);
		intersectionObserver.observe(wrapper);
	}

	function scan(): void {
		for (const el of container.querySelectorAll(".adsense")) track(el);
	}

	scan();

	let mutationObserver: MutationObserver | null = null;
	if (opts.observeMutations) {
		let debounceTimer: ReturnType<typeof setTimeout> | null = null;
		mutationObserver = new MutationObserver(() => {
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				debounceTimer = null;
				scan();
			}, 100);
		});
		mutationObserver.observe(container, { childList: true, subtree: true });
	}

	// --- resize handler (reload on size change, matching original plugin) ---
	let resizeTO: ReturnType<typeof setTimeout> | null = null;
	function onResize(): void {
		if (destroyed) return;
		if (resizeTO) clearTimeout(resizeTO);
		resizeTO = setTimeout(() => {
			resizeTO = null;
			for (const [wrapper, state] of states) {
				// Only reload if wrapper is loaded (filled)
				if (!wrapper.classList.contains(LOADED_CLASS)) continue;
				// Store old inline dimensions before recomputing
				const oldWidth = parseInt(wrapper.style.width) || 0;
				const oldHeight = parseInt(wrapper.style.height) || 0;
				applyResponsiveSize(wrapper, opts.mobileBreakpoint);
				const newWidth = parseInt(wrapper.style.width) || 0;
				const newHeight = parseInt(wrapper.style.height) || 0;
				if (oldWidth === newWidth && oldHeight === newHeight) continue;

				// Size changed – reload the ad
				intersectionObserver.unobserve(wrapper);
				wrapper.innerHTML = state.originalHTML;
				wrapper.classList.remove(LOADED_CLASS, UNFILLED_CLASS);
				// Re-apply the newly computed size (already set by applyResponsiveSize)
				// But we might need to reapply because innerHTML reset wiped style?
				// Actually applyResponsiveSize already set style, but we reset innerHTML after.
				// So we need to set style again after resetting innerHTML.
				applyResponsiveSize(wrapper, opts.mobileBreakpoint);
				// Load again – IntersectionObserver might not retrigger if already in view,
				// so we call load directly after a microtask to avoid race.
				Promise.resolve().then(() => load(wrapper));
			}
		}, 250);
	}
	window.addEventListener("resize", onResize);
	// Also listen to orientation change
	window.addEventListener("orientationchange", onResize);

	return {
		destroy() {
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
		},
	};
}

/*
Example Usage:
import { adsenseLoader } from "blogr-plugins";

const instance = adsenseLoader(".adsense", {
  // Start loading this many px before the wrapper enters the viewport.
  rootMargin: "200px",

  // IntersectionObserver threshold — can be a number or number[].
  threshold: 0,

  // Watch for wrapper elements inserted later (e.g. infinite scroll).
  observeMutations: true,

  // Root element to scan/observe within (defaults to document.body).
  container: document.querySelector("#main")!,

  // Media query deciding data-mobile-size vs data-pc-size.
  mobileBreakpoint: "(max-width: 767px)",

  // Remove the wrapper entirely if the ad comes back unfilled/errors.
  removeOnUnfilled: true,

  // Fires right before a wrapper's ad starts loading.
  onLoad: (wrapper) => {
    console.log("loading ad in", wrapper);
  },

  // Fires once a wrapper's ad has actually filled.
  onFilled: (wrapper) => {
    wrapper.classList.add("adsense--loaded");
  },

  // Fires when a wrapper comes back unfilled/failed, right before removal.
  onUnfilled: (wrapper) => {
    console.log("no fill for", wrapper);
  },
});

// Later, to tear it all down (disconnects observers, restores any
// never-filled wrapper to its original markup — filled ads are left alone):
instance.destroy();


<div class="adsense"
  data-mobile-size="['50x320', '100x320']"
  data-pc-size="['90x728', '250x300']">
  <ins class="adsbygoogle"
    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
    data-ad-slot="9964452094"></ins>
</div>
*/
