import { cookify } from "../plugins/cookify";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ cookify });

export { cookify };
