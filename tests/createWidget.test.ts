import { beforeEach, describe, expect, it, vi } from "vitest";

import { type PostEntry } from "../src/plugins/createWidget.js";
import { MockIntersectionObserver, makePager, makePost } from "./shared.js";

const state = vi.hoisted(() => ({
	posts: [] as any[],
	postGetError: null as unknown,
}));

vi.mock("blogr", () => {
	class MockBlogr {
		cache = { enable: vi.fn() };
		constructor(public url: string) {}
		async posts(options: any = {}) {
			let items = state.posts;
			if (options.label?.length) {
				items = items.filter((p) =>
					options.label.every((l: string) => p.labels.includes(l)),
				);
			}
			if (options.query) {
				items = items.filter((p) => p.title.includes(options.query));
			}
			return makePager(items, options.limit ?? 25);
		}
		async random(options: any = {}) {
			let items = state.posts;
			if (options.label?.length) {
				items = items.filter((p) =>
					options.label.every((l: string) => p.labels.includes(l)),
				);
			}
			return items.slice(0, options.count ?? 1);
		}
		async comments() {
			return makePager([], 25);
		}
		async pages() {
			return makePager([], 25);
		}
		async post(id: string) {
			if (state.postGetError) throw state.postGetError;
			return state.posts.find((p) => p.id === id) ?? null;
		}
		htmlToText(input: unknown) {
			const html =
				typeof input === "string"
					? input
					: ((input as any)?.content ?? (input as any)?.summary ?? "");
			return String(html).replace(/<[^>]+>/g, "");
		}
		thumbnail(_input: unknown) {
			return null;
		}
	}
	return { Blogr: MockBlogr, default: MockBlogr };
});

const { createWidget } = await import("../src/plugins/createWidget.js");

beforeEach(() => {
	MockIntersectionObserver.instances = [];
	// @ts-expect-error - test stub
	globalThis.IntersectionObserver = MockIntersectionObserver;
	document.body.innerHTML = '<div id="widget"></div>';
	state.posts = [];
	state.postGetError = null;
	localStorage.clear();
});

