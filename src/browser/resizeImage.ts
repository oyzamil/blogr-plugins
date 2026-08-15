import {
	isSupportedImage,
	type ResizeImageOptions,
	resizeImage,
	type YouTubeThumbnailQuality,
} from "../plugins/resizeImage";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{
		resizeImage,
		isSupportedImage,
	},
);

export type { ResizeImageOptions, YouTubeThumbnailQuality };

export { isSupportedImage, resizeImage };
