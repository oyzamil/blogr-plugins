import { resizeImage, isSupportedImage, type ResizeImageOptions } from "../plugins/resizeImage.js";

(window as any).BlogrPlugins = Object.assign((window as any).BlogrPlugins ?? {}, {
	resizeImage,
	isSupportedImage,
});

export { resizeImage, isSupportedImage };
export type { ResizeImageOptions };
