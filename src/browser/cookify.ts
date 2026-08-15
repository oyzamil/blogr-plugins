import { cookify } from "../plugins/cookify";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{ cookify },
);

export { cookify };
