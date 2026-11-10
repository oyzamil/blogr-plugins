import { type LazifyOptions, lazify } from "../plugins/lazify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ lazify });

/** Binds `$.fn.lazify` on the given jQuery instance. */
export function bindJQuery(jq: any): void {
	bindJQueryPlugin(jq, "lazify", (els, options?: LazifyOptions) =>
		lazify(els, options),
	);
}

if (hasJQuery()) bindJQuery((window as any).jQuery);

export type { LazifyOptions };

export { lazify };
