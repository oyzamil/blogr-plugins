/*! blogr-plugins v0.0.1 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrPlugins = (function(exports) {

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
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
//#region src/plugins/avatarify.ts
	const defaults$11 = {
		timestampSelector: "",
		timestampAttribute: "",
		setRandomAvatarForAll: false,
		avatarStyle: "thumbs",
		emptyAvatarPatterns: [/(\/blank\.gif|\/blogger_logo_round_35\.png)$/],
		dicebearVersion: "10.x",
		avatarDataAttribute: "data-avatar",
		rootMargin: "0px",
		debounce: 150,
		onError: (message) => console.error(message)
	};
	function buildAvatarUrl(opts, seed) {
		const encoded = encodeURIComponent(seed);
		if (opts.apiUrl) return opts.apiUrl.replace("{seed}", encoded).replace("{style}", opts.avatarStyle);
		return `https://api.dicebear.com/${opts.dicebearVersion}/${opts.avatarStyle}/svg?seed=${encoded}`;
	}
	function isEmptyAvatar(currentValue, patterns) {
		if (!currentValue || currentValue === "none") return true;
		return patterns.some((pattern) => {
			if (pattern instanceof RegExp) return pattern.test(currentValue);
			return currentValue.includes(pattern);
		});
	}
	/** Reads the `background-image` CSS url currently rendered on the element (`"none"`/`""` if unset). */
	function extractBackgroundUrl(avatarEl) {
		const bg = getComputedStyle(avatarEl).getPropertyValue("background-image");
		const match = bg.match(/url\(["']?(.*?)["']?\)/);
		return match ? match[1] : bg;
	}
	/**
	* Reads whatever real image the element already knows about, checked in
	* order: `data-avatar` attr VALUE (Blogger/lazy-src style — holds the url
	* itself, not just a flag), then `src` for `<img>`, then rendered CSS
	* `background-image`.
	*/
	function extractCurrentUrl(avatarEl, isImg, dataAttribute) {
		const dataAvatar = avatarEl.getAttribute(dataAttribute);
		if (dataAvatar) return dataAvatar;
		if (isImg) return avatarEl.getAttribute("src") ?? "";
		return extractBackgroundUrl(avatarEl);
	}
	function applyAvatar(avatarEl, mode, url) {
		if (mode === "src") avatarEl.setAttribute("src", url);
		else avatarEl.style.setProperty("background-image", `url(${url})`, "important");
	}
	/**
	* Preload-probes `url`, fires `opts.onSuccess` once it actually finishes
	* loading (not just once it's assigned to the DOM). No-op if `onSuccess`
	* isn't set.
	*/
	function notifySuccess(url, counter, opts, base) {
		if (!opts.onSuccess) return;
		const index = counter.value++;
		const id = base.avatarEl.id || `avatar-${index}`;
		const probe = new Image();
		probe.onload = () => {
			opts.onSuccess?.({
				...base,
				url,
				index,
				id
			});
		};
		probe.src = url;
	}
	/**
	* Finds `selector` scoped to `from`'s own local siblings first, expanding
	* outward one ancestor at a time, capped at `boundary`. Fixes nested
	* replies picking up the PARENT comment's avatar: a plain
	* `commentEl.querySelector(avatarSelector)` returns the first match in the
	* whole subtree, which is always the outermost/main comment's avatar when
	* replies live inside the same comment wrapper. Starting local and
	* expanding out finds each comment's own avatar first.
	*/
	function findNearest(from, selector, boundary) {
		let scope = from.parentElement;
		while (scope) {
			const match = scope.querySelector(selector);
			if (match) return match;
			if (scope === boundary) break;
			scope = scope.parentElement;
		}
		return null;
	}
	/** Resolves + applies avatar for one comment. Called lazily, once per comment, when its avatar nears the viewport (or immediately via `refresh()`). */
	function processEntry(usernameEl, opts, counter) {
		const username = usernameEl.textContent?.trim();
		if (!username) return;
		const commentEl = usernameEl.closest(opts.commentSelector);
		if (!commentEl) {
			opts.onError(`avatarify: no ancestor found for commentSelector "${opts.commentSelector}".`);
			return;
		}
		const avatarEl = findNearest(usernameEl, opts.avatarSelector, commentEl);
		if (!avatarEl) {
			opts.onError(`avatarify: no elements found for avatarSelector "${opts.avatarSelector}".`);
			return;
		}
		if (avatarEl.dataset.avatarSet === "true") return;
		let timestamp = "";
		if (opts.timestampSelector) {
			const timestampEl = findNearest(usernameEl, opts.timestampSelector, commentEl);
			if (!timestampEl) opts.onError(`avatarify: no elements found for timestampSelector "${opts.timestampSelector}".`);
			else timestamp = opts.timestampAttribute ? timestampEl.getAttribute(opts.timestampAttribute) ?? "" : timestampEl.textContent?.trim() ?? "";
		}
		const isImg = avatarEl.tagName === "IMG";
		const hasDataAvatar = avatarEl.hasAttribute(opts.avatarDataAttribute);
		const mode = opts.avatarAttribute ?? (hasDataAvatar ? "background-image" : isImg ? "src" : "background-image");
		const naturalUrl = extractCurrentUrl(avatarEl, isImg, opts.avatarDataAttribute);
		const empty = isEmptyAvatar(naturalUrl, opts.emptyAvatarPatterns);
		if (!opts.setRandomAvatarForAll && !empty) {
			if ((mode === "src" ? avatarEl.getAttribute("src") ?? "" : extractBackgroundUrl(avatarEl)) !== naturalUrl) {
				applyAvatar(avatarEl, mode, naturalUrl);
				avatarEl.dataset.avatarSet = "true";
				opts.onAvatarSet?.({
					username,
					url: naturalUrl,
					usernameEl,
					avatarEl
				});
				notifySuccess(naturalUrl, counter, opts, {
					username,
					usernameEl,
					avatarEl
				});
			}
			return;
		}
		const url = buildAvatarUrl(opts, opts.seed ? opts.seed(username, timestamp) : opts.avatarStyle === "initials" ? username : `${username}${timestamp}`);
		applyAvatar(avatarEl, mode, url);
		avatarEl.dataset.avatarSet = "true";
		opts.onAvatarSet?.({
			username,
			url,
			usernameEl,
			avatarEl
		});
		notifySuccess(url, counter, opts, {
			username,
			usernameEl,
			avatarEl
		});
	}
	/** Finds not-yet-seen comments and starts watching each one's avatar for lazy load. Returns every username element found (seen or not) so `refresh()` can force-process the lot. */
	function discoverEntries(container, opts, avatarObserver, entryMap) {
		const usernameEls = container.querySelectorAll(opts.usernameSelector);
		if (usernameEls.length === 0) {
			opts.onError(`avatarify: no elements found for usernameSelector "${opts.usernameSelector}".`);
			return [];
		}
		const found = [];
		for (const usernameEl of usernameEls) {
			found.push(usernameEl);
			if (usernameEl.dataset.avatarifyObserved === "true") continue;
			usernameEl.dataset.avatarifyObserved = "true";
			const commentEl = usernameEl.closest(opts.commentSelector);
			const target = (commentEl ? findNearest(usernameEl, opts.avatarSelector, commentEl) : null) ?? commentEl ?? usernameEl;
			entryMap.set(target, usernameEl);
			avatarObserver.observe(target);
		}
		return found;
	}
	function resolveContainer(config) {
		if (config.container) {
			const el = resolveElements(config.container)[0];
			if (el) return el;
		}
		const byComment = document.querySelector(config.commentSelector);
		if (byComment) return byComment.parentElement ?? document.body;
		const byAvatar = document.querySelector(config.avatarSelector);
		if (byAvatar) return byAvatar.parentElement ?? document.body;
		return document.body;
	}
	function createEngine$2(container, opts, counter) {
		let debounceTimer = null;
		let destroyed = false;
		const entryMap = /* @__PURE__ */ new WeakMap();
		const avatarObserver = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				avatarObserver.unobserve(entry.target);
				const usernameEl = entryMap.get(entry.target);
				if (usernameEl) processEntry(usernameEl, opts, counter);
			}
		}, { rootMargin: opts.rootMargin });
		function discover() {
			if (destroyed) return [];
			return discoverEntries(container, opts, avatarObserver, entryMap);
		}
		function scheduleDiscover() {
			if (destroyed) return;
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				debounceTimer = null;
				discover();
			}, opts.debounce);
		}
		const mutationObserver = new MutationObserver(scheduleDiscover);
		mutationObserver.observe(container, {
			childList: true,
			subtree: true
		});
		container.addEventListener("toggle", (event) => {
			if (destroyed) return;
			const details = event.target;
			if (!(details instanceof HTMLDetailsElement) || !details.open) return;
			const usernameEls = details.querySelectorAll(opts.usernameSelector);
			for (const usernameEl of usernameEls) processEntry(usernameEl, opts, counter);
		}, true);
		discover();
		return {
			refresh() {
				if (debounceTimer) {
					clearTimeout(debounceTimer);
					debounceTimer = null;
				}
				const usernameEls = discover();
				for (const usernameEl of usernameEls) processEntry(usernameEl, opts, counter);
			},
			destroy() {
				destroyed = true;
				mutationObserver.disconnect();
				avatarObserver.disconnect();
				if (debounceTimer) clearTimeout(debounceTimer);
			}
		};
	}
	/**
	* Auto-generates a [DiceBear](https://www.dicebear.com) avatar for every
	* commenter who doesn't already have one — built for Blogger's native
	* comment widget, where anonymous/no-photo commenters get a blank
	* placeholder image. Each avatar lazy-loads independently (only fetched
	* once it nears the viewport) and a `MutationObserver` keeps watching so
	* comments added later — pagination, "load more", async widgets — get
	* avatars too.
	*
	* @param config - {@link AvatarifyConfig}
	* @returns An {@link AvatarifyInstance} — `destroy()` stops both observers
	* (already-set avatars are left in place); `refresh()` force-loads every
	* matched avatar immediately.
	*
	* @example
	* ```ts
	* import { avatarify } from "blogr-plugins";
	*
	* avatarify({
	* 	container: "#comments",
	* 	usernameSelector: ".cmHr .n bdi",
	* 	commentSelector: ".c",
	* 	timestampSelector: ".d.dtTm",
	* 	timestampAttribute: "data-datetime",
	* 	avatarSelector: ".cmAv .im",
	* 	setRandomAvatarForAll: true,
	* 	avatarStyle: "thumbs",
	* });
	* ```
	*/
	function avatarify(config) {
		const opts = mergeOptions(defaults$11, config);
		opts.usernameSelector = config.usernameSelector;
		opts.commentSelector = config.commentSelector;
		opts.avatarSelector = config.avatarSelector;
		opts.apiUrl = config.apiUrl;
		opts.seed = config.seed;
		opts.onAvatarSet = config.onAvatarSet;
		opts.onSuccess = config.onSuccess;
		opts.avatarAttribute = config.avatarAttribute;
		const counter = { value: 0 };
		const engines = (config.container ? resolveElements(config.container) : [resolveContainer(config)]).map((container) => createEngine$2(container, opts, counter));
		return {
			refresh() {
				for (const engine of engines) engine.refresh();
			},
			destroy() {
				for (const engine of engines) engine.destroy();
			}
		};
	}

//#endregion
//#region src/plugins/cookify.ts
/**
	* Small, dependency-free cookie utility (a typed replacement for the classic
	* `js-cookie` plugin). Values are JSON-encoded automatically, so you can
	* store strings, numbers, booleans, or plain objects/arrays.
	*
	* @example
	* ```ts
	* import { cookify } from "blogr-plugins";
	* cookify.set("theme", "dark", { expiresDays: 365 });
	* cookify.get("theme"); // "dark"
	* cookify.remove("theme");
	* ```
	*/
	const cookify = {
		/**
		* Writes a cookie.
		* @param name - Cookie name.
		* @param value - Any JSON-serializable value.
		* @param options - {@link CookifySetOptions}
		*/
		set(name, value, options = {}) {
			const encoded = encodeURIComponent(JSON.stringify(value));
			const parts = [`${encodeURIComponent(name)}=${encoded}`];
			if (options.expiresDays != null) {
				const date = /* @__PURE__ */ new Date();
				date.setTime(date.getTime() + options.expiresDays * 864e5);
				parts.push(`expires=${date.toUTCString()}`);
			}
			parts.push(`path=${options.path ?? "/"}`);
			if (options.domain) parts.push(`domain=${options.domain}`);
			if (options.secure) parts.push("secure");
			parts.push(`samesite=${options.sameSite ?? "Lax"}`);
			document.cookie = parts.join("; ");
		},
		/**
		* Reads a cookie.
		* @param name - Cookie name.
		* @returns The parsed value, or `undefined` if not set.
		*/
		get(name) {
			const target = encodeURIComponent(name);
			for (const pair of document.cookie ? document.cookie.split("; ") : []) {
				const idx = pair.indexOf("=");
				if ((idx === -1 ? pair : pair.slice(0, idx)) !== target) continue;
				const raw = idx === -1 ? "" : pair.slice(idx + 1);
				try {
					return JSON.parse(decodeURIComponent(raw));
				} catch {
					return decodeURIComponent(raw);
				}
			}
		},
		/**
		* Reads every cookie.
		* @returns A record of all cookies, parsed the same way as {@link cookify.get}.
		*/
		getAll() {
			const result = {};
			for (const pair of document.cookie ? document.cookie.split("; ") : []) {
				const idx = pair.indexOf("=");
				if (idx === -1) continue;
				const key = decodeURIComponent(pair.slice(0, idx));
				result[key] = this.get(key);
			}
			return result;
		},
		/**
		* Deletes a cookie.
		* @param name - Cookie name.
		* @param options - Must match the `path`/`domain` used when setting it.
		* @returns `true` if the cookie was present beforehand.
		*/
		remove(name, options = {}) {
			const existed = this.get(name) !== void 0;
			this.set(name, "", {
				...options,
				expiresDays: -1
			});
			return existed;
		}
	};