function mountObserver() {
	return MockIntersectionObserver.instances[0];
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("createWidget", () => {
	it("throws when containerSelector matches nothing", () => {
		expect(() =>
			createWidget({
				containerSelector: "#missing",
				blogUrl: "https://x.blogspot.com",
			}),
		).toThrow(/containerSelector/);
	});

	it("defers fetching until the container enters the viewport", async () => {
		state.posts = [makePost()];
		createWidget({
			jsonp: true,
			containerSelector: "#widget",
			blogUrl: "https://x.blogspot.com",
		});
		await flush();
		expect(document.getElementById("widget")!.innerHTML).toBe("");

		mountObserver().trigger(document.getElementById("widget")!);
		await flush();
		expect(document.getElementById("widget")!.textContent).toContain("Post");
	});

	it("renders each entry via the template and applies entryClass", async () => {
		state.posts = [makePost({ id: "1", title: "First", labels: ["ai"] })];
		createWidget({
			containerSelector: "#widget",
			blogUrl: "https://x.blogspot.com",
			template: (entry) => `<div>${(entry as PostEntry).title}</div>`,
			entryClass: (entry) =>
				(entry as PostEntry).labels.includes("ai") ? "ai-post" : "",
		});
		mountObserver().trigger(document.getElementById("widget")!);
		await flush();

		const el = document.querySelector("#widget > div")!;
		expect(el.textContent).toBe("First");
		expect(el.classList.contains("ai-post")).toBe(true);
	});

	it("calls onEmpty and renders the empty state when there are no entries", async () => {
		const onEmpty = vi.fn();
		state.posts = [];
		createWidget({
			containerSelector: "#widget",
			blogUrl: "https://x.blogspot.com",
			onEmpty,
			empty: () => "<p>Nothing here</p>",
		});
		mountObserver().trigger(document.getElementById("widget")!);
		await flush();

		expect(onEmpty).toHaveBeenCalledOnce();
		expect(document.getElementById("widget")!.innerHTML).toContain(
			"Nothing here",
		);
	});

	it("calls onError and renders the error state when a fetch fails", async () => {
		const onError = vi.fn();
		state.postGetError = new Error("boom");
		createWidget({
			containerSelector: "#widget",
			blogUrl: "https://x.blogspot.com",
			related: true,
			currentPostId: "1",
			error: (msg) => `<p>Failed: ${msg}</p>`,
			onError,
		});
		mountObserver().trigger(document.getElementById("widget")!);
		await flush();

		expect(onError).toHaveBeenCalledWith(state.postGetError);
		expect(document.getElementById("widget")!.innerHTML).toContain(
			"Failed: boom",
		);
	});

	it("applies transformers in order to every entry", async () => {
		state.posts = [makePost({ title: "Original" })];
		createWidget({
			containerSelector: "#widget",
			blogUrl: "https://x.blogspot.com",
			transformers: [
				(entry) => ({
					...entry,
					title: `${(entry as PostEntry).title}!`,
				}),
				(entry) => ({
					...entry,
					title: (entry as PostEntry).title.toUpperCase(),
				}),
			],
			template: (entry) => `<div>${(entry as PostEntry).title}</div>`,
		});
		mountObserver().trigger(document.getElementById("widget")!);
		await flush();

		expect(document.querySelector("#widget > div")!.textContent).toBe(
			"ORIGINAL!",
		);
	});

	it("falls back to fallbackImage when an entry has no thumbnail", async () => {
		state.posts = [makePost({ thumbnail: null, thumbnailAlt: null })];
		createWidget({
			containerSelector: "#widget",
			blogUrl: "https://x.blogspot.com",
			fallbackImage: "/fallback.png",
			template: (entry) => `<img src="${(entry as PostEntry).thumbnail}"/>`,
		});
		mountObserver().trigger(document.getElementById("widget")!);
		await flush();

		expect(document.querySelector("img")!.getAttribute("src")).toBe(
			"/fallback.png",
		);
	});

	it("skips thumbnails entirely when thumbnail is false", async () => {
		state.posts = [makePost()];
		createWidget({
			containerSelector: "#widget",
			blogUrl: "https://x.blogspot.com",
			thumbnail: false,
			template: (entry) =>
				`<div data-thumb="${(entry as PostEntry).thumbnail}"></div>`,
		});
		mountObserver().trigger(document.getElementById("widget")!);
		await flush();

		expect(
			document.querySelector("#widget > div")!.getAttribute("data-thumb"),
		).toBe("");
	});

	it("renders a load-more button and appends the next batch on click", async () => {
		state.posts = [1, 2, 3, 4].map((n) =>
			makePost({ id: String(n), title: `Post ${n}` }),
		);
		createWidget({
			containerSelector: "#widget",
			blogUrl: "https://x.blogspot.com",
			maxVisibleItems: 2,
			loadMore: true,
			template: (entry) => `<div>${(entry as PostEntry).title}</div>`,
		});
		mountObserver().trigger(document.getElementById("widget")!);
		await flush();

		expect(document.querySelectorAll("#widget > div").length).toBe(2);
		const button = document.querySelector<HTMLButtonElement>(
			".blogr-widget-load-more",
		)!;
		expect(button.textContent).toBe("Load more");

		button.click();
		await flush();

		expect(document.querySelectorAll("#widget > div").length).toBe(4);
	});

	it("destroy() disconnects observers and clears the container", async () => {
		state.posts = [makePost()];
		const widget = createWidget({
			containerSelector: "#widget",
			blogUrl: "https://x.blogspot.com",
		});
		mountObserver().trigger(document.getElementById("widget")!);
		await flush();
		expect(document.getElementById("widget")!.innerHTML).not.toBe("");

		widget.destroy();
		expect(document.getElementById("widget")!.innerHTML).toBe("");
	});

	it("setQuery filters an in-memory buffer without refetching when deepSearch is false", async () => {
		state.posts = [
			makePost({ id: "1", title: "Apples" }),
			makePost({ id: "2", title: "Bananas" }),
		];
		const widget = createWidget({
			containerSelector: "#widget",
			blogUrl: "https://x.blogspot.com",
			query: "Apples",
			deepSearch: false,
			template: (entry) => `<div>${(entry as PostEntry).title}</div>`,
		});
		mountObserver().trigger(document.getElementById("widget")!);
		await flush();
		expect(document.body.textContent).toContain("Apples");
		expect(document.body.textContent).not.toContain("Bananas");

		await widget.setQuery("Bananas");
		expect(document.body.textContent).toContain("Bananas");
		expect(document.body.textContent).not.toContain("Apples");
	});
});
