import {
	type CreateWidgetOptions,
	createWidget,
	type WidgetEntry,
	type WidgetInstance,
	type WidgetTransformer,
} from "../plugins/createWidget";
import { registerGlobalPlugin } from "../utils/register-plugin";

registerGlobalPlugin({ createWidget });

export type {
	CreateWidgetOptions,
	WidgetEntry,
	WidgetInstance,
	WidgetTransformer,
};

export { createWidget };
