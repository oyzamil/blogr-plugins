import { type ElementInput, type PluginInstance } from "../types";
import { resolveElements } from "../utils/dom";
import { mergeOptions } from "../utils/merge-options";

/** Configuration options for {@link menuify}. */
export interface MenuifyOptions {
	/** Prefix marking a link as belonging to the previous item's submenu. Default `"_"`. */
	nestingPrefix?: string;
	/** Class applied to generated `<ul>` submenus. Default `"sub-menu"`. */
	submenuClass?: string;
	/** Class applied to `<li>` items that received a submenu. Default `"has-sub"`. */
	hasSubClass?: string;
	/** Chevron element text. Default `"<"`. */
	chevronText?: string;
}

const defaults: Required<MenuifyOptions> = {
	nestingPrefix: "_",
	submenuClass: "sub-menu",
	hasSubClass: "has-sub",
	chevronText: "<",
};

export function menuify(
	input: ElementInput,
	options: MenuifyOptions = {},
): PluginInstance {
	const opts = mergeOptions(defaults, options);
	const lists = resolveElements(input) as HTMLElement[];
	const undoFns: Array<() => void> = [];

	for (const list of lists) {
		const items = Array.from(list.children).filter(
			(el): el is HTMLLIElement => el.tagName === "LI",
		);

		const levelParents: HTMLLIElement[] = [];
		const levelSubmenus: HTMLUListElement[] = [];
		const moves: Array<{ li: HTMLLIElement; nextSibling: Node | null }> = [];
		const textEdits: Array<{ el: HTMLElement; original: string }> = [];
		const addedSubmenus: HTMLUListElement[] = [];
		const addedClasses: HTMLElement[] = [];
		const addedChevrons: HTMLElement[] = [];

		const prefixChar = opts.nestingPrefix.charAt(0);

		for (const li of items) {
			const link = li.querySelector("a");
			if (!link) continue;

			const text = link.textContent ?? "";
			let depth = 0;
			while (depth < text.length && text[depth] === prefixChar) {
				depth++;
			}

			if (depth > 0) {
				if (depth - 1 >= levelParents.length) continue;

				const parentLi = levelParents[depth - 1];
				let submenu = levelSubmenus[depth - 1];

				if (!submenu) {
					submenu = document.createElement("ul");
					submenu.className = opts.submenuClass;
					parentLi.appendChild(submenu);
					parentLi.classList.add(opts.hasSubClass);

					// Add chevron to parent link
					const parentLink = parentLi.querySelector("a");
					if (parentLink) {
						const chevron = document.createElement("span");
						chevron.className = "chevron";
						chevron.textContent = opts.chevronText;
						parentLink.appendChild(chevron);
						addedChevrons.push(chevron);
					}

					addedSubmenus.push(submenu);
					addedClasses.push(parentLi);
					levelSubmenus[depth - 1] = submenu;
				}

				textEdits.push({ el: link, original: text });
				link.textContent = text.slice(depth);
				moves.push({ li, nextSibling: li.nextSibling });
				submenu.appendChild(li);

				levelParents[depth] = li;
				if (levelSubmenus.length < depth) levelSubmenus.length = depth;
			} else {
				levelParents.length = 1;
				levelSubmenus.length = 0;
				levelParents[0] = li;
			}
		}

		undoFns.push(() => {
			for (const { el, original } of textEdits) el.textContent = original;
			for (const { li, nextSibling } of moves.reverse()) {
				list.insertBefore(li, nextSibling);
			}
			for (const submenu of addedSubmenus) submenu.remove();
			for (const el of addedClasses) el.classList.remove(opts.hasSubClass);
			for (const chevron of addedChevrons) chevron.remove();
		});
	}

	return {
		destroy() {
			for (const undo of undoFns) undo();
		},
	};
}
