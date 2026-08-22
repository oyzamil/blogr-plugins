/*! blogr-plugins v0.0.4 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrRelatify = (function(exports) {

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
//#region src/utils/merge-options.ts
/**
	* Merges user-supplied options over a set of defaults, dropping any key
	* whose value is explicitly `undefined` first.
	*
	* Plain `{ ...defaults, ...options }` lets `{ someOption: undefined }` (e.g.
	* from a form field that's blank, or a variable that happens to be
	* `undefined`) silently overwrite a real default instead of falling back to
	* it — a common footgun. This closes that gap.
	*
	* @param defaultValues - The base/default option values.
	* @param options - User-supplied options; `undefined`-valued keys are ignored.
	* @returns A merged object with every default preserved unless the caller
	* gave it an actual (non-`undefined`) value.
	*/
	function mergeOptions(defaultValues, options) {
		const cleaned = {};
		for (const key of Object.keys(options)) if (options[key] !== void 0) cleaned[key] = options[key];
		return {
			...defaultValues,
			...cleaned
		};
	}

//#endregion
//#region src/utils/require-blogr.ts
/**
	* `blogr` is an external peer dependency for plugins that talk to the feed
	* API (currently {@link relatify} and {@link createWidget}) — it's no
	* longer bundled into their output, so it must be resolvable at runtime:
	*
	* - npm / ESM / CJS consumers get it from their own module graph
	*   (`npm install blogr`); a missing install fails at import time with
	*   Node/the bundler's own "Cannot find module" error.
	* - IIFE / browser consumers have no module system, so the external import
	*   is mapped to a `Blogr` global instead. If that script tag is missing
	*   or loaded in the wrong order, the import silently resolves to
	*   `undefined` rather than throwing — this check is what catches that
	*   case with an actionable message instead of a cryptic
	*   "Blogr is not a constructor" deep inside the plugin.
	*
	* @param ctor - The imported (or global-mapped) `Blogr` binding.
	* @param pluginName - Name of the calling plugin, used in the error message.
	* @throws If `ctor` isn't a usable constructor.
	*/
	function requireBlogr(ctor, pluginName) {
		if (typeof ctor === "function") return;
		throw new Error(`[blogr-plugins] ${pluginName}() requires the "blogr" package, but it wasn't found.\n  - npm / ESM / CJS: npm install blogr\n  - Browser / IIFE: load it as a separate script BEFORE this one:
      <script src="https://cdn.jsdelivr.net/npm/blogr"><\/script>`);
	}

