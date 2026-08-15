import { beforeEach, describe, expect, it } from "vitest";

import { marqify } from "../src/plugins/marqify";

class MockResizeObserver {
	static instances: MockResizeObserver[] = [];
	callback: ResizeObserverCallback;
	target: Element | null = null;

	constructor(callback: ResizeObserverCallback) {
		this.callback = callback;
		MockResizeObserver.instances.push(this);
	}
	observe(el: Element) {
		this.target = el;
	}
	unobserve() {
		this.target = null;
	}
	disconnect() {
		this.target = null;
	}
	trigger(width: number) {
		this.callback(
			[{ contentRect: { width, height: width } } as ResizeObserverEntry],
			this as unknown as ResizeObserver,
		);
	}
}

function observerFor(target: Element): MockResizeObserver {
	const found = MockResizeObserver.instances.find((o) => o.target === target);
	if (!found) throw new Error("no observer found for target");
	return found;
}

beforeEach(() => {
	MockResizeObserver.instances = [];
	globalThis.ResizeObserver = MockResizeObserver;
	document.getElementById("marqify-styles")?.remove();
	document.body.innerHTML = `
		<div class="cards">
			<div class="card">A</div>
			<div class="card">B</div>
		</div>
	`;
});

function container(): HTMLElement {
	return document.querySelector(".cards")!;
}

describe("marqify", () => {
	it("injects its stylesheet into <head> exactly once", () => {
		marqify(".cards");
		marqify(".cards");
		expect(document.querySelectorAll("#marqify-styles").length).toBe(1);
		expect(document.getElementById("marqify-styles")!.textContent).toContain(
			"@keyframes marqifyLeft",
		);
	});

	it("marks the container and builds the inner/content structure", () => {
		marqify(".cards");
		const el = container();
		expect(el.hasAttribute("data-marqify")).toBe(true);
		expect(el.getAttribute("data-marqify-direction")).toBe("left");
		expect(el.hasAttribute("data-marqify-pause-on-hover")).toBe(true); // default true
		expect(el.querySelectorAll(":scope > [data-marqify-inner]").length).toBe(1);
	});

	it("creates 2 content clones by default (duplicated: true)", () => {
		marqify(".cards");
		expect(container().querySelectorAll("[data-marqify-content]").length).toBe(
			2,
		);
	});

	it("creates only 1 content clone when duplicated is false", () => {
		marqify(".cards", { duplicated: false });
		expect(container().querySelectorAll("[data-marqify-content]").length).toBe(
			1,
		);
	});

	it("copies the original content into every item and hides all but the first with aria-hidden", () => {
		marqify(".cards");
		const items = container().querySelectorAll<HTMLElement>(
			"[data-marqify-item]",
		);
		expect(items.length).toBeGreaterThan(0);
		for (const item of items) {
			expect(item.querySelectorAll(".card").length).toBe(2);
		}
		expect(items[0].hasAttribute("aria-hidden")).toBe(false);
		for (const item of Array.from(items).slice(1)) {
			expect(item.getAttribute("aria-hidden")).toBe("true");
		}
	});

	it("does not set data-marqify-pause-on-hover when pauseOnHover is false", () => {
		marqify(".cards", { pauseOnHover: false });
		expect(container().hasAttribute("data-marqify-pause-on-hover")).toBe(false);
	});

	it("sets the direction attribute from options", () => {
		marqify(".cards", { direction: "right" });
		expect(container().getAttribute("data-marqify-direction")).toBe("right");
	});

	it("recalculates and rebuilds items when the container/item size changes", () => {
		marqify(".cards");
		const el = container();
		const firstItem = el.querySelector<HTMLElement>("[data-marqify-item]")!;

		observerFor(el).trigger(1000);
		observerFor(firstItem).trigger(200);

		// ceil(1000/200) = 5 reps per content clone
		const content = el.querySelector<HTMLElement>("[data-marqify-content]")!;
		expect(content.querySelectorAll("[data-marqify-item]").length).toBe(5);
	});

	it("applies a longer animation duration for a slower speed", () => {
		marqify(".cards", { speed: "slow" });
		const slowEl = container();
		observerFor(slowEl).trigger(1000);
		observerFor(slowEl.querySelector("[data-marqify-item]")!).trigger(200);
		const slowDuration = parseFloat(
			slowEl.querySelector<HTMLElement>("[data-marqify-content]")!.style
				.animationDuration,
		);

		document.body.innerHTML = `<div class="cards2"><div class="card">A</div></div>`;
		marqify(".cards2", { speed: "fast" });
		const fastEl = document.querySelector<HTMLElement>(".cards2")!;
		observerFor(fastEl).trigger(1000);
		observerFor(fastEl.querySelector("[data-marqify-item]")!).trigger(200);
		const fastDuration = parseFloat(
			fastEl.querySelector<HTMLElement>("[data-marqify-content]")!.style
				.animationDuration,
		);

		expect(slowDuration).toBeGreaterThan(fastDuration);
	});

	it("accepts a raw numeric speed", () => {
		marqify(".cards", { speed: 2 });
		const el = container();
		observerFor(el).trigger(1000);
		observerFor(el.querySelector("[data-marqify-item]")!).trigger(200);
		const duration = el.querySelector<HTMLElement>("[data-marqify-content]")!
			.style.animationDuration;
		expect(duration).not.toBe("");
	});

	it("sets animation-delay from delayBeforeStart, empty string when 0", () => {
		marqify(".cards", { delayBeforeStart: 300 });
		const content = container().querySelector<HTMLElement>(
			"[data-marqify-content]",
		)!;
		expect(content.style.animationDelay).toBe("300ms");

		document.body.innerHTML = `<div class="cards2"><div class="card">A</div></div>`;
		marqify(".cards2");
		const content2 = document.querySelector<HTMLElement>(
			".cards2 [data-marqify-content]",
		)!;
		expect(content2.style.animationDelay).toBe("");
	});

	it("destroy() restores the original content and removes marqify attributes", () => {
		const original = container().innerHTML;
		const instance = marqify(".cards");
		expect(container().innerHTML).not.toBe(original);

		instance.destroy();
		expect(container().innerHTML).toBe(original);
		expect(container().hasAttribute("data-marqify")).toBe(false);
		expect(container().hasAttribute("data-marqify-direction")).toBe(false);
	});

	it("destroy() disconnects observers so further resizes are ignored", () => {
		const instance = marqify(".cards");
		const el = container();
		const firstItem = el.querySelector<HTMLElement>("[data-marqify-item]")!;
		const itemObs = observerFor(firstItem);

		instance.destroy();
		itemObs.trigger(999); // should be a no-op post-destroy
		// content was fully replaced by destroy(), so there's nothing marqify-related left
		expect(container().querySelector("[data-marqify-content]")).toBeNull();
	});

	it("controls every matched container when the selector matches more than one", () => {
		document.body.innerHTML = `
			<div class="row"><div class="card">A</div></div>
			<div class="row"><div class="card">B</div></div>
		`;
		marqify(".row");
		const rows = document.querySelectorAll(".row");
		expect(rows.length).toBe(2);
		for (const row of rows) {
			expect(row.hasAttribute("data-marqify")).toBe(true);
		}
	});
});
