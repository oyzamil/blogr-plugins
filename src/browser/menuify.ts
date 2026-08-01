import { type MenuifyOptions, menuify } from "../plugins/menuify.js";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge.js";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{ menuify },
);

if (hasJQuery()) {
	bindJQueryPlugin(
		(window as any).jQuery,
		"menuify",
		(els, options?: MenuifyOptions) => menuify(els, options),
	);
}

export type { MenuifyOptions };

export { menuify };
