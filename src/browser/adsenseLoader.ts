import {
	type AdsenseLoaderInstance,
	type AdsenseLoaderOptions,
	adsenseLoader,
} from "../plugins/adsenseLoader";
import { registerGlobalPlugin } from "../utils/register-plugin";

// No jQuery bridge for this one: it takes a single options object with no
// element target at all. Call `BlogrPlugins.lazyAdsense({...})`.
registerGlobalPlugin({ adsenseLoader });

export type { AdsenseLoaderInstance, AdsenseLoaderOptions };

export { adsenseLoader };
