import type { PluginInstance } from "./types";

import { cookify } from "./plugins/cookify";
import {
	type CreateWidgetOptions,
	createWidget,
	type WidgetEntry,
	type WidgetInstance,
	type WidgetTransformer,
} from "./plugins/createWidget";
import { type LazifyOptions, lazify } from "./plugins/lazify";
import { type MenuifyOptions, menuify } from "./plugins/menuify";
import { type ReplacifyOptions, replacify } from "./plugins/replacify";
import {
	isSupportedImage,
	type ResizeImageOptions,
	resizeImage,
} from "./plugins/resizeImage";
import {
	createShortcodeRegistry,
	defaultShortcodeTags,
	renderShortcodes,
	type ShortcodifyDomOptions,
	shortcodify,
} from "./plugins/shortcodify";
import { type StackifyOptions, stackify } from "./plugins/stackify";
import { type StickifyOptions, stickify } from "./plugins/stickify";
import { type TocifyOptions, tocify } from "./plugins/tocify";
import { bindJQueryPlugin, hasJQuery } from "./utils/jquery-bridge";

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
	bindJQueryPlugin(jq, "stackify", (els, options?: StackifyOptions) =>
		stackify(els, options),
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
	StackifyOptions,
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
	isSupportedImage,
	lazify,
	menuify,
	renderShortcodes,
	replacify,
	resizeImage,
	shortcodify,
	stackify,
	stickify,
	tocify,
};
