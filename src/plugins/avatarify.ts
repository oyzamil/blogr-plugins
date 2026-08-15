import type { ElementInput, PluginInstance } from "../types";

import { resolveElements } from "../utils/dom";
import { mergeOptions } from "../utils/merge-options";

/**
 * Any [DiceBear](https://www.dicebear.com/styles) style name (`"thumbs"`,
 * `"bottts"`, `"initials"`, `"identicon"`, ...). Kept as a plain `string`
 * rather than a strict union so new DiceBear styles work without a type
 * update.
 */
export type AvatarStyle =
	| "adventurer"
	| "adventurer-neutral"
	| "avataaars"
	| "avataaars-neutral"
	| "big-ears"
	| "big-ears-neutral"
	| "big-smile"
	| "blobs"
	| "bottts"
	| "bottts-neutral"
	| "clay"
	| "constellation"
	| "critters"
	| "croodles"
	| "croodles-neutral"
	| "disco"
	| "dylan"
	| "fun-emoji"
	| "glass"
	| "glyphs"
	| "icons"
	| "identicon"
	| "initial-face"
	| "initials"
	| "landscape"
	| "loops"
	| "lorelei"
	| "lorelei-neutral"
	| "micah"
	| "miniavs"
	| "moods"
	| "notionists"
	| "notionists-neutral"
	| "open-peeps"
	| "personas"
	| "pixel-art"
	| "pixel-art-neutral"
	| "pixelbot"
	| "planets"
	| "rings"
	| "shape-grid"
	| "shapes"
	| "sprouts"
	| "squircles"
	| "stripes"
	| "thumbs"
	| "toon-head"
	| "triangles"
	| "waves"
	| "weave";

/** Detail passed to `onAvatarSet`. */
export interface AvatarSetDetail {
	/** The username the avatar was generated for. */
	username: string;
	/** The generated avatar URL that was applied. */
	url: string;
	/** The element matched by `usernameSelector`. */
	usernameEl: Element;
	/** The element matched by `avatarSelector` that received the avatar. */
	avatarEl: Element;
}

/** Detail passed to `onSuccess`. */
export interface AvatarSuccessDetail extends AvatarSetDetail {
	/** Increments once per avatar that actually finishes loading, in load order — use to log/track individual images. */
	index: number;
	/** Stable id for this avatar: `avatarEl.id` if the element has one, else `"avatar-{index}"`. */
	id: string;
}

/** Configuration for {@link avatarify}. */
export interface AvatarifyConfig {
	/**
	 * Root element to watch (selector, element(s), or jQuery collection).
	 * The `MutationObserver` (detect dynamically-added comments) watches
	 * this element. Optional — if omitted, falls back to the closest
	 * ancestor of the first element matching `commentSelector`, then of the
	 * first element matching `avatarSelector`, then to `document.body`.
	 */
	container?: ElementInput;
	/** Selector (relative to a comment element) for the commenter's username. **Required.** */
	usernameSelector: string;
	/** Selector for the comment element that wraps one username + timestamp + avatar. **Required.** */
	commentSelector: string;
	/** Selector (relative to a comment element) for the profile-picture element. **Required.** */
	avatarSelector: string;
	/**
	 * Selector (relative to a comment element) for the timestamp element.
	 * Omit to leave the timestamp out of the avatar seed entirely (every
	 * comment from the same username then gets the same avatar).
	 */
	timestampSelector?: string;
	/**
	 * Attribute on the timestamp element to read (e.g. `"data-datetime"`).
	 * Omitted/falsy reads the element's text content instead.
	 */
	timestampAttribute?: string;
	/**
	 * `true` replaces every avatar, even ones that already have a real
	 * image. `false` (default) leaves real avatars' image alone but still
	 * re-applies them onto `avatarAttribute`'s target (src/background-image)
	 * if that differs from where the image currently lives.
	 */
	setRandomAvatarForAll?: boolean;
	/**
	 * Forces how avatar gets applied: `"src"` sets `src` attr,
	 * `"background-image"` sets inline `background-image` style. Omit for
	 * auto-detect: elements with `avatarDataAttribute` set or non-`<img>`
	 * tags get `background-image`, plain `<img>` tags get `src`.
	 */
	avatarAttribute?: "src" | "background-image";
	/**
	 * Data-attribute NAME that holds a real avatar url directly (Blogger
	 * lazy-src style, e.g. `data-image="//..."`). Checked before `src`/css
	 * bg when reading the current image. Default `"data-avatar"` — set
	 * this to match your markup, e.g. `"data-image"`.
	 */
	avatarDataAttribute?: string;
	/** DiceBear style to request. Default `"thumbs"`. */
	avatarStyle?: AvatarStyle;
	/**
	 * Background-image/`src` substrings that count as "no avatar set" —
	 * checked with `.includes()`. Extend this if your theme's blank
	 * placeholder isn't one of the two Blogger defaults already covered.
	 * An avatar with no image at all (`background-image: none` / no `src`)
	 * always counts as empty regardless of this list.
	 */
	emptyAvatarPatterns?: (string | RegExp)[];
	/** DiceBear API version segment. Default `"7.x"`. */
	dicebearVersion?: string;
	/**
	 * Full URL template overriding DiceBear entirely — `{style}` and
	 * `{seed}` are replaced (seed is pre-encoded). Use this to point at a
	 * self-hosted avatar service instead.
	 */
	apiUrl?: string;
	/**
	 * Overrides how the per-comment seed string is built. Default: the
	 * username alone when `avatarStyle` is `"initials"`, otherwise the
	 * username with the timestamp appended (so re-commenting the same text
	 * still gets a distinct avatar per comment).
	 */
	seed?: (username: string, timestamp: string) => string;
	/**
	 * `rootMargin` for each avatar's own lazy-load `IntersectionObserver` —
	 * every avatar loads independently once it nears the viewport, so only
	 * on-screen (or about-to-be) avatars ever fetch. Default `"0px"`.
	 */
	rootMargin?: string;
	/** Debounce (ms) applied to `MutationObserver`-triggered rescans, so a batch of DOM changes only triggers one pass. Default `150`. */
	debounce?: number;
	/** Called once per avatar actually set (fires right after the url is assigned to the DOM). */
	onAvatarSet?: (detail: AvatarSetDetail) => void;
	/**
	 * Called once per avatar, separately, after its image actually finishes
	 * loading (real success — not just DOM assignment). Gets `index`/`id`
	 * so you can tell which avatar loaded.
	 */
	onSuccess?: (detail: AvatarSuccessDetail) => void;
	/** Called on a recoverable issue (selector matched nothing, etc). Defaults to `console.error`. */
	onError?: (message: string) => void;
}

