import { stickify, type StickifyOptions } from "./plugins/stickify.js";
import { menuify, type MenuifyOptions } from "./plugins/menuify.js";
import { lazify, type LazifyOptions } from "./plugins/lazify.js";
import { tocify, type TocifyOptions } from "./plugins/tocify.js";
import { replacify, type ReplacifyOptions } from "./plugins/replacify.js";
import { cookify } from "./plugins/cookify.js";
import { resizeImage, isSupportedImage, type ResizeImageOptions } from "./plugins/resizeImage.js";
import type { PluginInstance } from "./types.js";
import { bindJQueryPlugin, hasJQuery } from "./utils/jquery-bridge.js";

/**
 * Registers `$.fn.stickify`, `$.fn.menuify`, `$.fn.lazify`, `$.fn.tocify`
 * and `$.fn.replacify` on the given jQuery instance, so any plugin can be
 * called the classic jQuery way, e.g. `$("#sidebar").stickify();`.
 *
 * @param jq - A jQuery instance (`window.jQuery` / `window.$`).
 */
export function registerJQueryPlugins(jq: any): void {
	bindJQueryPlugin(jq, "stickify", (els, options?: StickifyOptions) => stickify(els, options));
	bindJQueryPlugin(jq, "menuify", (els, options?: MenuifyOptions) => menuify(els, options));
	bindJQueryPlugin(jq, "lazify", (els, options?: LazifyOptions) => lazify(els, options));
	bindJQueryPlugin(jq, "tocify", (els, options?: TocifyOptions) => tocify(els, options));
	bindJQueryPlugin(
		jq,
		"replacify",
		(els, search: string | RegExp, replacement: string, options?: ReplacifyOptions) =>
			replacify(els, search, replacement, options),
	);
}

if (hasJQuery()) {
	registerJQueryPlugins((window as any).jQuery);
}

export { stickify, menuify, lazify, tocify, replacify, cookify };
export { resizeImage, isSupportedImage };
export type {
	StickifyOptions,
	MenuifyOptions,
	LazifyOptions,
	TocifyOptions,
	ReplacifyOptions,
	ResizeImageOptions,
	PluginInstance,
};
