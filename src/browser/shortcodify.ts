import {
	createShortcodeRegistry,
	defaultShortcodeTags,
	renderShortcodes,
	type ShortcodifyDomOptions,
	shortcodify,
} from "../plugins/shortcodify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{
		shortcodify,
		renderShortcodes,
		createShortcodeRegistry,
		defaultShortcodeTags,
	},
);

if (hasJQuery()) {
	bindJQueryPlugin(
		(window as any).jQuery,
		"shortcodify",
		(els, options: ShortcodifyDomOptions) => shortcodify(els, options),
	);
}

export type { ShortcodifyDomOptions };

export {
	createShortcodeRegistry,
	defaultShortcodeTags,
	renderShortcodes,
	shortcodify,
};
