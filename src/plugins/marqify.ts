import { type ElementInput, type PluginInstance } from "../types";
import { resolveElements } from "../utils/dom";
import { mergeOptions } from "../utils/merge-options";

/** Which mode {@link marqify} renders: a continuous scroller, or a one-at-a-time ticker. Default `"marquee"`. */
export type MarqifyType = "marquee" | "ticker";

/**
 * Which way content moves. `"marquee"` only supports `"left"` / `"right"`;
 * `"ticker"` supports all four.
 */
export type MarqifyDirection = "left" | "right" | "top" | "bottom";

/** Direction values valid when `type` is `"marquee"`. */
export type MarqifyMarqueeDirection = "left" | "right";

/** Named speed presets, or a raw numeric speed for fine control. */
export type MarqifySpeed = "slow" | "medium" | "fast" | number;

/** Configuration for {@link marqify}. */
export interface MarqifyOptions {
	/**
	 * `"marquee"` scrolls content continuously and seamlessly.
	 * `"ticker"` shows one item at a time, sliding to the next/previous
	 * item — either on its own timer or via {@link MarqifyInstance.next}
	 * and {@link MarqifyInstance.previous}. Default `"marquee"`.
	 */
	type?: MarqifyType;
	/**
	 * Which way content moves. For `type: "marquee"` only `"left"` /
	 * `"right"` are valid (anything else falls back to `"left"` with a
	 * warning). For `type: "ticker"` all four are valid. Default `"left"`.
	 */
	direction?: MarqifyDirection;
	/** Delay, in ms, before the marquee starts moving. `0` (default) means no delay. Marquee only. */
	delayBeforeStart?: number;
	/**
	 * Duplicates the container's content so the marquee loops seamlessly
	 * with no visible reset. `false` renders the content once with no
	 * duplication — the animation still runs, but jumps back to the start
	 * every cycle instead of looping smoothly. Default `true`. Marquee only.
	 */
	duplicated?: boolean;
	/** Pauses the marquee while the pointer is over it. Default `true`. Marquee only. Also pauses ticker autoplay on hover. */
	pauseOnHover?: boolean;
	/**
	 * `"slow"` / `"medium"` / `"fast"` map to `0.25` / `0.5` / `1`
	 * respectively (higher = faster); pass a number directly for finer
	 * control. Default `"medium"`.
	 *
	 * For `type: "ticker"` this instead controls the slide transition —
	 * `"slow"` / `"medium"` / `"fast"` map to `800` / `500` / `300` ms;
	 * pass a number directly to set the transition duration in ms.
	 */
	speed?: MarqifySpeed;
	/** Ticker only. Auto-advances to the next item on a timer. Default `true`. */
	autoPlay?: boolean;
	/** Ticker only. Ms between auto-advances when `autoPlay` is on. Default `3000`. */
	interval?: number;
}

/** What {@link marqify} returns. `next()` / `previous()` are no-ops when `type` is `"marquee"`. */
export interface MarqifyInstance extends PluginInstance {
	/** Slide to the next item. Ticker only — no-op for `"marquee"`. */
	next(): void;
	/** Slide to the previous item. Ticker only — no-op for `"marquee"`. */
	previous(): void;
}

const SPEED_MAP: Record<Exclude<MarqifySpeed, number>, number> = {
	slow: 0.25,
	medium: 0.5,
	fast: 1,
};

const TICKER_DURATION_MAP: Record<Exclude<MarqifySpeed, number>, number> = {
	slow: 800,
	medium: 500,
	fast: 300,
};

