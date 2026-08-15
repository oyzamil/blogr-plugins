import { type ElementInput, type PluginInstance } from "../types";
import { resolveElements } from "../utils/dom";

/** A single shortcode attribute value, auto-coerced from its raw text. */
export type ShortcodeAttributeValue = string | number | boolean;

/** Parsed attributes for one shortcode occurrence. */
export type ShortcodeAttributes = Record<string, ShortcodeAttributeValue>;

/**
 * Renders one shortcode tag to its final string.
 *
 * @param attrs - Parsed attributes, e.g. `{ width: 400, caption: "Nice" }`.
 * @param content - Already-rendered inner content (empty string for
 * self-closing tags).
 * @param tag - The tag name that matched, useful when one handler is
 * registered for several tags.
 */
export type ShortcodeHandler = (
	attrs: ShortcodeAttributes,
	content: string,
	tag: string,
) => string;

/** What to do with a `[tag]` whose name has no registered handler. */
export type UnknownTagPolicy = "keep" | "strip" | "remove";

/** Configuration options shared by {@link renderShortcodes} and {@link shortcodify}. */
export interface ShortcodifyOptions {
	/** Map of tag name → {@link ShortcodeHandler}. */
	tags: Record<string, ShortcodeHandler>;
	/** Opening delimiter. Default `"["`. */
	openTag?: string;
	/** Closing delimiter. Default `"]"`. */
	closeTag?: string;
	/**
	 * What happens to a recognized-shaped tag with no matching handler:
	 * `"keep"` reproduces the original bracket text untouched, `"strip"`
	 * unwraps it and keeps only the inner content, `"remove"` deletes it
	 * entirely. Default `"keep"`.
	 */
	unknownTag?: UnknownTagPolicy;
	/**
	 * Re-render a handler's output for further shortcodes it may itself
	 * contain (e.g. a `[quote]` handler that wraps its content in
	 * `[i]...[/i]`). Bounded by `maxDepth` to avoid infinite loops.
	 * Default `true`.
	 */
	recursive?: boolean;
	/** Safety cap on recursive re-render passes. Default `5`. */
	maxDepth?: number;
	/** Called if a handler throws; the offending tag renders as empty string. */
	onError?: (error: unknown, tag: string) => void;
}

/** Extra options for the DOM-facing {@link shortcodify}. */
export interface ShortcodifyDomOptions extends ShortcodifyOptions {
	/**
	 * When a rendered result contains markup, parse it as HTML instead of
	 * inserting it as literal text. Default `false`.
	 */
	allowHtml?: boolean;
}

const defaults: Required<
	Pick<
		ShortcodifyOptions,
		"openTag" | "closeTag" | "unknownTag" | "recursive" | "maxDepth"
	>
> = {
	openTag: "[",
	closeTag: "]",
	unknownTag: "keep",
	recursive: true,
	maxDepth: 5,
};

type TreeNode =
	| { type: "text"; value: string }
	| {
			type: "element";
			tag: string;
			attrs: ShortcodeAttributes;
			selfClosing: boolean;
			raw: string;
			/** Raw text of the matching `[/tag]`, if one was found. */
			closeRaw?: string;
			children: TreeNode[];
	  };

function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function coerceAttrValue(raw: string): ShortcodeAttributeValue {
	if (raw === "true") return true;
	if (raw === "false") return false;
	if (raw !== "" && !Number.isNaN(Number(raw))) return Number(raw);
	return raw;
}

function parseAttributes(raw: string): ShortcodeAttributes {
	const attrs: ShortcodeAttributes = {};
	const attrPattern =
		/([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s\]/]+)))?/g;
	let match: RegExpExecArray | null;
	// biome-ignore lint/suspicious/noAssignInExpressions: scanning attrs
	while ((match = attrPattern.exec(raw))) {
		const [, key, dq, sq, bare] = match;
		if (dq !== undefined) attrs[key] = coerceAttrValue(dq);
		else if (sq !== undefined) attrs[key] = coerceAttrValue(sq);
		else if (bare !== undefined) attrs[key] = coerceAttrValue(bare);
		else attrs[key] = true; // bare flag, e.g. [video muted]
	}
	return attrs;
}

