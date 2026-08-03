import type { ElementInput, PluginInstance } from "../types.js";

import { resolveElements } from "../utils/dom.js";

/** Configuration options for {@link replacify}. */
export interface ReplacifyOptions {
	/** When true, replacement may contain HTML and will be parsed as markup. Default `false`. */
	allowHtml?: boolean;
}

const defaults: Required<ReplacifyOptions> = {
	allowHtml: false,
};

/**
 * Finds and replaces text within an element's text nodes only — it never
 * touches tag names or attributes, so it's safe to run on rendered markup.
 *
 * @param input - Selector, element(s), or jQuery collection to search within.
 * @param search - String or RegExp to find.
 * @param replacement - Replacement text (or HTML, if `allowHtml` is set).
 * @param options Configuration object.
 * See {@link ReplacifyOptions}.
 * @returns A {@link PluginInstance} with `destroy()` to revert the text.
 *
 * @example
 * ```ts
 * import { replacify } from "blogr-plugins";
 * replacify(".post-body", /\bBlogr\b/g, "Blogr™");
 * ```
 */
export function replacify(
	input: ElementInput,
	search: string | RegExp,
	replacement: string,
	options: ReplacifyOptions = {},
): PluginInstance {
	const opts = { ...defaults, ...options };
	const elements = resolveElements(input);
	const undoFns: Array<() => void> = [];

	for (const el of elements) {
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		const textNodes: Text[] = [];
		let node: Node | null;
		// biome-ignore lint/suspicious/noAssignInExpressions: No Condition Assign
		while ((node = walker.nextNode())) textNodes.push(node as Text);

		for (const textNode of textNodes) {
			const original = textNode.nodeValue ?? "";
			const updated = original.replace(search, replacement);
			if (updated === original) continue;

			if (!opts.allowHtml || !/</.test(updated)) {
				textNode.nodeValue = updated;
				undoFns.push(() => {
					textNode.nodeValue = original;
				});
			} else {
				const wrapper = document.createElement("span");
				wrapper.innerHTML = updated;
				const parent = textNode.parentNode;
				if (!parent) continue;
				const replacementNodes = Array.from(wrapper.childNodes);
				const anchor = document.createComment("");
				parent.insertBefore(anchor, textNode);
				for (const n of replacementNodes) parent.insertBefore(n, textNode);
				parent.removeChild(textNode);
				undoFns.push(() => {
					const restored = document.createTextNode(original);
					parent.insertBefore(restored, anchor);
					for (const n of replacementNodes) parent.removeChild(n);
					parent.removeChild(anchor);
				});
			}
		}
	}

	return {
		destroy() {
			for (const undo of undoFns.reverse()) undo();
		},
	};
}
