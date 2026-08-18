/*! blogr-plugins v0.0.3 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrCreateWidget = (function(exports) {

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//#region src/utils/blogr-global.ts
/**
	* Stand-in for the real `blogr` package, used ONLY by the standalone IIFE
	* browser builds (aliased in place of `import Blogr from "blogr"` — see
	* `tsdown.config.ts`).
	*
	* Plain `external + output.globals` (what the npm ESM/CJS builds use)
	* compiles a *bare* `Blogr` identifier reference into the bundle. If the
	* `<script src=".../blogr">` tag is missing entirely, that bare reference
	* throws a native `ReferenceError` the instant the plugin script loads —
	* before {@link requireBlogr} ever gets a chance to run.
	*
	* Reading `globalThis.Blogr` defensively here means the import always
	* resolves to *something* (possibly `undefined`), so the friendly,
	* actionable {@link requireBlogr} error is what the user sees in every
	* missing/late/misnamed-script scenario, not just some of them.
	*/
	const Blogr = globalThis.Blogr;

//#endregion
//#region src/utils/dom.ts
/**
	* Normalizes any supported input (selector string, Element, NodeList, array,
	* or jQuery collection) into a plain array of Elements.
	*
	* @param input - Selector string, Element, element list, or jQuery object.
	* @returns Array of matched elements. Empty if nothing matched.
	*/
	function resolveElements(input) {
		if (typeof input === "string") return Array.from(document.querySelectorAll(input));
		if (input instanceof Element) return [input];
		if (input == null) return [];
		return Array.from(input);
	}

