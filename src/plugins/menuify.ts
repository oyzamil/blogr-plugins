import type { ElementInput, PluginInstance } from "../types.js";

import { resolveElements } from "../utils/dom.js";

/** Configuration options for {@link menuify}. */
export interface MenuifyOptions {
	/** Prefix marking a link as belonging to the previous item's submenu. Default `"_"`. */
	nestingPrefix?: string;
	/** Class applied to generated `<ul>` submenus. Default `"sub-menu"`. */
	submenuClass?: string;
	/** Class applied to `<li>` items that received a submenu. Default `"has-sub"`. */
	hasSubClass?: string;
}

const defaults: Required<MenuifyOptions> = {
	nestingPrefix: "_",
	submenuClass: "sub-menu",
	hasSubClass: "has-sub",
};

/**
 * Converts a flat `<ul><li><a>` link list into a nested dropdown menu.
 * Any link whose text starts with the nesting prefix (default `_`) is moved
 * into a submenu under the previous non-prefixed link, and the prefix is
 * stripped from its visible text.
 *
 * @param input - Selector, element(s), or jQuery collection for the menu list(s).
 * @param options Configuration object.
 * See {@link MenuifyOptions}.
 * @returns A {@link PluginInstance} with `destroy()` to revert the DOM changes.
 *
 * @example
 * ```html
 * <ul class="menu">
 *   <li><a>Home</a></li>
 *   <li><a>Blog</a></li>
 *   <li><a>_Web Design</a></li>
 *   <li><a>_SEO</a></li>
 * </ul>
 * ```
 * ```ts
 * import { menuify } from "blogr-plugins";
 * menuify(".menu");
 * // "Web Design" and "SEO" become a submenu nested under "Blog"
 * ```
 */
export function menuify(
	input: ElementInput,
	options: MenuifyOptions = {},
): PluginInstance {
	const opts = { ...defaults, ...options };
	const lists = resolveElements(input) as HTMLElement[];
	const undoFns: Array<() => void> = [];

	for (const list of lists) {
		const items = Array.from(list.children).filter(
			(el): el is HTMLLIElement => el.tagName === "LI",
		);

		let currentParent: HTMLLIElement | null = null;
		let currentSubmenu: HTMLUListElement | null = null;
		const moves: Array<{ li: HTMLLIElement; nextSibling: Node | null }> = [];
		const textEdits: Array<{ el: HTMLElement; original: string }> = [];
		const addedSubmenus: HTMLUListElement[] = [];
		const addedClasses: HTMLElement[] = [];

		for (const li of items) {
			const link = li.querySelector("a");
			if (!link) continue;

			const text = link.textContent ?? "";

			if (text.startsWith(opts.nestingPrefix)) {
				if (!currentParent) continue; // no parent to nest under, leave as-is

				if (!currentSubmenu) {
					currentSubmenu = document.createElement("ul");
					currentSubmenu.className = opts.submenuClass;
					currentParent.appendChild(currentSubmenu);
					currentParent.classList.add(opts.hasSubClass);
					addedSubmenus.push(currentSubmenu);
					addedClasses.push(currentParent);
				}

				textEdits.push({ el: link, original: text });
				link.textContent = text.slice(opts.nestingPrefix.length);

				// remember where the <li> lived so destroy() can put it back
				moves.push({ li, nextSibling: li.nextSibling });
				currentSubmenu.appendChild(li);
			} else {
				currentParent = li;
				currentSubmenu = null;
			}
		}

		undoFns.push(() => {
			for (const { el, original } of textEdits) el.textContent = original;
			// restore moved items to the flat list before removing submenus
			for (const { li, nextSibling } of moves.reverse()) {
				list.insertBefore(li, nextSibling);
			}
			for (const submenu of addedSubmenus) submenu.remove();
			for (const el of addedClasses) el.classList.remove(opts.hasSubClass);
		});
	}

	return {
		destroy() {
			for (const undo of undoFns) undo();
		},
	};
}
