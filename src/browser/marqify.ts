import {
	type MarqifyInstance,
	type MarqifyOptions,
	marqify,
} from "../plugins/marqify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{ marqify },
);

if (hasJQuery()) {
	bindJQueryPlugin(
		(window as any).jQuery,
		"marqify",
		(els, options?: MarqifyOptions) => marqify(els, options),
	);
}

export type { MarqifyInstance, MarqifyOptions };

export { marqify };
