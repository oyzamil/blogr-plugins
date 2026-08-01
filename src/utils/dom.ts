import type { ElementInput } from "../types.js";

/**
 * Normalizes any supported input (selector string, Element, NodeList, array,
 * or jQuery collection) into a plain array of Elements.
 *
 * @param input - Selector string, Element, element list, or jQuery object.
 * @returns Array of matched elements. Empty if nothing matched.
 */
export function resolveElements(input: ElementInput): Element[] {
	if (typeof input === "string") {
		return Array.from(document.querySelectorAll(input));
	}
	if (input instanceof Element) {
		return [input];
	}
	if (input == null) {
		return [];
	}
	// NodeList, array, or jQuery-like (has numeric indices + length)
	return Array.from(input as ArrayLike<Element>);
}

/**
 * Runs `fn` once the DOM is ready (or immediately if it already is).
 *
 * @param fn - Callback to run on DOMContentLoaded / immediately.
 */
export function onReady(fn: () => void): void {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", fn, { once: true });
	} else {
		fn();
	}
}
