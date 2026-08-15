export type {
	AvatarifyConfig,
	AvatarifyInstance,
	AvatarSetDetail,
	AvatarStyle,
	AvatarSuccessDetail,
} from "./plugins/avatarify";
export type { Cookify, CookifySetOptions } from "./plugins/cookify";
export type {
	AuthorEntry,
	CommentEntry,
	CreateWidgetOptions,
	LabelEntry,
	PostEntry,
	WidgetEntry,
	WidgetInstance,
	WidgetOrderBy,
	WidgetSort,
	WidgetSourceType,
	WidgetTransformer,
	WidgetType,
} from "./plugins/createWidget";
export type { LazifyOptions } from "./plugins/lazify";
export type {
	MarqifyDirection,
	MarqifyInstance,
	MarqifyMarqueeDirection,
	MarqifyOptions,
	MarqifySpeed,
	MarqifyType,
} from "./plugins/marqify";
export type { MenuifyOptions } from "./plugins/menuify";
export type {
	RelatedPost,
	RelatifyOptions,
	RelatifyRelevance,
} from "./plugins/relatify";
export type { ReplacifyOptions } from "./plugins/replacify";
export type {
	ResizeImageOptions,
	YouTubeThumbnailQuality,
} from "./plugins/resizeImage";
export type {
	ShortcodeAttributes,
	ShortcodeAttributeValue,
	ShortcodeHandler,
	ShortcodifyDomOptions,
	ShortcodifyOptions,
	UnknownTagPolicy,
} from "./plugins/shortcodify";
export type {
	StackDirection,
	StackifyChangeDetail,
	StackifyInstance,
	StackifyOptions,
	StackifySize,
	StackifySizeByLayout,
	StackOrientation,
} from "./plugins/stackify";
export type { StickifyOptions } from "./plugins/stickify";
export type { TocifyOptions } from "./plugins/tocify";
export type { ElementInput, PluginInstance } from "./types";

export { avatarify } from "./plugins/avatarify";
export { cookify } from "./plugins/cookify";
export { createWidget } from "./plugins/createWidget";
export { lazify } from "./plugins/lazify";
export { marqify } from "./plugins/marqify";
export { menuify } from "./plugins/menuify";
export { relatify } from "./plugins/relatify";
export { replacify } from "./plugins/replacify";
export {
	isSupportedImage,
	resizeImage,
	resizeImageInDom,
} from "./plugins/resizeImage";
export {
	createShortcodeRegistry,
	defaultShortcodeTags,
	renderShortcodes,
	shortcodify,
} from "./plugins/shortcodify";
export { stackify } from "./plugins/stackify";
export { stickify } from "./plugins/stickify";
export { tocify } from "./plugins/tocify";
