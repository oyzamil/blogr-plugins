import type { Author, Comment, Pager, Post } from "blogr";
import { Blogr } from "blogr";

import type { ElementInput, PluginInstance } from "../types.js";

import { resolveElements } from "../utils/dom.js";
import { type ResizeImageOptions, resizeImage } from "./resizeImage.js";

/** Which Blogger feed a widget lists. */
export type WidgetFeed = "posts" | "comments" | "pages";

/** New: What type of data the widget displays. */
export type WidgetType =
	| "posts" // Display blog posts (default)
	| "authors" // Display blog authors
	| "labels"; // Display blog labels/categories

/** How the initial batch of entries is sourced. */
export type WidgetSourceType = "recent" | "random";

/** Feed field a widget's entries are ordered by. */
export type WidgetOrderBy = "published" | "updated";

/** Direction entries are shown in, applied after fetching. */
export type WidgetSort = "asc" | "desc";

/**
 * A single normalized entry handed to `template`, `entryClass`, and every
 * lifecycle hook — same shape regardless of whether it came from the posts,
 * pages, or comments feed.
 */
export interface WidgetEntry {
	/** Entry id (numeric string), as reported by Blogger. */
	id: string;
	/** Entry title (empty string for comments, which have none). */
	title: string;
	/** Canonical URL of the entry. */
	url: string;
	/** Author display name, or `""` if unavailable. */
	author: string;
	/** Publish date, formatted per `dateFormat`. */
	published: string;
	/** Last-updated date, formatted per `dateFormat`. */
	updated: string;
	/** Labels on the entry. Always `[]` for comments (which carry none). */
	labels: string[];
	/**
	 * Resolved thumbnail URL — already run through `resizeImage` (unless
	 * `thumbnail: false`), falling back to `fallbackImage` when the entry
	 * has no image of its own. `""` when `thumbnail: false`.
	 */
	thumbnail: string;
	/** Plain-text summary, truncated to `summaryLength` characters. */
	content: string;
	/** The original, un-normalized SDK object, for anything not exposed above. */
	raw: Post | Comment | Author | string; // Extended for new types
}

/**
 * Transforms one normalized entry, e.g. to inject a computed field, rewrite
 * a value from a transformer chain, or pull in data from elsewhere. Applied
 * in array order — each transformer receives the previous one's output.
 * May be async.
 */
export type WidgetTransformer = (
	entry: WidgetEntry,
	index: number,
) => WidgetEntry | Promise<WidgetEntry>;

/** Configuration for {@link createWidget}. */
export interface CreateWidgetOptions {
	/** Enable JSONP transport (browser-only). @default false */
	jsonp?: boolean;
	/**
	 * What type of data to display.
	 * - "posts": Blog posts (default)
	 * - "authors": Blog authors
	 * - "labels": Blog labels/categories
	 * @default "posts"
	 */
	type?: WidgetType;
	/**
	 * How the initial batch is sourced: `"recent"` lists newest-first,
	 * `"random"` samples random entries. Default `"recent"`.
	 */
	source?: WidgetSourceType;
	/** Where the widget mounts and renders. **Required.** */
	containerSelector: ElementInput;
	/** URL (or numeric id) of the Blogger blog to read from. **Required.** */
	blogUrl: string;
	/**
	 * Which feed to list. `"comments"`/`"pages"` ignore `labels`/`query`/
	 * `related` (Blogger's feed API doesn't support filtering those feeds
	 * that way) and their entries have no `labels`/`thumbnail`. Default
	 * `"posts"`.
	 */
	feed?: WidgetFeed;
	/** Labels to filter by (AND semantics — an entry must carry every one). Empty/omitted = no label filter. */
	labels?: string[];
	/** Feed field to sort by. Default `"published"`. */
	orderBy?: WidgetOrderBy;
	/** Direction to show entries in. Default `"desc"`. */
	sort?: WidgetSort;
	/** Search query. Combine with `deepSearch` to control how it's applied. */
	query?: string;
	/**
	 * `true`: every `setQuery()`/query change re-fetches from the network.
	 * `false`: fetches a broader buffer once, then filters/searches inside
	 * it client-side without any further network requests. Default `false`.
	 */
	deepSearch?: boolean;
	/**
	 * Token-based date format applied to `published`/`updated`. Supports
	 * `yyyy yy MMMM MMM MM M dd d EEEE EEE HH hh mm ss a`. Default
	 * `"MMM d, yyyy"`.
	 */
	dateFormat?: string;