//#endregion
//#region node_modules/blogr/dist/blogr.esm.js
/*! blogr v0.0.1 - es | M.Muzammil <https://muzammil.work/> | MIT License */
	function _typeof(o) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof(o);
	}
	function toPrimitive(t, r) {
		if ("object" != _typeof(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r || "default");
			if ("object" != _typeof(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	function toPropertyKey(t) {
		var i = toPrimitive(t, "string");
		return "symbol" == _typeof(i) ? i : i + "";
	}
	function _defineProperty(e, r, t) {
		return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	/** Base error type for all errors thrown by blogr. */
	var BloggerError = class extends Error {
		constructor(message, options) {
			super(message, options);
			this.name = "BloggerError";
		}
	};
	/** Thrown when a network/HTTP request fails or returns a non-2xx status. */
	var BloggerRequestError = class extends BloggerError {
		constructor(message, url, status = null, options) {
			super(message, options);
			_defineProperty(this, "url", void 0);
			_defineProperty(this, "status", void 0);
			this.name = "BloggerRequestError";
			this.url = String(url);
			this.status = status;
		}
	};
	/** Thrown when constructor/method arguments are invalid. */
	var BloggerValidationError = class extends BloggerError {
		constructor(message) {
			super(message);
			this.name = "BloggerValidationError";
		}
	};
	function isString(input) {
		return typeof input === "string";
	}
	function isArray(input) {
		return Array.isArray(input);
	}
	function isObject(input) {
		return typeof input === "object" && input !== null && !isArray(input);
	}
	function isUndefined(input) {
		return typeof input === "undefined";
	}
	function assertNonBlankString(input, name) {
		if (!isString(input) || input.trim().length === 0) throw new BloggerValidationError(`${name} must be a non-empty string`);
	}
	function getNested(obj, ...path) {
		let current = obj;
		for (const key of path) {
			if (!isObject(current) && !isArray(current)) return void 0;
			current = current[key];
		}
		return current;
	}
	function trailingSlash(url) {
		return url.endsWith("/") ? url : `${url}/`;
	}
	/** Turns a `Date | string` value into an ISO 8601 string. */
	function toISOString(value) {
		return value instanceof Date ? value.toISOString() : value;
	}
	let lastTime = 0;
	let counter = 0;
	/** Generates a short, monotonically-unique id (used for JSONP callback names). */
	function generateId() {
		const now = Date.now();
		if (now === lastTime) counter += 1;
		else {
			lastTime = now;
			counter = 0;
		}
		return `${now}_${counter}`;
	}
	/** Builds `start-index` from a 1-based `page` + `limit`, Blogger-style (1-based). */
	function pageToStartIndex(page, limit) {
		return (Math.max(1, page) - 1) * limit + 1;
	}
	function getLinks(linkArray) {
		const links = [];
		let href = null;
		if (isArray(linkArray)) for (const link of linkArray) {
			const rel = getNested(link, "rel");
			const linkHref = getNested(link, "href");
			const type = getNested(link, "type");
			const title = getNested(link, "title");
			if (isString(rel) && isString(linkHref)) {
				links.push({
					rel,
					href: linkHref,
					type: isString(type) ? type : null,
					title: isString(title) ? title : null
				});
				if (rel === "alternate" && type === "text/html") href = linkHref;
			}
		}
		return {
			alternate: href,
			links
		};
	}
	function getPagination(feed) {
		const result = {
			self: null,
			previous: null,
			next: null
		};
		const { links } = getLinks(getNested(feed, "link"));
		for (const { rel, href, type } of links) {
			if (type === "text/html") continue;
			if (rel === "self") result.self = href;
			else if (rel === "previous") result.previous = href;
			else if (rel === "next") result.next = href;
		}
		return result;
	}
	function getLabels(categoryArray) {
		const labels = [];
		if (isArray(categoryArray)) for (const category of categoryArray) {
			const term = getNested(category, "term");
			if (isString(term)) labels.push(term);
		}
		return labels;
	}
	function getGeo(entry) {
		const [box, featureName, point] = [
			"georss$box",
			"georss$featurename",
			"georss$point"
		].map((key) => {
			const value = getNested(entry, key, "$t");
			return isString(value) ? value : null;
		});
		return {
			box: box ?? null,
			featureName: featureName ?? null,
			point: point ?? null
		};
	}
	function getPostComments(linkArray) {
		const result = {
			feed: null,
			number: null,
			title: null
		};
		const replies = getLinks(linkArray).links.filter((l) => l.rel === "replies");
		for (const { title, type, href } of replies) if (type === "text/html" && isString(title)) {
			const match = title.match(/\d+/);
			result.title = title;
			result.number = match ? Number.parseInt(match[0], 10) : 0;
		} else if (type === "application/atom+xml" && isString(href)) result.feed = href;
		return result;
	}
	function getAuthors(authorArray) {
		const authors = [];
		if (isArray(authorArray)) for (const author of authorArray) {
			const name = getNested(author, "name", "$t");
			const uri = getNested(author, "uri", "$t");
			const image = getNested(author, "gd$image", "src");
			authors.push({
				name: isString(name) ? name : null,
				url: isString(uri) ? uri : null,
				image: isString(image) && image.trim().toLowerCase() !== "https://img1.blogblog.com/img/b16-rounded.gif" ? image : null
			});
		}
		return authors;
	}
	const EMPTY_AUTHOR = {
		name: null,
		url: null,
		image: null
	};
	function getExtended(entry) {
		const result = {
			class: null,
			time: null,
			removed: false
		};
		const list = getNested(entry, "gd$extendedProperty");
		if (isArray(list)) for (const item of list) {
			const name = getNested(item, "name");
			const value = getNested(item, "value");
			if (!isString(name) || !isString(value)) continue;
			if (name === "blogger.itemClass") result.class = value;
			else if (name === "blogger.displayTime") result.time = value;
			else if (name === "blogger.contentRemoved") result.removed = value === "true";
		}
		return result;
	}
	function getThumbnail(entry) {
		const media = getNested(entry, "media$thumbnail", "url");
		const thumbnail = isString(media) ? media : null;
		if (thumbnail !== null) return [thumbnail, thumbnail];
		const content = getNested(entry, "content", "$t");
		const summary = getNested(entry, "summary", "$t");
		const html = isString(content) ? content : isString(summary) ? summary : null;
		return [null, (html ? /<img\s+(.*?)src=(["'])([^"']+?)\2(.*?)\/?>/i.exec(html) : null)?.[3] ?? null];
	}
	function getOpenSearchNumber(feed, key) {
		const value = getNested(feed, key, "$t");
		return isString(value) ? Number(value) : null;
	}
	function getBlog(feed) {
		const id = getNested(feed, "id", "$t");
		const title = getNested(feed, "title", "$t");
		const subtitle = getNested(feed, "subtitle", "$t");
		const updated = getNested(feed, "updated", "$t");
		const language = getNested(feed, "title", "lang");
		const { alternate, links } = getLinks(getNested(feed, "link"));
		if (isObject(feed) && isString(id) && isString(title) && isString(updated) && isString(alternate)) {
			let favicon = null;
			try {
				favicon = new URL("/favicon.ico", alternate).toString();
			} catch {
				favicon = null;
			}
			return {
				id: id.replace(/^.*blog-(\d+).*$/, "$1"),
				title,
				subtitle: isString(subtitle) ? subtitle : null,
				labels: getLabels(getNested(feed, "category")),
				url: alternate,
				language: isString(language) ? language : null,
				links,
				updated,
				author: getAuthors(getNested(feed, "author"))[0] ?? EMPTY_AUTHOR,
				favicon
			};
		}
		return null;
	}
	function getPost(entry) {
		const id = getNested(entry, "id", "$t");
		const title = getNested(entry, "title", "$t");
		const published = getNested(entry, "published", "$t");
		const updated = getNested(entry, "updated", "$t");
		const summary = getNested(entry, "summary", "$t");
		const content = getNested(entry, "content", "$t");
		const linkArray = getNested(entry, "link");
		const { alternate, links } = getLinks(linkArray);
		if (isObject(entry) && isString(alternate) && isString(id) && isString(title) && isString(published) && isString(updated)) {
			const [thumbnail, thumbnailAlt] = getThumbnail(entry);
			return {
				id: id.replace(/^.*(?:page|post)-(\d+)$/, "$1"),
				title,
				published,
				updated,
				labels: getLabels(getNested(entry, "category")),
				url: alternate,
				links,
				author: getAuthors(getNested(entry, "author"))[0] ?? EMPTY_AUTHOR,
				thumbnail,
				thumbnailAlt,
				summary: isString(summary) ? summary : null,
				content: isString(content) ? content : null,
				comments: getPostComments(linkArray),
				geo: getGeo(entry)
			};
		}
		return null;
	}
	function getComment(entry) {
		const id = getNested(entry, "id", "$t");
		const title = getNested(entry, "title", "$t");
		const published = getNested(entry, "published", "$t");
		const updated = getNested(entry, "updated", "$t");
		const inReplyTo = getNested(entry, "thr$in-reply-to");
		const inReplyToHref = getNested(inReplyTo, "href");
		const inReplyToRef = getNested(inReplyTo, "ref");
		const summary = getNested(entry, "summary", "$t");
		const content = getNested(entry, "content", "$t");
		const { alternate, links } = getLinks(getNested(entry, "link"));
		if (isObject(entry) && isString(alternate) && isString(id) && isString(title) && isString(published) && isString(updated) && isString(inReplyToHref) && isString(inReplyToRef)) {
			const inReplyToMatch = links.find((l) => l.rel === "related")?.href.match(/\/feeds\/(.*)\/comments\/[^/]+\/(\d+)/);
			return {
				id: id.replace(/^.*(?:page|post|comment)-(\d+)$/, "$1"),
				title,
				published,
				updated,
				url: alternate,
				links,
				author: getAuthors(getNested(entry, "author"))[0] ?? EMPTY_AUTHOR,
				summary: isString(summary) ? summary : null,
				content: isString(content) ? content : null,
				extended: getExtended(entry),
				post: {
					id: inReplyToRef.replace(/^.*(?:page|post)-(\d+)$/, "$1"),
					url: inReplyToHref.split("?")[0] ?? inReplyToHref
				},
				inReplyTo: inReplyToMatch?.[2] ?? null
			};
		}
		return null;
	}
	function getEntries(entryArray) {
		if (!isArray(entryArray)) return {
			posts: null,
			comments: null
		};
		const posts = [];
		const comments = [];
		for (const entry of entryArray) {
			if (!isObject(entry)) continue;
			if ("thr$in-reply-to" in entry) {
				const comment = getComment(entry);
				if (comment) comments.push(comment);
			} else {
				const post = getPost(entry);
				if (post) posts.push(post);
			}
		}
		return {
			posts,
			comments
		};
	}
	function getEntryArray(input) {
		if (isArray(input)) return input;
		if (isObject(input)) return [input];
		return null;
	}
	/**
	* Parses a raw Blogger GData JSON response (the shape returned by
	* `?alt=json`) into a typed {@link ParsedFeed}.
	*
	* Accepts either `{ feed: { entry } }` (a full feed response) or
	* `{ entry }` (a single-entry response).
	*/
	function parseFeed(input) {
		const feedObject = getNested(input, "feed");
		const root = isObject(feedObject) ? feedObject : input;
		const { posts, comments } = getEntries(getEntryArray(getNested(root, "entry")));
		const pagination = getPagination(isObject(feedObject) ? feedObject : void 0);
		return {
			blog: getBlog(isObject(feedObject) ? feedObject : void 0),
			links: getLinks(getNested(root, "link")).links,
			posts,
			comments,
			itemsPerPage: getOpenSearchNumber(root, "openSearch$itemsPerPage"),
			startIndex: getOpenSearchNumber(root, "openSearch$startIndex"),
			totalResults: getOpenSearchNumber(root, "openSearch$totalResults"),
			selfUrl: pagination.self,
			previousUrl: pagination.previous,
			nextUrl: pagination.next
		};
	}
	/**
	* A tiny in-memory cache keyed by request URL. Disabled by default —
	* call {@link Cache.enable} to turn it on.
	*/
	var Cache = class {
		constructor() {
			_defineProperty(this, "enabled", false);
			_defineProperty(this, "store", /* @__PURE__ */ new Map());
			_defineProperty(this, "ttlMs", null);
		}
		/** Enables caching. Optionally pass a TTL in milliseconds. */
		enable(options = {}) {
			this.enabled = true;
			this.ttlMs = options.ttlMs ?? null;
			return this;
		}
		/** Disables caching (existing entries are kept, but bypassed until re-enabled). */
		disable() {
			this.enabled = false;
			return this;
		}
		/** Clears every cached entry. */
		clear() {
			this.store.clear();
			return this;
		}
		get isEnabled() {
			return this.enabled;
		}
		get(key) {
			if (!this.enabled) return void 0;
			const entry = this.store.get(key);
			if (!entry) return void 0;
			if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
				this.store.delete(key);
				return;
			}
			return entry.value;
		}
		set(key, value) {
			if (!this.enabled) return;
			this.store.set(key, {
				value,
				expiresAt: this.ttlMs !== null ? Date.now() + this.ttlMs : null
			});
		}
	};
	/** A minimal, dependency-free, typed event emitter. */
	var EventEmitter = class {
		constructor() {
			_defineProperty(this, "listeners", /* @__PURE__ */ new Map());
		}
		on(event, listener) {
			let set = this.listeners.get(event);
			if (!set) {
				set = /* @__PURE__ */ new Set();
				this.listeners.set(event, set);
			}
			set.add(listener);
			return this;
		}
		off(event, listener) {
			this.listeners.get(event)?.delete(listener);
			return this;
		}
		once(event, listener) {
			const wrapped = (payload) => {
				this.off(event, wrapped);
				listener(payload);
			};
			return this.on(event, wrapped);
		}
		emit(event, payload) {
			const set = this.listeners.get(event);
			if (!set) return;
			for (const listener of set) listener(payload);
		}
	};
	/** Global namespace used to stash pending JSONP callbacks in the browser. */
	const JSONP_NAMESPACE = "__blogr_jsonp__";
	/** Maps our friendly option names to Blogger's actual query param names. */
	const PARAM_MAP = {
		limit: "max-results",
		startIndex: "start-index",
		orderBy: "orderby",
		publishedMin: "published-min",
		publishedMax: "published-max",
		updatedMin: "updated-min",
		updatedMax: "updated-max",
		query: "q"
	};
	const KNOWN_KEYS = Object.keys(PARAM_MAP);
	/** Builds a feed URL from a base + path + friendly query options. */
	function buildUrl(path, base, { format = "json", query, callback } = {}) {
		const url = new URL(path, base);
		if (query) for (const key of KNOWN_KEYS) {
			const value = query[key];
			if (value === void 0) continue;
			const mapped = PARAM_MAP[key];
			const stringValue = value instanceof Date ? toISOString(value) : String(value);
			url.searchParams.set(mapped, stringValue);
		}
		if (format === "atom") url.searchParams.delete("alt");
		else if (format === "rss") url.searchParams.set("alt", "rss");
		else if (format === "jsonp") {
			url.searchParams.set("alt", "json-in-script");
			if (callback) url.searchParams.set("callback", callback);
		} else url.searchParams.set("alt", "json");
		url.searchParams.set("redirect", "false");
		return url;
	}
	/** Fetches and returns parsed JSON from `url`. */
	async function fetchJSON(url, { signal } = {}) {
		let response;
		try {
			response = await fetch(url, { signal });
		} catch (error) {
			throw new BloggerRequestError(`Network request failed for '${String(url)}'`, url, null, { cause: error });
		}
		if (!response.ok) {
			await response.body?.cancel().catch(() => {});
			throw new BloggerRequestError(`Request failed with status ${response.status} for '${response.url}'`, response.url, response.status);
		}
		return await response.json();
	}
	/** Fetches raw text (used for atom/rss formats) from `url`. */
	async function fetchText(url, { signal } = {}) {
		let response;
		try {
			response = await fetch(url, { signal });
		} catch (error) {
			throw new BloggerRequestError(`Network request failed for '${String(url)}'`, url, null, { cause: error });
		}
		if (!response.ok) {
			await response.body?.cancel().catch(() => {});
			throw new BloggerRequestError(`Request failed with status ${response.status} for '${response.url}'`, response.url, response.status);
		}
		return response.text();
	}
	const jsonpQueue = {};
	/**
	* Fetches JSONP data by injecting a `<script>` tag. Browser-only; will
	* throw when `window`/`document` are unavailable.
	*/
	async function fetchJSONP(getUrl, { signal } = {}) {
		if (typeof window !== "object" || typeof document !== "object") throw new BloggerError("JSONP is only supported in browser environments");
		return new Promise((resolvePromise, rejectPromise) => {
			var _ref;
			let settled = false;
			const resolve = (value) => {
				if (!settled) {
					settled = true;
					resolvePromise(value);
				}
			};
			const reject = (error) => {
				if (!settled) {
					settled = true;
					rejectPromise(error);
				}
			};
			if (signal?.aborted) {
				reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
				return;
			}
			const id = `callback_${generateId()}`;
			const url = getUrl({
				callback: `window.${JSONP_NAMESPACE}.${id}`,
				id
			});
			const script = document.createElement("script");
			script.async = true;
			script.src = String(url);
			const cleanup = () => {
				delete jsonpQueue[id];
				signal?.removeEventListener("abort", onAbort);
				script.onerror = null;
				script.onload = null;
				script.remove();
			};
			const onAbort = () => {
				jsonpQueue[id] = () => {};
				reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
			};
			signal?.addEventListener("abort", onAbort, { once: true });
			jsonpQueue[id] = (data) => resolve(data);
			script.onload = () => {
				cleanup();
				if (!settled) reject(new BloggerError(`JSONP callback was not invoked for '${script.src}'`));
			};
			script.onerror = () => {
				cleanup();
				reject(new BloggerError(`Failed to load script '${script.src}'`));
			};
			(_ref = window)["__blogr_jsonp__"] ?? (_ref["__blogr_jsonp__"] = jsonpQueue);
			document.head.appendChild(script);
		});
	}
	function getServiceBase(blogId) {
		return `https://www.blogger.com/feeds/${blogId}/`;
	}
	function getDomainBase(origin) {
		return `${trailingSlash(origin)}feeds/`;
	}
	/**
	* Resolves a blog URL or numeric id into request base URLs, and performs
	* (optionally cached, event-emitting) requests against the Blogger feed API.
	*/
	var Client = class {
		constructor(urlOrId, options = {}) {
			_defineProperty(this, "events", new EventEmitter());
			_defineProperty(this, "cache", new Cache());
			_defineProperty(this, "jsonp", void 0);
			_defineProperty(this, "base", void 0);
			_defineProperty(this, "blogId", void 0);
			_defineProperty(this, "blogUrl", void 0);
			_defineProperty(this, "blogInfoPromise", void 0);
			if (isString(urlOrId) && /^\d{10,24}$/.test(urlOrId)) {
				this.blogId = urlOrId;
				this.base = getServiceBase(urlOrId);
			} else {
				let url = null;
				if (urlOrId instanceof URL) url = urlOrId;
				else if (isString(urlOrId)) try {
					url = new URL(/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(urlOrId) ? urlOrId : `https://${urlOrId}`);
				} catch {
					url = null;
				}
				if (!url) throw new BloggerValidationError("'urlOrId' must be a valid blog URL, numeric blog id, or URL instance");
				if (!/^https?:$/i.test(url.protocol)) throw new BloggerValidationError(`Unsupported protocol '${url.protocol}'`);
				this.blogUrl = trailingSlash(url.origin);
				this.base = getDomainBase(url.origin);
			}
			this.jsonp = options.jsonp === true;
			if (this.jsonp && (typeof window !== "object" || typeof document !== "object")) throw new BloggerValidationError("options.jsonp is true but the current environment does not support it");
		}
		/** Resolves (and caches) blog-level metadata, needed to discover id/url lazily. */
		async getBlogInfo(options = {}) {
			this.blogInfoPromise ?? (this.blogInfoPromise = this.req("./posts/summary", {
				params: { limit: 0 },
				signal: options.signal
			}).then((feed) => feed.blog));
			const blog = await this.blogInfoPromise;
			if (!blog) {
				this.blogInfoPromise = void 0;
				throw new BloggerValidationError("Blog could not be found for the given url/id");
			}
			return blog;
		}
		async getBlogId() {
			if (!this.blogId) this.blogId = (await this.getBlogInfo()).id;
			return this.blogId;
		}
		async getBlogUrl() {
			if (!this.blogUrl) this.blogUrl = trailingSlash((await this.getBlogInfo()).url);
			return this.blogUrl;
		}
		async getDomainBase() {
			return getDomainBase(await this.getBlogUrl());
		}
		async getServiceBase() {
			return getServiceBase(await this.getBlogId());
		}
		/** Returns the raw feed URL for `path` without performing a request. */
		resolveUrl(path, options = {}) {
			return buildUrl(path, options.base ?? this.base, {
				format: options.format,
				query: options.params
			});
		}
		/** Performs a request against the Blogger feed API and returns the parsed feed. */
		async req(path, options = {}) {
			const format = options.format ?? (this.jsonp ? "jsonp" : "json");
			const base = options.base ?? this.base;
			if (format === "jsonp") {
				const url = buildUrl(path, base, {
					format,
					query: options.params
				});
				const cacheKey = String(url);
				const cached = this.cache.get(cacheKey);
				if (cached) return cached;
				this.events.emit("request", {
					url: cacheKey,
					method: "JSONP"
				});
				const started = Date.now();
				try {
					const data = await fetchJSONP(({ callback }) => {
						const withCallback = new URL(url);
						withCallback.searchParams.set("callback", callback);
						return withCallback;
					}, { signal: options.signal });
					this.events.emit("response", {
						url: cacheKey,
						status: 200,
						durationMs: Date.now() - started
					});
					const parsed = parseFeed(data);
					this.cache.set(cacheKey, parsed);
					return parsed;
				} catch (error) {
					this.events.emit("error", {
						url: cacheKey,
						error
					});
					throw error;
				}
			}
			const url = buildUrl(path, base, {
				format: "json",
				query: options.params
			});
			const cacheKey = String(url);
			const cached = this.cache.get(cacheKey);
			if (cached) return cached;
			this.events.emit("request", {
				url: cacheKey,
				method: "GET"
			});
			const started = Date.now();
			try {
				const data = await fetchJSON(url, { signal: options.signal });
				this.events.emit("response", {
					url: cacheKey,
					status: 200,
					durationMs: Date.now() - started
				});
				const parsed = parseFeed(data);
				this.cache.set(cacheKey, parsed);
				return parsed;
			} catch (error) {
				this.events.emit("error", {
					url: cacheKey,
					error
				});
				throw error;
			}
		}
		/** Fetches a feed url in `atom` or `rss` format and returns the raw XML text. */
		async reqRaw(path, format, options = {}) {
			const url = buildUrl(path, options.base ?? this.base, {
				format,
				query: options.params
			});
			const cacheKey = String(url);
			const cached = this.cache.get(cacheKey);
			if (cached !== void 0) return cached;
			this.events.emit("request", {
				url: cacheKey,
				method: "GET"
			});
			const started = Date.now();
			try {
				const text = await fetchText(url, { signal: options.signal });
				this.events.emit("response", {
					url: cacheKey,
					status: 200,
					durationMs: Date.now() - started
				});
				this.cache.set(cacheKey, text);
				return text;
			} catch (error) {
				this.events.emit("error", {
					url: cacheKey,
					error
				});
				throw error;
			}
		}
		/** Low-level: fetch an arbitrary URL and return parsed JSON (no feed parsing). */
		async fetchRaw(url, options = {}) {
			this.events.emit("request", {
				url: String(url),
				method: "GET"
			});
			const started = Date.now();
			try {
				const data = await fetchJSON(url, options);
				this.events.emit("response", {
					url: String(url),
					status: 200,
					durationMs: Date.now() - started
				});
				return data;
			} catch (error) {
				this.events.emit("error", {
					url: String(url),
					error
				});
				throw error;
			}
		}
	};
	function yearRange(year) {
		return [new Date(Date.UTC(year, 0, 1)), new Date(Date.UTC(year + 1, 0, 1))];
	}
	function monthRange(year, month) {
		return [new Date(Date.UTC(year, month - 1, 1)), new Date(Date.UTC(year, month, 1))];
	}
	/**
	* Year/month archive browsing. Blogger's public feed API has no dedicated
	* archive endpoint, so this is built on top of `publishedMin`/`publishedMax`
	* range queries against the posts feed.
	*/
	var ArchiveModule = class {
		constructor(posts) {
			this.posts = posts;
		}
		/** Lists posts published in `year`. */
		async year(year, options = {}, requestOptions = {}) {
			const [publishedMin, publishedMax] = yearRange(year);
			return this.posts.list({
				...options,
				publishedMin,
				publishedMax
			}, requestOptions);
		}
		/** Lists posts published in `month` (1-based) of `year`. */
		async month(year, month, options = {}, requestOptions = {}) {
			const [publishedMin, publishedMax] = monthRange(year, month);
			return this.posts.list({
				...options,
				publishedMin,
				publishedMax
			}, requestOptions);
		}
		/**
		* Returns every year that has at least one post, newest first.
		*
		* Determined by locating the newest and oldest post (via `totalResults`
		* + `startIndex`), since there's no direct "list of years" endpoint.
		*/
		async years(requestOptions = {}) {
			const first = await this.posts.list({ limit: 1 }, requestOptions);
			if (first.items.length === 0 || first.totalResults === null) return [];
			const newestYear = new Date(first.items[0].published).getUTCFullYear();
			const last = await this.posts.list({
				startIndex: first.totalResults,
				limit: 1
			}, requestOptions);
			const oldestYear = last.items[0] ? new Date(last.items[0].published).getUTCFullYear() : newestYear;
			const years = [];
			for (let y = newestYear; y >= oldestYear; y -= 1) years.push(y);
			return years;
		}
	};
	/**
	* Lists distinct post authors. Blogger's feed API has no dedicated authors
	* endpoint, so this aggregates authors seen across up to `sampleSize`
	* (default 150) of the blog's most recent posts.
	*/
	var AuthorsModule = class {
		constructor(posts) {
			this.posts = posts;
		}
		async list(options = {}, requestOptions = {}) {
			const page = await this.posts.list({
				limit: options.sampleSize ?? 150,
				summary: true
			}, requestOptions);
			const seen = /* @__PURE__ */ new Map();
			for (const post of page.items) {
				const key = post.author.url ?? post.author.name ?? "unknown";
				if (!seen.has(key)) seen.set(key, post.author);
			}
			return [...seen.values()];
		}
	};
	/** Builds a {@link Pager} for `items` out of a parsed feed's pagination fields. */
	function paginate(client, feed, items) {
		return {
			items,
			itemsPerPage: feed.itemsPerPage,
			startIndex: feed.startIndex,
			totalResults: feed.totalResults,
			selfUrl: feed.selfUrl,
			hasNext: feed.nextUrl !== null,
			hasPrevious: feed.previousUrl !== null,
			async next(options) {
				if (!feed.nextUrl) return null;
				const nextFeed = await client.req(feed.nextUrl, { signal: options?.signal });
				return paginate(client, nextFeed, nextFeed.posts ?? nextFeed.comments ?? []);
			},
			async previous(options) {
				if (!feed.previousUrl) return null;
				const prevFeed = await client.req(feed.previousUrl, { signal: options?.signal });
				return paginate(client, prevFeed, prevFeed.posts ?? prevFeed.comments ?? []);
			}
		};
	}
	/** Translates friendly list options (`page`, `limit`, ...) into raw query params. */
	function toQueryOptions(options = {}) {
		const limit = options.limit ?? 25;
		let startIndex = options.startIndex;
		if (startIndex === void 0 && options.page !== void 0) startIndex = pageToStartIndex(options.page, limit);
		return {
			limit,
			startIndex,
			orderBy: options.orderBy,
			publishedMin: options.publishedMin,
			publishedMax: options.publishedMax,
			updatedMin: options.updatedMin,
			updatedMax: options.updatedMax,
			query: options.query
		};
	}
	/** Methods for listing and fetching comments. */
	var CommentsModule = class {
		constructor(client) {
			this.client = client;
		}
		/** Lists comments for the whole blog, or for a single post when `options.postId` is set. */
		async list(options = {}, requestOptions = {}) {
			const { postId } = options;
			if (!isUndefined(postId)) assertNonBlankString(postId, "options.postId");
			const path = `./${postId ? `${encodeURIComponent(postId)}/` : ""}comments/${options.summary ? "summary" : "default"}`;
			const feed = await this.client.req(path, {
				params: toQueryOptions(options),
				signal: requestOptions.signal
			});
			let comments = feed.comments ?? [];
			if (postId) comments = comments.filter((c) => c.post.id === postId);
			return paginate(this.client, feed, comments);
		}
		/**
		* Fetches a single comment by id.
		*
		* Passing `postId` performs one direct request. Without it, this scans
		* the blog-level comments feed (in pages of `scanPageSize`, up to
		* `maxScan` comments) since Blogger's feed API has no id-only comment
		* lookup — prefer passing `postId` when you have it.
		*/
		async get(commentId, postId, options = {}, requestOptions = {}) {
			assertNonBlankString(commentId, "commentId");
			if (postId) {
				assertNonBlankString(postId, "postId");
				const feed = await this.client.req(`./${encodeURIComponent(postId)}/comments/default/${encodeURIComponent(commentId)}`, {
					base: await this.client.getServiceBase(),
					signal: requestOptions.signal
				});
				return feed.comments?.find((c) => c.id === commentId) ?? feed.comments?.[0] ?? null;
			}
			const scanPageSize = options.scanPageSize ?? 100;
			const maxScan = options.maxScan ?? 500;
			let startIndex = 1;
			while (startIndex <= maxScan) {
				const page = await this.list({
					startIndex,
					limit: scanPageSize
				}, { signal: requestOptions.signal });
				const found = page.items.find((c) => c.id === commentId);
				if (found) return found;
				if (!page.hasNext || page.items.length === 0) break;
				startIndex += scanPageSize;
			}
			return null;
		}
	};
	function pathFor(type, summary) {
		return `./${type ?? "posts"}/${summary ? "summary" : "default"}`;
	}
	/** Fetches the blog's feed in any of Blogger's supported wire formats. */
	var FeedModule = class {
		constructor(client) {
			this.client = client;
		}
		/** Fetches and parses the feed as JSON (default transport). */
		async json(options = {}, requestOptions = {}) {
			return this.client.req(pathFor(options.type, options.summary), {
				params: toQueryOptions(options),
				format: "json",
				signal: requestOptions.signal
			});
		}
		/** Fetches the feed as raw Atom XML text. */
		async atom(options = {}, requestOptions = {}) {
			return this.client.reqRaw(pathFor(options.type, options.summary), "atom", {
				params: toQueryOptions(options),
				signal: requestOptions.signal
			});
		}
		/** Fetches the feed as raw RSS 2.0 XML text. */
		async rss(options = {}, requestOptions = {}) {
			return this.client.reqRaw(pathFor(options.type, options.summary), "rss", {
				params: toQueryOptions(options),
				signal: requestOptions.signal
			});
		}
		/** Fetches and parses the feed over JSONP (browser-only; requires `jsonp: true`). */
		async jsonp(options = {}, requestOptions = {}) {
			return this.client.req(pathFor(options.type, options.summary), {
				params: toQueryOptions(options),
				format: "jsonp",
				signal: requestOptions.signal
			});
		}
	};
	function resolveHtml(input) {
		if (input === null || input === void 0) return "";
		if (typeof input === "string") return input;
		return input.content ?? input.summary ?? "";
	}
	const ENTITIES = {
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&quot;": "\"",
		"&#39;": "'",
		"&apos;": "'",
		"&nbsp;": " "
	};
	function decodeEntities(text) {
		return text.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16))).replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => ENTITIES[m] ?? m);
	}
	/** Strips HTML tags and decodes entities, collapsing whitespace into a plain-text string. */
	function htmlToText(input) {
		const html = resolveHtml(input);
		if (!html) return "";
		return decodeEntities(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").replace(/[ \t]*\n[ \t]*/g, "\n").trim();
	}
	/**
	* Best-effort HTML → Markdown conversion for Blogger post content. Handles
	* the common tags Blogger emits: headings, paragraphs, bold/italic, links,
	* images, lists, blockquotes and inline/block code.
	*/
	function htmlToMarkdown(input) {
		let html = resolveHtml(input);
		if (!html) return "";
		html = html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
		html = html.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
			return `\n${"#".repeat(Number(level))} ${stripInline(text)}\n\n`;
		});
		html = html.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => {
			return `\n${stripInline(text).trim().split("\n").map((l) => `> ${l}`).join("\n")}\n\n`;
		});
		html = html.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, text) => {
			return `\n\`\`\`\n${decodeEntities(text.replace(/<[^>]+>/g, ""))}\n\`\`\`\n\n`;
		});
		html = html.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => `- ${stripInline(text)}\n`);
		html = html.replace(/<\/(ul|ol)>/gi, "\n");
		html = html.replace(/<(ul|ol)[^>]*>/gi, "\n");
		html = html.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => `${stripInline(text)}\n\n`);
		html = html.replace(/<br\s*\/?>/gi, "  \n");
		html = html.replace(/<div[^>]*>/gi, "").replace(/<\/div>/gi, "\n");
		return decodeEntities(stripInline(html)).replace(/\n{3,}/g, "\n\n").trim();
	}
	function stripInline(text) {
		return text.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**").replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*").replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`").replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)").replace(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, "![$2]($1)").replace(/<img[^>]+src=["']([^"']+)["'][^>]*\/?>/gi, "![]($1)").replace(/<[^>]+>/g, "");
	}
	/** Extracts every unique `<img>` source URL from a post's HTML content.
	* Optionally includes `post.thumbnail`.
	*/
	function extractImages(input, includeThumbnail = true) {
		const html = resolveHtml(input);
		const found = /* @__PURE__ */ new Set();
		for (const match of html.matchAll(/<img\s+[^>]*?src=["']([^"']+)["'][^>]*>/gi)) if (match[1]) found.add(match[1]);
		if (includeThumbnail && input && typeof input === "object" && input.thumbnail) found.add(input.thumbnail);
		return [...found];
	}
	/** Extracts every `<a href>` from a post's HTML content, in document order. */
	function extractLinks(input) {
		const html = resolveHtml(input);
		const links = [];
		for (const match of html.matchAll(/<a\s+[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
			const url = match[1];
			if (!url) continue;
			links.push({
				url,
				text: htmlToText(match[2] ?? "")
			});
		}
		return links;
	}
	const YOUTUBE_PATTERNS = [
		/youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/i,
		/youtube\.com\/watch\?v=([\w-]{6,})/i,
		/youtu\.be\/([\w-]{6,})/i
	];
	/** Extracts every unique YouTube video referenced (as an `<iframe>` or link) in a post. */
	function extractYouTube(input) {
		const html = resolveHtml(input);
		const seen = /* @__PURE__ */ new Set();
		const results = [];
		for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) {
			const url = match[1];
			if (!url) continue;
			for (const pattern of YOUTUBE_PATTERNS) {
				const idMatch = pattern.exec(url);
				if (idMatch?.[1] && !seen.has(idMatch[1])) {
					seen.add(idMatch[1]);
					results.push({
						id: idMatch[1],
						url: `https://www.youtube.com/watch?v=${idMatch[1]}`
					});
				}
			}
		}
		return results;
	}
	function guessProvider(src) {
		try {
			const labels = new URL(src).hostname.replace(/^www\./, "").split(".");
			return labels.length >= 2 ? labels[labels.length - 2] : labels[0] ?? "unknown";
		} catch {
			return "unknown";
		}
	}
	const YOUTUBE_HOST_REGEX = /youtube(?:-nocookie)?\.com|youtu\.be/i;
	/** Extracts every non-YouTube `<iframe>` embed (Spotify, Vimeo, Google Maps, forms, etc.) from a post. */
	function extractEmbeds(input) {
		const html = resolveHtml(input);
		const seen = /* @__PURE__ */ new Set();
		const results = [];
		for (const match of html.matchAll(/<iframe\s+[^>]*?src=["']([^"']+)["'][^>]*>/gi)) {
			const src = match[1];
			if (!src || seen.has(src) || YOUTUBE_HOST_REGEX.test(src)) continue;
			seen.add(src);
			results.push({
				src,
				provider: guessProvider(src)
			});
		}
		return results;
	}
	/** Best available thumbnail for a post: Blogger's own pick, else the first extracted image. */
	function thumbnail(input) {
		if (input && typeof input !== "string") {
			if (input.thumbnail) return input.thumbnail;
			if (input.thumbnailAlt) return input.thumbnailAlt;
		}
		return extractImages(input)[0] ?? null;
	}
	/** Aggregate image discovery across posts. */
	var ImagesModule = class {
		constructor(posts) {
			this.posts = posts;
		}
		/**
		* Returns every unique image URL found in the content of up to
		* `sampleSize` (default 25) of the blog's most recent posts.
		*/
		async list(options = {}, requestOptions = {}) {
			const page = await this.posts.list({ limit: options.sampleSize ?? 25 }, requestOptions);
			const found = /* @__PURE__ */ new Set();
			for (const post of page.items) for (const url of extractImages(post)) found.add(url);
			return [...found];
		}
	};
	/** Methods for discovering and filtering by labels (Blogger's "categories"). */
	var LabelsModule = class {
		constructor(client, posts) {
			this.client = client;
			this.posts = posts;
		}
		/** Returns every label currently known to the blog. */
		async list(requestOptions = {}) {
			return (await this.client.req("./posts/summary", {
				params: { limit: 0 },
				signal: requestOptions.signal
			})).blog?.labels ?? [];
		}
		/** Lists posts carrying `label`. */
		async get(label, options = {}, requestOptions = {}) {
			assertNonBlankString(label, "label");
			return this.posts.list({
				...options,
				label
			}, requestOptions);
		}
	};
	/** Methods for listing and fetching static blog pages. */
	var PagesModule = class {
		constructor(client) {
			this.client = client;
		}
		/** Lists the blog's static pages. */
		async list(options = {}, requestOptions = {}) {
			const feed = await this.client.req(`./pages/${options.summary ? "summary" : "default"}`, {
				params: toQueryOptions(options),
				signal: requestOptions.signal
			});
			return paginate(this.client, feed, feed.posts ?? []);
		}
		/** Fetches a single page by id, or `null` if it doesn't exist. */
		async get(pageId, options = {}, requestOptions = {}) {
			assertNonBlankString(pageId, "pageId");
			const feed = await this.client.req(`./pages/${options.summary ? "summary" : "default"}/${encodeURIComponent(pageId)}`, { signal: requestOptions.signal });
			return feed.posts?.find((p) => p.id === pageId) ?? feed.posts?.[0] ?? null;
		}
	};
	function labelPathSegment(label) {
		if (!label) return "";
		const labels = isArray(label) ? label : [label];
		if (labels.length === 0) return "";
		return `/-/${labels.map((l) => encodeURIComponent(l)).join("/")}`;
	}
	/** Methods for listing, fetching and searching blog posts. */
	var PostsModule = class {
		constructor(client) {
			this.client = client;
		}
		/** Lists posts, optionally filtered/paginated/sorted. */
		async list(options = {}, requestOptions = {}) {
			const path = `./posts/${options.summary ? "summary" : "default"}${labelPathSegment(options.label)}`;
			const feed = await this.client.req(path, {
				params: {
					...toQueryOptions(options),
					query: options.query
				},
				signal: requestOptions.signal
			});
			return paginate(this.client, feed, feed.posts ?? []);
		}
		/** Fetches a single post by id, or `null` if it doesn't exist. */
		async get(postId, options = {}, requestOptions = {}) {
			assertNonBlankString(postId, "postId");
			const feed = await this.client.req(`./posts/${options.summary ? "summary" : "default"}/${encodeURIComponent(postId)}`, { signal: requestOptions.signal });
			return feed.posts?.find((p) => p.id === postId) ?? feed.posts?.[0] ?? null;
		}
		/** Full-text search across posts (equivalent to `search()` scoped to posts). */
		async query(query, options = {}, requestOptions = {}) {
			assertNonBlankString(query, "query");
			return this.list({
				...options,
				query
			}, requestOptions);
		}
		/**
		* Returns the most recent posts (default 5), newest first. Pass a bare
		* `number` for just a limit, or an options object to also filter by
		* `label`, `query`, date range, etc.
		*/
		async latest(options = {}, requestOptions = {}) {
			const opts = typeof options === "number" ? { limit: options } : options;
			return (await this.list({
				...opts,
				limit: opts.limit ?? 5,
				orderBy: "published"
			}, requestOptions)).items;
		}
		/**
		* Best-effort "featured" post — Blogger's public feed API has no explicit
		* flag for a pinned/featured post, so this returns the first post in the
		* blog's default (unfiltered) order, which is the pinned post when one
		* is set.
		*/
		async featured(requestOptions = {}) {
			return (await this.list({ limit: 1 }, requestOptions)).items[0] ?? null;
		}
		/**
		* Returns random post(s) (default 1) by sampling random indexes. Pass a
		* bare `number` for just a count, or an options object to also filter by
		* `label`, `query`, date range, etc.
		*/
		async random(options = {}, requestOptions = {}) {
			const { count = 1, ...filters } = typeof options === "number" ? { count: options } : options;
			const total = (await this.list({
				...filters,
				limit: 0
			}, requestOptions)).totalResults ?? 0;
			if (total === 0) return [];
			const picks = /* @__PURE__ */ new Set();
			const wanted = Math.min(count, total);
			while (picks.size < wanted) picks.add(1 + Math.floor(Math.random() * total));
			return (await Promise.all([...picks].map(async (startIndex) => {
				return (await this.list({
					...filters,
					startIndex,
					limit: 1
				}, requestOptions)).items[0];
			}))).filter((p) => Boolean(p));
		}
	};
	/** Full-text search across posts. */
	var SearchModule = class {
		constructor(posts) {
			this.posts = posts;
		}
		/** Searches posts by a plain query string, or a {@link SearchOptions} object. */
		async run(input, requestOptions = {}) {
			const options = isString(input) ? { query: input } : input;
			assertNonBlankString(options.query, "query");
			return this.posts.list({
				query: options.query,
				label: options.label,
				limit: options.limit,
				page: options.page,
				startIndex: options.startIndex,
				orderBy: options.orderBy,
				publishedMin: options.publishedMin,
				publishedMax: options.publishedMax,
				updatedMin: options.updatedMin,
				updatedMax: options.updatedMax,
				summary: options.summary
			}, requestOptions);
		}
	};
	/** Cheap aggregate counts for the blog (posts/pages/comments/labels totals). */
	var StatsModule = class {
		constructor(client) {
			this.client = client;
		}
		async get(requestOptions = {}) {
			const [postsFeed, pagesFeed, commentsFeed] = await Promise.all([
				this.client.req("./posts/summary", {
					params: { limit: 0 },
					signal: requestOptions.signal
				}),
				this.client.req("./pages/summary", {
					params: { limit: 0 },
					signal: requestOptions.signal
				}),
				this.client.req("./comments/summary", {
					params: { limit: 0 },
					signal: requestOptions.signal
				})
			]);
			return {
				posts: postsFeed.totalResults ?? 0,
				pages: pagesFeed.totalResults ?? 0,
				comments: commentsFeed.totalResults ?? 0,
				labels: postsFeed.blog?.labels.length ?? 0
			};
		}
	};
	/** Builds raw Blogger feed URLs without performing any request. */
	var UrlModule = class {
		constructor(client) {
			this.client = client;
		}
		/** URL for the posts feed. */
		posts(options = {}) {
			return this.client.resolveUrl("./posts/default", { format: options.format }).toString();
		}
		/** URL for a single post entry. */
		post(postId, options = {}) {
			assertNonBlankString(postId, "postId");
			return this.client.resolveUrl(`./posts/default/${encodeURIComponent(postId)}`, { format: options.format }).toString();
		}
		/** URL for the pages feed. */
		pages(options = {}) {
			return this.client.resolveUrl("./pages/default", { format: options.format }).toString();
		}
		/** URL for a single page entry. */
		page(pageId, options = {}) {
			assertNonBlankString(pageId, "pageId");
			return this.client.resolveUrl(`./pages/default/${encodeURIComponent(pageId)}`, { format: options.format }).toString();
		}
		/** URL for the comments feed (blog-wide, or scoped to `postId`). */
		comments(postId, options = {}) {
			const path = postId ? `./${encodeURIComponent(postId)}/comments/default` : "./comments/default";
			return this.client.resolveUrl(path, { format: options.format }).toString();
		}
	};
	/** Installs `plugin` onto `blog`. */
	function installPlugin(blog, plugin) {
		if (typeof plugin === "function") plugin(blog);
		else plugin.install(blog);
	}
	/**
	* A modern, modular, fully-typed SDK for the Blogger (Blogspot) public feed
	* API.
	*
	* ```ts
	* import { Blogr } from "blogr";
	*
	* const blog = new Blogr("https://example.blogspot.com");
	* const { items } = await blog.posts({ limit: 10, label: "JavaScript" });
	* ```
	*/
	var Blogr = class Blogr {
		/**
		* Creates a Blogger SDK client.
		*
		* @param urlOrId The blog's URL (custom domain or `*.blogspot.com`), or its numeric Blogger blog id.
		* @param options SDK options.
		*/
		constructor(urlOrId, options = {}) {
			_defineProperty(this, "client", void 0);
			_defineProperty(this, "url", void 0);
			_defineProperty(this, "feed", void 0);
			_defineProperty(this, "archive", void 0);
			_defineProperty(this, "cache", void 0);
			_defineProperty(this, "postsModule", void 0);
			_defineProperty(this, "pagesModule", void 0);
			_defineProperty(this, "commentsModule", void 0);
			_defineProperty(this, "labelsModule", void 0);
			_defineProperty(this, "searchModule", void 0);
			_defineProperty(this, "authorsModule", void 0);
			_defineProperty(this, "statsModule", void 0);
			_defineProperty(this, "imagesModule", void 0);
			this.client = new Client(urlOrId, options);
			this.cache = this.client.cache;
			this.postsModule = new PostsModule(this.client);
			this.pagesModule = new PagesModule(this.client);
			this.commentsModule = new CommentsModule(this.client);
			this.labelsModule = new LabelsModule(this.client, this.postsModule);
			this.searchModule = new SearchModule(this.postsModule);
			this.authorsModule = new AuthorsModule(this.postsModule);
			this.statsModule = new StatsModule(this.client);
			this.imagesModule = new ImagesModule(this.postsModule);
			this.url = new UrlModule(this.client);
			this.feed = new FeedModule(this.client);
			this.archive = new ArchiveModule(this.postsModule);
		}
		/** Fetches blog metadata (title, subtitle, labels, author, url, favicon, ...). */
		async info(requestOptions = {}) {
			return this.client.getBlogInfo(requestOptions);
		}
		/** Returns the blog's top-level `<link>` entries. */
		async links(requestOptions = {}) {
			return (await this.info(requestOptions)).links;
		}
		/** Cheap aggregate counts: total posts, pages, comments and labels. */
		async stats(requestOptions = {}) {
			return this.statsModule.get(requestOptions);
		}
		/** Distinct post authors, aggregated from a sample of recent posts. */
		async authors(options, requestOptions) {
			return this.authorsModule.list(options, requestOptions);
		}
		/** Lists posts, optionally filtered/paginated/sorted. */
		async posts(options, requestOptions) {
			return this.postsModule.list(options, requestOptions);
		}
		/** Fetches a single post by id, or `null` if it doesn't exist. */
		async post(postId, options, requestOptions) {
			return this.postsModule.get(postId, options, requestOptions);
		}
		/**
		* Returns the most recent posts (default 5), newest first. Pass a bare
		* `number` for just a limit, or an options object to also filter by
		* `label`, `query`, date range, etc.
		*/
		async latest(options, requestOptions) {
			return this.postsModule.latest(options, requestOptions);
		}
		/** Best-effort "featured"/pinned post — see {@link PostsModule.featured}. */
		async featured(requestOptions) {
			return this.postsModule.featured(requestOptions);
		}
		/**
		* Returns random post(s) sampled from the whole blog. Pass a bare
		* `number` for just a count, or an options object to also filter by
		* `label`, `query`, date range, etc.
		*/
		async random(options, requestOptions) {
			return this.postsModule.random(options, requestOptions);
		}
		/** Lists the blog's static pages. */
		async pages(options, requestOptions) {
			return this.pagesModule.list(options, requestOptions);
		}
		/** Fetches a single page by id, or `null` if it doesn't exist. */
		async page(pageId, options, requestOptions) {
			return this.pagesModule.get(pageId, options, requestOptions);
		}
		/**
		* Lists comments — for the whole blog when called with no argument or an
		* options object, or scoped to a single post when passed a `postId` string.
		*/
		async comments(postIdOrOptions, requestOptions) {
			const options = isString(postIdOrOptions) ? { postId: postIdOrOptions } : postIdOrOptions ?? {};
			return this.commentsModule.list(options, requestOptions);
		}
		/**
		* Fetches a single comment by id. Pass `postId` when known for a single,
		* direct request — see {@link CommentsModule.get}.
		*/
		async comment(commentId, postId, requestOptions) {
			return this.commentsModule.get(commentId, postId, void 0, requestOptions);
		}
		/** Lists every label known to the blog. */
		async labels(requestOptions) {
			return this.labelsModule.list(requestOptions);
		}
		/** Lists posts carrying `label`. */
		async label(label, options, requestOptions) {
			return this.labelsModule.get(label, options, requestOptions);
		}
		/** Alias of {@link Blogr.labels} — Blogger uses "labels" and "categories" interchangeably. */
		async categories(requestOptions) {
			return this.labels(requestOptions);
		}
		/** Full-text search across posts. Accepts a query string or a {@link SearchOptions} object. */
		async search(input, requestOptions) {
			return this.searchModule.run(input, requestOptions);
		}
		/** Unique image URLs found across a sample of recent posts. */
		async images(options, requestOptions) {
			return this.imagesModule.list(options, requestOptions);
		}
		/** Resolves a possibly-relative URL against the blog's own URL. */
		async resolve(url) {
			const base = await this.client.getBlogUrl();
			return new URL(url, base).toString();
		}
		/** Parses a raw Blogger feed JSON payload (e.g. from {@link Blogr.fetch}) into a {@link ParsedFeed}. */
		parse(raw) {
			return parseFeed(raw);
		}
		/** Normalizes a single raw feed entry object into a typed {@link Post}, {@link Comment} or {@link BlogInfo}. */
		normalize(data) {
			const wrapped = parseFeed({ entry: data });
			if (wrapped.posts?.[0]) return wrapped.posts[0];
			if (wrapped.comments?.[0]) return wrapped.comments[0];
			const direct = parseFeed(data);
			return direct.blog ?? direct.posts?.[0] ?? direct.comments?.[0] ?? null;
		}
		/** Strips HTML tags, returning plain text. */
		htmlToText(input) {
			return htmlToText(input);
		}
		/** Best-effort HTML → Markdown conversion. */
		htmlToMarkdown(input) {
			return htmlToMarkdown(input);
		}
		/** Every unique image URL in a post's HTML content. */
		extractImages(input) {
			return extractImages(input);
		}
		/** Every link (`{ url, text }`) in a post's HTML content. */
		extractLinks(input) {
			return extractLinks(input);
		}
		/** Every YouTube video (`{ id, url }`) referenced/embedded in a post. */
		extractYouTube(input) {
			return extractYouTube(input);
		}
		/** Every non-YouTube `<iframe>` embed (`{ src, provider }`) in a post. */
		extractEmbeds(input) {
			return extractEmbeds(input);
		}
		/** Best available thumbnail for a post. */
		thumbnail(input) {
			return thumbnail(input);
		}
		/** Performs a request against a feed-relative `endpoint` (or absolute URL) and returns the parsed feed. */
		async request(endpoint, requestOptions) {
			return this.client.req(endpoint, { signal: requestOptions?.signal });
		}
		/** Fetches an arbitrary URL and returns raw parsed JSON (bypasses feed parsing). */
		async fetch(url, requestOptions) {
			return this.client.fetchRaw(url, requestOptions);
		}
		/** Installs a plugin — a function `(blog) => void`, or an object with an `install(blog)` method. */
		use(plugin) {
			installPlugin(this, plugin);
			return this;
		}
		/** Subscribes to `"request"`, `"response"` or `"error"` lifecycle events. */
		on(event, listener) {
			this.client.events.on(event, listener);
			return this;
		}
		/** Unsubscribes a previously-registered listener. */
		off(event, listener) {
			this.client.events.off(event, listener);
			return this;
		}
		/** Creates a client and eagerly resolves/validates the blog's metadata. */
		static async connect(urlOrId, options = {}) {
			const blog = new Blogr(urlOrId, options);
			await blog.info();
			return blog;
		}
		/** Creates a client from a numeric Blogger blog id. */
		static fromBlogId(id, options = {}) {
			assertNonBlankString(id, "id");
			return new Blogr(id, options);
		}
		/** Creates a client from a blog URL (custom domain or `*.blogspot.com`). */
		static fromUrl(url, options = {}) {
			return new Blogr(url, options);
		}
		/**
		* Creates a client from any Blogger feed URL, e.g.
		* `https://example.blogspot.com/feeds/posts/default` or
		* `https://www.blogger.com/feeds/1234567890/posts/default`.
		*/
		static fromFeed(feedUrl, options = {}) {
			const url = feedUrl instanceof URL ? feedUrl : new URL(feedUrl);
			if (/^(www\.)?blogger\.com$/i.test(url.hostname)) {
				const match = /\/feeds\/(\d{10,24})\//.exec(url.pathname);
				if (match?.[1]) return new Blogr(match[1], options);
			}
			return new Blogr(url.origin, options);
		}
	};

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
	const defaults$10 = {
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
		return `${protocol}//i.ytimg.com/vi_webp/${videoId}/${options.ytThumbnail ?? defaults$10.ytThumbnail}.webp${query}`;
	}
	/**
	* Checks whether a URL is a Blogger/Google-hosted image (old or new URL
	* shape) or a YouTube video thumbnail that {@link resizeImage} can handle.
	*
	* @param url - Image URL to check.
	* @returns `true` if the URL is a recognized Blogger image or YouTube thumbnail.
	*
	* @example
	* ```ts
	* import { isSupportedImage } from "blogr-plugins";
	* isSupportedImage("https://1.bp.blogspot.com/path/s72-c/image.jpg"); // true
	* isSupportedImage("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"); // true
	* ```
	*/
	function isSupportedImage(url) {
		const str = toUrlString(url);
		if (YOUTUBE_THUMBNAIL_PATTERN.test(str)) return true;
		return HOST_PATTERN.test(str) && findParamSegment(str) !== null;
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
			value: options.width ?? defaults$10.width
		});
		params.set("h", {
			kind: "num",
			value: options.height ?? defaults$10.height
		});
		const format = options.format ?? defaults$10.format;
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
	const defaults$9 = {
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
	function shuffle$1(items) {
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
			console.warn("[blogr-widget] Blogr SDK not found. Please add it via CDN: <script src=\"https://cdn.jsdelivr.net/npm/blogr/dist/blogr.umd.js\"><\/script> or install via npm: npm install blogr");
			const container = resolveElements(options.containerSelector)?.[0];
			if (container) container.innerHTML = `
				<div class="blogr-widget-error" style="padding: 1rem; background: #fee; border: 1px solid #fcc; color: #c00; border-radius: 4px;">
					<p><strong>Blogr SDK not loaded.</strong></p>
					<p>Please include the Blogr library:</p>
					<code style="display: block; margin: 0.5rem 0; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
						&lt;script src="https://cdn.jsdelivr.net/npm/blogr/dist/blogr.umd.js"&gt;&lt;/script&gt;
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
			...defaults$9,
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
			if (opts.random) out = shuffle$1(out);
			return out;
		}
		function applyCommentFilters(entries) {
			let out = entries;
			if (opts.sort === "asc") out = [...out].reverse();
			if (opts.random) out = shuffle$1(out);
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
//#region src/plugins/lazify.ts
	const defaults$8 = {
		attribute: "data-src",
		posterAttribute: "data-poster",
		bgImageAttribute: "data-bg-image",
		loadedClass: "lazy-ify",
		errorClass: "lazy-ify-error",
		rootMargin: "200px",
		placeholder: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
	};
	/** Sets a blank placeholder so nothing shows a broken-image icon pre-load. */
	function applyPlaceholder(el, opts) {
		if (!opts.placeholder) return;
		if (el instanceof HTMLImageElement) {
			if (!el.getAttribute("src")) el.src = opts.placeholder;
		} else if (el instanceof HTMLVideoElement) {
			if (!el.getAttribute("poster")) el.poster = opts.placeholder;
		} else if (!(el instanceof HTMLIFrameElement)) {
			const style = el.style;
			if (!style.backgroundImage) style.backgroundImage = `url(${opts.placeholder})`;
		}
	}
	/**
	* Loads a `<video>`'s poster and/or sources once it's due, either from a
	* `data-src` on the video itself or from `<source data-src>` children (so
	* the browser's own format-negotiation still works). Calls `onDone` once
	* the video actually finishes loading data or errors out.
	*
	* Note: the poster image's own success/failure isn't tracked separately —
	* `onDone` reflects the video source(s) only.
	*
	* @returns `true` if anything was actually set (and `onDone` will fire).
	*/
	function loadVideo(video, opts, onDone) {
		let loaded = false;
		const poster = video.getAttribute(opts.posterAttribute);
		if (poster) {
			video.poster = poster;
			loaded = true;
		}
		const sources = video.querySelectorAll(`source[${opts.attribute}]`);
		if (sources.length > 0) for (const source of Array.from(sources)) {
			const src = source.getAttribute(opts.attribute);
			if (src) {
				source.src = src;
				loaded = true;
			}
		}
		else {
			const src = video.getAttribute(opts.attribute);
			if (src) {
				video.src = src;
				loaded = true;
			}
		}
		if (loaded) {
			video.addEventListener("loadeddata", () => onDone(true), { once: true });
			video.addEventListener("error", (event) => onDone(false, event), { once: true });
			video.load();
		}
		return loaded;
	}
	/** Preloads a URL as background-image, since CSS gives no load/error events. */
	function loadBackgroundImage(el, url, onDone) {
		const preload = new Image();
		preload.addEventListener("load", () => {
			el.style.backgroundImage = `url(${url})`;
			onDone(true);
		}, { once: true });
		preload.addEventListener("error", (event) => onDone(false, event), { once: true });
		preload.src = url;
	}
	/**
	* Lazily loads media once it scrolls near the viewport, using
	* `IntersectionObserver`. Handles `<img>` (sets `src`), `<iframe>` (sets
	* `src`), `<video>` (sets `src`/poster directly, or fills in `<source
	* data-src>` children and calls `.load()`), and any element with
	* `data-bg-image` (or, failing that, any other element) sets
	* `background-image`.
	*
	* A blank placeholder is applied immediately (before intersection) so
	* nothing shows a broken-image icon while it waits to load. `onLoad` fires
	* only once the real media has actually finished loading; `onError` fires
	* if it fails, and `errorClass` is added to the element.
	*
	* @param input - Selector, element(s), or jQuery collection to lazy-load.
	* @param options Configuration object.
	* See {@link LazifyOptions}.
	* @returns A {@link PluginInstance} with `destroy()` to stop observing.
	*
	* @example
	* ```html
	* <img data-src="/photo.jpg" alt="" />
	* <iframe data-src="https://example.com/embed"></iframe>
	* <div data-bg-image="/hero.jpg"></div>
	* <video data-poster="/poster.jpg" controls>
	* 	<source data-src="/clip.webm" type="video/webm" />
	* 	<source data-src="/clip.mp4" type="video/mp4" />
	* </video>
	* ```
	* ```ts
	* import { lazify } from "blogr-plugins";
	* lazify("img[data-src], iframe[data-src], video, [data-bg-image]", {
	* 	onError: (el) => el.classList.add("broken"),
	* });
	* ```
	*/
	function lazify(input, options = {}) {
		const opts = {
			...defaults$8,
			...options
		};
		const onLoadCb = options.onLoad;
		const onErrorCb = options.onError;
		const elements = resolveElements(input);
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const el = entry.target;
				if (el.dataset.lazifyLoaded === "true") {
					observer.unobserve(el);
					continue;
				}
				const finish = (success, event) => {
					el.classList.remove(opts.loadedClass, opts.errorClass);
					el.classList.add(success ? opts.loadedClass : opts.errorClass);
					if (success) {
						el.dataset.lazifyLoaded = "true";
						onLoadCb?.(el);
					} else onErrorCb?.(el, event ?? new Event("error"));
				};
				if (el instanceof HTMLVideoElement) {
					if (!loadVideo(el, opts, finish)) {
						observer.unobserve(el);
						continue;
					}
				} else {
					const bgUrl = el.getAttribute(opts.bgImageAttribute);
					if (bgUrl) loadBackgroundImage(el, bgUrl, finish);
					else {
						const url = el.getAttribute(opts.attribute);
						if (!url) {
							observer.unobserve(el);
							continue;
						}
						if (el instanceof HTMLImageElement) {
							el.addEventListener("load", () => finish(true), { once: true });
							el.addEventListener("error", (event) => finish(false, event), { once: true });
							el.src = url;
						} else if (el instanceof HTMLIFrameElement) {
							el.addEventListener("load", () => finish(true), { once: true });
							el.addEventListener("error", (event) => finish(false, event), { once: true });
							el.src = url;
						} else loadBackgroundImage(el, url, finish);
					}
				}
				observer.unobserve(el);
			}
		}, { rootMargin: opts.rootMargin });
		for (const el of elements) {
			const dataset = el.dataset;
			if (dataset.lazifyLoaded === "true" || dataset.lazifyObserved === "true") continue;
			dataset.lazifyObserved = "true";
			applyPlaceholder(el, opts);
			observer.observe(el);
		}
		return { destroy() {
			observer.disconnect();
		} };
	}

//#endregion
//#region src/plugins/marqify.ts
	const SPEED_MAP = {
		slow: .25,
		medium: .5,
		fast: 1
	};
	const TICKER_DURATION_MAP = {
		slow: 800,
		medium: 500,
		fast: 300
	};
	const defaults$7 = {
		type: "marquee",
		direction: "left",
		delayBeforeStart: 0,
		duplicated: true,
		pauseOnHover: true,
		speed: "medium",
		autoPlay: true,
		interval: 3e3
	};
	const STYLE_ID = "marqify-styles";
	const STYLES = `
[data-marqify] {
	display: block;
	position: relative;
	width: 100%;
	overflow: clip;
}
[data-marqify-inner] {
	display: flex;
	-ms-overflow-style: none;
	scrollbar-width: none;
}
[data-marqify-inner]::-webkit-scrollbar {
	display: none;
}
[data-marqify][data-marqify-direction="right"] [data-marqify-inner] {
	justify-content: flex-end;
}
[data-marqify-content] {
	display: flex;
	flex: 1 0 auto;
	animation-timing-function: linear;
	animation-iteration-count: infinite;
	animation-play-state: running;
	will-change: transform;
}
[data-marqify][data-marqify-direction="left"] [data-marqify-content] {
	animation-name: marqifyLeft;
}
[data-marqify][data-marqify-direction="right"] [data-marqify-content] {
	animation-name: marqifyRight;
}
[data-marqify][data-marqify-pause-on-hover]:hover > [data-marqify-inner] > [data-marqify-content] {
	animation-play-state: paused;
}
[data-marqify-item] {
	display: flex;
	align-items: center;
	flex-grow: 0;
}
@keyframes marqifyLeft {
	0% { transform: translate3d(0, 0, 0); }
	100% { transform: translate3d(-100%, 0, 0); }
}
@keyframes marqifyRight {
	0% { transform: translate3d(0, 0, 0); }
	100% { transform: translate3d(100%, 0, 0); }
}
@media (prefers-reduced-motion) {
	[data-marqify-inner] {
		overflow-x: scroll;
	}
	[data-marqify-content] {
		animation: none !important;
	}
}
[data-marqify][data-marqify-type="ticker"] {
	overflow: visible;
}
[data-marqify][data-marqify-type="ticker"] > [data-marqify-inner] {
	position: relative;
	display: block;
	overflow: hidden;
	width: 100%;
}
[data-marqify-slide] {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	will-change: transform;
}
`.trim();
	/** Injects marqify's stylesheet into `<head>` once per document, no matter how many times `marqify()` is called. */
	function injectStyles() {
		if (document.getElementById(STYLE_ID)) return;
		const style = document.createElement("style");
		style.id = STYLE_ID;
		style.textContent = STYLES;
		document.head.appendChild(style);
	}
	function resolveSpeed(speed) {
		return typeof speed === "number" ? speed : SPEED_MAP[speed];
	}
	function calcReps(containerSize, itemSize) {
		return itemSize > 0 ? Math.ceil(containerSize / itemSize) : 1;
	}
	function calcAnimationDuration(itemSize, reps, speed) {
		return `${(itemSize ?? 0) * reps / (100 * speed)}s`;
	}
	function resolveTickerDuration(speed) {
		return typeof speed === "number" ? speed : TICKER_DURATION_MAP[speed];
	}
	function reverseDirection(direction) {
		return {
			left: "right",
			right: "left",
			top: "bottom",
			bottom: "top"
		}[direction];
	}
	/** Off-screen resting transform for a slide entering from the side opposite `direction`. */
	function enterTransform(direction) {
		switch (direction) {
			case "left": return "translate3d(100%, 0, 0)";
			case "right": return "translate3d(-100%, 0, 0)";
			case "top": return "translate3d(0, 100%, 0)";
			case "bottom": return "translate3d(0, -100%, 0)";
		}
	}
	/** Off-screen transform a slide animates to when leaving in `direction`. */
	function exitTransform(direction) {
		return enterTransform(reverseDirection(direction));
	}
	function createMarqueeEngine$1(container, opts) {
		const slotHTML = container.innerHTML;
		const cloneCount = opts.duplicated ? 2 : 1;
		const numericSpeed = resolveSpeed(opts.speed);
		let reps = 1;
		let containerWidth = 0;
		let itemWidth = 0;
		let itemObserver = null;
		container.innerHTML = "";
		container.setAttribute("data-marqify", "");
		container.setAttribute("data-marqify-type", "marquee");
		container.setAttribute("data-marqify-direction", opts.direction);
		if (opts.pauseOnHover) container.setAttribute("data-marqify-pause-on-hover", "");
		const inner = document.createElement("div");
		inner.setAttribute("data-marqify-inner", "");
		for (let clone = 0; clone < cloneCount; clone++) {
			const content = document.createElement("div");
			content.setAttribute("data-marqify-content", "");
			inner.appendChild(content);
		}
		container.appendChild(inner);
		function buildItems() {
			inner.querySelectorAll("[data-marqify-content]").forEach((content, clone) => {
				content.innerHTML = "";
				for (let rep = 0; rep < reps; rep++) {
					const item = document.createElement("div");
					item.setAttribute("data-marqify-item", "");
					if (clone !== 0 || rep !== 0) item.setAttribute("aria-hidden", "true");
					item.innerHTML = slotHTML;
					content.appendChild(item);
				}
			});
			applyDuration();
			observeItem();
		}
		function applyDuration() {
			const duration = calcAnimationDuration(itemWidth, reps, numericSpeed);
			inner.querySelectorAll("[data-marqify-content]").forEach((content) => {
				content.style.animationDuration = duration;
				content.style.animationDelay = opts.delayBeforeStart > 0 ? `${opts.delayBeforeStart}ms` : "";
			});
		}
		function recalc() {
			const newReps = calcReps(containerWidth, itemWidth);
			if (newReps !== reps) {
				reps = newReps;
				buildItems();
			} else applyDuration();
		}
		function observeItem() {
			itemObserver?.disconnect();
			const firstItem = container.querySelector("[data-marqify-item]");
			if (!firstItem) return;
			itemObserver = new ResizeObserver(([entry]) => {
				itemWidth = entry.contentRect.width;
				recalc();
			});
			itemObserver.observe(firstItem);
		}
		const containerObserver = new ResizeObserver(([entry]) => {
			containerWidth = entry.contentRect.width;
			recalc();
		});
		containerObserver.observe(container);
		buildItems();
		return {
			destroy() {
				containerObserver.disconnect();
				itemObserver?.disconnect();
				container.removeAttribute("data-marqify");
				container.removeAttribute("data-marqify-type");
				container.removeAttribute("data-marqify-direction");
				container.removeAttribute("data-marqify-pause-on-hover");
				container.innerHTML = slotHTML;
			},
			next() {},
			previous() {}
		};
	}
	function createTickerEngine(container, opts) {
		const originalHTML = container.innerHTML;
		const itemEls = Array.from(container.children);
		const durationMs = resolveTickerDuration(opts.speed);
		let currentIndex = 0;
		let locked = false;
		let heightObserver = null;
		let autoplayTimer = null;
		container.innerHTML = "";
		container.setAttribute("data-marqify", "");
		container.setAttribute("data-marqify-type", "ticker");
		container.setAttribute("data-marqify-direction", opts.direction);
		const inner = document.createElement("div");
		inner.setAttribute("data-marqify-inner", "");
		const slideEls = itemEls.map((item, i) => {
			const slide = document.createElement("div");
			slide.setAttribute("data-marqify-slide", "");
			if (i !== 0) slide.setAttribute("aria-hidden", "true");
			slide.style.transform = i === 0 ? "translate3d(0, 0, 0)" : enterTransform(opts.direction);
			slide.appendChild(item);
			inner.appendChild(slide);
			return slide;
		});
		container.appendChild(inner);
		function observeHeight() {
			heightObserver?.disconnect();
			const active = slideEls[currentIndex];
			if (!active) return;
			heightObserver = new ResizeObserver(([entry]) => {
				inner.style.height = `${entry.contentRect.height}px`;
			});
			heightObserver.observe(active);
		}
		observeHeight();
		function stopAutoplay() {
			if (autoplayTimer !== null) {
				clearInterval(autoplayTimer);
				autoplayTimer = null;
			}
		}
		function startAutoplay() {
			if (!opts.autoPlay || slideEls.length < 2) return;
			stopAutoplay();
			autoplayTimer = setInterval(() => {
				goTo(currentIndex + 1, opts.direction);
			}, opts.interval);
		}
		function handleMouseEnter() {
			if (opts.pauseOnHover) stopAutoplay();
		}
		function handleMouseLeave() {
			if (opts.pauseOnHover) startAutoplay();
		}
		container.addEventListener("mouseenter", handleMouseEnter);
		container.addEventListener("mouseleave", handleMouseLeave);
		startAutoplay();
		function goTo(newIndex, direction) {
			if (slideEls.length < 2 || locked) return;
			const target = (newIndex % slideEls.length + slideEls.length) % slideEls.length;
			if (target === currentIndex) return;
			locked = true;
			const outEl = slideEls[currentIndex];
			const inEl = slideEls[target];
			outEl.removeAttribute("aria-hidden");
			inEl.removeAttribute("aria-hidden");
			inEl.style.transition = "none";
			inEl.style.transform = enterTransform(direction);
			inEl.offsetWidth;
			inEl.style.transition = `transform ${durationMs}ms ease-in-out`;
			outEl.style.transition = `transform ${durationMs}ms ease-in-out`;
			requestAnimationFrame(() => {
				outEl.style.transform = exitTransform(direction);
				inEl.style.transform = "translate3d(0, 0, 0)";
			});
			setTimeout(() => {
				outEl.style.transition = "none";
				outEl.style.transform = enterTransform(direction);
				outEl.setAttribute("aria-hidden", "true");
				currentIndex = target;
				observeHeight();
				locked = false;
			}, durationMs);
		}
		return {
			destroy() {
				stopAutoplay();
				container.removeEventListener("mouseenter", handleMouseEnter);
				container.removeEventListener("mouseleave", handleMouseLeave);
				heightObserver?.disconnect();
				container.removeAttribute("data-marqify");
				container.removeAttribute("data-marqify-type");
				container.removeAttribute("data-marqify-direction");
				container.innerHTML = originalHTML;
			},
			next() {
				goTo(currentIndex + 1, opts.direction);
				startAutoplay();
			},
			previous() {
				goTo(currentIndex - 1, reverseDirection(opts.direction));
				startAutoplay();
			}
		};
	}
	/**
	* Turns a container's children into an infinitely-scrolling CSS marquee —
	* logos, card rows, testimonial strips, anything you'd otherwise reach for
	* a heavier carousel library for. Ports the reps/duration calculation from
	* the [marqy](https://github.com/abnud1/marqy) web component into an
	* imperative plugin: pass it a container of items instead of a custom
	* element, and it rebuilds that container into a seamless, duplicated
	* marquee track sized to always fill it, regardless of viewport width.
	*
	* Injects a small stylesheet into `<head>` the first time it's called
	* (once per page, however many containers you marquee).
	*
	* Also doubles as a **ticker**: pass `type: "ticker"` and instead of a
	* continuous scroll, one child at a time is shown, sliding out to make way
	* for the next in the direction you configure (`"left"` / `"right"` /
	* `"top"` / `"bottom"`). Advance it with the returned instance's
	* {@link MarqifyInstance.next} / {@link MarqifyInstance.previous} — e.g.
	* from a pair of prev/next buttons.
	*
	* @param input - Selector, element(s), or jQuery collection for the
	* container(s) whose children should marquee/tick.
	* @param options - {@link MarqifyOptions}
	* @returns A {@link MarqifyInstance} — `destroy()` disconnects the resize
	* observers and restores the container's original content; `next()` /
	* `previous()` step the ticker (no-ops when `type` is `"marquee"`).
	*
	* @example
	* ```html
	* <div class="cards">
	* 	<div class="card">Card A</div>
	* 	<div class="card">Card B</div>
	* 	<div class="card">Card C</div>
	* </div>
	* ```
	* ```ts
	* import { marqify } from "blogr-plugins";
	*
	* const instance = marqify(".cards", {
	* 	direction: "left",
	* 	speed: "fast",
	* 	pauseOnHover: true,
	* });
	*
	* instance.destroy();
	* ```
	*
	* @example Ticker
	* ```html
	* <div class="announcements">
	* 	<div>📣 New release shipped</div>
	* 	<div>🐛 Fixed a nasty bug</div>
	* 	<div>🎉 100 stars on GitHub</div>
	* </div>
	* <button id="prev">‹</button>
	* <button id="next">›</button>
	* ```
	* ```ts
	* import { marqify } from "blogr-plugins";
	*
	* const ticker = marqify(".announcements", {
	* 	type: "ticker",
	* 	direction: "top",
	* 	speed: "medium",
	* });
	*
	* document.getElementById("next").addEventListener("click", () => ticker.next());
	* document.getElementById("prev").addEventListener("click", () => ticker.previous());
	* ```
	*/
	function marqify(input, options = {}) {
		injectStyles();
		const opts = mergeOptions(defaults$7, options);
		if (opts.type === "marquee" && opts.direction !== "left" && opts.direction !== "right") {
			console.warn(`marqify: direction "${opts.direction}" is only valid for type: "ticker" — falling back to "left" for this marquee.`);
			opts.direction = "left";
		}
		const containers = resolveElements(input);
		const createEngine = opts.type === "ticker" ? createTickerEngine : createMarqueeEngine$1;
		const engines = containers.map((container) => createEngine(container, opts));
		return {
			destroy() {
				for (const engine of engines) engine.destroy();
			},
			next() {
				for (const engine of engines) engine.next();
			},
			previous() {
				for (const engine of engines) engine.previous();
			}
		};
	}

//#endregion
//#region src/plugins/menuify.ts
	const defaults$6 = {
		nestingPrefix: "_",
		submenuClass: "sub-menu",
		hasSubClass: "has-sub",
		chevronText: "<"
	};
	function menuify(input, options = {}) {
		const opts = {
			...defaults$6,
			...options
		};
		const lists = resolveElements(input);
		const undoFns = [];
		for (const list of lists) {
			const items = Array.from(list.children).filter((el) => el.tagName === "LI");
			const levelParents = [];
			const levelSubmenus = [];
			const moves = [];
			const textEdits = [];
			const addedSubmenus = [];
			const addedClasses = [];
			const addedChevrons = [];
			const prefixChar = opts.nestingPrefix.charAt(0);
			for (const li of items) {
				const link = li.querySelector("a");
				if (!link) continue;
				const text = link.textContent ?? "";
				let depth = 0;
				while (depth < text.length && text[depth] === prefixChar) depth++;
				if (depth > 0) {
					if (depth - 1 >= levelParents.length) continue;
					const parentLi = levelParents[depth - 1];
					let submenu = levelSubmenus[depth - 1];
					if (!submenu) {
						submenu = document.createElement("ul");
						submenu.className = opts.submenuClass;
						parentLi.appendChild(submenu);
						parentLi.classList.add(opts.hasSubClass);
						const parentLink = parentLi.querySelector("a");
						if (parentLink) {
							const chevron = document.createElement("span");
							chevron.className = "chevron";
							chevron.textContent = opts.chevronText;
							parentLink.appendChild(chevron);
							addedChevrons.push(chevron);
						}
						addedSubmenus.push(submenu);
						addedClasses.push(parentLi);
						levelSubmenus[depth - 1] = submenu;
					}
					textEdits.push({
						el: link,
						original: text
					});
					link.textContent = text.slice(depth);
					moves.push({
						li,
						nextSibling: li.nextSibling
					});
					submenu.appendChild(li);
					levelParents[depth] = li;
					if (levelSubmenus.length < depth) levelSubmenus.length = depth;
				} else {
					levelParents.length = 1;
					levelSubmenus.length = 0;
					levelParents[0] = li;
				}
			}
			undoFns.push(() => {
				for (const { el, original } of textEdits) el.textContent = original;
				for (const { li, nextSibling } of moves.reverse()) list.insertBefore(li, nextSibling);
				for (const submenu of addedSubmenus) submenu.remove();
				for (const el of addedClasses) el.classList.remove(opts.hasSubClass);
				for (const chevron of addedChevrons) chevron.remove();
			});
		}
		return { destroy() {
			for (const undo of undoFns) undo();
		} };
	}

//#endregion
//#region src/plugins/relatify.ts
	const defaults$5 = {
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
			...defaults$5,
			labels: defaults$5.labels,
			maxLinks: void 0,
			blogUrl: void 0,
			currentUrl: void 0,
			lazy: defaults$5.lazy,
			rootMargin: defaults$5.rootMargin,
			beforeFetch: () => {},
			afterFetch: (_posts) => {},
			onInsert: (_detail) => {},
			onEmpty: () => {},
			onError: (err) => console.error("relatify:", err)
		}, options);
	}
	function createEngine$1(container, opts) {
		let cancelled = false;
		const inserted = [];
		const insertAfterSelector = Array.isArray(opts.insertAfter) ? opts.insertAfter.join(", ") : opts.insertAfter;
		const searchLabels = (opts.labels ?? []).filter((label) => !opts.excludeLabels.includes(label));
		const currentUrl = normalizeUrl(opts.currentUrl ?? detectCurrentUrl());
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
		const engines = resolveElements(input).map((container) => createEngine$1(container, opts));
		return { destroy() {
			for (const engine of engines) engine.destroy();
		} };
	}

//#endregion
//#region src/plugins/replacify.ts
	const defaults$4 = { allowHtml: false };
	/**
	* Finds and replaces text within an element's text nodes only — it never
	* touches tag names or attributes, so it's safe to run on rendered markup.
	*
	* @param input - Selector, element(s), or jQuery collection to search within.
	* @param search - String or RegExp to find.
	* @param replacement - Replacement text (or HTML, if `allowHtml` is set).
	* @param options Configuration object.
	* See {@link ReplacifyOptions}.
	* @returns A {@link PluginInstance} with `destroy()` to revert the text.
	*
	* @example
	* ```ts
	* import { replacify } from "blogr-plugins";
	* replacify(".post-body", /\bBlogr\b/g, "Blogr™");
	* ```
	*/
	function replacify(input, search, replacement, options = {}) {
		const opts = {
			...defaults$4,
			...options
		};
		const elements = resolveElements(input);
		const undoFns = [];
		for (const el of elements) {
			const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
			const textNodes = [];
			let node;
			while (node = walker.nextNode()) textNodes.push(node);
			for (const textNode of textNodes) {
				const original = textNode.nodeValue ?? "";
				const updated = original.replace(search, replacement);
				if (updated === original) continue;
				if (!opts.allowHtml || !/</.test(updated)) {
					textNode.nodeValue = updated;
					undoFns.push(() => {
						textNode.nodeValue = original;
					});
				} else {
					const wrapper = document.createElement("span");
					wrapper.innerHTML = updated;
					const parent = textNode.parentNode;
					if (!parent) continue;
					const replacementNodes = Array.from(wrapper.childNodes);
					const anchor = document.createComment("");
					parent.insertBefore(anchor, textNode);
					for (const n of replacementNodes) parent.insertBefore(n, textNode);
					parent.removeChild(textNode);
					undoFns.push(() => {
						const restored = document.createTextNode(original);
						parent.insertBefore(restored, anchor);
						for (const n of replacementNodes) parent.removeChild(n);
						parent.removeChild(anchor);
					});
				}
			}
		}
		return { destroy() {
			for (const undo of undoFns.reverse()) undo();
		} };
	}

//#endregion
//#region src/plugins/shortcodify.ts
	const defaults$3 = {
		openTag: "[",
		closeTag: "]",
		unknownTag: "keep",
		recursive: true,
		maxDepth: 5
	};
	function escapeRegExp(str) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
	function coerceAttrValue(raw) {
		if (raw === "true") return true;
		if (raw === "false") return false;
		if (raw !== "" && !Number.isNaN(Number(raw))) return Number(raw);
		return raw;
	}
	function parseAttributes(raw) {
		const attrs = {};
		const attrPattern = /([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s\]/]+)))?/g;
		let match;
		while (match = attrPattern.exec(raw)) {
			const [, key, dq, sq, bare] = match;
			if (dq !== void 0) attrs[key] = coerceAttrValue(dq);
			else if (sq !== void 0) attrs[key] = coerceAttrValue(sq);
			else if (bare !== void 0) attrs[key] = coerceAttrValue(bare);
			else attrs[key] = true;
		}
		return attrs;
	}
	/**
	* Splits `text` into a tree of plain-text and shortcode-element nodes.
	* Handles self-closing tags (`[tag/]`), nesting of unrelated tags, and
	* `[[tag]]` escaping (doubled opening delimiter emits a literal tag with
	* the bracket count reduced by one instead of being parsed).
	*/
	function parse(text, openTag, closeTag) {
		const open = escapeRegExp(openTag);
		const close = escapeRegExp(closeTag);
		const escapedTag = `${open}${open}(/)?([a-zA-Z][\\w-]*)((?:\\s+[^${close}]*)?)\\s*(/)?${close}${close}`;
		const normalTag = `${open}(/)?([a-zA-Z][\\w-]*)((?:\\s+[^${close}]*)?)\\s*(/)?${close}`;
		const tagPattern = new RegExp(`${escapedTag}|${normalTag}`, "g");
		const root = {
			type: "element",
			tag: "",
			attrs: {},
			selfClosing: false,
			raw: "",
			children: []
		};
		const stack = [root];
		let lastIndex = 0;
		let match;
		const pushText = (value) => {
			if (!value) return;
			const top = stack[stack.length - 1];
			const lastChild = top.children[top.children.length - 1];
			if (lastChild?.type === "text") lastChild.value += value;
			else top.children.push({
				type: "text",
				value
			});
		};
		while (match = tagPattern.exec(text)) {
			pushText(text.slice(lastIndex, match.index));
			lastIndex = match.index + match[0].length;
			const [raw, escClosingSlash, escTag, escRawAttrs, escSelfClosingSlash, closingSlash, tag, rawAttrs, selfClosingSlash] = match;
			if (escTag !== void 0) {
				pushText(`${openTag}${escClosingSlash ?? ""}${escTag}${escRawAttrs ?? ""}${escSelfClosingSlash ?? ""}${closeTag}`);
				continue;
			}
			if (closingSlash) {
				const idx = stack.findIndex((node) => node.type === "element" && node.tag === tag);
				if (idx > 0) {
					const opened = stack[idx];
					if (opened.type === "element") opened.closeRaw = raw;
					stack.length = idx;
				} else pushText(raw);
				continue;
			}
			const node = {
				type: "element",
				tag,
				attrs: parseAttributes(rawAttrs ?? ""),
				selfClosing: Boolean(selfClosingSlash),
				raw,
				children: []
			};
			stack[stack.length - 1].children.push(node);
			if (!node.selfClosing) stack.push(node);
		}
		pushText(text.slice(lastIndex));
		return root.children;
	}
	/**
	* Renders a handler's own output for further shortcodes it may contain,
	* e.g. a `[quote]` handler that itself returns `[i]...[/i]`. Only handler
	* *output* is ever re-parsed this way — original source text (including
	* anything that was `[[escaped]]`) is parsed exactly once and never
	* revisited, so escaping stays reliable regardless of recursion.
	*/
	function expandHandlerOutput(result, ctx, depth) {
		if (!ctx.recursive || depth >= ctx.maxDepth || !result.includes(ctx.openTag)) return result;
		return renderTree(parse(result, ctx.openTag, ctx.closeTag), ctx, depth + 1);
	}
	function renderTree(nodes, ctx, depth) {
		let out = "";
		for (const node of nodes) {
			if (node.type === "text") {
				out += node.value;
				continue;
			}
			const innerContent = renderTree(node.children, ctx, depth);
			const handler = ctx.tags[node.tag];
			if (handler) {
				let result;
				try {
					result = handler(node.attrs, innerContent, node.tag);
				} catch (error) {
					ctx.onError?.(error, node.tag);
					result = "";
				}
				out += expandHandlerOutput(result, ctx, depth);
				continue;
			}
			switch (ctx.unknownTag) {
				case "strip":
					out += innerContent;
					break;
				case "remove": break;
				default: out += node.selfClosing ? node.raw : `${node.raw}${innerContent}${node.closeRaw ?? ""}`;
			}
		}
		return out;
	}
	/**
	* Parses and renders `[tag attr="value"]content[/tag]`-style shortcodes in
	* a plain string, given a map of tag → handler. Pure function — does not
	* touch the DOM, so it's the right building block for rendering Blogger
	* post content, RSS/feed text, or any string before it's inserted onto a
	* page.
	*
	* Supports self-closing tags (`[img src="a.jpg"/]`), nested tags
	* (`[quote][b]bold[/b] quote[/quote]`), quoted/unquoted/boolean attributes
	* (`[video src=a.mp4 muted]`), and `[[tag]]` escaping to emit a literal
	* bracketed tag without processing it.
	*
	* @param text - Source text containing zero or more shortcodes.
	* @returns The text with every recognized shortcode replaced by its
	* handler's output.
	*
	* @example
	* ```ts
	* import { renderShortcodes } from "blogr-plugins";
	*
	* const html = renderShortcodes(
	*   "Check out [youtube id=\"dQw4w9WgXcQ\" width=560/] and [b]this[/b].",
	*   {
	*     tags: {
	*       youtube: (attrs) =>
	*         `<iframe width="${attrs.width ?? 560}" height="315" src="https://www.youtube.com/embed/${attrs.id}"></iframe>`,
	*       b: (_attrs, content) => `<strong>${content}</strong>`,
	*     },
	*   },
	* );
	* ```
	*/
	function renderShortcodes(text, options) {
		const opts = {
			...defaults$3,
			...options
		};
		const ctx = {
			tags: opts.tags,
			unknownTag: opts.unknownTag,
			onError: opts.onError,
			openTag: opts.openTag,
			closeTag: opts.closeTag,
			recursive: opts.recursive,
			maxDepth: opts.maxDepth
		};
		return renderTree(parse(text, opts.openTag, opts.closeTag), ctx, 0);
	}
	/**
	* A small, reusable builder for a tag → handler map, so a shared set of
	* shortcodes (e.g. your site's `[gallery]`, `[youtube]`, `[button]`) can be
	* assembled once and passed to both {@link renderShortcodes} and
	* {@link shortcodify} calls across a codebase.
	*
	* @example
	* ```ts
	* import { createShortcodeRegistry, shortcodify } from "blogr-plugins";
	*
	* const registry = createShortcodeRegistry()
	*   .register("b", (_attrs, content) => `<strong>${content}</strong>`)
	*   .register("color", (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`);
	*
	* shortcodify("#post-body", { tags: registry.tags });
	* ```
	*/
	function createShortcodeRegistry(initial = {}) {
		const tags = { ...initial };
		const registry = {
			/** Live map of every tag registered so far — pass straight into `tags`. */
			tags,
			/** Registers (or overwrites) a single tag's handler. Chainable. */
			register(tag, handler) {
				tags[tag] = handler;
				return registry;
			},
			/** Removes a tag so it falls back to the `unknownTag` policy. Chainable. */
			unregister(tag) {
				delete tags[tag];
				return registry;
			},
			/** Whether a tag currently has a handler. */
			has(tag) {
				return tag in tags;
			}
		};
		return registry;
	}
	/**
	* A handful of ready-made handlers (`b`, `i`, `u`, `url`, `color`) you can
	* spread into your own tag map instead of writing the common ones by hand.
	*
	* @example
	* ```ts
	* import { defaultShortcodeTags, renderShortcodes } from "blogr-plugins";
	*
	* renderShortcodes("[b]Bold[/b] and [url href=\"/x\"]a link[/url]", {
	*   tags: { ...defaultShortcodeTags, ...myOwnTags },
	* });
	* ```
	*/
	const defaultShortcodeTags = {
		b: (_attrs, content) => `<strong>${content}</strong>`,
		i: (_attrs, content) => `<em>${content}</em>`,
		u: (_attrs, content) => `<span style="text-decoration:underline">${content}</span>`,
		color: (attrs, content) => `<span style="color:${attrs.name ?? attrs.value ?? "inherit"}">${content}</span>`,
		url: (attrs, content) => `<a href="${attrs.href ?? "#"}"${attrs.target ? ` target="${attrs.target}"` : ""}>${content}</a>`
	};
	/**
	* DOM-facing version of {@link renderShortcodes}: scans the text nodes
	* inside the given element(s) for shortcodes and replaces each match with
	* its handler's output, in place. A shortcode must live entirely inside one
	* text node to be recognized — for content spanning multiple elements (or
	* before it's inserted into the page at all), call
	* {@link renderShortcodes} on the raw string instead.
	*
	* @param input - Selector, element(s), or jQuery collection to scan.
	* @param options Configuration object.
	* See {@link ShortcodifyOptions}.
	* @returns A {@link PluginInstance} with `destroy()` to revert every replacement.
	*
	* @example
	* ```html
	* <p id="post">Say [b]hello[/b] to [color name="crimson"]Blogr[/color]!</p>
	* ```
	* ```ts
	* import { shortcodify } from "blogr-plugins";
	*
	* shortcodify("#post", {
	*   tags: {
	*     b: (_attrs, content) => `<strong>${content}</strong>`,
	*     color: (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`,
	*   },
	*   allowHtml: true,
	* });
	* ```
	*/
	function shortcodify(input, options) {
		const opts = {
			allowHtml: false,
			...options
		};
		const elements = resolveElements(input);
		const undoFns = [];
		for (const el of elements) {
			const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
			const textNodes = [];
			let node;
			while (node = walker.nextNode()) textNodes.push(node);
			for (const textNode of textNodes) {
				const original = textNode.nodeValue ?? "";
				const updated = renderShortcodes(original, opts);
				if (updated === original) continue;
				if (!opts.allowHtml || !/</.test(updated)) {
					textNode.nodeValue = updated;
					undoFns.push(() => {
						textNode.nodeValue = original;
					});
				} else {
					const wrapper = document.createElement("span");
					wrapper.innerHTML = updated;
					const parent = textNode.parentNode;
					if (!parent) continue;
					const replacementNodes = Array.from(wrapper.childNodes);
					const referenceNode = textNode.nextSibling;
					for (const n of replacementNodes) parent.insertBefore(n, textNode);
					parent.removeChild(textNode);
					undoFns.push(() => {
						const restored = document.createTextNode(original);
						parent.insertBefore(restored, referenceNode);
						for (const n of replacementNodes) parent.removeChild(n);
					});
				}
			}
		}
		return { destroy() {
			for (const undo of undoFns.reverse()) undo();
		} };
	}

//#endregion
//#region src/plugins/stackify.ts
	const defaults$2 = {
		offset: 20,
		scaleStep: 0,
		visibleCards: Number.POSITIVE_INFINITY,
		interval: 3e3,
		autoplay: true,
		duration: 500,
		easing: "ease",
		direction: "forward",
		orientation: void 0,
		size: void 0,
		pauseOnHover: true,
		clickToActivate: true,
		draggable: false,
		startIndex: 0,
		activeClass: "stackify-active",
		cardClass: "stackify-card",
		stackClass: "stackify-stack",
		layout: "stack",
		peekWidth: "shrink",
		peekWidthStep: .05,
		marqueeSpeed: 60
	};
	/**
	* Drops keys whose value is explicitly `undefined` before merging with
	* defaults. Without this, `{ ...defaults, ...options }` lets a stray
	* `someOption: undefined` in caller-built option objects (e.g. reading an
	* empty form field with `Number(x) : undefined`) silently wipe out a
	* valid default — that's what was making every card go `opacity: 0` on
	* init, since `visibleCards` was arriving as `undefined` and
	* `Math.min(undefined, n)` is `NaN`.
	*/
	function stripUndefined(obj) {
		const out = {};
		for (const key in obj) if (obj[key] !== void 0) out[key] = obj[key];
		return out;
	}
	/**
	* Mirrors relevant config onto `container.dataset` so CSS/JS outside the
	* plugin can hook into current state (e.g. `[data-layout="marquee"]`).
	* Called on init and re-applied on `destroy()` cleanup (removed there).
	*/
	function applyDatasetOptions(container, opts) {
		container.dataset.layout = opts.layout;
		container.dataset.orientation = opts.orientation ?? (opts.layout === "marquee" ? "horizontal" : "vertical");
		container.dataset.direction = opts.direction;
		container.dataset.autoplay = String(opts.autoplay);
		container.dataset.draggable = String(opts.draggable);
		container.dataset.clickToActivate = String(opts.clickToActivate);
		container.dataset.pauseOnHover = String(opts.pauseOnHover);
		if (opts.layout === "stack") container.dataset.peekWidth = opts.peekWidth;
	}
	function clearDatasetOptions(container) {
		delete container.dataset.layout;
		delete container.dataset.orientation;
		delete container.dataset.direction;
		delete container.dataset.autoplay;
		delete container.dataset.draggable;
		delete container.dataset.clickToActivate;
		delete container.dataset.pauseOnHover;
		delete container.dataset.peekWidth;
	}
	/**
	* Resolves `opts.size` against current layout. Flat shape (`height`/`width`
	* at top level) applies regardless of layout; per-layout shape (`stack`/
	* `marquee` keys) only yields the block matching `layout`. Detects shape by
	* presence of `stack`/`marquee` keys, not `height`/`width`.
	*/
	function resolveSize(size, layout) {
		if (!size) return {};
		if ("stack" in size || "marquee" in size) return size[layout] ?? {};
		return size;
	}
	/**
	* Applies container height/width from `opts.size`, if given — purely
	* opt-in. Plugin never measures card size to auto-calc a container size,
	* so cards stay untouched by this and the container's own box just does
	* whatever normal CSS/parent sizing would do when left alone.
	*/
	function applySize(container, opts) {
		const { height, width } = resolveSize(opts.size, opts.layout);
		if (height !== void 0) container.style.height = typeof height === "number" ? `${height}px` : height;
		if (width !== void 0) container.style.width = typeof width === "number" ? `${width}px` : width;
	}
	const DRAG_THRESHOLD_PX = 60;
	function createEngine(container, opts) {
		return opts.layout === "marquee" ? createMarqueeEngine(container, opts) : createStackEngine(container, opts);
	}
	function createStackEngine(container, opts) {
		const original = Array.from(container.children);
		const gap = opts.offset;
		const vertical = (opts.orientation ?? "vertical") === "vertical";
		const posProp = vertical ? "top" : "left";
		let visibleCount = Math.max(1, Math.min(opts.visibleCards, original.length));
		let order = [...original];
		let timer = null;
		let wasPlayingBeforeHover = false;
		let destroyed = false;
		let initialized = original.length > 0;
		const containerRestore = container.style.cssText;
		const cardRestore = new Map(original.map((card) => [card, card.style.cssText]));
		container.classList.add(opts.stackClass);
		applyDatasetOptions(container, opts);
		if (getComputedStyle(container).position === "static") container.style.position = "relative";
		applySize(container, opts);
		function setupCard(card) {
			if (!cardRestore.has(card)) cardRestore.set(card, card.style.cssText);
			card.classList.add(opts.cardClass);
			card.style.position = "absolute";
			if (vertical) card.style.top = "0";
			else {
				card.style.top = "0";
				card.style.bottom = "0";
			}
			card.style.transformOrigin = vertical ? "top center" : "center left";
			card.style.transition = `${posProp} ${opts.duration}ms ${opts.easing}, transform ${opts.duration}ms ${opts.easing}, opacity ${opts.duration}ms ${opts.easing}`;
		}
		for (const card of original) setupCard(card);
		function applyPositions() {
			if (order.length === 0) return;
			const n = order.length;
			order.forEach((card, i) => {
				const pos = (n - 1 - i) * gap;
				const scale = 1 - i * opts.scaleStep;
				const peekDelta = opts.peekWidth === "expand" ? i * opts.peekWidthStep : opts.peekWidth === "shrink" ? -i * opts.peekWidthStep : 0;
				const peekScale = Math.max(.1, 1 + peekDelta);
				const transformParts = [];
				if (scale !== 1) transformParts.push(`scale(${scale})`);
				if (peekScale !== 1) transformParts.push(vertical ? `scaleX(${peekScale})` : `scaleY(${peekScale})`);
				card.style.zIndex = String(n - i);
				card.style[posProp] = `${pos}px`;
				card.style.transform = transformParts.join(" ");
				card.style.opacity = i < visibleCount ? "1" : "0";
				card.style.pointerEvents = i === 0 ? "auto" : "none";
				card.classList.toggle(opts.activeClass, i === 0);
			});
		}
		if (original.length > 0) applyPositions();
		function fire(hook, fromCard, toCard) {
			hook?.({
				fromIndex: original.indexOf(fromCard),
				toIndex: original.indexOf(toCard),
				fromCard,
				toCard
			});
		}
		function rotate(newOrder) {
			if (destroyed || newOrder[0] === order[0]) {
				order = newOrder;
				applyPositions();
				return;
			}
			const fromCard = order[0];
			order = newOrder;
			const toCard = order[0];
			fire(opts.onBeforeChange, fromCard, toCard);
			applyPositions();
			setTimeout(() => {
				if (!destroyed) fire(opts.onAfterChange, fromCard, toCard);
			}, opts.duration);
		}
		function next() {
			const [front, ...rest] = order;
			rotate([...rest, front]);
		}
		function prev() {
			const back = order[order.length - 1];
			rotate([back, ...order.slice(0, -1)]);
		}
		function goTo(originalIndex) {
			const target = original[originalIndex];
			if (!target) return;
			const pos = order.indexOf(target);
			if (pos <= 0) return;
			rotate([...order.slice(pos), ...order.slice(0, pos)]);
		}
		function tick() {
			if (opts.direction === "backward") prev();
			else next();
		}
		function play() {
			if (timer || opts.interval <= 0 || destroyed) return;
			timer = setInterval(tick, opts.interval);
		}
		function pause() {
			if (timer) clearInterval(timer);
			timer = null;
		}
		function restartIfPlaying() {
			if (timer) {
				pause();
				play();
			}
		}
		const onMouseEnter = () => {
			wasPlayingBeforeHover = timer !== null;
			pause();
		};
		const onMouseLeave = () => {
			if (wasPlayingBeforeHover) play();
		};
		if (opts.pauseOnHover) {
			container.addEventListener("mouseenter", onMouseEnter);
			container.addEventListener("mouseleave", onMouseLeave);
		}
		let justDragged = false;
		const onClick = (e) => {
			if (justDragged) return;
			const clicked = original.find((card) => card.contains(e.target));
			if (!clicked) return;
			if (order.indexOf(clicked) > 0) {
				goTo(original.indexOf(clicked));
				restartIfPlaying();
			}
		};
		if (opts.clickToActivate) container.addEventListener("click", onClick);
		function coord(e) {
			return vertical ? e.clientY : e.clientX;
		}
		let dragStart = 0;
		let dragging = false;
		let wasPlayingBeforeDrag = false;
		const onPointerDown = (e) => {
			if (order[0] !== e.currentTarget && !order[0].contains(e.target)) return;
			dragging = true;
			dragStart = coord(e);
			wasPlayingBeforeDrag = timer !== null;
			pause();
			order[0].style.transition = "none";
		};
		const onPointerMove = (e) => {
			if (!dragging) return;
			const d = coord(e) - dragStart;
			order[0].style.transform = vertical ? `translateY(${d}px)` : `translateX(${d}px)`;
		};
		const endDrag = (e) => {
			if (!dragging) return;
			dragging = false;
			const d = coord(e) - dragStart;
			order[0].style.transition = `${posProp} ${opts.duration}ms ${opts.easing}, transform ${opts.duration}ms ${opts.easing}, opacity ${opts.duration}ms ${opts.easing}`;
			if (Math.abs(d) > DRAG_THRESHOLD_PX) {
				d < 0 ? next() : prev();
				justDragged = true;
				setTimeout(() => {
					justDragged = false;
				}, 0);
			} else applyPositions();
			if (wasPlayingBeforeDrag) play();
		};
		if (opts.draggable) {
			container.addEventListener("pointerdown", onPointerDown);
			container.addEventListener("pointermove", onPointerMove);
			container.addEventListener("pointerup", endDrag);
			container.addEventListener("pointercancel", endDrag);
		}
		const observer = new MutationObserver((mutations) => {
			if (destroyed) return;
			let changed = false;
			for (const mutation of mutations) {
				if (mutation.type !== "childList") continue;
				for (const node of mutation.addedNodes) {
					if (node.nodeType !== 1) continue;
					const card = node;
					if (original.includes(card)) continue;
					original.push(card);
					order.push(card);
					setupCard(card);
					changed = true;
				}
				for (const node of mutation.removedNodes) {
					if (node.nodeType !== 1) continue;
					const card = node;
					const originalIndex = original.indexOf(card);
					if (originalIndex === -1) continue;
					original.splice(originalIndex, 1);
					const orderIndex = order.indexOf(card);
					if (orderIndex !== -1) order.splice(orderIndex, 1);
					changed = true;
				}
			}
			if (!changed) return;
			visibleCount = Math.max(1, Math.min(opts.visibleCards, original.length));
			for (const card of order) card.style.transition = "none";
			applyPositions();
			container.offsetHeight;
			for (const card of order) card.style.transition = `${posProp} ${opts.duration}ms ${opts.easing}, transform ${opts.duration}ms ${opts.easing}, opacity ${opts.duration}ms ${opts.easing}`;
			applyPositions();
			if (!initialized && original.length > 0) {
				initialized = true;
				if (opts.startIndex > 0) goTo(opts.startIndex);
				if (opts.autoplay) play();
			}
		});
		observer.observe(container, {
			childList: true,
			subtree: true
		});
		if (original.length > 0) {
			if (opts.startIndex > 0) goTo(opts.startIndex);
			if (opts.autoplay) play();
		}
		return {
			next() {
				next();
				restartIfPlaying();
			},
			prev() {
				prev();
				restartIfPlaying();
			},
			goTo(originalIndex) {
				goTo(originalIndex);
				restartIfPlaying();
			},
			play,
			pause,
			getActiveIndex() {
				return original.indexOf(order[0]);
			},
			destroy() {
				destroyed = true;
				pause();
				observer.disconnect();
				if (opts.pauseOnHover) {
					container.removeEventListener("mouseenter", onMouseEnter);
					container.removeEventListener("mouseleave", onMouseLeave);
				}
				if (opts.clickToActivate) container.removeEventListener("click", onClick);
				if (opts.draggable) {
					container.removeEventListener("pointerdown", onPointerDown);
					container.removeEventListener("pointermove", onPointerMove);
					container.removeEventListener("pointerup", endDrag);
					container.removeEventListener("pointercancel", endDrag);
				}
				container.classList.remove(opts.stackClass);
				clearDatasetOptions(container);
				container.style.cssText = containerRestore;
				for (const card of original) {
					card.classList.remove(opts.cardClass, opts.activeClass);
					card.style.cssText = cardRestore.get(card) ?? "";
				}
			}
		};
	}
	function createMarqueeEngine(container, opts) {
		const original = Array.from(container.children);
		const gap = opts.offset;
		const vertical = (opts.orientation ?? "horizontal") === "vertical";
		let destroyed = false;
		let playing = false;
		let rafId = null;
		let offsetPx = 0;
		let lastTs = 0;
		let dragging = false;
		let wasPlayingBeforeInterrupt = false;
		const containerRestore = container.style.cssText;
		const cardRestore = new Map(original.map((card) => [card, card.style.cssText]));
		container.classList.add(opts.stackClass);
		applyDatasetOptions(container, opts);
		if (getComputedStyle(container).position === "static") container.style.position = "relative";
		container.style.overflow = "hidden";
		container.style.display = "flex";
		applySize(container, opts);
		const track = document.createElement("div");
		track.style.display = "flex";
		track.style.flexDirection = vertical ? "column" : "row";
		track.style.gap = `${gap}px`;
		track.style.willChange = "transform";
		container.appendChild(track);
		let clones = [];
		function rebuildTrack() {
			track.innerHTML = "";
			clones = [];
			for (const card of original) {
				card.classList.add(opts.cardClass);
				card.style.flexShrink = "0";
				track.appendChild(card);
			}
			const newClones = original.map((card) => card.cloneNode(true));
			for (const clone of newClones) {
				clone.classList.add(opts.cardClass);
				clone.style.flexShrink = "0";
				track.appendChild(clone);
			}
			clones = newClones;
		}
		if (original.length > 0) rebuildTrack();
		function cardSize(card) {
			return vertical ? card.offsetHeight : card.offsetWidth;
		}
		function setWidth() {
			let w = 0;
			for (const card of original) w += cardSize(card) + gap;
			return w;
		}
		function applyTransform() {
			track.style.transform = vertical ? `translateY(${-offsetPx}px)` : `translateX(${-offsetPx}px)`;
		}
		function activeOriginalIndex() {
			let acc = 0;
			for (let i = 0; i < original.length; i++) {
				const cw = cardSize(original[i]) + gap;
				if (offsetPx < acc + cw / 2) return i;
				acc += cw;
			}
			return 0;
		}
		function setActiveClass() {
			const idx = activeOriginalIndex();
			original.forEach((card, i) => card.classList.toggle(opts.activeClass, i === idx));
			clones.forEach((card, i) => card.classList.toggle(opts.activeClass, i === idx));
		}
		function fire(hook, fromIndex, toIndex) {
			hook?.({
				fromIndex,
				toIndex,
				fromCard: original[fromIndex],
				toCard: original[toIndex]
			});
		}
		function frame(ts) {
			if (!playing || destroyed || original.length === 0) return;
			if (lastTs === 0) lastTs = ts;
			const dt = (ts - lastTs) / 1e3;
			lastTs = ts;
			const dir = opts.direction === "backward" ? -1 : 1;
			const w = setWidth();
			if (w > 0) offsetPx = ((offsetPx + dir * opts.marqueeSpeed * dt) % w + w) % w;
			applyTransform();
			rafId = requestAnimationFrame(frame);
		}
		function play() {
			if (playing || opts.marqueeSpeed <= 0 || destroyed) return;
			playing = true;
			lastTs = 0;
			rafId = requestAnimationFrame(frame);
		}
		function pause() {
			playing = false;
			if (rafId !== null) cancelAnimationFrame(rafId);
			rafId = null;
		}
		function step(dir) {
			const fromIndex = activeOriginalIndex();
			const w = setWidth();
			if (w === 0) return;
			const cardStep = cardSize(original[fromIndex]) + gap;
			offsetPx = ((offsetPx + dir * cardStep) % w + w) % w;
			applyTransform();
			const toIndex = activeOriginalIndex();
			fire(opts.onBeforeChange, fromIndex, toIndex);
			setActiveClass();
			setTimeout(() => {
				if (!destroyed) fire(opts.onAfterChange, fromIndex, toIndex);
			}, opts.duration);
		}
		function goTo(originalIndex) {
			if (!original[originalIndex]) return;
			const fromIndex = activeOriginalIndex();
			let acc = 0;
			for (let i = 0; i < originalIndex; i++) acc += cardSize(original[i]) + gap;
			offsetPx = acc;
			applyTransform();
			setActiveClass();
			fire(opts.onBeforeChange, fromIndex, originalIndex);
			setTimeout(() => {
				if (!destroyed) fire(opts.onAfterChange, fromIndex, originalIndex);
			}, opts.duration);
		}
		const onMouseEnter = () => {
			wasPlayingBeforeInterrupt = playing;
			pause();
		};
		const onMouseLeave = () => {
			if (wasPlayingBeforeInterrupt) play();
		};
		if (opts.pauseOnHover) {
			container.addEventListener("mouseenter", onMouseEnter);
			container.addEventListener("mouseleave", onMouseLeave);
		}
		const onClick = (e) => {
			const clicked = original.find((card) => card.contains(e.target));
			if (!clicked) return;
			goTo(original.indexOf(clicked));
		};
		if (opts.clickToActivate) container.addEventListener("click", onClick);
		function coord(e) {
			return vertical ? e.clientY : e.clientX;
		}
		let dragStartCoord = 0;
		let dragStartOffset = 0;
		const onPointerDown = (e) => {
			dragging = true;
			dragStartCoord = coord(e);
			dragStartOffset = offsetPx;
			wasPlayingBeforeInterrupt = playing;
			pause();
		};
		const onPointerMove = (e) => {
			if (!dragging) return;
			const d = coord(e) - dragStartCoord;
			const w = setWidth();
			if (w === 0) return;
			offsetPx = ((dragStartOffset - d) % w + w) % w;
			applyTransform();
		};
		const endDrag = () => {
			if (!dragging) return;
			dragging = false;
			setActiveClass();
			if (wasPlayingBeforeInterrupt) play();
		};
		if (opts.draggable) {
			container.addEventListener("pointerdown", onPointerDown);
			container.addEventListener("pointermove", onPointerMove);
			container.addEventListener("pointerup", endDrag);
			container.addEventListener("pointercancel", endDrag);
		}
		const observer = new MutationObserver((mutations) => {
			if (destroyed) return;
			let changed = false;
			for (const mutation of mutations) {
				if (mutation.type !== "childList") continue;
				for (const node of mutation.addedNodes) if (node.nodeType === 1 && !original.includes(node) && node !== track) {
					original.push(node);
					changed = true;
				}
				for (const node of mutation.removedNodes) if (node.nodeType === 1) {
					const idx = original.indexOf(node);
					if (idx !== -1) {
						original.splice(idx, 1);
						changed = true;
					}
				}
			}
			if (changed && original.length > 0) {
				rebuildTrack();
				for (const card of [...original, ...clones]) card.style.transition = "none";
				requestAnimationFrame(() => {
					setActiveClass();
					for (const card of [...original, ...clones]) card.style.transition = `transform ${opts.duration}ms ${opts.easing}`;
				});
			}
		});
		observer.observe(container, {
			childList: true,
			subtree: true
		});
		if (original.length > 0) {
			if (opts.startIndex > 0) goTo(opts.startIndex);
			else setActiveClass();
			if (opts.autoplay) play();
		}
		return {
			next() {
				step(1);
			},
			prev() {
				step(-1);
			},
			goTo,
			play,
			pause,
			getActiveIndex() {
				return activeOriginalIndex();
			},
			destroy() {
				destroyed = true;
				pause();
				observer.disconnect();
				if (opts.pauseOnHover) {
					container.removeEventListener("mouseenter", onMouseEnter);
					container.removeEventListener("mouseleave", onMouseLeave);
				}
				if (opts.clickToActivate) container.removeEventListener("click", onClick);
				if (opts.draggable) {
					container.removeEventListener("pointerdown", onPointerDown);
					container.removeEventListener("pointermove", onPointerMove);
					container.removeEventListener("pointerup", endDrag);
					container.removeEventListener("pointercancel", endDrag);
				}
				for (const clone of clones) clone.remove();
				container.classList.remove(opts.stackClass);
				clearDatasetOptions(container);
				container.style.cssText = containerRestore;
				for (const card of original) {
					card.classList.remove(opts.cardClass, opts.activeClass);
					card.style.cssText = cardRestore.get(card) ?? "";
					container.appendChild(card);
				}
				track.remove();
			}
		};
	}
	/**
	* Parse data-* attributes from container element into StackifyOptions.
	* Supports: data-layout, data-orientation, data-offset, data-scale-step,
	* data-visible-cards, data-interval, data-duration, data-easing, data-direction,
	* data-peek-width, data-peek-width-step, data-marquee-speed, data-autoplay,
	* data-pause-on-hover, data-click-to-activate, data-draggable, data-start-index.
	*/
	function readDataOptions(container) {
		const ds = container.dataset;
		const opts = {};
		if (ds.layout) opts.layout = ds.layout;
		if (ds.orientation) opts.orientation = ds.orientation;
		if (ds.offset !== void 0) opts.offset = Number(ds.offset);
		if (ds.scaleStep !== void 0) opts.scaleStep = Number(ds.scaleStep);
		if (ds.visibleCards !== void 0) opts.visibleCards = Number(ds.visibleCards);
		if (ds.interval !== void 0) opts.interval = Number(ds.interval);
		if (ds.duration !== void 0) opts.duration = Number(ds.duration);
		if (ds.easing) opts.easing = ds.easing;
		if (ds.direction) opts.direction = ds.direction;
		if (ds.peekWidth) opts.peekWidth = ds.peekWidth;
		if (ds.peekWidthStep !== void 0) opts.peekWidthStep = Number(ds.peekWidthStep);
		if (ds.marqueeSpeed !== void 0) opts.marqueeSpeed = Number(ds.marqueeSpeed);
		if (ds.autoplay !== void 0) opts.autoplay = ds.autoplay === "true";
		if (ds.pauseOnHover !== void 0) opts.pauseOnHover = ds.pauseOnHover === "true";
		if (ds.clickToActivate !== void 0) opts.clickToActivate = ds.clickToActivate === "true";
		if (ds.draggable !== void 0) opts.draggable = ds.draggable === "true";
		if (ds.startIndex !== void 0) opts.startIndex = Number(ds.startIndex);
		return stripUndefined(opts);
	}
	/**
	* Turns a container's children into a peeking card stack — like a small
	* deck of index cards — that auto-cycles the front card to the back on a
	* timer, cycling through every card in turn.
	*
	* @param input - Selector, element(s), or jQuery collection for the
	* *stack container* (its children become the cards).
	* @param options - Optional {@link StackifyOptions}. If omitted, reads from
	* container's `data-*` attributes.
	* @returns A {@link StackifyInstance} — `destroy()` restores every card's
	* original styles; `next()`/`prev()`/`goTo()`/`play()`/`pause()` drive the
	* stack programmatically.
	*
	* @example
	* ```html
	* <div id="testimonials"
	*   data-layout="stack"
	*   data-offset="20"
	*   data-interval="4000"
	*   data-duration="500">
	* 	<div class="card">...</div>
	* 	<div class="card">...</div>
	* 	<div class="card">...</div>
	* </div>
	* ```
	* ```ts
	* import { stackify } from "blogr-plugins";
	*
	* // Read all options from data-* attributes
	* const stack = stackify("#testimonials");
	*
	* // Or override specific options
	* const stack2 = stackify("#other", { interval: 2000 });
	*
	* stack.next(); // advance manually
	* stack.destroy();
	* ```
	*/
	function stackify(input, options) {
		const engines = resolveElements(input).map((container) => {
			const dataOpts = readDataOptions(container);
			return createEngine(container, {
				...defaults$2,
				...dataOpts,
				...stripUndefined(options || {})
			});
		}).filter((engine) => engine !== null);
		return {
			next() {
				for (const engine of engines) engine.next();
			},
			prev() {
				for (const engine of engines) engine.prev();
			},
			goTo(originalIndex) {
				for (const engine of engines) engine.goTo(originalIndex);
			},
			play() {
				for (const engine of engines) engine.play();
			},
			pause() {
				for (const engine of engines) engine.pause();
			},
			getActiveIndex() {
				return engines.map((engine) => engine.getActiveIndex());
			},
			destroy() {
				for (const engine of engines) engine.destroy();
			}
		};
	}

//#endregion
//#region src/plugins/stickify.ts
/*!
	* Sticky-sidebar engine adapted from Theia Sticky Sidebar v2.0.0
	* https://github.com/WeCodePixels/theia-sticky-sidebar
	* Copyright 2013-2025 WeCodePixels and other contributors
	* Released under the MIT license
	*
	* Ported into blogr-plugins: wrapped behind the shared ElementInput /
	* PluginInstance shape used by every plugin in this package, options
	* renamed to camelCase-consistent style, `elements` folded into the
	* function's first argument instead of living inside options.
	*/
	const defaults$1 = {
		containerSelector: "",
		additionalMarginTop: 0,
		additionalMarginBottom: 0,
		updateSidebarHeight: true,
		minWidth: 0,
		disableOnResponsiveLayouts: true,
		sidebarBehavior: "modern",
		defaultPosition: "relative",
		verbose: false
	};
	function getOffset(element) {
		const rect = element.getBoundingClientRect();
		return {
			top: rect.top + window.scrollY - document.documentElement.clientTop,
			left: rect.left + window.scrollX - document.documentElement.clientLeft
		};
	}
	function getOuterWidth(element) {
		const style = getComputedStyle(element);
		return element.getBoundingClientRect().width + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
	}
	function isVisible(element) {
		return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	}
	function resetSidebar(s) {
		s.sidebar.style.minHeight = "1px";
		Object.assign(s.stickySidebar.style, {
			position: "static",
			width: "",
			transform: "none"
		});
	}
	function getClearedHeight(element) {
		let height = element.getBoundingClientRect().height;
		for (const child of Array.from(element.children)) height = Math.max(height, child.getBoundingClientRect().height);
		return height;
	}
	/**
	* Makes a sidebar stick to the viewport while scrolling, clamped to its
	* container so it never overflows past the container's bottom edge. Full
	* option-parity port of Theia Sticky Sidebar, so it supports the same
	* `modern` / `stick-to-top` / `stick-to-bottom` behaviors and layout edge
	* cases (collapsible margins, floated multi-column layouts, responsive
	* stacking) as the original.
	*
	* @param input - Selector, element(s), or jQuery collection for the sidebar(s).
	* @param options Configuration object.
	* See {@link StickifyOptions}.
	* @returns A {@link PluginInstance} with `destroy()` to unbind everything and restore original styles.
	*
	* @example
	* ```ts
	* import { stickify } from "blogr-plugins";
	* stickify(".leftSidebar, .content, .rightSidebar", { additionalMarginTop: 30 });
	* ```
	*/
	function stickify(input, options = {}) {
		const opts = {
			...defaults$1,
			...options
		};
		opts.additionalMarginTop = Math.floor(opts.additionalMarginTop);
		opts.additionalMarginBottom = Math.floor(opts.additionalMarginBottom);
		const elements = resolveElements(input);
		const states = [];
		let initialized = false;
		function tryInit() {
			if (initialized) return true;
			if (document.body.getBoundingClientRect().width < opts.minWidth) return false;
			init();
			return true;
		}
		const tryDelayedInit = () => {
			if (tryInit()) {
				document.removeEventListener("scroll", tryDelayedInit);
				window.removeEventListener("resize", tryDelayedInit);
			}
		};
		function init() {
			initialized = true;
			if (!document.querySelector("#theia-sticky-sidebar-stylesheet")) document.head.insertAdjacentHTML("beforeend", "<style id=\"theia-sticky-sidebar-stylesheet\">.theiaStickySidebar:after {content: \"\"; display: table; clear: both;}</style>");
			for (const sidebar of elements) {
				const container = (opts.containerSelector ? document.querySelector(opts.containerSelector) : null) ?? sidebar.parentNode;
				if (!container) continue;
				Object.assign(sidebar.style, {
					position: opts.defaultPosition,
					overflow: "visible",
					boxSizing: "border-box"
				});
				let stickySidebar = sidebar.querySelector(".theiaStickySidebar");
				if (!stickySidebar) {
					const jsMimeTypes = /(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;
					for (const script of Array.from(sidebar.querySelectorAll("script"))) if (script.type.length === 0 || jsMimeTypes.test(script.type)) script.remove();
					stickySidebar = document.createElement("div");
					stickySidebar.classList.add("theiaStickySidebar");
					stickySidebar.append(...Array.from(sidebar.children));
					sidebar.append(stickySidebar);
				}
				const computed = getComputedStyle(sidebar);
				const marginBottom = parseFloat(computed.marginBottom);
				const paddingTop = parseFloat(computed.paddingTop);
				const paddingBottom = parseFloat(computed.paddingBottom);
				let collapsedTopHeight = getOffset(stickySidebar).top;
				let collapsedBottomHeight = stickySidebar.offsetHeight;
				stickySidebar.style.paddingTop = "1px";
				stickySidebar.style.paddingBottom = "1px";
				collapsedTopHeight -= getOffset(stickySidebar).top;
				collapsedBottomHeight = stickySidebar.offsetHeight - collapsedBottomHeight - collapsedTopHeight;
				const stickySidebarPaddingTop = collapsedTopHeight === 0 ? 0 : 1;
				const stickySidebarPaddingBottom = collapsedBottomHeight === 0 ? 0 : 1;
				stickySidebar.style.paddingTop = stickySidebarPaddingTop === 0 ? "0px" : "1px";
				stickySidebar.style.paddingBottom = stickySidebarPaddingBottom === 0 ? "0px" : "1px";
				const state = {
					sidebar,
					stickySidebar,
					container,
					onScroll: () => {},
					resizeObserver: null,
					previousScrollTop: 0,
					stickySidebarPaddingTop,
					stickySidebarPaddingBottom,
					marginBottom,
					paddingTop,
					paddingBottom
				};
				resetSidebar(state);
				state.onScroll = () => {
					if (!isVisible(stickySidebar)) return;
					if (document.body.getBoundingClientRect().width < opts.minWidth) {
						resetSidebar(state);
						return;
					}
					if (opts.disableOnResponsiveLayouts) {
						if ((getComputedStyle(sidebar).float === "none" ? getOuterWidth(sidebar) : sidebar.offsetWidth) + 50 > container.getBoundingClientRect().width) {
							resetSidebar(state);
							return;
						}
					}
					const scrollTop = window.scrollY;
					let position = "static";
					const sidebarOffset = getOffset(sidebar);
					let top = 0;
					if (scrollTop >= sidebarOffset.top + (state.paddingTop - opts.additionalMarginTop)) {
						const offsetTop = state.paddingTop + opts.additionalMarginTop;
						const offsetBottom = state.paddingBottom + state.marginBottom + opts.additionalMarginBottom;
						const containerTop = sidebarOffset.top;
						const containerBottom = getOffset(container).top + getClearedHeight(container);
						const windowOffsetTop = opts.additionalMarginTop;
						let windowOffsetBottom;
						if (stickySidebar.offsetHeight + offsetTop + offsetBottom < window.innerHeight) windowOffsetBottom = windowOffsetTop + stickySidebar.offsetHeight;
						else windowOffsetBottom = window.innerHeight - state.marginBottom - state.paddingBottom - opts.additionalMarginBottom;
						const staticLimitTop = containerTop - scrollTop + state.paddingTop;
						const staticLimitBottom = containerBottom - scrollTop - state.paddingBottom - state.marginBottom;
						top = getOffset(stickySidebar).top - scrollTop;
						const scrollTopDiff = state.previousScrollTop - scrollTop;
						if (getComputedStyle(stickySidebar).position === "fixed" && opts.sidebarBehavior === "modern") top += scrollTopDiff;
						if (opts.sidebarBehavior === "stick-to-top") top = opts.additionalMarginTop;
						if (opts.sidebarBehavior === "stick-to-bottom") top = windowOffsetBottom - stickySidebar.offsetHeight;
						if (scrollTopDiff > 0) top = Math.min(top, windowOffsetTop);
						else top = Math.max(top, windowOffsetBottom - stickySidebar.offsetHeight);
						top = Math.max(top, staticLimitTop);
						top = Math.min(top, staticLimitBottom - stickySidebar.offsetHeight);
						const sidebarSameHeightAsContainer = container.getBoundingClientRect().height === stickySidebar.offsetHeight;
						if (!sidebarSameHeightAsContainer && top === windowOffsetTop) position = "fixed";
						else if (!sidebarSameHeightAsContainer && top === windowOffsetBottom - stickySidebar.offsetHeight) position = "fixed";
						else if (scrollTop + top - sidebarOffset.top - state.paddingTop <= opts.additionalMarginTop) position = "static";
						else position = "absolute";
					}
					if (position === "fixed") Object.assign(stickySidebar.style, {
						position: "fixed",
						width: `${stickySidebar.getBoundingClientRect().width}px`,
						transform: `translateY(${top}px)`,
						left: `${getOffset(sidebar).left + parseFloat(getComputedStyle(sidebar).paddingLeft) - window.scrollX}px`,
						top: "0px"
					});
					else if (position === "absolute") {
						const css = {};
						if (getComputedStyle(stickySidebar).position !== "absolute") {
							css.position = "absolute";
							css.transform = `translateY(${scrollTop + top - sidebarOffset.top - state.stickySidebarPaddingTop - state.stickySidebarPaddingBottom}px)`;
							css.top = "0px";
						}
						css.width = `${stickySidebar.getBoundingClientRect().width}px`;
						css.left = "";
						Object.assign(stickySidebar.style, css);
					} else resetSidebar(state);
					if (position !== "static" && opts.updateSidebarHeight) sidebar.style.minHeight = `${stickySidebar.offsetHeight + getOffset(stickySidebar).top - sidebarOffset.top + state.paddingBottom}px`;
					state.previousScrollTop = scrollTop;
				};
				state.onScroll();
				document.addEventListener("scroll", state.onScroll);
				window.addEventListener("resize", state.onScroll);
				state.resizeObserver = new ResizeObserver(() => state.onScroll());
				state.resizeObserver.observe(stickySidebar);
				states.push(state);
			}
		}
		if (!tryInit()) {
			if (opts.verbose) console.log("stickify: viewport is under minWidth, init delayed.");
			document.addEventListener("scroll", tryDelayedInit);
			window.addEventListener("resize", tryDelayedInit);
		}
		return { destroy() {
			document.removeEventListener("scroll", tryDelayedInit);
			window.removeEventListener("resize", tryDelayedInit);
			for (const state of states) {
				document.removeEventListener("scroll", state.onScroll);
				window.removeEventListener("resize", state.onScroll);
				state.resizeObserver.disconnect();
			}
		} };
	}

//#endregion
//#region src/plugins/tocify.ts
	const defaults = { headings: "h1,h2,h3" };
	function slugify(text, used) {
		const base = text.trim().replace(/\s+/g, "_") || "heading";
		let id = base;
		let i = 1;
		while (used.has(id) || document.getElementById(id)) id = `${base}_${i++}`;
		used.add(id);
		return id;
	}
	/**
	* Builds a nested table-of-contents `<ul>` from the headings found inside a
	* container, assigning an `id` to each heading (if it doesn't already have
	* one) so the TOC links can jump to them.
	*
	* @param input - Selector, element, or jQuery collection to render the TOC into.
	* @param options Configuration object.
	* See {@link TocifyOptions}.
	* @returns A {@link PluginInstance} with `destroy()` to remove the generated TOC.
	*
	* @example
	* ```ts
	* import { tocify } from "blogr-plugins";
	* tocify("#toc", { content: "#article", headings: "h2,h3" });
	* ```
	*/
	function tocify(input, options = {}) {
		const opts = {
			...defaults,
			...options
		};
		const targets = resolveElements(input);
		const cleanups = [];
		for (const target of targets) {
			const contentRoot = opts.content ? resolveElements(opts.content)[0] ?? target : target;
			const headings = Array.from(contentRoot.querySelectorAll(opts.headings));
			const used = /* @__PURE__ */ new Set();
			const levels = opts.headings.split(",").map((s) => s.trim());
			const stack = [];
			const root = document.createElement("ul");
			root.className = "toc-list";
			stack.push({
				level: -1,
				list: root
			});
			for (const heading of headings) {
				if (!heading.id) heading.id = slugify(heading.textContent ?? "", used);
				const level = levels.indexOf(heading.tagName.toLowerCase());
				while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
				const parent = stack[stack.length - 1].list;
				const li = document.createElement("li");
				const a = document.createElement("a");
				a.href = `#${heading.id}`;
				a.textContent = heading.textContent ?? "";
				li.appendChild(a);
				parent.appendChild(li);
				const sublist = document.createElement("ul");
				li.appendChild(sublist);
				stack.push({
					level,
					list: sublist
				});
			}
			root.querySelectorAll("ul").forEach((ul) => {
				if (ul.children.length === 0) ul.remove();
			});
			if (opts.title) {
				const title = document.createElement("h2");
				title.className = "toc-title";
				title.textContent = opts.title;
				target.appendChild(title);
				cleanups.push(() => title.remove());
			}
			target.appendChild(root);
			cleanups.push(() => root.remove());
		}
		return { destroy() {
			for (const cleanup of cleanups) cleanup();
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
//#region src/browser.ts
/**
	* Registers `$.fn.stickify`, `$.fn.menuify`, `$.fn.lazify`, `$.fn.tocify`,
	* `$.fn.replacify`, `$.fn.shortcodify`, `$.fn.stackify` and `$.fn.relatify` and `$.fn.marqify`
	* on the given jQuery instance, so any plugin can be called the classic
	* jQuery way, e.g. `$("#sidebar").stickify();`.
	*
	* `createWidget` isn't included here: its `containerSelector` lives
	* *inside* its options object rather than being the jQuery target itself,
	* so it doesn't fit the `$(sel).plugin(options)` shape — call
	* `BlogrPlugins.createWidget({ containerSelector: "#el", ... })` directly.
	* `avatarify` isn't included for the same reason (its `container` is
	* inside its config object) — call `BlogrPlugins.avatarify({ ... })`.
	*
	* @param jq - A jQuery instance (`window.jQuery` / `window.$`).
	*/
	function registerJQueryPlugins(jq) {
		bindJQueryPlugin(jq, "stickify", (els, options) => stickify(els, options));
		bindJQueryPlugin(jq, "menuify", (els, options) => menuify(els, options));
		bindJQueryPlugin(jq, "lazify", (els, options) => lazify(els, options));
		bindJQueryPlugin(jq, "tocify", (els, options) => tocify(els, options));
		bindJQueryPlugin(jq, "replacify", (els, search, replacement, options) => replacify(els, search, replacement, options));
		bindJQueryPlugin(jq, "shortcodify", (els, options) => shortcodify(els, options));
		bindJQueryPlugin(jq, "stackify", (els, options) => stackify(els, options));
		bindJQueryPlugin(jq, "relatify", (els, options) => relatify(els, options));
		bindJQueryPlugin(jq, "marqify", (els, options) => marqify(els, options));
	}
	if (hasJQuery()) registerJQueryPlugins(window.jQuery);

//#endregion
exports.avatarify = avatarify;
exports.cookify = cookify;
exports.createShortcodeRegistry = createShortcodeRegistry;
exports.createWidget = createWidget;
exports.defaultShortcodeTags = defaultShortcodeTags;
exports.isSupportedImage = isSupportedImage;
exports.lazify = lazify;
exports.marqify = marqify;
exports.menuify = menuify;
exports.registerJQueryPlugins = registerJQueryPlugins;
exports.relatify = relatify;
exports.renderShortcodes = renderShortcodes;
exports.replacify = replacify;
exports.resizeImage = resizeImage;
exports.shortcodify = shortcodify;
exports.stackify = stackify;
exports.stickify = stickify;
exports.tocify = tocify;
return exports;
})({});