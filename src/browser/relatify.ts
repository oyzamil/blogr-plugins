import { type RelatifyOptions, relatify } from "../plugins/relatify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{ relatify },
);

if (hasJQuery()) {
	bindJQueryPlugin(
		(window as any).jQuery,
		"relatify",
		(els, options?: RelatifyOptions) => relatify(els, options),
	);
}

export type { RelatifyOptions };

export { relatify };
