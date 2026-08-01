import type { PluginInstance } from "../types.js";

/**
 * Registers one jQuery plugin method (`$.fn[name]`) that wraps a Blogr
 * plugin function. Skips silently if jQuery isn't present or the method
 * already exists.
 *
 * @param jq - jQuery instance (`window.jQuery`).
 * @param name - Method name, e.g. `"stickify"`.
 * @param fn - Underlying plugin function `(elements, ...args) => PluginInstance`.
 */
export function bindJQueryPlugin(
	jq: any,
	name: string,
	fn: (els: Element[], ...args: any[]) => PluginInstance,
): void {
	if (!jq || !jq.fn || jq.fn[name]) return;

	jq.fn[name] = function (this: any, ...args: unknown[]) {
		const instance = fn(this.get(), ...args);
		this.data(`blogr-${name}`, instance);
		return this;
	};
}

/** True when jQuery is present on `window`. */
export function hasJQuery(): boolean {
	return (
		typeof window !== "undefined" &&
		typeof (window as any).jQuery === "function"
	);
}
