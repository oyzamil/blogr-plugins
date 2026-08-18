import {
	type AdsenseLoaderInstance,
	type AdsenseLoaderOptions,
	adsenseLoader,
} from "../plugins/adsenseLoader";

// No jQuery bridge for this one: it takes a single options object with no
// element target at all. Call `BlogrPlugins.lazyAdsense({...})`.
(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{ adsenseLoader },
);

export type { AdsenseLoaderInstance, AdsenseLoaderOptions };

export { adsenseLoader };
