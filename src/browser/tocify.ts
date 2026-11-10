import { type TocifyOptions, tocify } from "../plugins/tocify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ tocify });

/** Binds `$.fn.tocify` on the given jQuery instance. */
export function bindJQuery(jq: any): void {
	bindJQueryPlugin(jq, "tocify", (els, options?: TocifyOptions) =>
		tocify(els, options),
	);
}

if (hasJQuery()) bindJQuery((window as any).jQuery);

export type { TocifyOptions };

export { tocify };
