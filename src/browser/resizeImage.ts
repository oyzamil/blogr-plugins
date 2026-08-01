import {
	isSupportedImage,
	type ResizeImageOptions,
	resizeImage,
} from "../plugins/resizeImage.js";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{
		resizeImage,
		isSupportedImage,
	},
);

export type { ResizeImageOptions };

export { isSupportedImage, resizeImage };
