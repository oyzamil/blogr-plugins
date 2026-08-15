import { beforeEach, describe, expect, it, vi } from "vitest";

import { MockIntersectionObserver, makePager, makePost } from "./shared.js";

const state = vi.hoisted(() => ({
	posts: [] as any[],
	postsCalls: [] as any[],
	labelCalls: [] as { label: string; options: any }[],
	fetchError: null as unknown,
}));

vi.mock("blogr", () => {
	class MockBlogr {
		constructor(public url: string) {}
		async posts(options: any = {}) {
			if (state.fetchError) throw state.fetchError;
			state.postsCalls.push(options);
			let items = state.posts;
			if (options.label?.length) {
				items = items.filter((p) =>
					options.label.every((l: string) => p.labels.includes(l)),
				);
			}
			return makePager(items.slice(0, options.limit ?? 25), 10);
		}
		async label(label: string, options: any = {}) {
			if (state.fetchError) throw state.fetchError;
			state.labelCalls.push({ label, options });
			const items = state.posts.filter((p) => p.labels.includes(label));
			return makePager(items.slice(0, options.limit ?? 25), 10);
		}
	}
	return { Blogr: MockBlogr };
});

const { relatify } = await import("../src/plugins/relatify.js");

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

function paragraphs(n: number, wordsPerParagraph = 50): string {
	const sentence = Array.from({ length: wordsPerParagraph }, () => "word").join(
		" ",
	);
	return Array.from({ length: n }, () => `<p>${sentence}</p>`).join("\n");
}

function mountObserver() {
	return MockIntersectionObserver.instances[0];
}

beforeEach(() => {
	MockIntersectionObserver.instances = [];
	// @ts-expect-error - test stub
	globalThis.IntersectionObserver = MockIntersectionObserver;
	state.posts = [];
	state.postsCalls = [];
	state.labelCalls = [];
	state.fetchError = null;
	document.head.querySelector('link[rel="canonical"]')?.remove();
	document.body.innerHTML = `<article id="article">${paragraphs(10)}</article>`;
});