	// --- Filtering ---
	/**
	 * Only include entries that share at least one label with the post
	 * identified by `currentPostId`. Requires `currentPostId`. Default `false`.
	 */
	related?: boolean;
	/** Shuffle the final rendered order (independent of `source`). Default `false`. */
	random?: boolean;
	/** Drop `currentPostId` from the results. Default `false`. */
	excludeCurrent?: boolean;
	/**
	 * Id of the post the widget is shown alongside — required for `related`
	 * and `excludeCurrent` to do anything. Not part of the original spec's
	 * prop list, but both of those options are meaningless without it, so
	 * it's added here; falls back to `<link rel="canonical">`'s id-bearing
	 * query param when omitted, or does nothing if that can't be found.
	 */
	currentPostId?: string;

	// --- Images ---
	/**
	 * `"default"` resizes each entry's own/extracted thumbnail with
	 * {@link resizeImage}'s defaults. Pass a {@link ResizeImageOptions}
	 * object to customize width/height/crop/etc. `false` disables
	 * thumbnails entirely (skips extraction and rendering). Default `"default"`.
	 */
	thumbnail?: false | "default" | ResizeImageOptions;
	/** Shown when an entry has no image of its own. Defaults to a small built-in placeholder. */
	fallbackImage?: string;

	// --- Content ---
	/** Max characters of plain-text summary kept in `entry.content`. `0` disables truncation. Default `120`. */
	summaryLength?: number;

	// --- Pagination ---
	/** Auto-load more entries via `IntersectionObserver` as the user scrolls near the end. Default `false`. */
	infiniteScroll?: boolean;
	/** Render a "load more" button. Can be combined with `infiniteScroll`. Default `false`. */
	loadMore?: boolean;
	/** Label for the load-more button. Default `"Load more"`. */
	loadMoreText?: string;
	/** Entries fetched/shown per batch. Default `6`. */
	maxVisibleItems?: number;

	// --- Lazy loading ---
	/**
	 * `rootMargin` for the `IntersectionObserver`s used both to defer the
	 * widget's first fetch until its container nears the viewport, and to
	 * trigger `infiniteScroll`. Default `"0px"`.
	 */
	rootMargin?: string;

	// --- Caching ---
	/**
	 * Persist fetched entries in `localStorage` (keyed by `cacheKey`) so a
	 * fresh page load can skip the network entirely within `cacheTTL`.
	 * Separate from and in addition to `blog.cache` (the SDK's own
	 * in-memory, per-session response cache), which this also enables.
	 * Default `false`.
	 */
	cache?: boolean;
	/** Cache key. Defaults to `containerSelector` (as a string) or `"widget"`. */
	cacheKey?: string;
	/** How long a cached batch stays valid, in seconds. Default `3600` (1 hour). */
	cacheTTL?: number;

	/** Applied to every entry, in order, right after normalization. */
	transformers?: WidgetTransformer[];

	// --- Lifecycle ---
	/** Called right before each network fetch. May be async. */
	beforeFetch?: () => void | Promise<void>;
	/** Called with the normalized batch right after a successful fetch, before rendering. May be async. */
	afterFetch?: (entries: WidgetEntry[]) => void | Promise<void>;
	/** Called for each entry right before it's rendered. */
	beforeRender?: (entry: WidgetEntry) => void;
	/** Called after an entry's element has been inserted into the DOM. */
	afterRender?: (element: HTMLElement, entry: WidgetEntry) => void;
	/** Called when a fetch or render step throws. */
	onError?: (err: unknown) => void;
	/** Called whenever there are zero entries to show (initial load or after filtering). */
	onEmpty?: () => void;

	/** Renders the loading state. `status` is a short human-readable phase, e.g. `"Loading posts..."`. */
	loading?: (status: string) => string;
	/** Renders the error state. */
	error?: (errorMsg: string) => string;
	/** Renders the empty state. */
	empty?: () => string;
	/** Renders one entry. `i` is its index in the currently rendered batch. */
	template?: (entry: WidgetEntry, i: number) => string;
	/** Extra class name(s) for an entry's wrapper element. */
	entryClass?: (entry: WidgetEntry, index: number) => string;
}

