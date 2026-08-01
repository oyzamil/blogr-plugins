import { beforeEach, describe, expect, it, vi } from "vitest";
import { lazify } from "../src/plugins/lazify.js";

class MockIntersectionObserver {
	static instances: MockIntersectionObserver[] = [];
	callback: IntersectionObserverCallback;
	observed: Element[] = [];

	constructor(callback: IntersectionObserverCallback) {
		this.callback = callback;
		MockIntersectionObserver.instances.push(this);
	}
	observe(el: Element) {
		this.observed.push(el);
	}
	unobserve(el: Element) {
		this.observed = this.observed.filter((e) => e !== el);
	}
	disconnect() {
		this.observed = [];
	}
	trigger(el: Element) {
		this.callback(
			[{ target: el, isIntersecting: true } as IntersectionObserverEntry],
			this as unknown as IntersectionObserver,
		);
	}
}

beforeEach(() => {
	MockIntersectionObserver.instances = [];
	// @ts-expect-error - test stub
	globalThis.IntersectionObserver = MockIntersectionObserver;
});

describe("lazify", () => {
	it("sets img src when it intersects", () => {
		document.body.innerHTML = `<img id="pic" data-src="/photo.jpg" />`;
		lazify("#pic");

		const observer = MockIntersectionObserver.instances[0];
		const img = document.getElementById("pic") as HTMLImageElement;
		observer.trigger(img);

		expect(img.src).toContain("/photo.jpg");
		expect(img.classList.contains("lazy-ify")).toBe(true);
	});

	it("sets background-image on non-img elements", () => {
		document.body.innerHTML = `<div id="box" data-src="/bg.jpg"></div>`;
		lazify("#box");

		const observer = MockIntersectionObserver.instances[0];
		const box = document.getElementById("box") as HTMLElement;
		observer.trigger(box);

		expect(box.style.backgroundImage).toContain("/bg.jpg");
	});

	it("calls onLoad callback", () => {
		document.body.innerHTML = `<img id="pic" data-src="/photo.jpg" />`;
		const onLoad = vi.fn();
		lazify("#pic", { onLoad });

		const observer = MockIntersectionObserver.instances[0];
		observer.trigger(document.getElementById("pic")!);

		expect(onLoad).toHaveBeenCalledTimes(1);
	});

	it("destroy disconnects the observer", () => {
		document.body.innerHTML = `<img id="pic" data-src="/photo.jpg" />`;
		const instance = lazify("#pic");
		const observer = MockIntersectionObserver.instances[0];
		instance.destroy();
		expect(observer.observed).toHaveLength(0);
	});
});
