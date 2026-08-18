import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	_resetAdsenseLoaderStateForTests,
	adsenseLoader,
	parseAdSizes,
} from "../src/plugins/adsenseLoader";
import { MockIntersectionObserver } from "./shared";

const ADSENSE_SCRIPT_SRC =
	"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

// --- IntersectionObserver mock -------------------------------------------

function observerFor(target: Element): MockIntersectionObserver {
	const found = MockIntersectionObserver.instances.find((o) =>
		o.observed.includes(target),
	);
	if (!found) throw new Error("no observer found for target");
	return found;
}

// --- helpers ---------------------------------------------------------------

/** Resolves ensureAdsenseScript() by firing the injected script tag's load event. */
function resolveAdsenseScript(): void {
	const script = document.head.querySelector(
		`script[src^="${ADSENSE_SCRIPT_SRC}"]`,
	);
	if (!script) throw new Error("adsbygoogle script not found in <head>");
	script.dispatchEvent(new Event("load"));
}

/** Simulates Google settling on a fill outcome for an <ins>. */
function simulateFillStatus(ins: Element, status: "filled" | "unfilled"): void {
	ins.setAttribute("data-ad-status", status);
}

function flush(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

function wrapper(selector = ".adsense"): HTMLElement {
	return document.querySelector(selector)!;
}

function insOf(el: Element): HTMLElement {
	return el.querySelector("ins")!;
}

beforeEach(() => {
	MockIntersectionObserver.instances = [];
	globalThis.IntersectionObserver =
		MockIntersectionObserver as unknown as typeof IntersectionObserver;
	_resetAdsenseLoaderStateForTests();

	document.head
		.querySelectorAll('script[src*="googlesyndication"]')
		.forEach((s) => s.remove());
	(window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle = [];

	window.matchMedia = vi.fn().mockImplementation(
		(query: string) =>
			({
				matches: false,
				media: query,
				addEventListener: () => {},
				removeEventListener: () => {},
			}) as unknown as MediaQueryList,
	);
	Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });

	document.body.innerHTML = `
		<div class="adsense" data-ad-slot="1">
			<ins data-ad-client="ca-pub-test" data-ad-slot="1"></ins>
		</div>
	`;
});

afterEach(() => {
	vi.restoreAllMocks();
});

// --- parseAdSizes ------------------------------------------------------------

describe("parseAdSizes", () => {
	it("parses the loose single-quoted array format", () => {
		expect(parseAdSizes("['250x250', '300x600']")).toEqual([
			{ height: 250, width: 250 },
			{ height: 300, width: 600 },
		]);
	});

	it("is tolerant of double quotes, extra whitespace, and case", () => {
		expect(parseAdSizes('["90 X 728", "50x320"]')).toEqual([
			{ height: 90, width: 728 },
			{ height: 50, width: 320 },
		]);
	});

	it("returns an empty array for null/empty input", () => {
		expect(parseAdSizes(null)).toEqual([]);
		expect(parseAdSizes("")).toEqual([]);
	});

	it("ignores junk that isn't a NxN pair", () => {
		expect(parseAdSizes("[]")).toEqual([]);
		expect(parseAdSizes("not a size list")).toEqual([]);
	});
});

// --- responsive sizing -------------------------------------------------------

