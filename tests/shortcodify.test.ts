import { describe, expect, it } from "vitest";
import {
	createShortcodeRegistry,
	renderShortcodes,
	shortcodify,
} from "../src/plugins/shortcodify.js";

describe("renderShortcodes", () => {
	it("renders a simple tag with content", () => {
		const out = renderShortcodes("say [b]hello[/b]", {
			tags: { b: (_attrs, content) => `<strong>${content}</strong>` },
		});
		expect(out).toBe("say <strong>hello</strong>");
	});

	it("parses quoted, unquoted, and boolean attributes", () => {
		const seen: unknown[] = [];
		renderShortcodes('[x a="one" b=2 c]content[/x]', {
			tags: {
				x: (attrs, content) => {
					seen.push(attrs);
					return content;
				},
			},
		});
		expect(seen[0]).toEqual({ a: "one", b: 2, c: true });
	});

	it("supports self-closing tags", () => {
		const out = renderShortcodes('[img src="a.jpg"/]', {
			tags: { img: (attrs) => `<img src="${attrs.src}">` },
		});
		expect(out).toBe('<img src="a.jpg">');
	});

	it("supports nesting of different tags", () => {
		const out = renderShortcodes("[quote][b]bold[/b] words[/quote]", {
			tags: {
				quote: (_attrs, content) => `<blockquote>${content}</blockquote>`,
				b: (_attrs, content) => `<strong>${content}</strong>`,
			},
		});
		expect(out).toBe("<blockquote><strong>bold</strong> words</blockquote>");
	});

	it("escapes doubled brackets as a literal tag", () => {
		const out = renderShortcodes("[[b]]not bold[[/b]]", {
			tags: { b: (_attrs, content) => `<strong>${content}</strong>` },
		});
		expect(out).toBe("[b]not bold[/b]");
	});

	it("applies the unknownTag policy for unregistered tags", () => {
		expect(
			renderShortcodes("[mystery]x[/mystery]", { tags: {}, unknownTag: "keep" }),
		).toBe("[mystery]x[/mystery]");
		expect(
			renderShortcodes("[mystery]x[/mystery]", { tags: {}, unknownTag: "strip" }),
		).toBe("x");
		expect(
			renderShortcodes("[mystery]x[/mystery]", { tags: {}, unknownTag: "remove" }),
		).toBe("");
	});

	it("catches handler errors via onError instead of throwing", () => {
		let caught: unknown;
		const out = renderShortcodes("[boom/]", {
			tags: {
				boom: () => {
					throw new Error("nope");
				},
			},
			onError: (err) => {
				caught = err;
			},
		});
		expect(out).toBe("");
		expect((caught as Error).message).toBe("nope");
	});

	it("recursively expands a handler's own shortcode output", () => {
		const out = renderShortcodes("[quote]hi[/quote]", {
			tags: {
				quote: (_attrs, content) => `[i]${content}[/i]`,
				i: (_attrs, content) => `<em>${content}</em>`,
			},
		});
		expect(out).toBe("<em>hi</em>");
	});
});

describe("createShortcodeRegistry", () => {
	it("registers/unregisters tags and reports has()", () => {
		const registry = createShortcodeRegistry().register(
			"b",
			(_attrs, content) => `<strong>${content}</strong>`,
		);
		expect(registry.has("b")).toBe(true);
		expect(renderShortcodes("[b]hi[/b]", { tags: registry.tags })).toBe(
			"<strong>hi</strong>",
		);
		registry.unregister("b");
		expect(registry.has("b")).toBe(false);
	});
});

describe("shortcodify (DOM)", () => {
	it("replaces shortcodes found in a text node", () => {
		document.body.innerHTML = '<p id="p">Say [b]hello[/b] there.</p>';
		shortcodify("#p", {
			tags: { b: (_attrs, content) => `**${content}**` },
		});
		expect(document.getElementById("p")!.textContent).toBe(
			"Say **hello** there.",
		);
	});

	it("parses rendered HTML output when allowHtml is set", () => {
		document.body.innerHTML = '<p id="p">Say [b]hello[/b] there.</p>';
		shortcodify("#p", {
			tags: { b: (_attrs, content) => `<strong>${content}</strong>` },
			allowHtml: true,
		});
		expect(document.getElementById("p")!.innerHTML).toBe(
			"Say <strong>hello</strong> there.",
		);
	});

	it("destroy reverts the original text", () => {
		document.body.innerHTML = '<p id="p">Say [b]hello[/b] there.</p>';
		const instance = shortcodify("#p", {
			tags: { b: (_attrs, content) => `**${content}**` },
		});
		instance.destroy();
		expect(document.getElementById("p")!.textContent).toBe(
			"Say [b]hello[/b] there.",
		);
	});
});
