import { type ElementInput, type PluginInstance } from "../types.js";
import { resolveElements } from "../utils/dom.js";
import { mergeOptions } from "../utils/merge-options.js";

/** How the computed read time is rendered as a string. */
export type ReadMeterFormat = "minutes" | "minutes+seconds" | "text";

/** Configuration options for {@link readMeter}. */
export interface ReadMeterOptions {
	/**
	 * CSS selectors, relative to each matched target, for the child
	 * elements to include in the read-time calculation — e.g.
	 * `["article", ".excerpt"]`. Every matching descendant across all
	 * given selectors is included (deduplicated). If omitted, or if none
	 * of the selectors match anything inside the target, the whole
	 * target is used instead.
	 * @default undefined (whole target)
	 */
	includeElements?: string[];
	/**
	 * CSS selectors, relative to each matched target, for descendants to
	 * strip out of the calculation — e.g. `[".share-buttons", ".ad"]`.
	 * Applied after {@link includeElements}, so it can exclude a nested
	 * element within whatever was included.
	 * @default undefined (nothing excluded)
	 */
	excludeElements?: string[];
	/**
	 * Reading speed in words per minute.
	 * @default 200
	 */
	wordsPerMinute?: number;
	/**
	 * Add extra time for images.
	 * @default false
	 */
	includeImages?: boolean;
	/**
	 * Seconds per image when includeImages true.
	 * @default 10
	 */
	imageTimeSeconds?: number;
	/**
	 * Count code blocks (`<pre>`, `<code>`) separately, at
	 * {@link codeWordsPerMinute} instead of {@link wordsPerMinute}, rather
	 * than folding their text into the regular word count.
	 * @default false
	 */
	includeCode?: boolean;
	/**
	 * Words per minute for code when includeCode true.
	 * @default 100
	 */
	codeWordsPerMinute?: number;
	/**
	 * Output format.
	 * - "minutes" – e.g., "5"
	 * - "minutes+seconds" – e.g., "5m 30s"
	 * - "text" – e.g., "5 minute read"
	 * @default "minutes"
	 */
	format?: ReadMeterFormat;
	/**
	 * Renders the badge's markup. Receives the formatted time string,
	 * returns the HTML to use as the badge's `innerHTML` verbatim —
	 * matches the `template` convention used by {@link createWidget} and
	 * {@link relatify}.
	 * @default (time) => `Read time: ${time}`
	 */
	template?: (readTime: string) => string;
	/**
	 * Selector or element where to insert read time. The badge is
	 * *appended* into it (existing content is left alone) and reused on
	 * recalculation rather than duplicated.
	 * If null, no auto-insert – just return value via onUpdate.
	 * @default null
	 */
	appendTo?: string | HTMLElement | null;
	/**
	 * Recalculate on window resize (e.g., after layout shift).
	 * @default false
	 */
	updateOnResize?: boolean;
	/**
	 * Debounce delay in ms for resize handler.
	 * @default 250
	 */
	debounceMs?: number;
	/**
	 * Callback after each calculation.
	 * Receives formatted time string and raw (unrounded) minutes.
	 */
	onUpdate?: (timeString: string, minutes: number) => void;
}

/** Returned by {@link readMeter}. */
export interface ReadMeterInstance extends PluginInstance {
	/**
	 * Re-runs the calculation immediately (e.g. after content was swapped
	 * in via AJAX, outside of a resize event) and re-renders/fires
	 * `onUpdate` exactly like the initial run.
	 */
	refresh(): void;
}

const defaults: Required<
	Pick<
		ReadMeterOptions,
		| "includeElements"
		| "excludeElements"
		| "wordsPerMinute"
		| "includeImages"
		| "imageTimeSeconds"
		| "includeCode"
		| "codeWordsPerMinute"
		| "format"
		| "template"
		| "appendTo"
		| "updateOnResize"
		| "debounceMs"
	>
> = {
	includeElements: [],
	excludeElements: [],
	wordsPerMinute: 200,
	includeImages: false,
	imageTimeSeconds: 10,
	includeCode: false,
	codeWordsPerMinute: 100,
	format: "minutes",
	template: (time) => `Read time: ${time}`,
	appendTo: null,
	updateOnResize: false,
	debounceMs: 250,
};

const BADGE_CLASS = "readmeter";
const CODE_SELECTOR = "pre, code";

/** Counts words via whitespace splitting — same technique used across the plugin suite. */
function countWords(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}

/**
 * Splits `contentEl`'s text into "plain" text and "code" text (the
 * concatenated text of every `<pre>`/`<code>` descendant), without
 * mutating the live DOM — works off a detached clone.
 */
function splitPlainAndCode(contentEl: Element): {
	plainText: string;
	codeText: string;
} {
	const clone = contentEl.cloneNode(true) as Element;
	const codeEls = Array.from(clone.querySelectorAll(CODE_SELECTOR));
	const codeText = codeEls.map((el) => el.textContent ?? "").join(" ");
	for (const el of codeEls) el.remove();
	const plainText = clone.textContent ?? "";
	return { plainText, codeText };
}

/**
 * Resolves which elements inside `target` contribute to the read-time
 * calculation for `includeElements`: every descendant matching any of the
 * given selectors (deduplicated), or `target` itself if the list is
 * empty or none of the selectors match anything inside it.
 */
function resolveIncludedRoots(
	target: HTMLElement,
	includeElements: string[],
): Element[] {
	if (includeElements.length === 0) return [target];

	const matched = new Set<Element>();
	for (const sel of includeElements) {
		for (const el of target.querySelectorAll(sel)) matched.add(el);
	}
	return matched.size > 0 ? Array.from(matched) : [target];
}

