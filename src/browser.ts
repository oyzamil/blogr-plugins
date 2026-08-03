import type { PluginInstance } from "./types.js";

import { cookify } from "./plugins/cookify.js";
import {
	type CreateWidgetOptions,
	createWidget,
	type WidgetEntry,
	type WidgetInstance,
	type WidgetTransformer,
} from "./plugins/createWidget.js";
import { type LazifyOptions, lazify } from "./plugins/lazify.js";
import { type MenuifyOptions, menuify } from "./plugins/menuify.js";
import { type ReplacifyOptions, replacify } from "./plugins/replacify.js";
import {
	installResizeImagePrototypes,
	isSupportedImage,
	type ResizeImageOptions,
	resizeImage,
} from "./plugins/resizeImage.js";
import {
	createShortcodeRegistry,
	defaultShortcodeTags,
	renderShortcodes,
	type ShortcodifyDomOptions,
	shortcodify,
} from "./plugins/shortcodify.js";
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
	bindJQueryPlugin(jq, "shortcodify", (els, options: ShortcodifyDomOptions) =>
		shortcodify(els, options),
	);
}

if (hasJQuery()) {
	registerJQueryPlugins((window as any).jQuery);
}

export type {
	CreateWidgetOptions,
	LazifyOptions,
	MenuifyOptions,
	PluginInstance,
	ReplacifyOptions,
	ResizeImageOptions,
	ShortcodifyDomOptions,
	StickifyOptions,
	TocifyOptions,
	WidgetEntry,
	WidgetInstance,
	WidgetTransformer,
};

export {
	cookify,
	createShortcodeRegistry,
	createWidget,
	defaultShortcodeTags,
	installResizeImagePrototypes,
	isSupportedImage,
	lazify,
	menuify,
	renderShortcodes,
	replacify,
	resizeImage,
	shortcodify,
	stickify,
	tocify,
};
