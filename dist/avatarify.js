/*! blogr-plugins v0.0.1 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrAvatarify = (function(exports) {

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
	const defaults = {
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
	function createEngine(container, opts, counter) {
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
		const opts = mergeOptions(defaults, config);
		opts.usernameSelector = config.usernameSelector;
		opts.commentSelector = config.commentSelector;
		opts.avatarSelector = config.avatarSelector;
		opts.apiUrl = config.apiUrl;
		opts.seed = config.seed;
		opts.onAvatarSet = config.onAvatarSet;
		opts.onSuccess = config.onSuccess;
		opts.avatarAttribute = config.avatarAttribute;
		const counter = { value: 0 };
		const engines = (config.container ? resolveElements(config.container) : [resolveContainer(config)]).map((container) => createEngine(container, opts, counter));
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
//#region src/browser/avatarify.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { avatarify });

//#endregion
exports.avatarify = avatarify;
return exports;
})({});