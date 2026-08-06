import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stackify } from "../src/plugins/stackify.js";

function makeStack(count = 3, id = "stack"): HTMLElement {
	document.body.innerHTML = `<div id="${id}">${Array.from(
		{ length: count },
		(_, i) => `<div class="card" id="card-${i}"></div>`,
	).join("")}</div>`;
	return document.getElementById(id)!;
}

/**
 * Builds a plain Event with `clientX`/`clientY` overridden so we can drive
 * the plugin's pointer handlers without depending on jsdom's (patchy)
 * PointerEvent constructor support — the plugin only ever reads
 * `e.clientX`/`e.clientY` off the event, so this is a faithful stand-in.
 */
function coordEvent(type: string, client: number): Event {
	const event = new Event(type, { bubbles: true, cancelable: true });
	Object.defineProperty(event, "clientY", {
		value: client,
		configurable: true,
	});
	Object.defineProperty(event, "clientX", {
		value: client,
		configurable: true,
	});
	return event;
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
	document.body.innerHTML = "";
});

afterEach(() => {
	vi.useRealTimers();
	document.body.innerHTML = "";
});

describe("stackify - stack layout", () => {
	it("adds stack/card classes and activates the front card on init", () => {
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, { autoplay: false });

		expect(container.classList.contains("stackify-stack")).toBe(true);
		const cards = Array.from(container.children) as HTMLElement[];
		expect(cards.every((c) => c.classList.contains("stackify-card"))).toBe(
			true,
		);
		expect(cards[0].classList.contains("stackify-active")).toBe(true);
		expect(cards[1].classList.contains("stackify-active")).toBe(false);
		expect(widget.getActiveIndex()).toEqual([0]);

		widget.destroy();
	});

	it("honors startIndex by activating that card immediately", () => {
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, {
			autoplay: false,
			startIndex: 2,
		});

		expect(widget.getActiveIndex()).toEqual([2]);
		const cards = Array.from(container.children) as HTMLElement[];
		expect(cards[2].classList.contains("stackify-active")).toBe(true);

		widget.destroy();
	});

	it("next()/prev()/goTo() rotate the active card", () => {
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, { autoplay: false });

		widget.next();
		expect(widget.getActiveIndex()).toEqual([1]);

		widget.prev();
		expect(widget.getActiveIndex()).toEqual([0]);

		widget.prev();
		expect(widget.getActiveIndex()).toEqual([2]);

		widget.goTo(1);
		expect(widget.getActiveIndex()).toEqual([1]);

		widget.destroy();

		void container;
	});

	it("fires onBeforeChange synchronously and onAfterChange after `duration` ms", () => {
		vi.useFakeTimers();
		const container = makeStack(3);
		const onBeforeChange = vi.fn();
		const onAfterChange = vi.fn();
		const widget = stackify(`#${container.id}`, {
			autoplay: false,
			duration: 500,
			onBeforeChange,
			onAfterChange,
		});
		const cards = Array.from(container.children) as HTMLElement[];

		widget.next();

		expect(onBeforeChange).toHaveBeenCalledTimes(1);
		expect(onBeforeChange).toHaveBeenCalledWith({
			fromIndex: 0,
			toIndex: 1,
			fromCard: cards[0],
			toCard: cards[1],
		});
		expect(onAfterChange).not.toHaveBeenCalled();

		vi.advanceTimersByTime(500);

		expect(onAfterChange).toHaveBeenCalledWith({
			fromIndex: 0,
			toIndex: 1,
			fromCard: cards[0],
			toCard: cards[1],
		});

		widget.destroy();
	});

	it("autoplay advances the active card every `interval` ms", () => {
		vi.useFakeTimers();
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, { interval: 1000 });

		expect(widget.getActiveIndex()).toEqual([0]);
		vi.advanceTimersByTime(1000);
		expect(widget.getActiveIndex()).toEqual([1]);
		vi.advanceTimersByTime(1000);
		expect(widget.getActiveIndex()).toEqual([2]);

		widget.destroy();
	});

	it("direction: 'backward' cycles the active card via prev() instead", () => {
		vi.useFakeTimers();
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, {
			interval: 1000,
			direction: "backward",
		});

		vi.advanceTimersByTime(1000);
		expect(widget.getActiveIndex()).toEqual([2]);

		widget.destroy();
	});

	it("pauseOnHover pauses the timer on mouseenter and resumes on mouseleave", () => {
		vi.useFakeTimers();
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, { interval: 1000 });

		container.dispatchEvent(new MouseEvent("mouseenter"));
		vi.advanceTimersByTime(2000);
		expect(widget.getActiveIndex()).toEqual([0]);

		container.dispatchEvent(new MouseEvent("mouseleave"));
		vi.advanceTimersByTime(1000);
		expect(widget.getActiveIndex()).toEqual([1]);

		widget.destroy();
	});

	it("clickToActivate brings a clicked non-front card to the front", () => {
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, { autoplay: false });
		const back = container.children[2] as HTMLElement;

		back.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(widget.getActiveIndex()).toEqual([2]);

		widget.destroy();
	});

	it("does nothing on click when clickToActivate is false", () => {
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, {
			autoplay: false,
			clickToActivate: false,
		});
		const back = container.children[2] as HTMLElement;

		back.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(widget.getActiveIndex()).toEqual([0]);

		widget.destroy();
	});

	it("dragging the front card past the threshold advances to the next card", () => {
		const container = makeStack(3);
		const front = container.children[0] as HTMLElement;
		const widget = stackify(`#${container.id}`, {
			autoplay: false,
			draggable: true,
		});

		front.dispatchEvent(coordEvent("pointerdown", 200));
		container.dispatchEvent(coordEvent("pointermove", 100));
		container.dispatchEvent(coordEvent("pointerup", 100));

		expect(widget.getActiveIndex()).toEqual([1]);

		widget.destroy();
	});

	it("dragging under the threshold snaps back without changing the active card", () => {
		const container = makeStack(3);
		const front = container.children[0] as HTMLElement;
		const widget = stackify(`#${container.id}`, {
			autoplay: false,
			draggable: true,
		});

		front.dispatchEvent(coordEvent("pointerdown", 200));
		container.dispatchEvent(coordEvent("pointermove", 180));
		container.dispatchEvent(coordEvent("pointerup", 180));

		expect(widget.getActiveIndex()).toEqual([0]);

		widget.destroy();
	});

	it("ignores pointer events entirely when draggable is false", () => {
		const container = makeStack(3);
		const front = container.children[0] as HTMLElement;
		const widget = stackify(`#${container.id}`, { autoplay: false });

		front.dispatchEvent(coordEvent("pointerdown", 200));
		container.dispatchEvent(coordEvent("pointermove", 0));
		container.dispatchEvent(coordEvent("pointerup", 0));

		expect(widget.getActiveIndex()).toEqual([0]);

		widget.destroy();
	});

	it("keeps every card visible when visibleCards is left unset (default Infinity)", () => {
		const container = makeStack(4);
		const widget = stackify(`#${container.id}`, { autoplay: false });

		for (const card of Array.from(container.children) as HTMLElement[]) {
			expect(card.style.opacity).toBe("1");
		}

		widget.destroy();
	});

	it("fades cards beyond visibleCards to opacity 0", () => {
		const container = makeStack(4);
		const widget = stackify(`#${container.id}`, {
			autoplay: false,
			visibleCards: 2,
		});
		const cards = Array.from(container.children) as HTMLElement[];

		expect(cards[0].style.opacity).toBe("1");
		expect(cards[1].style.opacity).toBe("1");
		expect(cards[2].style.opacity).toBe("0");
		expect(cards[3].style.opacity).toBe("0");

		widget.destroy();
	});

	it("does not let an explicit `undefined` in options erase a value read from data-* attributes", () => {
		// Regression test for the bug described in stackify.ts's
		// stripUndefined() doc comment: a caller-built options object with a
		// stray `someOption: undefined` (e.g. from an empty form field) must
		// not silently wipe out a value already resolved from data-*.
		const container = makeStack(4);
		container.dataset.visibleCards = "2";
		const widget = stackify(`#${container.id}`, {
			autoplay: false,
			visibleCards: undefined,
		});
		const cards = Array.from(container.children) as HTMLElement[];

		expect(cards[0].style.opacity).toBe("1");
		expect(cards[1].style.opacity).toBe("1");
		expect(cards[2].style.opacity).toBe("0");
		expect(cards[3].style.opacity).toBe("0");

		widget.destroy();
	});

	it("applies a flat size regardless of layout", () => {
		const container = makeStack(2);
		const widget = stackify(`#${container.id}`, {
			autoplay: false,
			size: { height: 300, width: "50%" },
		});

		expect(container.style.height).toBe("300px");
		expect(container.style.width).toBe("50%");

		widget.destroy();
	});

	it("applies only the size block matching the active layout", () => {
		const container = makeStack(2);
		const widget = stackify(`#${container.id}`, {
			autoplay: false,
			layout: "stack",
			size: { stack: { height: 200 }, marquee: { width: "80%" } },
		});

		expect(container.style.height).toBe("200px");
		expect(container.style.width).toBe("");

		widget.destroy();
	});

	it("reads configuration from data-* attributes when no options object is passed", () => {
		vi.useFakeTimers();
		const container = makeStack(3);
		container.dataset.interval = "500";
		container.dataset.direction = "backward";
		const widget = stackify(`#${container.id}`);

		expect(container.dataset.direction).toBe("backward");
		vi.advanceTimersByTime(500);
		expect(widget.getActiveIndex()).toEqual([2]);

		widget.destroy();
	});

	it("lets explicit options override data-* attributes", () => {
		vi.useFakeTimers();
		const container = makeStack(3);
		container.dataset.interval = "9999";
		const widget = stackify(`#${container.id}`, { interval: 100 });

		vi.advanceTimersByTime(100);
		expect(widget.getActiveIndex()).toEqual([1]);

		widget.destroy();
	});

	it("mirrors resolved config onto container.dataset and clears it on destroy", () => {
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, {
			autoplay: false,
			layout: "stack",
			direction: "backward",
			draggable: true,
		});

		expect(container.dataset.layout).toBe("stack");
		expect(container.dataset.direction).toBe("backward");
		expect(container.dataset.draggable).toBe("true");
		expect(container.dataset.peekWidth).toBeDefined();

		widget.destroy();

		expect(container.dataset.layout).toBeUndefined();
		expect(container.dataset.direction).toBeUndefined();
		expect(container.dataset.draggable).toBeUndefined();
		expect(container.dataset.peekWidth).toBeUndefined();
	});

	it("destroy() removes classes, restores styles, and stops the timer", () => {
		vi.useFakeTimers();
		const container = makeStack(3);
		const cards = Array.from(container.children) as HTMLElement[];
		const originalCardCss = cards[0].style.cssText;
		const originalContainerCss = container.style.cssText;
		const widget = stackify(`#${container.id}`, { interval: 1000 });

		widget.destroy();

		expect(container.classList.contains("stackify-stack")).toBe(false);
		expect(container.style.cssText).toBe(originalContainerCss);
		for (const card of cards) {
			expect(card.classList.contains("stackify-card")).toBe(false);
			expect(card.classList.contains("stackify-active")).toBe(false);
			expect(card.style.cssText).toBe(originalCardCss);
		}

		// The autoplay timer must no longer fire after destroy().
		vi.advanceTimersByTime(5000);
		expect(widget.getActiveIndex()).toEqual([0]);
	});

	it("detects a dynamically appended card and includes it in the stack", async () => {
		const container = makeStack(2);
		const widget = stackify(`#${container.id}`, { autoplay: false });

		const newCard = document.createElement("div");
		newCard.className = "card";
		container.appendChild(newCard);
		await flush();

		expect(newCard.classList.contains("stackify-card")).toBe(true);
		widget.goTo(2);
		expect(widget.getActiveIndex()).toEqual([2]);

		widget.destroy();
	});

	it("stops watching for new cards after destroy()", async () => {
		const container = makeStack(2);
		const widget = stackify(`#${container.id}`, { autoplay: false });
		widget.destroy();

		const newCard = document.createElement("div");
		newCard.className = "card";
		container.appendChild(newCard);
		await flush();

		expect(newCard.classList.contains("stackify-card")).toBe(false);
	});

	it("controls every matched container when the selector matches multiple stacks", () => {
		document.body.innerHTML = `
			<div class="stack"><div class="card"></div><div class="card"></div></div>
			<div class="stack"><div class="card"></div><div class="card"></div></div>
		`;
		const widget = stackify(".stack", { autoplay: false });

		expect(widget.getActiveIndex()).toEqual([0, 0]);
		widget.next();
		expect(widget.getActiveIndex()).toEqual([1, 1]);

		widget.destroy();
	});
});

