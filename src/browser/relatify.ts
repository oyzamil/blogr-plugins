import { type RelatifyOptions, relatify } from "../plugins/relatify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ relatify });

/** Binds `$.fn.relatify` on the given jQuery instance. */
export function bindJQuery(jq: any): void {
	bindJQueryPlugin(jq, "relatify", (els, options?: RelatifyOptions) =>
		relatify(els, options),
	);
}

if (hasJQuery()) bindJQuery((window as any).jQuery);

export type { RelatifyOptions };

export { relatify };