/** Returned by {@link avatarify}. */
export interface AvatarifyInstance extends PluginInstance {
	/** Forces an immediate load of every matched avatar, bypassing the debounce and the per-avatar in-view gate. */
	refresh(): void;
}

const defaults = {
	timestampSelector: "",
	timestampAttribute: "",
	setRandomAvatarForAll: false,
	avatarStyle: "thumbs" as AvatarStyle,
	emptyAvatarPatterns: [/(\/blank\.gif|\/blogger_logo_round_35\.png)$/] as (
		| string
		| RegExp
	)[],
	dicebearVersion: "10.x",
	avatarDataAttribute: "data-avatar",
	rootMargin: "0px",
	debounce: 150,
	onError: (message: string) => console.error(message),
};

type ResolvedConfig = typeof defaults &
	Pick<
		AvatarifyConfig,
		| "usernameSelector"
		| "commentSelector"
		| "avatarSelector"
		| "apiUrl"
		| "seed"
		| "onAvatarSet"
		| "onSuccess"
		| "avatarAttribute"
	>;

function buildAvatarUrl(opts: ResolvedConfig, seed: string): string {
	const encoded = encodeURIComponent(seed);
	if (opts.apiUrl) {
		return opts.apiUrl
			.replace("{seed}", encoded)
			.replace("{style}", opts.avatarStyle);
	}
	return `https://api.dicebear.com/${opts.dicebearVersion}/${opts.avatarStyle}/svg?seed=${encoded}`;
}

function isEmptyAvatar(
	currentValue: string,
	patterns: (string | RegExp)[],
): boolean {
	if (!currentValue || currentValue === "none") return true;
	return patterns.some((pattern) => {
		if (pattern instanceof RegExp) {
			return pattern.test(currentValue);
		}
		return currentValue.includes(pattern);
	});
}

