import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stackify } from "../src/plugins/stackify";

function makeStack(count = 3): void {
	document.body.innerHTML = `<div id="stack">${Array.from(
		{ length: count },
		(_, i) => `<div class="card" id="card-${i}">Card ${i}</div>`,
	).join("")}</div>`;
}

function cards(): HTMLElement[] {
	return Array.from(document.querySelectorAll<HTMLElement>("#stack > .card"));
}

beforeEach(() => {
	makeStack();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("stackify", () => {
	it("positions cards front-to-back with decreasing top offset and z-index", () => {
		stackify("#stack", { autoplay: false, offset: 20 });
		const [c0, c1, c2] = cards();

		expect(c0.style.top).toBe("40px"); // (n-1-0)*20
		expect(c1.style.top).toBe("20px"); // (n-1-1)*20
		expect(c2.style.top).toBe("0px"); // (n-1-2)*20
		expect(Number(c0.style.zIndex)).toBeGreaterThan(Number(c1.style.zIndex));
		expect(Number(c1.style.zIndex)).toBeGreaterThan(Number(c2.style.zIndex));
	});

	it("marks the front card active and gives it pointer events, unlike the rest", () => {
		stackify("#stack", { autoplay: false });
		const [c0, c1] = cards();

		expect(c0.classList.contains("stackify-active")).toBe(true);
		expect(c0.style.pointerEvents).toBe("auto");
		expect(c1.classList.contains("stackify-active")).toBe(false);
		expect(c1.style.pointerEvents).toBe("none");
	});

	it("next() sends the front card to the back and promotes the next one", () => {
		const instance = stackify("#stack", { autoplay: false });
		const [c0, c1] = cards();

		instance.next();

		expect(c1.classList.contains("stackify-active")).toBe(true);
		expect(c0.classList.contains("stackify-active")).toBe(false);
		expect(c0.style.top).toBe("0px"); // now the back-most card
	});

	it("prev() brings the back-most card to the front", () => {
		const instance = stackify("#stack", { autoplay: false });
		const [, , c2] = cards();

		instance.prev();

		expect(c2.classList.contains("stackify-active")).toBe(true);
	});

	it("goTo() brings the target original index to the front", () => {
		const instance = stackify("#stack", { autoplay: false });
		const [, , c2] = cards();

		instance.goTo(2);

		expect(c2.classList.contains("stackify-active")).toBe(true);
		expect(instance.getActiveIndex()).toEqual([2]);
	});

	it("fires onBeforeChange immediately and onAfterChange once the transition duration elapses", () => {
		vi.useFakeTimers();
		const onBeforeChange = vi.fn();
		const onAfterChange = vi.fn();
		const instance = stackify("#stack", {
			autoplay: false,
			duration: 500,
			onBeforeChange,
			onAfterChange,
		});

		instance.next();

		expect(onBeforeChange).toHaveBeenCalledOnce();
		expect(onBeforeChange).toHaveBeenCalledWith(
			expect.objectContaining({ fromIndex: 0, toIndex: 1 }),
		);
		expect(onAfterChange).not.toHaveBeenCalled();

		vi.advanceTimersByTime(500);
		expect(onAfterChange).toHaveBeenCalledOnce();
	});

	it("auto-cycles on the configured interval when autoplay is on", () => {
		vi.useFakeTimers();
		stackify("#stack", { autoplay: true, interval: 1000, duration: 0 });
		const [c0, c1] = cards();

		expect(c0.classList.contains("stackify-active")).toBe(true);
		vi.advanceTimersByTime(1000);
		expect(c1.classList.contains("stackify-active")).toBe(true);
	});

	it("direction: backward cycles the back card to the front on each tick", () => {
		vi.useFakeTimers();
		stackify("#stack", {
			autoplay: true,
			interval: 1000,
			duration: 0,
			direction: "backward",
		});
		const [, , c2] = cards();

		vi.advanceTimersByTime(1000);
		expect(c2.classList.contains("stackify-active")).toBe(true);
	});

	it("pauses on mouseenter and resumes on mouseleave when pauseOnHover is true", () => {
		vi.useFakeTimers();
		stackify("#stack", {
			autoplay: true,
			interval: 1000,
			duration: 0,
			pauseOnHover: true,
		});
		const [c0, c1] = cards();
		const container = document.getElementById("stack")!;

		container.dispatchEvent(new Event("mouseenter"));
		vi.advanceTimersByTime(5000);
		expect(c0.classList.contains("stackify-active")).toBe(true); // still paused

		container.dispatchEvent(new Event("mouseleave"));
		vi.advanceTimersByTime(1000);
		expect(c1.classList.contains("stackify-active")).toBe(true);
	});

	it("clicking a non-front card brings it to the front when clickToActivate is true", () => {
		stackify("#stack", { autoplay: false, clickToActivate: true });
		const [, , c2] = cards();

		c2.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		expect(c2.classList.contains("stackify-active")).toBe(true);
	});

	it("ignores clicks when clickToActivate is false", () => {
		stackify("#stack", { autoplay: false, clickToActivate: false });
		const [c0, , c2] = cards();

		c2.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		expect(c0.classList.contains("stackify-active")).toBe(true);
	});

	it("respects startIndex", () => {
		stackify("#stack", { autoplay: false, startIndex: 1 });
		const [, c1] = cards();

		expect(c1.classList.contains("stackify-active")).toBe(true);
	});

	it("fades cards beyond visibleCards to opacity 0", () => {
		stackify("#stack", { autoplay: false, visibleCards: 1 });
		const [c0, c1, c2] = cards();

		expect(c0.style.opacity).toBe("1");
		expect(c1.style.opacity).toBe("0");
		expect(c2.style.opacity).toBe("0");
	});

	it("applies scaleStep to cards behind the front one", () => {
		stackify("#stack", { autoplay: false, scaleStep: 0.05 });
		const [c0, c1, c2] = cards();

		expect(c0.style.transform).toBe("");
		expect(c1.style.transform).toBe("scale(0.95)");
		expect(c2.style.transform).toBe("scale(0.9)");
	});

	it("destroy() restores every card's original inline styles and stops the timer", () => {
		vi.useFakeTimers();
		document.body.innerHTML = `
			<div id="stack">
				<div class="card" style="color: red;">A</div>
				<div class="card">B</div>
			</div>
		`;
		const instance = stackify("#stack", {
			autoplay: true,
			interval: 500,
			duration: 0,
		});
		const [c0] = cards();

		instance.destroy();

		expect(c0.style.cssText).toBe("color: red;");
		expect(c0.classList.contains("stackify-card")).toBe(false);
		expect(
			document.getElementById("stack")!.classList.contains("stackify-stack"),
		).toBe(false);

		// timer should no longer be running post-destroy
		vi.advanceTimersByTime(5000);
		expect(c0.classList.contains("stackify-active")).toBe(false);
	});

	it("does nothing (but doesn't throw) for an empty container", () => {
		document.body.innerHTML = `<div id="empty"></div>`;
		expect(() => stackify("#empty")).not.toThrow();
		const instance = stackify("#empty");
		expect(instance.getActiveIndex()).toEqual([]);
		expect(() => instance.next()).not.toThrow();
		expect(() => instance.destroy()).not.toThrow();
	});

	it("controls every matched container when the selector matches more than one stack", () => {
		document.body.innerHTML = `
			<div class="stack"><div class="card">A0</div><div class="card">A1</div></div>
			<div class="stack"><div class="card">B0</div><div class="card">B1</div></div>
		`;
		const instance = stackify(".stack", { autoplay: false });
		expect(instance.getActiveIndex()).toEqual([0, 0]);

		instance.next();
		expect(instance.getActiveIndex()).toEqual([1, 1]);
	});

	it("an explicit `undefined` in the options object doesn't wipe the matching default", () => {
		// regression test: `{ ...defaults, ...options }` used to let a
		// caller-supplied `key: undefined` (e.g. from reading a blank form
		// field with `raw ? Number(raw) : undefined`) stomp a valid default.
		// visibleCards going through as `undefined` turned into
		// `Math.min(undefined, n)` -> NaN, hiding every card at opacity 0.
		stackify("#stack", { autoplay: false, visibleCards: undefined });
		const [c0, c1, c2] = cards();

		expect(c0.style.opacity).toBe("1");
		expect(c1.style.opacity).toBe("1");
		expect(c2.style.opacity).toBe("1");
	});

	it("peekWidth: expand widens cards behind the front one via scaleX", () => {
		stackify("#stack", {
			autoplay: false,
			peekWidth: "expand",
			peekWidthStep: 0.1,
		});
		const [c0, c1, c2] = cards();

		expect(c0.style.transform).toBe("");
		expect(c1.style.transform).toBe("scaleX(1.1)");
		expect(c2.style.transform).toBe("scaleX(1.2)");
	});

	it("peekWidth: shrink narrows cards behind the front one via scaleX", () => {
		stackify("#stack", {
			autoplay: false,
			peekWidth: "shrink",
			peekWidthStep: 0.1,
		});
		const [c0, c1, c2] = cards();

		expect(c0.style.transform).toBe("");
		expect(c1.style.transform).toBe("scaleX(0.9)");
		expect(c2.style.transform).toBe("scaleX(0.8)");
	});

	it("peekWidth combines with scaleStep in a single transform", () => {
		stackify("#stack", {
			autoplay: false,
			scaleStep: 0.05,
			peekWidth: "expand",
			peekWidthStep: 0.1,
		});
		const [, c1] = cards();

		expect(c1.style.transform).toBe("scale(0.95) scaleX(1.1)");
	});

	it("peekWidth: none (default) leaves width untouched", () => {
		stackify("#stack", { autoplay: false });
		const [c0, c1, c2] = cards();

		expect(c0.style.transform).toBe("");
		expect(c1.style.transform).toBe("");
		expect(c2.style.transform).toBe("");
	});
});

describe("stackify — layout: marquee", () => {
	// marquee moves cards into an inner track div + appends a cloned set
	// after them for seamless looping, so this needs a descendant
	// selector — originals are appended before clones, so the first
	// `n` matches (in document order) are always the originals.
	function marqueeCards(): HTMLElement[] {
		return Array.from(
			document.querySelectorAll<HTMLElement>("#stack .card"),
		).slice(0, 3);
	}

	it("moves cards into an inner track and appends a cloned set for seamless looping", () => {
		stackify("#stack", { layout: "marquee", autoplay: false });
		const container = document.getElementById("stack")!;
		const track = container.firstElementChild as HTMLElement;

		expect(track.children.length).toBe(6); // 3 originals + 3 clones
		expect(container.querySelectorAll(".card").length).toBe(6);
	});

	it("marks the first original card active on init", () => {
		stackify("#stack", { layout: "marquee", autoplay: false });
		const [c0] = marqueeCards();

		expect(c0.classList.contains("stackify-active")).toBe(true);
	});

	it("next()/prev() move the active card forward/back and fire change hooks", () => {
		const onBeforeChange = vi.fn();
		const onAfterChange = vi.fn();
		vi.useFakeTimers();
		const instance = stackify("#stack", {
			layout: "marquee",
			autoplay: false,
			duration: 0,
			onBeforeChange,
			onAfterChange,
		});
		const [, c1] = marqueeCards();

		instance.next();

		expect(c1.classList.contains("stackify-active")).toBe(true);
		expect(onBeforeChange).toHaveBeenCalledOnce();
		vi.advanceTimersByTime(0);
		expect(onAfterChange).toHaveBeenCalledOnce();
	});

	it("goTo() jumps directly to the target original index", () => {
		const instance = stackify("#stack", { layout: "marquee", autoplay: false });
		const [, , c2] = marqueeCards();

		instance.goTo(2);

		expect(c2.classList.contains("stackify-active")).toBe(true);
		expect(instance.getActiveIndex()).toEqual([2]);
	});

	it("play()/pause() toggle the auto-scroll loop without throwing", () => {
		const instance = stackify("#stack", {
			layout: "marquee",
			autoplay: false,
			marqueeSpeed: 100,
		});

		expect(() => instance.play()).not.toThrow();
		expect(() => instance.pause()).not.toThrow();
	});

	it("destroy() removes the clones and moves original cards back under the container", () => {
		const instance = stackify("#stack", { layout: "marquee", autoplay: false });
		const container = document.getElementById("stack")!;

		instance.destroy();

		expect(container.children.length).toBe(3); // track + clones gone
		expect(container.querySelectorAll(".card").length).toBe(3);
		expect(container.classList.contains("stackify-stack")).toBe(false);
	});

	it("ignores an empty container without throwing", () => {
		document.body.innerHTML = `<div id="empty"></div>`;
		expect(() => stackify("#empty", { layout: "marquee" })).not.toThrow();
		const instance = stackify("#empty", { layout: "marquee" });
		expect(instance.getActiveIndex()).toEqual([]);
		expect(() => instance.next()).not.toThrow();
		expect(() => instance.destroy()).not.toThrow();
	});
});

describe("stackify — orientation", () => {
	it("stack defaults to vertical: positions via `top`, not `left`", () => {
		stackify("#stack", { autoplay: false, offset: 20 });
		const [c0, c1] = cards();

		expect(c0.style.top).toBe("40px");
		expect(c0.style.left).toBe("0px");
		expect(c1.style.top).toBe("20px");
	});

	it("stack orientation: horizontal positions via `left`, not `top`", () => {
		stackify("#stack", {
			autoplay: false,
			offset: 20,
			orientation: "horizontal",
		});
		const [c0, c1, c2] = cards();

		expect(c0.style.left).toBe("40px");
		expect(c1.style.left).toBe("20px");
		expect(c2.style.left).toBe("0px");
		expect(c0.style.top).toBe("0px");
	});

	it("stack orientation: horizontal sizes the container by width, not height", () => {
		stackify("#stack", {
			autoplay: false,
			offset: 20,
			orientation: "horizontal",
		});
		const container = document.getElementById("stack")!;

		expect(container.style.width).not.toBe("");
		expect(container.style.height).toBe("");
	});

	it("marquee defaults to horizontal: track lays out as a row", () => {
		stackify("#stack", { layout: "marquee", autoplay: false });
		const track = document.getElementById("stack")!
			.firstElementChild as HTMLElement;

		expect(track.style.flexDirection).toBe("row");
	});

	it("marquee orientation: vertical lays the track out as a column", () => {
		stackify("#stack", {
			layout: "marquee",
			autoplay: false,
			orientation: "vertical",
		});
		const track = document.getElementById("stack")!
			.firstElementChild as HTMLElement;

		expect(track.style.flexDirection).toBe("column");
	});

	it("marquee orientation: vertical steps still fire next()/prev() correctly", () => {
		const instance = stackify("#stack", {
			layout: "marquee",
			autoplay: false,
			orientation: "vertical",
		});
		const container = document.getElementById("stack")!;
		const originals = Array.from(
			container.querySelectorAll<HTMLElement>(".card"),
		).slice(0, 3);

		instance.next();

		expect(originals[1].classList.contains("stackify-active")).toBe(true);
	});
});
