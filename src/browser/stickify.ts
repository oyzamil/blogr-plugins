import { stickify, type StickifyOptions } from "../plugins/stickify.js";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge.js";

(window as any).BlogrPlugins = Object.assign((window as any).BlogrPlugins ?? {}, { stickify });

if (hasJQuery()) {
	bindJQueryPlugin((window as any).jQuery, "stickify", (els, options?: StickifyOptions) =>
		stickify(els, options),
	);
}

export { stickify };
export type { StickifyOptions };
