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

	it("sets iframe src when it intersects", () => {
		document.body.innerHTML = `<iframe id="embed" data-src="https://example.com/embed"></iframe>`;
		lazify("#embed");

		const observer = MockIntersectionObserver.instances[0];
		const iframe = document.getElementById("embed") as HTMLIFrameElement;
		observer.trigger(iframe);

		expect(iframe.src).toBe("https://example.com/embed");
		expect(iframe.classList.contains("lazy-ify")).toBe(true);
	});

	it("sets video src directly when there are no <source> children", () => {
		document.body.innerHTML = `<video id="clip" data-src="/clip.mp4"></video>`;
		lazify("#clip");

		const observer = MockIntersectionObserver.instances[0];
		const video = document.getElementById("clip") as HTMLVideoElement;
		observer.trigger(video);

		expect(video.src).toContain("/clip.mp4");
		expect(video.classList.contains("lazy-ify")).toBe(true);
	});

	it("fills in <source data-src> children and skips the video's own src", () => {
		document.body.innerHTML = `
			<video id="clip">
				<source data-src="/clip.webm" type="video/webm" />
				<source data-src="/clip.mp4" type="video/mp4" />
			</video>
		`;
		lazify("#clip");

		const observer = MockIntersectionObserver.instances[0];
		const video = document.getElementById("clip") as HTMLVideoElement;
		observer.trigger(video);

		const sources = video.querySelectorAll("source");
		expect(sources[0].src).toContain("/clip.webm");
		expect(sources[1].src).toContain("/clip.mp4");
		expect(video.classList.contains("lazy-ify")).toBe(true);
	});

	it("sets a video's poster from data-poster", () => {
		document.body.innerHTML = `<video id="clip" data-poster="/poster.jpg" data-src="/clip.mp4"></video>`;
		lazify("#clip");

		const observer = MockIntersectionObserver.instances[0];
		const video = document.getElementById("clip") as HTMLVideoElement;
		observer.trigger(video);

		expect(video.poster).toContain("/poster.jpg");
	});

	it("leaves a video untouched (no lazy-ify, still observed) when it has nothing to load", () => {
		document.body.innerHTML = `<video id="clip"></video>`;
		lazify("#clip");

		const observer = MockIntersectionObserver.instances[0];
		const video = document.getElementById("clip") as HTMLVideoElement;
		observer.trigger(video);

		expect(video.classList.contains("lazy-ify")).toBe(false);
		expect(observer.observed).toContain(video);
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
