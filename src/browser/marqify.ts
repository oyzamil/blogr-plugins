import {
	type MarqifyInstance,
	type MarqifyOptions,
	marqify,
} from "../plugins/marqify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ marqify });

/** Binds `$.fn.marqify` on the given jQuery instance. */
export function bindJQuery(jq: any): void {
	bindJQueryPlugin(jq, "marqify", (els, options?: MarqifyOptions) =>
		marqify(els, options),
	);
}

if (hasJQuery()) bindJQuery((window as any).jQuery);

export type { MarqifyInstance, MarqifyOptions };

export { marqify };
