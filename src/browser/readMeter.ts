import { type ReadMeterOptions, readMeter } from "../plugins/readMeter";
import { bindJQueryPlugin, hasJQuery } from "../utils/jquery-bridge";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ readMeter });

/** Binds `$.fn.readMeter` on the given jQuery instance. */
export function bindJQuery(jq: any): void {
	bindJQueryPlugin(jq, "readMeter", (els, options?: ReadMeterOptions) =>
		readMeter(els, options),
	);
}

if (hasJQuery()) bindJQuery((window as any).jQuery);

export type { ReadMeterOptions };

export { readMeter };
