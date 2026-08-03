import { describe, expect, it } from "vitest";

import { tocify } from "../src/plugins/tocify";

function makeArticle(): void {
	document.body.innerHTML = `
		<div id="article">
			<h2>Intro</h2>
			<h2>Getting Started</h2>
			<h3>Installation</h3>
			<h3>Usage</h3>
			<h2>FAQ</h2>
		</div>
		<div id="toc"></div>
	`;
}

describe("toc", () => {
	it("builds a nested list matching heading hierarchy", () => {
		makeArticle();
		tocify("#toc", { content: "#article", headings: "h2,h3" });

		const tocElem = document.getElementById("toc")!;
		const topLevelLinks = tocElem.querySelectorAll(":scope > ul > li > a");
		expect(topLevelLinks).toHaveLength(3); // Intro, Getting Started, FAQ

		const nested = tocElem.querySelectorAll(
			":scope > ul > li:nth-child(2) ul > li > a",
		);
		expect(nested).toHaveLength(2); // Installation, Usage
	});

	it("assigns ids to headings that lack one", () => {
		makeArticle();
		tocify("#toc", { content: "#article", headings: "h2,h3" });
		const heading = document.querySelector("#article h2")!;
		expect(heading.id).toBe("Intro");
	});

	it("destroy removes the generated list", () => {
		makeArticle();
		const instance = tocify("#toc", { content: "#article", headings: "h2,h3" });
		instance.destroy();
		expect(document.getElementById("toc")!.children).toHaveLength(0);
	});
});
