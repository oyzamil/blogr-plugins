import {
	createShortcodeRegistry,
	defaultShortcodeTags,
	renderShortcodes,
	type ShortcodifyDomOptions,
	shortcodify,
} from "../plugins/shortcodify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({
	shortcodify,
	renderShortcodes,
	createShortcodeRegistry,
	defaultShortcodeTags,
});

/** Binds `$.fn.shortcodify` on the given jQuery instance. */
export function bindJQuery(jq: any): void {
	bindJQueryPlugin(jq, "shortcodify", (els, options: ShortcodifyDomOptions) =>
		shortcodify(els, options),
	);
}

if (hasJQuery()) bindJQuery((window as any).jQuery);

export type { ShortcodifyDomOptions };

export {
	createShortcodeRegistry,
	defaultShortcodeTags,
	renderShortcodes,
	shortcodify,
};
