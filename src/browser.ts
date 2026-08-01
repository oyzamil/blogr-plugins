import type { PluginInstance } from "./types.js";

import { cookify } from "./plugins/cookify.js";
import { type LazifyOptions, lazify } from "./plugins/lazify.js";
import { type MenuifyOptions, menuify } from "./plugins/menuify.js";
import { type ReplacifyOptions, replacify } from "./plugins/replacify.js";
import {
	isSupportedImage,
	type ResizeImageOptions,
	resizeImage,
} from "./plugins/resizeImage.js";
import { type StickifyOptions, stickify } from "./plugins/stickify.js";
import { type TocifyOptions, tocify } from "./plugins/tocify.js";
import { bindJQueryPlugin, hasJQuery } from "./utils/jquery-bridge.js";

/**
 * Registers `$.fn.stickify`, `$.fn.menuify`, `$.fn.lazify`, `$.fn.tocify`
 * and `$.fn.replacify` on the given jQuery instance, so any plugin can be
 * called the classic jQuery way, e.g. `$("#sidebar").stickify();`.
 *
 * @param jq - A jQuery instance (`window.jQuery` / `window.$`).
 */
export function registerJQueryPlugins(jq: any): void {
	bindJQueryPlugin(jq, "stickify", (els, options?: StickifyOptions) =>
		stickify(els, options),
	);
	bindJQueryPlugin(jq, "menuify", (els, options?: MenuifyOptions) =>
		menuify(els, options),
	);
	bindJQueryPlugin(jq, "lazify", (els, options?: LazifyOptions) =>
		lazify(els, options),
	);
	bindJQueryPlugin(jq, "tocify", (els, options?: TocifyOptions) =>
		tocify(els, options),
	);
	bindJQueryPlugin(
		jq,
		"replacify",
		(
			els,
			search: string | RegExp,
			replacement: string,
			options?: ReplacifyOptions,
		) => replacify(els, search, replacement, options),
	);
}

if (hasJQuery()) {
	registerJQueryPlugins((window as any).jQuery);
}

export type {
	LazifyOptions,
	MenuifyOptions,
	PluginInstance,
	ReplacifyOptions,
	ResizeImageOptions,
	StickifyOptions,
	TocifyOptions,
};

export {
	cookify,
	isSupportedImage,
	lazify,
	menuify,
	replacify,
	resizeImage,
	stickify,
	tocify,
};