//#endregion
//#region src/plugins/resizeImage.ts
/**
	* Detects and rewrites Blogger-hosted media URLs:
	* - Blogger/Google-hosted images (`googleusercontent.com` / `*.blogspot.com`,
	*   both the old path-segment URL shape and the newer `=`-suffixed shape)
	*   with new size, crop, format, flip and rotation parameters.
	* - YouTube video thumbnails (`i.ytimg.com`, `img.youtube.com`, and the
	*   `i1`–`i4.ytimg.com` mirrors), rewritten to a chosen quality preset and
	*   always served as WebP — YouTube's thumbnail CDN doesn't support the
	*   width/height/crop/flip/rotate params Blogger images do.
	*/
	/** Matches Blogger/Google-hosted image URLs (old and new URL shapes). */
	const HOST_PATTERN = /^(https?:)?(\/\/)[^/]*\.(googleusercontent\.com|blogspot\.com)/;
	/**
	* Matches the new `=`-suffixed param segment (e.g. `...=w1200-h675-rw`).
	* Checked before {@link OLD_SHAPE_PATTERN} — an explicit `=` near the end
	* of the URL is an unambiguous signal, whereas the old-shape pattern can
	* spuriously match *any* path segment (or even the host) that happens to
	* sit right before something with a dot in it.
	*/
	const NEW_SHAPE_PATTERN = /(?<==)[^=&?/]+(?=\?|$)/;
	/**
	* Matches the old path-segment param shape (e.g. `.../s1600/photo.jpg`):
	* the path segment right before the filename.
	*/
	const OLD_SHAPE_PATTERN = /[^/]+(?=\/[^/]+\.[^/?]+(?:\?|$))/;
	/**
	* Locates the resizable param segment within a Blogger image URL, trying
	* the new `=`-suffixed shape first and falling back to the old
	* path-segment shape. Returns `null` if neither shape is present.
	*/
	function findParamSegment(str) {
		return str.match(NEW_SHAPE_PATTERN) ?? str.match(OLD_SHAPE_PATTERN);
	}
	/**
	* Matches a YouTube thumbnail URL and captures its protocol, video ID and
	* trailing query string. Covers both `i.ytimg.com`/`i1`–`i4.ytimg.com` and
	* `img.youtube.com`, and both the plain (`/vi/`) and WebP (`/vi_webp/`)
	* variants, in `.jpg`, `.jpeg` or `.webp`.
	*/
	const YOUTUBE_THUMBNAIL_PATTERN = /^(https?:)?(\/\/)(?:i[1-4]?\.ytimg\.com|img\.youtube\.com)\/vi(?:_webp)?\/([^/]+)\/[a-z0-9]+\.(?:jpe?g|webp)((?:\?[^#]*)?)$/i;
	/** Recognized boolean-flag param prefixes (`present` = on, `absent` = off). */
	const BOOLEAN_PARAMS = /* @__PURE__ */ new Set([
		"nu",
		"c",
		"cc",
		"ci",
		"p",
		"fh",
		"fv",
		"pd",
		"rj",
		"rp",
		"rw",
		"rwa",
		"rg",
		"rh",
		"h",
		"d",
		"no",
		"o",
		"k"
	]);
	/** Recognized numeric param prefixes. */
	const NUMBER_PARAMS = /* @__PURE__ */ new Set([
		"w",
		"h",
		"s",
		"r",
		"ba",
		"br",
		"b",
		"e",
		"a"
	]);
	/** Prefixes that force a specific output format; mutually exclusive. */
	const FORMAT_PARAMS = [
		"rj",
		"rp",
		"rw",
		"rwa",
		"rg",
		"rh"
	];
	/** Prefixes that flip the image; mutually exclusive. */
	const FLIP_PARAMS = ["fh", "fv"];
	/** Prefixes that crop the image into a circle or square; mutually exclusive. */
	const CROP_PARAMS = ["cc", "ci"];
	const defaults$1 = {
		height: 360,
		width: 640,
		format: "webp",
		ytThumbnail: "maxresdefault"
	};
	function toUrlString(url) {
		if (url instanceof URL) return url.toString();
		if (typeof url === "string") return url;
		throw new TypeError("Argument 'url' must be of type string | URL");
	}
	/**
	* Parses a single `-`-delimited param segment part (e.g. `"w400"`, `"cc"`,
	* `"c0xFF0000"`) into its kind, prefix and value.
	*/
	function getParamInfo(part) {
		const hexMatch = /^(c|bc|pc)(0x[0-9A-Fa-f]{6,8})$/.exec(part);
		if (hexMatch?.[1] && hexMatch[2]) return [
			"hex",
			hexMatch[1],
			hexMatch[2]
		];
		const numMatch = /^([a-z]{1,3})(\d+)$/i.exec(part);
		if (numMatch?.[1] && NUMBER_PARAMS.has(numMatch[1])) return [
			"num",
			numMatch[1],
			Number(numMatch[2])
		];
		if (BOOLEAN_PARAMS.has(part)) return [
			"bool",
			part,
			true
		];
		return null;
	}
	/** Parses a full `-`-delimited param segment into an ordered param map. */
	function parseParams(segment) {
		const params = /* @__PURE__ */ new Map();
		for (const part of segment.split("-")) {
			const info = getParamInfo(part);
			if (!info) continue;
			const [kind, prefix, value] = info;
			params.set(prefix, {
				kind,
				value
			});
		}
		return params;
	}
	/** Serializes a param map back into a `-`-delimited segment. */
	function serializeParams(params) {
		const parts = [];
		for (const [prefix, { kind, value }] of params) parts.push(kind === "bool" ? prefix : `${prefix}${value}`);
		return parts.join("-");
	}
	/** Sets `prefix` and deletes every other prefix in `group` from `params`. */
	function setExclusive(params, group, prefix) {
		for (const other of group) if (other !== prefix) params.delete(other);
		params.set(prefix, {
			kind: "bool",
			value: true
		});
	}
	/**
	* Rewrites a YouTube thumbnail URL to the requested quality preset, always
	* served through the WebP-capable `i.ytimg.com/vi_webp/` path regardless of
	* which mirror host or extension the original URL used.
	*/
	function resizeYouTubeThumbnail(match, options) {
		const protocol = match[1] ?? "https:";
		const videoId = match[3];
		const query = match[4] ?? "";
		return `${protocol}//i.ytimg.com/vi_webp/${videoId}/${options.ytThumbnail ?? defaults$1.ytThumbnail}.webp${query}`;
	}
	/**
	* Builds a resized/transformed URL for a Blogger/Google-hosted image.
	* Unsupported URLs are returned unchanged rather than throwing, so it's
	* always safe to run any image URL through this function.
	*
	* For Blogger images, this parses the URL's existing param segment and
	* only overrides the params implied by `options` — width, height and
	* format always apply (falling back to their defaults), while crop, flip
	* and rotate are left untouched unless explicitly requested. Any other
	* recognized param already on the URL (e.g. `nu`, `pd`, `d`) is preserved.
	*
	* For YouTube thumbnail URLs, `width`/`height`/`crop`/`format`/`flip`/`rotate`
	* are ignored — YouTube only serves fixed quality presets — and only
	* `ytThumbnail` applies, always rewritten to the WebP variant.
	*
	* @param url - Source image or YouTube thumbnail URL.
	* @param options Configuration object.
	* See {@link ResizeImageOptions}.
	* @returns The transformed image URL, or the original URL if unsupported.
	*
	* @example
	* ```ts
	* import { resizeImage } from "blogr-plugins";
	*
	* const url = resizeImage("https://1.bp.blogspot.com/path/s72-c/image.jpg", {
	* 	width: 400,
	* 	height: 400,
	* 	format: "webp",
	* });
	* ```
	*/
	function resizeImage(url, options = {}) {
		const str = toUrlString(url);
		const ytMatch = str.match(YOUTUBE_THUMBNAIL_PATTERN);
		if (ytMatch) return resizeYouTubeThumbnail(ytMatch, options);
		if (!HOST_PATTERN.test(str)) return str;
		const match = findParamSegment(str);
		if (!match?.[0] || match.index === void 0) return str;
		const params = parseParams(match[0]);
		params.delete("s");
		params.set("w", {
			kind: "num",
			value: options.width ?? defaults$1.width
		});
		params.set("h", {
			kind: "num",
			value: options.height ?? defaults$1.height
		});
		const format = options.format ?? defaults$1.format;
		if (format === "jpeg") setExclusive(params, FORMAT_PARAMS, "rj");
		else if (format === "png") setExclusive(params, FORMAT_PARAMS, "rp");
		else if (format === "webp") setExclusive(params, FORMAT_PARAMS, "rw");
		if (options.crop === "circle") setExclusive(params, CROP_PARAMS, "cc");
		else if (options.crop === "square") setExclusive(params, CROP_PARAMS, "ci");
		if (options.flip === "horizontally") setExclusive(params, FLIP_PARAMS, "fh");
		else if (options.flip === "vertically") setExclusive(params, FLIP_PARAMS, "fv");
		if (options.rotate !== void 0) if (options.rotate === 90 || options.rotate === 180 || options.rotate === 270) params.set("r", {
			kind: "num",
			value: options.rotate
		});
		else params.delete("r");
		const newSegment = serializeParams(params);
		return `${str.slice(0, match.index)}${newSegment}${str.slice(match.index + match[0].length)}`;
	}

//#endregion
//#region src/plugins/createWidget.ts
	const defaults = {
		jsonp: true,
		type: "posts",
		source: "recent",
		labels: [],
		orderBy: "published",
		sort: "desc",
		query: "",
		deepSearch: false,
		dateFormat: "MMM d, yyyy",
		related: false,
		random: false,
		excludeCurrent: false,
		thumbnail: "default",
		fallbackImage: "data:image/svg+xml;base64," + btoa("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"360\"><rect width=\"100%\" height=\"100%\" fill=\"#e2e2e2\"/></svg>"),
		summaryLength: 120,
		infiniteScroll: false,
		loadMore: false,
		loadMoreText: "Load more",
		maxVisibleItems: 6,
		rootMargin: "0px",
		cache: false,
		cacheTTL: 3600,
		transformers: [],
		loading: (status) => `<div class="blogr-widget-loading" style="text-align:center;width:100%"><span class="blogr-widget-loader"></span><p>${status}</p></div>`,
		error: (errorMsg) => `<pre class="blogr-widget-error" style="white-space: pre-wrap;word-break: break-all;">${errorMsg}</pre>`,
		empty: () => `<p class="blogr-widget-empty" style="text-align:center">No posts found.</p>`,
		template: (entry) => entry.kind === "authors" || entry.kind === "labels" ? `<div><h2>${entry.name}</h2></div>` : entry.kind === "comments" ? `<div><p><strong>${entry.author.name}</strong>: ${entry.content}</p></div>` : `<div><h2>${entry.title}</h2><p>${entry.content}</p></div>`,
		entryClass: () => ""
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
		"December"
	];
	const MONTHS_SHORT = MONTHS_LONG.map((m) => m.slice(0, 3));
	const DAYS_LONG = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	];
	const DAYS_SHORT = DAYS_LONG.map((d) => d.slice(0, 3));
	/** Minimal, dependency-free date formatter for `dateFormat`. */
	function formatDate(iso, pattern) {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return "";
		const pad = (n) => String(n).padStart(2, "0");
		const tokens = {
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
			hh: pad((d.getHours() + 11) % 12 + 1),
			mm: pad(d.getMinutes()),
			ss: pad(d.getSeconds()),
			a: d.getHours() < 12 ? "AM" : "PM"
		};
		return pattern.replace(/EEEE|EEE|yyyy|yy|MMMM|MMM|MM|M|dd|d|HH|hh|mm|ss|a/g, (token) => tokens[token] ?? token);
	}
	function shuffle(items) {
		const out = [...items];
		for (let i = out.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[out[i], out[j]] = [out[j], out[i]];
		}
		return out;
	}
	function readLocalCache(key, ttlSeconds) {
		try {
			const raw = localStorage.getItem(`blogr-widget:${key}`);
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			if (Date.now() - parsed.savedAt > ttlSeconds * 1e3) return null;
			return parsed.entries;
		} catch {
			return null;
		}
	}
	function writeLocalCache(key, entries) {
		try {
			localStorage.setItem(`blogr-widget:${key}`, JSON.stringify({
				entries,
				savedAt: Date.now()
			}));
		} catch {}
	}
	/**
	* Detects the current post's id from `<link rel="canonical">` when
	* `currentPostId` isn't supplied. Best-effort — Blogger doesn't expose the
	* numeric post id in the DOM, so this only catches setups that already
	* carry it in the URL (e.g. a `postID` query param) or a data attribute.
	*/
	function detectCurrentPostId() {
		return document.querySelector("[data-blogr-post-id]")?.dataset.blogrPostId || void 0;
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
	* 	type: "posts", // or "pages" | "comments" | "authors" | "labels"
	* 	related: true,
	* 	excludeCurrent: true,
	* 	currentPostId: "1234567890123456789",
	* 	labels: ["javascript"],
	* 	maxVisibleItems: 6,
	* 	loadMore: true,
	* 	template: (entry) => `
	* 		<article class="related-post">
	* 			<img src="${entry.thumbnail}" alt="${entry.raw.title}" />
	* 			<h3>${entry.raw.title}</h3>
	* 			<p>${entry.content}</p>
	* 		</article>
	* 	`,
	* });
	*
	* // later, e.g. before a client-side route change
	* widget.destroy();
	* ```
	*/
	function createWidget(options) {
		if (typeof Blogr === "undefined") {
			console.warn("[blogr-widget] Blogr SDK not found. Please add it via CDN: <script src=\"https://cdn.jsdelivr.net/npm/blogr\"><\/script> or install via npm: npm install blogr");
			const container = resolveElements(options.containerSelector)?.[0];
			if (container) container.innerHTML = `
				<div class="blogr-widget-error" style="padding: 1rem; background: #fee; border: 1px solid #fcc; color: #c00; border-radius: 4px;">
					<p><strong>Blogr SDK not loaded.</strong></p>
					<p>Please include the Blogr library:</p>
					<code style="display: block; margin: 0.5rem 0; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
						&lt;script src="https://cdn.jsdelivr.net/npm/blogr"&gt;&lt;/script&gt;
					</code>
				</div>
			`;
			return {
				refresh: async () => {},
				setQuery: async () => {},
				destroy: () => {
					if (container) container.innerHTML = "";
				}
			};
		}
		const opts = {
			...defaults,
			...options
		};
		const container = resolveElements(opts.containerSelector)[0];
		if (!container) throw new Error("createWidget: containerSelector matched no element.");
		const target = container;
		const cacheKey = opts.cacheKey || (typeof opts.containerSelector === "string" ? opts.containerSelector : "widget");
		const blog = new Blogr(opts.blogUrl, { jsonp: opts.jsonp });
		if (opts.cache) blog.cache.enable({ ttlMs: opts.cacheTTL * 1e3 });
		const currentPostId = opts.currentPostId ?? detectCurrentPostId();
		let destroyed = false;
		let mounted = false;
		let loading = false;
		let currentQuery = opts.query;
		/** Full in-memory buffer for "random"/buffered-search modes. */
		let buffer = [];
		/** SDK pager, used for network-backed pagination of posts/comments/pages. */
		let pager = null;
		let visible = [];
		let currentPostLabels = [];
		let mountObserver = null;
		let scrollObserver = null;
		let sentinel = null;
		let loadMoreBtn = null;
		const usesBuffer = opts.source === "random" || !opts.deepSearch && !!opts.query;
		function normalizeAuthor(author, index) {
			return {
				kind: "authors",
				id: author.url || `author-${index}`,
				name: author.name || "Unknown Author",
				url: author.url || "#",
				image: author.image || opts.fallbackImage,
				raw: author
			};
		}
		function normalizeLabel(label) {
			return {
				kind: "labels",
				id: `label-${label}`,
				name: label,
				url: `${opts.blogUrl}/search/label/${encodeURIComponent(label)}`,
				raw: label
			};
		}
		function truncate(text) {
			if (opts.summaryLength > 0 && text.length > opts.summaryLength) return `${text.slice(0, opts.summaryLength).trimEnd()}\u2026`;
			return text;
		}
		function normalizePost(raw) {
			let thumb = "";
			if (opts.thumbnail !== false) {
				thumb = raw.thumbnailAlt || raw.thumbnail || blog.thumbnail(raw.content) || "";
				if (thumb) {
					const resizeOpts = opts.thumbnail === "default" ? {} : opts.thumbnail;
					thumb = resizeImage(thumb, resizeOpts);
				} else thumb = opts.fallbackImage;
			}
			const content = truncate(blog.htmlToText(raw.content ?? raw.summary ?? ""));
			return {
				kind: opts.type,
				id: raw.id,
				title: raw?.title ?? "",
				url: raw.url,
				author: raw.author,
				published: formatDate(raw.published, opts.dateFormat),
				updated: formatDate(raw.updated, opts.dateFormat),
				labels: raw?.labels ?? [],
				thumbnail: thumb,
				content,
				raw
			};
		}
		function normalizeComment(raw) {
			const content = truncate(blog.htmlToText(raw.content ?? raw.summary ?? ""));
			return {
				...raw,
				kind: "comments",
				content,
				published: formatDate(raw.published, opts.dateFormat),
				updated: formatDate(raw.updated, opts.dateFormat)
			};
		}
		async function normalize(raw, index) {
			let entry = opts.type === "authors" ? normalizeAuthor(raw, index) : opts.type === "labels" ? normalizeLabel(raw) : opts.type === "comments" ? normalizeComment(raw) : normalizePost(raw);
			for (const transform of opts.transformers) {
				if (entry === null) break;
				entry = await transform(entry, index);
			}
			return entry;
		}
		async function normalizeAll(items) {
			return (await Promise.all(items.map((raw, i) => normalize(raw, i)))).filter((e) => e !== null);
		}
		/** Typed for the posts/pages branch — normalize() always returns a PostEntry there. */
		async function normalizePostEntries(items) {
			return await normalizeAll(items);
		}
		/** Typed for the comments branch — normalize() always returns a CommentEntry there. */
		async function normalizeCommentEntries(items) {
			return await normalizeAll(items);
		}
		function applyPostFilters(entries) {
			let out = entries;
			if (opts.excludeCurrent && currentPostId) out = out.filter((e) => e.raw.id !== currentPostId);
			if (opts.related && currentPostLabels.length) out = out.filter((e) => e.labels.some((l) => currentPostLabels.includes(l)));
			if (opts.sort === "asc") out = [...out].reverse();
			if (opts.random) out = shuffle(out);
			return out;
		}
		function applyCommentFilters(entries) {
			let out = entries;
			if (opts.sort === "asc") out = [...out].reverse();
			if (opts.random) out = shuffle(out);
			return out;
		}
		function matchesQuery(entry, query) {
			if (!query) return true;
			const needle = query.toLowerCase();
			if (entry.kind === "authors" || entry.kind === "labels") return entry.name.toLowerCase().includes(needle);
			if (entry.kind === "comments") return entry.content.toLowerCase().includes(needle) || (entry.title ?? "").toLowerCase().includes(needle);
			return entry.raw.title.toLowerCase().includes(needle) || entry.content.toLowerCase().includes(needle);
		}
		/** `type: "authors"` — no pagination, no query, no labels (blog.authors() has none of these). */
		async function fetchAuthorsBatch() {
			return normalizeAll(await blog.authors({ sampleSize: opts.maxVisibleItems * 4 }));
		}
		/** `type: "labels"` — blog.categories() is the SDK's own alias for blog.labels(). */
		async function fetchLabelsBatch() {
			return normalizeAll(await blog.categories());
		}
		/** `type: "posts"`, one network page. Uses blog.search() when a query is active, blog.posts() otherwise. */
		async function fetchPostsPage(page) {
			if (page) {
				const next = await page.next();
				if (!next) return {
					entries: [],
					nextPager: null
				};
				return {
					entries: applyPostFilters(await normalizePostEntries(next.items)),
					nextPager: next
				};
			}
			const listOptions = {
				limit: opts.maxVisibleItems,
				orderBy: opts.orderBy,
				label: opts.labels.length ? opts.labels : void 0
			};
			const p = currentQuery ? await blog.search({
				query: currentQuery,
				...listOptions
			}) : await blog.posts(listOptions);
			return {
				entries: applyPostFilters(await normalizePostEntries(p.items)),
				nextPager: p
			};
		}
		/** `type: "comments"`, one network page. blog.comments() ignores labels/query, per the feed API. */
		async function fetchCommentsPage(page) {
			if (page) {
				const next = await page.next();
				if (!next) return {
					entries: [],
					nextPager: null
				};
				return {
					entries: applyCommentFilters(await normalizeCommentEntries(next.items)),
					nextPager: next
				};
			}
			const p = await blog.comments({
				limit: opts.maxVisibleItems,
				orderBy: opts.orderBy
			});
			return {
				entries: applyCommentFilters(await normalizeCommentEntries(p.items)),
				nextPager: p
			};
		}
		/** `type: "pages"`, one network page. blog.pages() ignores labels/query too. */
		async function fetchPagesPage(page) {
			if (page) {
				const next = await page.next();
				if (!next) return {
					entries: [],
					nextPager: null
				};
				return {
					entries: applyPostFilters(await normalizePostEntries(next.items)),
					nextPager: next
				};
			}
			const p = await blog.pages({
				limit: opts.maxVisibleItems,
				orderBy: opts.orderBy
			});
			return {
				entries: applyPostFilters(await normalizePostEntries(p.items)),
				nextPager: p
			};
		}
		/** Dispatches one network page to the right fetcher for the current type/feed. */
		async function fetchNetworkBatch(page) {
			if (opts.type === "authors") return {
				entries: await fetchAuthorsBatch(),
				nextPager: null
			};
			if (opts.type === "labels") return {
				entries: await fetchLabelsBatch(),
				nextPager: null
			};
			if (opts.type === "comments") return fetchCommentsPage(page);
			if (opts.type === "pages") return fetchPagesPage(page);
			return fetchPostsPage(page);
		}
		/** Buffered posts — blog.random() for `source: "random"`, blog.posts() for `"recent"`. */
		async function fetchPostsBuffer() {
			return applyPostFilters(await normalizePostEntries(opts.source === "random" ? await blog.random({
				count: opts.maxVisibleItems * 4,
				label: opts.labels.length ? opts.labels : void 0,
				query: currentQuery || void 0
			}) : (await blog.posts({
				limit: opts.maxVisibleItems * 4,
				orderBy: opts.orderBy,
				label: opts.labels.length ? opts.labels : void 0
			})).items));
		}
		/** Buffered comments — blog.comments() over a wider limit, filtered client-side. */
		async function fetchCommentsBuffer() {
			return applyCommentFilters(await normalizeCommentEntries((await blog.comments({
				limit: opts.maxVisibleItems * 4,
				orderBy: opts.orderBy
			})).items));
		}
		/** Buffered pages — blog.pages() over a wider limit, filtered client-side. */
		async function fetchPagesBuffer() {
			return applyPostFilters(await normalizePostEntries((await blog.pages({
				limit: opts.maxVisibleItems * 4,
				orderBy: opts.orderBy
			})).items));
		}
		/** Dispatches the initial buffer fetch (used for `source: "random"` and non-deep query search). */
		async function fetchBuffer() {
			if (opts.type === "authors") return fetchAuthorsBatch();
			if (opts.type === "labels") return fetchLabelsBatch();
			if (opts.type === "comments") return fetchCommentsBuffer();
			if (opts.type === "pages") return fetchPagesBuffer();
			return fetchPostsBuffer();
		}
		function renderEntries(entries, append) {
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
				const el = wrapper.firstElementChild ?? wrapper;
				const extraClass = opts.entryClass(entry, startIndex + i);
				if (extraClass) el.classList.add(...extraClass.split(/\s+/).filter(Boolean));
				target.appendChild(el);
				opts.afterRender?.(el, entry);
			}
			if (append) visible = [...visible, ...entries];
			else visible = entries;
			renderPaginationControls();
		}
		function renderPaginationControls() {
			loadMoreBtn?.remove();
			sentinel?.remove();
			scrollObserver?.disconnect();
			if (opts.type === "authors" || opts.type === "labels") return;
			if (!(usesBuffer ? visible.length < buffer.length : pager?.hasNext !== false) || visible.length === 0) return;
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
				scrollObserver = new IntersectionObserver((entries) => {
					if (entries.some((e) => e.isIntersecting)) loadMore();
				}, { rootMargin: opts.rootMargin });
				scrollObserver.observe(sentinel);
			}
		}
		async function loadMore() {
			if (loading || destroyed) return;
			if (opts.type === "authors" || opts.type === "labels") return;
			loading = true;
			try {
				if (usesBuffer) {
					const next = buffer.slice(visible.length, visible.length + opts.maxVisibleItems);
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
		async function load() {
			if (loading || destroyed) return;
			loading = true;
			const statusText = opts.type === "authors" ? "Loading authors..." : opts.type === "labels" ? "Loading labels..." : "Loading posts...";
			target.innerHTML = opts.loading(statusText);
			try {
				await opts.beforeFetch?.();
				if (opts.related && currentPostId && currentPostLabels.length === 0) currentPostLabels = (await blog.post(currentPostId))?.labels ?? [];
				if (opts.cache && opts.type === "posts") {
					const cached = readLocalCache(cacheKey, opts.cacheTTL);
					if (cached) {
						if (usesBuffer) buffer = cached;
						visible = [];
						const firstBatch = usesBuffer ? cached.slice(0, opts.maxVisibleItems) : cached;
						await opts.afterFetch?.(cached);
						renderEntries(firstBatch, false);
						loading = false;
						return;
					}
				}
				if (usesBuffer) {
					buffer = buffer.length ? buffer : await fetchBuffer();
					const filtered = currentQuery ? buffer.filter((e) => matchesQuery(e, currentQuery)) : buffer;
					await opts.afterFetch?.(filtered);
					if (opts.cache && opts.type === "posts") writeLocalCache(cacheKey, filtered);
					renderEntries(filtered.slice(0, opts.maxVisibleItems), false);
				} else {
					const { entries, nextPager } = await fetchNetworkBatch(null);
					pager = nextPager;
					await opts.afterFetch?.(entries);
					if (opts.cache && opts.type === "posts") writeLocalCache(cacheKey, entries);
					renderEntries(entries, false);
				}
			} catch (err) {
				target.innerHTML = opts.error(err instanceof Error ? err.message : String(err));
				opts.onError?.(err);
			} finally {
				loading = false;
			}
		}
		function mount() {
			if (mounted || destroyed) return;
			mounted = true;
			load();
		}
		mountObserver = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				mountObserver?.disconnect();
				mount();
			}
		}, { rootMargin: opts.rootMargin });
		mountObserver.observe(target);
		return {
			async refresh() {
				buffer = [];
				pager = null;
				visible = [];
				currentPostLabels = [];
				await load();
			},
			async setQuery(query) {
				currentQuery = query;
				if (opts.type === "authors" || opts.type === "labels") {
					await load();
					return;
				}
				if (opts.deepSearch) {
					pager = null;
					visible = [];
					await load();
					return;
				}
				renderEntries(buffer.filter((e) => matchesQuery(e, currentQuery)).slice(0, opts.maxVisibleItems), false);
			},
			destroy() {
				destroyed = true;
				mountObserver?.disconnect();
				scrollObserver?.disconnect();
				loadMoreBtn?.remove();
				sentinel?.remove();
				target.innerHTML = "";
			}
		};
	}

//#endregion
//#region src/browser/createWidget.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { createWidget });

//#endregion
exports.createWidget = createWidget;
return exports;
})({});