import { cookify } from "../plugins/cookify.js";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{ cookify },
);

export { cookify };