describe("adsenseLoader — responsive sizing", () => {
	it("applies the first data-pc-size entry that fits the viewport, before load", () => {
		wrapper().setAttribute("data-pc-size", "['90x728', '250x300']");
		adsenseLoader(".adsense");

		expect(wrapper().style.width).toBe("728px");
		expect(wrapper().style.height).toBe("90px");
	});

	it("falls back to the last (smallest) size when nothing fits", () => {
		Object.defineProperty(window, "innerWidth", { writable: true, value: 200 });
		wrapper().setAttribute("data-pc-size", "['90x728', '250x300']");
		adsenseLoader(".adsense");

		expect(wrapper().style.width).toBe("300px");
		expect(wrapper().style.height).toBe("250px");
	});

	it("uses data-mobile-size when mobileBreakpoint matches", () => {
		vi.spyOn(window, "matchMedia").mockImplementation(
			(query: string) =>
				({
					matches: true,
					media: query,
					addEventListener: () => {},
					removeEventListener: () => {},
				}) as unknown as MediaQueryList,
		);
		wrapper().setAttribute("data-mobile-size", "['50x320']");
		wrapper().setAttribute("data-pc-size", "['90x728']");
		adsenseLoader(".adsense");

		expect(wrapper().style.width).toBe("320px");
		expect(wrapper().style.height).toBe("50px");
	});

	it("leaves the wrapper's own CSS untouched when no size attributes are given", () => {
		adsenseLoader(".adsense");
		expect(wrapper().style.width).toBe("");
		expect(wrapper().style.height).toBe("");
	});
});

// --- load flow ----------------------------------------------------------------

