import {
	isSupportedImage,
	type ResizeImageOptions,
	resizeImage,
	type YouTubeThumbnailQuality,
} from "../plugins/resizeImage";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ resizeImage, isSupportedImage });

export type { ResizeImageOptions, YouTubeThumbnailQuality };

export { isSupportedImage, resizeImage };
