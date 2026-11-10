import { type StickifyOptions, stickify } from "../plugins/stickify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ stickify });

/** Binds `$.fn.stickify` on the given jQuery instance. */
export function bindJQuery(jq: any): void {
	bindJQueryPlugin(jq, "stickify", (els, options?: StickifyOptions) =>
		stickify(els, options),
	);
}

if (hasJQuery()) bindJQuery((window as any).jQuery);

export type { StickifyOptions };

export { stickify };
