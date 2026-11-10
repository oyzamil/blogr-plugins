import { type StackifyOptions, stackify } from "../plugins/stackify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ stackify });

/** Binds `$.fn.stackify` on the given jQuery instance. */
export function bindJQuery(jq: any): void {
	bindJQueryPlugin(jq, "stackify", (els, options?: StackifyOptions) =>
		stackify(els, options),
	);
}

if (hasJQuery()) bindJQuery((window as any).jQuery);

export type { StackifyOptions };

export { stackify };
