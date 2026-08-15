export function makePost(overrides: Record<string, unknown> = {}) {
	return {
		id: "1",
		title: "Post",
		url: "https://example.blogspot.com/post.html",
		published: "2026-01-01T00:00:00.000Z",
		updated: "2026-01-02T00:00:00.000Z",
		labels: [] as string[],
		author: { name: "Jane", url: null, image: null },
		content: "<p>Hello world</p>",
		summary: "Hello world",
		thumbnail: null,
		thumbnailAlt: null,
		comments: { feed: null, number: null, title: null },
		geo: { box: null, featureName: null, point: null },
		links: [],
		...overrides,
	};
}

export class MockIntersectionObserver {
	static instances: MockIntersectionObserver[] = [];
	callback: IntersectionObserverCallback;
	observed: Element[] = [];
	options: IntersectionObserverInit;

	constructor(
		callback: IntersectionObserverCallback,
		options: IntersectionObserverInit = {},
	) {
		this.callback = callback;
		this.options = options;
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

	trigger(el: Element, isIntersecting = true) {
		this.callback(
			[{ target: el, isIntersecting } as IntersectionObserverEntry],
			this as unknown as IntersectionObserver,
		);
	}
}

export function makePager<T>(allItems: T[], limit: number) {
	let index = Math.min(limit, allItems.length);
	const build = (items: T[]): any => ({
		items,
		get hasNext() {
			return index < allItems.length;
		},
		async next() {
			if (index >= allItems.length) return null;
			const slice = allItems.slice(index, index + limit);
			index += limit;
			return build(slice);
		},
	});
	return build(allItems.slice(0, index));
}
