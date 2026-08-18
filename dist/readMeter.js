/*! blogr-plugins v0.0.3 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrReadMeter = (function(exports) {

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
//#region src/plugins/readMeter.ts
	const defaults = {
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
		debounceMs: 250
	};
	const BADGE_CLASS = "readmeter";
	const CODE_SELECTOR = "pre, code";
	/** Counts words via whitespace splitting — same technique used across the plugin suite. */
	function countWords(text) {
		const trimmed = text.trim();
		if (!trimmed) return 0;
		return trimmed.split(/\s+/).length;
	}
	/**
	* Splits `contentEl`'s text into "plain" text and "code" text (the
	* concatenated text of every `<pre>`/`<code>` descendant), without
	* mutating the live DOM — works off a detached clone.
	*/
	function splitPlainAndCode(contentEl) {
		const clone = contentEl.cloneNode(true);
		const codeEls = Array.from(clone.querySelectorAll(CODE_SELECTOR));
		const codeText = codeEls.map((el) => el.textContent ?? "").join(" ");
		for (const el of codeEls) el.remove();
		return {
			plainText: clone.textContent ?? "",
			codeText
		};
	}
	/**
	* Resolves which elements inside `target` contribute to the read-time
	* calculation for `includeElements`: every descendant matching any of the
	* given selectors (deduplicated), or `target` itself if the list is
	* empty or none of the selectors match anything inside it.
	*/
	function resolveIncludedRoots(target, includeElements) {
		if (includeElements.length === 0) return [target];
		const matched = /* @__PURE__ */ new Set();
		for (const sel of includeElements) for (const el of target.querySelectorAll(sel)) matched.add(el);
		return matched.size > 0 ? Array.from(matched) : [target];
	}
	/**
	* Builds a detached container holding clones of every element
	* `includeElements` resolves to (or a clone of `target` itself if that
	* list is empty/unmatched), with every `excludeElements` match removed
	* from within it. Never touches the live DOM.
	*/
	function buildMeasurementRoot(target, includeElements, excludeElements) {
		const roots = resolveIncludedRoots(target, includeElements);
		const container = document.createElement("div");
		for (const root of roots) {
			if (container.childNodes.length > 0) container.appendChild(document.createTextNode(" "));
			container.appendChild(root.cloneNode(true));
		}
		for (const sel of excludeElements) for (const el of Array.from(container.querySelectorAll(sel))) el.remove();
		return container;
	}
	function formatTime(minutes, format) {
		if (format === "minutes+seconds") {
			const totalSeconds = Math.round(minutes * 60);
			return `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
		}
		const whole = Math.max(1, Math.ceil(minutes));
		return format === "text" ? `${whole} minute read` : String(whole);
	}
	function calculate(contentEl, opts) {
		const { plainText, codeText } = opts.includeCode ? splitPlainAndCode(contentEl) : {
			plainText: contentEl.textContent ?? "",
			codeText: ""
		};
		const plainWords = countWords(plainText);
		const codeWords = opts.includeCode ? countWords(codeText) : 0;
		const textMinutes = plainWords / opts.wordsPerMinute;
		const codeMinutes = opts.includeCode ? codeWords / opts.codeWordsPerMinute : 0;
		const imageMinutes = (opts.includeImages ? contentEl.querySelectorAll("img").length : 0) * opts.imageTimeSeconds / 60;
		const minutes = textMinutes + codeMinutes + imageMinutes;
		return {
			minutes,
			timeString: formatTime(minutes, opts.format)
		};
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
	function readMeter(input, options = {}) {
		const opts = mergeOptions(defaults, options);
		const targets = resolveElements(input);
		const badges = /* @__PURE__ */ new Map();
		let resizeTimer = null;
		let destroyed = false;
		function resolveAppendTarget(target) {
			if (opts.appendTo == null) return null;
			if (typeof opts.appendTo === "string") return target.querySelector(opts.appendTo) ?? document.querySelector(opts.appendTo);
			return opts.appendTo;
		}
		function renderBadge(target, timeString) {
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
		function runOne(target) {
			const { minutes, timeString } = calculate(buildMeasurementRoot(target, opts.includeElements, opts.excludeElements), opts);
			renderBadge(target, timeString);
			options.onUpdate?.(timeString, minutes);
		}
		function runAll() {
			for (const target of targets) runOne(target);
		}
		runAll();
		function onResize() {
			if (destroyed) return;
			if (resizeTimer) clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				resizeTimer = null;
				runAll();
			}, opts.debounceMs);
		}
		if (opts.updateOnResize) window.addEventListener("resize", onResize);
		return {
			refresh() {
				if (!destroyed) runAll();
			},
			destroy() {
				destroyed = true;
				if (resizeTimer) clearTimeout(resizeTimer);
				if (opts.updateOnResize) window.removeEventListener("resize", onResize);
				for (const badge of badges.values()) badge.remove();
				badges.clear();
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
//#region src/browser/readMeter.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { readMeter });
	if (hasJQuery()) bindJQueryPlugin(window.jQuery, "readMeter", (els, options) => readMeter(els, options));

//#endregion
exports.readMeter = readMeter;
return exports;
})({});