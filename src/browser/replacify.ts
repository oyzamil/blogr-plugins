import { type ReplacifyOptions, replacify } from "../plugins/replacify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ replacify });

/** Binds `$.fn.replacify` on the given jQuery instance. */
export function bindJQuery(jq: any): void {
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

if (hasJQuery()) bindJQuery((window as any).jQuery);

export type { ReplacifyOptions };

export { replacify };