describe("relatify", () => {
	it("fetches without a label filter when no labels are given", async () => {
		state.posts = [makePost({ id: "a" }), makePost({ id: "b" })];
		relatify("#article", { currentUrl: "https://x/none", lazy: false });
		await flush();
		expect(state.postsCalls.length).toBe(1);
		expect(state.labelCalls.length).toBe(0);
	});

	it("fetches per label and dedupes overlapping results", async () => {
		state.posts = [
			makePost({ id: "a", labels: ["js"] }),
			makePost({ id: "b", labels: ["css"] }),
			makePost({ id: "c", labels: ["js", "css"] }),
		];
		relatify("#article", {
			labels: ["js", "css"],
			currentUrl: "https://x/none",
			maxLinks: 3,
			lazy: false,
		});
		await flush();
		expect(state.labelCalls.map((c) => c.label).sort()).toEqual(["css", "js"]);
		expect(document.querySelectorAll(".relatify-link").length).toBe(3);
	});

	it("excludes a label from the search but keeps posts found via other labels", async () => {
		state.posts = [makePost({ id: "a", labels: ["js", "tutorial"] })];
		relatify("#article", {
			labels: ["js", "tutorial"],
			excludeLabels: ["tutorial"],
			currentUrl: "https://x/none",
			lazy: false,
		});
		await flush();
		expect(state.labelCalls.map((c) => c.label)).toEqual(["js"]);
	});

	it("falls back to an unfiltered fetch when every label is excluded", async () => {
		state.posts = [makePost({ id: "a", labels: ["js"] })];
		relatify("#article", {
			labels: ["js"],
			excludeLabels: ["js"],
			currentUrl: "https://x/none",
			lazy: false,
		});
		await flush();
		expect(state.labelCalls.length).toBe(0);
		expect(state.postsCalls.length).toBe(1);
	});

	it("excludes the current post from its own related list", async () => {
		state.posts = [
			makePost({ id: "a", url: "https://example.com/current" }),
			makePost({ id: "b", url: "https://example.com/other" }),
		];
		relatify("#article", {
			currentUrl: "https://example.com/current",
			lazy: false,
		});
		await flush();
		const link = document.querySelector<HTMLAnchorElement>(".relatify-link a")!;
		expect(link.href).toContain("/other");
	});

	it("defaults maxLinks from word count (~500 words -> 2 links)", async () => {
		document.body.innerHTML = `<article id="article">${paragraphs(11, 50)}</article>`; // ~550 words, 11 <p>s
		state.posts = Array.from({ length: 5 }, (_, i) =>
			makePost({ id: `p${i}` }),
		);
		relatify("#article", { currentUrl: "https://x/none", lazy: false });
		await flush();
		expect(document.querySelectorAll(".relatify-link").length).toBe(2);
	});

	it("defaults maxLinks from word count (~1000 words -> 3 links)", async () => {
		document.body.innerHTML = `<article id="article">${paragraphs(21, 50)}</article>`; // ~1050 words
		state.posts = Array.from({ length: 5 }, (_, i) =>
			makePost({ id: `p${i}` }),
		);
		relatify("#article", { currentUrl: "https://x/none", lazy: false });
		await flush();
		expect(document.querySelectorAll(".relatify-link").length).toBe(3);
	});

	it("respects an explicit maxLinks override", async () => {
		state.posts = Array.from({ length: 5 }, (_, i) =>
			makePost({ id: `p${i}` }),
		);
		relatify("#article", {
			currentUrl: "https://x/none",
			maxLinks: 1,
			lazy: false,
		});
		await flush();
		expect(document.querySelectorAll(".relatify-link").length).toBe(1);
	});

	it("caps links to however many related posts actually exist", async () => {
		state.posts = [makePost({ id: "only" })];
		relatify("#article", {
			currentUrl: "https://x/none",
			maxLinks: 5,
			lazy: false,
		});
		await flush();
		expect(document.querySelectorAll(".relatify-link").length).toBe(1);
	});

	it("only inserts after elements matching insertAfter", async () => {
		document.body.innerHTML = `<article id="article"><p>${"word ".repeat(50)}</p><div class="video">vid</div></article>`;
		state.posts = [makePost({ id: "a" })];
		relatify("#article", {
			currentUrl: "https://x/none",
			insertAfter: ["p", ".video"],
			maxLinks: 1,
			lazy: false,
		});
		await flush();
		expect(document.querySelectorAll(".relatify-link").length).toBe(1);
	});

	it("picks the most title-relevant post in strict mode", async () => {
		document.body.innerHTML = `<article id="article"><h1>Best JavaScript Tips</h1>${paragraphs(3)}</article>`;
		state.posts = [
			makePost({ id: "unrelated", title: "Cooking Pasta Guide" }),
			makePost({ id: "related", title: "Top JavaScript Tips For Beginners" }),
		];
		relatify("#article", {
			currentUrl: "https://x/none",
			maxLinks: 1,
			relevance: "strict",
			lazy: false,
		});
		await flush();
		const link = document.querySelector<HTMLAnchorElement>(".relatify-link a")!;
		expect(link.textContent).toBe("Top JavaScript Tips For Beginners");
	});

	it("renders the default template", async () => {
		state.posts = [makePost({ id: "a", title: "My Post", url: "https://x/a" })];
		relatify("#article", {
			currentUrl: "https://x/none",
			maxLinks: 1,
			lazy: false,
		});
		await flush();
		expect(document.querySelector(".relatify-link")!.innerHTML).toBe(
			'<p>You may also like: <a href="https://x/a">My Post</a></p>',
		);
	});

	it("renders a custom template", async () => {
		state.posts = [makePost({ id: "a", title: "My Post", url: "https://x/a" })];
		relatify("#article", {
			currentUrl: "https://x/none",
			maxLinks: 1,
			template: (post) => `Related: ${post.title}`,
			lazy: false,
		});
		await flush();
		expect(document.querySelector(".relatify-link")!.textContent).toBe(
			"Related: My Post",
		);
	});

	it("calls onInsert once per inserted link with the right detail", async () => {
		const onInsert = vi.fn();
		state.posts = [makePost({ id: "a", title: "My Post" })];
		relatify("#article", {
			currentUrl: "https://x/none",
			maxLinks: 1,
			onInsert,
			lazy: false,
		});
		await flush();
		expect(onInsert).toHaveBeenCalledOnce();
		expect(onInsert.mock.calls[0][0]).toMatchObject({
			index: 0,
			post: expect.objectContaining({ id: "a", title: "My Post" }),
		});
	});

	it("calls onEmpty when there are no eligible insertAfter elements", async () => {
		document.body.innerHTML = `<article id="article"><div>no paragraphs here</div></article>`;
		const onEmpty = vi.fn();
		state.posts = [makePost({ id: "a" })];
		relatify("#article", {
			currentUrl: "https://x/none",
			onEmpty,
			lazy: false,
		});
		await flush();
		expect(onEmpty).toHaveBeenCalledOnce();
	});

	it("calls onEmpty when there are no related posts", async () => {
		const onEmpty = vi.fn();
		state.posts = [];
		relatify("#article", {
			currentUrl: "https://x/none",
			onEmpty,
			lazy: false,
		});
		await flush();
		expect(onEmpty).toHaveBeenCalledOnce();
	});

	it("calls onError when the fetch fails, without throwing", async () => {
		const onError = vi.fn();
		state.fetchError = new Error("network down");
		relatify("#article", {
			currentUrl: "https://x/none",
			onError,
			lazy: false,
		});
		await flush();
		expect(onError).toHaveBeenCalledWith(state.fetchError);
	});

	it("destroy() cancels a not-yet-resolved fetch so nothing is inserted", async () => {
		state.posts = [makePost({ id: "a" })];
		const instance = relatify("#article", {
			currentUrl: "https://x/none",
			lazy: false,
		});
		instance.destroy();
		await flush();
		expect(document.querySelectorAll(".relatify-link").length).toBe(0);
	});

	it("destroy() removes every link it inserted", async () => {
		state.posts = [makePost({ id: "a" }), makePost({ id: "b" })];
		const instance = relatify("#article", {
			currentUrl: "https://x/none",
			maxLinks: 2,
			lazy: false,
		});
		await flush();
		expect(document.querySelectorAll(".relatify-link").length).toBe(2);
		instance.destroy();
		expect(document.querySelectorAll(".relatify-link").length).toBe(0);
	});

	it("detects the current post URL from <link rel=canonical> when currentUrl isn't given", async () => {
		const link = document.createElement("link");
		link.rel = "canonical";
		link.href = "https://example.com/canonical-post";
		document.head.appendChild(link);

		state.posts = [
			makePost({ id: "a", url: "https://example.com/canonical-post" }),
			makePost({ id: "b", url: "https://example.com/other-post" }),
		];
		relatify("#article", { lazy: false });
		await flush();
		const href =
			document.querySelector<HTMLAnchorElement>(".relatify-link a")!.href;
		expect(href).toContain("/other-post");
	});

	it("lazy loading enabled (default) defers fetch until element scrolls near viewport", async () => {
		state.posts = [makePost({ id: "a" })];
		relatify("#article", { currentUrl: "https://x/none", lazy: true });
		await flush();
		expect(state.postsCalls.length).toBe(0);
		expect(document.querySelectorAll(".relatify-link").length).toBe(0);

		mountObserver().trigger(document.querySelector("#article p")!);
		await flush();

		expect(state.postsCalls.length).toBe(1);
		expect(document.querySelectorAll(".relatify-link").length).toBe(1);
	});

	it("lazy loading disabled triggers fetch immediately", async () => {
		state.posts = [makePost({ id: "a" })];
		relatify("#article", { currentUrl: "https://x/none", lazy: false });
		await flush();
		expect(state.postsCalls.length).toBe(1);
		expect(document.querySelectorAll(".relatify-link").length).toBe(1);
	});

	it("rootMargin is passed to IntersectionObserver options", async () => {
		state.posts = [makePost({ id: "a" })];
		relatify("#article", {
			currentUrl: "https://x/none",
			lazy: true,
			rootMargin: "100px",
		});

		const observer = mountObserver();
		expect(observer.options.rootMargin).toBe("100px");
	});

	it("destroy() before lazy load intersection cancels fetch", async () => {
		state.posts = [makePost({ id: "a" })];
		const instance = relatify("#article", {
			currentUrl: "https://x/none",
			lazy: true,
		});
		await flush();

		instance.destroy();
		await flush();

		mountObserver().trigger(document.querySelector("#article p")!);
		await flush();

		expect(state.postsCalls.length).toBe(0);
		expect(document.querySelectorAll(".relatify-link").length).toBe(0);
	});

	it("lazy loading calls onEmpty when no insertAfter elements exist", async () => {
		document.body.innerHTML = `<article id="article"><div>no paragraphs here</div></article>`;
		const onEmpty = vi.fn();
		state.posts = [makePost({ id: "a" })];
		relatify("#article", { currentUrl: "https://x/none", lazy: true, onEmpty });
		await flush();
		expect(onEmpty).toHaveBeenCalledOnce();
	});

	it("lazy loading with custom rootMargin value", async () => {
		state.posts = [makePost({ id: "a" })];
		relatify("#article", {
			currentUrl: "https://x/none",
			lazy: true,
			rootMargin: "0px 0px -90% 0px",
		});

		const observer = mountObserver();
		expect(observer.options.rootMargin).toBe("0px 0px -90% 0px");
	});

	it("lazy loading defaults to rootMargin 0px", async () => {
		state.posts = [makePost({ id: "a" })];
		relatify("#article", { currentUrl: "https://x/none", lazy: true });

		const observer = mountObserver();
		expect(observer.options.rootMargin).toBe("0px");
	});

	it("lazy loading observer watches only the first matching insertAfter element", async () => {
		state.posts = [makePost({ id: "a" })];
		relatify("#article", { currentUrl: "https://x/none", lazy: true });

		const observer = mountObserver();
		expect(observer.observed).toHaveLength(1);
		expect(observer.observed[0]).toBe(document.querySelector("#article p"));
	});

	it("lazy loading disconnects observer after first intersection", async () => {
		state.posts = [makePost({ id: "a" })];
		relatify("#article", { currentUrl: "https://x/none", lazy: true });
		await flush();

		const observer = mountObserver();
		observer.trigger(document.querySelector("#article p")!);
		await flush();

		expect(observer.observed).toHaveLength(0);
	});
});
