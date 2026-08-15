import type { ElementInput, PluginInstance } from "../types";

import { resolveElements } from "../utils/dom";

/** Configuration options for {@link tocify}. */
export interface TocifyOptions {
	/** Selector (relative to the content root) for headings to include. Default `"h1,h2,h3"`. */
	headings?: string;
	/** Root element to scan for headings. Defaults to the `input` element itself. */
	content?: ElementInput;
}

const defaults: Required<Pick<TocifyOptions, "headings">> = {
	headings: "h1,h2,h3",
};

function slugify(text: string, used: Set<string>): string {
	const base = text.trim().replace(/\s+/g, "_") || "heading";
	let id = base;
	let i = 1;
	while (used.has(id) || document.getElementById(id)) {
		id = `${base}_${i++}`;
	}
	used.add(id);
	return id;
}

/**
 * Builds a nested table-of-contents `<ul>` from the headings found inside a
 * container, assigning an `id` to each heading (if it doesn't already have
 * one) so the TOC links can jump to them.
 *
 * @param input - Selector, element, or jQuery collection to render the TOC into.
 * @param options Configuration object.
 * See {@link TocifyOptions}.
 * @returns A {@link PluginInstance} with `destroy()` to remove the generated TOC.
 *
 * @example
 * ```ts
 * import { tocify } from "blogr-plugins";
 * tocify("#toc", { content: "#article", headings: "h2,h3" });
 * ```
 */
export function tocify(
	input: ElementInput,
	options: TocifyOptions = {},
): PluginInstance {
	const opts = { ...defaults, ...options };
	const targets = resolveElements(input) as HTMLElement[];
	const cleanups: Array<() => void> = [];

	for (const target of targets) {
		const contentRoot = opts.content
			? (resolveElements(opts.content)[0] ?? target)
			: target;

		const headings = Array.from(
			contentRoot.querySelectorAll<HTMLElement>(opts.headings),
		);

		const used = new Set<string>();
		const levels = opts.headings.split(",").map((s) => s.trim());
		const stack: Array<{ level: number; list: HTMLUListElement }> = [];

		const root = document.createElement("ul");
		root.className = "toc-list";
		stack.push({ level: -1, list: root });

		for (const heading of headings) {
			if (!heading.id) {
				heading.id = slugify(heading.textContent ?? "", used);
			}
			const level = levels.indexOf(heading.tagName.toLowerCase());

			while (stack.length > 1 && stack[stack.length - 1].level >= level) {
				stack.pop();
			}

			const parent = stack[stack.length - 1].list;
			const li = document.createElement("li");
			const a = document.createElement("a");
			a.href = `#${heading.id}`;
			a.textContent = heading.textContent ?? "";
			li.appendChild(a);
			parent.appendChild(li);

			const sublist = document.createElement("ul");
			li.appendChild(sublist);
			stack.push({ level, list: sublist });
		}

		// drop empty trailing sublists
		root.querySelectorAll("ul").forEach((ul) => {
			if (ul.children.length === 0) ul.remove();
		});

		target.appendChild(root);
		cleanups.push(() => root.remove());
	}

	return {
		destroy() {
			for (const cleanup of cleanups) cleanup();
		},
	};
}
