/**
 * Anything a plugin accepts as its target: a CSS selector, a single element,
 * a list of elements, or a jQuery collection (if jQuery is on the page).
 */
export type ElementInput =
	| string
	| Element
	| Element[]
	| NodeListOf<Element>
	| ArrayLike<Element>;

/**
 * Common shape returned by every plugin instance so callers always have a
 * predictable way to tear a plugin down.
 */
export interface PluginInstance {
	/** Removes listeners/observers and undoes DOM changes made by the plugin. */
	destroy(): void;
}

/** Minimal shape of a jQuery-like object, kept dependency-free. */
export interface JQueryLike extends ArrayLike<Element> {
	jquery?: string;
}