/** Returned by {@link createWidget}. */
export interface WidgetInstance extends PluginInstance {
	/** Re-fetches from scratch, bypassing the local cache. */
	refresh(): Promise<void>;
	/** Updates the search query and re-fetches (or re-filters, per `deepSearch`). */
	setQuery(query: string): Promise<void>;
}

const DEFAULT_FALLBACK_IMAGE =
	"data:image/svg+xml;base64," +
	btoa(
		'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#e2e2e2"/></svg>',
	);

const defaults = {
	jsonp: true,
	type: "posts" as WidgetType,
	source: "recent" as WidgetSourceType,
	feed: "posts" as WidgetFeed,
	labels: [] as string[],
	orderBy: "published" as WidgetOrderBy,
	sort: "desc" as WidgetSort,
	query: "",
	deepSearch: false,
	dateFormat: "MMM d, yyyy",
	related: false,
	random: false,
	excludeCurrent: false,
	thumbnail: "default" as false | "default" | ResizeImageOptions,
	fallbackImage: DEFAULT_FALLBACK_IMAGE,
	summaryLength: 120,
	infiniteScroll: false,
	loadMore: false,
	loadMoreText: "Load more",
	maxVisibleItems: 6,
	rootMargin: "0px",
	cache: false,
	cacheTTL: 3600,
	transformers: [] as WidgetTransformer[],
	loading: (status: string) =>
		`<div class="blogr-widget-loading" style="text-align:center"><span class="blogr-widget-loader"></span><p>${status}</p></div>`,
	error: (errorMsg: string) =>
		`<pre class="blogr-widget-error" style="white-space: pre-wrap;word-break: break-all;">${errorMsg}</pre>`,
	empty: () =>
		`<p class="blogr-widget-empty" style="text-align:center">No posts found.</p>`,
	template: (entry: WidgetEntry) =>
		`<div><h2>${entry.title}</h2><p>${entry.content}</p></div>`,
	entryClass: () => "",
};

const MONTHS_LONG = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
const MONTHS_SHORT = MONTHS_LONG.map((m) => m.slice(0, 3));
const DAYS_LONG = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
const DAYS_SHORT = DAYS_LONG.map((d) => d.slice(0, 3));

/** Minimal, dependency-free date formatter for `dateFormat`. */
function formatDate(iso: string, pattern: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";

	const pad = (n: number) => String(n).padStart(2, "0");
	const tokens: Record<string, string> = {
		yyyy: String(d.getFullYear()),
		yy: String(d.getFullYear()).slice(-2),
		MMMM: MONTHS_LONG[d.getMonth()],
		MMM: MONTHS_SHORT[d.getMonth()],
		MM: pad(d.getMonth() + 1),
		M: String(d.getMonth() + 1),
		EEEE: DAYS_LONG[d.getDay()],
		EEE: DAYS_SHORT[d.getDay()],
		dd: pad(d.getDate()),
		d: String(d.getDate()),
		HH: pad(d.getHours()),
		hh: pad(((d.getHours() + 11) % 12) + 1),
		mm: pad(d.getMinutes()),
		ss: pad(d.getSeconds()),
		a: d.getHours() < 12 ? "AM" : "PM",
	};

	return pattern.replace(
		/EEEE|EEE|yyyy|yy|MMMM|MMM|MM|M|dd|d|HH|hh|mm|ss|a/g,
		(token) => tokens[token] ?? token,
	);
}

