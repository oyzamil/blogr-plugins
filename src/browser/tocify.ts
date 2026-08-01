import { tocify, type TocifyOptions } from "../plugins/tocify.js";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge.js";

(window as any).BlogrPlugins = Object.assign((window as any).BlogrPlugins ?? {}, { tocify });

if (hasJQuery()) {
	bindJQueryPlugin((window as any).jQuery, "tocify", (els, options?: TocifyOptions) =>
		tocify(els, options),
	);
}

export { tocify };
export type { TocifyOptions };
