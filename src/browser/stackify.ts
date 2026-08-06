import { type StackifyOptions, stackify } from "../plugins/stackify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{ stackify },
);

if (hasJQuery()) {
	bindJQueryPlugin(
		(window as any).jQuery,
		"stackify",
		(els, options?: StackifyOptions) => stackify(els, options),
	);
}

export type { StackifyOptions };

export { stackify };