describe("adsenseLoader — load flow", () => {
	it("only pushes once the wrapper intersects, not on init", () => {
		adsenseLoader(".adsense");
		expect(
			(window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.length,
		).toBe(0);
	});

	it("marks the ins pending-class and pushes once intersecting, after the script loads", async () => {
		adsenseLoader(".adsense");
		const el = wrapper();
		observerFor(el).trigger(el);
		await flush();
		resolveAdsenseScript();
		await flush();

		expect(insOf(el).classList.contains("adsbygoogle")).toBe(true);
		expect(
			(window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.length,
		).toBe(1);
	});

	it("unobserves the wrapper once it starts loading", () => {
		adsenseLoader(".adsense");
		const el = wrapper();
		const observer = observerFor(el);
		observer.trigger(el);
		expect(observer.observed).not.toContain(el);
	});

	it("adds adsense--loaded and calls onFilled once AdSense reports filled", async () => {
		const onFilled = vi.fn();
		adsenseLoader(".adsense", { onFilled });
		const el = wrapper();
		observerFor(el).trigger(el);
		await flush();
		resolveAdsenseScript();
		await flush();

		simulateFillStatus(insOf(el), "filled");
		await flush();

		expect(el.classList.contains("adsense--loaded")).toBe(true);
		expect(onFilled).toHaveBeenCalledWith(el);
		expect(document.body.contains(el)).toBe(true);
	});

	it("calls onLoad right before loading starts", () => {
		const onLoad = vi.fn();
		adsenseLoader(".adsense", { onLoad });
		const el = wrapper();
		observerFor(el).trigger(el);
		expect(onLoad).toHaveBeenCalledWith(el);
	});
});

// --- unfilled handling ----------------------------------------------------------

describe("adsenseLoader — unfilled handling", () => {
	async function triggerUnfilled(el: HTMLElement): Promise<void> {
		observerFor(el).trigger(el);
		await flush();
		resolveAdsenseScript();
		await flush();
		simulateFillStatus(insOf(el), "unfilled");
		await flush();
	}

	it("removes the wrapper by default when unfilled", async () => {
		const onUnfilled = vi.fn();
		adsenseLoader(".adsense", { onUnfilled });
		const el = wrapper();

		await triggerUnfilled(el);

		expect(onUnfilled).toHaveBeenCalledWith(el);
		expect(document.body.contains(el)).toBe(false);
	});

	it("keeps the wrapper (tagged) when removeOnUnfilled is false", async () => {
		adsenseLoader(".adsense", { removeOnUnfilled: false });
		const el = wrapper();

		await triggerUnfilled(el);

		expect(document.body.contains(el)).toBe(true);
		expect(el.classList.contains("adsense--unfilled")).toBe(true);
	});

	it("treats a script load failure the same as unfilled", async () => {
		const onUnfilled = vi.fn();
		adsenseLoader(".adsense", { onUnfilled });
		const el = wrapper();
		observerFor(el).trigger(el);
		await flush();

		const script = document.head.querySelector(
			`script[src^="${ADSENSE_SCRIPT_SRC}"]`,
		)!;
		script.dispatchEvent(new Event("error"));
		await flush();

		expect(onUnfilled).toHaveBeenCalledWith(el);
		expect(document.body.contains(el)).toBe(false);
	});
});

// --- push serialization (the shared-queue race) ----------------------------

describe("adsenseLoader — push serialization", () => {
	it("doesn't add the pending class to a second wrapper until the first's fill status is known", async () => {
		document.body.innerHTML = `
			<div class="adsense"><ins data-ad-client="ca-pub-test" data-ad-slot="1"></ins></div>
			<div class="adsense"><ins data-ad-client="ca-pub-test" data-ad-slot="2"></ins></div>
		`;
		adsenseLoader(".adsense");
		const [el1, el2] = Array.from(
			document.querySelectorAll(".adsense"),
		) as HTMLElement[];

		observerFor(el1).trigger(el1);
		observerFor(el2).trigger(el2);
		await flush();
		resolveAdsenseScript(); // shared/memoized — resolves both waiters
		await flush();

		// el1 claimed the push; el2 must still be waiting on the lock.
		expect(insOf(el1).classList.contains("adsbygoogle")).toBe(true);
		expect(insOf(el2).classList.contains("adsbygoogle")).toBe(false);

		simulateFillStatus(insOf(el1), "filled");
		await flush();

		// only after el1 resolves does el2 get its turn.
		expect(insOf(el2).classList.contains("adsbygoogle")).toBe(true);
	});
});

// --- late-inserted wrappers (observeMutations) --------------------------------

describe("adsenseLoader — observeMutations", () => {
	it("picks up a wrapper inserted after init", async () => {
		adsenseLoader(".adsense");
		const fresh = document.createElement("div");
		fresh.className = "adsense";
		fresh.innerHTML = '<ins class="adsbygoogle"></ins>';
		document.body.appendChild(fresh);

		await new Promise((resolve) => setTimeout(resolve, 150));

		expect(observerFor(fresh)).toBeTruthy();
	});

	it("does not observe late-inserted wrappers when observeMutations is false", async () => {
		adsenseLoader(".adsense", { observeMutations: false });
		const fresh = document.createElement("div");
		fresh.className = "adsense";
		fresh.innerHTML = '<ins class="adsbygoogle"></ins>';
		document.body.appendChild(fresh);

		await new Promise((resolve) => setTimeout(resolve, 150));

		expect(() => observerFor(fresh)).toThrow();
	});
});

// --- destroy -------------------------------------------------------------------

describe("adsenseLoader — destroy", () => {
	it("restores original markup and clears applied size/classes", async () => {
		wrapper().setAttribute("data-pc-size", "['90x728']");
		const instance = adsenseLoader(".adsense");
		const el = wrapper();
		const originalHTML = el.innerHTML;

		observerFor(el).trigger(el);
		await flush();
		resolveAdsenseScript();
		await flush();
		simulateFillStatus(insOf(el), "filled");
		await flush();

		instance.destroy();

		expect(el.innerHTML).toBe(originalHTML);
		expect(el.classList.contains("adsense--loaded")).toBe(false);
		expect(el.style.width).toBe("");
		expect(el.style.height).toBe("");
	});

	it("ignores intersections that fire after destroy", async () => {
		const instance = adsenseLoader(".adsense");
		const el = wrapper();
		const observer = observerFor(el);
		instance.destroy();

		observer.trigger(el);
		await flush();

		expect(insOf(el).classList.contains("adsbygoogle")).toBe(false);
		expect(
			(window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.length,
		).toBe(0);
	});

	it("disconnects the mutation observer so later insertions are ignored", async () => {
		const instance = adsenseLoader(".adsense");
		instance.destroy();

		const fresh = document.createElement("div");
		fresh.className = "adsense";
		fresh.innerHTML = '<ins class="adsbygoogle"></ins>';
		document.body.appendChild(fresh);

		await new Promise((resolve) => setTimeout(resolve, 150));

		expect(() => observerFor(fresh)).toThrow();
	});
});
