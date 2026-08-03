import {
	installResizeImagePrototypes,
	isSupportedImage,
	type ResizeImageOptions,
	resizeImage,
	type YouTubeThumbnailQuality,
} from "../plugins/resizeImage.js";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{
		resizeImage,
		isSupportedImage,
		installResizeImagePrototypes,
	},
);

export type { ResizeImageOptions, YouTubeThumbnailQuality };

export { installResizeImagePrototypes, isSupportedImage, resizeImage };
