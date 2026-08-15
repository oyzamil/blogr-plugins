import { type ReplacifyOptions, replacify } from "../plugins/replacify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{ replacify },
);

if (hasJQuery()) {
	bindJQueryPlugin(
		(window as any).jQuery,
		"replacify",
		(
			els,
			search: string | RegExp,
			replacement: string,
			options?: ReplacifyOptions,
		) => replacify(els, search, replacement, options),
	);
}

export type { ReplacifyOptions };

export { replacify };
