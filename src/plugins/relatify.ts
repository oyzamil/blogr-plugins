import { Blogr, type Post } from "blogr";

import { type ElementInput, type PluginInstance } from "../types.js";
import { resolveElements } from "../utils/dom.js";
import { mergeOptions } from "../utils/merge-options.js";

/** How candidate posts are picked once fetched. */
export type RelatifyRelevance = "strict" | "default";

/**
 * A single related post handed to `template` and the lifecycle hooks —
 * mirrors `createWidget`'s `WidgetEntry` shape for familiarity.
 */
export interface RelatedPost {
	/** Post id, as reported by Blogger. */
	id: string;
	/** Post title. */
	title: string;
	/** Canonical URL of the post. */
	url: string;
	/** Author display name, or `""` if unavailable. */
	author: string;
	/** Publish date (ISO string, as reported by Blogger). */
	published: string;
	/** Labels on the post. */
	labels: string[];
	/** Plain-text summary (Blogger's own summary field, HTML stripped). */
	content: string;
	/** The original SDK `Post` object, for anything not exposed above. */
	raw: Post;
}

/** Configuration for {@link relatify}. */
export interface RelatifyOptions {
	/** Enable JSONP transport (browser-only). @default true */
	jsonp?: boolean;
	/**
	 * Labels to find related posts for — paste this straight from your
	 * Blogger template (see the `<script>` snippet in the README) so it
	 * reflects the *current* post's actual labels:
	 *
	 * ```html
	 * <script>
	 * 	const labels = [
	 * 		<b:loop values='data:post.labels' var='label'>
	 * 			"<data:label.name/>"<b:if cond='not data:label.isLast'>,</b:if>
	 * 		</b:loop>
	 * 	];
	 * </script>
	 * ```
	 *
	 * Omitted or empty fetches recent posts across the whole blog instead
	 * of filtering by label at all.
	 */
	labels?: string[];
	/**
	 * Element(s) after which a related-post link may be inserted — a CSS
	 * selector, or an array of selectors (joined with `,`, so
	 * `["p", ".paragraph", ".video"]` behaves like
	 * `"p, .paragraph, .video"`). Matched *within* the container. Default
	 * `"p"`.
	 */
	insertAfter?: string | string[];
	/**
	 * Maximum number of links to insert. Default: scaled to the
	 * container's word count — 2 for a ~500-word article, 3 for ~1000,
	 * and so on (`Math.floor(wordCount / 500) + 1`, minimum `1`). Always
	 * additionally capped by however many eligible `insertAfter` elements
	 * and related posts actually exist.
	 */
	maxLinks?: number;
	/**
	 * Labels to leave out of the *search* — i.e. even if `labels` (or the
	 * post's own labels) includes one of these, it won't be used to look
	 * up related posts. This does **not** filter candidate results: a
	 * related post found via a non-excluded label is kept even if it also
	 * happens to carry an excluded label. Default `[]`.
	 */
	excludeLabels?: string[];
	/**
	 * `"strict"` scores every candidate by word overlap against the
	 * nearest heading inside the container (falling back to
	 * `document.title`) and picks the highest-scoring matches. `"default"`
	 * shuffles the candidates and picks randomly. Default `"strict"`.
	 */
	relevance?: RelatifyRelevance;
	/**
	 * Renders one inserted link. Same shape as `createWidget`'s
	 * `template`: `(post, index) => string`. Default:
	 * `` `You may also like: <a href="${post.url}">${post.title}</a>` ``.
	 */
	template?: (post: RelatedPost, index: number) => string;
	/**
	 * URL (or numeric id) of the Blogger blog to read from. Defaults to
	 * `window.location.origin` — override only if this runs somewhere
	 * other than the blog itself (e.g. local development against a
	 * different site).
	 */
	blogUrl?: string;
	/**
	 * URL of the current post, used to exclude it from its own related
	 * list. Defaults to `<link rel="canonical">`'s `href`, falling back to
	 * `location.href`. Override if neither is reliable in your setup.
	 */
	currentUrl?: string;
	/** How many candidate posts to fetch (per label, or overall when unfiltered) before scoring/picking from them. Default `20`. */
	sampleSize?: number;
	/** Wrapper element class for each inserted link. Default `"relatify-link"`. */
	linkClass?: string;
	/** Called right before fetching. */
	beforeFetch?: () => void;
	/** Called with the final list of chosen related posts, before any are inserted. */
	afterFetch?: (posts: RelatedPost[]) => void;
	/** Called once per link actually inserted. */
	onInsert?: (detail: {
		post: RelatedPost;
		element: HTMLElement;
		index: number;
	}) => void;
	/** Called when no related posts (or no eligible insertion points) were found. */
	onEmpty?: () => void;
	/** Called if the fetch fails. */
	onError?: (err: unknown) => void;
	/**
	 * Enable lazy loading — plugin initializes only when first `insertAfter`
	 * element comes near the viewport, preventing API calls on page load.
	 * Default `true`.
	 */
	lazy?: boolean;
	/**
	 * Margin (in pixels or CSS string) for IntersectionObserver to trigger
	 * lazy load before element enters viewport. Default `"0px"`.
	 * Examples: `"100px"`, `"10%"`, `"0px 0px 50px 0px"`.
	 */
	rootMargin?: string;
}