const defaults = {
	type: "marquee" as MarqifyType,
	direction: "left" as MarqifyDirection,
	delayBeforeStart: 0,
	duplicated: true,
	pauseOnHover: true,
	speed: "medium" as MarqifySpeed,
	autoPlay: true,
	interval: 3000,
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
function injectStyles(): void {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement("style");
	style.id = STYLE_ID;
	style.textContent = STYLES;
	document.head.appendChild(style);
}

function resolveSpeed(speed: MarqifySpeed): number {
	return typeof speed === "number" ? speed : SPEED_MAP[speed];
}

function calcReps(containerSize: number, itemSize: number): number {
	return itemSize > 0 ? Math.ceil(containerSize / itemSize) : 1;
}

function calcAnimationDuration(
	itemSize: number,
	reps: number,
	speed: number,
): string {
	return `${((itemSize ?? 0) * reps) / (100 * speed)}s`;
}

function resolveTickerDuration(speed: MarqifySpeed): number {
	return typeof speed === "number" ? speed : TICKER_DURATION_MAP[speed];
}

function reverseDirection(direction: MarqifyDirection): MarqifyDirection {
	const opposite: Record<MarqifyDirection, MarqifyDirection> = {
		left: "right",
		right: "left",
		top: "bottom",
		bottom: "top",
	};
	return opposite[direction];
}

/** Off-screen resting transform for a slide entering from the side opposite `direction`. */
function enterTransform(direction: MarqifyDirection): string {
	switch (direction) {
		case "left":
			return "translate3d(100%, 0, 0)";
		case "right":
			return "translate3d(-100%, 0, 0)";
		case "top":
			return "translate3d(0, 100%, 0)";
		case "bottom":
			return "translate3d(0, -100%, 0)";
	}
}

/** Off-screen transform a slide animates to when leaving in `direction`. */
function exitTransform(direction: MarqifyDirection): string {
	return enterTransform(reverseDirection(direction));
}

interface Engine {
	destroy(): void;
	next(): void;
	previous(): void;
}

function createMarqueeEngine(
	container: HTMLElement,
	opts: Required<MarqifyOptions>,
): Engine {
	const slotHTML = container.innerHTML;
	const cloneCount = opts.duplicated ? 2 : 1;
	const numericSpeed = resolveSpeed(opts.speed);

	let reps = 1;
	let containerWidth = 0;
	let itemWidth = 0;
	let itemObserver: ResizeObserver | null = null;

	container.innerHTML = "";
	container.setAttribute("data-marqify", "");
	container.setAttribute("data-marqify-type", "marquee");
	container.setAttribute("data-marqify-direction", opts.direction);
	if (opts.pauseOnHover)
		container.setAttribute("data-marqify-pause-on-hover", "");

	const inner = document.createElement("div");
	inner.setAttribute("data-marqify-inner", "");
	for (let clone = 0; clone < cloneCount; clone++) {
		const content = document.createElement("div");
		content.setAttribute("data-marqify-content", "");
		inner.appendChild(content);
	}
	container.appendChild(inner);

	function buildItems(): void {
		const contents = inner.querySelectorAll<HTMLElement>(
			"[data-marqify-content]",
		);
		contents.forEach((content, clone) => {
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

	function applyDuration(): void {
		const duration = calcAnimationDuration(itemWidth, reps, numericSpeed);
		const contents = inner.querySelectorAll<HTMLElement>(
			"[data-marqify-content]",
		);
		contents.forEach((content) => {
			content.style.animationDuration = duration;
			content.style.animationDelay =
				opts.delayBeforeStart > 0 ? `${opts.delayBeforeStart}ms` : "";
		});
	}

	function recalc(): void {
		const newReps = calcReps(containerWidth, itemWidth);
		if (newReps !== reps) {
			reps = newReps;
			buildItems();
		} else {
			applyDuration();
		}
	}

	function observeItem(): void {
		itemObserver?.disconnect();
		const firstItem = container.querySelector<HTMLElement>(
			"[data-marqify-item]",
		);
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
		// Marquee scrolls continuously — next()/previous() don't apply.
		next() {},
		previous() {},
	};
}

function createTickerEngine(
	container: HTMLElement,
	opts: Required<MarqifyOptions>,
): Engine {
	const originalHTML = container.innerHTML;
	const itemEls = Array.from(container.children) as HTMLElement[];
	const durationMs = resolveTickerDuration(opts.speed);

	let currentIndex = 0;
	let locked = false;
	let heightObserver: ResizeObserver | null = null;
	let autoplayTimer: ReturnType<typeof setInterval> | null = null;

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
		slide.style.transform =
			i === 0 ? "translate3d(0, 0, 0)" : enterTransform(opts.direction);
		slide.appendChild(item);
		inner.appendChild(slide);
		return slide;
	});

	container.appendChild(inner);

	function observeHeight(): void {
		heightObserver?.disconnect();
		const active = slideEls[currentIndex];
		if (!active) return;
		heightObserver = new ResizeObserver(([entry]) => {
			inner.style.height = `${entry.contentRect.height}px`;
		});
		heightObserver.observe(active);
	}

	observeHeight();

	function stopAutoplay(): void {
		if (autoplayTimer !== null) {
			clearInterval(autoplayTimer);
			autoplayTimer = null;
		}
	}

	function startAutoplay(): void {
		if (!opts.autoPlay || slideEls.length < 2) return;
		stopAutoplay();
		autoplayTimer = setInterval(() => {
			goTo(currentIndex + 1, opts.direction);
		}, opts.interval);
	}

	function handleMouseEnter(): void {
		if (opts.pauseOnHover) stopAutoplay();
	}
	function handleMouseLeave(): void {
		if (opts.pauseOnHover) startAutoplay();
	}
	container.addEventListener("mouseenter", handleMouseEnter);
	container.addEventListener("mouseleave", handleMouseLeave);
	startAutoplay();

	function goTo(newIndex: number, direction: MarqifyDirection): void {
		if (slideEls.length < 2 || locked) return;
		const target =
			((newIndex % slideEls.length) + slideEls.length) % slideEls.length;
		if (target === currentIndex) return;

		locked = true;
		const outEl = slideEls[currentIndex];
		const inEl = slideEls[target];

		outEl.removeAttribute("aria-hidden");
		inEl.removeAttribute("aria-hidden");

		inEl.style.transition = "none";
		inEl.style.transform = enterTransform(direction);
		// Force reflow so the "none" transition + start position are applied
		// before switching to the animated end state.
		void inEl.offsetWidth;

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
		},
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
export function marqify(
	input: ElementInput,
	options: MarqifyOptions = {},
): MarqifyInstance {
	injectStyles();
	const opts = mergeOptions(defaults, options);

	if (
		opts.type === "marquee" &&
		opts.direction !== "left" &&
		opts.direction !== "right"
	) {
		console.warn(
			`marqify: direction "${opts.direction}" is only valid for type: "ticker" — falling back to "left" for this marquee.`,
		);
		opts.direction = "left";
	}

	const containers = resolveElements(input) as HTMLElement[];
	const createEngine =
		opts.type === "ticker" ? createTickerEngine : createMarqueeEngine;
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
		},
	};
}