describe("stackify - marquee layout", () => {
	it("builds a track containing the original cards plus looping clones", () => {
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, {
			layout: "marquee",
			autoplay: false,
		});

		const track = container.firstElementChild as HTMLElement;
		expect(track.children.length).toBe(6); // 3 originals + 3 clones
		expect(container.style.display).toBe("flex");
		expect(container.style.overflow).toBe("hidden");
		for (const card of Array.from(track.children) as HTMLElement[]) {
			expect(card.classList.contains("stackify-card")).toBe(true);
		}

		widget.destroy();
	});

	it("advances the track's transform while playing", () => {
		vi.useFakeTimers({
			toFake: [
				"setTimeout",
				"clearTimeout",
				"setInterval",
				"clearInterval",
				"requestAnimationFrame",
				"cancelAnimationFrame",
			],
		});
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, {
			layout: "marquee",
			marqueeSpeed: 60,
		});

		const track = container.firstElementChild as HTMLElement;
		const initialTransform = track.style.transform;

		vi.advanceTimersByTime(1000);

		expect(track.style.transform).not.toBe(initialTransform);

		widget.destroy();
	});

	it("does not animate when marqueeSpeed is 0", () => {
		vi.useFakeTimers({
			toFake: [
				"setTimeout",
				"clearTimeout",
				"setInterval",
				"clearInterval",
				"requestAnimationFrame",
				"cancelAnimationFrame",
			],
		});
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, {
			layout: "marquee",
			marqueeSpeed: 0,
		});

		const track = container.firstElementChild as HTMLElement;
		vi.advanceTimersByTime(1000);

		expect(track.style.transform).toBe("");

		widget.destroy();
	});

	it("goTo() jumps to the given original card and marks it active", () => {
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, {
			layout: "marquee",
			autoplay: false,
		});

		widget.goTo(1);

		expect(widget.getActiveIndex()).toEqual([1]);
		const cards = Array.from(
			container.querySelectorAll(".card"),
		) as HTMLElement[];
		expect(cards[1].classList.contains("stackify-active")).toBe(true);

		widget.destroy();
	});

	it("onBeforeChange/onAfterChange fire around a goTo() jump", () => {
		vi.useFakeTimers();
		const onBeforeChange = vi.fn();
		const onAfterChange = vi.fn();
		const container = makeStack(3);
		const widget = stackify(`#${container.id}`, {
			layout: "marquee",
			autoplay: false,
			duration: 300,
			onBeforeChange,
			onAfterChange,
		});

		widget.goTo(2);

		expect(onBeforeChange).toHaveBeenCalledTimes(1);
		expect(onAfterChange).not.toHaveBeenCalled();

		vi.advanceTimersByTime(300);
		expect(onAfterChange).toHaveBeenCalledTimes(1);

		widget.destroy();
	});

	it("destroy() removes the track and restores the container and cards", () => {
		const container = makeStack(3);
		const cards = Array.from(container.children) as HTMLElement[];
		const originalContainerCss = container.style.cssText;
		const widget = stackify(`#${container.id}`, {
			layout: "marquee",
			autoplay: false,
		});
		const track = container.firstElementChild as HTMLElement;

		widget.destroy();

		expect(container.contains(track)).toBe(false);
		expect(container.style.cssText).toBe(originalContainerCss);
		expect(Array.from(container.children)).toEqual(cards);
		for (const card of cards) {
			expect(card.classList.contains("stackify-card")).toBe(false);
			expect(card.classList.contains("stackify-active")).toBe(false);
		}
	});
});