/** Reads the `background-image` CSS url currently rendered on the element (`"none"`/`""` if unset). */
function extractBackgroundUrl(avatarEl: HTMLElement): string {
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
function extractCurrentUrl(
	avatarEl: HTMLElement,
	isImg: boolean,
	dataAttribute: string,
): string {
	const dataAvatar = avatarEl.getAttribute(dataAttribute);
	if (dataAvatar) return dataAvatar;
	if (isImg) {
		return (avatarEl as HTMLImageElement).getAttribute("src") ?? "";
	}
	return extractBackgroundUrl(avatarEl);
}

function applyAvatar(
	avatarEl: HTMLElement,
	mode: "src" | "background-image",
	url: string,
): void {
	if (mode === "src") {
		(avatarEl as HTMLImageElement).setAttribute("src", url);
	} else {
		avatarEl.style.setProperty("background-image", `url(${url})`, "important");
	}
}

/** Shared, mutable per-plugin-instance counter — same object passed into every engine so `index` stays unique across containers. */
interface CounterRef {
	value: number;
}

/**
 * Preload-probes `url`, fires `opts.onSuccess` once it actually finishes
 * loading (not just once it's assigned to the DOM). No-op if `onSuccess`
 * isn't set.
 */
function notifySuccess(
	url: string,
	counter: CounterRef,
	opts: ResolvedConfig,
	base: { username: string; usernameEl: Element; avatarEl: HTMLElement },
): void {
	if (!opts.onSuccess) return;
	const index = counter.value++;
	const id = base.avatarEl.id || `avatar-${index}`;
	const probe = new Image();
	probe.onload = () => {
		opts.onSuccess?.({ ...base, url, index, id });
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
function findNearest<T extends Element = HTMLElement>(
	from: Element,
	selector: string,
	boundary: Element,
): T | null {
	let scope: Element | null = from.parentElement;
	while (scope) {
		const match = scope.querySelector<T>(selector);
		if (match) return match;
		if (scope === boundary) break;
		scope = scope.parentElement;
	}
	return null;
}

/** Resolves + applies avatar for one comment. Called lazily, once per comment, when its avatar nears the viewport (or immediately via `refresh()`). */
function processEntry(
	usernameEl: HTMLElement,
	opts: ResolvedConfig,
	counter: CounterRef,
): void {
	const username = usernameEl.textContent?.trim();
	if (!username) return;

	const commentEl = usernameEl.closest(opts.commentSelector);
	if (!commentEl) {
		opts.onError(
			`avatarify: no ancestor found for commentSelector "${opts.commentSelector}".`,
		);
		return;
	}

	const avatarEl = findNearest<HTMLElement>(
		usernameEl,
		opts.avatarSelector,
		commentEl,
	);
	if (!avatarEl) {
		opts.onError(
			`avatarify: no elements found for avatarSelector "${opts.avatarSelector}".`,
		);
		return;
	}
	if (avatarEl.dataset.avatarSet === "true") return;

	let timestamp = "";
	if (opts.timestampSelector) {
		const timestampEl = findNearest(
			usernameEl,
			opts.timestampSelector,
			commentEl,
		);
		if (!timestampEl) {
			opts.onError(
				`avatarify: no elements found for timestampSelector "${opts.timestampSelector}".`,
			);
		} else {
			timestamp = opts.timestampAttribute
				? (timestampEl.getAttribute(opts.timestampAttribute) ?? "")
				: (timestampEl.textContent?.trim() ?? "");
		}
	}

	const isImg = avatarEl.tagName === "IMG";
	const hasDataAvatar = avatarEl.hasAttribute(opts.avatarDataAttribute);
	const mode: "src" | "background-image" =
		opts.avatarAttribute ??
		(hasDataAvatar ? "background-image" : isImg ? "src" : "background-image");

	const naturalUrl = extractCurrentUrl(
		avatarEl,
		isImg,
		opts.avatarDataAttribute,
	);
	const empty = isEmptyAvatar(naturalUrl, opts.emptyAvatarPatterns);

	if (!opts.setRandomAvatarForAll && !empty) {
		// Real avatar already known (data-avatar value, src, or css bg) —
		// leave the image alone, just make sure it's actually rendered on
		// the wanted target. Covers the data-avatar-as-lazy-src case: value
		// sits in the attribute only, background-image is still unset, so
		// this pushes it across once the element comes into view.
		const rendered =
			mode === "src"
				? ((avatarEl as HTMLImageElement).getAttribute("src") ?? "")
				: extractBackgroundUrl(avatarEl);
		if (rendered !== naturalUrl) {
			applyAvatar(avatarEl, mode, naturalUrl);
			avatarEl.dataset.avatarSet = "true";
			opts.onAvatarSet?.({ username, url: naturalUrl, usernameEl, avatarEl });
			notifySuccess(naturalUrl, counter, opts, {
				username,
				usernameEl,
				avatarEl,
			});
		}
		return;
	}

	const seed = opts.seed
		? opts.seed(username, timestamp)
		: opts.avatarStyle === "initials"
			? username
			: `${username}${timestamp}`;
	const url = buildAvatarUrl(opts, seed);

	applyAvatar(avatarEl, mode, url);
	avatarEl.dataset.avatarSet = "true";

	opts.onAvatarSet?.({ username, url, usernameEl, avatarEl });
	notifySuccess(url, counter, opts, { username, usernameEl, avatarEl });
}

/** Finds not-yet-seen comments and starts watching each one's avatar for lazy load. Returns every username element found (seen or not) so `refresh()` can force-process the lot. */
function discoverEntries(
	container: Element,
	opts: ResolvedConfig,
	avatarObserver: IntersectionObserver,
	entryMap: WeakMap<Element, HTMLElement>,
): HTMLElement[] {
	const usernameEls = container.querySelectorAll<HTMLElement>(
		opts.usernameSelector,
	);
	if (usernameEls.length === 0) {
		opts.onError(
			`avatarify: no elements found for usernameSelector "${opts.usernameSelector}".`,
		);
		return [];
	}

	const found: HTMLElement[] = [];
	for (const usernameEl of usernameEls) {
		found.push(usernameEl);
		if (usernameEl.dataset.avatarifyObserved === "true") continue;
		usernameEl.dataset.avatarifyObserved = "true";

		const commentEl = usernameEl.closest(opts.commentSelector);
		const avatarEl = commentEl
			? findNearest<HTMLElement>(usernameEl, opts.avatarSelector, commentEl)
			: null;
		const target: Element = avatarEl ?? commentEl ?? usernameEl;

		entryMap.set(target, usernameEl);
		avatarObserver.observe(target);
	}
	return found;
}

function resolveContainer(config: AvatarifyConfig): Element {
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

interface Engine {
	refresh(): void;
	destroy(): void;
}

function createEngine(
	container: Element,
	opts: ResolvedConfig,
	counter: CounterRef,
): Engine {
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let destroyed = false;
	const entryMap = new WeakMap<Element, HTMLElement>();

	// Each avatar gets its own entry in here, and only loads once *it*
	// nears the viewport — so a page with hundreds of comments only ever
	// fetches the handful actually being scrolled to.
	const avatarObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				avatarObserver.unobserve(entry.target);
				const usernameEl = entryMap.get(entry.target);
				if (usernameEl) processEntry(usernameEl, opts, counter);
			}
		},
		{ rootMargin: opts.rootMargin },
	);

	function discover(): HTMLElement[] {
		if (destroyed) return [];
		return discoverEntries(container, opts, avatarObserver, entryMap);
	}

	function scheduleDiscover(): void {
		if (destroyed) return;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debounceTimer = null;
			discover();
		}, opts.debounce);
	}

	// Detects comments added/re-rendered after the initial load (pagination,
	// "load more", async comment widgets, etc) and starts lazy-watching
	// their avatars too.
	const mutationObserver = new MutationObserver(scheduleDiscover);
	mutationObserver.observe(container, { childList: true, subtree: true });

	// Closed <details> content is `content-visibility: hidden` under the
	// hood — not rendered, so the IntersectionObserver above never sees it
	// and may not reliably re-fire once opened. `toggle` doesn't bubble in
	// every browser either, so catch it in the capture phase and just
	// force-load anything inside once it's open.
	container.addEventListener(
		"toggle",
		(event) => {
			if (destroyed) return;
			const details = event.target;
			if (!(details instanceof HTMLDetailsElement) || !details.open) return;
			const usernameEls = details.querySelectorAll<HTMLElement>(
				opts.usernameSelector,
			);
			for (const usernameEl of usernameEls) {
				processEntry(usernameEl, opts, counter);
			}
		},
		true,
	);

	discover();

	return {
		refresh() {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
				debounceTimer = null;
			}
			const usernameEls = discover();
			for (const usernameEl of usernameEls) {
				processEntry(usernameEl, opts, counter);
			}
		},
		destroy() {
			destroyed = true;
			mutationObserver.disconnect();
			avatarObserver.disconnect();
			if (debounceTimer) clearTimeout(debounceTimer);
		},
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
export function avatarify(config: AvatarifyConfig): AvatarifyInstance {
	const opts = mergeOptions(defaults, config) as ResolvedConfig;
	opts.usernameSelector = config.usernameSelector;
	opts.commentSelector = config.commentSelector;
	opts.avatarSelector = config.avatarSelector;
	opts.apiUrl = config.apiUrl;
	opts.seed = config.seed;
	opts.onAvatarSet = config.onAvatarSet;
	opts.onSuccess = config.onSuccess;
	opts.avatarAttribute = config.avatarAttribute;

	const counter: CounterRef = { value: 0 };
	const containers = config.container
		? resolveElements(config.container)
		: [resolveContainer(config)];
	const engines = containers.map((container) =>
		createEngine(container, opts, counter),
	);

	return {
		refresh() {
			for (const engine of engines) engine.refresh();
		},
		destroy() {
			for (const engine of engines) engine.destroy();
		},
	};
}
