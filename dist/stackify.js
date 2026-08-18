/*! blogr-plugins v0.0.2 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrStackify = (function(exports) {

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
//#region src/plugins/stackify.ts
	const defaults = {
		offset: 20,
		scaleStep: 0,
		visibleCards: Number.POSITIVE_INFINITY,
		interval: 3e3,
		autoplay: true,
		duration: 500,
		easing: "ease",
		direction: "forward",
		orientation: void 0,
		stackDirection: "top",
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
		if (opts.layout === "stack") {
			container.dataset.peekWidth = opts.peekWidth;
			container.dataset.stackDirection = opts.stackDirection ?? ((opts.orientation ?? "vertical") === "vertical" ? "top" : "left");
		}
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
		delete container.dataset.stackDirection;
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
		const stackDirection = opts.stackDirection ?? (vertical ? "top" : "left");
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
			card.style.transition = `top ${opts.duration}ms ${opts.easing}, right ${opts.duration}ms ${opts.easing}, bottom ${opts.duration}ms ${opts.easing}, left ${opts.duration}ms ${opts.easing}, transform ${opts.duration}ms ${opts.easing}, opacity ${opts.duration}ms ${opts.easing}`;
		}
		for (const card of original) setupCard(card);
		function applyPositions() {
			if (order.length === 0) return;
			const n = order.length;
			order.forEach((card, i) => {
				const dir = stackDirection;
				const pos = (n - 1 - i) * gap;
				const scale = 1 - i * opts.scaleStep;
				const peekDelta = opts.peekWidth === "expand" ? i * opts.peekWidthStep : opts.peekWidth === "shrink" ? -i * opts.peekWidthStep : 0;
				const peekScale = Math.max(.1, 1 + peekDelta);
				const mainAxisVertical = dir === "top" || dir === "bottom";
				const transformParts = [];
				if (scale !== 1) transformParts.push(`scale(${scale})`);
				if (peekScale !== 1) transformParts.push(mainAxisVertical ? `scaleX(${peekScale})` : `scaleY(${peekScale})`);
				card.style.top = "";
				card.style.right = "";
				card.style.bottom = "";
				card.style.left = "";
				if (mainAxisVertical) {
					card.style.left = "0";
					card.style.right = "0";
				} else {
					card.style.top = "0";
					card.style.bottom = "0";
				}
				card.style[dir] = `${pos}px`;
				card.style.transformOrigin = dir === "top" ? "top center" : dir === "bottom" ? "bottom center" : dir === "left" ? "center left" : "center right";
				card.style.zIndex = String(n - i);
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
			order[0].style.transition = `top ${opts.duration}ms ${opts.easing}, right ${opts.duration}ms ${opts.easing}, bottom ${opts.duration}ms ${opts.easing}, left ${opts.duration}ms ${opts.easing}, transform ${opts.duration}ms ${opts.easing}, opacity ${opts.duration}ms ${opts.easing}`;
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
			for (const card of order) card.style.transition = `top ${opts.duration}ms ${opts.easing}, right ${opts.duration}ms ${opts.easing}, bottom ${opts.duration}ms ${opts.easing}, left ${opts.duration}ms ${opts.easing}, transform ${opts.duration}ms ${opts.easing}, opacity ${opts.duration}ms ${opts.easing}`;
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
	* data-pause-on-hover, data-click-to-activate, data-draggable, data-start-index,
	* data-stack-direction.
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
		if (ds.stackDirection) opts.stackDirection = ds.stackDirection;
		if (ds.peekWidthStep !== void 0) opts.peekWidthStep = Number(ds.peekWidthStep);
		if (ds.marqueeSpeed !== void 0) opts.marqueeSpeed = Number(ds.marqueeSpeed);
		if (ds.autoplay !== void 0) opts.autoplay = ds.autoplay === "true";
		if (ds.pauseOnHover !== void 0) opts.pauseOnHover = ds.pauseOnHover === "true";
		if (ds.clickToActivate !== void 0) opts.clickToActivate = ds.clickToActivate === "true";
		if (ds.draggable !== void 0) opts.draggable = ds.draggable === "true";
		if (ds.startIndex !== void 0) opts.startIndex = Number(ds.startIndex);
		return opts;
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
	*   data-duration="500"
	*   data-stack-direction="right">
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
	* const stack2 = stackify("#other", { interval: 2000, stackDirection: "all" });
	*
	* stack.next(); // advance manually
	* stack.destroy();
	* ```
	*/
	function stackify(input, options) {
		const engines = resolveElements(input).map((container) => {
			const dataOpts = readDataOptions(container);
			return createEngine(container, mergeOptions(mergeOptions(defaults, dataOpts), options || {}));
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
//#region src/browser/stackify.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { stackify });
	if (hasJQuery()) bindJQueryPlugin(window.jQuery, "stackify", (els, options) => stackify(els, options));

//#endregion
exports.stackify = stackify;
return exports;
})({});