/**
 * Splits `text` into a tree of plain-text and shortcode-element nodes.
 * Handles self-closing tags (`[tag/]`), nesting of unrelated tags, and
 * `[[tag]]` escaping (doubled opening delimiter emits a literal tag with
 * the bracket count reduced by one instead of being parsed).
 */
function parse(text: string, openTag: string, closeTag: string): TreeNode[] {
	const open = escapeRegExp(openTag);
	const close = escapeRegExp(closeTag);
	// Escaped form first: doubled delimiters on both sides, e.g. "[[b]]",
	// emits a literal single-bracket tag instead of being parsed. Tried
	// before the normal form so it wins the alternation.
	const escapedTag = `${open}${open}(/)?([a-zA-Z][\\w-]*)((?:\\s+[^${close}]*)?)\\s*(/)?${close}${close}`;
	const normalTag = `${open}(/)?([a-zA-Z][\\w-]*)((?:\\s+[^${close}]*)?)\\s*(/)?${close}`;
	const tagPattern = new RegExp(`${escapedTag}|${normalTag}`, "g");

	const root: TreeNode = {
		type: "element",
		tag: "",
		attrs: {},
		selfClosing: false,
		raw: "",
		children: [],
	};
	const stack: (typeof root)[] = [root];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	const pushText = (value: string) => {
		if (!value) return;
		const top = stack[stack.length - 1];
		const lastChild = top.children[top.children.length - 1];
		if (lastChild?.type === "text") lastChild.value += value;
		else top.children.push({ type: "text", value });
	};

	// biome-ignore lint/suspicious/noAssignInExpressions: scanning tags
	while ((match = tagPattern.exec(text))) {
		pushText(text.slice(lastIndex, match.index));
		lastIndex = match.index + match[0].length;

		const [
			raw,
			escClosingSlash,
			escTag,
			escRawAttrs,
			escSelfClosingSlash,
			closingSlash,
			tag,
			rawAttrs,
			selfClosingSlash,
		] = match;

		if (escTag !== undefined) {
			// [[tag ...]] -> literal single-bracket "[tag ...]", not parsed.
			pushText(
				`${openTag}${escClosingSlash ?? ""}${escTag}${escRawAttrs ?? ""}${escSelfClosingSlash ?? ""}${closeTag}`,
			);
			continue;
		}

		if (closingSlash) {
			// Closing tag: pop back to the matching open element, if any,
			// and remember its raw text so an "unknownTag: keep" render
			// can reproduce the original closing bracket too.
			const idx = stack.findIndex(
				(node) => node.type === "element" && node.tag === tag,
			);
			if (idx > 0) {
				const opened = stack[idx];
				if (opened.type === "element") opened.closeRaw = raw;
				stack.length = idx; // pop everything up to and including the match
			} else {
				pushText(raw); // stray/unmatched close tag: treat as literal text
			}
			continue;
		}

		const node: TreeNode = {
			type: "element",
			tag,
			attrs: parseAttributes(rawAttrs ?? ""),
			selfClosing: Boolean(selfClosingSlash),
			raw,
			children: [],
		};
		stack[stack.length - 1].children.push(node);
		if (!node.selfClosing) stack.push(node);
	}
	pushText(text.slice(lastIndex));

	return root.children;
}

interface RenderContext {
	tags: Record<string, ShortcodeHandler>;
	unknownTag: UnknownTagPolicy;
	onError: ShortcodifyOptions["onError"];
	openTag: string;
	closeTag: string;
	recursive: boolean;
	maxDepth: number;
}

/**
 * Renders a handler's own output for further shortcodes it may contain,
 * e.g. a `[quote]` handler that itself returns `[i]...[/i]`. Only handler
 * *output* is ever re-parsed this way — original source text (including
 * anything that was `[[escaped]]`) is parsed exactly once and never
 * revisited, so escaping stays reliable regardless of recursion.
 */
