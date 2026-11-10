import { type MenuifyOptions, menuify } from "../plugins/menuify";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ menuify });

/** Binds `$.fn.menuify` on the given jQuery instance. */
export function bindJQuery(jq: any): void {
	bindJQueryPlugin(jq, "menuify", (els, options?: MenuifyOptions) =>
		menuify(els, options),
	);
}

if (hasJQuery()) bindJQuery((window as any).jQuery);

export type { MenuifyOptions };

export { menuify };
