import {
	type AdsenseLoaderInstance,
	type AdsenseLoaderOptions,
	adsenseLoader,
} from "./plugins/adsenseLoader";
import {
	type AvatarifyConfig,
	type AvatarifyInstance,
	type AvatarSetDetail,
	avatarify,
} from "./plugins/avatarify";
import { cookify } from "./plugins/cookify";
import {
	type CreateWidgetOptions,
	createWidget,
	type WidgetEntry,
	type WidgetInstance,
	type WidgetTransformer,
} from "./plugins/createWidget";
import { type LazifyOptions, lazify } from "./plugins/lazify";
import {
	type MarqifyInstance,
	type MarqifyOptions,
	marqify,
} from "./plugins/marqify";
import { type MenuifyOptions, menuify } from "./plugins/menuify";
import {
	type ReadMeterInstance,
	type ReadMeterOptions,
	readMeter,
} from "./plugins/readMeter";
import {
	type RelatedPost,
	type RelatifyOptions,
	relatify,
} from "./plugins/relatify";
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
import { type PluginInstance } from "./types";
import { bindJQueryPlugin, hasJQuery } from "./utils/jquery-bridge";
/**
 * Registers `$.fn.stickify`, `$.fn.menuify`, `$.fn.lazify`, `$.fn.tocify`,
 * `$.fn.replacify`, `$.fn.shortcodify`, `$.fn.stackify` and `$.fn.relatify` and `$.fn.marqify`
 * on the given jQuery instance, so any plugin can be called the classic
 * jQuery way, e.g. `$("#sidebar").stickify();`.
 *
 * `createWidget` isn't included here: its `containerSelector` lives
 * *inside* its options object rather than being the jQuery target itself,
 * so it doesn't fit the `$(sel).plugin(options)` shape — call
 * `BlogrPlugins.createWidget({ containerSelector: "#el", ... })` directly.
 * `avatarify` isn't included for the same reason (its `container` is
 * inside its config object) — call `BlogrPlugins.avatarify({ ... })`.
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
	bindJQueryPlugin(jq, "relatify", (els, options?: RelatifyOptions) =>
		relatify(els, options),
	);
	bindJQueryPlugin(jq, "marqify", (els, options?: MarqifyOptions) =>
		marqify(els, options),
	);
}

if (hasJQuery()) {
	registerJQueryPlugins((window as any).jQuery);
}

export type {
	AdsenseLoaderInstance,
	AdsenseLoaderOptions,
	AvatarifyConfig,
	AvatarifyInstance,
	AvatarSetDetail,
	CreateWidgetOptions,
	LazifyOptions,
	MarqifyInstance,
	MarqifyOptions,
	MenuifyOptions,
	PluginInstance,
	ReadMeterInstance,
	ReadMeterOptions,
	RelatedPost,
	RelatifyOptions,
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
	adsenseLoader,
	avatarify,
	cookify,
	createShortcodeRegistry,
	createWidget,
	defaultShortcodeTags,
	isSupportedImage,
	lazify,
	marqify,
	menuify,
	readMeter,
	relatify,
	renderShortcodes,
	replacify,
	resizeImage,
	shortcodify,
	stackify,
	stickify,
	tocify,
};
