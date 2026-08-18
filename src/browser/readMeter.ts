import { type ReadMeterOptions, readMeter } from "../plugins/readMeter";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{ readMeter },
);

if (hasJQuery()) {
	bindJQueryPlugin(
		(window as any).jQuery,
		"readMeter",
		(els, options?: ReadMeterOptions) => readMeter(els, options),
	);
}

export type { ReadMeterOptions };

export { readMeter };
