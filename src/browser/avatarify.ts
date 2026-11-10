import {
	type AvatarifyConfig,
	type AvatarifyInstance,
	type AvatarSetDetail,
	avatarify,
} from "../plugins/avatarify";
import { registerGlobalPlugin } from "../utils/register-plugin";

// No jQuery bridge for this one: `container` lives inside the config
// object rather than being the jQuery target, so it doesn't fit the
// `$(sel).plugin(options)` shape. Call `BlogrPlugins.avatarify({...})`.
registerGlobalPlugin({ avatarify });

export type { AvatarifyConfig, AvatarifyInstance, AvatarSetDetail };

export { avatarify };