function shuffle<T>(items: T[]): T[] {
	const out = [...items];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

function isPost(entry: Post | Comment): entry is Post {
	return "labels" in entry;
}

function readLocalCache(key: string, ttlSeconds: number): WidgetEntry[] | null {
	try {
		const raw = localStorage.getItem(`blogr-widget:${key}`);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as {
			entries: WidgetEntry[];
			savedAt: number;
		};
		if (Date.now() - parsed.savedAt > ttlSeconds * 1000) return null;
		return parsed.entries;
	} catch {
		return null;
	}
}

function writeLocalCache(key: string, entries: WidgetEntry[]): void {
	try {
		localStorage.setItem(
			`blogr-widget:${key}`,
			JSON.stringify({ entries, savedAt: Date.now() }),
		);
	} catch {
		// localStorage unavailable/full — caching is best-effort, fail silently
	}
}

/**
 * Detects the current post's id from `<link rel="canonical">` when
 * `currentPostId` isn't supplied. Best-effort — Blogger doesn't expose the
 * numeric post id in the DOM, so this only catches setups that already
 * carry it in the URL (e.g. a `postID` query param) or a data attribute.
 */
function detectCurrentPostId(): string | undefined {
	const el = document.querySelector<HTMLElement>("[data-blogr-post-id]");
	return el?.dataset.blogrPostId || undefined;
}

/**
 * Builds and mounts a fully self-contained Blogger listing widget — related
 * posts, a recent-posts sidebar, random picks, a comment stream, or a page
 * list — backed by the [`blogr`](https://jsr.io/@oyzamil/blogr) SDK. Fetches
 * are deferred until the container scrolls near the viewport, thumbnails are
 * resized via {@link resizeImage}, and results can be paged with an
 * infinite-scroll sentinel and/or a "load more" button.
 *
 * @param options Configuration object.
 * See {@link CreateWidgetOptions}.
 * @returns A {@link WidgetInstance} — `destroy()` tears down every observer
 * and clears the container; `refresh()`/`setQuery()` let you drive it after
 * the fact.
 *
 * @example
 * ```ts
 * import { createWidget } from "blogr-plugins";
 *
 * const widget = createWidget({
 * 	containerSelector: "#relatedPosts",
 * 	blogUrl: "https://example.blogspot.com",
 * 	type: "posts", // or "authors" or "labels"
 * 	related: true,
 * 	excludeCurrent: true,
 * 	currentPostId: "1234567890123456789",
 * 	labels: ["javascript"],
 * 	maxVisibleItems: 6,
 * 	loadMore: true,
 * 	template: (entry) => `
 * 		<article class="related-post">
 * 			<img src="${entry.thumbnail}" alt="${entry.title}" />
 * 			<h3>${entry.title}</h3>
 * 			<p>${entry.content}</p>
 * 		</article>
 * 	`,
 * });
 *
 * // later, e.g. before a client-side route change
 * widget.destroy();
 * ```
 */
export function createWidget(options: CreateWidgetOptions): WidgetInstance {
	// Check if Blogr is available (for CDN usage)
	if (typeof Blogr === "undefined") {
		console.warn(
			"[blogr-widget] Blogr SDK not found. Please add it via CDN: " +
				'<script src="https://cdn.jsdelivr.net/npm/blogr/dist/blogr.umd.js"></script> ' +
				"or install via npm: npm install blogr",
		);
		// Return a minimal instance that shows an error message
		const container = resolveElements(options.containerSelector)?.[0];
		if (container) {
			container.innerHTML = `
				<div class="blogr-widget-error" style="padding: 1rem; background: #fee; border: 1px solid #fcc; color: #c00; border-radius: 4px;">
					<p><strong>Blogr SDK not loaded.</strong></p>
					<p>Please include the Blogr library:</p>
					<code style="display: block; margin: 0.5rem 0; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
						&lt;script src="https://cdn.jsdelivr.net/npm/blogr/dist/blogr.umd.js"&gt;&lt;/script&gt;
					</code>
				</div>
			`;
		}
		return {
			refresh: async () => {},
			setQuery: async () => {},
			destroy: () => {
				if (container) container.innerHTML = "";
			},
		};
	}

	const opts = { ...defaults, ...options };
	const container = resolveElements(opts.containerSelector)[0] as
		| HTMLElement
		| undefined;

	if (!container) {
		throw new Error("createWidget: containerSelector matched no element.");
	}

	const target: HTMLElement = container;

	const cacheKey =
		opts.cacheKey ||
		(typeof opts.containerSelector === "string"
			? opts.containerSelector
			: "widget");

	const blog = new Blogr(opts.blogUrl, { jsonp: opts.jsonp });
	if (opts.cache) blog.cache.enable({ ttlMs: opts.cacheTTL * 1000 });

	const currentPostId = opts.currentPostId ?? detectCurrentPostId();

	let destroyed = false;
	let mounted = false;
	let loading = false;
	let currentQuery = opts.query;

	/** Full in-memory buffer for "random"/buffered-search modes. */
	let buffer: WidgetEntry[] = [];
	/** SDK pager, used for network-backed pagination of posts/comments/pages. */
	let pager: Pager<Post> | Pager<Comment> | null = null;

	let visible: WidgetEntry[] = [];
	let currentPostLabels: string[] = [];

	let mountObserver: IntersectionObserver | null = null;
	let scrollObserver: IntersectionObserver | null = null;
	let sentinel: HTMLDivElement | null = null;
	let loadMoreBtn: HTMLButtonElement | null = null;

	const usesBuffer =
		opts.source === "random" || (!opts.deepSearch && !!opts.query);

	function isPostEntry(raw: Post | Comment | Author | string): raw is Post {
		return (
			typeof raw === "object" &&
			raw !== null &&
			"labels" in raw &&
			"content" in raw
		);
	}

	function isCommentEntry(
		raw: Post | Comment | Author | string,
	): raw is Comment {
		return typeof raw === "object" && raw !== null && "post" in raw;
	}

	function isAuthorEntry(raw: Post | Comment | Author | string): raw is Author {
		return (
			typeof raw === "object" && raw !== null && "name" in raw && !("id" in raw)
		);
	}

	async function normalize(
		raw: Post | Comment | Author | string,
		index: number,
	): Promise<WidgetEntry> {
		let entry: WidgetEntry;

		if (opts.type === "authors") {
			if (!isAuthorEntry(raw)) throw new Error("Expected Author");
			const author = raw;
			entry = {
				id: author.url || `author-${index}`,
				title: author.name || "Unknown Author",
				url: author.url || "#",
				author: author.name || "",
				published: "",
				updated: "",
				labels: [],
				thumbnail: author.image || opts.fallbackImage,
				content: "",
				raw: author,
			};
		} else if (opts.type === "labels") {
			if (typeof raw !== "string") throw new Error("Expected label string");
			const label = raw;
			entry = {
				id: `label-${label}`,
				title: label,
				url: `${opts.blogUrl}/search/label/${encodeURIComponent(label)}`,
				author: "",
				published: "",
				updated: "",
				labels: [label],
				thumbnail: opts.fallbackImage,
				content: "",
				raw: label,
			};
		} else {
			if (typeof raw === "string" || isAuthorEntry(raw)) {
				throw new Error("Expected Post or Comment");
			}

			const post = isPostEntry(raw) ? raw : null;
			let thumb = "";

			if (opts.thumbnail !== false) {
				const contentForThumb = post ? post.content : raw.content;
				thumb =
					post?.thumbnailAlt ||
					post?.thumbnail ||
					blog.thumbnail(contentForThumb) ||
					"";
				if (thumb) {
					const resizeOpts: ResizeImageOptions =
						opts.thumbnail === "default"
							? {}
							: (opts.thumbnail as ResizeImageOptions);
					thumb = resizeImage(thumb, resizeOpts);
				} else {
					thumb = opts.fallbackImage;
				}
			}

			const contentSource = post ? post.content : raw.content;
			const summarySource = post ? post.summary : raw.summary;
			let content = blog.htmlToText(contentSource ?? summarySource ?? "");
			if (opts.summaryLength > 0 && content.length > opts.summaryLength) {
				content = `${content.slice(0, opts.summaryLength).trimEnd()}\u2026`;
			}

			entry = {
				id: raw.id,
				title: post?.title ?? "",
				url: raw.url,
				author: raw.author?.name ?? "",
				published: formatDate(raw.published, opts.dateFormat),
				updated: formatDate(raw.updated, opts.dateFormat),
				labels: post?.labels ?? [],
				thumbnail: thumb,
				content,
				raw,
			};
		}

		for (const transform of opts.transformers) {
			entry = await transform(entry, index);
		}
		return entry;
	}

	function applyFilters(entries: WidgetEntry[]): WidgetEntry[] {
		let out = entries;
		if (opts.excludeCurrent && currentPostId) {
			out = out.filter((e) => e.id !== currentPostId);
		}
		if (opts.related && currentPostLabels.length) {
			out = out.filter((e) =>
				e.labels.some((l) => currentPostLabels.includes(l)),
			);
		}
		if (opts.sort === "asc") out = [...out].reverse();
		if (opts.random) out = shuffle(out);
		return out;
	}

	function matchesQuery(entry: WidgetEntry, query: string): boolean {
		if (!query) return true;
		const needle = query.toLowerCase();
		return (
			entry.title.toLowerCase().includes(needle) ||
			entry.content.toLowerCase().includes(needle)
		);
	}

	async function fetchNetworkBatch(
		page: Pager<Post> | Pager<Comment> | null,
	): Promise<{
		entries: WidgetEntry[];
		nextPager: Pager<Post> | Pager<Comment> | null;
	}> {
		if (page) {
			const next = await page.next();
			if (!next) return { entries: [], nextPager: null };
			const normalized = await Promise.all(
				next.items.map((raw, i) => normalize(raw, i)),
			);
			return { entries: applyFilters(normalized), nextPager: next };
		}

		// Handle different widget types
		if (opts.type === "authors") {
			const authors = await blog.authors({
				sampleSize: opts.maxVisibleItems * 4,
			});
			const normalized = await Promise.all(
				authors.map((author, i) => normalize(author, i)),
			);
			return { entries: applyFilters(normalized), nextPager: null };
		} else if (opts.type === "labels") {
			const labels = await blog.labels();
			const normalized = await Promise.all(
				labels.map((label, i) => normalize(label, i)),
			);
			return { entries: applyFilters(normalized), nextPager: null };
		}

		// Default: posts, comments, pages
		const baseOptions = {
			limit: opts.maxVisibleItems,
			orderBy: opts.orderBy,
			label:
				opts.feed === "posts" && opts.labels.length ? opts.labels : undefined,
			query: opts.feed === "posts" && currentQuery ? currentQuery : undefined,
		};

		let items: (Post | Comment)[];
		let newPager: Pager<Post> | Pager<Comment> | null = null;

		if (opts.feed === "comments") {
			const p = await blog.comments({
				limit: opts.maxVisibleItems,
				orderBy: opts.orderBy,
			});
			items = p.items;
			newPager = p;
		} else if (opts.feed === "pages") {
			const p = await blog.pages({
				limit: opts.maxVisibleItems,
				orderBy: opts.orderBy,
			});
			items = p.items;
			newPager = p;
		} else {
			const p = await blog.posts(baseOptions);
			items = p.items;
			newPager = p;
		}

		const normalized = await Promise.all(
			items.map((raw, i) => normalize(raw, i)),
		);
		return { entries: applyFilters(normalized), nextPager: newPager };
	}

	async function fetchBuffer(): Promise<WidgetEntry[]> {
		if (opts.type === "authors") {
			const authors = await blog.authors({
				sampleSize: opts.maxVisibleItems * 4,
			});
			return await Promise.all(
				authors.map((author, i) => normalize(author, i)),
			);
		} else if (opts.type === "labels") {
			const labels = await blog.labels();
			return await Promise.all(labels.map((label, i) => normalize(label, i)));
		}

		// Default: posts
		let items: Post[];
		if (opts.source === "random") {
			items = await blog.random({
				count: opts.maxVisibleItems * 4,
				label: opts.labels.length ? opts.labels : undefined,
				query: currentQuery || undefined,
			});
		} else {
			const p = await blog.posts({
				limit: opts.maxVisibleItems * 4,
				orderBy: opts.orderBy,
				label: opts.labels.length ? opts.labels : undefined,
			});
			items = p.items;
		}
		const normalized = await Promise.all(
			items.map((raw, i) => normalize(raw, i)),
		);
		return applyFilters(normalized);
	}

	function renderEntries(entries: WidgetEntry[], append: boolean): void {
		if (entries.length === 0 && !append) {
			target.innerHTML = opts.empty();
			opts.onEmpty?.();
			return;
		}
		if (!append) target.innerHTML = "";

		const startIndex = append ? visible.length : 0;
		for (const [i, entry] of entries.entries()) {
			opts.beforeRender?.(entry);
			const wrapper = document.createElement("div");
			wrapper.innerHTML = opts.template(entry, startIndex + i).trim();
			const el = (wrapper.firstElementChild as HTMLElement) ?? wrapper;
			const extraClass = opts.entryClass(entry, startIndex + i);
			if (extraClass)
				el.classList.add(...extraClass.split(/\s+/).filter(Boolean));
			target.appendChild(el);
			opts.afterRender?.(el, entry);
		}

		if (append) visible = [...visible, ...entries];
		else visible = entries;

		renderPaginationControls();
	}

	function renderPaginationControls(): void {
		loadMoreBtn?.remove();
		sentinel?.remove();
		scrollObserver?.disconnect();

		// Authors and labels don't support pagination
		if (opts.type === "authors" || opts.type === "labels") {
			return;
		}

		const hasMore = usesBuffer
			? visible.length < buffer.length
			: pager?.hasNext !== false; // unknown (null pager) treated as "maybe more"

		if (!hasMore || visible.length === 0) return;

		if (opts.loadMore) {
			loadMoreBtn = document.createElement("button");
			loadMoreBtn.type = "button";
			loadMoreBtn.className = "blogr-widget-load-more";
			loadMoreBtn.textContent = opts.loadMoreText;
			loadMoreBtn.addEventListener("click", () => void loadMore());
			target.appendChild(loadMoreBtn);
		}

		if (opts.infiniteScroll) {
			sentinel = document.createElement("div");
			sentinel.className = "blogr-widget-sentinel";
			target.appendChild(sentinel);
			scrollObserver = new IntersectionObserver(
				(entries) => {
					if (entries.some((e) => e.isIntersecting)) void loadMore();
				},
				{ rootMargin: opts.rootMargin },
			);
			scrollObserver.observe(sentinel);
		}
	}

	async function loadMore(): Promise<void> {
		if (loading || destroyed) return;
		// Authors and labels don't support pagination
		if (opts.type === "authors" || opts.type === "labels") return;

		loading = true;
		try {
			if (usesBuffer) {
				const next = buffer.slice(
					visible.length,
					visible.length + opts.maxVisibleItems,
				);
				if (next.length) renderEntries(next, true);
			} else {
				const { entries, nextPager } = await fetchNetworkBatch(pager);
				pager = nextPager;
				if (entries.length) renderEntries(entries, true);
				else renderPaginationControls();
			}
		} catch (err) {
			opts.onError?.(err);
		} finally {
			loading = false;
		}
	}

	async function load(): Promise<void> {
		if (loading || destroyed) return;
		loading = true;

		const statusText =
			opts.type === "authors"
				? "Loading authors..."
				: opts.type === "labels"
					? "Loading labels..."
					: "Loading posts...";
		target.innerHTML = opts.loading(statusText);

		try {
			await opts.beforeFetch?.();

			if (opts.related && currentPostId && currentPostLabels.length === 0) {
				const current = await blog.post(currentPostId);
				currentPostLabels = current?.labels ?? [];
			}

			// Don't use cache for authors or labels
			if (opts.cache && opts.type === "posts") {
				const cached = readLocalCache(cacheKey, opts.cacheTTL);
				if (cached) {
					if (usesBuffer) buffer = cached;
					visible = [];
					const firstBatch = usesBuffer
						? cached.slice(0, opts.maxVisibleItems)
						: cached;
					await opts.afterFetch?.(cached);
					renderEntries(firstBatch, false);
					loading = false;
					return;
				}
			}

			if (usesBuffer) {
				buffer = buffer.length ? buffer : await fetchBuffer();
				const filtered = currentQuery
					? buffer.filter((e) => matchesQuery(e, currentQuery))
					: buffer;
				await opts.afterFetch?.(filtered);
				if (opts.cache && opts.type === "posts")
					writeLocalCache(cacheKey, filtered);
				renderEntries(filtered.slice(0, opts.maxVisibleItems), false);
			} else {
				const { entries, nextPager } = await fetchNetworkBatch(null);
				pager = nextPager;
				await opts.afterFetch?.(entries);
				if (opts.cache && opts.type === "posts")
					writeLocalCache(cacheKey, entries);
				renderEntries(entries, false);
			}
		} catch (err) {
			target.innerHTML = opts.error(
				err instanceof Error ? err.message : String(err),
			);
			opts.onError?.(err);
		} finally {
			loading = false;
		}
	}

	function mount(): void {
		if (mounted || destroyed) return;
		mounted = true;
		void load();
	}

	mountObserver = new IntersectionObserver(
		(entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				mountObserver?.disconnect();
				mount();
			}
		},
		{ rootMargin: opts.rootMargin },
	);
	mountObserver.observe(target);

	return {
		async refresh() {
			buffer = [];
			pager = null;
			visible = [];
			currentPostLabels = [];
			await load();
		},
		async setQuery(query: string) {
			currentQuery = query;
			if (opts.type === "authors" || opts.type === "labels") {
				// Authors and labels don't support query, just reload
				await load();
				return;
			}
			if (opts.deepSearch) {
				pager = null;
				visible = [];
				await load();
				return;
			}
			const filtered = buffer.filter((e) => matchesQuery(e, currentQuery));
			renderEntries(filtered.slice(0, opts.maxVisibleItems), false);
		},
		destroy() {
			destroyed = true;
			mountObserver?.disconnect();
			scrollObserver?.disconnect();
			loadMoreBtn?.remove();
			sentinel?.remove();
			target.innerHTML = "";
		},
	};
}
