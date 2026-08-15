import {
	type CreateWidgetOptions,
	createWidget,
	type WidgetEntry,
	type WidgetInstance,
	type WidgetTransformer,
} from "../plugins/createWidget";

(window as any).BlogrPlugins = Object.assign(
	(window as any).BlogrPlugins ?? {},
	{ createWidget },
);

export type {
	CreateWidgetOptions,
	WidgetEntry,
	WidgetInstance,
	WidgetTransformer,
};

export { createWidget };