const defaults = {
	jsonp: true,
	labels: [] as string[],
	insertAfter: "p" as string | string[],
	excludeLabels: [] as string[],
	relevance: "strict" as RelatifyRelevance,
	sampleSize: 20,
	linkClass: "relatify-link",
	lazy: true,
	rootMargin: "0px",
	template: (post: RelatedPost, _index: number) =>
		`<p>You may also like: <a href="${post.url}">${post.title}</a></p>`,
};

const STOPWORDS = new Set([
	"a",
	"an",
	"the",
	"and",
	"or",
	"but",
	"of",
	"to",
	"for",
	"in",
	"on",
	"is",
	"are",
	"with",
	"how",
	"what",
	"why",
	"your",
	"you",
	"it",
	"at",
]);

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s]/gu, " ")
		.split(/\s+/)
		.filter((word) => word.length > 1 && !STOPWORDS.has(word));
}

function countWords(text: string): number {
	return text.trim().split(/\s+/).filter(Boolean).length;
}

function defaultMaxLinks(wordCount: number): number {
	return Math.max(1, Math.floor(wordCount / 500) + 1);
}

function detectCurrentUrl(): string {
	const canonical = document.querySelector<HTMLLinkElement>(
		'link[rel="canonical"]',
	);
	return (canonical?.href || location.href).split(/[?#]/)[0].replace(/\/$/, "");
}

function normalizeUrl(url: string): string {
	return url.split(/[?#]/)[0].replace(/\/$/, "");
}

function normalize(post: Post): RelatedPost {
	return {
		id: post.id,
		title: post.title,
		url: post.url,
		author: post.author?.name ?? "",
		published: post.published,
		labels: post.labels ?? [],
		content: post.summary ?? "",
		raw: post,
	};
}

function shuffle<T>(items: T[]): T[] {
	const out = [...items];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

function findReferenceTitle(container: Element): string {
	const heading = container.querySelector("h1, h2, h3");
	const text = heading?.textContent?.trim();
	return text || document.title;
}

function scoreByRelevance(
	candidates: RelatedPost[],
	referenceTitle: string,
): RelatedPost[] {
	const referenceWords = new Set(tokenize(referenceTitle));
	if (referenceWords.size === 0) return candidates;

	return [...candidates]
		.map((post) => {
			const words = tokenize(post.title);
			const overlap = words.filter((word) => referenceWords.has(word)).length;
			return { post, score: overlap };
		})
		.sort((a, b) => b.score - a.score)
		.map((entry) => entry.post);
}

async function fetchCandidates(
	blog: Blogr,
	searchLabels: string[],
	sampleSize: number,
): Promise<Post[]> {
	if (searchLabels.length === 0) {
		const pager = await blog.posts({ limit: sampleSize, orderBy: "published" });
		return pager.items;
	}

	const byId = new Map<string, Post>();
	for (const label of searchLabels) {
		const pager = await blog.label(label, {
			limit: sampleSize,
			orderBy: "published",
		});
		for (const post of pager.items) byId.set(post.id, post);
	}
	return [...byId.values()];
}

interface Engine {
	destroy(): void;
}

type ResolvedOptions = ReturnType<typeof resolveOptions>;

function resolveOptions(options: RelatifyOptions) {
	return mergeOptions(
		{
			...defaults,
			labels: defaults.labels as string[] | undefined,
			maxLinks: undefined as number | undefined,
			blogUrl: undefined as string | undefined,
			currentUrl: undefined as string | undefined,
			lazy: defaults.lazy as boolean,
			rootMargin: defaults.rootMargin as string,
			beforeFetch: () => {},
			afterFetch: (_posts: RelatedPost[]) => {},
			onInsert: (_detail: {
				post: RelatedPost;
				element: HTMLElement;
				index: number;
			}) => {},
			onEmpty: () => {},
			onError: (err: unknown) => console.error("relatify:", err),
		},
		options,
	);
}

function createEngine(container: HTMLElement, opts: ResolvedOptions): Engine {
	let cancelled = false;
	const inserted: HTMLElement[] = [];

	const insertAfterSelector = Array.isArray(opts.insertAfter)
		? opts.insertAfter.join(", ")
		: opts.insertAfter;
	const searchLabels = (opts.labels ?? []).filter(
		(label) => !opts.excludeLabels.includes(label),
	);
	const currentUrl = normalizeUrl(opts.currentUrl ?? detectCurrentUrl());
	const blog = new Blogr(opts.blogUrl ?? location.origin, {
		jsonp: opts.jsonp,
	});

	async function run(): Promise<void> {
		opts.beforeFetch();

		const eligible = Array.from(
			container.querySelectorAll<HTMLElement>(insertAfterSelector),
		);
		const wordCount = countWords(container.textContent ?? "");
		const linkCount = Math.min(
			opts.maxLinks ?? defaultMaxLinks(wordCount),
			eligible.length,
		);

		if (linkCount <= 0 || eligible.length === 0) {
			opts.onEmpty();
			return;
		}

		let rawPosts: Post[];
		try {
			rawPosts = await fetchCandidates(blog, searchLabels, opts.sampleSize);
		} catch (err) {
			opts.onError(err);
			return;
		}
		if (cancelled) return;

		let candidates = rawPosts
			.map(normalize)
			.filter((post) => normalizeUrl(post.url) !== currentUrl);

		candidates =
			opts.relevance === "strict"
				? scoreByRelevance(candidates, findReferenceTitle(container))
				: shuffle(candidates);

		const chosenPosts = candidates.slice(0, linkCount);
		if (chosenPosts.length === 0) {
			opts.onEmpty();
			return;
		}

		opts.afterFetch(chosenPosts);
		if (cancelled) return;

		const chosenSpots = shuffle(eligible)
			.slice(0, chosenPosts.length)
			// re-sort into document order so links read top-to-bottom
			.sort((a, b) => eligible.indexOf(a) - eligible.indexOf(b));

		chosenSpots.forEach((spot, index) => {
			const post = chosenPosts[index];
			const wrapper = document.createElement("div");
			wrapper.className = opts.linkClass;
			wrapper.innerHTML = opts.template(post, index);
			spot.insertAdjacentElement("afterend", wrapper);
			inserted.push(wrapper);
			opts.onInsert({ post, element: wrapper, index });
		});
	}

	function initializeWithLazyLoad(): void {
		const eligible = container.querySelector<HTMLElement>(insertAfterSelector);
		if (!eligible) {
			opts.onEmpty();
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting) && !cancelled) {
					observer.disconnect();
					void run();
				}
			},
			{ rootMargin: opts.rootMargin },
		);

		observer.observe(eligible);
	}

	if (opts.lazy) {
		initializeWithLazyLoad();
	} else {
		void run();
	}

	return {
		destroy() {
			cancelled = true;
			for (const el of inserted.splice(0)) el.remove();
		},
	};
}

/**
 * Fetches related posts for the current article by label and inserts a
 * randomly-placed link (or several, scaled to article length) after
 * `insertAfter` elements within the container.
 *
 * Get the current post's labels straight from your Blogger template and
 * pass them in as `labels`:
 *
 * ```html
 * <script>
 * 	const labels = [
 * 		<b:loop values='data:post.labels' var='label'>
 * 			"<data:label.name/>"<b:if cond='not data:label.isLast'>,</b:if>
 * 		</b:loop>
 * 	];
 * </script>
 * ```
 *
 * @param input - Selector, element(s), or jQuery collection for the
 * article container — related links are inserted inside it.
 * @param options - {@link RelatifyOptions}
 * @returns A {@link PluginInstance} — `destroy()` removes every link it
 * inserted (or, if the fetch hasn't resolved yet, cancels it).
 *
 * @example
 * ```ts
 * import { relatify } from "blogr-plugins";
 *
 * relatify("article", {
 * 	labels,
 * 	insertAfter: ["p", ".paragraph", ".video"],
 * 	excludeLabels: ["announcements"],
 * 	relevance: "strict",
 * 	template: (post) =>
 * 		`Related: <a href="${post.url}">${post.title}</a>`,
 * });
 * ```
 */
export function relatify(
	input: ElementInput,
	options: RelatifyOptions = {},
): PluginInstance {
	const opts = resolveOptions(options);
	const containers = resolveElements(input) as HTMLElement[];
	const engines = containers.map((container) => createEngine(container, opts));

	return {
		destroy() {
			for (const engine of engines) engine.destroy();
		},
	};
}