function expandHandlerOutput(
	result: string,
	ctx: RenderContext,
	depth: number,
): string {
	if (
		!ctx.recursive ||
		depth >= ctx.maxDepth ||
		!result.includes(ctx.openTag)
	) {
		return result;
	}
	const tree = parse(result, ctx.openTag, ctx.closeTag);
	return renderTree(tree, ctx, depth + 1);
}

function renderTree(
	nodes: TreeNode[],
	ctx: RenderContext,
	depth: number,
): string {
	let out = "";
	for (const node of nodes) {
		if (node.type === "text") {
			out += node.value;
			continue;
		}

		const innerContent = renderTree(node.children, ctx, depth);
		const handler = ctx.tags[node.tag];

		if (handler) {
			let result: string;
			try {
				result = handler(node.attrs, innerContent, node.tag);
			} catch (error) {
				ctx.onError?.(error, node.tag);
				result = "";
			}
			out += expandHandlerOutput(result, ctx, depth);
			continue;
		}

		switch (ctx.unknownTag) {
			case "strip":
				out += innerContent;
				break;
			case "remove":
				break;
			default:
				out += node.selfClosing
					? node.raw
					: `${node.raw}${innerContent}${node.closeRaw ?? ""}`;
		}
	}
	return out;
}

/**
 * Parses and renders `[tag attr="value"]content[/tag]`-style shortcodes in
 * a plain string, given a map of tag → handler. Pure function — does not
 * touch the DOM, so it's the right building block for rendering Blogger
 * post content, RSS/feed text, or any string before it's inserted onto a
 * page.
 *
 * Supports self-closing tags (`[img src="a.jpg"/]`), nested tags
 * (`[quote][b]bold[/b] quote[/quote]`), quoted/unquoted/boolean attributes
 * (`[video src=a.mp4 muted]`), and `[[tag]]` escaping to emit a literal
 * bracketed tag without processing it.
 *
 * @param text - Source text containing zero or more shortcodes.
 * @returns The text with every recognized shortcode replaced by its
 * handler's output.
 *
 * @example
 * ```ts
 * import { renderShortcodes } from "blogr-plugins";
 *
 * const html = renderShortcodes(
 *   "Check out [youtube id=\"dQw4w9WgXcQ\" width=560/] and [b]this[/b].",
 *   {
 *     tags: {
 *       youtube: (attrs) =>
 *         `<iframe width="${attrs.width ?? 560}" height="315" src="https://www.youtube.com/embed/${attrs.id}"></iframe>`,
 *       b: (_attrs, content) => `<strong>${content}</strong>`,
 *     },
 *   },
 * );
 * ```
 */
export function renderShortcodes(
	text: string,
	options: ShortcodifyOptions,
): string {
	const opts = { ...defaults, ...options };
	const ctx: RenderContext = {
		tags: opts.tags,
		unknownTag: opts.unknownTag,
		onError: opts.onError,
		openTag: opts.openTag,
		closeTag: opts.closeTag,
		recursive: opts.recursive,
		maxDepth: opts.maxDepth,
	};
	const tree = parse(text, opts.openTag, opts.closeTag);
	return renderTree(tree, ctx, 0);
}

/**
 * A small, reusable builder for a tag → handler map, so a shared set of
 * shortcodes (e.g. your site's `[gallery]`, `[youtube]`, `[button]`) can be
 * assembled once and passed to both {@link renderShortcodes} and
 * {@link shortcodify} calls across a codebase.
 *
 * @example
 * ```ts
 * import { createShortcodeRegistry, shortcodify } from "blogr-plugins";
 *
 * const registry = createShortcodeRegistry()
 *   .register("b", (_attrs, content) => `<strong>${content}</strong>`)
 *   .register("color", (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`);
 *
 * shortcodify("#post-body", { tags: registry.tags });
 * ```
 */