/**
 * Builds a detached container holding clones of every element
 * `includeElements` resolves to (or a clone of `target` itself if that
 * list is empty/unmatched), with every `excludeElements` match removed
 * from within it. Never touches the live DOM.
 */
function buildMeasurementRoot(
	target: HTMLElement,
	includeElements: string[],
	excludeElements: string[],
): HTMLElement {
	const roots = resolveIncludedRoots(target, includeElements);
	const container = document.createElement("div");
	for (const root of roots) {
		// A space between concatenated roots stops the last word of one
		// and the first word of the next from merging into one "word".
		if (container.childNodes.length > 0) {
			container.appendChild(document.createTextNode(" "));
		}
		container.appendChild(root.cloneNode(true));
	}

	for (const sel of excludeElements) {
		for (const el of Array.from(container.querySelectorAll(sel))) {
			el.remove();
		}
	}

	return container;
}

interface Calculation {
	minutes: number;
	timeString: string;
}

function formatTime(minutes: number, format: ReadMeterFormat): string {
	if (format === "minutes+seconds") {
		const totalSeconds = Math.round(minutes * 60);
		const m = Math.floor(totalSeconds / 60);
		const s = totalSeconds % 60;
		return `${m}m ${s}s`;
	}

	// "minutes" and "text" both show a whole-number minute count, never
	// rounding down to 0 for non-empty content.
	const whole = Math.max(1, Math.ceil(minutes));
	return format === "text" ? `${whole} minute read` : String(whole);
}

function calculate(
	contentEl: Element,
	opts: Required<
		Pick<
			ReadMeterOptions,
			| "wordsPerMinute"
			| "includeImages"
			| "imageTimeSeconds"
			| "includeCode"
			| "codeWordsPerMinute"
			| "format"
		>
	>,
): Calculation {
	const { plainText, codeText } = opts.includeCode
		? splitPlainAndCode(contentEl)
		: { plainText: contentEl.textContent ?? "", codeText: "" };

	const plainWords = countWords(plainText);
	const codeWords = opts.includeCode ? countWords(codeText) : 0;

	const textMinutes = plainWords / opts.wordsPerMinute;
	const codeMinutes = opts.includeCode
		? codeWords / opts.codeWordsPerMinute
		: 0;

	const imageCount = opts.includeImages
		? contentEl.querySelectorAll("img").length
		: 0;
	const imageMinutes = (imageCount * opts.imageTimeSeconds) / 60;

	const minutes = textMinutes + codeMinutes + imageMinutes;
	const timeString = formatTime(minutes, opts.format);

	return { minutes, timeString };
}

/**
 * Estimates reading time for one or more content blocks — word count
 * (optionally splitting out code blocks at a slower reading speed) plus
 * optional flat per-image time — and renders it as a small badge, e.g.
 * `"Read time: 5"`.
 *
 * @param input - Selector, element(s), or jQuery collection for the
 * container(s) to analyze. By default the whole container's text is
 * measured; use `options.includeElements`/`options.excludeElements` to
 * narrow that down to specific children.
 * @param options - {@link ReadMeterOptions}
 * @returns A {@link ReadMeterInstance} — `refresh()` to force an
 * immediate recalculation, `destroy()` to remove any inserted badges and
 * stop listening for resize.
 *
 * @example
 * ```ts
 * import { readMeter } from "blogr-plugins";
 *
 * readMeter(".post", {
 * 	includeElements: ["article"],
 * 	excludeElements: [".share-buttons", ".author-bio"],
 * 	wordsPerMinute: 200,
 * 	includeImages: true,
 * 	format: "text",
 * 	appendTo: ".post-meta",
 * });
 * ```
 */
export function readMeter(
	input: ElementInput,
	options: ReadMeterOptions = {},
): ReadMeterInstance {
	const opts = mergeOptions(defaults, options);
	const targets = resolveElements(input) as HTMLElement[];

	const badges = new Map<HTMLElement, HTMLElement>();
	let resizeTimer: ReturnType<typeof setTimeout> | null = null;
	let destroyed = false;

	function resolveAppendTarget(target: HTMLElement): HTMLElement | null {
		if (opts.appendTo == null) return null;
		if (typeof opts.appendTo === "string") {
			return (
				(target.querySelector(opts.appendTo) as HTMLElement | null) ??
				(document.querySelector(opts.appendTo) as HTMLElement | null)
			);
		}
		return opts.appendTo;
	}

	function renderBadge(target: HTMLElement, timeString: string): void {
		const mount = resolveAppendTarget(target);
		if (!mount) return;

		let badge = badges.get(target);
		if (!badge) {
			badge = document.createElement("span");
			badge.className = BADGE_CLASS;
			badges.set(target, badge);
		}
		if (badge.parentElement !== mount) mount.appendChild(badge);

		badge.innerHTML = opts.template(timeString);
	}

	function runOne(target: HTMLElement): void {
		const contentEl = buildMeasurementRoot(
			target,
			opts.includeElements,
			opts.excludeElements,
		);
		const { minutes, timeString } = calculate(contentEl, opts);
		renderBadge(target, timeString);
		options.onUpdate?.(timeString, minutes);
	}

	function runAll(): void {
		for (const target of targets) runOne(target);
	}

	runAll();

	function onResize(): void {
		if (destroyed) return;
		if (resizeTimer) clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			resizeTimer = null;
			runAll();
		}, opts.debounceMs);
	}

	if (opts.updateOnResize) {
		window.addEventListener("resize", onResize);
	}

	return {
		refresh() {
			if (!destroyed) runAll();
		},
		destroy() {
			destroyed = true;
			if (resizeTimer) clearTimeout(resizeTimer);
			if (opts.updateOnResize) {
				window.removeEventListener("resize", onResize);
			}
			for (const badge of badges.values()) badge.remove();
			badges.clear();
		},
	};
}
