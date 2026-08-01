import { lazify, type LazifyOptions } from "../plugins/lazify.js";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge.js";

(window as any).BlogrPlugins = Object.assign((window as any).BlogrPlugins ?? {}, { lazify });

if (hasJQuery()) {
	bindJQueryPlugin((window as any).jQuery, "lazify", (els, options?: LazifyOptions) =>
		lazify(els, options),
	);
}

export { lazify };
export type { LazifyOptions };