export function createShortcodeRegistry(
	initial: Record<string, ShortcodeHandler> = {},
) {
	const tags: Record<string, ShortcodeHandler> = { ...initial };

	const registry = {
		/** Live map of every tag registered so far — pass straight into `tags`. */
		tags,
		/** Registers (or overwrites) a single tag's handler. Chainable. */
		register(tag: string, handler: ShortcodeHandler) {
			tags[tag] = handler;
			return registry;
		},
		/** Removes a tag so it falls back to the `unknownTag` policy. Chainable. */
		unregister(tag: string) {
			delete tags[tag];
			return registry;
		},
		/** Whether a tag currently has a handler. */
		has(tag: string): boolean {
			return tag in tags;
		},
	};

	return registry;
}

/**
 * A handful of ready-made handlers (`b`, `i`, `u`, `url`, `color`) you can
 * spread into your own tag map instead of writing the common ones by hand.
 *
 * @example
 * ```ts
 * import { defaultShortcodeTags, renderShortcodes } from "blogr-plugins";
 *
 * renderShortcodes("[b]Bold[/b] and [url href=\"/x\"]a link[/url]", {
 *   tags: { ...defaultShortcodeTags, ...myOwnTags },
 * });
 * ```
 */
export const defaultShortcodeTags: Record<string, ShortcodeHandler> = {
	b: (_attrs, content) => `<strong>${content}</strong>`,
	i: (_attrs, content) => `<em>${content}</em>`,
	u: (_attrs, content) =>
		`<span style="text-decoration:underline">${content}</span>`,
	color: (attrs, content) =>
		`<span style="color:${attrs.name ?? attrs.value ?? "inherit"}">${content}</span>`,
	url: (attrs, content) =>
		`<a href="${attrs.href ?? "#"}"${attrs.target ? ` target="${attrs.target}"` : ""}>${content}</a>`,
};

/**
 * DOM-facing version of {@link renderShortcodes}: scans the text nodes
 * inside the given element(s) for shortcodes and replaces each match with
 * its handler's output, in place. A shortcode must live entirely inside one
 * text node to be recognized — for content spanning multiple elements (or
 * before it's inserted into the page at all), call
 * {@link renderShortcodes} on the raw string instead.
 *
 * @param input - Selector, element(s), or jQuery collection to scan.
 * @param options Configuration object.
 * See {@link ShortcodifyOptions}.
 * @returns A {@link PluginInstance} with `destroy()` to revert every replacement.
 *
 * @example
 * ```html
 * <p id="post">Say [b]hello[/b] to [color name="crimson"]Blogr[/color]!</p>
 * ```
 * ```ts
 * import { shortcodify } from "blogr-plugins";
 *
 * shortcodify("#post", {
 *   tags: {
 *     b: (_attrs, content) => `<strong>${content}</strong>`,
 *     color: (attrs, content) => `<span style="color:${attrs.name}">${content}</span>`,
 *   },
 *   allowHtml: true,
 * });
 * ```
 */
export function shortcodify(
	input: ElementInput,
	options: ShortcodifyDomOptions,
): PluginInstance {
	const opts = { allowHtml: false, ...options };
	const elements = resolveElements(input);
	const undoFns: Array<() => void> = [];

	for (const el of elements) {
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		const textNodes: Text[] = [];
		let node: Node | null;
		// biome-ignore lint/suspicious/noAssignInExpressions: No condition assign
		while ((node = walker.nextNode())) textNodes.push(node as Text);

		for (const textNode of textNodes) {
			const original = textNode.nodeValue ?? "";
			const updated = renderShortcodes(original, opts);
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
				const referenceNode = textNode.nextSibling;
				for (const n of replacementNodes) parent.insertBefore(n, textNode);
				parent.removeChild(textNode);
				undoFns.push(() => {
					const restored = document.createTextNode(original);
					parent.insertBefore(restored, referenceNode);
					for (const n of replacementNodes) parent.removeChild(n);
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