//#endregion
//#region src/plugins/relatify.ts
	const defaults = {
		jsonp: true,
		labels: [],
		insertAfter: "p",
		excludeLabels: [],
		relevance: "strict",
		sampleSize: 20,
		linkClass: "relatify-link",
		lazy: true,
		rootMargin: "0px",
		template: (post, _index) => `<p>You may also like: <a href="${post.url}">${post.title}</a></p>`
	};
	const STOPWORDS = /* @__PURE__ */ new Set([
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
		"at"
	]);
	function tokenize(text) {
		return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((word) => word.length > 1 && !STOPWORDS.has(word));
	}
	function countWords(text) {
		return text.trim().split(/\s+/).filter(Boolean).length;
	}
	function defaultMaxLinks(wordCount) {
		return Math.max(1, Math.floor(wordCount / 500) + 1);
	}
	function detectCurrentUrl() {
		return (document.querySelector("link[rel=\"canonical\"]")?.href || location.href).split(/[?#]/)[0].replace(/\/$/, "");
	}
	function normalizeUrl(url) {
		return url.split(/[?#]/)[0].replace(/\/$/, "");
	}
	function normalize(post) {
		return {
			id: post.id,
			title: post.title,
			url: post.url,
			author: post.author?.name ?? "",
			published: post.published,
			labels: post.labels ?? [],
			content: post.summary ?? "",
			raw: post
		};
	}
	function shuffle(items) {
		const out = [...items];
		for (let i = out.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[out[i], out[j]] = [out[j], out[i]];
		}
		return out;
	}
	function findReferenceTitle(container) {
		return container.querySelector("h1, h2, h3")?.textContent?.trim() || document.title;
	}
	function scoreByRelevance(candidates, referenceTitle) {
		const referenceWords = new Set(tokenize(referenceTitle));
		if (referenceWords.size === 0) return candidates;
		return [...candidates].map((post) => {
			return {
				post,
				score: tokenize(post.title).filter((word) => referenceWords.has(word)).length
			};
		}).sort((a, b) => b.score - a.score).map((entry) => entry.post);
	}
	async function fetchCandidates(blog, searchLabels, sampleSize) {
		if (searchLabels.length === 0) return (await blog.posts({
			limit: sampleSize,
			orderBy: "published"
		})).items;
		const byId = /* @__PURE__ */ new Map();
		for (const label of searchLabels) {
			const pager = await blog.label(label, {
				limit: sampleSize,
				orderBy: "published"
			});
			for (const post of pager.items) byId.set(post.id, post);
		}
		return [...byId.values()];
	}
	function resolveOptions(options) {
		return mergeOptions({
			...defaults,
			labels: defaults.labels,
			maxLinks: void 0,
			blogUrl: void 0,
			currentUrl: void 0,
			lazy: defaults.lazy,
			rootMargin: defaults.rootMargin,
			beforeFetch: () => {},
			afterFetch: (_posts) => {},
			onInsert: (_detail) => {},
			onEmpty: () => {},
			onError: (err) => console.error("relatify:", err)
		}, options);
	}
	function createEngine(container, opts) {
		let cancelled = false;
		const inserted = [];
		const insertAfterSelector = Array.isArray(opts.insertAfter) ? opts.insertAfter.join(", ") : opts.insertAfter;
		const searchLabels = (opts.labels ?? []).filter((label) => !opts.excludeLabels.includes(label));
		const currentUrl = normalizeUrl(opts.currentUrl ?? detectCurrentUrl());
		requireBlogr(Blogr, "relatify");
		const blog = new Blogr(opts.blogUrl ?? location.origin, { jsonp: opts.jsonp });
		async function run() {
			opts.beforeFetch();
			const eligible = Array.from(container.querySelectorAll(insertAfterSelector));
			const wordCount = countWords(container.textContent ?? "");
			const linkCount = Math.min(opts.maxLinks ?? defaultMaxLinks(wordCount), eligible.length);
			if (linkCount <= 0 || eligible.length === 0) {
				opts.onEmpty();
				return;
			}
			let rawPosts;
			try {
				rawPosts = await fetchCandidates(blog, searchLabels, opts.sampleSize);
			} catch (err) {
				opts.onError(err);
				return;
			}
			if (cancelled) return;
			let candidates = rawPosts.map(normalize).filter((post) => normalizeUrl(post.url) !== currentUrl);
			candidates = opts.relevance === "strict" ? scoreByRelevance(candidates, findReferenceTitle(container)) : shuffle(candidates);
			const chosenPosts = candidates.slice(0, linkCount);
			if (chosenPosts.length === 0) {
				opts.onEmpty();
				return;
			}
			opts.afterFetch(chosenPosts);
			if (cancelled) return;
			shuffle(eligible).slice(0, chosenPosts.length).sort((a, b) => eligible.indexOf(a) - eligible.indexOf(b)).forEach((spot, index) => {
				const post = chosenPosts[index];
				const wrapper = document.createElement("div");
				wrapper.className = opts.linkClass;
				wrapper.innerHTML = opts.template(post, index);
				spot.insertAdjacentElement("afterend", wrapper);
				inserted.push(wrapper);
				opts.onInsert({
					post,
					element: wrapper,
					index
				});
			});
		}
		function initializeWithLazyLoad() {
			const eligible = container.querySelector(insertAfterSelector);
			if (!eligible) {
				opts.onEmpty();
				return;
			}
			const observer = new IntersectionObserver((entries) => {
				if (entries.some((entry) => entry.isIntersecting) && !cancelled) {
					observer.disconnect();
					run();
				}
			}, { rootMargin: opts.rootMargin });
			observer.observe(eligible);
		}
		if (opts.lazy) initializeWithLazyLoad();
		else run();
		return { destroy() {
			cancelled = true;
			for (const el of inserted.splice(0)) el.remove();
		} };
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
	* <\/script>
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
	function relatify(input, options = {}) {
		const opts = resolveOptions(options);
		const engines = resolveElements(input).map((container) => createEngine(container, opts));
		return { destroy() {
			for (const engine of engines) engine.destroy();
		} };
	}

//#endregion
//#region src/utils/jquery-bridge.ts
/**
	* Registers one jQuery plugin method (`$.fn[name]`) that wraps a Blogr
	* plugin function. Skips silently if jQuery isn't present or the method
	* already exists.
	*
	* @param jq - jQuery instance (`window.jQuery`).
	* @param name - Method name, e.g. `"stickify"`.
	* @param fn - Underlying plugin function `(elements, ...args) => PluginInstance`.
	*/
	function bindJQueryPlugin(jq, name, fn) {
		if (!jq || !jq.fn || jq.fn[name]) return;
		jq.fn[name] = function(...args) {
			const instance = fn(this.get(), ...args);
			this.data(`blogr-${name}`, instance);
			return this;
		};
	}
	/** True when jQuery is present on `window`. */
	function hasJQuery() {
		return typeof window !== "undefined" && typeof window.jQuery === "function";
	}

//#endregion
//#region src/browser/relatify.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { relatify });
	if (hasJQuery()) bindJQueryPlugin(window.jQuery, "relatify", (els, options) => relatify(els, options));

//#endregion
exports.relatify = relatify;
return exports;
})({});